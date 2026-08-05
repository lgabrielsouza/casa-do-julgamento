package br.org.casadojulgamento.integration.sympla.dto;

import java.time.LocalDateTime;

public record SymplaIntegrationStatusResponse(

        Long eventId,

        String eventName,

        String provider,

        String externalEventId,

        long synchronizedParticipants,

        boolean connected,

        LocalDateTime lastSyncAt,

        int lastTotalFound,

        int lastCreated,

        int lastUpdated,

        int lastIgnored,

        int lastErrors

) {
}