import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { listarEventos } from '../../services/eventService'
import {
  liberarGrupo,
  listarMembrosDoGrupo,
  listarSessoesParaGrupos,
} from '../../services/receptionService'

import RecepcaoTabs from './RecepcaoTabs'

import './Recepcao.css'

function formatarData(data) {
  if (!data) {
    return '—'
  }

  const [ano, mes, dia] = data
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('pt-BR').format(
    new Date(ano, mes - 1, dia),
  )
}

function formatarHorario(horario) {
  return horario?.slice(0, 5) || '—'
}

function formatarTelefone(phone) {
  if (!phone) {
    return 'Sem telefone'
  }

  const numeros = phone.replace(/\D/g, '')

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7,
    )}-${numeros.slice(7)}`
  }

  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      6,
    )}-${numeros.slice(6)}`
  }

  return phone
}

function obterStatusGrupo(groupStatus) {
  switch (groupStatus) {
    case 'READY':
      return {
        label: 'Pronto',
        className: 'ready',
      }

    case 'RELEASED':
      return {
        label: 'Liberado',
        className: 'released',
      }

    case 'CANCELLED':
      return {
        label: 'Cancelado',
        className: 'cancelled',
      }

    case 'FORMING':
    default:
      return {
        label: 'Em formação',
        className: 'forming',
      }
  }
}

function obterStatusParticipante(arrivalStatus) {
  switch (arrivalStatus) {
    case 'READY_FOR_GROUP':
      return 'Pronto para grupo'

    case 'ARRIVED':
      return 'Chegou'

    case 'NOT_ARRIVED':
    default:
      return 'Não chegou'
  }
}

