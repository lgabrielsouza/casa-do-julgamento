package br.org.casadojulgamento.integration.sympla.client;

import br.org.casadojulgamento.integration.sympla.config.SymplaProperties;
import br.org.casadojulgamento.integration.sympla.exception.SymplaApiException;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class SymplaClient {

    private static final int DEFAULT_PAGE_SIZE = 100;

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
                                        response.getStatusCode()
                                                .value(),
                                        response.getBody()
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

        try {
            return symplaRestClient
                    .get()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/v1.6.0/events/{eventId}/participants"
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
                                        response.getStatusCode()
                                                .value(),
                                        response.getBody()
                                                .readAllBytes()
                                );
                            }
                    )
                    .body(SymplaParticipantsResponse.class);

        } catch (SymplaApiException exception) {
            throw exception;

        } catch (RestClientException exception) {
            throw new SymplaApiException(
                    "Não foi possível buscar os participantes na Sympla.",
                    503,
                    exception
            );
        }
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