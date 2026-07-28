ALTER TABLE event_sessions
    DROP COLUMN end_time,
    DROP COLUMN registration_open;

ALTER TABLE event_sessions
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE event_sessions
    ADD CONSTRAINT ck_event_sessions_capacity_positive
        CHECK (capacity > 0);

ALTER TABLE event_sessions
    ADD CONSTRAINT uk_event_sessions_event_date_time
        UNIQUE (event_id, date, start_time);

CREATE INDEX idx_event_sessions_event_id
    ON event_sessions(event_id);

CREATE INDEX idx_event_sessions_date_start_time
    ON event_sessions(date, start_time);

CREATE INDEX idx_event_sessions_active
    ON event_sessions(active);