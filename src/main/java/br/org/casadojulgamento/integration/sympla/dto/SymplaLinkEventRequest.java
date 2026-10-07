package br.org.casadojulgamento.integration.sympla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SymplaLinkEventRequest(

        @NotBlank(message = "O ID do evento na Sympla é obrigatório.")
        @Size(
                max = 120,
                message = "O ID do evento na Sympla deve possuir no máximo 120 caracteres."
        )
        String externalEventId

) {
}