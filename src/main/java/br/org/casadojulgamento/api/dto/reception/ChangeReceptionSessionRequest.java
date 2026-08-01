package br.org.casadojulgamento.api.dto.reception;

import jakarta.validation.constraints.NotNull;

public record ChangeReceptionSessionRequest(

        Long eventSessionId,

        @NotNull
        Long version

) {
}