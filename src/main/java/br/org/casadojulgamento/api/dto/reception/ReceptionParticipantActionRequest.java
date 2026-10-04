package br.org.casadojulgamento.api.dto.reception;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ReceptionParticipantActionRequest(

        @NotNull(message = "A versão do participante é obrigatória.")
        @PositiveOrZero(message = "A versão do participante é inválida.")
        Long version

) {
}