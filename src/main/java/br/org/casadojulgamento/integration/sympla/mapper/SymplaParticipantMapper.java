package br.org.casadojulgamento.integration.sympla.mapper;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SymplaParticipantMapper {

    public Participant toParticipant(
            SymplaParticipantResponse dto,
            Event event
    ) {

        return Participant.builder()
                .event(event)
                .fullName(dto.fullName())
                .email(dto.email())
                .phone(null)
                .source(ParticipantSource.SYMPLA)
                .status(ParticipantStatus.REGISTERED)
                .arrivalStatus(ParticipantArrivalStatus.NOT_ARRIVED)
                .active(true)
                .build();

    }

    public ParticipantIntegration toIntegration(
            Participant participant,
            SymplaParticipantResponse dto
    ) {

        return ParticipantIntegration.builder()
                .participant(participant)
                .provider(IntegrationProvider.SYMPLA)
                .externalParticipantId(dto.id())
                .externalTicketId(dto.ticketNumber())
                .externalOrderId(dto.orderId())
                .ticketStatus(dto.ticketStatus())
                .orderStatus(dto.orderStatus())
                .checkedIn(
                        dto.checkin() != null &&
                        Boolean.TRUE.equals(dto.checkin().checkIn())
                )
                .lastSyncAt(LocalDateTime.now())
                .build();

    }

}