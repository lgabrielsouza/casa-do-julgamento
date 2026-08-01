package br.org.casadojulgamento.domain.entity;

import br.org.casadojulgamento.domain.enums.ParticipantArrivalStatus;
import br.org.casadojulgamento.domain.enums.ParticipantSource;
import br.org.casadojulgamento.domain.enums.ParticipantStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participants",
        indexes = {
                @Index(
                        name = "idx_participants_event_id",
                        columnList = "event_id"
                ),
                @Index(
                        name = "idx_participants_event_session_id",
                        columnList = "event_session_id"
                ),
                @Index(
                        name = "idx_participants_full_name",
                        columnList = "full_name"
                ),
                @Index(
                        name = "idx_participants_phone",
                        columnList = "phone"
                ),
                @Index(
                        name = "idx_participants_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_participants_active",
                        columnList = "active"
                ),
                @Index(
                        name = "idx_participants_arrival_status",
                        columnList = "arrival_status"
                ),
                @Index(
                        name = "idx_participants_event_arrival_status",
                        columnList = "event_id, arrival_status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "event_id",
            nullable = false
    )
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_session_id")
    private EventSession eventSession;

    @Column(
            name = "full_name",
            nullable = false,
            length = 150
    )
    private String fullName;

    @Column(length = 180)
    private String email;

    @Column(
            nullable = false,
            length = 20
    )
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ParticipantSource source;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ParticipantStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "arrival_status",
            nullable = false,
            length = 30
    )
    private ParticipantArrivalStatus arrivalStatus;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean active;

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
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (source == null) {
            source = ParticipantSource.MANUAL;
        }

        if (status == null) {
            status = ParticipantStatus.REGISTERED;
        }

        if (arrivalStatus == null) {
            arrivalStatus =
                    ParticipantArrivalStatus.NOT_ARRIVED;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}