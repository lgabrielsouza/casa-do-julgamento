package br.org.casadojulgamento.domain.specification;

import br.org.casadojulgamento.api.dto.participant.ParticipantFilterRequest;
import br.org.casadojulgamento.domain.entity.Participant;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class ParticipantSpecification {

    private ParticipantSpecification() {
    }

    public static Specification<Participant> withFilters(
            ParticipantFilterRequest filter
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return criteriaBuilder.conjunction();
            }

            if (filter.eventId() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("event").get("id"),
                                filter.eventId()
                        )
                );
            }

            if (filter.eventSessionId() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("eventSession").get("id"),
                                filter.eventSessionId()
                        )
                );
            }

            if (
                    filter.name() != null
                            && !filter.name().isBlank()
            ) {
                String name = "%"
                        + filter.name()
                                .trim()
                                .toLowerCase(Locale.ROOT)
                        + "%";

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("fullName")
                                ),
                                name
                        )
                );
            }

            if (
                    filter.phone() != null
                            && !filter.phone().isBlank()
            ) {
                String phone = "%"
                        + filter.phone().trim()
                        + "%";

                predicates.add(
                        criteriaBuilder.like(
                                root.get("phone"),
                                phone
                        )
                );
            }

            if (filter.source() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("source"),
                                filter.source()
                        )
                );
            }

            if (filter.status() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                filter.status()
                        )
                );
            }

            if (filter.active() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("active"),
                                filter.active()
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(Predicate[]::new)
            );
        };
    }
}