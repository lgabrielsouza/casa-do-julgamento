package br.org.casadojulgamento.api.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMyProfileRequest(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(
                min = 2,
                max = 100,
                message = "O nome deve possuir entre 2 e 100 caracteres."
        )
        String nome,

        @Size(
                max = 20,
                message = "O telefone deve possuir no máximo 20 caracteres."
        )
        String telefone

) {
}