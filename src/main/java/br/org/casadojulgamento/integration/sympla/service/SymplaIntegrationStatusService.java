package br.org.casadojulgamento.integration.sympla.service;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.integration.sympla.dto.SymplaIntegrationStatusResponse;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.ParticipantIntegrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SymplaIntegrationStatusService {

    private final EventRepository eventRepository;

    private final ParticipantIntegrationRepository
            participantIntegrationRepository;

    @Transactional(readOnly = true)
    public SymplaIntegrationStatusResponse buscarStatus(
            Long eventId
    ) {
        if (eventId == null) {
            throw new IllegalArgumentException(
                    "O identificador do evento é obrigatório."
            );
        }

        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Evento não encontrado."
                        )
                );

        boolean connected =
                event.getExternalProvider()
                        == IntegrationProvider.SYMPLA
                        && event.getExternalEventId() != null
                        && !event.getExternalEventId()
                        .isBlank();

        long synchronizedParticipants =
                participantIntegrationRepository
                        .countSynchronizedParticipantsByEvent(
                        IntegrationProvider.SYMPLA,
                        event.getId()
                );

        return new SymplaIntegrationStatusResponse(
                event.getId(),
                event.getName(),
                event.getExternalProvider() != null
                        ? event.getExternalProvider().name()
                        : null,
                event.getExternalEventId(),
                synchronizedParticipants,
                connected,
                event.getLastIntegrationSyncAt(),
                event.getLastIntegrationTotalFound() != null
                        ? event.getLastIntegrationTotalFound()
                        : 0,
                event.getLastIntegrationCreated() != null
                        ? event.getLastIntegrationCreated()
                        : 0,
                event.getLastIntegrationUpdated() != null
                        ? event.getLastIntegrationUpdated()
                        : 0,
                event.getLastIntegrationIgnored() != null
                        ? event.getLastIntegrationIgnored()
                        : 0,
                event.getLastIntegrationErrors() != null
                        ? event.getLastIntegrationErrors()
                        : 0
        );
    }
}