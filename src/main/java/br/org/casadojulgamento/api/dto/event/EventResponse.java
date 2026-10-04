package br.org.casadojulgamento.api.dto.event;

import br.org.casadojulgamento.domain.enums.EventStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String name,
        String description,
        String city,
        String state,
        String venueName,
        String address,
        LocalDate startDate,
        LocalDate endDate,
        EventStatus status,
        String pagTicketsUrl,
        Boolean active,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}