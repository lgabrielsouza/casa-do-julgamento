package br.org.casadojulgamento.integration.sympla.mapper;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import br.org.casadojulgamento.integration.sympla.dto.SymplaParticipantResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;

@Component
public class SymplaParticipantMapper {

    public Participant toParticipant(
            SymplaParticipantResponse dto,
            Event event
    ) {
        return Participant.builder()
                .event(event)
                .eventSession(null)
                .fullName(normalizarNome(dto.fullName()))
                .email(normalizarTexto(dto.email()))
                .phone(null)
                .source(ParticipantSource.SYMPLA)
                .status(obterStatusParticipante(dto))
                .arrivalStatus(
                        ParticipantArrivalStatus.NOT_ARRIVED
                )
                .arrivedAt(null)
                .notes(null)
                .active(true)
                .build();
    }

    public ParticipantIntegration toIntegration(
            Participant participant,
            SymplaParticipantResponse dto
    ) {
        return ParticipantIntegration.builder()
                .participant(participant)
                .provider(IntegrationProvider.SYMPLA)
                .externalParticipantId(
                        normalizarTexto(dto.id())
                )
                .externalTicketId(
                        normalizarTexto(dto.ticketNumber())
                )
                .externalOrderId(
                        normalizarTexto(dto.orderId())
                )
                .ticketStatus(
                        normalizarTexto(dto.ticketStatus())
                )
                .orderStatus(
                        normalizarTexto(dto.orderStatus())
                )
                .checkedIn(obterCheckin(dto))
                .lastSyncAt(LocalDateTime.now())
                .build();
    }

    public boolean atualizarDados(
            ParticipantIntegration integration,
            SymplaParticipantResponse dto
    ) {
        Participant participant =
                integration.getParticipant();

        boolean alterado = false;

        String novoNome =
                normalizarNome(dto.fullName());

        String novoEmail =
                normalizarTexto(dto.email());

        String novoTicketId =
                normalizarTexto(dto.ticketNumber());

        String novoOrderId =
                normalizarTexto(dto.orderId());

        String novoTicketStatus =
                normalizarTexto(dto.ticketStatus());

        String novoOrderStatus =
                normalizarTexto(dto.orderStatus());

        boolean novoCheckin =
                obterCheckin(dto);

        ParticipantStatus novoStatus =
                obterStatusParticipante(dto);

        /*
         * Nome e e-mail podem ser atualizados pela Sympla.
         * Telefone, sessão, chegada, observações e demais
         * informações operacionais continuam preservados.
         */

        if (
                novoNome != null
                        && !Objects.equals(
                                participant.getFullName(),
                                novoNome
                        )
        ) {
            participant.setFullName(novoNome);
            alterado = true;
        }

        if (
                novoEmail != null
                        && !Objects.equals(
                                participant.getEmail(),
                                novoEmail
                        )
        ) {
            participant.setEmail(novoEmail);
            alterado = true;
        }

        if (
                deveAtualizarStatusInterno(
                        participant,
                        novoStatus
                )
        ) {
            participant.setStatus(novoStatus);
            alterado = true;
        }

        if (
                !Objects.equals(
                        integration.getExternalTicketId(),
                        novoTicketId
                )
        ) {
            integration.setExternalTicketId(
                    novoTicketId
            );
            alterado = true;
        }

        if (
                !Objects.equals(
                        integration.getExternalOrderId(),
                        novoOrderId
                )
        ) {
            integration.setExternalOrderId(
                    novoOrderId
            );
            alterado = true;
        }

        if (
                !Objects.equals(
                        integration.getTicketStatus(),
                        novoTicketStatus
                )
        ) {
            integration.setTicketStatus(
                    novoTicketStatus
            );
            alterado = true;
        }

        if (
                !Objects.equals(
                        integration.getOrderStatus(),
                        novoOrderStatus
                )
        ) {
            integration.setOrderStatus(
                    novoOrderStatus
            );
            alterado = true;
        }

        if (
                !Objects.equals(
                        integration.getCheckedIn(),
                        novoCheckin
                )
        ) {
            integration.setCheckedIn(
                    novoCheckin
            );
            alterado = true;
        }

        integration.setLastSyncAt(
                LocalDateTime.now()
        );

        return alterado;
    }

    private boolean deveAtualizarStatusInterno(
            Participant participant,
            ParticipantStatus novoStatus
    ) {
        if (
                participant.getSource()
                        != ParticipantSource.SYMPLA
        ) {
            return false;
        }

        ParticipantStatus statusAtual =
                participant.getStatus();

        /*
         * Não sobrescrevemos estados operacionais que podem
         * ter sido definidos dentro da Casa do Julgamento.
         */
        if (
                statusAtual == ParticipantStatus.CONFIRMED
                        || statusAtual
                        == ParticipantStatus.NO_SHOW
        ) {
            return false;
        }

        return statusAtual != novoStatus;
    }

    private ParticipantStatus obterStatusParticipante(
            SymplaParticipantResponse dto
    ) {
        if (estaCancelado(dto)) {
            return ParticipantStatus.CANCELLED;
        }

        return ParticipantStatus.REGISTERED;
    }

    private boolean estaCancelado(
            SymplaParticipantResponse dto
    ) {
        return statusRepresentaCancelamento(
                dto.ticketStatus()
        ) || statusRepresentaCancelamento(
                dto.orderStatus()
        );
    }

    private boolean statusRepresentaCancelamento(
            String status
    ) {
        String normalizado =
                normalizarStatus(status);

        if (normalizado == null) {
            return false;
        }

        return normalizado.contains("CANCELLED")
                || normalizado.contains("CANCELED")
                || normalizado.contains("CANCELADO")
                || normalizado.contains("REFUNDED")
                || normalizado.contains("REFUND");
    }

    private String normalizarStatus(
            String valor
    ) {
        String texto = normalizarTexto(valor);

        return texto == null
                ? null
                : texto.toUpperCase(Locale.ROOT);
    }

    private boolean obterCheckin(
            SymplaParticipantResponse dto
    ) {
        return dto.checkin() != null
                && Boolean.TRUE.equals(
                        dto.checkin().checkIn()
                );
    }

    private String normalizarNome(
            String valor
    ) {
        String nome = normalizarTexto(valor);

        if (nome == null) {
            return "Participante sem nome";
        }

        return nome;
    }

        private String normalizarTexto(
                String valor
        ) {
        if (valor == null) {
                return null;
        }

        String normalizado = valor.trim();

        return normalizado.isEmpty()
                ? null
                : normalizado;
        }
}