package br.org.casadojulgamento.domain.specification;

import br.org.casadojulgamento.api.dto.reception.ReceptionParticipantFilterRequest;
import br.org.casadojulgamento.domain.entity.Participant;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class ReceptionParticipantSpecification {

    private ReceptionParticipantSpecification() {
    }

    public static Specification<Participant> withFilters(
            ReceptionParticipantFilterRequest filter
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(
                    criteriaBuilder.equal(
                            root.get("event").get("id"),
                            filter.eventId()
                    )
            );

            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get("active")
                    )
            );

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
                        + filter.phone()
                        .replaceAll("\\D", "")
                        + "%";

                predicates.add(
                        criteriaBuilder.like(
                                root.get("phone"),
                                phone
                        )
                );
            }

            if (filter.arrivalStatus() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("arrivalStatus"),
                                filter.arrivalStatus()
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(Predicate[]::new)
            );
        };
    }
}