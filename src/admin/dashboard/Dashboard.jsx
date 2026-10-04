import './Dashboard.css'

function Dashboard() {
  const resumo = [
    {
      titulo: 'Ingressos emitidos',
      valor: '2.350',
      detalhe: 'Todos os ingressos',
    },
    {
      titulo: 'Check-ins',
      valor: '1.485',
      detalhe: 'Entradas confirmadas',
    },
    {
      titulo: 'Pendentes',
      valor: '865',
      detalhe: 'Ainda não utilizados',
    },
    {
      titulo: 'Sessões hoje',
      valor: '8',
      detalhe: 'Sessões programadas',
    },
  ]

  const sessoes = [
    {
      horario: '19:00',
      ocupados: 178,
      capacidade: 200,
    },
    {
      horario: '19:20',
      ocupados: 194,
      capacidade: 200,
    },
    {
      horario: '19:40',
      ocupados: 146,
      capacidade: 200,
    },
    {
      horario: '20:00',
      ocupados: 121,
      capacidade: 200,
    },
  ]

  const checkins = [
    {
      nome: 'João da Silva',
      horario: '19:42',
      status: 'Entrada autorizada',
    },
    {
      nome: 'Maria Souza',
      horario: '19:41',
      status: 'Entrada autorizada',
    },
    {
      nome: 'Pedro Santos',
      horario: '19:39',
      status: 'Entrada autorizada',
    },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">
            Visão geral
          </p>

          <h1>Dashboard</h1>

          <p className="dashboard-description">
            Acompanhe os principais números da Casa do Julgamento.
          </p>
        </div>

        <div className="dashboard-event">
          <span>Evento atual</span>
          <strong>Casa do Julgamento 2026</strong>
        </div>
      </div>

      <section className="dashboard-cards">
        {resumo.map((item) => (
          <article
            className="dashboard-card"
            key={item.titulo}
          >
            <p>{item.titulo}</p>

            <strong>{item.valor}</strong>

            <span>{item.detalhe}</span>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Próximas sessões</h2>
              <p>Ocupação por horário</p>
            </div>

            <button type="button">
              Ver sessões
            </button>
          </div>

          <div className="sessions-list">
            {sessoes.map((sessao) => {
              const percentual =
                (sessao.ocupados / sessao.capacidade) * 100

              return (
                <div
                  className="session-item"
                  key={sessao.horario}
                >
                  <div className="session-info">
                    <strong>{sessao.horario}</strong>

                    <span>
                      {sessao.ocupados} / {sessao.capacidade}
                    </span>
                  </div>

                  <div className="session-progress">
                    <div
                      className="session-progress-value"
                      style={{
                        width: `${percentual}%`,
                      }}
                    />
                  </div>

                  <span className="session-percentage">
                    {Math.round(percentual)}%
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Últimos check-ins</h2>
              <p>Entradas mais recentes</p>
            </div>

            <button type="button">
              Ver portaria
            </button>
          </div>

          <div className="checkin-list">
            {checkins.map((checkin) => (
              <div
                className="checkin-item"
                key={`${checkin.nome}-${checkin.horario}`}
              >
                <div className="checkin-icon">
                  ✓
                </div>

                <div className="checkin-data">
                  <strong>{checkin.nome}</strong>
                  <span>{checkin.status}</span>
                </div>

                <time>{checkin.horario}</time>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="dashboard-bottom">
        <div>
          <span>Origem dos ingressos</span>
          <strong>PagTickets</strong>
        </div>

        <div>
          <span>Capacidade total hoje</span>
          <strong>1.600</strong>
        </div>

        <div>
          <span>Ocupação geral</span>
          <strong>74%</strong>
        </div>

        <div>
          <span>Status</span>
          <strong className="status-active">
            Evento ativo
          </strong>
        </div>
      </section>
    </div>
  )
}

export default Dashboard