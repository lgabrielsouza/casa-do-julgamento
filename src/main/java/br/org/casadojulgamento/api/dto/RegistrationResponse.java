package br.org.casadojulgamento.api.dto;

import br.org.casadojulgamento.domain.enums.RegistrationStatus;
import br.org.casadojulgamento.domain.enums.RegistrationType;

public record RegistrationResponse(
    Long id,
    String fullName,
    String email,
    String cpf,
    String phone,
    RegistrationType type,
    String serviceArea,
    RegistrationStatus status,
    String qrToken
) {}
