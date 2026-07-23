import { useMemo, useState } from 'react'
import './Participantes.css'

function Participantes() {
  const [busca, setBusca] = useState('')
  const [filtroOrigem, setFiltroOrigem] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalImportacaoAberto, setModalImportacaoAberto] = useState(false)

  const participantes = [
    {
      id: 1,
      nome: 'João da Silva',
      telefone: '(83) 99999-0001',
      email: 'joao@email.com',
      codigo: 'CJ-000421',
      data: '29/10/2026',
      horario: '19:00',
      origem: 'PagTickets',
      checkin: true,
    },
    {
      id: 2,
      nome: 'Maria Souza',
      telefone: '(83) 99999-0002',
      email: 'maria@email.com',
      codigo: 'CJ-000422',
      data: '29/10/2026',
      horario: '19:20',
      origem: 'PagTickets',
      checkin: false,
    },
    {
      id: 3,
      nome: 'Pedro Santos',
      telefone: '(83) 99999-0003',
      email: 'pedro@email.com',
      codigo: 'CJ-000423',
      data: '29/10/2026',
      horario: '19:40',
      origem: 'Cortesia',
      checkin: false,
    },
    {
      id: 4,
      nome: 'Ana Oliveira',
      telefone: '(83) 99999-0004',
      email: 'ana@email.com',
      codigo: 'CJ-000424',
      data: '30/10/2026',
      horario: '19:00',
      origem: 'Manual',
      checkin: true,
    },
  ]

  const participantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return participantes.filter((participante) => {
      const correspondeBusca =
        !termo ||
        participante.nome.toLowerCase().includes(termo) ||
        participante.telefone.toLowerCase().includes(termo) ||
        participante.email.toLowerCase().includes(termo) ||
        participante.codigo.toLowerCase().includes(termo)

      const correspondeOrigem =
        filtroOrigem === 'todos' ||
        participante.origem === filtroOrigem

      const correspondeStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'realizado' && participante.checkin) ||
        (filtroStatus === 'pendente' && !participante.checkin)

      return (
        correspondeBusca &&
        correspondeOrigem &&
        correspondeStatus
      )
    })
  }, [busca, filtroOrigem, filtroStatus])

  return (
    <div className="participantes-page">
      <div className="participantes-heading">
        <div>
          <p className="participantes-eyebrow">
            Público
          </p>

          <h1>Participantes</h1>

          <p>
            Consulte, filtre e gerencie os participantes do evento.
          </p>
        </div>

        <div className="participantes-heading-actions">
          <button
            type="button"
            className="participante-import-button"
            onClick={() => setModalImportacaoAberto(true)}
          >
            Importar PagTickets
          </button>

          <button
            type="button"
            className="participante-new-button"
            onClick={() => setModalAberto(true)}
          >
            + Novo participante
          </button>
        </div>
      </div>

      <section className="participantes-summary">
        <div>
          <span>Total</span>
          <strong>{participantes.length}</strong>
        </div>

        <div>
          <span>PagTickets</span>
          <strong>
            {
              participantes.filter(
                (participante) =>
                  participante.origem === 'PagTickets',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Check-ins</span>
          <strong>
            {
              participantes.filter(
                (participante) => participante.checkin,
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Pendentes</span>
          <strong>
            {
              participantes.filter(
                (participante) => !participante.checkin,
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="participantes-card">
        <div className="participantes-filters">
          <div className="participantes-search">
            <label htmlFor="buscaParticipante">
              Buscar participante
            </label>

            <input
              id="buscaParticipante"
              type="search"
              placeholder="Nome, telefone, e-mail ou código..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="participantes-filter-group">
            <label htmlFor="origemParticipante">
              Origem
            </label>

            <select
              id="origemParticipante"
              value={filtroOrigem}
              onChange={(event) =>
                setFiltroOrigem(event.target.value)
              }
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

          <div className="participantes-filter-group">
            <label htmlFor="statusParticipante">
              Check-in
            </label>

            <select
              id="statusParticipante"
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(event.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="realizado">
                Realizado
              </option>

              <option value="pendente">
                Pendente
              </option>
            </select>
          </div>
        </div>

        <div className="participantes-card-header">
          <div>
            <h2>Lista de participantes</h2>

            <span>
              {participantesFiltrados.length}{' '}
              {participantesFiltrados.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="participantes-table-wrapper">
          <table className="participantes-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Contato</th>
                <th>Sessão</th>
                <th>Código</th>
                <th>Origem</th>
                <th>Check-in</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {participantesFiltrados.length > 0 ? (
                participantesFiltrados.map((participante) => (
                  <tr key={participante.id}>
                    <td>
                      <strong>
                        {participante.nome}
                      </strong>

                      <span>
                        {participante.email}
                      </span>
                    </td>

                    <td>
                      {participante.telefone}
                    </td>

                    <td>
                      <strong>
                        {participante.data}
                      </strong>

                      <span>
                        {participante.horario}
                      </span>
                    </td>

                    <td>
                      <code>
                        {participante.codigo}
                      </code>
                    </td>

                    <td>
                      <span
                        className={`origem-badge ${participante.origem
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {participante.origem}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          participante.checkin
                            ? 'checkin-badge realizado'
                            : 'checkin-badge pendente'
                        }
                      >
                        {participante.checkin
                          ? 'Realizado'
                          : 'Pendente'}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="participante-action"
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
                    className="participantes-empty"
                  >
                    Nenhum participante encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && (
        <div className="participante-modal-overlay">
          <div className="participante-modal">
            <div className="participante-modal-header">
              <div>
                <span>Cadastro manual</span>
                <h2>Novo participante</h2>
              </div>

              <button
                type="button"
                className="participante-modal-close"
                onClick={() => setModalAberto(false)}
              >
                ×
              </button>
            </div>

            <form className="participante-form">
              <div className="participante-form-group">
                <label htmlFor="nomeParticipante">
                  Nome completo
                </label>

                <input
                  id="nomeParticipante"
                  type="text"
                  placeholder="Nome do participante"
                />
              </div>

              <div className="participante-form-row">
                <div className="participante-form-group">
                  <label htmlFor="telefoneParticipante">
                    Telefone
                  </label>

                  <input
                    id="telefoneParticipante"
                    type="tel"
                    placeholder="(83) 99999-9999"
                  />
                </div>

                <div className="participante-form-group">
                  <label htmlFor="emailParticipante">
                    E-mail
                  </label>

                  <input
                    id="emailParticipante"
                    type="email"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="participante-form-row">
                <div className="participante-form-group">
                  <label htmlFor="dataParticipante">
                    Data
                  </label>

                  <select
                    id="dataParticipante"
                    defaultValue=""
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    <option value="29/10/2026">
                      29/10/2026
                    </option>

                    <option value="30/10/2026">
                      30/10/2026
                    </option>

                    <option value="31/10/2026">
                      31/10/2026
                    </option>

                    <option value="12/11/2026">
                      12/11/2026
                    </option>

                    <option value="13/11/2026">
                      13/11/2026
                    </option>

                    <option value="14/11/2026">
                      14/11/2026
                    </option>
                  </select>
                </div>

                <div className="participante-form-group">
                  <label htmlFor="horarioParticipante">
                    Sessão
                  </label>

                  <select
                    id="horarioParticipante"
                    defaultValue=""
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    <option value="19:00">
                      19:00
                    </option>

                    <option value="19:20">
                      19:20
                    </option>

                    <option value="19:40">
                      19:40
                    </option>

                    <option value="20:00">
                      20:00
                    </option>
                  </select>
                </div>
              </div>

              <div className="participante-form-group">
                <label htmlFor="origemNovoParticipante">
                  Origem
                </label>

                <select
                  id="origemNovoParticipante"
                  defaultValue="Manual"
                >
                  <option value="Manual">
                    Manual
                  </option>

                  <option value="Cortesia">
                    Cortesia
                  </option>
                </select>
              </div>

              <div className="participante-modal-actions">
                <button
                  type="button"
                  className="participante-cancel-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="participante-save-button"
                >
                  Salvar participante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalImportacaoAberto && (
        <div className="participante-modal-overlay">
          <div className="participante-modal importacao-modal">
            <div className="participante-modal-header">
              <div>
                <span>Integração</span>
                <h2>Importar PagTickets</h2>
              </div>

              <button
                type="button"
                className="participante-modal-close"
                onClick={() =>
                  setModalImportacaoAberto(false)
                }
              >
                ×
              </button>
            </div>

            <div className="importacao-content">
              <div className="importacao-alert">
                <strong>
                  PagTickets sem API/Webhook
                </strong>

                <p>
                  Enquanto não houver integração automática,
                  os participantes poderão ser importados
                  através de arquivo exportado pela plataforma.
                </p>
              </div>

              <div className="participante-form-group">
                <label htmlFor="arquivoPagTickets">
                  Arquivo de participantes
                </label>

                <input
                  id="arquivoPagTickets"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                />

                <small>
                  Formatos aceitos: CSV, XLS ou XLSX.
                </small>
              </div>

              <div className="importacao-info">
                <span>
                  O sistema deverá identificar:
                </span>

                <ul>
                  <li>Nome do participante</li>
                  <li>Telefone</li>
                  <li>E-mail</li>
                  <li>Data e sessão</li>
                  <li>Código do ingresso</li>
                </ul>
              </div>

              <div className="participante-modal-actions">
                <button
                  type="button"
                  className="participante-cancel-button"
                  onClick={() =>
                    setModalImportacaoAberto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="participante-save-button"
                >
                  Importar arquivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Participantes