package br.org.casadojulgamento.domain.entity;

import br.org.casadojulgamento.domain.enums.EventSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "event_sessions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_sessions_event_date_time",
                        columnNames = {
                                "event_id",
                                "date",
                                "start_time"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_event_sessions_event_id",
                        columnList = "event_id"
                ),
                @Index(
                        name = "idx_event_sessions_date_start_time",
                        columnList = "date, start_time"
                ),
                @Index(
                        name = "idx_event_sessions_active",
                        columnList = "active"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSession {

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

    @Column(nullable = false)
    private LocalDate date;

    @Column(
            name = "start_time",
            nullable = false
    )
    private LocalTime startTime;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private EventSessionStatus status;

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
        LocalDateTime agora = LocalDateTime.now();

        createdAt = agora;
        updatedAt = agora;

        if (active == null) {
            active = true;
        }

        if (status == null) {
            status = EventSessionStatus.PLANNED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}