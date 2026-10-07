package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.integration.sympla.dto.SymplaIntegrationStatusResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaLinkEventRequest;
import br.org.casadojulgamento.integration.sympla.dto.SymplaSyncResult;
import br.org.casadojulgamento.integration.sympla.service.SymplaEventLinkService;
import br.org.casadojulgamento.integration.sympla.service.SymplaIntegrationStatusService;
import br.org.casadojulgamento.integration.sympla.service.SymplaSyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/integrations/sympla")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'COORDENADOR')"
)
public class SymplaSyncController {

    private final SymplaSyncService symplaSyncService;

    private final SymplaIntegrationStatusService
            symplaIntegrationStatusService;

    private final SymplaEventLinkService
            symplaEventLinkService;

    @GetMapping("/events/{eventId}/status")
    public SymplaIntegrationStatusResponse buscarStatus(
            @PathVariable Long eventId
    ) {
        return symplaIntegrationStatusService
                .buscarStatus(eventId);
    }

    @PutMapping("/events/{eventId}/link")
    public SymplaIntegrationStatusResponse vincularEvento(
            @PathVariable Long eventId,
            @Valid @RequestBody SymplaLinkEventRequest request
    ) {
        return symplaEventLinkService.vincular(
                eventId,
                request.externalEventId()
        );
    }

    @PostMapping("/events/{eventId}/sync")
    public SymplaSyncResult sincronizarParticipantes(
            @PathVariable Long eventId
    ) {
        return symplaSyncService.sincronizar(
                eventId
        );
    }
}