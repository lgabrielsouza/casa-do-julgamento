import { useState } from 'react'
import './Relatorios.css'

function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('participantes')
  const [periodo, setPeriodo] = useState('evento')

  const relatorios = [
    {
      titulo: 'Participantes',
      descricao: 'Lista completa de participantes cadastrados.',
      quantidade: 2350,
      chave: 'participantes',
    },
    {
      titulo: 'Ingressos',
      descricao: 'Ingressos emitidos, ativos e cancelados.',
      quantidade: 2350,
      chave: 'ingressos',
    },
    {
      titulo: 'Sessões',
      descricao: 'Ocupação e capacidade por sessão.',
      quantidade: 24,
      chave: 'sessoes',
    },
    {
      titulo: 'Decisões',
      descricao: 'Decisões registradas durante o evento.',
      quantidade: 186,
      chave: 'decisoes',
    },
    {
      titulo: 'Igrejas parceiras',
      descricao: 'Igrejas cadastradas para encaminhamento.',
      quantidade: 18,
      chave: 'igrejas',
    },
    {
      titulo: 'Check-ins internos',
      descricao: 'Entradas registradas diretamente pelo sistema.',
      quantidade: 72,
      chave: 'checkins',
    },
  ]

  function gerarRelatorio(event) {
    event.preventDefault()

    alert(
      `Relatório "${tipoRelatorio}" preparado para o período "${periodo}". A exportação real será conectada ao backend depois.`,
    )
  }

  return (
    <div className="relatorios-page">
      <div className="relatorios-heading">
        <div>
          <p className="relatorios-eyebrow">
            Administração
          </p>

          <h1>Relatórios</h1>

          <p>
            Consulte indicadores e prepare exportações dos dados do evento.
          </p>
        </div>
      </div>

      <section className="relatorios-summary">
        {relatorios.map((relatorio) => (
          <article
            key={relatorio.chave}
            className="relatorio-summary-card"
          >
            <span>{relatorio.titulo}</span>
            <strong>
              {relatorio.quantidade.toLocaleString('pt-BR')}
            </strong>
            <p>{relatorio.descricao}</p>
          </article>
        ))}
      </section>

      <div className="relatorios-grid">
        <section className="relatorios-card">
          <div className="relatorios-card-header">
            <h2>Gerar relatório</h2>

            <p>
              Escolha o tipo e o período desejado.
            </p>
          </div>

          <form
            className="relatorio-form"
            onSubmit={gerarRelatorio}
          >
            <div className="relatorio-form-group">
              <label htmlFor="tipoRelatorio">
                Tipo de relatório
              </label>

              <select
                id="tipoRelatorio"
                value={tipoRelatorio}
                onChange={(event) =>
                  setTipoRelatorio(event.target.value)
                }
              >
                <option value="participantes">
                  Participantes
                </option>

                <option value="ingressos">
                  Ingressos
                </option>

                <option value="sessoes">
                  Sessões
                </option>

                <option value="decisoes">
                  Decisões
                </option>

                <option value="igrejas">
                  Igrejas parceiras
                </option>

                <option value="checkins">
                  Check-ins internos
                </option>
              </select>
            </div>

            <div className="relatorio-form-group">
              <label htmlFor="periodoRelatorio">
                Período
              </label>

              <select
                id="periodoRelatorio"
                value={periodo}
                onChange={(event) =>
                  setPeriodo(event.target.value)
                }
              >
                <option value="evento">
                  Evento completo
                </option>

                <option value="29-10">
                  29/10/2026
                </option>

                <option value="30-10">
                  30/10/2026
                </option>

                <option value="31-10">
                  31/10/2026
                </option>

                <option value="12-11">
                  12/11/2026
                </option>

                <option value="13-11">
                  13/11/2026
                </option>

                <option value="14-11">
                  14/11/2026
                </option>
              </select>
            </div>

            <div className="relatorio-form-group">
              <label htmlFor="formatoRelatorio">
                Formato
              </label>

              <select
                id="formatoRelatorio"
                defaultValue="xlsx"
              >
                <option value="xlsx">
                  Excel (.xlsx)
                </option>

                <option value="csv">
                  CSV
                </option>

                <option value="pdf">
                  PDF
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="gerar-relatorio-button"
            >
              Gerar relatório
            </button>
          </form>
        </section>

        <section className="relatorios-card">
          <div className="relatorios-card-header">
            <h2>Visão geral</h2>

            <p>
              Indicadores resumidos do evento atual.
            </p>
          </div>

          <div className="relatorios-overview">
            <div>
              <span>Ingressos emitidos</span>
              <strong>2.350</strong>
            </div>

            <div>
              <span>Participantes únicos</span>
              <strong>2.214</strong>
            </div>

            <div>
              <span>Sessões cadastradas</span>
              <strong>24</strong>
            </div>

            <div>
              <span>Capacidade total</span>
              <strong>4.800</strong>
            </div>

            <div>
              <span>Decisões registradas</span>
              <strong>186</strong>
            </div>

            <div>
              <span>Igrejas disponíveis</span>
              <strong>15</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="relatorios-info">
        <div>
          <span>PagTickets</span>

          <strong>
            Dados externos
          </strong>

          <p>
            Os relatórios relacionados à PagTickets dependerão
            dos dados que a plataforma permitir exportar ou
            integrar futuramente.
          </p>
        </div>

        <div>
          <span>Sistema interno</span>

          <strong>
            Dados próprios
          </strong>

          <p>
            Cortesias, decisões, igrejas, usuários e demais
            registros internos poderão ser consultados diretamente
            no banco da Casa do Julgamento.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Relatorios