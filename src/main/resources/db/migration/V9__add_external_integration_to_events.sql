ALTER TABLE events
    ADD COLUMN external_provider VARCHAR(30),
    ADD COLUMN external_event_id VARCHAR(120);

ALTER TABLE events
    ADD CONSTRAINT ck_events_external_provider
        CHECK (
            external_provider IS NULL
            OR external_provider IN (
                'SYMPLA',
                'PAGTICKETS',
                'EVENTBRITE',
                'OTHER'
            )
        );

ALTER TABLE events
    ADD CONSTRAINT ck_events_external_integration_consistency
        CHECK (
            (
                external_provider IS NULL
                AND external_event_id IS NULL
            )
            OR
            (
                external_provider IS NOT NULL
                AND external_event_id IS NOT NULL
            )
        );

ALTER TABLE events
    ADD CONSTRAINT uk_events_external_provider_event
        UNIQUE (
            external_provider,
            external_event_id
        );

CREATE INDEX idx_events_external_provider
    ON events(external_provider);