package br.org.casadojulgamento.api.dto.participant;

import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ParticipantFilterRequest(

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

        ParticipantSource source,

        ParticipantStatus status,

        Boolean active

) {
}