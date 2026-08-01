package br.org.casadojulgamento.api.dto.participant;

import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;

import java.time.LocalDateTime;

public record ParticipantResponse(

        Long id,

        Long eventId,

        String eventName,

        Long eventSessionId,

        String fullName,

        String email,

        String phone,

        ParticipantSource source,

        ParticipantStatus status,

        String notes,

        Boolean active,

        Long version,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}