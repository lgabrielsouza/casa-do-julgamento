package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.session.CreateEventSessionRequest;
import br.org.casadojulgamento.api.dto.session.EventSessionFilterRequest;
import br.org.casadojulgamento.api.dto.session.EventSessionResponse;
import br.org.casadojulgamento.api.dto.session.UpdateEventSessionRequest;
import br.org.casadojulgamento.service.EventSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import br.org.casadojulgamento.api.dto.session.GenerateEventSessionsRequest;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EventSessionController {

    private final EventSessionService eventSessionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventSessionResponse criar(
            @Valid @RequestBody CreateEventSessionRequest request
    ) {
        return eventSessionService.criar(request);
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public List<EventSessionResponse> gerar(
            @Valid @RequestBody GenerateEventSessionsRequest request
    ) {
        return eventSessionService.gerar(request);
    }

    @GetMapping
    public Page<EventSessionResponse> listar(
            @Valid @ModelAttribute EventSessionFilterRequest filter,
            Pageable pageable
    ) {
        return eventSessionService.listar(filter, pageable);
    }

    @GetMapping("/{id}")
    public EventSessionResponse buscarPorId(
            @PathVariable Long id
    ) {
        return eventSessionService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public EventSessionResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventSessionRequest request
    ) {
        return eventSessionService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(
            @PathVariable Long id
    ) {
        eventSessionService.desativar(id);
    }
}