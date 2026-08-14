ALTER TABLE participants
    ADD COLUMN original_event_session_id BIGINT;

ALTER TABLE participants
    ADD CONSTRAINT fk_participants_original_event_session
        FOREIGN KEY (original_event_session_id)
        REFERENCES event_sessions(id);

/*
 * Para participantes já existentes que possuem sessão,
 * a sessão atual passa inicialmente a ser considerada
 * também a sessão original.
 */
UPDATE participants
SET original_event_session_id = event_session_id
WHERE event_session_id IS NOT NULL;

CREATE INDEX idx_participants_original_event_session_id
    ON participants(original_event_session_id);