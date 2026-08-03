package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.reception.ReceptionPrintParticipantResponse;
import br.org.casadojulgamento.api.dto.reception.ReceptionSessionPrintResponse;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventSessionRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionPrintService {

    private final EventSessionRepository eventSessionRepository;
    private final ParticipantRepository participantRepository;

    @Transactional(readOnly = true)
    public ReceptionSessionPrintResponse gerarLista(
            Long sessionId
    ) {
        EventSession session = eventSessionRepository
                .findById(sessionId)
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

        List<Participant> participants =
                participantRepository
                        .findAllByEventSessionIdAndActiveTrueAndStatusNotOrderByFullNameAsc(
                                sessionId,
                                ParticipantStatus.CANCELLED
                        );

        List<ReceptionPrintParticipantResponse>
                participantResponses = participants
                .stream()
                .map(this::toParticipantResponse)
                .toList();

        return new ReceptionSessionPrintResponse(
                session.getEvent().getId(),
                session.getEvent().getName(),
                session.getId(),
                session.getDate(),
                session.getStartTime(),
                session.getCapacity(),
                participantResponses.size(),
                LocalDateTime.now(),
                participantResponses
        );
    }

    private ReceptionPrintParticipantResponse
    toParticipantResponse(
            Participant participant
    ) {
        return new ReceptionPrintParticipantResponse(
                participant.getId(),
                participant.getFullName(),
                participant.getPhone(),
                participant.getEmail(),
                participant.getSource(),
                participant.getArrivalStatus(),
                participant.getNotes()
        );
    }
}