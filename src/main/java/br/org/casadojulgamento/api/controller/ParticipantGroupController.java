package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.service.ParticipantGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import br.org.casadojulgamento.api.dto.group.SessionGroupAvailabilityResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class ParticipantGroupController {

    private final ParticipantGroupService participantGroupService;

    @GetMapping("/sessions/{sessionId}/occupancy")
    public Map<String, Long> buscarOcupacao(
            @PathVariable Long sessionId
    ) {
        long occupancy =
                participantGroupService
                        .buscarOcupacao(sessionId);

        long available =
                participantGroupService
                        .buscarVagasDisponiveis(sessionId);

        return Map.of(
                "occupancy", occupancy,
                "available", available
        );
    }

    @PatchMapping(
            "/participants/{participantId}/session/{sessionId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alocarNaSessao(
            @PathVariable Long participantId,
            @PathVariable Long sessionId
    ) {
        participantGroupService
                .alocarParticipanteNaSessao(
                        participantId,
                        sessionId
                );
    }

    @GetMapping("/events/{eventId}/sessions")
    public List<SessionGroupAvailabilityResponse>
    buscarSessoesDoEvento(
            @PathVariable Long eventId
    ) {
        return participantGroupService
                .buscarDisponibilidadeDasSessoes(
                        eventId
                );
    }

    @PostMapping("/sessions/{sessionId}/release")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void liberarGrupo(
            @PathVariable Long sessionId
    ) {
        participantGroupService
                .liberarGrupo(sessionId);
    }

}