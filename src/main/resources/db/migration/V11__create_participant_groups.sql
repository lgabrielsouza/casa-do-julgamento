CREATE TABLE participant_groups (
    id BIGSERIAL PRIMARY KEY,

    event_session_id BIGINT NOT NULL,

    group_number INTEGER NOT NULL,

    capacity INTEGER NOT NULL,

    status VARCHAR(30) NOT NULL,

    released_at TIMESTAMP,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_participant_groups_session
        FOREIGN KEY (event_session_id)
        REFERENCES event_sessions(id),

    CONSTRAINT uk_participant_groups_session_number
        UNIQUE (event_session_id, group_number),

    CONSTRAINT ck_participant_groups_capacity
        CHECK (capacity > 0),

    CONSTRAINT ck_participant_groups_status
        CHECK (
            status IN (
                'FORMING',
                'READY',
                'RELEASED',
                'CANCELLED'
            )
        ),

    CONSTRAINT ck_participant_groups_released_at
        CHECK (
            (
                status = 'RELEASED'
                AND released_at IS NOT NULL
            )
            OR
            (
                status <> 'RELEASED'
                AND released_at IS NULL
            )
        )
);

CREATE INDEX idx_participant_groups_session_id
    ON participant_groups(event_session_id);

CREATE INDEX idx_participant_groups_status
    ON participant_groups(status);

CREATE INDEX idx_participant_groups_active
    ON participant_groups(active);


CREATE TABLE participant_group_members (
    id BIGSERIAL PRIMARY KEY,

    group_id BIGINT NOT NULL,

    participant_id BIGINT NOT NULL,

    joined_at TIMESTAMP NOT NULL,

    removed_at TIMESTAMP,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id)
        REFERENCES participant_groups(id),

    CONSTRAINT fk_group_members_participant
        FOREIGN KEY (participant_id)
        REFERENCES participants(id),

    CONSTRAINT ck_group_members_removed_at
        CHECK (
            (
                active = TRUE
                AND removed_at IS NULL
            )
            OR
            (
                active = FALSE
                AND removed_at IS NOT NULL
            )
        )
);

CREATE INDEX idx_group_members_group_id
    ON participant_group_members(group_id);

CREATE INDEX idx_group_members_participant_id
    ON participant_group_members(participant_id);

CREATE INDEX idx_group_members_active
    ON participant_group_members(active);

/*
 * Garante que um participante não possa
 * estar ativo em mais de um grupo ao mesmo tempo.
 */
CREATE UNIQUE INDEX uk_group_members_active_participant
    ON participant_group_members(participant_id)
    WHERE active = TRUE;