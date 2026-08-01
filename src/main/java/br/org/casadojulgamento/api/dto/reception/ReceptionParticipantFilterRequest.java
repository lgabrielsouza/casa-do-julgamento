package br.org.casadojulgamento.api.dto.reception;

import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import jakarta.validation.constraints.NotNull;

public record ReceptionParticipantFilterRequest(

        @NotNull
        Long eventId,

        Long eventSessionId,

        String name,

        String phone,

        ParticipantArrivalStatus arrivalStatus

) {
}