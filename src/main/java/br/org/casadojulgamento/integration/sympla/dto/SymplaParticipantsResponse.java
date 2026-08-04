package br.org.casadojulgamento.integration.sympla.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymplaParticipantsResponse(

        List<SymplaParticipantResponse> data,

        SymplaPaginationResponse pagination,

        SymplaSortResponse sort

) {
}