package br.org.casadojulgamento.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "check_ins",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_checkin_registration",
        columnNames = "registration_id"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    @Column(name = "checked_in_at", nullable = false)
    private LocalDateTime checkedInAt;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "device_identifier", length = 120)
    private String deviceIdentifier;
}
