package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.event.CreateEventRequest;
import br.org.casadojulgamento.api.dto.event.EventFilterRequest;
import br.org.casadojulgamento.api.dto.event.EventResponse;
import br.org.casadojulgamento.api.dto.event.UpdateEventRequest;
import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.enums.EventStatus;
import br.org.casadojulgamento.domain.specification.EventSpecification;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional
    public EventResponse criar(CreateEventRequest request) {
        validarIntervaloDeDatas(
                request.startDate(),
                request.endDate()
        );

        Event event = Event.builder()
                .name(normalizarTextoObrigatorio(request.name()))
                .description(normalizarTextoOpcional(request.description()))
                .city(normalizarTextoOpcional(request.city()))
                .state(normalizarEstado(request.state()))
                .venueName(normalizarTextoOpcional(request.venueName()))
                .address(normalizarTextoOpcional(request.address()))
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status(
                        request.status() != null
                                ? request.status()
                                : EventStatus.DRAFT
                )
                .pagTicketsUrl(
                        normalizarTextoOpcional(request.pagTicketsUrl())
                )
                .active(true)
                .build();

        Event eventSalvo = eventRepository.save(event);

        return toResponse(eventSalvo);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> listar(EventFilterRequest filter,Pageable pageable) {
        validarIntervaloDoFiltro(filter);

        EventFilterRequest filtroEfetivo = filter;

        if (filter == null || filter.active() == null) {
        filtroEfetivo = new EventFilterRequest(
                filter != null ? filter.name() : null,
                filter != null ? filter.city() : null,
                filter != null ? filter.state() : null,
                filter != null ? filter.status() : null,
                true,
                filter != null ? filter.startDateFrom() : null,
                filter != null ? filter.startDateTo() : null
        );
        }

        return eventRepository
                .findAll(
                        EventSpecification.withFilters(filtroEfetivo),
                        pageable
                )
                .map(this::toResponse);
        }

    @Transactional(readOnly = true)
    public EventResponse buscarPorId(Long id) {
        return toResponse(buscarEntidadeAtiva(id));
    }

    @Transactional
    public EventResponse atualizar(
            Long id,
            UpdateEventRequest request
    ) {
        Event event = buscarEntidadeAtiva(id);

        if (!event.getVersion().equals(request.version())) {
            throw new BusinessException(
                    "O evento foi alterado por outro usuário. Atualize a página e tente novamente."
            );
        }

        validarIntervaloDeDatas(
                request.startDate(),
                request.endDate()
        );

        event.setName(
                normalizarTextoObrigatorio(request.name())
        );

        event.setDescription(
                normalizarTextoOpcional(request.description())
        );

        event.setCity(
                normalizarTextoOpcional(request.city())
        );

        event.setState(
                normalizarEstado(request.state())
        );

        event.setVenueName(
                normalizarTextoOpcional(request.venueName())
        );

        event.setAddress(
                normalizarTextoOpcional(request.address())
        );

        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setStatus(request.status());

        event.setPagTicketsUrl(
                normalizarTextoOpcional(request.pagTicketsUrl())
        );

        try {
            Event eventAtualizado =
                    eventRepository.saveAndFlush(event);

            return toResponse(eventAtualizado);

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "O evento foi alterado por outro usuário. Atualize a página e tente novamente."
            );
        }
    }

    @Transactional
    public void desativar(Long id) {
        Event event = buscarEntidadeAtiva(id);

        event.setActive(false);

        try {
            eventRepository.saveAndFlush(event);

        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new BusinessException(
                    "O evento foi alterado por outro usuário. Atualize a página e tente novamente."
            );
        }
    }

    private Event buscarEntidadeAtiva(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Evento não encontrado."
                        )
                );

        if (!Boolean.TRUE.equals(event.getActive())) {
            throw new ResourceNotFoundException(
                    "Evento não encontrado."
            );
        }

        return event;
    }

    private void validarIntervaloDeDatas(
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (startDate == null || endDate == null) {
            return;
        }

        if (endDate.isBefore(startDate)) {
            throw new BusinessException(
                    "A data final não pode ser anterior à data inicial."
            );
        }
    }

    private void validarIntervaloDoFiltro(
            EventFilterRequest filter
    ) {
        if (filter == null) {
            return;
        }

        LocalDate startDateFrom = filter.startDateFrom();
        LocalDate startDateTo = filter.startDateTo();

        if (
                startDateFrom != null
                && startDateTo != null
                && startDateTo.isBefore(startDateFrom)
        ) {
            throw new BusinessException(
                    "A data final do filtro não pode ser anterior à data inicial."
            );
        }
    }

    private String normalizarTextoObrigatorio(String value) {
        return value.trim();
    }

    private String normalizarTextoOpcional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizarEstado(String state) {
        if (state == null || state.isBlank()) {
            return null;
        }

        return state
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getCity(),
                event.getState(),
                event.getVenueName(),
                event.getAddress(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStatus(),
                event.getPagTicketsUrl(),
                event.getActive(),
                event.getVersion(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}