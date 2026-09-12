package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.EventSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

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

    List<EventSession>
    findAllByEventIdAndActiveTrueOrderByDateAscStartTimeAsc(
            Long eventId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select es
            from EventSession es
            where es.id = :id
            """)
    Optional<EventSession> findByIdForUpdate(
            @Param("id") Long id
    );

    /*
     * Bloqueia todas as sessões envolvidas em uma movimentação
     * sempre na mesma ordem.
     *
     * Isso evita:
     *
     * 1. movimentação concorrente com liberação de grupo;
     * 2. duas movimentações disputando as mesmas sessões;
     * 3. deadlocks causados por ordem diferente de bloqueio.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select es
            from EventSession es
            where es.id in :ids
            order by es.id asc
            """)
    List<EventSession> findAllByIdInForUpdate(
            @Param("ids") List<Long> ids
    );
}