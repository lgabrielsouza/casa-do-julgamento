import EventoStatusBadge from './EventoStatusBadge'
import './EventoModals.css'

function formatarData(data) {
  if (!data) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(`${data}T00:00:00Z`))
}

function formatarDataHora(dataHora) {
  if (!dataHora) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dataHora))
}

export function EventoVisualizacaoModal({
  evento,
  onFechar,
}) {
  if (!evento) {
    return null
  }

  return (
    <div className="evento-modal-overlay">
      <div
        className="evento-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-details-title"
      >
        <div className="evento-modal-header">
          <div>
            <span>Detalhes do evento</span>

            <h2 id="evento-details-title">
              {evento.name}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onFechar}
            aria-label="Fechar detalhes"
          >
            ×
          </button>
        </div>

        <div className="evento-details-content">
          <div className="evento-details-status">
            <EventoStatusBadge status={evento.status} />

            <span>
              {evento.active
                ? 'Evento ativo'
                : 'Evento inativo'}
            </span>
          </div>

          <div className="evento-details-grid">
            <div>
              <span>Período</span>

              <strong>
                {formatarData(evento.startDate)} a{' '}
                {formatarData(evento.endDate)}
              </strong>
            </div>

            <div>
              <span>Cidade</span>

              <strong>
                {evento.city
                  ? `${evento.city}${
                      evento.state
                        ? ` - ${evento.state}`
                        : ''
                    }`
                  : '—'}
              </strong>
            </div>

            <div>
              <span>Local</span>
              <strong>{evento.venueName || '—'}</strong>
            </div>

            <div>
              <span>Endereço</span>
              <strong>{evento.address || '—'}</strong>
            </div>

            <div>
              <span>Criado em</span>

              <strong>
                {formatarDataHora(evento.createdAt)}
              </strong>
            </div>

            <div>
              <span>Última atualização</span>

              <strong>
                {formatarDataHora(evento.updatedAt)}
              </strong>
            </div>
          </div>

          <div className="evento-details-section">
            <span>Descrição</span>

            <p>
              {evento.description ||
                'Nenhuma descrição informada.'}
            </p>
          </div>

          <div className="evento-details-section">
            <span>PagTickets</span>

            {evento.pagTicketsUrl ? (
              <a
                href={evento.pagTicketsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir página do evento
              </a>
            ) : (
              <p>Nenhum link informado.</p>
            )}
          </div>
        </div>

        <div className="evento-details-actions">
          <button type="button" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export function EventoConfirmacaoModal({
  evento,
  erro,
  desativando,
  onCancelar,
  onConfirmar,
}) {
  if (!evento) {
    return null
  }

  return (
    <div className="evento-modal-overlay">
      <div
        className="evento-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-confirm-title"
      >
        <div className="evento-confirm-icon">!</div>

        <h2 id="evento-confirm-title">
          Desativar evento?
        </h2>

        <p>
          O evento <strong>{evento.name}</strong> deixará
          de aparecer na listagem de ativos. O registro
          continuará preservado no sistema.
        </p>

        {erro && (
          <div className="evento-form-error">
            {erro}
          </div>
        )}

        <div className="evento-confirm-actions">
          <button
            type="button"
            className="evento-cancel-button"
            onClick={onCancelar}
            disabled={desativando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="evento-danger-button"
            onClick={onConfirmar}
            disabled={desativando}
          >
            {desativando
              ? 'Desativando...'
              : 'Desativar evento'}
          </button>
        </div>
      </div>
    </div>
  )
}