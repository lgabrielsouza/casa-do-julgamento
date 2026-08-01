package br.org.casadojulgamento.api.dto.participant;

import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateParticipantRequest(

        @NotNull
        Long eventId,

        Long eventSessionId,

        @NotBlank
        @Size(max = 150)
        String fullName,

        @Email
        @Size(max = 180)
        String email,

        @NotBlank
        @Size(max = 20)
        String phone,

        ParticipantSource source,

        ParticipantStatus status,

        @Size(max = 2000)
        String notes

) {
}