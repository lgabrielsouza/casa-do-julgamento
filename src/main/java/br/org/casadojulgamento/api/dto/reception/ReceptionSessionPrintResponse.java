package br.org.casadojulgamento.api.dto.reception;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record ReceptionSessionPrintResponse(

        Long eventId,

        String eventName,

        Long eventSessionId,

        LocalDate sessionDate,

        LocalTime sessionStartTime,

        Integer capacity,

        Integer totalParticipants,

        LocalDateTime generatedAt,

        List<ReceptionPrintParticipantResponse> participants

) {
}