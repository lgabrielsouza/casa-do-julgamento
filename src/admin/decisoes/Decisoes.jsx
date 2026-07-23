import { useMemo, useState } from 'react'
import './Decisoes.css'

function Decisoes() {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)

  const decisoes = [
    {
      id: 1,
      nome: 'Lucas Ferreira',
      telefone: '(83) 99999-1001',
      data: '29/10/2026',
      horario: '19:00',
      tipo: 'Decisão por Cristo',
      igreja: 'Igreja Batista Central',
      status: 'Encaminhado',
    },
    {
      id: 2,
      nome: 'Amanda Souza',
      telefone: '(83) 99999-1002',
      data: '29/10/2026',
      horario: '19:20',
      tipo: 'Reconciliação',
      igreja: 'A definir',
      status: 'Novo',
    },
    {
      id: 3,
      nome: 'Rafael Lima',
      telefone: '(83) 99999-1003',
      data: '29/10/2026',
      horario: '19:40',
      tipo: 'Decisão por Cristo',
      igreja: 'Igreja Batista Esperança',
      status: 'Em acompanhamento',
    },
  ]

  const decisoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return decisoes.filter((decisao) => {
      const correspondeBusca =
        !termo ||
        decisao.nome.toLowerCase().includes(termo) ||
        decisao.telefone.toLowerCase().includes(termo) ||
        decisao.igreja.toLowerCase().includes(termo)

      const correspondeStatus =
        status === 'todos' || decisao.status === status

      return correspondeBusca && correspondeStatus
    })
  }, [busca, status])

  return (
    <div className="decisoes-page">
      <div className="decisoes-heading">
        <div>
          <p className="decisoes-eyebrow">
            Ministério
          </p>

          <h1>Decisões</h1>

          <p>
            Registre e acompanhe as decisões realizadas
            durante o evento.
          </p>
        </div>

        <button
          type="button"
          className="nova-decisao-button"
          onClick={() => setModalAberto(true)}
        >
          + Nova decisão
        </button>
      </div>

      <section className="decisoes-summary">
        <div>
          <span>Total</span>
          <strong>{decisoes.length}</strong>
        </div>

        <div>
          <span>Novos</span>
          <strong>
            {
              decisoes.filter(
                (decisao) => decisao.status === 'Novo',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Encaminhados</span>
          <strong>
            {
              decisoes.filter(
                (decisao) =>
                  decisao.status === 'Encaminhado',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Em acompanhamento</span>
          <strong>
            {
              decisoes.filter(
                (decisao) =>
                  decisao.status === 'Em acompanhamento',
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="decisoes-card">
        <div className="decisoes-filters">
          <div className="decisoes-search">
            <label htmlFor="buscarDecisao">
              Buscar
            </label>

            <input
              id="buscarDecisao"
              type="search"
              placeholder="Nome, telefone ou igreja..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          <div className="decisoes-filter">
            <label htmlFor="statusDecisao">
              Status
            </label>

            <select
              id="statusDecisao"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="Novo">
                Novo
              </option>

              <option value="Encaminhado">
                Encaminhado
              </option>

              <option value="Em acompanhamento">
                Em acompanhamento
              </option>

              <option value="Concluído">
                Concluído
              </option>
            </select>
          </div>
        </div>

        <div className="decisoes-card-header">
          <div>
            <h2>Registros</h2>

            <span>
              {decisoesFiltradas.length}{' '}
              {decisoesFiltradas.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="decisoes-table-wrapper">
          <table className="decisoes-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Sessão</th>
                <th>Tipo</th>
                <th>Igreja</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {decisoesFiltradas.map((decisao) => (
                <tr key={decisao.id}>
                  <td>
                    <strong>{decisao.nome}</strong>
                  </td>

                  <td>{decisao.telefone}</td>

                  <td>
                    <strong>{decisao.data}</strong>
                    <span>{decisao.horario}</span>
                  </td>

                  <td>
                    {decisao.tipo}
                  </td>

                  <td>
                    {decisao.igreja}
                  </td>

                  <td>
                    <span
                      className={`decisao-status ${decisao.status
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                    >
                      {decisao.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="decisao-action"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && (
        <div className="decisao-modal-overlay">
          <div className="decisao-modal">
            <div className="decisao-modal-header">
              <div>
                <span>Ministério</span>
                <h2>Nova decisão</h2>
              </div>

              <button
                type="button"
                className="decisao-modal-close"
                onClick={() => setModalAberto(false)}
              >
                ×
              </button>
            </div>

            <form className="decisao-form">
              <div className="decisao-form-group">
                <label htmlFor="nomeDecisao">
                  Nome completo
                </label>

                <input
                  id="nomeDecisao"
                  type="text"
                  placeholder="Nome da pessoa"
                />
              </div>

              <div className="decisao-form-row">
                <div className="decisao-form-group">
                  <label htmlFor="telefoneDecisao">
                    Telefone
                  </label>

                  <input
                    id="telefoneDecisao"
                    type="tel"
                    placeholder="(83) 99999-9999"
                  />
                </div>

                <div className="decisao-form-group">
                  <label htmlFor="tipoDecisao">
                    Tipo de decisão
                  </label>

                  <select
                    id="tipoDecisao"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option value="Decisão por Cristo">
                      Decisão por Cristo
                    </option>

                    <option value="Reconciliação">
                      Reconciliação
                    </option>

                    <option value="Pedido de oração">
                      Pedido de oração
                    </option>
                  </select>
                </div>
              </div>

              <div className="decisao-form-row">
                <div className="decisao-form-group">
                  <label htmlFor="dataDecisao">
                    Data
                  </label>

                  <select
                    id="dataDecisao"
                    defaultValue=""
                  >
                    <option value="" disabled>
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

                <div className="decisao-form-group">
                  <label htmlFor="sessaoDecisao">
                    Sessão
                  </label>

                  <select
                    id="sessaoDecisao"
                    defaultValue=""
                  >
                    <option value="" disabled>
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

              <div className="decisao-form-group">
                <label htmlFor="igrejaDecisao">
                  Igreja para encaminhamento
                </label>

                <select
                  id="igrejaDecisao"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione
                  </option>

                  <option value="Igreja Batista Central">
                    Igreja Batista Central
                  </option>

                  <option value="Igreja Batista Esperança">
                    Igreja Batista Esperança
                  </option>

                  <option value="A definir">
                    A definir
                  </option>
                </select>
              </div>

              <div className="decisao-form-group">
                <label htmlFor="observacaoDecisao">
                  Observações
                </label>

                <textarea
                  id="observacaoDecisao"
                  rows="4"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="decisao-modal-actions">
                <button
                  type="button"
                  className="decisao-cancel-button"
                  onClick={() =>
                    setModalAberto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="decisao-save-button"
                >
                  Salvar decisão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Decisoes