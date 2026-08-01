package br.org.casadojulgamento.api.dto.participant;

import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;

public record ParticipantFilterRequest(

        Long eventId,

        Long eventSessionId,

        String name,

        String phone,

        ParticipantSource source,

        ParticipantStatus status,

        Boolean active

) {
}