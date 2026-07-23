import { useState } from 'react'
import './Sessoes.css'

function Sessoes() {
  const [modalAberto, setModalAberto] = useState(false)

  const [dataSelecionada, setDataSelecionada] =
    useState('29/10/2026')

  const datas = [
    '29/10/2026',
    '30/10/2026',
    '31/10/2026',
    '12/11/2026',
    '13/11/2026',
    '14/11/2026',
  ]

  const sessoes = [
    {
      id: 1,
      data: '29/10/2026',
      horario: '19:00',
      capacidade: 200,
      inscritos: 178,
      status: 'Disponível',
    },
    {
      id: 2,
      data: '29/10/2026',
      horario: '19:20',
      capacidade: 200,
      inscritos: 194,
      status: 'Disponível',
    },
    {
      id: 3,
      data: '29/10/2026',
      horario: '19:40',
      capacidade: 200,
      inscritos: 200,
      status: 'Lotada',
    },
    {
      id: 4,
      data: '29/10/2026',
      horario: '20:00',
      capacidade: 200,
      inscritos: 121,
      status: 'Disponível',
    },
  ]

  const sessoesFiltradas = sessoes.filter(
    (sessao) => sessao.data === dataSelecionada,
  )

  return (
    <div className="sessoes-page">
      <div className="sessoes-heading">
        <div>
          <p className="sessoes-eyebrow">
            Programação
          </p>

          <h1>Sessões</h1>

          <p>
            Gerencie datas, horários e capacidades
            das sessões.
          </p>
        </div>

        <button
          type="button"
          className="nova-sessao-button"
          onClick={() => setModalAberto(true)}
        >
          + Nova sessão
        </button>
      </div>

      <section className="sessoes-evento">
        <div>
          <span>Evento selecionado</span>
          <strong>Casa do Julgamento 2026</strong>
        </div>

        <select defaultValue="cj2026">
          <option value="cj2026">
            Casa do Julgamento 2026
          </option>
        </select>
      </section>

      <section className="sessoes-datas">
        <div className="sessoes-datas-header">
          <div>
            <h2>Datas do evento</h2>
            <p>
              Selecione uma data para visualizar
              as sessões.
            </p>
          </div>
        </div>

        <div className="datas-list">
          {datas.map((data) => (
            <button
              type="button"
              key={data}
              className={
                dataSelecionada === data
                  ? 'data-button active'
                  : 'data-button'
              }
              onClick={() => setDataSelecionada(data)}
            >
              {data}
            </button>
          ))}
        </div>
      </section>

      <section className="sessoes-card">
        <div className="sessoes-card-header">
          <div>
            <h2>Sessões</h2>

            <span>
              {dataSelecionada}
            </span>
          </div>

          <span className="sessoes-total">
            {sessoesFiltradas.length}{' '}
            {sessoesFiltradas.length === 1
              ? 'sessão'
              : 'sessões'}
          </span>
        </div>

        {sessoesFiltradas.length > 0 ? (
          <div className="sessoes-table-wrapper">
            <table className="sessoes-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Inscritos</th>
                  <th>Capacidade</th>
                  <th>Ocupação</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {sessoesFiltradas.map((sessao) => {
                  const percentual =
                    (sessao.inscritos /
                      sessao.capacidade) *
                    100

                  return (
                    <tr key={sessao.id}>
                      <td>
                        <strong>
                          {sessao.horario}
                        </strong>
                      </td>

                      <td>
                        {sessao.inscritos}
                      </td>

                      <td>
                        {sessao.capacidade}
                      </td>

                      <td>
                        <div className="ocupacao-cell">
                          <div className="ocupacao-bar">
                            <div
                              className="ocupacao-value"
                              style={{
                                width: `${Math.min(
                                  percentual,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>

                          <span>
                            {Math.round(percentual)}%
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            sessao.status === 'Lotada'
                              ? 'sessao-status lotada'
                              : 'sessao-status disponivel'
                          }
                        >
                          {sessao.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="sessao-action"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sessoes-empty">
            <strong>
              Nenhuma sessão cadastrada
            </strong>

            <p>
              Ainda não existem sessões cadastradas
              para {dataSelecionada}.
            </p>

            <button
              type="button"
              onClick={() => setModalAberto(true)}
            >
              + Criar sessão
            </button>
          </div>
        )}
      </section>

      {modalAberto && (
        <div className="sessao-modal-overlay">
          <div className="sessao-modal">
            <div className="sessao-modal-header">
              <div>
                <span>Programação</span>
                <h2>Nova sessão</h2>
              </div>

              <button
                type="button"
                className="sessao-modal-close"
                onClick={() =>
                  setModalAberto(false)
                }
              >
                ×
              </button>
            </div>

            <form className="sessao-form">
              <div className="sessao-form-group">
                <label htmlFor="eventoSessao">
                  Evento
                </label>

                <select
                  id="eventoSessao"
                  defaultValue="cj2026"
                >
                  <option value="cj2026">
                    Casa do Julgamento 2026
                  </option>
                </select>
              </div>

              <div className="sessao-form-row">
                <div className="sessao-form-group">
                  <label htmlFor="dataSessao">
                    Data
                  </label>

                  <input
                    id="dataSessao"
                    type="date"
                  />
                </div>

                <div className="sessao-form-group">
                  <label htmlFor="horarioSessao">
                    Horário
                  </label>

                  <input
                    id="horarioSessao"
                    type="time"
                  />
                </div>
              </div>

              <div className="sessao-form-group">
                <label htmlFor="capacidadeSessao">
                  Capacidade
                </label>

                <input
                  id="capacidadeSessao"
                  type="number"
                  min="1"
                  placeholder="Ex.: 200"
                />

                <small>
                  Quantidade máxima de pessoas
                  permitida nesta sessão.
                </small>
              </div>

              <div className="sessao-form-group">
                <label htmlFor="statusSessao">
                  Status
                </label>

                <select
                  id="statusSessao"
                  defaultValue="disponivel"
                >
                  <option value="disponivel">
                    Disponível
                  </option>

                  <option value="fechada">
                    Fechada
                  </option>

                  <option value="cancelada">
                    Cancelada
                  </option>
                </select>
              </div>

              <div className="sessao-modal-actions">
                <button
                  type="button"
                  className="sessao-cancel-button"
                  onClick={() =>
                    setModalAberto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="sessao-save-button"
                >
                  Salvar sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sessoes