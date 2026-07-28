package br.org.casadojulgamento.api.dto.session;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateEventSessionRequest(

        @NotNull
        LocalDate date,

        @NotNull
        LocalTime startTime,

        @NotNull
        @Min(1)
        Integer capacity,

        @NotNull
        EventSessionStatus status,

        @NotNull
        Long version

) {
}