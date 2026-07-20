package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventSessionRepository extends JpaRepository<EventSession, Long> {}
