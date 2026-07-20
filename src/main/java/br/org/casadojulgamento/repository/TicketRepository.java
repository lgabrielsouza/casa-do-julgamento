package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {}
