import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Toast from '../../components/ui/Toast'
import { listarEventos } from '../../services/eventService'
import {
  atualizarSessao,
  buscarSessaoPorId,
  criarSessao,
  desativarSessao,
  listarSessoes,
} from '../../services/sessionService'

import './Sessoes.css'

const FORMULARIO_INICIAL = {
  date: '',
  startTime: '',
  capacity: 25,
  status: 'PLANNED',
  version: null,
}

const STATUS_CONFIG = {
  PLANNED: {
    label: 'Planejada',
    className: 'planejada',
  },
  OPEN: {
    label: 'Aberta',
    className: 'aberta',
  },
  CLOSED: {
    label: 'Encerrada',
    className: 'encerrada',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'cancelada',
  },
}

const DIAS_SEMANA = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
]

function converterDataLocal(dataIso) {
  if (!dataIso) {
    return null
  }

  const [ano, mes, dia] = dataIso
    .split('-')
    .map(Number)

  return new Date(ano, mes - 1, dia)
}

function formatarDataCurta(dataIso) {
  const data = converterDataLocal(dataIso)

  if (!data) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(data)
}

function formatarDataCompleta(dataIso) {
  const data = converterDataLocal(dataIso)

  if (!data) {
    return 'Nenhuma data selecionada'
  }

  const dataFormatada =
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(data)

  const diaSemana =
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
    }).format(data)

  const diaSemanaFormatado =
    diaSemana.charAt(0).toUpperCase() +
    diaSemana.slice(1)

  return `${dataFormatada} (${diaSemanaFormatado})`
}

function formatarHorario(horario) {
  if (!horario) {
    return '—'
  }

  return horario.slice(0, 5)
}

function formatarPeriodo(evento) {
  if (!evento?.startDate || !evento?.endDate) {
    return 'Período não informado'
  }

  return `${formatarDataCurta(
    evento.startDate,
  )}/${evento.startDate.slice(0, 4)} — ${formatarDataCurta(
    evento.endDate,
  )}/${evento.endDate.slice(0, 4)}`
}

