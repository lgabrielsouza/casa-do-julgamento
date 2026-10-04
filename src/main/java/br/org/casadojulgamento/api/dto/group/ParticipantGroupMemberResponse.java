package br.org.casadojulgamento.api.dto.group;

import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;

import java.time.LocalDateTime;

public record ParticipantGroupMemberResponse(

        Long participantId,

        String fullName,

        String phone,

        String email,

        ParticipantArrivalStatus arrivalStatus,

        LocalDateTime joinedAt

) {
}