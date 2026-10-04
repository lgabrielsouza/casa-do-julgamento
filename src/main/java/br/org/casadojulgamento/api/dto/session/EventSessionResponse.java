package br.org.casadojulgamento.api.dto.session;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EventSessionResponse(

        Long id,

        Long eventId,

        String eventName,

        LocalDate date,

        LocalTime startTime,

        Integer capacity,

        EventSessionStatus status,

        Boolean active,

        Long version,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}