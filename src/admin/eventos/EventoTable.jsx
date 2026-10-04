import EventoStatusBadge from './EventoStatusBadge'
import EventoActions from './EventoActions'

function formatarData(data) {
  if (!data) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(`${data}T00:00:00Z`))
}

function EventoTable({
  eventos,
  carregando,
  erro,
  onEditar,
  onVisualizar,
  onDesativar
}) {
  return (
    <div className="eventos-table-wrapper">
      <table className="eventos-table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Período</th>
            <th>Local</th>
            <th>Cidade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando && (
            <tr>
              <td
                colSpan="6"
                className="eventos-feedback"
              >
                Carregando eventos...
              </td>
            </tr>
          )}

          {!carregando && erro && (
            <tr>
              <td
                colSpan="6"
                className="eventos-feedback erro"
              >
                {erro}
              </td>
            </tr>
          )}

          {!carregando &&
            !erro &&
            eventos.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="eventos-feedback"
                >
                  Nenhum evento encontrado.
                </td>
              </tr>
            )}

          {!carregando &&
            !erro &&
            eventos.map((evento) => (
              <tr key={evento.id}>
                <td>
                  <strong>{evento.name}</strong>
                </td>

                <td>
                  {formatarData(evento.startDate)} a{' '}
                  {formatarData(evento.endDate)}
                </td>

                <td>
                  {evento.venueName || '—'}
                </td>

                <td>
                  {evento.city
                    ? `${evento.city}${
                        evento.state
                          ? ` - ${evento.state}`
                          : ''
                      }`
                    : '—'}
                </td>

                <td>
                  <EventoStatusBadge
                    status={evento.status}
                  />
                </td>

                <td>
                    <EventoActions
                    evento={evento}
                    onEditar={onEditar}
                    onVisualizar={onVisualizar}
                    onDesativar={onDesativar}
                    />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default EventoTable