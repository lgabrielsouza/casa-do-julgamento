package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.api.dto.event.CreateEventRequest;
import br.org.casadojulgamento.api.dto.event.EventFilterRequest;
import br.org.casadojulgamento.api.dto.event.EventResponse;
import br.org.casadojulgamento.api.dto.event.UpdateEventRequest;
import br.org.casadojulgamento.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse criar(
            @Valid @RequestBody CreateEventRequest request
    ) {
        return eventService.criar(request);
    }

    @GetMapping
    public Page<EventResponse> listar(
            @Valid @ModelAttribute EventFilterRequest filter,
            Pageable pageable
    ) {
        return eventService.listar(filter, pageable);
    }

    @GetMapping("/{id}")
    public EventResponse buscarPorId(
            @PathVariable Long id
    ) {
        return eventService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public EventResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request
    ) {
        return eventService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(
            @PathVariable Long id
    ) {
        eventService.desativar(id);
    }
}