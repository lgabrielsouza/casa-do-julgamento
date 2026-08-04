package br.org.casadojulgamento.domain.entity;

import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participant_integrations",
        indexes = {
                @Index(
                        name = "idx_participant_integrations_participant_id",
                        columnList = "participant_id"
                ),
                @Index(
                        name = "idx_participant_integrations_provider",
                        columnList = "provider"
                ),
                @Index(
                        name = "idx_participant_integrations_external_order_id",
                        columnList = "provider, external_order_id"
                ),
                @Index(
                        name = "idx_participant_integrations_last_sync_at",
                        columnList = "last_sync_at"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_participant_integrations_provider_external_participant",
                        columnNames = {
                                "provider",
                                "external_participant_id"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_participant_integrations_provider_external_ticket",
                        columnNames = {
                                "provider",
                                "external_ticket_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "participant_id",
            nullable = false
    )
    private Participant participant;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private IntegrationProvider provider;

    @Column(
            name = "external_participant_id",
            nullable = false,
            length = 120
    )
    private String externalParticipantId;

    @Column(
            name = "external_ticket_id",
            length = 120
    )
    private String externalTicketId;

    @Column(
            name = "external_order_id",
            length = 120
    )
    private String externalOrderId;

    @Column(
            name = "ticket_status",
            length = 40
    )
    private String ticketStatus;

    @Column(
            name = "order_status",
            length = 40
    )
    private String orderStatus;

    @Column(
            name = "checked_in",
            nullable = false
    )
    private Boolean checkedIn;

    @Column(name = "external_updated_at")
    private LocalDateTime externalUpdatedAt;

    @Column(
            name = "last_sync_at",
            nullable = false
    )
    private LocalDateTime lastSyncAt;

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

    @Version
    @Column(nullable = false)
    private Long version;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (checkedIn == null) {
            checkedIn = false;
        }

        if (lastSyncAt == null) {
            lastSyncAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}