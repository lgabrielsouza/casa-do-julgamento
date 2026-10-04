package br.org.casadojulgamento.domain.specification;

import br.org.casadojulgamento.api.dto.event.EventFilterRequest;
import br.org.casadojulgamento.domain.entity.Event;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class EventSpecification {

    private EventSpecification() {
    }

    public static Specification<Event> withFilters(
            EventFilterRequest filter
    ) {
        Specification<Event> specification =
                Specification.where(null);

        if (filter == null) {
            return specification;
        }

        if (hasText(filter.name())) {
            String normalizedName = normalize(filter.name());

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(
                                            root.get("name")
                                    ),
                                    "%" + normalizedName + "%"
                            )
            );
        }

        if (hasText(filter.city())) {
            String normalizedCity = normalize(filter.city());

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    criteriaBuilder.lower(
                                            root.get("city")
                                    ),
                                    normalizedCity
                            )
            );
        }

        if (hasText(filter.state())) {
            String normalizedState = filter.state()
                    .trim()
                    .toUpperCase(Locale.ROOT);

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    criteriaBuilder.upper(
                                            root.get("state")
                                    ),
                                    normalizedState
                            )
            );
        }

        if (filter.status() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("status"),
                                    filter.status()
                            )
            );
        }

        if (filter.active() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("active"),
                                    filter.active()
                            )
            );
        }

        if (filter.startDateFrom() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.greaterThanOrEqualTo(
                                    root.get("startDate"),
                                    filter.startDateFrom()
                            )
            );
        }

        if (filter.startDateTo() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.lessThanOrEqualTo(
                                    root.get("startDate"),
                                    filter.startDateTo()
                            )
            );
        }

        return specification;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String normalize(String value) {
        return value
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}