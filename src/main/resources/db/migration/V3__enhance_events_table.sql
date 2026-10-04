ALTER TABLE events
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN state VARCHAR(2),
    ADD COLUMN venue_name VARCHAR(150),
    ADD COLUMN address VARCHAR(255),
    ADD COLUMN pag_tickets_url VARCHAR(500),
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE events
    ADD CONSTRAINT ck_events_date_range
        CHECK (end_date >= start_date);

ALTER TABLE events
    ADD CONSTRAINT ck_events_state_length
        CHECK (state IS NULL OR char_length(state) = 2);

CREATE INDEX idx_events_status
    ON events(status);

CREATE INDEX idx_events_active
    ON events(active);

CREATE INDEX idx_events_start_date
    ON events(start_date);