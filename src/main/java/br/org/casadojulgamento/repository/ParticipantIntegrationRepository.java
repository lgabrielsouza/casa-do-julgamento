package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.ParticipantIntegration;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantIntegrationRepository
        extends JpaRepository<
                ParticipantIntegration,
                Long
        > {

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
}