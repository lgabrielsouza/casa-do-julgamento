package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.integration.sympla.client.SymplaClient;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

@RestController
@RequestMapping("/api/integrations/sympla")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Profile("dev")
public class SymplaTestController {

    private final SymplaClient symplaClient;

    @GetMapping("/events")
    public JsonNode buscarEventos() {
        return symplaClient.buscarEventos();
    }

    @GetMapping("/events/{externalEventId}/participants")
    public SymplaParticipantsResponse buscarParticipantes(
            @PathVariable String externalEventId
    ) {
        return symplaClient.buscarParticipantes(
                externalEventId
        );
    }

    @GetMapping("/events/{externalEventId}/presentations")
    public JsonNode buscarApresentacoes(
            @PathVariable String externalEventId
    ) {
        return symplaClient.buscarApresentacoes(
                externalEventId
        );
    }

}