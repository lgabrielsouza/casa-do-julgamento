const STATUS_CONFIG = {
  DRAFT: {
    label: 'Rascunho',
    className: 'rascunho',
  },
  PLANNING: {
    label: 'Planejamento',
    className: 'planejamento',
  },
  PUBLISHED: {
    label: 'Publicado',
    className: 'publicado',
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    className: 'andamento',
  },
  FINISHED: {
    label: 'Encerrado',
    className: 'encerrado',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'cancelado',
  },
}

function EventoStatusBadge({ status }) {
  const configuracao = STATUS_CONFIG[status] || {
    label: status || 'Não definido',
    className: 'rascunho',
  }

  return (
    <span
      className={`evento-status ${configuracao.className}`}
    >
      {configuracao.label}
    </span>
  )
}

export default EventoStatusBadge