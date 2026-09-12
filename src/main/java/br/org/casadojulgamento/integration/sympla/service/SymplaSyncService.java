package br.org.casadojulgamento.integration.sympla.service;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.integration.sympla.client.SymplaClient;
import br.org.casadojulgamento.integration.sympla.dto.SymplaCustomFormResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantsResponse;
import br.org.casadojulgamento.integration.sympla.dto.SymplaSyncResult;
import br.org.casadojulgamento.integration.sympla.mapper.SymplaParticipantMapper;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.EventSessionRepository;
import br.org.casadojulgamento.repository.ParticipantIntegrationRepository;
import br.org.casadojulgamento.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SymplaSyncService {

    private static final DateTimeFormatter SESSION_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /*
     * Não dependemos do caractere usado entre a data e o horário.
     *
     * Isso torna a leitura resistente a hífen, travessão,
     * meia-risca e diferenças de codificação.
     *
     * Exemplo esperado:
     * 29/10/2026 - 18:30
     * 29/10/2026 – 18:30
     */
    private static final Pattern SESSION_VALUE_PATTERN =
            Pattern.compile(
                    "(\\d{2}/\\d{2}/\\d{4}).*?(\\d{1,2}:\\d{2})"
            );

    private final SymplaClient symplaClient;
    private final EventRepository eventRepository;
    private final EventSessionRepository eventSessionRepository;
    private final ParticipantRepository participantRepository;
    private final ParticipantIntegrationRepository integrationRepository;
    private final SymplaParticipantMapper mapper;
    private final TransactionTemplate transactionTemplate;

    public SymplaSyncResult sincronizar(Long eventId) {

        /*
         * Primeiro consultamos apenas os dados necessários do evento.
         *
         * Não adquirimos lock pessimista neste momento, porque a chamada
         * HTTP para a Sympla pode levar alguns segundos e não devemos
         * manter uma transação/lock do PostgreSQL aberto enquanto
         * aguardamos um serviço externo.
         */
        Event eventInicial =
                buscarEventoIntegrado(eventId);

        String externalEventId =
                eventInicial.getExternalEventId();

        /*
         * A chamada externa acontece fora da transação do banco.
         */
        SymplaParticipantsResponse response =
                symplaClient.buscarParticipantes(
                        externalEventId
                );

        List<SymplaParticipantResponse> participantes =
                response != null
                        && response.data() != null
                        ? response.data()
                        : List.of();

        /*
         * Somente depois que todos os dados externos foram obtidos
         * iniciamos a transação responsável pela sincronização local.
         *
         * Dentro dela o evento é bloqueado com PESSIMISTIC_WRITE,
         * impedindo duas sincronizações simultâneas de modificarem
         * o mesmo evento ao mesmo tempo.
         */
        SymplaSyncResult resultado =
                transactionTemplate.execute(
                        status -> processarSincronizacao(
                                eventId,
                                externalEventId,
                                participantes
                        )
                );

        if (resultado == null) {
            throw new IllegalStateException(
                    "Não foi possível concluir a sincronização com a Sympla."
            );
        }

        return resultado;
    }

    private SymplaSyncResult processarSincronizacao(
            Long eventId,
            String externalEventIdConsultado,
            List<SymplaParticipantResponse> participantes
    ) {

        Event event =
                buscarEventoIntegradoComLock(
                        eventId
                );

        /*
         * Entre a consulta à Sympla e o início da transação alguém pode,
         * em teoria, ter alterado a integração do evento.
         *
         * Nesse caso abortamos a sincronização para evitar importar
         * participantes de um evento externo diferente.
         */
        if (
                !externalEventIdConsultado.equals(
                        event.getExternalEventId()
                )
        ) {
            throw new IllegalStateException(
                    "A integração do evento foi alterada durante a sincronização. Tente novamente."
            );
        }

        int created = 0;
        int updated = 0;
        int ignored = 0;
        int errors = 0;

        for (
                SymplaParticipantResponse dto
                : participantes
        ) {

            if (!participanteValido(dto)) {
                errors++;
                continue;
            }

            String externalParticipantId =
                    dto.id().trim();

            Optional<ParticipantIntegration>
                    integrationOptional =
                    integrationRepository
                            .findByProviderAndExternalParticipantId(
                                    IntegrationProvider.SYMPLA,
                                    externalParticipantId
                            );

            if (integrationOptional.isPresent()) {

                ParticipantIntegration integration =
                        integrationOptional.get();

                if (
                        !integrationPertenceAoEvento(
                                integration,
                                event
                        )
                ) {
                    errors++;
                    continue;
                }

                boolean alterado =
                        mapper.atualizarDados(
                                integration,
                                dto
                        );

                /*
                 * A sessão escolhida na Sympla é considerada
                 * a origem confiável da inscrição.
                 *
                 * A sessão operacional atual somente é preenchida
                 * automaticamente se o participante ainda não tiver
                 * uma sessão definida.
                 *
                 * Assim, uma movimentação realizada posteriormente
                 * pela Recepção nunca é desfeita por uma nova
                 * sincronização com a Sympla.
                 */
                boolean sessaoAlterada =
                        aplicarSessaoEscolhidaNaSympla(
                                integration.getParticipant(),
                                dto,
                                event
                        );

                alterado =
                        alterado || sessaoAlterada;

                /*
                 * O Participant relacionado também está sendo
                 * acompanhado pelo contexto JPA.
                 *
                 * Caso qualquer erro inesperado de persistência aconteça,
                 * a transação inteira será revertida. Isso evita uma
                 * sincronização parcial e inconsistente.
                 */
                integrationRepository.save(
                        integration
                );

                if (alterado) {
                    updated++;
                } else {
                    ignored++;
                }

                continue;
            }

            Participant participant =
                    mapper.toParticipant(
                            dto,
                            event
                    );

            /*
             * Para um participante novo, tentamos identificar
             * a sessão escolhida no formulário da Sympla antes
             * de persistir o registro.
             */
            aplicarSessaoEscolhidaNaSympla(
                    participant,
                    dto,
                    event
            );

            Participant participantSalvo =
                    participantRepository.save(
                            participant
                    );

            ParticipantIntegration integration =
                    mapper.toIntegration(
                            participantSalvo,
                            dto
                    );

            integrationRepository.save(
                    integration
            );

            created++;
        }

        registrarResultadoNoEvento(
                event,
                participantes.size(),
                created,
                updated,
                ignored,
                errors
        );

        return new SymplaSyncResult(
                created,
                updated,
                ignored,
                errors
        );
    }

    private boolean aplicarSessaoEscolhidaNaSympla(
            Participant participant,
            SymplaParticipantResponse dto,
            Event event
    ) {

        Optional<SessaoEscolhida> escolhaOptional =
                extrairSessaoEscolhida(dto);

        if (escolhaOptional.isEmpty()) {
            return false;
        }

        SessaoEscolhida escolha =
                escolhaOptional.get();

        Optional<EventSession> sessionOptional =
                eventSessionRepository
                        .findByEventIdAndDateAndStartTimeAndActiveTrue(
                                event.getId(),
                                escolha.date(),
                                escolha.time()
                        );

        /*
         * Se a resposta da Sympla não corresponder exatamente
         * a uma sessão ativa existente no nosso evento,
         * não inventamos uma sessão e não interrompemos
         * a sincronização dos demais dados.
         */
        if (sessionOptional.isEmpty()) {
            return false;
        }

        EventSession session =
                sessionOptional.get();

        boolean alterado = false;

        /*
         * originalEventSession representa a sessão efetivamente
         * escolhida pelo participante na origem.
         *
         * Depois de preenchida, ela nunca é sobrescrita
         * pela sincronização.
         */
        if (participant.getOriginalEventSession() == null) {

            participant.setOriginalEventSession(
                    session
            );

            alterado = true;
        }

        /*
         * eventSession representa a sessão operacional atual.
         *
         * Só preenchemos automaticamente quando ela ainda
         * estiver vazia. Se a Recepção já movimentou o
         * participante, preservamos a decisão operacional.
         */
        if (participant.getEventSession() == null) {

            participant.setEventSession(
                    session
            );

            alterado = true;
        }

        return alterado;
    }

    private Optional<SessaoEscolhida> extrairSessaoEscolhida(
            SymplaParticipantResponse dto
    ) {

        if (
                dto.customForm() == null
                        || dto.customForm().isEmpty()
        ) {
            return Optional.empty();
        }

        for (
                SymplaCustomFormResponse campo
                : dto.customForm()
        ) {

            if (
                    campo == null
                            || !campoRepresentaSessao(campo.name())
                            || campo.value() == null
                            || campo.value().isBlank()
            ) {
                continue;
            }

            Optional<SessaoEscolhida> escolha =
                    converterValorDaSessao(
                            campo.value()
                    );

            if (escolha.isPresent()) {
                return escolha;
            }
        }

        return Optional.empty();
    }

    private boolean campoRepresentaSessao(
            String nomeCampo
    ) {

        if (
                nomeCampo == null
                        || nomeCampo.isBlank()
        ) {
            return false;
        }

        String normalizado =
                nomeCampo
                        .trim()
                        .toLowerCase(Locale.ROOT);

        /*
         * O formulário atual usa:
         *
         * "Escolha o horário da sua sessão"
         *
         * Não dependemos da frase inteira para permitir
         * pequenas alterações no texto da pergunta.
         */
        return normalizado.contains("sess")
                && (
                normalizado.contains("hor")
                        || normalizado.contains("rio")
        );
    }

    private Optional<SessaoEscolhida> converterValorDaSessao(
            String valor
    ) {

        Matcher matcher =
                SESSION_VALUE_PATTERN.matcher(
                        valor.trim()
                );

        if (!matcher.find()) {
            return Optional.empty();
        }

        try {

            LocalDate date =
                    LocalDate.parse(
                            matcher.group(1),
                            SESSION_DATE_FORMATTER
                    );

            LocalTime time =
                    LocalTime.parse(
                            matcher.group(2)
                    );

            return Optional.of(
                    new SessaoEscolhida(
                            date,
                            time
                    )
            );

        } catch (DateTimeParseException exception) {

            return Optional.empty();
        }
    }

    private Event buscarEventoIntegrado(
            Long eventId
    ) {

        if (eventId == null) {
            throw new IllegalArgumentException(
                    "O identificador do evento é obrigatório."
            );
        }

        Event event =
                eventRepository
                        .findById(eventId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Evento não encontrado."
                                )
                        );

        validarIntegracaoSympla(event);

        return event;
    }

    private Event buscarEventoIntegradoComLock(
            Long eventId
    ) {

        if (eventId == null) {
            throw new IllegalArgumentException(
                    "O identificador do evento é obrigatório."
            );
        }

        Event event =
                eventRepository
                        .findByIdForIntegrationSync(
                                eventId
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Evento não encontrado."
                                )
                        );

        validarIntegracaoSympla(event);

        return event;
    }

    private void validarIntegracaoSympla(
            Event event
    ) {

        if (
                event.getExternalProvider()
                        != IntegrationProvider.SYMPLA
        ) {
            throw new IllegalStateException(
                    "O evento não está vinculado à Sympla."
            );
        }

        if (
                event.getExternalEventId() == null
                        || event.getExternalEventId()
                        .isBlank()
        ) {
            throw new IllegalStateException(
                    "O evento não possui um identificador da Sympla."
            );
        }
    }

    private void registrarResultadoNoEvento(
            Event event,
            int totalFound,
            int created,
            int updated,
            int ignored,
            int errors
    ) {

        event.setLastIntegrationSyncAt(
                LocalDateTime.now()
        );

        event.setLastIntegrationTotalFound(
                totalFound
        );

        event.setLastIntegrationCreated(
                created
        );

        event.setLastIntegrationUpdated(
                updated
        );

        event.setLastIntegrationIgnored(
                ignored
        );

        event.setLastIntegrationErrors(
                errors
        );

        eventRepository.save(event);
    }

    private boolean participanteValido(
            SymplaParticipantResponse dto
    ) {

        return dto != null
                && dto.id() != null
                && !dto.id().isBlank();
    }

    private boolean integrationPertenceAoEvento(
            ParticipantIntegration integration,
            Event event
    ) {

        if (
                integration.getParticipant() == null
                        || integration
                        .getParticipant()
                        .getEvent() == null
                        || integration
                        .getParticipant()
                        .getEvent()
                        .getId() == null
        ) {
            return false;
        }

        return integration
                .getParticipant()
                .getEvent()
                .getId()
                .equals(event.getId());
    }

    private record SessaoEscolhida(
            LocalDate date,
            LocalTime time
    ) {
    }
}