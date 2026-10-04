package br.org.casadojulgamento.api.dto.reception;

import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ReceptionParticipantFilterRequest(

        @NotNull(message = "O evento é obrigatório.")
        @Positive(message = "O evento informado é inválido.")
        Long eventId,

        @Positive(message = "A sessão informada é inválida.")
        Long eventSessionId,

        @Size(
                max = 150,
                message = "O nome deve possuir no máximo 150 caracteres."
        )
        String name,

        @Size(
                max = 20,
                message = "O telefone deve possuir no máximo 20 caracteres."
        )
        String phone,

        ParticipantArrivalStatus arrivalStatus

) {
}