package br.org.casadojulgamento.api.dto.user;

import br.org.casadojulgamento.domain.enums.UserRole;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String nome,
    String email,
    String telefone,
    UserRole role,
    Boolean ativo,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}