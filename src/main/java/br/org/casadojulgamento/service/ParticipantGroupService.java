
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

    @Transactional
    public ParticipantGroup garantirGrupoDaSessao(Long eventSessionId) {
        EventSession session = buscarSessao(eventSessionId);

        return groupRepository.findByEventSessionId(eventSessionId)
                .orElseGet(() -> groupRepository.save(
                        ParticipantGroup.builder()
                                .eventSession(session)
                                .status(ParticipantGroupStatus.FORMING)
                                .active(true)
                                .build()
                ));
    }

    @Transactional(readOnly = true)
    public long buscarOcupacao(Long eventSessionId) {
        buscarSessao(eventSessionId);

        return participantRepository.countByEventSessionIdAndActiveTrue(
                eventSessionId
        );
    }

    @Transactional(readOnly = true)
    public long buscarVagasDisponiveis(Long eventSessionId) {
        EventSession session = buscarSessao(eventSessionId);

        long ocupacao = participantRepository
                .countByEventSessionIdAndActiveTrue(eventSessionId);

        return Math.max(session.getCapacity() - ocupacao, 0);
    }

    @Transactional(readOnly = true)
    public List<SessionGroupAvailabilityResponse>
    buscarDisponibilidadeDasSessoes(Long eventId) {

        List<EventSession> sessions = eventSessionRepository
                .findAllByEventIdAndActiveTrueOrderByDateAscStartTimeAsc(
                        eventId
                );

        return sessions.stream()
                .map(session -> {
                    long occupancy = participantRepository
                            .countByEventSessionIdAndActiveTrue(
                                    session.getId()
                            );

                    long available = Math.max(
                            session.getCapacity() - occupancy,
                            0
                    );

                    ParticipantGroupStatus groupStatus = groupRepository
                            .findByEventSessionIdAndActiveTrue(
                                    session.getId()
                            )
                            .map(ParticipantGroup::getStatus)
                            .orElse(ParticipantGroupStatus.FORMING);

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

    @Transactional
    public void alocarParticipanteNaSessao(
            Long participantId,
            Long destinationSessionId
    ) {
        Participant participant = buscarParticipante(participantId);
        validarParticipanteParaAlocacao(participant);

        EventSession destinationSession = bloquearSessoesDaMovimentacao(
                participant,
                destinationSessionId
        );

        validarMesmoEvento(participant, destinationSession);

        if (participant.getEventSession() != null
                && participant.getEventSession().getId()
                .equals(destinationSessionId)) {

            garantirVinculoComGrupo(participant, destinationSession);
            return;
        }

        ParticipantGroup destinationGroup =
                garantirGrupoDaSessao(destinationSessionId);

        validarGrupoDisponivelParaEntrada(destinationGroup);
        validarVaga(destinationSession, destinationGroup);

        ParticipantGroupMember currentMembership = memberRepository
                .findByParticipantIdAndActiveTrue(participantId)
                .orElse(null);

        ParticipantGroup sourceGroup = null;

        if (currentMembership != null) {
            sourceGroup = currentMembership.getGroup();

            validarGrupoDisponivelParaSaida(sourceGroup);

            currentMembership.setActive(false);
            currentMembership.setRemovedAt(LocalDateTime.now());

            memberRepository.saveAndFlush(currentMembership);
        }

        // A sessão original da Sympla permanece inalterada.
        participant.setEventSession(destinationSession);
        participantRepository.save(participant);

        ParticipantGroupMember newMembership =
                ParticipantGroupMember.builder()
                        .group(destinationGroup)
                        .participant(participant)
                        .joinedAt(LocalDateTime.now())
                        .active(true)
                        .build();

        memberRepository.save(newMembership);

        if (sourceGroup != null) {
            atualizarStatusDoGrupo(sourceGroup);
        }

        atualizarStatusDoGrupo(destinationGroup);
    }

    @Transactional
    public void liberarGrupo(Long eventSessionId) {

        EventSession session = eventSessionRepository
                .findByIdForUpdate(eventSessionId)
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

        // Regulariza participantes que já estavam prontos
        // antes da correção do fluxo da Recepção.
        List<Participant> prontos = participantRepository
                .findAllByEventSessionIdAndActiveTrueAndArrivalStatusOrderByArrivedAtAsc(
                        eventSessionId,
                        ParticipantArrivalStatus.READY_FOR_GROUP
                );

        for (Participant participante : prontos) {
            if (participante.getStatus() != ParticipantStatus.CANCELLED) {
                alocarParticipanteNaSessao(
                        participante.getId(),
                        eventSessionId
                );
            }
        }

        ParticipantGroup group = groupRepository
                .findByEventSessionIdAndActiveTrue(eventSessionId)
                .orElseThrow(() ->
                        new BusinessException(
                                "Não há participantes prontos vinculados a este grupo."
                        )
                );

        if (group.getStatus() == ParticipantGroupStatus.RELEASED) {
            throw new BusinessException(
                    "O grupo já foi liberado."
            );
        }

        if (group.getStatus() == ParticipantGroupStatus.CANCELLED) {
            throw new BusinessException(
                    "Um grupo cancelado não pode ser liberado."
            );
        }

        long ocupacao = memberRepository
                .countByGroupIdAndActiveTrue(group.getId());

        if (ocupacao <= 0) {
            throw new BusinessException(
                    "Não é possível liberar um grupo vazio."
            );
        }

        boolean existeIntegranteNaoPronto = memberRepository
                .findAllByGroupIdAndActiveTrueOrderByJoinedAtAsc(
                        group.getId()
                )
                .stream()
                .anyMatch(membro -> {
                    Participant participante = membro.getParticipant();

                    return participante.getArrivalStatus()
                            != ParticipantArrivalStatus.READY_FOR_GROUP
                            || !Boolean.TRUE.equals(
                                    participante.getActive()
                            )
                            || participante.getStatus()
                            == ParticipantStatus.CANCELLED;
                });

        if (existeIntegranteNaoPronto) {
            throw new BusinessException(
                    "Existem integrantes sem confirmação de pronto para grupo."
            );
        }

        group.setStatus(ParticipantGroupStatus.RELEASED);
        group.setReleasedAt(LocalDateTime.now());

        groupRepository.saveAndFlush(group);
    }

    /**
     * Retira um participante de um grupo ainda não liberado.
     * Preserva o histórico do vínculo.
     *
     * Não modifica a inscrição, a sessão atual ou a
     * sessão original do participante.
     */
    @Transactional
    public void retirarParticipanteDeGrupoEmFormacao(Long participantId) {

        ParticipantGroupMember inicial = memberRepository
                .findByParticipantIdAndActiveTrue(participantId)
                .orElse(null);

        if (inicial == null) {
            return;
        }

        Long sessionId = inicial.getGroup()
                .getEventSession()
                .getId();

        // Bloqueia a sessão durante a alteração operacional.
        eventSessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sessão não encontrada."
                        )
                );

        // Reconsulta o vínculo após obter o bloqueio.
        ParticipantGroupMember vinculo = memberRepository
                .findByParticipantIdAndActiveTrue(participantId)
                .orElse(null);

        if (vinculo == null) {
            return;
        }

        ParticipantGroup grupo = vinculo.getGroup();

        if (!grupo.getEventSession().getId().equals(sessionId)) {
            throw new BusinessException(
                    "O grupo foi alterado. Atualize a tela e tente novamente."
            );
        }

        // RELEASED e CANCELLED continuam protegidos.
        validarGrupoDisponivelParaSaida(grupo);

        // Exclusão lógica: mantém o histórico no banco.
        vinculo.setActive(false);
        vinculo.setRemovedAt(LocalDateTime.now());

        memberRepository.saveAndFlush(vinculo);

        // Atualiza FORMING / READY conforme a ocupação.
        atualizarStatusDoGrupo(grupo);
    }

    @Transactional(readOnly = true)
    public boolean possuiVinculoAtivo(Long participantId) {
        return memberRepository.existsByParticipantIdAndActiveTrue(
                participantId
        );
    }

    private void garantirVinculoComGrupo(
            Participant participant,
            EventSession session
    ) {
        ParticipantGroupMember membershipAtual = memberRepository
                .findByParticipantIdAndActiveTrue(participant.getId())
                .orElse(null);

        if (membershipAtual != null) {
            if (!membershipAtual.getGroup()
                    .getEventSession()
                    .getId()
                    .equals(session.getId())) {

                throw new BusinessException(
                        "Participante possui vínculo ativo em outro grupo."
                );
            }

            atualizarStatusDoGrupo(membershipAtual.getGroup());
            return;
        }

        ParticipantGroup group =
                garantirGrupoDaSessao(session.getId());

        validarGrupoDisponivelParaEntrada(group);
        validarVaga(session, group);

        ParticipantGroupMember member =
                ParticipantGroupMember.builder()
                        .group(group)
                        .participant(participant)
                        .joinedAt(LocalDateTime.now())
                        .active(true)
                        .build();

        memberRepository.save(member);
        atualizarStatusDoGrupo(group);
    }

    private void validarGrupoDisponivelParaEntrada(
            ParticipantGroup group
    ) {
        if (group.getStatus() == ParticipantGroupStatus.RELEASED) {
            throw new BusinessException(
                    "Este grupo já foi liberado e não aceita novos participantes."
            );
        }

        if (group.getStatus() == ParticipantGroupStatus.CANCELLED) {
            throw new BusinessException(
                    "Este grupo está cancelado."
            );
        }

        if (!Boolean.TRUE.equals(group.getActive())) {
            throw new BusinessException(
                    "Este grupo está inativo."
            );
        }
    }

    private void validarGrupoDisponivelParaSaida(
            ParticipantGroup group
    ) {
        if (group.getStatus() == ParticipantGroupStatus.RELEASED) {
            throw new BusinessException(
                    "Não é possível mover participantes de um grupo já liberado."
            );
        }

        if (group.getStatus() == ParticipantGroupStatus.CANCELLED) {
            throw new BusinessException(
                    "Não é possível mover participantes de um grupo cancelado."
            );
        }
    }

    private void validarVaga(
            EventSession destinationSession,
            ParticipantGroup destinationGroup
    ) {
        long ocupacao = memberRepository
                .countByGroupIdAndActiveTrue(
                        destinationGroup.getId()
                );

        if (ocupacao >= destinationSession.getCapacity()) {
            throw new BusinessException(
                    "A sessão de destino está lotada."
            );
        }
    }

    private EventSession bloquearSessoesDaMovimentacao(
            Participant participant,
            Long destinationSessionId
    ) {
        List<Long> sessionIds = new ArrayList<>();

        if (participant.getEventSession() != null
                && participant.getEventSession().getId() != null) {
            sessionIds.add(
                    participant.getEventSession().getId()
            );
        }

        if (!sessionIds.contains(destinationSessionId)) {
            sessionIds.add(destinationSessionId);
        }

        sessionIds.sort(Long::compareTo);

        List<EventSession> lockedSessions = eventSessionRepository
                .findAllByIdInForUpdate(sessionIds);

        EventSession destinationSession = lockedSessions.stream()
                .filter(session ->
                        session.getId().equals(destinationSessionId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sessão não encontrada."
                        )
                );

        if (!Boolean.TRUE.equals(destinationSession.getActive())) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        return destinationSession;
    }

    @Transactional
    public void recalcularStatusDaSessao(Long eventSessionId) {
        groupRepository
                .findByEventSessionIdAndActiveTrue(eventSessionId)
                .ifPresent(this::atualizarStatusDoGrupo);
    }

    private void atualizarStatusDoGrupo(ParticipantGroup group) {
        if (group.getStatus() == ParticipantGroupStatus.RELEASED
                || group.getStatus() == ParticipantGroupStatus.CANCELLED) {
            return;
        }

        EventSession session = group.getEventSession();

        long ocupacao = memberRepository
                .countByGroupIdAndActiveTrue(group.getId());

        ParticipantGroupStatus novoStatus =
                ocupacao >= session.getCapacity()
                        ? ParticipantGroupStatus.READY
                        : ParticipantGroupStatus.FORMING;

        if (group.getStatus() != novoStatus) {
            group.setStatus(novoStatus);
            groupRepository.save(group);
        }
    }

    private void validarParticipanteParaAlocacao(
            Participant participant
    ) {
        if (!Boolean.TRUE.equals(participant.getActive())) {
            throw new BusinessException(
                    "O participante está inativo."
            );
        }

        if (participant.getStatus() == ParticipantStatus.CANCELLED) {
            throw new BusinessException(
                    "Participante cancelado não pode integrar um grupo."
            );
        }

        if (participant.getArrivalStatus()
                != ParticipantArrivalStatus.READY_FOR_GROUP) {
            throw new BusinessException(
                    "O participante ainda não está pronto para formação de grupo."
            );
        }
    }

    private void validarMesmoEvento(
            Participant participant,
            EventSession destinationSession
    ) {
        if (participant.getEvent() == null
                || destinationSession.getEvent() == null
                || !participant.getEvent().getId()
                .equals(destinationSession.getEvent().getId())) {

            throw new BusinessException(
                    "A sessão de destino pertence a outro evento."
            );
        }
    }

    private EventSession buscarSessao(Long eventSessionId) {
        EventSession session = eventSessionRepository
                .findById(eventSessionId)
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

        return session;
    }

    private Participant buscarParticipante(Long participantId) {
        return participantRepository
                .findById(participantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Participante não encontrado."
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<ParticipantGroupMemberResponse>
    buscarMembrosDaSessao(Long eventSessionId) {

        ParticipantGroup group = groupRepository
                .findByEventSessionIdAndActiveTrue(eventSessionId)
                .orElseThrow(() ->
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
                    Participant participant = member.getParticipant();

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
