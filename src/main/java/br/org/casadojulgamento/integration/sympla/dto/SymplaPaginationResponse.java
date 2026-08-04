package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymplaPaginationResponse(

        Integer quantity,

        @JsonProperty("page_size")
        Integer pageSize

) {
}