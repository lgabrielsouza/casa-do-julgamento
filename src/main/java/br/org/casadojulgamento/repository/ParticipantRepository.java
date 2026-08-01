package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ParticipantRepository
        extends JpaRepository<Participant, Long>,
                JpaSpecificationExecutor<Participant> {

    long countByEventSessionIdAndActiveTrueAndIdNot(
            Long eventSessionId,
            Long participantId
    );
}