package br.org.casadojulgamento.api.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetUserPasswordRequest(

        @NotBlank(message = "A nova senha é obrigatória.")
        @Size(
                min = 8,
                max = 72,
                message = "A senha deve possuir entre 8 e 72 caracteres."
        )
        String novaSenha

) {
}