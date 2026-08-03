package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.Participant;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ParticipantRepository
        extends JpaRepository<Participant, Long>,
        JpaSpecificationExecutor<Participant> {

    long countByEventSessionIdAndActiveTrueAndIdNot(
            Long eventSessionId,
            Long participantId
    );

    List<Participant>
    findAllByEventSessionIdAndActiveTrueAndStatusNotOrderByFullNameAsc(
            Long eventSessionId,
            ParticipantStatus status
    );
}