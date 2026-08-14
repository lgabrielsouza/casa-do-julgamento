package br.org.casadojulgamento.service;

import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.entity.ParticipantGroup;
import br.org.casadojulgamento.domain.entity.ParticipantGroupMember;
import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantGroupStatus;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventSessionRepository;
import br.org.casadojulgamento.repository.ParticipantGroupMemberRepository;
import br.org.casadojulgamento.repository.ParticipantGroupRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ParticipantGroupService {

    private final EventSessionRepository eventSessionRepository;
    private final ParticipantRepository participantRepository;
    private final ParticipantGroupRepository groupRepository;
    private final ParticipantGroupMemberRepository memberRepository;

    @Transactional
    public ParticipantGroup garantirGrupoDaSessao(
            Long eventSessionId
    ) {
        EventSession session =
                buscarSessao(eventSessionId);

        return groupRepository
                .findByEventSessionId(eventSessionId)
                .orElseGet(() ->
                        groupRepository.save(
                                ParticipantGroup.builder()
                                        .eventSession(session)
                                        .status(
                                                ParticipantGroupStatus.FORMING
                                        )
                                        .active(true)
                                        .build()
                        )
                );
    }

    @Transactional(readOnly = true)
    public long buscarOcupacao(
            Long eventSessionId
    ) {
        buscarSessao(eventSessionId);

        return participantRepository
                .countByEventSessionIdAndActiveTrue(
                        eventSessionId
                );
    }

    @Transactional(readOnly = true)
    public long buscarVagasDisponiveis(
            Long eventSessionId
    ) {
        EventSession session =
                buscarSessao(eventSessionId);

        long ocupacao =
                participantRepository
                        .countByEventSessionIdAndActiveTrue(
                                eventSessionId
                        );

        return Math.max(
                session.getCapacity() - ocupacao,
                0
        );
    }

    /*
     * Serve para os dois cenários:
     *
     * 1. Participante sem sessão:
     *    recebe sua primeira sessão operacional.
     *
     * 2. Participante já alocado:
     *    é movido para outra sessão/grupo.
     *
     * originalEventSession nunca é alterada aqui.
     */
    @Transactional
    public void alocarParticipanteNaSessao(
            Long participantId,
            Long destinationSessionId
    ) {
        Participant participant =
                buscarParticipante(participantId);

        validarParticipanteParaAlocacao(
                participant
        );

        EventSession destinationSession =
                buscarSessao(destinationSessionId);

        validarMesmoEvento(
                participant,
                destinationSession
        );

        if (
                participant.getEventSession() != null
                        && participant
                        .getEventSession()
                        .getId()
                        .equals(destinationSessionId)
        ) {
            garantirVinculoComGrupo(
                    participant,
                    destinationSession
            );

            return;
        }

        validarVaga(
                destinationSession
        );

        ParticipantGroupMember currentMembership =
                memberRepository
                        .findByParticipantIdAndActiveTrue(
                                participantId
                        )
                        .orElse(null);

        ParticipantGroup sourceGroup = null;

        if (currentMembership != null) {
            sourceGroup =
                    currentMembership.getGroup();

            currentMembership.setActive(false);
            currentMembership.setRemovedAt(
                    LocalDateTime.now()
            );

            memberRepository.save(
                    currentMembership
            );
        }

        /*
         * Altera somente a sessão operacional atual.
         *
         * originalEventSession representa a origem
         * confiável da reserva/compra e não é modificada.
         */
        participant.setEventSession(
                destinationSession
        );

        participantRepository.save(
                participant
        );

        ParticipantGroup destinationGroup =
                garantirGrupoDaSessao(
                        destinationSessionId
                );

        ParticipantGroupMember newMembership =
                ParticipantGroupMember.builder()
                        .group(destinationGroup)
                        .participant(participant)
                        .joinedAt(
                                LocalDateTime.now()
                        )
                        .active(true)
                        .build();

        memberRepository.save(
                newMembership
        );

        if (sourceGroup != null) {
            atualizarStatusDoGrupo(
                    sourceGroup
            );
        }

        atualizarStatusDoGrupo(
                destinationGroup
        );
    }

    private void garantirVinculoComGrupo(
            Participant participant,
            EventSession session
    ) {
        if (
                memberRepository
                        .existsByParticipantIdAndActiveTrue(
                                participant.getId()
                        )
        ) {
            return;
        }

        ParticipantGroup group =
                garantirGrupoDaSessao(
                        session.getId()
                );

        ParticipantGroupMember member =
                ParticipantGroupMember.builder()
                        .group(group)
                        .participant(participant)
                        .joinedAt(
                                LocalDateTime.now()
                        )
                        .active(true)
                        .build();

        memberRepository.save(member);

        atualizarStatusDoGrupo(group);
    }

    private void validarVaga(
            EventSession destinationSession
    ) {
        long ocupacao =
                participantRepository
                        .countByEventSessionIdAndActiveTrue(
                                destinationSession.getId()
                        );

        if (
                ocupacao
                        >= destinationSession.getCapacity()
        ) {
            throw new BusinessException(
                    "A sessão de destino está lotada."
            );
        }
    }

    private void atualizarStatusDoGrupo(
            ParticipantGroup group
    ) {
        if (
                group.getStatus()
                        == ParticipantGroupStatus.RELEASED
                        || group.getStatus()
                        == ParticipantGroupStatus.CANCELLED
        ) {
            return;
        }

        EventSession session =
                group.getEventSession();

        long ocupacao =
                participantRepository
                        .countByEventSessionIdAndActiveTrue(
                                session.getId()
                        );

        ParticipantGroupStatus novoStatus =
                ocupacao >= session.getCapacity()
                        ? ParticipantGroupStatus.READY
                        : ParticipantGroupStatus.FORMING;

        if (
                group.getStatus()
                        != novoStatus
        ) {
            group.setStatus(novoStatus);

            groupRepository.save(group);
        }
    }

    private void validarParticipanteParaAlocacao(
            Participant participant
    ) {
        if (
                !Boolean.TRUE.equals(
                        participant.getActive()
                )
        ) {
            throw new BusinessException(
                    "O participante está inativo."
            );
        }

        if (
                participant.getStatus()
                        == ParticipantStatus.CANCELLED
        ) {
            throw new BusinessException(
                    "Participante cancelado não pode integrar um grupo."
            );
        }

        if (
                participant.getArrivalStatus()
                        != ParticipantArrivalStatus.READY_FOR_GROUP
        ) {
            throw new BusinessException(
                    "O participante ainda não está pronto para formação de grupo."
            );
        }
    }

    private void validarMesmoEvento(
            Participant participant,
            EventSession destinationSession
    ) {
        if (
                participant.getEvent() == null
                        || destinationSession.getEvent() == null
                        || !participant
                        .getEvent()
                        .getId()
                        .equals(
                                destinationSession
                                        .getEvent()
                                        .getId()
                        )
        ) {
            throw new BusinessException(
                    "A sessão de destino pertence a outro evento."
            );
        }
    }

    private EventSession buscarSessao(
            Long eventSessionId
    ) {
        EventSession session =
                eventSessionRepository
                        .findById(eventSessionId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Sessão não encontrada."
                                        )
                        );

        if (
                !Boolean.TRUE.equals(
                        session.getActive()
                )
        ) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        return session;
    }

    private Participant buscarParticipante(
            Long participantId
    ) {
        return participantRepository
                .findById(participantId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Participante não encontrado."
                                )
                );
    }
}