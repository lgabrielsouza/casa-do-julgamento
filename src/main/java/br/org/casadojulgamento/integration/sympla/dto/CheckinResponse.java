package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CheckinResponse(

        @JsonProperty("check_in")
        Boolean checkIn

) {
}