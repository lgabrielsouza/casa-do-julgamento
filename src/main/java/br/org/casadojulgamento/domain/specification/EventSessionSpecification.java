package br.org.casadojulgamento.domain.specification;

import br.org.casadojulgamento.api.dto.session.EventSessionFilterRequest;
import br.org.casadojulgamento.domain.entity.EventSession;
import org.springframework.data.jpa.domain.Specification;

public final class EventSessionSpecification {

    private EventSessionSpecification() {
    }

    public static Specification<EventSession> withFilters(
            EventSessionFilterRequest filter
    ) {
        Specification<EventSession> specification =
                Specification.where(null);

        if (filter == null) {
            return specification;
        }

        if (filter.eventId() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("event").get("id"),
                                    filter.eventId()
                            )
            );
        }

        if (filter.date() != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("date"),
                                    filter.date()
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

        return specification;
    }
}