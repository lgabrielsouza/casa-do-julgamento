import { useMemo, useState } from 'react'
import './Ingressos.css'

function Ingressos() {
  const [busca, setBusca] = useState('')
  const [origem, setOrigem] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [ingressoSelecionado, setIngressoSelecionado] = useState(null)

  const ingressos = [
    {
      id: 1,
      codigo: 'CJ-000421',
      participante: 'João da Silva',
      email: 'joao@email.com',
      telefone: '(83) 99999-0001',
      data: '29/10/2026',
      horario: '19:00',
      origem: 'PagTickets',
      status: 'Ativo',
      checkin: true,
    },
    {
      id: 2,
      codigo: 'CJ-000422',
      participante: 'Maria Souza',
      email: 'maria@email.com',
      telefone: '(83) 99999-0002',
      data: '29/10/2026',
      horario: '19:20',
      origem: 'PagTickets',
      status: 'Ativo',
      checkin: false,
    },
    {
      id: 3,
      codigo: 'CJ-000423',
      participante: 'Pedro Santos',
      email: 'pedro@email.com',
      telefone: '(83) 99999-0003',
      data: '29/10/2026',
      horario: '19:40',
      origem: 'Cortesia',
      status: 'Ativo',
      checkin: false,
    },
    {
      id: 4,
      codigo: 'CJ-000424',
      participante: 'Ana Oliveira',
      email: 'ana@email.com',
      telefone: '(83) 99999-0004',
      data: '30/10/2026',
      horario: '19:00',
      origem: 'Manual',
      status: 'Cancelado',
      checkin: false,
    },
  ]

  const ingressosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return ingressos.filter((ingresso) => {
      const correspondeBusca =
        !termo ||
        ingresso.codigo.toLowerCase().includes(termo) ||
        ingresso.participante.toLowerCase().includes(termo) ||
        ingresso.email.toLowerCase().includes(termo) ||
        ingresso.telefone.toLowerCase().includes(termo)

      const correspondeOrigem =
        origem === 'todos' || ingresso.origem === origem

      const correspondeStatus =
        status === 'todos' || ingresso.status === status

      return (
        correspondeBusca &&
        correspondeOrigem &&
        correspondeStatus
      )
    })
  }, [busca, origem, status])

  function abrirDetalhes(ingresso) {
    setIngressoSelecionado(ingresso)
    setModalAberto(true)
  }

  function fecharDetalhes() {
    setModalAberto(false)
    setIngressoSelecionado(null)
  }

  return (
    <div className="ingressos-page">
      <div className="ingressos-heading">
        <div>
          <p className="ingressos-eyebrow">
            Controle
          </p>

          <h1>Ingressos</h1>

          <p>
            Consulte e gerencie os ingressos emitidos para o evento.
          </p>
        </div>

        <button
          type="button"
          className="novo-ingresso-button"
        >
          + Emitir cortesia
        </button>
      </div>

      <section className="ingressos-summary">
        <div>
          <span>Total emitido</span>
          <strong>{ingressos.length}</strong>
        </div>

        <div>
          <span>Ativos</span>
          <strong>
            {
              ingressos.filter(
                (ingresso) => ingresso.status === 'Ativo',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Utilizados</span>
          <strong>
            {
              ingressos.filter(
                (ingresso) => ingresso.checkin,
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Cancelados</span>
          <strong>
            {
              ingressos.filter(
                (ingresso) =>
                  ingresso.status === 'Cancelado',
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="ingressos-card">
        <div className="ingressos-filters">
          <div className="ingressos-search">
            <label htmlFor="buscarIngresso">
              Buscar ingresso
            </label>

            <input
              id="buscarIngresso"
              type="search"
              placeholder="Código, participante, e-mail ou telefone..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="ingressos-filter">
            <label htmlFor="origemIngresso">
              Origem
            </label>

            <select
              id="origemIngresso"
              value={origem}
              onChange={(event) => setOrigem(event.target.value)}
            >
              <option value="todos">
                Todas
              </option>

              <option value="PagTickets">
                PagTickets
              </option>

              <option value="Cortesia">
                Cortesia
              </option>

              <option value="Manual">
                Manual
              </option>
            </select>
          </div>

          <div className="ingressos-filter">
            <label htmlFor="statusIngresso">
              Status
            </label>

            <select
              id="statusIngresso"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="todos">
                Todos
              </option>

              <option value="Ativo">
                Ativo
              </option>

              <option value="Cancelado">
                Cancelado
              </option>
            </select>
          </div>
        </div>

        <div className="ingressos-card-header">
          <div>
            <h2>Ingressos emitidos</h2>

            <span>
              {ingressosFiltrados.length}{' '}
              {ingressosFiltrados.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="ingressos-table-wrapper">
          <table className="ingressos-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Participante</th>
                <th>Sessão</th>
                <th>Origem</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ingressosFiltrados.length > 0 ? (
                ingressosFiltrados.map((ingresso) => (
                  <tr key={ingresso.id}>
                    <td>
                      <code>{ingresso.codigo}</code>
                    </td>

                    <td>
                      <strong>
                        {ingresso.participante}
                      </strong>

                      <span>
                        {ingresso.email}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {ingresso.data}
                      </strong>

                      <span>
                        {ingresso.horario}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`ingresso-origem ${ingresso.origem.toLowerCase()}`}
                      >
                        {ingresso.origem}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          ingresso.status === 'Ativo'
                            ? 'ingresso-status ativo'
                            : 'ingresso-status cancelado'
                        }
                      >
                        {ingresso.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          ingresso.checkin
                            ? 'ingresso-checkin utilizado'
                            : 'ingresso-checkin pendente'
                        }
                      >
                        {ingresso.checkin
                          ? 'Utilizado'
                          : 'Pendente'}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="ingresso-action"
                        onClick={() =>
                          abrirDetalhes(ingresso)
                        }
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="ingressos-empty"
                  >
                    Nenhum ingresso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && ingressoSelecionado && (
        <div className="ingresso-modal-overlay">
          <div className="ingresso-modal">
            <div className="ingresso-modal-header">
              <div>
                <span>Ingresso</span>
                <h2>
                  {ingressoSelecionado.codigo}
                </h2>
              </div>

              <button
                type="button"
                className="ingresso-modal-close"
                onClick={fecharDetalhes}
              >
                ×
              </button>
            </div>

            <div className="ingresso-details">
              <div className="ingresso-details-grid">
                <div>
                  <span>Participante</span>
                  <strong>
                    {ingressoSelecionado.participante}
                  </strong>
                </div>

                <div>
                  <span>Origem</span>
                  <strong>
                    {ingressoSelecionado.origem}
                  </strong>
                </div>

                <div>
                  <span>Data</span>
                  <strong>
                    {ingressoSelecionado.data}
                  </strong>
                </div>

                <div>
                  <span>Horário</span>
                  <strong>
                    {ingressoSelecionado.horario}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {ingressoSelecionado.status}
                  </strong>
                </div>

                <div>
                  <span>Check-in</span>
                  <strong>
                    {ingressoSelecionado.checkin
                      ? 'Realizado'
                      : 'Não realizado'}
                  </strong>
                </div>
              </div>

              <div className="ingresso-contact">
                <div>
                  <span>E-mail</span>
                  <strong>
                    {ingressoSelecionado.email}
                  </strong>
                </div>

                <div>
                  <span>Telefone</span>
                  <strong>
                    {ingressoSelecionado.telefone}
                  </strong>
                </div>
              </div>

              <div className="ingresso-qr-placeholder">
                <div>QR</div>

                <div>
                  <strong>QR Code do ingresso</strong>

                  <span>
                    Para ingressos PagTickets, a validação
                    continuará dependendo da compatibilidade
                    disponibilizada pela plataforma.
                  </span>
                </div>
              </div>

              <div className="ingresso-modal-actions">
                <button
                  type="button"
                  className="ingresso-secondary-button"
                >
                  Imprimir
                </button>

                <button
                  type="button"
                  className="ingresso-secondary-button"
                >
                  Reenviar
                </button>

                <button
                  type="button"
                  className="ingresso-danger-button"
                >
                  Cancelar ingresso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ingressos