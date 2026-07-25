package br.org.casadojulgamento.api.dto.event;

import br.org.casadojulgamento.domain.enums.EventStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EventFilterRequest(

        @Size(
                max = 120,
                message = "O nome deve ter no máximo 120 caracteres."
        )
        String name,

        @Size(
                max = 100,
                message = "A cidade deve ter no máximo 100 caracteres."
        )
        String city,

        @Pattern(
                regexp = "^[A-Za-z]{2}$",
                message = "O estado deve conter exatamente duas letras."
        )
        String state,

        EventStatus status,

        Boolean active,

        LocalDate startDateFrom,

        LocalDate startDateTo
) {
}