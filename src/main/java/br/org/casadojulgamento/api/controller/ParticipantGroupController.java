package br.org.casadojulgamento.api.controller;

import br.org.casadojulgamento.service.ParticipantGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
}