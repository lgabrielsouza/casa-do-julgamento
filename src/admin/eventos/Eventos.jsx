import { useState } from 'react'
import './Eventos.css'

function Eventos() {
  const [modalAberto, setModalAberto] = useState(false)

  const eventos = [
    {
      id: 1,
      nome: 'Casa do Julgamento 2026',
      periodo: '29/10/2026 a 14/11/2026',
      sessoes: 24,
      capacidade: 4800,
      status: 'Ativo',
    },
  ]

  return (
    <div className="eventos-page">
      <div className="eventos-heading">
        <div>
          <p className="eventos-eyebrow">Gerenciamento</p>
          <h1>Eventos</h1>
          <p>
            Cadastre e gerencie os eventos da Casa do Julgamento.
          </p>
        </div>

        <button
          type="button"
          className="novo-evento-button"
          onClick={() => setModalAberto(true)}
        >
          + Novo evento
        </button>
      </div>

      <section className="eventos-card">
        <div className="eventos-card-header">
          <div>
            <h2>Eventos cadastrados</h2>
            <span>{eventos.length} evento cadastrado</span>
          </div>

          <input
            type="search"
            placeholder="Buscar evento..."
          />
        </div>

        <div className="eventos-table-wrapper">
          <table className="eventos-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Período</th>
                <th>Sessões</th>
                <th>Capacidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>
                    <strong>{evento.nome}</strong>
                  </td>

                  <td>{evento.periodo}</td>

                  <td>{evento.sessoes}</td>

                  <td>
                    {evento.capacidade.toLocaleString('pt-BR')}
                  </td>

                  <td>
                    <span className="evento-status ativo">
                      {evento.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="evento-action"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && (
        <div className="evento-modal-overlay">
          <div className="evento-modal">
            <div className="evento-modal-header">
              <div>
                <span>Novo evento</span>
                <h2>Cadastrar evento</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAberto(false)}
              >
                ×
              </button>
            </div>

            <form className="evento-form">
              <div className="evento-form-group full">
                <label htmlFor="nomeEvento">
                  Nome do evento
                </label>

                <input
                  id="nomeEvento"
                  type="text"
                  placeholder="Ex.: Casa do Julgamento 2026"
                />
              </div>

              <div className="evento-form-row">
                <div className="evento-form-group">
                  <label htmlFor="dataInicio">
                    Data inicial
                  </label>

                  <input
                    id="dataInicio"
                    type="date"
                  />
                </div>

                <div className="evento-form-group">
                  <label htmlFor="dataFim">
                    Data final
                  </label>

                  <input
                    id="dataFim"
                    type="date"
                  />
                </div>
              </div>

              <div className="evento-form-group full">
                <label htmlFor="localEvento">
                  Local
                </label>

                <input
                  id="localEvento"
                  type="text"
                  placeholder="Local onde o evento será realizado"
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="descricaoEvento">
                  Descrição
                </label>

                <textarea
                  id="descricaoEvento"
                  rows="4"
                  placeholder="Descrição do evento..."
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="statusEvento">
                  Status
                </label>

                <select
                  id="statusEvento"
                  defaultValue="rascunho"
                >
                  <option value="rascunho">
                    Rascunho
                  </option>

                  <option value="ativo">
                    Ativo
                  </option>

                  <option value="encerrado">
                    Encerrado
                  </option>
                </select>
              </div>

              <div className="evento-modal-actions">
                <button
                  type="button"
                  className="evento-cancel-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="evento-save-button"
                >
                  Salvar evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Eventos