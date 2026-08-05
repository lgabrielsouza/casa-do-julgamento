package br.org.casadojulgamento.integration.sympla.client;

import br.org.casadojulgamento.integration.sympla.config.SymplaProperties;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import br.org.casadojulgamento.integration.sympla.exception.SymplaApiException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SymplaClient {

    private static final int DEFAULT_PAGE_SIZE = 100;

    /*
     * Proteção defensiva para evitar um loop excessivo
     * caso a API retorne uma paginação inconsistente.
     */
    private static final int MAX_PAGES = 1_000;

    private final RestClient symplaRestClient;
    private final SymplaProperties properties;

    public JsonNode buscarEventos() {
        validarTokenConfigurado();

        try {
            return symplaRestClient
                    .get()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path("/v1.6.0/events")
                                    .queryParam(
                                            "page_size",
                                            DEFAULT_PAGE_SIZE
                                    )
                                    .build()
                    )
                    .header(
                            "s_token",
                            properties.token()
                    )
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            (request, response) -> {
                                throw criarExcecaoApi(
                                        response
                                                .getStatusCode()
                                                .value(),
                                        response
                                                .getBody()
                                                .readAllBytes()
                                );
                            }
                    )
                    .body(JsonNode.class);

        } catch (SymplaApiException exception) {
            throw exception;

        } catch (RestClientException exception) {
            throw new SymplaApiException(
                    "Não foi possível comunicar com a API da Sympla.",
                    503,
                    exception
            );
        }
    }

    public SymplaParticipantsResponse buscarParticipantes(
            String externalEventId
    ) {
        validarTokenConfigurado();
        validarExternalEventId(externalEventId);

        /*
         * LinkedHashMap preserva a ordem recebida da API
         * e impede duplicações pelo ID externo.
         */
        Map<String, SymplaParticipantResponse>
                participantesPorId =
                new LinkedHashMap<>();

        SymplaParticipantsResponse primeiraPagina =
                buscarPaginaParticipantes(
                        externalEventId,
                        1
                );

        adicionarParticipantes(
                participantesPorId,
                primeiraPagina
        );

        int totalPaginas =
                calcularTotalPaginas(primeiraPagina);

        if (totalPaginas > MAX_PAGES) {
            throw new SymplaApiException(
                    "A API da Sympla retornou uma quantidade de páginas acima do limite permitido.",
                    502
            );
        }

        for (
                int pagina = 2;
                pagina <= totalPaginas;
                pagina++
        ) {
            SymplaParticipantsResponse respostaPagina =
                    buscarPaginaParticipantes(
                            externalEventId,
                            pagina
                    );

            adicionarParticipantes(
                    participantesPorId,
                    respostaPagina
            );
        }

        List<SymplaParticipantResponse>
                todosOsParticipantes =
                new ArrayList<>(
                        participantesPorId.values()
                );

        return new SymplaParticipantsResponse(
                List.copyOf(todosOsParticipantes),
                primeiraPagina != null
                        ? primeiraPagina.pagination()
                        : null,
                primeiraPagina != null
                        ? primeiraPagina.sort()
                        : null
        );
    }

    private SymplaParticipantsResponse
    buscarPaginaParticipantes(
            String externalEventId,
            int pagina
    ) {
        try {
            return symplaRestClient
                    .get()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/v1.6.0/events/{eventId}/participants"
                                    )
                                    .queryParam(
                                            "page",
                                            pagina
                                    )
                                    .queryParam(
                                            "page_size",
                                            DEFAULT_PAGE_SIZE
                                    )
                                    .queryParam(
                                            "cancelled_filter",
                                            "include"
                                    )
                                    .build(externalEventId)
                    )
                    .header(
                            "s_token",
                            properties.token()
                    )
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            (request, response) -> {
                                throw criarExcecaoApi(
                                        response
                                                .getStatusCode()
                                                .value(),
                                        response
                                                .getBody()
                                                .readAllBytes()
                                );
                            }
                    )
                    .body(
                            SymplaParticipantsResponse.class
                    );

        } catch (SymplaApiException exception) {
            throw exception;

        } catch (RestClientException exception) {
            throw new SymplaApiException(
                    "Não foi possível buscar a página "
                            + pagina
                            + " de participantes na Sympla.",
                    503,
                    exception
            );
        }
    }

    private void adicionarParticipantes(
            Map<String, SymplaParticipantResponse>
                    participantesPorId,
            SymplaParticipantsResponse response
    ) {
        if (
                response == null
                        || response.data() == null
        ) {
            return;
        }

        for (
                SymplaParticipantResponse participant
                : response.data()
        ) {
            if (
                    participant == null
                            || participant.id() == null
                            || participant.id().isBlank()
            ) {
                continue;
            }

            participantesPorId.put(
                    participant.id().trim(),
                    participant
            );
        }
    }

    private int calcularTotalPaginas(
            SymplaParticipantsResponse response
    ) {
        if (
                response == null
                        || response.pagination() == null
                        || response.pagination().quantity()
                        == null
        ) {
            return 1;
        }

        int quantidade =
                response.pagination().quantity();

        Integer pageSizeRetornado =
                response.pagination().pageSize();

        int tamanhoPagina =
                pageSizeRetornado != null
                        && pageSizeRetornado > 0
                        ? pageSizeRetornado
                        : DEFAULT_PAGE_SIZE;

        if (quantidade <= 0) {
            return 1;
        }

        return Math.max(
                1,
                (int) Math.ceil(
                        (double) quantidade
                                / tamanhoPagina
                )
        );
    }

    private void validarTokenConfigurado() {
        if (!properties.hasToken()) {
            throw new SymplaApiException(
                    "O token da API da Sympla não está configurado.",
                    503
            );
        }
    }

    private void validarExternalEventId(
            String externalEventId
    ) {
        if (
                externalEventId == null
                        || externalEventId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "O identificador externo do evento é obrigatório."
            );
        }
    }

    private SymplaApiException criarExcecaoApi(
            int statusCode,
            byte[] responseBody
    ) throws IOException {
        String body = new String(
                responseBody,
                StandardCharsets.UTF_8
        );

        String message = switch (statusCode) {
            case 401 ->
                    "Token da API da Sympla inválido ou expirado.";

            case 403 ->
                    "A conta não possui permissão para acessar este recurso da Sympla.";

            case 404 ->
                    "O recurso solicitado não foi encontrado na Sympla.";

            case 429 ->
                    "O limite de requisições da API da Sympla foi atingido.";

            default ->
                    "Erro ao consultar a API da Sympla.";
        };

        if (!body.isBlank()) {
            message += " Resposta: " + body;
        }

        return new SymplaApiException(
                message,
                statusCode
        );
    }
}