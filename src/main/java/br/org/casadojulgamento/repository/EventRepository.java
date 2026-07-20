package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {}
