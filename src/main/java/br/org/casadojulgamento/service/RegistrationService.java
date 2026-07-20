package br.org.casadojulgamento.service;

import br.org.casadojulgamento.api.dto.CreateRegistrationRequest;
import br.org.casadojulgamento.api.dto.RegistrationResponse;
import br.org.casadojulgamento.domain.entity.*;
import br.org.casadojulgamento.domain.enums.RegistrationStatus;
import br.org.casadojulgamento.domain.enums.RegistrationType;
import br.org.casadojulgamento.exception.BusinessException;
import br.org.casadojulgamento.exception.ResourceNotFoundException;
import br.org.casadojulgamento.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final EventRepository eventRepository;
    private final EventSessionRepository eventSessionRepository;
    private final RegistrationRepository registrationRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public RegistrationResponse create(CreateRegistrationRequest request) {
        Event event = eventRepository.findById(request.eventId())
            .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));

        EventSession session = eventSessionRepository.findById(request.eventSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada."));

        if (!session.getEvent().getId().equals(event.getId())) {
            throw new BusinessException("A sessão informada não pertence ao evento selecionado.");
        }

        if (!session.isRegistrationOpen()) {
            throw new BusinessException("As inscrições para esta sessão estão fechadas.");
        }

        if (registrationRepository.existsByEventIdAndCpf(event.getId(), request.cpf())) {
            throw new BusinessException("Já existe uma inscrição para este CPF neste evento.");
        }

        if (request.type() == RegistrationType.STAFF &&
            (request.serviceArea() == null || request.serviceArea().isBlank())) {
            throw new BusinessException("A área de serviço é obrigatória para inscrições de Staff.");
        }

        Registration registration = Registration.builder()
            .event(event)
            .eventSession(session)
            .fullName(request.fullName().trim())
            .email(request.email().trim().toLowerCase())
            .cpf(request.cpf())
            .phone(request.phone().trim())
            .type(request.type())
            .serviceArea(request.type() == RegistrationType.STAFF ? request.serviceArea().trim() : null)
            .status(RegistrationStatus.CONFIRMED)
            .build();

        registration = registrationRepository.save(registration);

        Ticket ticket = Ticket.builder()
            .registration(registration)
            .qrToken(UUID.randomUUID().toString())
            .status("ACTIVE")
            .build();

        ticket = ticketRepository.save(ticket);

        return new RegistrationResponse(
            registration.getId(),
            registration.getFullName(),
            registration.getEmail(),
            registration.getCpf(),
            registration.getPhone(),
            registration.getType(),
            registration.getServiceArea(),
            registration.getStatus(),
            ticket.getQrToken()
        );
    }
}
