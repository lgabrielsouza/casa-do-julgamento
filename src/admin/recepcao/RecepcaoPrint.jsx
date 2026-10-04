import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  buscarListaImpressaoSessao,
} from '../../services/receptionService'

import './RecepcaoPrint.css'

const ORIGEM_LABELS = {
  MANUAL: 'Manual',
  SYMPLA: 'Sympla',
  COURTESY: 'Cortesia',
}

const CHEGADA_LABELS = {
  NOT_ARRIVED: 'Não chegou',
  ARRIVED: 'Chegou',
  READY_FOR_GROUP: 'Pronto para grupo',
}

function formatarData(data) {
  if (!data) {
    return '—'
  }

  const [ano, mes, dia] = data
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat(
    'pt-BR',
  ).format(
    new Date(ano, mes - 1, dia),
  )
}

function formatarHorario(horario) {
  return horario?.slice(0, 5) || '—'
}

function formatarDataHora(dataHora) {
  if (!dataHora) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  ).format(new Date(dataHora))
}

function formatarTelefone(phone) {
  if (!phone) {
    return '—'
  }

  const numeros = phone.replace(/\D/g, '')

  if (numeros.length === 11) {
    return `(${numeros.slice(
      0,
      2,
    )}) ${numeros.slice(
      2,
      7,
    )}-${numeros.slice(7)}`
  }

  if (numeros.length === 10) {
    return `(${numeros.slice(
      0,
      2,
    )}) ${numeros.slice(
      2,
      6,
    )}-${numeros.slice(6)}`
  }

  return phone
}

function RecepcaoPrint() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] =
    useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarLista()
  }, [sessionId])

  async function carregarLista() {
    setCarregando(true)
    setErro('')

    try {
      const resposta =
        await buscarListaImpressaoSessao(
          sessionId,
        )

      setDados(resposta)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar a lista da sessão.',
      )
    } finally {
      setCarregando(false)
    }
  }

  const totalChegaram = useMemo(() => {
    if (!dados?.participants) {
      return 0
    }

    return dados.participants.filter(
      (participante) =>
        participante.arrivalStatus ===
          'ARRIVED' ||
        participante.arrivalStatus ===
          'READY_FOR_GROUP',
    ).length
  }, [dados])

  const totalPendentes = useMemo(() => {
    if (!dados?.participants) {
      return 0
    }

    return dados.participants.filter(
      (participante) =>
        participante.arrivalStatus ===
        'NOT_ARRIVED',
    ).length
  }, [dados])

  if (carregando) {
    return (
      <div className="recepcao-print-loading">
        Carregando lista da sessão...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="recepcao-print-error">
        <h1>Não foi possível gerar a lista</h1>

        <p>{erro}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    )
  }

  if (!dados) {
    return null
  }

  return (
    <div className="recepcao-print-page">
      <div className="recepcao-print-toolbar">
        <button
          type="button"
          className="recepcao-print-back"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>

        <button
          type="button"
          className="recepcao-print-button"
          onClick={() => window.print()}
        >
          Imprimir lista
        </button>
      </div>

      <main className="recepcao-print-document">
        <header className="recepcao-print-header">
          <div className="recepcao-print-brand">
            <div className="recepcao-print-logo">
              <img
                src="/logo-cj.png"
                alt="Casa do Julgamento"
              />
            </div>

            <div>
              <span>
                Casa do Julgamento
              </span>

              <strong>
                Lista Oficial de Participantes
              </strong>
            </div>
          </div>

          <div className="recepcao-print-session-card">
            <span>Sessão</span>

            <strong>
              {formatarHorario(
                dados.sessionStartTime,
              )}
            </strong>

            <p>
              {formatarData(
                dados.sessionDate,
              )}
            </p>

            <small>
              Capacidade: {dados.capacity}{' '}
              pessoas
            </small>
          </div>
        </header>

        <section className="recepcao-print-event">
          <div className="recepcao-print-event-main">
            <span>Evento</span>

            <h1>{dados.eventName}</h1>
          </div>

          <div className="recepcao-print-generation">
            <span>Lista gerada em</span>

            <strong>
              {formatarDataHora(
                dados.generatedAt,
              )}
            </strong>
          </div>
        </section>

        <section className="recepcao-print-summary">
          <div>
            <span>Capacidade</span>

            <strong>{dados.capacity}</strong>
          </div>

          <div>
            <span>Participantes atuais</span>

            <strong>
              {dados.totalParticipants}
            </strong>
          </div>

          <div>
            <span>Chegaram</span>

            <strong>{totalChegaram}</strong>
          </div>

          <div>
            <span>Pendentes</span>

            <strong>{totalPendentes}</strong>
          </div>
        </section>

        <section className="recepcao-print-list">
          <div className="recepcao-print-list-heading">
            <div>
              <h2>Participantes da sessão</h2>

              <p>
                Lista gerada a partir dos dados
                atuais do sistema.
              </p>
            </div>

            <span>
              Gerada em{' '}
              {formatarDataHora(
                dados.generatedAt,
              )}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th className="col-numero">
                  Nº
                </th>

                <th>Participante</th>

                <th>Telefone</th>

                <th className="col-origem">
                  Origem
                </th>

                <th className="col-status">
                  Situação
                </th>

                <th className="col-marcacao">
                  Presença
                </th>

                <th className="col-observacao">
                  Observação
                </th>
              </tr>
            </thead>

            <tbody>
              {dados.participants.length >
              0 ? (
                dados.participants.map(
                  (
                    participante,
                    index,
                  ) => (
                    <tr key={participante.id}>
                      <td className="col-numero">
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </td>

                      <td>
                        <strong>
                          {
                            participante.fullName
                          }
                        </strong>

                        {participante.email && (
                          <small>
                            {
                              participante.email
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {formatarTelefone(
                          participante.phone,
                        )}
                      </td>

                      <td className="col-origem">
                        {ORIGEM_LABELS[
                          participante.source
                        ] ||
                          participante.source}
                      </td>

                      <td className="col-status">
                        {CHEGADA_LABELS[
                          participante
                            .arrivalStatus
                        ] ||
                          participante
                            .arrivalStatus}
                      </td>

                      <td className="col-marcacao">
                        <span className="recepcao-print-checkbox" />
                      </td>

                      <td className="col-observacao">
                        {participante.notes ||
                          ''}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="recepcao-print-empty"
                  >
                    Nenhum participante
                    vinculado a esta sessão.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <footer className="recepcao-print-footer">
          <div className="recepcao-print-footer-info">
            <div>
              <span>
                Total de participantes
              </span>

              <strong>
                {dados.totalParticipants}
              </strong>
            </div>

            <div>
              <span>Gerado em</span>

              <strong>
                {formatarDataHora(
                  dados.generatedAt,
                )}
              </strong>
            </div>
          </div>

          <div className="recepcao-print-signature">
            <span />

            <p>
              Responsável pela Recepção
            </p>
          </div>
        </footer>

        <p className="recepcao-print-warning">
          Esta lista representa os dados
          registrados no sistema no momento da
          geração e poderá sofrer alterações
          posteriores.
        </p>
      </main>
    </div>
  )
}

export default RecepcaoPrint