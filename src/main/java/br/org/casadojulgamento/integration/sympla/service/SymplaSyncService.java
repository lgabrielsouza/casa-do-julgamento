package br.org.casadojulgamento.integration.sympla.service;

import br.org.casadojulgamento.integration.sympla.client.SymplaClient;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaSyncResult;
import br.org.casadojulgamento.integration.sympla.mapper.SymplaParticipantMapper;
import br.org.casadojulgamento.repository.ParticipantIntegrationRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SymplaSyncService {

    private final SymplaClient symplaClient;

    private final ParticipantRepository participantRepository;

    private final ParticipantIntegrationRepository integrationRepository;

    private final SymplaParticipantMapper mapper;

    public SymplaSyncResult sincronizar(
            String externalEventId
    ) {

        SymplaParticipantsResponse response =
                symplaClient.buscarParticipantes(
                        externalEventId
                );

        int created = 0;
        int updated = 0;
        int ignored = 0;
        int errors = 0;

        for (SymplaParticipantResponse participant : response.data()) {

            // implementação virá no próximo passo

        }

        return new SymplaSyncResult(
                created,
                updated,
                ignored,
                errors
        );

    }

}