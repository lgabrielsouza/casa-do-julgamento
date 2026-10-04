/*
 * Casa do Julgamento
 *
 * Regra operacional:
 * 1 sessão do evento = 1 grupo.
 *
 * A capacidade pertence à própria EventSession.
 */

ALTER TABLE participant_groups
    DROP CONSTRAINT IF EXISTS
        uk_participant_groups_session_number;

DROP INDEX IF EXISTS
    uk_participant_groups_session_number;

/*
 * Como ainda estamos no início da funcionalidade
 * e não existem grupos operacionais em produção,
 * group_number deixa de fazer parte do modelo.
 */
ALTER TABLE participant_groups
    DROP COLUMN IF EXISTS group_number;

ALTER TABLE participant_groups
    DROP COLUMN IF EXISTS capacity;

/*
 * Uma sessão pode possuir no máximo um grupo.
 */
ALTER TABLE participant_groups
    ADD CONSTRAINT uk_participant_groups_session
        UNIQUE (event_session_id);