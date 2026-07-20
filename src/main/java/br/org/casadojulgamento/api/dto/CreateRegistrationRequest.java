package br.org.casadojulgamento.api.dto;

import br.org.casadojulgamento.domain.enums.RegistrationType;
import jakarta.validation.constraints.*;

public record CreateRegistrationRequest(
    @NotNull Long eventId,
    @NotNull Long eventSessionId,

    @NotBlank
    @Size(max = 150)
    String fullName,

    @NotBlank
    @Email
    @Size(max = 180)
    String email,

    @NotBlank
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    String cpf,

    @NotBlank
    @Size(max = 20)
    String phone,

    @NotNull
    RegistrationType type,

    @Size(max = 80)
    String serviceArea
) {}
