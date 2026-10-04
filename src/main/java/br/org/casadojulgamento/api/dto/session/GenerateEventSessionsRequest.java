package br.org.casadojulgamento.api.dto.session;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record GenerateEventSessionsRequest(

        @NotNull
        Long eventId,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate,

        @NotNull
        LocalTime startTime,

        @NotNull
        LocalTime endTime,

        @NotNull
        @Min(1)
        @Max(1440)
        Integer intervalMinutes,

        @NotNull
        @Min(1)
        Integer capacity,

        @NotNull
        EventSessionStatus status,

        Set<DayOfWeek> weekdays

) {
}