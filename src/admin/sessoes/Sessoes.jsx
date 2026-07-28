import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Toast from '../../components/ui/Toast'
import { listarEventos } from '../../services/eventService'
import {
  criarSessao,
  listarSessoes,
} from '../../services/sessionService'

import './Sessoes.css'

const FORMULARIO_INICIAL = {
  date: '',
  startTime: '',
  capacity: 25,
  status: 'PLANNED',
}

const STATUS_CONFIG = {
  PLANNED: {
    label: 'Planejada',
    className: 'planejada',
  },
  OPEN: {
    label: 'Aberta',
    className: 'disponivel',
  },
  CLOSED: {
    label: 'Encerrada',
    className: 'encerrada',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'lotada',
  },
}

function converterDataLocal(dataIso) {
  if (!dataIso) {
    return null
  }

  const [ano, mes, dia] = dataIso
    .split('-')
    .map(Number)

  return new Date(ano, mes - 1, dia)
}

function formatarData(dataIso) {
  const data = converterDataLocal(dataIso)

  if (!data) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR').format(data)
}

function formatarHorario(horario) {
  if (!horario) {
    return '—'
  }

  return horario.slice(0, 5)
}

function formatarPeriodo(evento) {
  if (!evento?.startDate || !evento?.endDate) {
    return ''
  }

  return `${formatarData(evento.startDate)} a ${formatarData(
    evento.endDate,
  )}`
}

function gerarDatasDoEvento(dataInicial, dataFinal) {
  const inicio = converterDataLocal(dataInicial)
  const fim = converterDataLocal(dataFinal)

  if (!inicio || !fim || fim < inicio) {
    return []
  }

  const datas = []
  const dataAtual = new Date(inicio)

  while (dataAtual <= fim) {
    const ano = dataAtual.getFullYear()
    const mes = String(
      dataAtual.getMonth() + 1,
    ).padStart(2, '0')
    const dia = String(
      dataAtual.getDate(),
    ).padStart(2, '0')

    datas.push(`${ano}-${mes}-${dia}`)

    dataAtual.setDate(dataAtual.getDate() + 1)
  }

  return datas
}

