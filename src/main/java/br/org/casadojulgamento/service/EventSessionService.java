package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.session.CreateEventSessionRequest;
import br.org.casadojulgamento.api.dto.session.EventSessionFilterRequest;
import br.org.casadojulgamento.api.dto.session.EventSessionResponse;
import br.org.casadojulgamento.api.dto.session.GenerateEventSessionsRequest;
import br.org.casadojulgamento.api.dto.session.UpdateEventSessionRequest;
import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.EventSession;
import br.org.casadojulgamento.domain.enums.EventSessionStatus;
import br.org.casadojulgamento.domain.specification.EventSessionSpecification;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventRepository;
import br.org.casadojulgamento.repository.EventSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventSessionService {

    private static final int MAX_SESSIONS_PER_GENERATION = 1000;

    private final EventSessionRepository sessionRepository;
    private final EventRepository eventRepository;

    @Transactional
    public EventSessionResponse criar(
            CreateEventSessionRequest request
    ) {
        Event event = buscarEventoAtivo(request.eventId());

        validarDataDentroDoEvento(
                request.date(),
                event
        );

        validarDuplicidadeNaCriacao(
                event.getId(),
                request.date(),
                request.startTime()
        );

        EventSession session = EventSession.builder()
                .event(event)
                .date(request.date())
                .startTime(request.startTime())
                .capacity(request.capacity())
                .status(
                        request.status() != null
                                ? request.status()
                                : EventSessionStatus.PLANNED
                )
                .active(true)
                .build();

        try {
            EventSession sessionSalva =
                    sessionRepository.saveAndFlush(session);

            return toResponse(sessionSalva);

        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(
                    "Já existe uma sessão ativa para este evento, data e horário."
            );
        }
    }

    @Transactional
    public List<EventSessionResponse> gerar(
            GenerateEventSessionsRequest request
    ) {
        Event event = buscarEventoAtivo(request.eventId());

        validarParametrosDaGeracao(request, event);

        List<SessionKey> horariosSolicitados =
                montarHorariosDaGeracao(request);

        if (horariosSolicitados.isEmpty()) {
            throw new BusinessException(
                    "Nenhuma sessão foi gerada para os dias da semana selecionados."
            );
        }

        if (horariosSolicitados.size() > MAX_SESSIONS_PER_GENERATION) {
            throw new BusinessException(
                    "A geração está limitada a "
                            + MAX_SESSIONS_PER_GENERATION
                            + " sessões por operação."
            );
        }

        validarConflitosExistentes(
                event.getId(),
                request.startDate(),
                request.endDate(),
                horariosSolicitados
        );

        List<EventSession> sessoes = horariosSolicitados.stream()
                .map(horario ->
                        EventSession.builder()
                                .event(event)
                                .date(horario.date())
                                .startTime(horario.startTime())
                                .capacity(request.capacity())
                                .status(request.status())
                                .active(true)
                                .build()
                )
                .toList();

        try {
            return sessionRepository
                    .saveAllAndFlush(sessoes)
                    .stream()
                    .map(this::toResponse)
                    .toList();

        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(
                    "Uma ou mais sessões já foram criadas por outro usuário. "
                            + "Nenhuma sessão desta operação foi salva."
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<EventSessionResponse> listar(
            EventSessionFilterRequest filter,
            Pageable pageable
    ) {
        EventSessionFilterRequest filtroEfetivo = filter;

        if (filter == null || filter.active() == null) {
            filtroEfetivo = new EventSessionFilterRequest(
                    filter != null ? filter.eventId() : null,
                    filter != null ? filter.date() : null,
                    filter != null ? filter.status() : null,
                    true
            );
        }

        return sessionRepository
                .findAll(
                        EventSessionSpecification.withFilters(
                                filtroEfetivo
                        ),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public EventSessionResponse buscarPorId(Long id) {
        return toResponse(buscarSessaoAtiva(id));
    }

    @Transactional
    public EventSessionResponse atualizar(
            Long id,
            UpdateEventSessionRequest request
    ) {
        EventSession session = buscarSessaoAtiva(id);

        if (!session.getVersion().equals(request.version())) {
            throw new BusinessException(
                    "A sessão foi alterada por outro usuário. "
                            + "Atualize a página e tente novamente."
            );
        }

        Event event = session.getEvent();

        validarEventoAtivo(event);

        validarDataDentroDoEvento(
                request.date(),
                event
        );

        validarDuplicidadeNaAtualizacao(
                event.getId(),
                request.date(),
                request.startTime(),
                session.getId()
        );

        session.setDate(request.date());
        session.setStartTime(request.startTime());
        session.setCapacity(request.capacity());
        session.setStatus(request.status());

        try {
            EventSession sessionAtualizada =
                    sessionRepository.saveAndFlush(session);

            return toResponse(sessionAtualizada);

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "A sessão foi alterada por outro usuário. "
                            + "Atualize a página e tente novamente."
            );

        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(
                    "Já existe uma sessão ativa para este evento, data e horário."
            );
        }
    }

    @Transactional
    public void desativar(Long id) {
        EventSession session = buscarSessaoAtiva(id);

        session.setActive(false);

        try {
            sessionRepository.saveAndFlush(session);

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "A sessão foi alterada por outro usuário. "
                            + "Atualize a página e tente novamente."
            );
        }
    }

    private void validarParametrosDaGeracao(
            GenerateEventSessionsRequest request,
            Event event
    ) {
        if (request.startDate().isAfter(request.endDate())) {
            throw new BusinessException(
                    "A data inicial não pode ser posterior à data final."
            );
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new BusinessException(
                    "O horário inicial deve ser anterior ao horário final."
            );
        }

        validarDataDentroDoEvento(
                request.startDate(),
                event
        );

        validarDataDentroDoEvento(
                request.endDate(),
                event
        );
    }

    private List<SessionKey> montarHorariosDaGeracao(
            GenerateEventSessionsRequest request
    ) {
        List<SessionKey> horarios = new ArrayList<>();

        Set<DayOfWeek> diasSelecionados =
                request.weekdays() == null
                        ? Set.of()
                        : request.weekdays();

        LocalDate dataAtual = request.startDate();

        while (!dataAtual.isAfter(request.endDate())) {

            boolean gerarNesteDia =
                    diasSelecionados.isEmpty()
                            || diasSelecionados.contains(
                                    dataAtual.getDayOfWeek()
                            );

            if (gerarNesteDia) {
                LocalTime horarioAtual = request.startTime();

                while (horarioAtual.isBefore(request.endTime())) {
                    horarios.add(
                            new SessionKey(
                                    dataAtual,
                                    horarioAtual
                            )
                    );

                    horarioAtual = horarioAtual.plusMinutes(
                            request.intervalMinutes()
                    );
                }
            }

            dataAtual = dataAtual.plusDays(1);
        }

        return horarios;
    }

    private void validarConflitosExistentes(
            Long eventId,
            LocalDate startDate,
            LocalDate endDate,
            List<SessionKey> horariosSolicitados
    ) {
        List<EventSession> sessoesExistentes =
                sessionRepository
                        .findAllByEventIdAndDateBetweenAndActiveTrue(
                                eventId,
                                startDate,
                                endDate
                        );

        Set<SessionKey> horariosExistentes = new HashSet<>();

        for (EventSession session : sessoesExistentes) {
            horariosExistentes.add(
                    new SessionKey(
                            session.getDate(),
                            session.getStartTime()
                    )
            );
        }

        for (SessionKey horario : horariosSolicitados) {
            if (horariosExistentes.contains(horario)) {
                throw new BusinessException(
                        "Já existe uma sessão ativa em "
                                + horario.date()
                                + " às "
                                + horario.startTime()
                                + ". Nenhuma sessão foi criada."
                );
            }
        }
    }

    private Event buscarEventoAtivo(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Evento não encontrado."
                        )
                );

        validarEventoAtivo(event);

        return event;
    }

    private void validarEventoAtivo(Event event) {
        if (!Boolean.TRUE.equals(event.getActive())) {
            throw new ResourceNotFoundException(
                    "Evento não encontrado."
            );
        }
    }

    private EventSession buscarSessaoAtiva(Long id) {
        EventSession session = sessionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sessão não encontrada."
                        )
                );

        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new ResourceNotFoundException(
                    "Sessão não encontrada."
            );
        }

        return session;
    }

    private void validarDataDentroDoEvento(
            LocalDate sessionDate,
            Event event
    ) {
        if (sessionDate == null) {
            return;
        }

        if (
                sessionDate.isBefore(event.getStartDate())
                        || sessionDate.isAfter(event.getEndDate())
        ) {
            throw new BusinessException(
                    "A data da sessão deve estar dentro do período do evento."
            );
        }
    }

    private void validarDuplicidadeNaCriacao(
            Long eventId,
            LocalDate date,
            LocalTime startTime
    ) {
        boolean existe =
                sessionRepository
                        .existsByEventIdAndDateAndStartTimeAndActiveTrue(
                                eventId,
                                date,
                                startTime
                        );

        if (existe) {
            throw new BusinessException(
                    "Já existe uma sessão ativa para este evento, data e horário."
            );
        }
    }

    private void validarDuplicidadeNaAtualizacao(
            Long eventId,
            LocalDate date,
            LocalTime startTime,
            Long sessionId
    ) {
        boolean existe =
                sessionRepository
                        .existsByEventIdAndDateAndStartTimeAndActiveTrueAndIdNot(
                                eventId,
                                date,
                                startTime,
                                sessionId
                        );

        if (existe) {
            throw new BusinessException(
                    "Já existe uma sessão ativa para este evento, data e horário."
            );
        }
    }

    private EventSessionResponse toResponse(
            EventSession session
    ) {
        return new EventSessionResponse(
                session.getId(),
                session.getEvent().getId(),
                session.getEvent().getName(),
                session.getDate(),
                session.getStartTime(),
                session.getCapacity(),
                session.getStatus(),
                session.getActive(),
                session.getVersion(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }

    private record SessionKey(
            LocalDate date,
            LocalTime startTime
    ) {
    }
}