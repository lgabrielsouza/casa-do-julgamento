package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.EventSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;

public interface EventSessionRepository
        extends JpaRepository<EventSession, Long>,
                JpaSpecificationExecutor<EventSession> {

    boolean existsByEventIdAndDateAndStartTimeAndActiveTrue(
            Long eventId,
            LocalDate date,
            LocalTime startTime
    );

        boolean existsByEventIdAndDateAndStartTimeAndActiveTrueAndIdNot(
                Long eventId,
                LocalDate date,
                LocalTime startTime,
                Long id
        );
    List<EventSession> findAllByEventIdAndDateBetweenAndActiveTrue(
        Long eventId,
        LocalDate startDate,
        LocalDate endDate
    );
}