function obterDiaSemana(dataIso) {
  const data = converterDataLocal(dataIso)

  if (!data) {
    return ''
  }

  return DIAS_SEMANA[data.getDay()]
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

function ordenarSessoes(lista) {
  return [...lista].sort((sessaoA, sessaoB) => {
    const comparacaoData =
      sessaoA.date.localeCompare(sessaoB.date)

    if (comparacaoData !== 0) {
      return comparacaoData
    }

    return sessaoA.startTime.localeCompare(
      sessaoB.startTime,
    )
  })
}

function Sessoes() {
  const [eventos, setEventos] = useState([])
  const [
    eventoSelecionadoId,
    setEventoSelecionadoId,
  ] = useState('')

  const [sessoes, setSessoes] = useState([])
  const [
    dataSelecionada,
    setDataSelecionada,
  ] = useState('')

  const [modalAberto, setModalAberto] =
    useState(false)

  const [modoModal, setModoModal] =
    useState('create')

  const [
    sessaoSelecionada,
    setSessaoSelecionada,
  ] = useState(null)

  const [
    confirmarDesativacao,
    setConfirmarDesativacao,
  ] = useState(false)

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const [
    carregandoEventos,
    setCarregandoEventos,
  ] = useState(true)

  const [
    carregandoSessoes,
    setCarregandoSessoes,
  ] = useState(false)

  const [salvando, setSalvando] =
    useState(false)

  const [
    carregandoDetalhes,
    setCarregandoDetalhes,
  ] = useState(false)

  const [
    processandoAcao,
    setProcessandoAcao,
  ] = useState(false)

  const [erro, setErro] = useState('')
  const [
    erroFormulario,
    setErroFormulario,
  ] = useState('')

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] = useState('')

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

  const sessoesDoDia = useMemo(
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

  const resumoDoDia = useMemo(() => {
    return sessoesDoDia.reduce(
      (resumo, sessao) => {
        resumo.total += 1
        resumo.capacidade +=
          Number(sessao.capacity) || 0

        if (sessao.status === 'PLANNED') {
          resumo.planejadas += 1
        }

        if (sessao.status === 'OPEN') {
          resumo.abertas += 1
        }

        if (sessao.status === 'CLOSED') {
          resumo.encerradas += 1
        }

        if (sessao.status === 'CANCELLED') {
          resumo.canceladas += 1
        }

        return resumo
      },
      {
        total: 0,
        capacidade: 0,
        planejadas: 0,
        abertas: 0,
        encerradas: 0,
        canceladas: 0,
      },
    )
  }, [sessoesDoDia])

  const somenteLeitura =
    modoModal === 'view'

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

  useEffect(() => {
    if (!modalAberto && !confirmarDesativacao) {
      return undefined
    }

    function fecharComEscape(event) {
      if (
        event.key === 'Escape' &&
        !salvando &&
        !processandoAcao
      ) {
        fecharModais()
      }
    }

    document.addEventListener(
      'keydown',
      fecharComEscape,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        fecharComEscape,
      )
    }
  }, [
    modalAberto,
    confirmarDesativacao,
    salvando,
    processandoAcao,
  ])

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

      setSessoes(
        ordenarSessoes(resposta.content || []),
      )
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

  function preencherFormulario(sessao) {
    setFormulario({
      date: sessao.date,
      startTime: formatarHorario(
        sessao.startTime,
      ),
      capacity: sessao.capacity,
      status: sessao.status,
      version: sessao.version,
    })
  }

  function abrirModalNovaSessao() {
    if (!eventoSelecionado) {
      setErro(
        'Selecione um evento antes de cadastrar uma sessão.',
      )
      return
    }

    setModoModal('create')
    setSessaoSelecionada(null)
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

  async function abrirModalVisualizar(id) {
    await carregarSessaoParaModal(id, 'view')
  }

  async function abrirModalEditar(id) {
    await carregarSessaoParaModal(id, 'edit')
  }

  async function carregarSessaoParaModal(
    id,
    modo,
  ) {
    setCarregandoDetalhes(true)
    setErro('')
    setErroFormulario('')

    try {
      const sessao =
        await buscarSessaoPorId(id)

      setSessaoSelecionada(sessao)
      preencherFormulario(sessao)
      setModoModal(modo)
      setModalAberto(true)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar a sessão.',
      )
    } finally {
      setCarregandoDetalhes(false)
    }
  }

  function abrirConfirmacaoDesativacao(
    sessao,
  ) {
    setSessaoSelecionada(sessao)
    setConfirmarDesativacao(true)
  }

  function fecharModais() {
    if (salvando || processandoAcao) {
      return
    }

    setModalAberto(false)
    setConfirmarDesativacao(false)
    setModoModal('create')
    setSessaoSelecionada(null)
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

  function selecionarDataAnterior() {
    const indiceAtual =
      datasDoEvento.indexOf(dataSelecionada)

    if (indiceAtual > 0) {
      setDataSelecionada(
        datasDoEvento[indiceAtual - 1],
      )
    }
  }

  function selecionarProximaData() {
    const indiceAtual =
      datasDoEvento.indexOf(dataSelecionada)

    if (
      indiceAtual >= 0 &&
      indiceAtual < datasDoEvento.length - 1
    ) {
      setDataSelecionada(
        datasDoEvento[indiceAtual + 1],
      )
    }
  }

  function validarFormulario() {
    if (!eventoSelecionado) {
      return 'Selecione um evento válido.'
    }

    if (
      !formulario.date ||
      !formulario.startTime ||
      !formulario.capacity ||
      !formulario.status
    ) {
      return 'Preencha todos os campos obrigatórios.'
    }

    const capacidade = Number(
      formulario.capacity,
    )

    if (
      !Number.isInteger(capacidade) ||
      capacidade < 1
    ) {
      return 'A capacidade deve ser um número inteiro maior que zero.'
    }

    return null
  }

  async function salvarSessao(event) {
    event.preventDefault()

    if (somenteLeitura) {
      fecharModais()
      return
    }

    const mensagemValidacao =
      validarFormulario()

    if (mensagemValidacao) {
      setErroFormulario(mensagemValidacao)
      return
    }

    const capacidade = Number(
      formulario.capacity,
    )

    setSalvando(true)
    setErroFormulario('')

    try {
      if (modoModal === 'create') {
        const novaSessao =
          await criarSessao({
            eventId: eventoSelecionado.id,
            date: formulario.date,
            startTime: formulario.startTime,
            capacity: capacidade,
            status: formulario.status,
          })

        setSessoes((sessoesAtuais) =>
          ordenarSessoes([
            ...sessoesAtuais,
            novaSessao,
          ]),
        )

        setDataSelecionada(novaSessao.date)

        setMensagemSucesso(
          'Sessão cadastrada com sucesso.',
        )
      }

      if (
        modoModal === 'edit' &&
        sessaoSelecionada
      ) {
        const sessaoAtualizada =
          await atualizarSessao(
            sessaoSelecionada.id,
            {
              date: formulario.date,
              startTime:
                formulario.startTime,
              capacity: capacidade,
              status: formulario.status,
              version: formulario.version,
            },
          )

        setSessoes((sessoesAtuais) =>
          ordenarSessoes(
            sessoesAtuais.map((sessao) =>
              sessao.id ===
              sessaoAtualizada.id
                ? sessaoAtualizada
                : sessao,
            ),
          ),
        )

        setDataSelecionada(
          sessaoAtualizada.date,
        )

        setMensagemSucesso(
          'Sessão atualizada com sucesso.',
        )
      }

      fecharModais()
    } catch (error) {
      setErroFormulario(
        error.message ||
          'Não foi possível salvar a sessão.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarDesativarSessao() {
    if (!sessaoSelecionada) {
      return
    }

    setProcessandoAcao(true)
    setErro('')

    try {
      await desativarSessao(
        sessaoSelecionada.id,
      )

      setSessoes((sessoesAtuais) =>
        sessoesAtuais.filter(
          (sessao) =>
            sessao.id !==
            sessaoSelecionada.id,
        ),
      )

      setMensagemSucesso(
        'Sessão desativada com sucesso.',
      )

      setConfirmarDesativacao(false)
      setSessaoSelecionada(null)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível desativar a sessão.',
      )
    } finally {
      setProcessandoAcao(false)
    }
  }

  function obterTituloModal() {
    if (modoModal === 'view') {
      return 'Visualizar sessão'
    }

    if (modoModal === 'edit') {
      return 'Editar sessão'
    }

    return 'Nova sessão'
  }

  return (
    <div className="sessoes-page">
      <Toast
        tipo="success"
        mensagem={mensagemSucesso}
        visivel={Boolean(mensagemSucesso)}
      />

      <header className="sessoes-topbar">
        <div>
          <h1>Sessões</h1>

          <p>
            Gerencie as sessões do evento de forma
            rápida e visual.
          </p>
        </div>

        <div className="sessoes-topbar-actions">
          <button
            type="button"
            className="gerar-sessoes-button"
            disabled={!eventoSelecionado}
            title="A geração automática será implementada na próxima etapa."
          >
            <span aria-hidden="true">↻</span>
            Gerar sessões
          </button>

          <button
            type="button"
            className="nova-sessao-button"
            onClick={abrirModalNovaSessao}
            disabled={
              carregandoEventos ||
              !eventoSelecionado
            }
          >
            <span aria-hidden="true">＋</span>
            Nova sessão
          </button>
        </div>
      </header>

      {erro && (
        <div
          className="sessoes-alert"
          role="alert"
        >
          {erro}
        </div>
      )}

      <section className="sessoes-filtros">
        <div className="sessoes-filtro-group">
          <label htmlFor="eventoSelecionado">
            Evento
          </label>

          <select
            id="eventoSelecionado"
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
        </div>

        <div className="sessoes-filtro-group">
          <label>Período do evento</label>

          <div className="sessoes-periodo">
            <span aria-hidden="true">▣</span>

            {eventoSelecionado
              ? formatarPeriodo(eventoSelecionado)
              : 'Nenhum evento selecionado'}
          </div>
        </div>
      </section>

      <nav
        className="sessoes-date-navigation"
        aria-label="Datas do evento"
      >
        <button
          type="button"
          className="sessoes-date-arrow"
          onClick={selecionarDataAnterior}
          disabled={
            datasDoEvento.indexOf(
              dataSelecionada,
            ) <= 0
          }
          aria-label="Visualizar data anterior"
        >
          ‹
        </button>

        <div className="sessoes-date-list">
          {datasDoEvento.map((data) => (
            <button
              type="button"
              key={data}
              className={
                dataSelecionada === data
                  ? 'sessoes-date-item active'
                  : 'sessoes-date-item'
              }
              onClick={() =>
                setDataSelecionada(data)
              }
            >
              <strong>
                {formatarDataCurta(data)}
              </strong>

              <span>{obterDiaSemana(data)}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="sessoes-date-arrow"
          onClick={selecionarProximaData}
          disabled={
            datasDoEvento.indexOf(
              dataSelecionada,
            ) ===
            datasDoEvento.length - 1
          }
          aria-label="Visualizar próxima data"
        >
          ›
        </button>
      </nav>

      <div className="sessoes-content-grid">
        <main className="sessoes-main-content">
          <div className="sessoes-day-header">
            <div>
              <span
                className="sessoes-day-icon"
                aria-hidden="true"
              >
                ▣
              </span>

              <h2>
                {formatarDataCompleta(
                  dataSelecionada,
                )}
              </h2>
            </div>

            <span>
              {resumoDoDia.total}{' '}
              {resumoDoDia.total === 1
                ? 'sessão'
                : 'sessões'}
            </span>
          </div>

          {carregandoSessoes ? (
            <div className="sessoes-empty-state">
              <strong>
                Carregando sessões...
              </strong>

              <p>
                Aguarde enquanto buscamos a
                programação do evento.
              </p>
            </div>
          ) : sessoesDoDia.length === 0 ? (
            <div className="sessoes-empty-state">
              <span
                className="sessoes-empty-icon"
                aria-hidden="true"
              >
                ◷
              </span>

              <strong>
                Nenhuma sessão cadastrada
              </strong>

              <p>
                Ainda não existem sessões para esta
                data.
              </p>

              <button
                type="button"
                onClick={abrirModalNovaSessao}
                disabled={!eventoSelecionado}
              >
                ＋ Criar sessão
              </button>
            </div>
          ) : (
            <div className="sessoes-timeline">
              {sessoesDoDia.map((sessao) => {
                const configuracaoStatus =
                  STATUS_CONFIG[sessao.status] || {
                    label:
                      sessao.status ||
                      'Não definido',
                    className: 'planejada',
                  }

                return (
                  <article
                    className={`sessoes-timeline-item ${configuracaoStatus.className}`}
                    key={sessao.id}
                  >
                    <div
                      className="sessoes-timeline-marker"
                      aria-hidden="true"
                    />

                    <div className="sessoes-session-card">
                      <div className="sessoes-session-time">
                        {formatarHorario(
                          sessao.startTime,
                        )}
                      </div>

                      <span
                        className={`sessoes-session-status ${configuracaoStatus.className}`}
                      >
                        {configuracaoStatus.label}
                      </span>

                      <div className="sessoes-session-capacity">
                        <strong>
                          {sessao.capacity}{' '}
                          {sessao.capacity === 1
                            ? 'vaga'
                            : 'vagas'}
                        </strong>

                        <span>
                          Capacidade da sessão
                        </span>
                      </div>

                      <div className="sessoes-session-actions">
                        <button
                          type="button"
                          aria-label={`Visualizar sessão das ${formatarHorario(
                            sessao.startTime,
                          )}`}
                          title="Visualizar"
                          onClick={() =>
                            abrirModalVisualizar(
                              sessao.id,
                            )
                          }
                          disabled={
                            carregandoDetalhes
                          }
                        >
                          ◉
                        </button>

                        <button
                          type="button"
                          aria-label={`Editar sessão das ${formatarHorario(
                            sessao.startTime,
                          )}`}
                          title="Editar"
                          onClick={() =>
                            abrirModalEditar(
                              sessao.id,
                            )
                          }
                          disabled={
                            carregandoDetalhes
                          }
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="sessao-danger-action"
                          aria-label={`Desativar sessão das ${formatarHorario(
                            sessao.startTime,
                          )}`}
                          title="Desativar"
                          onClick={() =>
                            abrirConfirmacaoDesativacao(
                              sessao,
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>

        <aside className="sessoes-sidebar">
          <section className="sessoes-sidebar-card">
            <h2>Resumo do dia</h2>

            <div className="sessoes-summary-grid">
              <div className="sessoes-summary-item total">
                <span aria-hidden="true">▣</span>
                <div>
                  <small>Sessões no dia</small>
                  <strong>
                    {resumoDoDia.total}
                  </strong>
                </div>
              </div>

              <div className="sessoes-summary-item capacidade">
                <span aria-hidden="true">♙</span>
                <div>
                  <small>
                    Capacidade total
                  </small>
                  <strong>
                    {resumoDoDia.capacidade}
                  </strong>
                </div>
              </div>

              <div className="sessoes-summary-item planejadas">
                <span aria-hidden="true">◷</span>
                <div>
                  <small>Planejadas</small>
                  <strong>
                    {resumoDoDia.planejadas}
                  </strong>
                </div>
              </div>

              <div className="sessoes-summary-item abertas">
                <span aria-hidden="true">✓</span>
                <div>
                  <small>Abertas</small>
                  <strong>
                    {resumoDoDia.abertas}
                  </strong>
                </div>
              </div>

              <div className="sessoes-summary-item encerradas">
                <span aria-hidden="true">▣</span>
                <div>
                  <small>Encerradas</small>
                  <strong>
                    {resumoDoDia.encerradas}
                  </strong>
                </div>
              </div>

              <div className="sessoes-summary-item canceladas">
                <span aria-hidden="true">×</span>
                <div>
                  <small>Canceladas</small>
                  <strong>
                    {resumoDoDia.canceladas}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="sessoes-sidebar-card">
            <h2>Ações rápidas</h2>

            <div className="sessoes-quick-actions">
              <button
                type="button"
                disabled
                title="Disponível na próxima etapa."
              >
                <span aria-hidden="true">▣</span>
                <strong>
                  Gerar sessões para este dia
                </strong>
                <span aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                disabled
                title="Disponível em uma etapa futura."
              >
                <span aria-hidden="true">▢</span>
                <strong>
                  Copiar sessões de outro dia
                </strong>
                <span aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                disabled
                title="Disponível em uma etapa futura."
              >
                <span aria-hidden="true">↓</span>
                <strong>
                  Exportar lista do dia
                </strong>
                <span aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                disabled
                title="Disponível em uma etapa futura."
              >
                <span aria-hidden="true">▤</span>
                <strong>
                  Imprimir lista do dia
                </strong>
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </section>

          <section className="sessoes-sidebar-card">
            <h2>Legenda de status</h2>

            <div className="sessoes-status-legend">
              <div>
                <span className="planejada" />
                Planejada
              </div>

              <div>
                <span className="aberta" />
                Aberta
              </div>

              <div>
                <span className="encerrada" />
                Encerrada
              </div>

              <div>
                <span className="cancelada" />
                Cancelada
              </div>
            </div>
          </section>
        </aside>
      </div>

      {modalAberto && (
        <div
          className="sessao-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              fecharModais()
            }
          }}
        >
          <div
            className="sessao-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-sessao"
          >
            <div className="sessao-modal-header">
              <div>
                <span>Programação</span>

                <h2 id="titulo-modal-sessao">
                  {obterTituloModal()}
                </h2>
              </div>

              <button
                type="button"
                className="sessao-modal-close"
                aria-label="Fechar modal"
                onClick={fecharModais}
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
                      eventoSelecionado?.id || ''
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
                    disabled={
                      salvando ||
                      somenteLeitura
                    }
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
                    disabled={
                      salvando ||
                      somenteLeitura
                    }
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
                  disabled={
                    salvando ||
                    somenteLeitura
                  }
                  required
                />
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
                  disabled={
                    salvando ||
                    somenteLeitura
                  }
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

              {sessaoSelecionada &&
                modoModal !== 'create' && (
                  <div className="sessao-form-group">
                    <label>Versão do registro</label>

                    <input
                      type="text"
                      value={
                        sessaoSelecionada.version
                      }
                      disabled
                    />
                  </div>
                )}

              {erroFormulario && (
                <p
                  className="sessao-form-error"
                  role="alert"
                >
                  {erroFormulario}
                </p>
              )}

              <div className="sessao-modal-actions">
                <button
                  type="button"
                  className="sessao-cancel-button"
                  onClick={fecharModais}
                  disabled={salvando}
                >
                  {somenteLeitura
                    ? 'Fechar'
                    : 'Cancelar'}
                </button>

                {!somenteLeitura && (
                  <button
                    type="submit"
                    className="sessao-save-button"
                    disabled={salvando}
                  >
                    {salvando
                      ? 'Salvando...'
                      : modoModal === 'edit'
                        ? 'Salvar alterações'
                        : 'Salvar sessão'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarDesativacao && (
        <div
          className="sessao-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              fecharModais()
            }
          }}
        >
          <div
            className="sessao-modal sessao-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-desativar-sessao"
          >
            <div className="sessao-modal-header">
              <div>
                <span>Atenção</span>

                <h2 id="titulo-desativar-sessao">
                  Desativar sessão
                </h2>
              </div>

              <button
                type="button"
                className="sessao-modal-close"
                aria-label="Fechar modal"
                onClick={fecharModais}
                disabled={processandoAcao}
              >
                ×
              </button>
            </div>

            <div className="sessao-form">
              <p className="sessao-confirm-text">
                Deseja desativar a sessão das{' '}
                <strong>
                  {formatarHorario(
                    sessaoSelecionada?.startTime,
                  )}
                </strong>{' '}
                do dia{' '}
                <strong>
                  {formatarDataCurta(
                    sessaoSelecionada?.date,
                  )}
                </strong>
                ?
              </p>

              <p className="sessao-confirm-warning">
                A sessão deixará de aparecer na
                programação, mas continuará registrada
                no banco de dados.
              </p>

              <div className="sessao-modal-actions">
                <button
                  type="button"
                  className="sessao-cancel-button"
                  onClick={fecharModais}
                  disabled={processandoAcao}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="sessao-danger-button"
                  onClick={
                    confirmarDesativarSessao
                  }
                  disabled={processandoAcao}
                >
                  {processandoAcao
                    ? 'Desativando...'
                    : 'Desativar sessão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sessoes