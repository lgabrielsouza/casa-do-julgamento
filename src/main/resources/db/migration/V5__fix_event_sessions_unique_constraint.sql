ALTER TABLE event_sessions
    DROP CONSTRAINT IF EXISTS uk_event_sessions_event_date_time;

CREATE UNIQUE INDEX uk_event_sessions_active_event_date_time
    ON event_sessions (event_id, date, start_time)
    WHERE active = TRUE;