package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Event;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface EventRepository
        extends JpaRepository<Event, Long>,
        JpaSpecificationExecutor<Event> {

    Optional<Event>
    findByExternalProviderAndExternalEventId(
            IntegrationProvider externalProvider,
            String externalEventId
    );
}