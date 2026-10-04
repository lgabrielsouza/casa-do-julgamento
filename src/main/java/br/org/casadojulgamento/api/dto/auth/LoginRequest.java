package br.org.casadojulgamento.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @Email(message = "E-mail inválido.")
        @NotBlank(message = "Informe o e-mail.")
        String email,

        @NotBlank(message = "Informe a senha.")
        String senha

) {
}