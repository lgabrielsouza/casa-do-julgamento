package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.participant.ParticipantResponse;
import br.org.casadojulgamento.api.dto.reception.ChangeReceptionSessionRequest;
import br.org.casadojulgamento.api.dto.reception.ReceptionParticipantActionRequest;
import br.org.casadojulgamento.api.dto.reception.ReceptionParticipantFilterRequest;
import br.org.casadojulgamento.service.ReceptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reception/participants")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'COORDENADOR', 'LIDER', 'RECEPCAO')")
public class ReceptionController {

    private final ReceptionService receptionService;

    @GetMapping
    public Page<ParticipantResponse> listar(
            @Valid @ModelAttribute
            ReceptionParticipantFilterRequest filter,
            Pageable pageable
    ) {
        return receptionService.listar(filter, pageable);
    }

    @PatchMapping("/{id}/arrival")
    public ParticipantResponse registrarChegada(
            @PathVariable Long id,
            @Valid @RequestBody
            ReceptionParticipantActionRequest request
    ) {
        return receptionService.registrarChegada(
                id,
                request
        );
    }

    @PatchMapping("/{id}/ready")
    public ParticipantResponse marcarProntoParaGrupo(
            @PathVariable Long id,
            @Valid @RequestBody
            ReceptionParticipantActionRequest request
    ) {
        return receptionService.marcarProntoParaGrupo(
                id,
                request
        );
    }

    @PatchMapping("/{id}/undo-arrival")
    public ParticipantResponse desfazerChegada(
            @PathVariable Long id,
            @Valid @RequestBody
            ReceptionParticipantActionRequest request
    ) {
        return receptionService.desfazerChegada(
                id,
                request
        );
    }

    @PatchMapping("/{id}/session")
    public ParticipantResponse alterarSessao(
            @PathVariable Long id,
            @Valid @RequestBody
            ChangeReceptionSessionRequest request
    ) {
        return receptionService.alterarSessao(
                id,
                request
        );
    }
}