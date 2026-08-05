package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParticipantIntegrationRepository
        extends JpaRepository<ParticipantIntegration, Long> {

    Optional<ParticipantIntegration>
    findByProviderAndExternalParticipantId(
            IntegrationProvider provider,
            String externalParticipantId
    );

    Optional<ParticipantIntegration>
    findByProviderAndExternalTicketId(
            IntegrationProvider provider,
            String externalTicketId
    );

    List<ParticipantIntegration>
    findAllByParticipantId(
            Long participantId
    );

    boolean existsByProviderAndExternalParticipantId(
            IntegrationProvider provider,
            String externalParticipantId
    );

    @Query("""
            SELECT COUNT(pi)
            FROM ParticipantIntegration pi
            JOIN pi.participant p
            JOIN p.event e
            WHERE pi.provider = :provider
              AND e.id = :eventId
            """)
    long countSynchronizedParticipantsByEvent(
            @Param("provider")
            IntegrationProvider provider,

            @Param("eventId")
            Long eventId
    );
}