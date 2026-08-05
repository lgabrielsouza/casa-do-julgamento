package br.org.casadojulgamento.integration.sympla.service;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.integration.sympla.client.SymplaClient;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaSyncResult;
import br.org.casadojulgamento.integration.sympla.mapper.SymplaParticipantMapper;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.ParticipantIntegrationRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SymplaSyncService {

    private final SymplaClient symplaClient;

    private final EventRepository eventRepository;

    private final ParticipantRepository participantRepository;

    private final ParticipantIntegrationRepository
            integrationRepository;

    private final SymplaParticipantMapper mapper;

    @Transactional
    public SymplaSyncResult sincronizar(
            Long eventId
    ) {
        Event event =
                buscarEventoIntegradoComLock(
                        eventId
                );

        SymplaParticipantsResponse response =
                symplaClient.buscarParticipantes(
                        event.getExternalEventId()
                );

        List<SymplaParticipantResponse> participantes =
                response != null
                        && response.data() != null
                        ? response.data()
                        : List.of();

        int created = 0;
        int updated = 0;
        int ignored = 0;
        int errors = 0;

        for (
                SymplaParticipantResponse dto
                : participantes
        ) {
            if (!participanteValido(dto)) {
                errors++;
                continue;
            }

            Optional<ParticipantIntegration>
                    integrationOptional =
                    integrationRepository
                            .findByProviderAndExternalParticipantId(
                                    IntegrationProvider.SYMPLA,
                                    dto.id().trim()
                            );

            if (integrationOptional.isPresent()) {
                ParticipantIntegration integration =
                        integrationOptional.get();

                if (
                        !integrationPertenceAoEvento(
                                integration,
                                event
                        )
                ) {
                    errors++;
                    continue;
                }

                boolean alterado =
                        mapper.atualizarDados(
                                integration,
                                dto
                        );

                /*
                 * O participante relacionado também está sendo
                 * acompanhado pelo contexto JPA e suas alterações
                 * serão persistidas dentro da mesma transação.
                 */
                integrationRepository.save(
                        integration
                );

                if (alterado) {
                    updated++;
                } else {
                    ignored++;
                }

                continue;
            }

            Participant participant =
                    mapper.toParticipant(
                            dto,
                            event
                    );

            Participant participantSalvo =
                    participantRepository.save(
                            participant
                    );

            ParticipantIntegration integration =
                    mapper.toIntegration(
                            participantSalvo,
                            dto
                    );

            integrationRepository.save(
                    integration
            );

            created++;
        }

        registrarResultadoNoEvento(
                event,
                participantes.size(),
                created,
                updated,
                ignored,
                errors
        );

        return new SymplaSyncResult(
                created,
                updated,
                ignored,
                errors
        );
    }

    private Event buscarEventoIntegradoComLock(
            Long eventId
    ) {
        if (eventId == null) {
            throw new IllegalArgumentException(
                    "O identificador do evento é obrigatório."
            );
        }

        Event event = eventRepository
                .findByIdForIntegrationSync(
                        eventId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Evento não encontrado."
                        )
                );

        if (
                event.getExternalProvider()
                        != IntegrationProvider.SYMPLA
        ) {
            throw new IllegalStateException(
                    "O evento não está vinculado à Sympla."
            );
        }

        if (
                event.getExternalEventId() == null
                        || event.getExternalEventId()
                        .isBlank()
        ) {
            throw new IllegalStateException(
                    "O evento não possui um identificador da Sympla."
            );
        }

        return event;
    }

    private void registrarResultadoNoEvento(
            Event event,
            int totalFound,
            int created,
            int updated,
            int ignored,
            int errors
    ) {
        event.setLastIntegrationSyncAt(
                LocalDateTime.now()
        );

        event.setLastIntegrationTotalFound(
                totalFound
        );

        event.setLastIntegrationCreated(
                created
        );

        event.setLastIntegrationUpdated(
                updated
        );

        event.setLastIntegrationIgnored(
                ignored
        );

        event.setLastIntegrationErrors(
                errors
        );

        eventRepository.save(event);
    }

    private boolean participanteValido(
            SymplaParticipantResponse dto
    ) {
        return dto != null
                && dto.id() != null
                && !dto.id().isBlank();
    }

    private boolean integrationPertenceAoEvento(
            ParticipantIntegration integration,
            Event event
    ) {
        if (
                integration.getParticipant() == null
                        || integration
                        .getParticipant()
                        .getEvent() == null
                        || integration
                        .getParticipant()
                        .getEvent()
                        .getId() == null
        ) {
            return false;
        }

        return integration
                .getParticipant()
                .getEvent()
                .getId()
                .equals(event.getId());
    }
}