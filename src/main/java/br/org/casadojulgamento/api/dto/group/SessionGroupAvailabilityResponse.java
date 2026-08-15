package br.org.casadojulgamento.api.dto.group;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record SessionGroupAvailabilityResponse(

        Long sessionId,

        LocalDate date,

        LocalTime startTime,

        Integer capacity,

        long occupancy,

        long available,

        EventSessionStatus status

) {
}