package br.org.casadojulgamento.integration.sympla.service;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.integration.sympla.dto.SymplaIntegrationStatusResponse;
import br.org.casadojulgamento.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SymplaEventLinkService {

    private final EventRepository eventRepository;
    private final SymplaIntegrationStatusService symplaIntegrationStatusService;

    @Transactional
    public SymplaIntegrationStatusResponse vincular(
            Long eventId,
            String externalEventId
    ) {
        Event event = eventRepository.findById(eventId)
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

        String externalEventIdNormalizado =
                normalizarExternalEventId(externalEventId);

        eventRepository
                .findByExternalProviderAndExternalEventId(
                        IntegrationProvider.SYMPLA,
                        externalEventIdNormalizado
                )
                .filter(eventoExistente ->
                        !eventoExistente.getId().equals(eventId)
                )
                .ifPresent(eventoExistente -> {
                    throw new BusinessException(
                            "Este evento da Sympla já está vinculado a outro evento."
                    );
                });

        event.setExternalProvider(
                IntegrationProvider.SYMPLA
        );

        event.setExternalEventId(
                externalEventIdNormalizado
        );

        try {
            eventRepository.saveAndFlush(event);

        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(
                    "Este evento da Sympla já está vinculado a outro evento."
            );
        }

        return symplaIntegrationStatusService
                .buscarStatus(eventId);
    }

    private String normalizarExternalEventId(
            String externalEventId
    ) {
        if (
                externalEventId == null
                || externalEventId.isBlank()
        ) {
            throw new BusinessException(
                    "O ID do evento na Sympla é obrigatório."
            );
        }

        String valorNormalizado =
                externalEventId.trim();

        if (valorNormalizado.length() > 120) {
            throw new BusinessException(
                    "O ID do evento na Sympla deve possuir no máximo 120 caracteres."
            );
        }

        return valorNormalizado;
    }
}