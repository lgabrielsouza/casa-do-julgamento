package br.org.casadojulgamento.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participant_group_members",
        indexes = {
                @Index(
                        name = "idx_group_members_group_id",
                        columnList = "group_id"
                ),
                @Index(
                        name = "idx_group_members_participant_id",
                        columnList = "participant_id"
                ),
                @Index(
                        name = "idx_group_members_active",
                        columnList = "active"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantGroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "group_id",
            nullable = false
    )
    private ParticipantGroup group;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "participant_id",
            nullable = false
    )
    private Participant participant;

    @Column(
            name = "joined_at",
            nullable = false
    )
    private LocalDateTime joinedAt;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (joinedAt == null) {
            joinedAt = now;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }
}