import { useMemo, useState } from 'react'
import './Igrejas.css'

function Igrejas() {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)

  const igrejas = [
    {
      id: 1,
      nome: 'Igreja Batista Central',
      responsavel: 'Pr. João Silva',
      telefone: '(83) 99999-2001',
      bairro: 'Centro',
      cidade: 'João Pessoa',
      instagram: '@ibcentral',
      status: 'Ativa',
      recebeConvertidos: true,
    },
    {
      id: 2,
      nome: 'Igreja Batista Esperança',
      responsavel: 'Pr. Carlos Souza',
      telefone: '(83) 99999-2002',
      bairro: 'Bancários',
      cidade: 'João Pessoa',
      instagram: '@ibatistaesperanca',
      status: 'Ativa',
      recebeConvertidos: true,
    },
    {
      id: 3,
      nome: 'Igreja Batista Renovada',
      responsavel: 'Pr. Marcos Lima',
      telefone: '(83) 99999-2003',
      bairro: 'Mangabeira',
      cidade: 'João Pessoa',
      instagram: '@ibrjp',
      status: 'Pendente',
      recebeConvertidos: false,
    },
  ]

  const igrejasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return igrejas.filter((igreja) => {
      const correspondeBusca =
        !termo ||
        igreja.nome.toLowerCase().includes(termo) ||
        igreja.responsavel.toLowerCase().includes(termo) ||
        igreja.bairro.toLowerCase().includes(termo) ||
        igreja.cidade.toLowerCase().includes(termo)

      const correspondeStatus =
        status === 'todos' || igreja.status === status

      return correspondeBusca && correspondeStatus
    })
  }, [busca, status])

  return (
    <div className="igrejas-page">
      <div className="igrejas-heading">
        <div>
          <p className="igrejas-eyebrow">
            Ministério
          </p>

          <h1>Igrejas Parceiras</h1>

          <p>
            Cadastre e gerencie as igrejas que receberão
            os encaminhamentos do projeto.
          </p>
        </div>

        <button
          type="button"
          className="nova-igreja-button"
          onClick={() => setModalAberto(true)}
        >
          + Nova igreja
        </button>
      </div>

      <section className="igrejas-summary">
        <div>
          <span>Total</span>
          <strong>{igrejas.length}</strong>
        </div>

        <div>
          <span>Ativas</span>
          <strong>
            {
              igrejas.filter(
                (igreja) => igreja.status === 'Ativa',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Recebem convertidos</span>
          <strong>
            {
              igrejas.filter(
                (igreja) => igreja.recebeConvertidos,
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Pendentes</span>
          <strong>
            {
              igrejas.filter(
                (igreja) => igreja.status === 'Pendente',
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="igrejas-card">
        <div className="igrejas-filters">
          <div className="igrejas-search">
            <label htmlFor="buscarIgreja">
              Buscar
            </label>

            <input
              id="buscarIgreja"
              type="search"
              placeholder="Igreja, pastor, bairro ou cidade..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          <div className="igrejas-filter">
            <label htmlFor="statusIgreja">
              Status
            </label>

            <select
              id="statusIgreja"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="Ativa">
                Ativa
              </option>

              <option value="Pendente">
                Pendente
              </option>

              <option value="Inativa">
                Inativa
              </option>
            </select>
          </div>
        </div>

        <div className="igrejas-card-header">
          <div>
            <h2>Igrejas cadastradas</h2>

            <span>
              {igrejasFiltradas.length}{' '}
              {igrejasFiltradas.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="igrejas-table-wrapper">
          <table className="igrejas-table">
            <thead>
              <tr>
                <th>Igreja</th>
                <th>Responsável</th>
                <th>Contato</th>
                <th>Localização</th>
                <th>Encaminhamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {igrejasFiltradas.map((igreja) => (
                <tr key={igreja.id}>
                  <td>
                    <strong>{igreja.nome}</strong>

                    <span>{igreja.instagram}</span>
                  </td>

                  <td>{igreja.responsavel}</td>

                  <td>{igreja.telefone}</td>

                  <td>
                    <strong>{igreja.bairro}</strong>
                    <span>{igreja.cidade}</span>
                  </td>

                  <td>
                    <span
                      className={
                        igreja.recebeConvertidos
                          ? 'igreja-recebe sim'
                          : 'igreja-recebe nao'
                      }
                    >
                      {igreja.recebeConvertidos
                        ? 'Disponível'
                        : 'Indisponível'}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`igreja-status ${igreja.status.toLowerCase()}`}
                    >
                      {igreja.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="igreja-action"
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
        <div className="igreja-modal-overlay">
          <div className="igreja-modal">
            <div className="igreja-modal-header">
              <div>
                <span>Parceria</span>
                <h2>Nova igreja</h2>
              </div>

              <button
                type="button"
                className="igreja-modal-close"
                onClick={() => setModalAberto(false)}
              >
                ×
              </button>
            </div>

            <form className="igreja-form">
              <div className="igreja-form-group">
                <label htmlFor="nomeIgreja">
                  Nome da igreja
                </label>

                <input
                  id="nomeIgreja"
                  type="text"
                  placeholder="Nome da igreja"
                />
              </div>

              <div className="igreja-form-row">
                <div className="igreja-form-group">
                  <label htmlFor="responsavelIgreja">
                    Pastor / responsável
                  </label>

                  <input
                    id="responsavelIgreja"
                    type="text"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="igreja-form-group">
                  <label htmlFor="telefoneIgreja">
                    Telefone
                  </label>

                  <input
                    id="telefoneIgreja"
                    type="tel"
                    placeholder="(83) 99999-9999"
                  />
                </div>
              </div>

              <div className="igreja-form-group">
                <label htmlFor="enderecoIgreja">
                  Endereço
                </label>

                <input
                  id="enderecoIgreja"
                  type="text"
                  placeholder="Rua, número..."
                />
              </div>

              <div className="igreja-form-row">
                <div className="igreja-form-group">
                  <label htmlFor="bairroIgreja">
                    Bairro
                  </label>

                  <input
                    id="bairroIgreja"
                    type="text"
                    placeholder="Bairro"
                  />
                </div>

                <div className="igreja-form-group">
                  <label htmlFor="cidadeIgreja">
                    Cidade
                  </label>

                  <input
                    id="cidadeIgreja"
                    type="text"
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div className="igreja-form-group">
                <label htmlFor="referenciaIgreja">
                  Ponto de referência
                </label>

                <input
                  id="referenciaIgreja"
                  type="text"
                  placeholder="Ponto de referência"
                />
              </div>

              <div className="igreja-form-group">
                <label htmlFor="instagramIgreja">
                  Instagram
                </label>

                <input
                  id="instagramIgreja"
                  type="text"
                  placeholder="@igreja"
                />
              </div>

              <div className="igreja-form-row">
                <div className="igreja-form-group">
                  <label htmlFor="statusNovaIgreja">
                    Status da parceria
                  </label>

                  <select
                    id="statusNovaIgreja"
                    defaultValue="Pendente"
                  >
                    <option value="Pendente">
                      Pendente
                    </option>

                    <option value="Ativa">
                      Ativa
                    </option>

                    <option value="Inativa">
                      Inativa
                    </option>
                  </select>
                </div>

                <div className="igreja-form-group">
                  <label htmlFor="recebeConvertidos">
                    Recebe novos convertidos?
                  </label>

                  <select
                    id="recebeConvertidos"
                    defaultValue="sim"
                  >
                    <option value="sim">
                      Sim
                    </option>

                    <option value="nao">
                      Não
                    </option>
                  </select>
                </div>
              </div>

              <div className="igreja-form-group">
                <label htmlFor="observacaoIgreja">
                  Observações
                </label>

                <textarea
                  id="observacaoIgreja"
                  rows="4"
                  placeholder="Informações adicionais sobre a parceria..."
                />
              </div>

              <div className="igreja-modal-actions">
                <button
                  type="button"
                  className="igreja-cancel-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="igreja-save-button"
                >
                  Salvar igreja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Igrejas