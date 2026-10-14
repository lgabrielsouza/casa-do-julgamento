
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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SymplaClient {

    private static final int DEFAULT_PAGE_SIZE = 100;

    /*
     * Limite defensivo para evitar consultas infinitas
     * em caso de resposta inconsistente da API.
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
                                                .value()
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
         * Preserva a ordem de recebimento e evita duplicações
         * pelo identificador externo do participante.
         */
        Map<String, SymplaParticipantResponse>
                participantesPorId =
                new LinkedHashMap<>();

        /*
         * Guarda os cursores já utilizados para impedir
         * repetição infinita de páginas.
         */
        Set<String> cursoresUtilizados =
                new HashSet<>();

        SymplaParticipantsResponse primeiraPagina =
                null;

        String cursor = null;
        int paginasConsultadas = 0;

        while (true) {

            if (paginasConsultadas >= MAX_PAGES) {

                throw new SymplaApiException(
                        "A sincronização excedeu o limite de páginas permitido.",
                        502
                );
            }

            SymplaParticipantsResponse respostaPagina =
                    buscarPaginaParticipantes(
                            externalEventId,
                            cursor
                    );

            paginasConsultadas++;

            /*
             * Uma resposta sem lista de dados não pode ser
             * considerada uma sincronização válida.
             *
             * Assim evitamos marcar como concluída uma
             * consulta incompleta ou inconsistente.
             */
            if (
                    respostaPagina == null
                            || respostaPagina.data() == null
            ) {

                throw new SymplaApiException(
                        "A Sympla retornou uma resposta de participantes inválida.",
                        502
                );
            }

            if (primeiraPagina == null) {
                primeiraPagina = respostaPagina;
            }

            adicionarParticipantes(
                    participantesPorId,
                    respostaPagina
            );

            /*
             * Na API v1.6.0, o próximo lote é identificado
             * pelo campo pagination.next_cursor.
             */
            String proximoCursor =
                    respostaPagina.pagination() != null
                            ? respostaPagina
                                    .pagination()
                                    .nextCursor()
                            : null;

            /*
             * Sem próximo cursor, a paginação terminou.
             */
            if (
                    proximoCursor == null
                            || proximoCursor.isBlank()
            ) {
                break;
            }

            /*
             * Proteção contra respostas com cursor cíclico.
             */
            if (!cursoresUtilizados.add(proximoCursor)) {

                throw new SymplaApiException(
                        "A Sympla retornou um cursor de paginação repetido.",
                        502
                );
            }

            /*
             * Um cursor de continuação acompanhado de uma
             * página vazia indica resposta inconsistente.
             */
            if (respostaPagina.data().isEmpty()) {

                throw new SymplaApiException(
                        "A Sympla retornou uma página vazia com cursor de continuação.",
                        502
                );
            }

            cursor = proximoCursor;
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

    private SymplaParticipantsResponse buscarPaginaParticipantes(
            String externalEventId,
            String cursor
    ) {

        try {

            return symplaRestClient
                    .get()
                    .uri(uriBuilder -> {

                        var builder =
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
                                        );

                        /*
                         * O cursor só é enviado quando existe.
                         * Na primeira consulta não há cursor.
                         */
                        if (
                                cursor != null
                                        && !cursor.isBlank()
                        ) {

                            builder.queryParam(
                                    "cursor",
                                    cursor
                            );
                        }

                        return builder.build(
                                externalEventId
                        );
                    })
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
                                                .value()
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
                    "Não foi possível consultar uma página de participantes na Sympla.",
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

    public JsonNode buscarApresentacoes(
            String externalEventId
    ) {

        validarTokenConfigurado();
        validarExternalEventId(
                externalEventId
        );

        try {

            return symplaRestClient
                    .get()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/v1.6.0/events/{eventId}/presentations"
                                    )
                                    .queryParam(
                                            "page_size",
                                            DEFAULT_PAGE_SIZE
                                    )
                                    .build(
                                            externalEventId
                                    )
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
                                                .value()
                                );
                            }
                    )
                    .body(
                            JsonNode.class
                    );

        } catch (SymplaApiException exception) {

            throw exception;

        } catch (RestClientException exception) {

            throw new SymplaApiException(
                    "Não foi possível buscar as apresentações do evento na Sympla.",
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

    /*
     * O corpo da resposta externa não é incluído na
     * exceção, evitando exposição de dados sensíveis.
     */
    private SymplaApiException criarExcecaoApi(
            int statusCode
    ) {

        String message =
                switch (statusCode) {

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

        return new SymplaApiException(
                message,
                statusCode
        );
    }
}
