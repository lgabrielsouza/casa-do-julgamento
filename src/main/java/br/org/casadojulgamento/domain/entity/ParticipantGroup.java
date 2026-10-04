package br.org.casadojulgamento.domain.entity;

import br.org.casadojulgamento.domain.enums.ParticipantGroupStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participant_groups",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_participant_groups_session",
                        columnNames = "event_session_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_participant_groups_session_id",
                        columnList = "event_session_id"
                ),
                @Index(
                        name = "idx_participant_groups_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_participant_groups_active",
                        columnList = "active"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "event_session_id",
            nullable = false,
            unique = true
    )
    private EventSession eventSession;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ParticipantGroupStatus status;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

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
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ParticipantGroupStatus.FORMING;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}