package br.org.casadojulgamento.api.dto.reception;

import jakarta.validation.constraints.NotNull;

public record ReceptionParticipantActionRequest(

        @NotNull
        Long version

) {
}