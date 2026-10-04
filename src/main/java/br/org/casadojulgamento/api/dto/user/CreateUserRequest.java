package br.org.casadojulgamento.api.dto.user;

import br.org.casadojulgamento.domain.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(

    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 120, message = "O nome deve possuir no máximo 120 caracteres.")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 180, message = "O e-mail deve possuir no máximo 180 caracteres.")
    String email,

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 8, max = 72, message = "A senha deve possuir entre 8 e 72 caracteres.")
    String senha,

    @Size(max = 20, message = "O telefone deve possuir no máximo 20 caracteres.")
    String telefone,

    @NotNull(message = "O perfil é obrigatório.")
    UserRole role

) {
}