function Sessoes() {
  const [eventos, setEventos] = useState([])
  const [eventoSelecionadoId, setEventoSelecionadoId] =
    useState('')

  const [sessoes, setSessoes] = useState([])
  const [dataSelecionada, setDataSelecionada] =
    useState('')

  const [modalAberto, setModalAberto] =
    useState(false)

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const [carregandoEventos, setCarregandoEventos] =
    useState(true)

  const [carregandoSessoes, setCarregandoSessoes] =
    useState(false)

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [erroFormulario, setErroFormulario] =
    useState('')

  const [mensagemSucesso, setMensagemSucesso] =
    useState('')

  const eventoSelecionado = useMemo(
    () =>
      eventos.find(
        (evento) =>
          String(evento.id) ===
          String(eventoSelecionadoId),
      ) || null,
    [eventos, eventoSelecionadoId],
  )

  const datasDoEvento = useMemo(
    () =>
      gerarDatasDoEvento(
        eventoSelecionado?.startDate,
        eventoSelecionado?.endDate,
      ),
    [
      eventoSelecionado?.startDate,
      eventoSelecionado?.endDate,
    ],
  )

  const sessoesFiltradas = useMemo(
    () =>
      sessoes
        .filter(
          (sessao) =>
            sessao.date === dataSelecionada,
        )
        .sort((sessaoA, sessaoB) =>
          sessaoA.startTime.localeCompare(
            sessaoB.startTime,
          ),
        ),
    [sessoes, dataSelecionada],
  )

  useEffect(() => {
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!eventoSelecionadoId) {
      setSessoes([])
      return
    }

    carregarSessoes(eventoSelecionadoId)
  }, [eventoSelecionadoId])

  useEffect(() => {
    if (datasDoEvento.length === 0) {
      setDataSelecionada('')
      return
    }

    if (
      !dataSelecionada ||
      !datasDoEvento.includes(dataSelecionada)
    ) {
      setDataSelecionada(datasDoEvento[0])
    }
  }, [datasDoEvento, dataSelecionada])

  useEffect(() => {
    if (!mensagemSucesso) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setMensagemSucesso('')
    }, 4000)

    return () => window.clearTimeout(timeout)
  }, [mensagemSucesso])

  async function carregarEventos() {
    setCarregandoEventos(true)
    setErro('')

    try {
      const resposta = await listarEventos({
        page: 0,
        size: 100,
        sort: 'startDate,asc',
        active: true,
      })

      const eventosRecebidos =
        resposta.content || []

      setEventos(eventosRecebidos)

      if (eventosRecebidos.length > 0) {
        setEventoSelecionadoId(
          String(eventosRecebidos[0].id),
        )
      } else {
        setEventoSelecionadoId('')
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

  async function carregarSessoes(eventId) {
    setCarregandoSessoes(true)
    setErro('')

    try {
      const resposta = await listarSessoes({
        eventId,
        page: 0,
        size: 500,
        active: true,
        sort: ['date,asc', 'startTime,asc'],
      })

      setSessoes(resposta.content || [])
    } catch (error) {
      setSessoes([])

      setErro(
        error.message ||
          'Não foi possível carregar as sessões.',
      )
    } finally {
      setCarregandoSessoes(false)
    }
  }

  function selecionarEvento(event) {
    setEventoSelecionadoId(event.target.value)
    setDataSelecionada('')
  }

  function abrirModal() {
    if (!eventoSelecionado) {
      setErro(
        'Selecione um evento antes de cadastrar uma sessão.',
      )
      return
    }

    setErroFormulario('')

    setFormulario({
      ...FORMULARIO_INICIAL,
      date:
        dataSelecionada ||
        eventoSelecionado.startDate ||
        '',
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setErroFormulario('')
    setFormulario(FORMULARIO_INICIAL)
  }

  function atualizarCampoFormulario(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarSessao(event) {
    event.preventDefault()

    if (!eventoSelecionado) {
      setErroFormulario(
        'Selecione um evento válido.',
      )
      return
    }

    if (
      !formulario.date ||
      !formulario.startTime ||
      !formulario.capacity ||
      !formulario.status
    ) {
      setErroFormulario(
        'Preencha todos os campos obrigatórios.',
      )
      return
    }

    const capacidade = Number(
      formulario.capacity,
    )

    if (
      !Number.isInteger(capacidade) ||
      capacidade < 1
    ) {
      setErroFormulario(
        'A capacidade deve ser um número inteiro maior que zero.',
      )
      return
    }

    setSalvando(true)
    setErroFormulario('')

    try {
      const novaSessao = await criarSessao({
        eventId: eventoSelecionado.id,
        date: formulario.date,
        startTime: formulario.startTime,
        capacity: capacidade,
        status: formulario.status,
      })

      setSessoes((sessoesAtuais) =>
        [...sessoesAtuais, novaSessao].sort(
          (sessaoA, sessaoB) => {
            const comparacaoData =
              sessaoA.date.localeCompare(
                sessaoB.date,
              )

            if (comparacaoData !== 0) {
              return comparacaoData
            }

            return sessaoA.startTime.localeCompare(
              sessaoB.startTime,
            )
          },
        ),
      )

      setDataSelecionada(novaSessao.date)
      setMensagemSucesso(
        'Sessão cadastrada com sucesso.',
      )

      fecharModal()
    } catch (error) {
      setErroFormulario(
        error.message ||
          'Não foi possível cadastrar a sessão.',
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="sessoes-page">
      <Toast
        tipo="success"
        mensagem={mensagemSucesso}
        visivel={Boolean(mensagemSucesso)}
      />

      <div className="sessoes-heading">
        <div>
          <p className="sessoes-eyebrow">
            Programação
          </p>

          <h1>Sessões</h1>

          <p>
            Gerencie as datas, os horários e as
            capacidades das sessões.
          </p>
        </div>

        <button
          type="button"
          className="nova-sessao-button"
          onClick={abrirModal}
          disabled={
            carregandoEventos ||
            !eventoSelecionado
          }
        >
          + Nova sessão
        </button>
      </div>

      {erro && (
        <div
          role="alert"
          style={{
            marginBottom: '20px',
            padding: '13px 15px',
            border: '1px solid #f1caca',
            borderRadius: '8px',
            background: '#fff4f4',
            color: '#a50000',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {erro}
        </div>
      )}

      <section className="sessoes-evento">
        <div>
          <span>Evento selecionado</span>

          <strong>
            {carregandoEventos
              ? 'Carregando eventos...'
              : eventoSelecionado?.name ||
                'Nenhum evento disponível'}
          </strong>

          {eventoSelecionado && (
            <small
              style={{
                marginTop: '4px',
                color: '#929292',
                fontSize: '10px',
              }}
            >
              {formatarPeriodo(
                eventoSelecionado,
              )}
            </small>
          )}
        </div>

        <select
          value={eventoSelecionadoId}
          onChange={selecionarEvento}
          disabled={
            carregandoEventos ||
            eventos.length === 0
          }
        >
          {eventos.length === 0 ? (
            <option value="">
              Nenhum evento disponível
            </option>
          ) : (
            eventos.map((evento) => (
              <option
                key={evento.id}
                value={evento.id}
              >
                {evento.name}
              </option>
            ))
          )}
        </select>
      </section>

      <section className="sessoes-datas">
        <div className="sessoes-datas-header">
          <div>
            <h2>Datas do evento</h2>

            <p>
              Selecione uma data para visualizar
              as sessões programadas.
            </p>
          </div>
        </div>

        <div className="datas-list">
          {datasDoEvento.length > 0 ? (
            datasDoEvento.map((data) => (
              <button
                type="button"
                key={data}
                className={
                  dataSelecionada === data
                    ? 'data-button active'
                    : 'data-button'
                }
                onClick={() =>
                  setDataSelecionada(data)
                }
              >
                {formatarData(data)}
              </button>
            ))
          ) : (
            <span
              style={{
                color: '#888888',
                fontSize: '12px',
              }}
            >
              Selecione um evento para visualizar
              as datas.
            </span>
          )}
        </div>
      </section>

      <section className="sessoes-card">
        <div className="sessoes-card-header">
          <div>
            <h2>Sessões programadas</h2>

            <span>
              {dataSelecionada
                ? formatarData(dataSelecionada)
                : 'Nenhuma data selecionada'}
            </span>
          </div>

          <span className="sessoes-total">
            {sessoesFiltradas.length}{' '}
            {sessoesFiltradas.length === 1
              ? 'sessão'
              : 'sessões'}
          </span>
        </div>

        {carregandoSessoes ? (
          <div className="sessoes-empty">
            <strong>
              Carregando sessões...
            </strong>

            <p>
              Aguarde enquanto buscamos a
              programação do evento.
            </p>
          </div>
        ) : sessoesFiltradas.length > 0 ? (
          <div className="sessoes-table-wrapper">
            <table className="sessoes-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Data</th>
                  <th>Capacidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {sessoesFiltradas.map(
                  (sessao) => {
                    const status =
                      STATUS_CONFIG[
                        sessao.status
                      ] || {
                        label:
                          sessao.status ||
                          'Não definido',
                        className: '',
                      }

                    return (
                      <tr key={sessao.id}>
                        <td>
                          <strong>
                            {formatarHorario(
                              sessao.startTime,
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatarData(
                            sessao.date,
                          )}
                        </td>

                        <td>
                          {sessao.capacity}{' '}
                          pessoas
                        </td>

                        <td>
                          <span
                            className={`sessao-status ${status.className}`}
                          >
                            {status.label}
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
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sessoes-empty">
            <strong>
              Nenhuma sessão cadastrada
            </strong>

            <p>
              Ainda não existem sessões para{' '}
              {dataSelecionada
                ? formatarData(
                    dataSelecionada,
                  )
                : 'esta data'}
              .
            </p>

            <button
              type="button"
              onClick={abrirModal}
              disabled={!eventoSelecionado}
            >
              + Criar sessão
            </button>
          </div>
        )}
      </section>

      {modalAberto && (
        <div
          className="sessao-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fecharModal()
            }
          }}
        >
          <div
            className="sessao-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nova-sessao"
          >
            <div className="sessao-modal-header">
              <div>
                <span>Programação</span>

                <h2 id="titulo-nova-sessao">
                  Nova sessão
                </h2>
              </div>

              <button
                type="button"
                className="sessao-modal-close"
                aria-label="Fechar modal"
                onClick={fecharModal}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="sessao-form"
              onSubmit={salvarSessao}
            >
              <div className="sessao-form-group">
                <label htmlFor="eventoSessao">
                  Evento
                </label>

                <select
                  id="eventoSessao"
                  value={
                    eventoSelecionado?.id || ''
                  }
                  disabled
                >
                  <option
                    value={
                      eventoSelecionado?.id ||
                      ''
                    }
                  >
                    {eventoSelecionado?.name ||
                      'Evento não selecionado'}
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
                    name="date"
                    type="date"
                    value={formulario.date}
                    min={
                      eventoSelecionado?.startDate ||
                      undefined
                    }
                    max={
                      eventoSelecionado?.endDate ||
                      undefined
                    }
                    onChange={
                      atualizarCampoFormulario
                    }
                    disabled={salvando}
                    required
                  />
                </div>

                <div className="sessao-form-group">
                  <label htmlFor="horarioSessao">
                    Horário
                  </label>

                  <input
                    id="horarioSessao"
                    name="startTime"
                    type="time"
                    value={
                      formulario.startTime
                    }
                    onChange={
                      atualizarCampoFormulario
                    }
                    disabled={salvando}
                    required
                  />
                </div>
              </div>

              <div className="sessao-form-group">
                <label htmlFor="capacidadeSessao">
                  Capacidade
                </label>

                <input
                  id="capacidadeSessao"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formulario.capacity}
                  onChange={
                    atualizarCampoFormulario
                  }
                  disabled={salvando}
                  required
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
                  name="status"
                  value={formulario.status}
                  onChange={
                    atualizarCampoFormulario
                  }
                  disabled={salvando}
                  required
                >
                  <option value="PLANNED">
                    Planejada
                  </option>

                  <option value="OPEN">
                    Aberta
                  </option>

                  <option value="CLOSED">
                    Encerrada
                  </option>

                  <option value="CANCELLED">
                    Cancelada
                  </option>
                </select>
              </div>

              {erroFormulario && (
                <p
                  role="alert"
                  style={{
                    marginBottom: '16px',
                    padding: '11px 12px',
                    borderRadius: '7px',
                    background: '#fff0f0',
                    color: '#a50000',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {erroFormulario}
                </p>
              )}

              <div className="sessao-modal-actions">
                <button
                  type="button"
                  className="sessao-cancel-button"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="sessao-save-button"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : 'Salvar sessão'}
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