package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.group.ParticipantGroupMemberResponse;
import br.org.casadojulgamento.api.dto.group.SessionGroupAvailabilityResponse;
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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantGroupService {

    private final EventSessionRepository eventSessionRepository;

    private final ParticipantRepository participantRepository;

    private final ParticipantGroupRepository groupRepository;

    private final ParticipantGroupMemberRepository memberRepository;

    /*
     * =========================================================
     * GRUPO DA SESSÃO
     * =========================================================
     */

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

    /*
     * =========================================================
     * OCUPAÇÃO E VAGAS
     * =========================================================
     */

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

    @Transactional
    public List<SessionGroupAvailabilityResponse>
    buscarDisponibilidadeDasSessoes(
            Long eventId
    ) {
        List<EventSession> sessions =
                eventSessionRepository
                        .findAllByEventIdAndActiveTrueOrderByDateAscStartTimeAsc(
                                eventId
                        );

        return sessions.stream()
                .map(session -> {

                    long occupancy =
                            participantRepository
                                    .countByEventSessionIdAndActiveTrue(
                                            session.getId()
                                    );

                    long available =
                            Math.max(
                                    session.getCapacity()
                                            - occupancy,
                                    0
                            );

                    ParticipantGroup group =
                            garantirGrupoDaSessao(
                                    session.getId()
                            );

                    ParticipantGroupStatus groupStatus =
                            group.getStatus();

                    return new SessionGroupAvailabilityResponse(
                            session.getId(),
                            session.getDate(),
                            session.getStartTime(),
                            session.getCapacity(),
                            occupancy,
                            available,
                            session.getStatus(),
                            groupStatus
                    );
                })
                .toList();
    }

    /*
     * =========================================================
     * ALOCAÇÃO / MOVIMENTAÇÃO
     * =========================================================
     *
     * O mesmo método atende:
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

        /*
         * Bloqueamos todas as sessões envolvidas na movimentação
         * em ordem determinística.
         *
         * Se houver sessão de origem, bloqueamos origem + destino.
         * Se ainda não houver origem, bloqueamos apenas o destino.
         */
        EventSession destinationSession =
                bloquearSessoesDaMovimentacao(
                        participant,
                        destinationSessionId
                );

        validarMesmoEvento(
                participant,
                destinationSession
        );

        /*
         * Se já estiver nesta sessão, apenas garantimos
         * que existe o vínculo operacional com o grupo.
         */
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

        /*
         * Antes de alterar qualquer vínculo,
         * verificamos se existe vaga real.
         */
        ParticipantGroup destinationGroup =
                garantirGrupoDaSessao(
                        destinationSessionId
                );

        validarGrupoDisponivelParaEntrada(
                destinationGroup
        );

        validarVaga(
                destinationSession,
                destinationGroup
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

            /*
             * Depois que um grupo foi liberado,
             * seus integrantes não podem mais ser movidos.
             */
            validarGrupoDisponivelParaSaida(
                    sourceGroup
            );

            currentMembership.setActive(false);

            currentMembership.setRemovedAt(
                    LocalDateTime.now()
            );

            /*
             * O flush é necessário antes da criação
             * do novo vínculo devido ao índice único
             * de participante ativo em grupo.
             */
            memberRepository.saveAndFlush(
                    currentMembership
            );
        }

        /*
         * Altera somente a sessão operacional.
         *
         * originalEventSession representa a origem
         * confiável da reserva/compra e permanece
         * inalterada.
         */
        participant.setEventSession(
                destinationSession
        );

        participantRepository.save(
                participant
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

    /*
     * =========================================================
     * LIBERAÇÃO DO GRUPO
     * =========================================================
     */

    @Transactional
    public void liberarGrupo(
            Long eventSessionId
    ) {
        /*
         * Usa o mesmo lock pessimista utilizado na alocação.
         *
         * Dessa forma, adicionar/mover participantes e liberar
         * o grupo da mesma sessão não podem ocorrer
         * simultaneamente.
         */
        EventSession session =
                eventSessionRepository
                        .findByIdForUpdate(
                                eventSessionId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Sessão não encontrada."
                                        )
                        );

        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        ParticipantGroup group =
                groupRepository
                        .findByEventSessionIdAndActiveTrue(
                                eventSessionId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Grupo da sessão não encontrado."
                                        )
                        );

        if (
                group.getStatus()
                        == ParticipantGroupStatus.RELEASED
        ) {
            throw new BusinessException(
                    "O grupo já foi liberado."
            );
        }

        if (
                group.getStatus()
                        == ParticipantGroupStatus.CANCELLED
        ) {
            throw new BusinessException(
                    "Um grupo cancelado não pode ser liberado."
            );
        }

        long ocupacao =
                memberRepository
                        .countByGroupIdAndActiveTrue(
                                group.getId()
                        );

        /*
         * Permitimos liberar com menos da capacidade máxima,
         * mas nunca um grupo vazio.
         */
        if (ocupacao <= 0) {
            throw new BusinessException(
                    "Não é possível liberar um grupo vazio."
            );
        }

        group.setStatus(
                ParticipantGroupStatus.RELEASED
        );

        group.setReleasedAt(
                LocalDateTime.now()
        );

        groupRepository.saveAndFlush(
                group
        );
    }

    /*
     * =========================================================
     * VÍNCULO COM GRUPO
     * =========================================================
     */

    private void garantirVinculoComGrupo(
            Participant participant,
            EventSession session
    ) {
        ParticipantGroupMember membershipAtual =
                memberRepository
                        .findByParticipantIdAndActiveTrue(
                                participant.getId()
                        )
                        .orElse(null);

        if (membershipAtual != null) {
            atualizarStatusDoGrupo(
                    membershipAtual.getGroup()
            );

            return;
        }

        ParticipantGroup group =
                garantirGrupoDaSessao(
                        session.getId()
                );

        validarGrupoDisponivelParaEntrada(
                group
        );

        /*
         * Mesmo quando o participante já aponta para a sessão,
         * um vínculo ausente não pode ultrapassar a capacidade
         * operacional do grupo.
         */
        validarVaga(
                session,
                group
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

        memberRepository.save(
                member
        );

        atualizarStatusDoGrupo(
                group
        );
    }

    /*
     * =========================================================
     * VALIDAÇÕES DE GRUPO
     * =========================================================
     */

    private void validarGrupoDisponivelParaEntrada(
            ParticipantGroup group
    ) {
        if (
                group.getStatus()
                        == ParticipantGroupStatus.RELEASED
        ) {
            throw new BusinessException(
                    "Este grupo já foi liberado e não aceita novos participantes."
            );
        }

        if (
                group.getStatus()
                        == ParticipantGroupStatus.CANCELLED
        ) {
            throw new BusinessException(
                    "Este grupo está cancelado."
            );
        }

        if (
                !Boolean.TRUE.equals(
                        group.getActive()
                )
        ) {
            throw new BusinessException(
                    "Este grupo está inativo."
            );
        }
    }

    private void validarGrupoDisponivelParaSaida(
            ParticipantGroup group
    ) {
        if (
                group.getStatus()
                        == ParticipantGroupStatus.RELEASED
        ) {
            throw new BusinessException(
                    "Não é possível mover participantes de um grupo já liberado."
            );
        }

        if (
                group.getStatus()
                        == ParticipantGroupStatus.CANCELLED
        ) {
            throw new BusinessException(
                    "Não é possível mover participantes de um grupo cancelado."
            );
        }
    }

    /*
     * =========================================================
     * CAPACIDADE
     * =========================================================
     */

    private void validarVaga(
            EventSession destinationSession,
            ParticipantGroup destinationGroup
    ) {
        long ocupacao =
                memberRepository
                        .countByGroupIdAndActiveTrue(
                                destinationGroup.getId()
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

    /*
     * =========================================================
     * LOCKS DE MOVIMENTAÇÃO
     * =========================================================
     */

    private EventSession bloquearSessoesDaMovimentacao(
            Participant participant,
            Long destinationSessionId
    ) {
        List<Long> sessionIds =
                new ArrayList<>();

        if (
                participant.getEventSession() != null
                        && participant
                        .getEventSession()
                        .getId() != null
        ) {
            sessionIds.add(
                    participant
                            .getEventSession()
                            .getId()
            );
        }

        if (!sessionIds.contains(destinationSessionId)) {
            sessionIds.add(
                    destinationSessionId
            );
        }

        /*
         * Fundamental para evitar deadlock.
         *
         * Todas as movimentações adquirem os locks
         * exatamente na mesma ordem.
         */
        sessionIds.sort(
                Long::compareTo
        );

        List<EventSession> lockedSessions =
                eventSessionRepository
                        .findAllByIdInForUpdate(
                                sessionIds
                        );

        EventSession destinationSession =
                lockedSessions
                        .stream()
                        .filter(session ->
                                session
                                        .getId()
                                        .equals(
                                                destinationSessionId
                                        )
                        )
                        .findFirst()
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Sessão não encontrada."
                                        )
                        );

        if (
                !Boolean.TRUE.equals(
                        destinationSession.getActive()
                )
        ) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        return destinationSession;
    }

    /*
     * =========================================================
     * STATUS DO GRUPO
     * =========================================================
     */

    private void atualizarStatusDoGrupo(
            ParticipantGroup group
    ) {
        /*
         * RELEASED e CANCELLED são estados finais.
         */
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
                memberRepository
                        .countByGroupIdAndActiveTrue(
                                group.getId()
                        );

        ParticipantGroupStatus novoStatus =
                ocupacao >= session.getCapacity()
                        ? ParticipantGroupStatus.READY
                        : ParticipantGroupStatus.FORMING;

        if (
                group.getStatus()
                        != novoStatus
        ) {
            group.setStatus(
                    novoStatus
            );

            groupRepository.save(
                    group
            );
        }
    }

    /*
     * =========================================================
     * VALIDAÇÕES DE PARTICIPANTE
     * =========================================================
     */

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

    /*
     * =========================================================
     * BUSCAS
     * =========================================================
     */

    private EventSession buscarSessao(
            Long eventSessionId
    ) {
        EventSession session =
                eventSessionRepository
                        .findById(
                                eventSessionId
                        )
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
                .findById(
                        participantId
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Participante não encontrado."
                                )
                );
    }

    @Transactional(readOnly = true)
    public List<ParticipantGroupMemberResponse>
    buscarMembrosDaSessao(
            Long eventSessionId
    ) {
        ParticipantGroup group =
                groupRepository
                        .findByEventSessionIdAndActiveTrue(
                                eventSessionId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Grupo da sessão não encontrado."
                                        )
                        );

        return memberRepository
                .findAllByGroupIdAndActiveTrueOrderByJoinedAtAsc(
                        group.getId()
                )
                .stream()
                .map(member -> {

                    Participant participant =
                            member.getParticipant();

                    return new ParticipantGroupMemberResponse(
                            participant.getId(),
                            participant.getFullName(),
                            participant.getPhone(),
                            participant.getEmail(),
                            participant.getArrivalStatus(),
                            member.getJoinedAt()
                    );
                })
                .toList();
    }
}