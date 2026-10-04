package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.participant.CreateParticipantRequest;
import br.org.casadojulgamento.api.dto.participant.ParticipantFilterRequest;
import br.org.casadojulgamento.api.dto.participant.ParticipantResponse;
import br.org.casadojulgamento.api.dto.participant.UpdateParticipantRequest;
import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.domain.specification.ParticipantSpecification;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.EventSessionRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final EventSessionRepository eventSessionRepository;

    @Transactional
    public ParticipantResponse criar(
            CreateParticipantRequest request
    ) {
        Event event = buscarEventoAtivo(request.eventId());

        EventSession session = buscarSessaoOpcional(
                request.eventSessionId(),
                event
        );

        Participant participant = Participant.builder()
                .event(event)
                .eventSession(session)
                .fullName(normalizarTextoObrigatorio(
                        request.fullName()
                ))
                .email(normalizarEmail(request.email()))
                .phone(normalizarTelefone(request.phone()))
                .source(
                        request.source() != null
                                ? request.source()
                                : ParticipantSource.MANUAL
                )
                .status(
                        request.status() != null
                                ? request.status()
                                : ParticipantStatus.REGISTERED
                )
                .notes(normalizarTextoOpcional(
                        request.notes()
                ))
                .active(true)
                .build();

        Participant participantSalvo =
                participantRepository.save(participant);

        return toResponse(participantSalvo);
    }

    @Transactional(readOnly = true)
    public Page<ParticipantResponse> listar(
            ParticipantFilterRequest filter,
            Pageable pageable
    ) {
        ParticipantFilterRequest filtroEfetivo = filter;

        if (filter == null || filter.active() == null) {
            filtroEfetivo = new ParticipantFilterRequest(
                    filter != null ? filter.eventId() : null,
                    filter != null ? filter.eventSessionId() : null,
                    filter != null ? filter.name() : null,
                    filter != null ? filter.phone() : null,
                    filter != null ? filter.source() : null,
                    filter != null ? filter.status() : null,
                    true
            );
        }

        return participantRepository
                .findAll(
                        ParticipantSpecification.withFilters(
                                filtroEfetivo
                        ),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ParticipantResponse buscarPorId(Long id) {
        return toResponse(buscarParticipanteAtivo(id));
    }

    @Transactional
    public ParticipantResponse atualizar(
            Long id,
            UpdateParticipantRequest request
    ) {
        Participant participant =
                buscarParticipanteAtivo(id);

        if (!participant.getVersion().equals(request.version())) {
            throw new BusinessException(
                    "O participante foi alterado por outro usuário. "
                            + "Atualize a página e tente novamente."
            );
        }

        Event event = participant.getEvent();

        validarEventoAtivo(event);

        EventSession session = buscarSessaoOpcional(
                request.eventSessionId(),
                event
        );

        participant.setEventSession(session);
        participant.setFullName(
                normalizarTextoObrigatorio(
                        request.fullName()
                )
        );
        participant.setEmail(
                normalizarEmail(request.email())
        );
        participant.setPhone(
                normalizarTelefone(request.phone())
        );
        participant.setStatus(request.status());
        participant.setNotes(
                normalizarTextoOpcional(
                        request.notes()
                )
        );

        try {
            Participant participantAtualizado =
                    participantRepository.saveAndFlush(
                            participant
                    );

            return toResponse(participantAtualizado);

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "O participante foi alterado por outro usuário. "
                            + "Atualize a página e tente novamente."
            );
        }
    }

    @Transactional
    public void desativar(Long id) {
        Participant participant =
                buscarParticipanteAtivo(id);

        participant.setActive(false);

        try {
            participantRepository.saveAndFlush(
                    participant
            );

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "O participante foi alterado por outro usuário. "
                            + "Atualize a página e tente novamente."
            );
        }
    }

    private Event buscarEventoAtivo(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Evento não encontrado."
                        )
                );

        validarEventoAtivo(event);

        return event;
    }

    private void validarEventoAtivo(Event event) {
        if (!Boolean.TRUE.equals(event.getActive())) {
            throw new ResourceNotFoundException(
                    "Evento não encontrado."
            );
        }
    }

    private EventSession buscarSessaoOpcional(
            Long eventSessionId,
            Event event
    ) {
        if (eventSessionId == null) {
            return null;
        }

        EventSession session =
                eventSessionRepository.findById(eventSessionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sessão não encontrada."
                                )
                        );

        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        if (
                !session.getEvent()
                        .getId()
                        .equals(event.getId())
        ) {
            throw new BusinessException(
                    "A sessão informada não pertence ao evento selecionado."
            );
        }

        return session;
    }

    private Participant buscarParticipanteAtivo(Long id) {
        Participant participant =
                participantRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Participante não encontrado."
                                )
                        );

        if (!Boolean.TRUE.equals(participant.getActive())) {
            throw new ResourceNotFoundException(
                    "Participante não encontrado."
            );
        }

        return participant;
    }

    private String normalizarTextoObrigatorio(
            String value
    ) {
        return value.trim();
    }

    private String normalizarTextoOpcional(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizarEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        return email
                .trim()
                .toLowerCase();
    }

    private String normalizarTelefone(String phone) {
        String apenasDigitos =
                phone.replaceAll("\\D", "");

        if (apenasDigitos.isBlank()) {
            throw new BusinessException(
                    "Informe um telefone válido."
            );
        }

        if (apenasDigitos.length() > 20) {
            throw new BusinessException(
                    "O telefone deve conter no máximo 20 dígitos."
            );
        }

        return apenasDigitos;
    }

private ParticipantResponse toResponse(
        Participant participant
) {
    EventSession session =
            participant.getEventSession();

    return new ParticipantResponse(
            participant.getId(),
            participant.getEvent().getId(),
            participant.getEvent().getName(),
            session != null ? session.getId() : null,
            participant.getFullName(),
            participant.getEmail(),
            participant.getPhone(),
            participant.getSource(),
            participant.getStatus(),
            participant.getArrivalStatus(),
            participant.getArrivedAt(),
            participant.getNotes(),
            participant.getActive(),
            participant.getVersion(),
            participant.getCreatedAt(),
            participant.getUpdatedAt()
    );
}

}