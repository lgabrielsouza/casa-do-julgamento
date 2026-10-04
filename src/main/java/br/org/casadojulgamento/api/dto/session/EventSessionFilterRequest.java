package br.org.casadojulgamento.api.dto.session;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;

import java.time.LocalDate;

public record EventSessionFilterRequest(

        Long eventId,

        LocalDate date,

        EventSessionStatus status,

        Boolean active

) {
}