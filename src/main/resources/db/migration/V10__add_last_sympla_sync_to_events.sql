ALTER TABLE events
    ADD COLUMN last_integration_sync_at TIMESTAMP,

    ADD COLUMN last_integration_total_found INTEGER NOT NULL DEFAULT 0,

    ADD COLUMN last_integration_created INTEGER NOT NULL DEFAULT 0,

    ADD COLUMN last_integration_updated INTEGER NOT NULL DEFAULT 0,

    ADD COLUMN last_integration_ignored INTEGER NOT NULL DEFAULT 0,

    ADD COLUMN last_integration_errors INTEGER NOT NULL DEFAULT 0;