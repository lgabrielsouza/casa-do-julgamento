import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  buscarStatusSympla,
  sincronizarParticipantesSympla,
} from '../../services/symplaService'

import './Sympla.css'

const EVENT_ID = 9

function formatarDataHora(valor) {
  if (!valor) {
    return 'Ainda não realizada'
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return 'Data indisponível'
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  ).format(data)
}

function Sympla() {
  const [status, setStatus] = useState(null)
  const [resultadoAtual, setResultadoAtual] =
    useState(null)

  const [carregando, setCarregando] =
    useState(true)

  const [sincronizando, setSincronizando] =
    useState(false)

  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarStatus()
  }, [])

  async function carregarStatus() {
    setCarregando(true)
    setErro('')

    try {
      const resposta =
        await buscarStatusSympla(EVENT_ID)

      setStatus(resposta)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os dados da integração.',
      )
    } finally {
      setCarregando(false)
    }
  }

  async function handleSincronizar() {
    if (
      sincronizando ||
      !status?.connected
    ) {
      return
    }

    setSincronizando(true)
    setErro('')
    setResultadoAtual(null)

    try {
      const resposta =
        await sincronizarParticipantesSympla(
          EVENT_ID,
        )

      setResultadoAtual(resposta)

      await carregarStatus()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível sincronizar os participantes.',
      )
    } finally {
      setSincronizando(false)
    }
  }

  const ultimoResultado = useMemo(() => {
    if (resultadoAtual) {
      return {
        created:
          resultadoAtual.created ?? 0,
        updated:
          resultadoAtual.updated ?? 0,
        ignored:
          resultadoAtual.ignored ?? 0,
        errors:
          resultadoAtual.errors ?? 0,
      }
    }

    if (!status?.lastSyncAt) {
      return null
    }

    return {
      created: status.lastCreated ?? 0,
      updated: status.lastUpdated ?? 0,
      ignored: status.lastIgnored ?? 0,
      errors: status.lastErrors ?? 0,
    }
  }, [resultadoAtual, status])

  const sincronizacaoComErros =
    (ultimoResultado?.errors ?? 0) > 0

  if (carregando && !status) {
    return (
      <section className="sympla-page">
        <div className="sympla-loading">
          <div className="sympla-spinner" />

          <p>
            Carregando integração com a
            Sympla...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="sympla-page">
      <header className="sympla-page-header">
        <div>
          <span className="sympla-eyebrow">
            Integração
          </span>

          <h1>Sympla</h1>

          <p>
            Importe e atualize os participantes
            do evento cadastrados na Sympla.
          </p>
        </div>

        <div
          className={`sympla-status-badge ${
            status?.connected
              ? 'is-connected'
              : 'is-disconnected'
          }`}
        >
          <span className="sympla-status-dot" />

          {status?.connected
            ? 'Conectado'
            : 'Desconectado'}
        </div>
      </header>

      {erro && (
        <div className="sympla-alert sympla-alert-error">
          <strong>
            Não foi possível concluir.
          </strong>

          <span>{erro}</span>

          <button
            type="button"
            onClick={carregarStatus}
            disabled={sincronizando}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="sympla-card">
        <div className="sympla-card-top">
          <div className="sympla-provider">
            <div className="sympla-provider-logo">
              S
            </div>

            <div>
              <span>Plataforma integrada</span>
              <strong>Sympla</strong>
            </div>
          </div>

          <button
            type="button"
            className="sympla-sync-button"
            onClick={handleSincronizar}
            disabled={
              sincronizando ||
              !status?.connected
            }
          >
            {sincronizando ? (
              <>
                <span className="sympla-button-spinner" />
                Sincronizando...
              </>
            ) : (
              'Sincronizar agora'
            )}
          </button>
        </div>

        <div className="sympla-info-grid">
          <article className="sympla-info-item">
            <span>Evento interno</span>

            <strong>
              {status?.eventName || '—'}
            </strong>
          </article>

          <article className="sympla-info-item">
            <span>ID do evento interno</span>

            <strong>
              {status?.eventId || '—'}
            </strong>
          </article>

          <article className="sympla-info-item">
            <span>ID do evento na Sympla</span>

            <strong className="sympla-code">
              {status?.externalEventId || '—'}
            </strong>
          </article>

          <article className="sympla-info-item sympla-info-highlight">
            <span>
              Participantes sincronizados
            </span>

            <strong>
              {status?.synchronizedParticipants ??
                0}
            </strong>
          </article>

          <article className="sympla-info-item">
            <span>
              Última sincronização
            </span>

            <strong>
              {formatarDataHora(
                status?.lastSyncAt,
              )}
            </strong>
          </article>

          <article className="sympla-info-item">
            <span>
              Encontrados na Sympla
            </span>

            <strong>
              {status?.lastTotalFound ?? 0}
            </strong>
          </article>
        </div>

        <div className="sympla-explanation">
          <div className="sympla-explanation-icon">
            i
          </div>

          <p>
            A sincronização cria participantes
            novos, atualiza dados vindos da
            Sympla e identifica cancelamentos.
            Sessão, chegada, telefone,
            observações e demais informações
            internas são preservadas.
          </p>
        </div>
      </div>

      {sincronizando && (
        <div className="sympla-progress-card">
          <div className="sympla-progress-header">
            <div>
              <strong>
                Sincronização em andamento
              </strong>

              <span>
                Buscando e comparando
                participantes...
              </span>
            </div>

            <span className="sympla-progress-pulse" />
          </div>

          <div className="sympla-progress-bar">
            <span />
          </div>
        </div>
      )}

      {ultimoResultado &&
        !sincronizando && (
          <section className="sympla-result-card">
            <header>
              <div className="sympla-success-icon">
                {sincronizacaoComErros
                  ? '!'
                  : '✓'}
              </div>

              <div>
                <h2>
                  {sincronizacaoComErros
                    ? 'Sincronização concluída com pendências'
                    : 'Última sincronização concluída'}
                </h2>

                <p>
                  {sincronizacaoComErros
                    ? 'Parte dos registros não pôde ser processada.'
                    : 'Os dados da Sympla foram processados corretamente.'}
                </p>
              </div>
            </header>

            <div className="sympla-result-grid">
              <article>
                <span>Criados</span>

                <strong>
                  {ultimoResultado.created}
                </strong>
              </article>

              <article>
                <span>Atualizados</span>

                <strong>
                  {ultimoResultado.updated}
                </strong>
              </article>

              <article>
                <span>Sem alterações</span>

                <strong>
                  {ultimoResultado.ignored}
                </strong>
              </article>

              <article
                className={
                  sincronizacaoComErros
                    ? 'has-error'
                    : ''
                }
              >
                <span>Erros</span>

                <strong>
                  {ultimoResultado.errors}
                </strong>
              </article>
            </div>
          </section>
        )}
    </section>
  )
}

export default Sympla