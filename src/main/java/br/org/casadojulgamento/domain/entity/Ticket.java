package br.org.casadojulgamento.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "tickets",
    indexes = @Index(name = "idx_ticket_qr_token", columnList = "qr_token"),
    uniqueConstraints = @UniqueConstraint(name = "uk_ticket_qr_token", columnNames = "qr_token")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    @Column(name = "qr_token", nullable = false, length = 36)
    private String qrToken;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false, length = 30)
    private String status;

    @PrePersist
    void onCreate() {
        if (issuedAt == null) issuedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }
}
