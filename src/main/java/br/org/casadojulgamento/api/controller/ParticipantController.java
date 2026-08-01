package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.participant.CreateParticipantRequest;
import br.org.casadojulgamento.api.dto.participant.ParticipantFilterRequest;
import br.org.casadojulgamento.api.dto.participant.ParticipantResponse;
import br.org.casadojulgamento.api.dto.participant.UpdateParticipantRequest;
import br.org.casadojulgamento.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ParticipantController {

    private final ParticipantService participantService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ParticipantResponse criar(
            @Valid @RequestBody CreateParticipantRequest request
    ) {
        return participantService.criar(request);
    }

    @GetMapping
    public Page<ParticipantResponse> listar(
            @Valid @ModelAttribute ParticipantFilterRequest filter,
            Pageable pageable
    ) {
        return participantService.listar(filter, pageable);
    }

    @GetMapping("/{id}")
    public ParticipantResponse buscarPorId(
            @PathVariable Long id
    ) {
        return participantService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ParticipantResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantRequest request
    ) {
        return participantService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(
            @PathVariable Long id
    ) {
        participantService.desativar(id);
    }
}