function RecepcaoGrupos() {
  const [eventos, setEventos] = useState([])

  const [
    eventoSelecionadoId,
    setEventoSelecionadoId,
  ] = useState('')

  const [
    dataSelecionada,
    setDataSelecionada,
  ] = useState('')

  const [grupos, setGrupos] = useState([])
  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [
    grupoSelecionado,
    setGrupoSelecionado,
  ] = useState(null)

  const [
    membrosGrupo,
    setMembrosGrupo,
  ] = useState([])

  const [
    carregandoMembros,
    setCarregandoMembros,
  ] = useState(false)

  const [
    liberandoGrupo,
    setLiberandoGrupo,
  ] = useState(false)

  const eventoSelecionado = useMemo(
    () =>
      eventos.find(
        (evento) =>
          String(evento.id) ===
          String(eventoSelecionadoId),
      ) || null,
    [eventos, eventoSelecionadoId],
  )

  const datasDisponiveis = useMemo(
    () =>
      [
        ...new Set(
          grupos.map(
            (grupo) => grupo.date,
          ),
        ),
      ].sort(),
    [grupos],
  )

  const gruposDaDataSelecionada = useMemo(
    () =>
      grupos.filter(
        (grupo) =>
          grupo.date === dataSelecionada,
      ),
    [grupos, dataSelecionada],
  )

  const resumoDoDia = useMemo(() => {
    const totalGrupos =
      gruposDaDataSelecionada.length

    const participantes =
      gruposDaDataSelecionada.reduce(
        (total, grupo) =>
          total + grupo.occupancy,
        0,
      )

    const liberados =
      gruposDaDataSelecionada.filter(
        (grupo) =>
          grupo.groupStatus === 'RELEASED',
      ).length

    const prontos =
      gruposDaDataSelecionada.filter(
        (grupo) =>
          grupo.groupStatus === 'READY',
      ).length

    return {
      totalGrupos,
      participantes,
      liberados,
      prontos,
    }
  }, [gruposDaDataSelecionada])

  useEffect(() => {
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!eventoSelecionadoId) {
      return
    }

    carregarGrupos(
      eventoSelecionadoId,
    )
  }, [eventoSelecionadoId])

  useEffect(() => {
    if (!sucesso) {
      return undefined
    }

    const timeout = window.setTimeout(
      () => setSucesso(''),
      3500,
    )

    return () =>
      window.clearTimeout(timeout)
  }, [sucesso])

  async function carregarEventos() {
    setCarregando(true)
    setErro('')

    try {
      const resposta =
        await listarEventos({
          page: 0,
          size: 100,
          active: true,
          sort: 'startDate,asc',
        })

      const lista =
        resposta.content || []

      setEventos(lista)

      if (lista.length > 0) {
        setEventoSelecionadoId(
          String(lista[0].id),
        )
      } else {
        setCarregando(false)
      }
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os eventos.',
      )

      setCarregando(false)
    }
  }

  async function carregarGrupos(
    eventId,
  ) {
    setCarregando(true)
    setErro('')
    fecharMembros()

    try {
      const resposta =
        await listarSessoesParaGrupos(
          eventId,
        )

      const lista = resposta || []

      setGrupos(lista)

      if (lista.length > 0) {
        setDataSelecionada(
          lista[0].date,
        )
      } else {
        setDataSelecionada('')
      }
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os grupos.',
      )

      setGrupos([])
      setDataSelecionada('')
    } finally {
      setCarregando(false)
    }
  }

  async function abrirMembros(grupo) {
    setGrupoSelecionado(grupo)
    setMembrosGrupo([])
    setCarregandoMembros(true)
    setErro('')

    try {
      const resposta =
        await listarMembrosDoGrupo(
          grupo.sessionId,
        )

      setMembrosGrupo(
        resposta || [],
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os participantes do grupo.',
      )

      setGrupoSelecionado(null)
    } finally {
      setCarregandoMembros(false)
    }
  }

  async function liberarGrupoSelecionado() {
    if (
      !grupoSelecionado ||
      grupoSelecionado.occupancy <= 0 ||
      grupoSelecionado.groupStatus === 'RELEASED' ||
      grupoSelecionado.groupStatus === 'CANCELLED'
    ) {
      return
    }

    setLiberandoGrupo(true)
    setErro('')

    try {
      await liberarGrupo(
        grupoSelecionado.sessionId,
      )

      const resposta =
        await listarSessoesParaGrupos(
          eventoSelecionadoId,
        )

      const lista = resposta || []

      setGrupos(lista)

      const grupoAtualizado =
        lista.find(
          (grupo) =>
            String(grupo.sessionId) ===
            String(
              grupoSelecionado.sessionId,
            ),
        ) || null

      setGrupoSelecionado(
        grupoAtualizado,
      )

      setSucesso(
        'Grupo liberado com sucesso.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível liberar o grupo.',
      )
    } finally {
      setLiberandoGrupo(false)
    }
  }

  function fecharMembros() {
    setGrupoSelecionado(null)
    setMembrosGrupo([])
    setCarregandoMembros(false)
    setLiberandoGrupo(false)
  }

  return (
    <div className="recepcao-page">
      <header className="recepcao-page-header">
        <div>
          <p className="recepcao-eyebrow">
            Operação do evento
          </p>

          <h1>Recepção</h1>

          <p>
            Acompanhe a formação,
            ocupação e liberação dos
            grupos.
          </p>
        </div>

        <div className="recepcao-header-operation">
          <div>
            <span>Evento</span>

            <strong>
              {eventoSelecionado?.name ||
                'Nenhum evento'}
            </strong>
          </div>

          <div>
            <span>Grupos</span>

            <strong>
              {
                gruposDaDataSelecionada.length
              }
            </strong>
          </div>

          <span className="recepcao-evento-ativo">
            Evento ativo
          </span>
        </div>
      </header>

      <RecepcaoTabs />

      {erro && (
        <div className="recepcao-alert">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="recepcao-success">
          {sucesso}
        </div>
      )}

      <section className="recepcao-toolbar">
        <div className="recepcao-toolbar-group">
          <label htmlFor="eventoGrupos">
            Evento
          </label>

          <select
            id="eventoGrupos"
            value={eventoSelecionadoId}
            onChange={(event) =>
              setEventoSelecionadoId(
                event.target.value,
              )
            }
          >
            {eventos.map((evento) => (
              <option
                key={evento.id}
                value={evento.id}
              >
                {evento.name}
              </option>
            ))}
          </select>
        </div>

        <div className="recepcao-toolbar-group">
          <label htmlFor="dataGrupos">
            Data
          </label>

          <select
            id="dataGrupos"
            value={dataSelecionada}
            onChange={(event) => {
              setDataSelecionada(
                event.target.value,
              )

              fecharMembros()
            }}
            disabled={
              carregando ||
              datasDisponiveis.length ===
                0
            }
          >
            {datasDisponiveis.map(
              (data) => (
                <option
                  key={data}
                  value={data}
                >
                  {formatarData(data)}
                </option>
              ),
            )}
          </select>
        </div>

        <button
          type="button"
          className="recepcao-refresh-button"
          onClick={() =>
            carregarGrupos(
              eventoSelecionadoId,
            )
          }
          disabled={
            carregando ||
            !eventoSelecionadoId
          }
        >
          {carregando
            ? 'Atualizando...'
            : 'Atualizar'}
        </button>
      </section>

      {carregando ? (
        <div className="recepcao-loading">
          Carregando grupos da
          Recepção...
        </div>
      ) : (
        <>
          <section className="recepcao-grupos-resumo">
            <div>
              <span>Grupos do dia</span>
              <strong>
                {resumoDoDia.totalGrupos}
              </strong>
            </div>

            <div>
              <span>Participantes</span>
              <strong>
                {resumoDoDia.participantes}
              </strong>
            </div>

            <div>
              <span>Prontos</span>
              <strong>
                {resumoDoDia.prontos}
              </strong>
            </div>

            <div>
              <span>Liberados</span>
              <strong>
                {resumoDoDia.liberados}
              </strong>
            </div>
          </section>

          <section className="recepcao-grupos-grid">
            {gruposDaDataSelecionada.length >
            0 ? (
              gruposDaDataSelecionada.map(
                (grupo) => {
                  const status =
                    obterStatusGrupo(
                      grupo.groupStatus,
                    )

                  const percentual =
                    grupo.capacity > 0
                      ? Math.min(
                          Math.round(
                            (grupo.occupancy /
                              grupo.capacity) *
                              100,
                          ),
                          100,
                        )
                      : 0

                  return (
                    <article
                      key={grupo.sessionId}
                      className={`recepcao-grupo-card ${status.className}`}
                    >
                      <header className="recepcao-grupo-card-header">
                        <div>
                          <span>
                            Horário
                          </span>

                          <strong>
                            {formatarHorario(
                              grupo.startTime,
                            )}
                          </strong>
                        </div>

                        <span
                          className={`recepcao-grupo-status ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </header>

                      <div className="recepcao-grupo-ocupacao">
                        <strong>
                          {grupo.occupancy}
                          {' / '}
                          {grupo.capacity}
                        </strong>

                        <span>
                          participantes
                        </span>
                      </div>

                      <div className="recepcao-grupo-progress">
                        <div
                          className="recepcao-grupo-progress-value"
                          style={{
                            width: `${percentual}%`,
                          }}
                        />
                      </div>

                      <div className="recepcao-grupo-info">
                        <span>
                          {percentual}% ocupado
                        </span>

                        <strong>
                          {grupo.groupStatus ===
                          'RELEASED'
                            ? 'Grupo liberado'
                            : `${grupo.available} vagas disponíveis`}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="recepcao-grupo-button"
                        onClick={() =>
                          abrirMembros(grupo)
                        }
                      >
                        Ver participantes
                      </button>
                    </article>
                  )
                },
              )
            ) : (
              <div className="recepcao-grupos-vazio">
                Nenhum grupo encontrado para
                esta data.
              </div>
            )}
          </section>
        </>
      )}

      {grupoSelecionado && (
        <div
          className="recepcao-grupo-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fecharMembros()
            }
          }}
        >
          <section className="recepcao-grupo-modal">
            <header className="recepcao-grupo-modal-header">
              <div>
                <span>
                  Grupo da Recepção
                </span>

                <h2>
                  {formatarHorario(
                    grupoSelecionado.startTime,
                  )}
                </h2>

                <p>
                  {formatarData(
                    grupoSelecionado.date,
                  )}
                  {' • '}
                  {grupoSelecionado.occupancy}/
                  {grupoSelecionado.capacity}
                  {' participantes'}
                </p>
              </div>

              <button
                type="button"
                className="recepcao-grupo-modal-close"
                onClick={fecharMembros}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="recepcao-grupo-modal-content">
              {carregandoMembros ? (
                <div className="recepcao-loading">
                  Carregando participantes...
                </div>
              ) : membrosGrupo.length > 0 ? (
                membrosGrupo.map(
                  (membro, index) => (
                    <div
                      key={membro.participantId}
                      className="recepcao-grupo-membro"
                    >
                      <div className="recepcao-grupo-membro-numero">
                        {index + 1}
                      </div>

                      <div className="recepcao-grupo-membro-info">
                        <strong>
                          {membro.fullName}
                        </strong>

                        <span>
                          {formatarTelefone(
                            membro.phone,
                          )}
                        </span>

                        <small>
                          {membro.email ||
                            'Sem e-mail'}
                        </small>
                      </div>

                      <span className="recepcao-grupo-membro-status">
                        {obterStatusParticipante(
                          membro.arrivalStatus,
                        )}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <div className="recepcao-grupos-vazio">
                  Este grupo ainda não possui
                  participantes.
                </div>
              )}

              <div className="recepcao-grupo-modal-footer">
                <div>
                  <strong>
                    {
                      grupoSelecionado.occupancy
                    }
                    {' participantes'}
                  </strong>

                  <span>
                    {
                      grupoSelecionado.available
                    }
                    {' vagas disponíveis'}
                  </span>
                </div>

                <button
                  type="button"
                  className="recepcao-grupo-release-button"
                  onClick={
                    liberarGrupoSelecionado
                  }
                  disabled={
                    liberandoGrupo ||
                    grupoSelecionado.occupancy <=
                      0 ||
                    grupoSelecionado.groupStatus ===
                      'RELEASED' ||
                    grupoSelecionado.groupStatus ===
                      'CANCELLED'
                  }
                >
                  {grupoSelecionado.groupStatus ===
                  'RELEASED'
                    ? 'Grupo liberado'
                    : liberandoGrupo
                      ? 'Liberando...'
                      : 'Liberar grupo'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default RecepcaoGrupos