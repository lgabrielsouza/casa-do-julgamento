ALTER TABLE participants
    ADD COLUMN arrival_status VARCHAR(30) NOT NULL DEFAULT 'NOT_ARRIVED',
    ADD COLUMN arrived_at TIMESTAMP;

ALTER TABLE participants
    ADD CONSTRAINT ck_participants_arrival_status
        CHECK (
            arrival_status IN (
                'NOT_ARRIVED',
                'ARRIVED',
                'READY_FOR_GROUP'
            )
        );

ALTER TABLE participants
    ADD CONSTRAINT ck_participants_arrived_at_consistency
        CHECK (
            (
                arrival_status = 'NOT_ARRIVED'
                AND arrived_at IS NULL
            )
            OR
            (
                arrival_status IN (
                    'ARRIVED',
                    'READY_FOR_GROUP'
                )
                AND arrived_at IS NOT NULL
            )
        );

CREATE INDEX idx_participants_arrival_status
    ON participants(arrival_status);

CREATE INDEX idx_participants_event_arrival_status
    ON participants(event_id, arrival_status);