import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { listarEventos } from '../../services/eventService'

import {
  buscarStatusSympla,
  sincronizarParticipantesSympla,
  vincularEventoSympla,
} from '../../services/symplaService'

import './Sympla.css'

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
  const [eventos, setEventos] = useState([])
  const [eventoSelecionadoId, setEventoSelecionadoId] =
    useState('')

  const [status, setStatus] = useState(null)
  const [resultadoAtual, setResultadoAtual] =
    useState(null)

  const [externalEventId, setExternalEventId] =
    useState('')

  const [carregandoEventos, setCarregandoEventos] =
    useState(true)

  const [carregandoStatus, setCarregandoStatus] =
    useState(false)

  const [vinculando, setVinculando] =
    useState(false)

  const [sincronizando, setSincronizando] =
    useState(false)

  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!eventoSelecionadoId) {
      setStatus(null)
      setResultadoAtual(null)
      setExternalEventId('')
      return
    }

    carregarStatus(eventoSelecionadoId)
  }, [eventoSelecionadoId])

  async function carregarEventos() {
    setCarregandoEventos(true)
    setErro('')

    try {
      const resposta = await listarEventos({
        page: 0,
        size: 100,
        sort: 'startDate,desc',
        active: true,
      })

      const lista = resposta?.content ?? []

      setEventos(lista)

      if (lista.length > 0) {
        setEventoSelecionadoId(
          String(lista[0].id),
        )
      }
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os eventos.',
      )
    } finally {
      setCarregandoEventos(false)
    }
  }

  async function carregarStatus(eventId) {
    if (!eventId) {
      return
    }

    setCarregandoStatus(true)
    setErro('')
    setResultadoAtual(null)

    try {
      const resposta =
        await buscarStatusSympla(eventId)

      setStatus(resposta)

      setExternalEventId(
        resposta?.externalEventId ?? '',
      )
    } catch (error) {
      setStatus(null)

      setErro(
        error.message ||
          'Não foi possível carregar os dados da integração.',
      )
    } finally {
      setCarregandoStatus(false)
    }
  }

  async function handleVincular(event) {
    event.preventDefault()

    if (
      vinculando ||
      !eventoSelecionadoId
    ) {
      return
    }

    const externalIdNormalizado =
      externalEventId.trim()

    if (!externalIdNormalizado) {
      setErro(
        'Informe o ID do evento na Sympla.',
      )
      return
    }

    setVinculando(true)
    setErro('')
    setResultadoAtual(null)

    try {
      const resposta =
        await vincularEventoSympla(
          eventoSelecionadoId,
          externalIdNormalizado,
        )

      setStatus(resposta)

      setExternalEventId(
        resposta?.externalEventId ??
          externalIdNormalizado,
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível vincular o evento à Sympla.',
      )
    } finally {
      setVinculando(false)
    }
  }

  async function handleSincronizar() {
    if (
      sincronizando ||
      !eventoSelecionadoId ||
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
          eventoSelecionadoId,
        )

      setResultadoAtual(resposta)

      await carregarStatus(
        eventoSelecionadoId,
      )
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

  const operacaoEmAndamento =
    carregandoStatus ||
    vinculando ||
    sincronizando

  if (carregandoEventos) {
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
            Vincule um evento interno à Sympla
            e sincronize os participantes
            cadastrados na plataforma.
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

          {eventoSelecionadoId && (
            <button
              type="button"
              onClick={() =>
                carregarStatus(
                  eventoSelecionadoId,
                )
              }
              disabled={operacaoEmAndamento}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      <div className="sympla-config-card">
        <div className="sympla-config-header">
          <div>
            <span className="sympla-config-label">
              Evento interno
            </span>

            <strong>
              Selecione o evento que será
              integrado
            </strong>
          </div>
        </div>

        {eventos.length === 0 ? (
          <div className="sympla-empty-state">
            Nenhum evento ativo foi encontrado.
          </div>
        ) : (
          <div className="sympla-config-grid">
            <div className="sympla-field">
              <label htmlFor="sympla-evento">
                Evento
              </label>

              <select
                id="sympla-evento"
                value={eventoSelecionadoId}
                onChange={(event) =>
                  setEventoSelecionadoId(
                    event.target.value,
                  )
                }
                disabled={operacaoEmAndamento}
              >
                {eventos.map((evento) => (
                  <option
                    key={evento.id}
                    value={evento.id}
                  >
                    {evento.name} — ID {evento.id}
                  </option>
                ))}
              </select>
            </div>

            <form
              className="sympla-link-form"
              onSubmit={handleVincular}
            >
              <div className="sympla-field">
                <label htmlFor="sympla-external-id">
                  ID do evento na Sympla
                </label>

                <input
                  id="sympla-external-id"
                  type="text"
                  value={externalEventId}
                  onChange={(event) =>
                    setExternalEventId(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: s35bac3"
                  maxLength={120}
                  disabled={
                    vinculando ||
                    sincronizando ||
                    !eventoSelecionadoId
                  }
                />
              </div>

              <button
                type="submit"
                className="sympla-link-button"
                disabled={
                  vinculando ||
                  sincronizando ||
                  !eventoSelecionadoId ||
                  !externalEventId.trim()
                }
              >
                {vinculando
                  ? 'Vinculando...'
                  : status?.connected
                    ? 'Atualizar vínculo'
                    : 'Vincular à Sympla'}
              </button>
            </form>
          </div>
        )}
      </div>

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
              vinculando ||
              carregandoStatus ||
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

        {carregandoStatus ? (
          <div className="sympla-card-loading">
            <div className="sympla-spinner" />

            <span>
              Carregando dados do evento...
            </span>
          </div>
        ) : (
          <>
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
                A sincronização cria
                participantes novos, atualiza
                dados vindos da Sympla e
                identifica cancelamentos.
                Sessão, chegada, telefone,
                observações e demais
                informações internas são
                preservadas.
              </p>
            </div>
          </>
        )}
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