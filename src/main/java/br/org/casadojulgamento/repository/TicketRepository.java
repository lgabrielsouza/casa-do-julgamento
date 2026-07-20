package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository
    extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByQrToken(String qrToken);
}