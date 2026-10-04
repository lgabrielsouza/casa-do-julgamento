package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.ParticipantGroup;
import br.org.casadojulgamento.domain.enums.ParticipantGroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantGroupRepository
        extends JpaRepository<ParticipantGroup, Long> {

    Optional<ParticipantGroup>
    findByEventSessionId(
            Long eventSessionId
    );

    Optional<ParticipantGroup>
    findByEventSessionIdAndActiveTrue(
            Long eventSessionId
    );

    boolean existsByEventSessionId(
            Long eventSessionId
    );

    List<ParticipantGroup>
    findAllByStatusAndActiveTrue(
            ParticipantGroupStatus status
    );
}