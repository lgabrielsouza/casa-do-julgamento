package br.org.casadojulgamento.repository;

import br.org.casadojulgamento.domain.entity.ParticipantGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantGroupMemberRepository
        extends JpaRepository<ParticipantGroupMember, Long> {

    List<ParticipantGroupMember>
    findAllByGroupIdAndActiveTrueOrderByJoinedAtAsc(
            Long groupId
    );

    Optional<ParticipantGroupMember>
    findByParticipantIdAndActiveTrue(
            Long participantId
    );

    boolean existsByParticipantIdAndActiveTrue(
            Long participantId
    );

    long countByGroupIdAndActiveTrue(
            Long groupId
    );

    List<ParticipantGroupMember>
    findAllByParticipantIdOrderByCreatedAtDesc(
            Long participantId
    );
}