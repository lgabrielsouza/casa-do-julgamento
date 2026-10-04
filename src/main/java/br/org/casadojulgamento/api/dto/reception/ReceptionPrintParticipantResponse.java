package br.org.casadojulgamento.api.dto.reception;

import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantSource;

public record ReceptionPrintParticipantResponse(

        Long id,

        String fullName,

        String phone,

        String email,

        ParticipantSource source,

        ParticipantArrivalStatus arrivalStatus,

        String notes

) {
}