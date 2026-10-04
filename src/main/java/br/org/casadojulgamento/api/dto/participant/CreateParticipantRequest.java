package br.org.casadojulgamento.api.dto.participant;

import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateParticipantRequest(

        @NotNull(message = "O evento é obrigatório.")
        @Positive(message = "O evento informado é inválido.")
        Long eventId,

        @Positive(message = "A sessão informada é inválida.")
        Long eventSessionId,

        @NotBlank(message = "O nome é obrigatório.")
        @Size(
                max = 150,
                message = "O nome deve possuir no máximo 150 caracteres."
        )
        String fullName,

        @Email(message = "Informe um e-mail válido.")
        @Size(
                max = 180,
                message = "O e-mail deve possuir no máximo 180 caracteres."
        )
        String email,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(
                max = 20,
                message = "O telefone deve possuir no máximo 20 caracteres."
        )
        String phone,

        ParticipantSource source,

        ParticipantStatus status,

        @Size(
                max = 2000,
                message = "As observações devem possuir no máximo 2000 caracteres."
        )
        String notes

) {
}