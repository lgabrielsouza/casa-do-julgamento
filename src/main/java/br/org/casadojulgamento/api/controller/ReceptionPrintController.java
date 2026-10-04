package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.reception.ReceptionSessionPrintResponse;
import br.org.casadojulgamento.service.ReceptionPrintService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reception/sessions")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'COORDENADOR', 'LIDER', 'RECEPCAO')")
public class ReceptionPrintController {

    private final ReceptionPrintService receptionPrintService;

    @GetMapping("/{sessionId}/print")
    public ReceptionSessionPrintResponse gerarLista(
            @PathVariable Long sessionId
    ) {
        return receptionPrintService.gerarLista(
                sessionId
        );
    }
}