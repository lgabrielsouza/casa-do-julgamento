package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymplaSortResponse(

        @JsonProperty("field_sort")
        String fieldSort,

        String sort

) {
}