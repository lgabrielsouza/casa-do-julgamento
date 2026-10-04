package br.org.casadojulgamento.domain.entity;

import br.org.casadojulgamento.domain.enums.EventStatus;
import br.org.casadojulgamento.domain.enums.IntegrationProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "events",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_events_external_provider_event",
                        columnNames = {
                                "external_provider",
                                "external_event_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(name = "venue_name", length = 150)
    private String venueName;

    @Column(length = 255)
    private String address;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EventStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "external_provider",
            length = 30
    )
    private IntegrationProvider externalProvider;

    @Column(
            name = "external_event_id",
            length = 120
    )
    private String externalEventId;

    @Column(name = "pag_tickets_url", length = 500)
    private String pagTicketsUrl;

    @Column(name = "last_integration_sync_at")
    private LocalDateTime lastIntegrationSyncAt;

    @Column(
            name = "last_integration_total_found",
            nullable = false
    )
    private Integer lastIntegrationTotalFound;

    @Column(
            name = "last_integration_created",
            nullable = false
    )
    private Integer lastIntegrationCreated;

    @Column(
            name = "last_integration_updated",
            nullable = false
    )
    private Integer lastIntegrationUpdated;

    @Column(
            name = "last_integration_ignored",
            nullable = false
    )
    private Integer lastIntegrationIgnored;

    @Column(
            name = "last_integration_errors",
            nullable = false
    )
    private Integer lastIntegrationErrors;

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

        if (status == null) {
            status = EventStatus.DRAFT;
        }

        if (lastIntegrationTotalFound == null) {
            lastIntegrationTotalFound = 0;
        }

        if (lastIntegrationCreated == null) {
            lastIntegrationCreated = 0;
        }

        if (lastIntegrationUpdated == null) {
            lastIntegrationUpdated = 0;
        }

        if (lastIntegrationIgnored == null) {
            lastIntegrationIgnored = 0;
        }

        if (lastIntegrationErrors == null) {
            lastIntegrationErrors = 0;
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