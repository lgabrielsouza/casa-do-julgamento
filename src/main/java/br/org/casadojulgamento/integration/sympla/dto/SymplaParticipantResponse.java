package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymplaParticipantResponse(

        String id,

        @JsonProperty("event_id")
        String eventId,

        @JsonProperty("presentation_id")
        String presentationId,

        @JsonProperty("order_id")
        String orderId,

        @JsonProperty("ticket_number")
        String ticketNumber,

        @JsonProperty("ticket_status")
        String ticketStatus,

        @JsonProperty("order_status")
        String orderStatus,

        @JsonProperty("ticket_name")
        String ticketName,

        @JsonProperty("first_name")
        String firstName,

        @JsonProperty("last_name")
        String lastName,

        String email,

        CheckinResponse checkin,

        @JsonProperty("custom_form")
        List<SymplaCustomFormResponse> customForm

) {

    public String fullName() {

        String first =
                firstName != null
                        ? firstName
                        : "";

        String last =
                lastName != null
                        ? lastName
                        : "";

        return (first + " " + last).trim();
    }
}