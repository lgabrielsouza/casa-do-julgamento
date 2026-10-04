package br.org.casadojulgamento.integration.sympla.dto;

public record SymplaSyncResult(

        int created,

        int updated,

        int ignored,

        int errors

) {
}