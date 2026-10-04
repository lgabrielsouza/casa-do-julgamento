package br.org.casadojulgamento.api.dto.event;

import br.org.casadojulgamento.domain.enums.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateEventRequest(

        @NotBlank(message = "O nome do evento é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @Size(max = 5000, message = "A descrição deve ter no máximo 5000 caracteres.")
        String description,

        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
        String city,

        @Pattern(
                regexp = "^[A-Za-z]{2}$",
                message = "O estado deve conter exatamente duas letras."
        )
        String state,

        @Size(max = 150, message = "O local deve ter no máximo 150 caracteres.")
        String venueName,

        @Size(max = 255, message = "O endereço deve ter no máximo 255 caracteres.")
        String address,

        @NotNull(message = "A data inicial é obrigatória.")
        LocalDate startDate,

        @NotNull(message = "A data final é obrigatória.")
        LocalDate endDate,

        EventStatus status,

        @Size(max = 500, message = "O link do PagTickets deve ter no máximo 500 caracteres.")
        String pagTicketsUrl
) {
}
