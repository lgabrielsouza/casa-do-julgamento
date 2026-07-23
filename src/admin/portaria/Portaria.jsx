import { useState } from 'react'
import './Portaria.css'

function Portaria() {
  const [busca, setBusca] = useState('')
  const [resultado, setResultado] = useState(null)

  const participantesTeste = [
    {
      id: 1,
      codigo: 'CJ-000421',
      nome: 'João da Silva',
      email: 'joao@email.com',
      telefone: '(83) 99999-0001',
      data: '29/10/2026',
      horario: '19:00',
      origem: 'PagTickets',
      status: 'Ativo',
    },
    {
      id: 2,
      codigo: 'CJ-000422',
      nome: 'Maria Souza',
      email: 'maria@email.com',
      telefone: '(83) 99999-0002',
      data: '29/10/2026',
      horario: '19:20',
      origem: 'PagTickets',
      status: 'Ativo',
    },
    {
      id: 3,
      codigo: 'CJ-000423',
      nome: 'Pedro Santos',
      email: 'pedro@email.com',
      telefone: '(83) 99999-0003',
      data: '29/10/2026',
      horario: '19:40',
      origem: 'Cortesia',
      status: 'Ativo',
    },
  ]

  function buscarParticipante(event) {
    event.preventDefault()

    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return
    }

    const encontrado = participantesTeste.find(
      (participante) =>
        participante.codigo.toLowerCase().includes(termo) ||
        participante.nome.toLowerCase().includes(termo) ||
        participante.email.toLowerCase().includes(termo) ||
        participante.telefone.toLowerCase().includes(termo),
    )

    if (!encontrado) {
      setResultado({
        encontrado: false,
      })

      return
    }

    setResultado({
      encontrado: true,
      participante: encontrado,
    })
  }

  function limparBusca() {
    setBusca('')
    setResultado(null)
  }

  return (
    <div className="portaria-page">
      <div className="portaria-heading">
        <div>
          <p className="portaria-eyebrow">
            Controle de acesso
          </p>

          <h1>Portaria</h1>

          <p>
            Central de apoio para consulta de participantes
            e controle de acesso ao evento.
          </p>
        </div>

        <div className="portaria-status">
          <span>Sistema interno</span>
          <strong>Online</strong>
        </div>
      </div>

      <section className="portaria-pagtickets">
        <div className="pagtickets-icon">
          QR
        </div>

        <div className="pagtickets-content">
          <span>Validação oficial</span>

          <h2>Ingressos PagTickets</h2>

          <p>
            Os ingressos vendidos pela PagTickets devem
            ser validados através do aplicativo oficial
            de controle de portaria fornecido pela plataforma.
          </p>
        </div>

        <div className="pagtickets-badge">
          APP PAGTICKETS
        </div>
      </section>

      <div className="portaria-grid">
        <section className="portaria-search-card">
          <div className="portaria-card-header">
            <h2>Consulta rápida</h2>

            <p>
              Localize um participante em caso de dúvidas
              ou problemas com o ingresso.
            </p>
          </div>

          <form
            className="portaria-search-form"
            onSubmit={buscarParticipante}
          >
            <label htmlFor="buscaPortaria">
              Participante ou ingresso
            </label>

            <input
              id="buscaPortaria"
              type="search"
              placeholder="Nome, telefone, e-mail ou código..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />

            <button type="submit">
              Buscar participante
            </button>
          </form>

          <div className="portaria-search-help">
            <strong>Você pode pesquisar por:</strong>

            <div>
              <span>Nome</span>
              <span>Telefone</span>
              <span>E-mail</span>
              <span>Código</span>
            </div>
          </div>
        </section>

        <section className="portaria-result-card">
          {!resultado && (
            <div className="portaria-waiting">
              <div className="portaria-waiting-icon">
                ?
              </div>

              <strong>
                Aguardando consulta
              </strong>

              <p>
                Pesquise um participante para visualizar
                os dados do ingresso.
              </p>
            </div>
          )}

          {resultado && !resultado.encontrado && (
            <div className="portaria-not-found">
              <div className="portaria-result-icon">
                ×
              </div>

              <h2>Não encontrado</h2>

              <p>
                Nenhum participante ou ingresso corresponde
                aos dados informados.
              </p>

              <button
                type="button"
                onClick={limparBusca}
              >
                Nova consulta
              </button>
            </div>
          )}

          {resultado?.encontrado && (
            <div className="portaria-participant-result">
              <div className="participant-result-header">
                <div>
                  <span>Participante encontrado</span>

                  <h2>
                    {resultado.participante.nome}
                  </h2>
                </div>

                <span className="participant-active">
                  {resultado.participante.status}
                </span>
              </div>

              <div className="participant-data-grid">
                <div>
                  <span>Código</span>
                  <strong>
                    {resultado.participante.codigo}
                  </strong>
                </div>

                <div>
                  <span>Origem</span>
                  <strong>
                    {resultado.participante.origem}
                  </strong>
                </div>

                <div>
                  <span>Data</span>
                  <strong>
                    {resultado.participante.data}
                  </strong>
                </div>

                <div>
                  <span>Sessão</span>
                  <strong>
                    {resultado.participante.horario}
                  </strong>
                </div>

                <div>
                  <span>Telefone</span>
                  <strong>
                    {resultado.participante.telefone}
                  </strong>
                </div>

                <div>
                  <span>E-mail</span>
                  <strong>
                    {resultado.participante.email}
                  </strong>
                </div>
              </div>

              {resultado.participante.origem ===
              'PagTickets' ? (
                <div className="validation-instruction pagtickets">
                  <strong>
                    Validação pelo PagTickets
                  </strong>

                  <p>
                    Este ingresso deve ser validado pelo
                    aplicativo oficial da PagTickets.
                  </p>

                  <span>
                    O sistema interno não deve confirmar
                    a entrada deste ingresso.
                  </span>
                </div>
              ) : (
                <div className="validation-instruction interno">
                  <strong>
                    Ingresso interno
                  </strong>

                  <p>
                    Este ingresso poderá ser validado pelo
                    sistema da Casa do Julgamento.
                  </p>

                  <button type="button">
                    Validar entrada
                  </button>
                </div>
              )}

              <button
                type="button"
                className="nova-consulta-button"
                onClick={limparBusca}
              >
                Nova consulta
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="portaria-origens">
        <div className="portaria-origens-header">
          <h2>Fluxo de validação</h2>

          <p>
            Cada tipo de ingresso possui seu próprio
            processo de entrada.
          </p>
        </div>

        <div className="origens-grid">
          <div className="origem-card">
            <span className="origem-number">
              01
            </span>

            <h3>PagTickets</h3>

            <p>
              Ingressos vendidos através da plataforma.
            </p>

            <strong>
              Validar no app PagTickets
            </strong>
          </div>

          <div className="origem-card">
            <span className="origem-number">
              02
            </span>

            <h3>Cortesias</h3>

            <p>
              Convites emitidos pela organização.
            </p>

            <strong>
              Validação interna
            </strong>
          </div>

          <div className="origem-card">
            <span className="origem-number">
              03
            </span>

            <h3>Credenciais</h3>

            <p>
              Equipe, voluntários e convidados.
            </p>

            <strong>
              Controle interno
            </strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Portaria