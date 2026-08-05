package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EventRepository
        extends JpaRepository<Event, Long>,
        JpaSpecificationExecutor<Event> {

    Optional<Event>
    findByExternalProviderAndExternalEventId(
            IntegrationProvider externalProvider,
            String externalEventId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT e
            FROM Event e
            WHERE e.id = :eventId
            """)
    Optional<Event> findByIdForIntegrationSync(
            @Param("eventId") Long eventId
    );
}