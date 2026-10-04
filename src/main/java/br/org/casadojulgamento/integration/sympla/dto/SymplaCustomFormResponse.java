package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymplaCustomFormResponse(

        Long id,

        String name,

        String value

) {
}