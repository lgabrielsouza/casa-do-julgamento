package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.participant.ParticipantResponse;
import br.org.casadojulgamento.api.dto.reception.ChangeReceptionSessionRequest;
import br.org.casadojulgamento.api.dto.reception.ReceptionParticipantActionRequest;
import br.org.casadojulgamento.api.dto.reception.ReceptionParticipantFilterRequest;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.domain.specification.ReceptionParticipantSpecification;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventSessionRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReceptionService {

    private final ParticipantRepository participantRepository;
    private final EventSessionRepository eventSessionRepository;

    @Transactional(readOnly = true)
    public Page<ParticipantResponse> listar(
            ReceptionParticipantFilterRequest filter,
            Pageable pageable
    ) {
        return participantRepository
                .findAll(
                        ReceptionParticipantSpecification.withFilters(
                                filter
                        ),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional
    public ParticipantResponse registrarChegada(
            Long participantId,
            ReceptionParticipantActionRequest request
    ) {
        Participant participant =
                buscarParticipanteOperacional(participantId);

        validarVersao(participant, request.version());

        if (
                participant.getArrivalStatus()
                        != ParticipantArrivalStatus.NOT_ARRIVED
        ) {
            throw new BusinessException(
                    "A chegada deste participante já foi registrada."
            );
        }

        participant.setArrivalStatus(
                ParticipantArrivalStatus.ARRIVED
        );

        participant.setArrivedAt(
                LocalDateTime.now()
        );

        return salvar(participant);
    }

    @Transactional
    public ParticipantResponse marcarProntoParaGrupo(
            Long participantId,
            ReceptionParticipantActionRequest request
    ) {
        Participant participant =
                buscarParticipanteOperacional(participantId);

        validarVersao(participant, request.version());

        if (
                participant.getArrivalStatus()
                        != ParticipantArrivalStatus.ARRIVED
        ) {
            throw new BusinessException(
                    "O participante precisa ter a chegada registrada antes de ficar pronto para grupo."
            );
        }

        participant.setArrivalStatus(
                ParticipantArrivalStatus.READY_FOR_GROUP
        );

        return salvar(participant);
    }

    @Transactional
    public ParticipantResponse desfazerChegada(
            Long participantId,
            ReceptionParticipantActionRequest request
    ) {
        Participant participant =
                buscarParticipanteOperacional(participantId);

        validarVersao(participant, request.version());

        if (
                participant.getArrivalStatus()
                        == ParticipantArrivalStatus.NOT_ARRIVED
        ) {
            throw new BusinessException(
                    "Este participante ainda não possui chegada registrada."
            );
        }

        participant.setArrivalStatus(
                ParticipantArrivalStatus.NOT_ARRIVED
        );

        participant.setArrivedAt(null);

        return salvar(participant);
    }

    @Transactional
    public ParticipantResponse alterarSessao(
            Long participantId,
            ChangeReceptionSessionRequest request
    ) {
        Participant participant =
                buscarParticipanteOperacional(participantId);

        validarVersao(participant, request.version());

        EventSession session = buscarSessaoOpcional(
                request.eventSessionId(),
                participant
        );

        participant.setEventSession(session);

        return salvar(participant);
    }

    private Participant buscarParticipanteOperacional(
            Long participantId
    ) {
        Participant participant =
                participantRepository.findById(participantId)
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

        if (
                participant.getStatus()
                        == ParticipantStatus.CANCELLED
        ) {
            throw new BusinessException(
                    "Participante cancelado não pode ser atendido pela Recepção."
            );
        }

        return participant;
    }

    private EventSession buscarSessaoOpcional(
            Long eventSessionId,
            Participant participant
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
                        .equals(
                                participant.getEvent().getId()
                        )
        ) {
            throw new BusinessException(
                    "A sessão informada não pertence ao evento do participante."
            );
        }

        long ocupacao =
                participantRepository
                        .countByEventSessionIdAndActiveTrueAndIdNot(
                                session.getId(),
                                participant.getId()
                        );

        if (ocupacao >= session.getCapacity()) {
            throw new BusinessException(
                    "A sessão selecionada atingiu sua capacidade máxima."
            );
        }

        return session;
    }

    private void validarVersao(
            Participant participant,
            Long version
    ) {
        if (!participant.getVersion().equals(version)) {
            throw new BusinessException(
                    "O participante foi alterado por outro usuário. Atualize a tela e tente novamente."
            );
        }
    }

    private ParticipantResponse salvar(
            Participant participant
    ) {
        try {
            Participant participantSalvo =
                    participantRepository.saveAndFlush(
                            participant
                    );

            return toResponse(participantSalvo);

        } catch (
                ObjectOptimisticLockingFailureException exception
        ) {
            throw new BusinessException(
                    "O participante foi alterado por outro usuário. Atualize a tela e tente novamente."
            );
        }
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