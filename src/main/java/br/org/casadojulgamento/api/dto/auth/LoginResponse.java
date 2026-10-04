package br.org.casadojulgamento.api.dto.auth;

import br.org.casadojulgamento.domain.enums.UserRole;

public record LoginResponse(

        String token,

        Long id,

        String nome,

        String email,

        UserRole role

) {
}