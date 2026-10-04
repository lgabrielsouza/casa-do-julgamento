import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Toast from '../../components/ui/Toast'
import { listarEventos } from '../../services/eventService'
import {
  listarSessoes,
} from '../../services/sessionService'
import {
  atualizarParticipante,
  buscarParticipantePorId,
  criarParticipante,
  desativarParticipante,
  listarParticipantes,
} from '../../services/participantService'

import './Participantes.css'

const FORMULARIO_INICIAL = {
  eventId: '',
  eventSessionId: '',
  fullName: '',
  email: '',
  phone: '',
  source: 'MANUAL',
  status: 'REGISTERED',
  notes: '',
  version: null,
}

const STATUS_CONFIG = {
  REGISTERED: {
    label: 'Inscrito',
    className: 'registrado',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'confirmado',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'cancelado',
  },
  NO_SHOW: {
    label: 'Ausente',
    className: 'ausente',
  },
}

const ORIGEM_CONFIG = {
  MANUAL: {
    label: 'Manual',
    className: 'manual',
  },
  SYMPLA: {
    label: 'Sympla',
    className: 'sympla',
  },
  IMPORT: {
    label: 'Importação',
    className: 'importacao',
  },
}

function formatarTelefone(phone) {
  if (!phone) {
    return '—'
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

function formatarData(dataIso) {
  if (!dataIso) {
    return '—'
  }

  const [ano, mes, dia] = dataIso
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('pt-BR').format(
    new Date(ano, mes - 1, dia),
  )
}

function formatarHorario(horario) {
  if (!horario) {
    return '—'
  }

  return horario.slice(0, 5)
}

function ordenarParticipantes(lista) {
  return [...lista].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'pt-BR'),
  )
}

function Participantes() {
  const [eventos, setEventos] = useState([])
  const [
    eventoSelecionadoId,
    setEventoSelecionadoId,
  ] = useState('')

  const [sessoes, setSessoes] = useState([])
  const [participantes, setParticipantes] =
    useState([])

  const [busca, setBusca] = useState('')
  const [filtroOrigem, setFiltroOrigem] =
    useState('')
  const [filtroStatus, setFiltroStatus] =
    useState('')

  const [modalAberto, setModalAberto] =
    useState(false)
  const [modoModal, setModoModal] =
    useState('create')

  const [
    participanteSelecionado,
    setParticipanteSelecionado,
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
    carregandoParticipantes,
    setCarregandoParticipantes,
  ] = useState(false)

  const [carregandoSessoes, setCarregandoSessoes] =
    useState(false)

  const [carregandoDetalhes, setCarregandoDetalhes] =
    useState(false)

  const [salvando, setSalvando] =
    useState(false)

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

  const sessoesPorId = useMemo(() => {
    return new Map(
      sessoes.map((sessao) => [
        String(sessao.id),
        sessao,
      ]),
    )
  }, [sessoes])

  const participantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const somenteNumeros = termo.replace(/\D/g, '')

    return participantes.filter((participante) => {
    const correspondeNome =
      participante.fullName
        .toLowerCase()
        .includes(termo)

    const correspondeEmail =
      participante.email
        ?.toLowerCase()
        .includes(termo) ?? false

    const correspondeTelefone =
      somenteNumeros.length > 0 &&
      participante.phone.includes(somenteNumeros)

    const correspondeBusca =
      !termo ||
      correspondeNome ||
      correspondeEmail ||
      correspondeTelefone

      const correspondeOrigem =
        !filtroOrigem ||
        participante.source === filtroOrigem

      const correspondeStatus =
        !filtroStatus ||
        participante.status === filtroStatus

      return (
        correspondeBusca &&
        correspondeOrigem &&
        correspondeStatus
      )
    })
  }, [
    participantes,
    busca,
    filtroOrigem,
    filtroStatus,
  ])

  const resumo = useMemo(() => {
    return participantes.reduce(
      (resultado, participante) => {
        resultado.total += 1

        if (
          participante.status === 'REGISTERED'
        ) {
          resultado.inscritos += 1
        }

        if (
          participante.status === 'CONFIRMED'
        ) {
          resultado.confirmados += 1
        }

        if (
          participante.eventSessionId == null
        ) {
          resultado.semSessao += 1
        }

        return resultado
      },
      {
        total: 0,
        inscritos: 0,
        confirmados: 0,
        semSessao: 0,
      },
    )
  }, [participantes])

  const somenteLeitura = modoModal === 'view'

  useEffect(() => {
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!eventoSelecionadoId) {
      setParticipantes([])
      setSessoes([])
      return
    }

    carregarDadosDoEvento(eventoSelecionadoId)
  }, [eventoSelecionadoId])

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
        active: true,
        sort: 'startDate,asc',
      })

      const eventosRecebidos =
        resposta.content || []

      setEventos(eventosRecebidos)

      if (eventosRecebidos.length > 0) {
        setEventoSelecionadoId(
          String(eventosRecebidos[0].id),
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

  async function carregarDadosDoEvento(eventId) {
    await Promise.all([
      carregarParticipantes(eventId),
      carregarSessoes(eventId),
    ])
  }

  async function carregarParticipantes(eventId) {
    setCarregandoParticipantes(true)
    setErro('')

    try {
      const resposta = await listarParticipantes({
        eventId,
        page: 0,
        size: 500,
        active: true,
        sort: 'fullName,asc',
      })

      setParticipantes(
        ordenarParticipantes(
          resposta.content || [],
        ),
      )
    } catch (error) {
      setParticipantes([])

      setErro(
        error.message ||
          'Não foi possível carregar os participantes.',
      )
    } finally {
      setCarregandoParticipantes(false)
    }
  }

  async function carregarSessoes(eventId) {
    setCarregandoSessoes(true)

    try {
      const resposta = await listarSessoes({
        eventId,
        page: 0,
        size: 500,
        active: true,
        sort: ['date,asc', 'startTime,asc'],
      })

      setSessoes(resposta.content || [])
    } catch {
      setSessoes([])
    } finally {
      setCarregandoSessoes(false)
    }
  }

  function selecionarEvento(event) {
    setEventoSelecionadoId(event.target.value)
    setBusca('')
    setFiltroOrigem('')
    setFiltroStatus('')
  }

  function abrirModalNovoParticipante() {
    if (!eventoSelecionado) {
      setErro(
        'Selecione um evento antes de cadastrar um participante.',
      )
      return
    }

    setModoModal('create')
    setParticipanteSelecionado(null)
    setErroFormulario('')

    setFormulario({
      ...FORMULARIO_INICIAL,
      eventId: String(eventoSelecionado.id),
    })

    setModalAberto(true)
  }

  async function abrirModalVisualizar(id) {
    await carregarParticipanteParaModal(
      id,
      'view',
    )
  }

  async function abrirModalEditar(id) {
    await carregarParticipanteParaModal(
      id,
      'edit',
    )
  }

  async function carregarParticipanteParaModal(
    id,
    modo,
  ) {
    setCarregandoDetalhes(true)
    setErro('')
    setErroFormulario('')

    try {
      const participante =
        await buscarParticipantePorId(id)

      setParticipanteSelecionado(participante)

      setFormulario({
        eventId: String(participante.eventId),
        eventSessionId:
          participante.eventSessionId != null
            ? String(
                participante.eventSessionId,
              )
            : '',
        fullName: participante.fullName || '',
        email: participante.email || '',
        phone: participante.phone || '',
        source:
          participante.source || 'MANUAL',
        status:
          participante.status || 'REGISTERED',
        notes: participante.notes || '',
        version: participante.version,
      })

      setModoModal(modo)
      setModalAberto(true)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar o participante.',
      )
    } finally {
      setCarregandoDetalhes(false)
    }
  }

  function abrirConfirmacaoDesativacao(
    participante,
  ) {
    setParticipanteSelecionado(participante)
    setConfirmarDesativacao(true)
  }

  function fecharModais() {
    if (salvando || processandoAcao) {
      return
    }

    setModalAberto(false)
    setConfirmarDesativacao(false)
    setParticipanteSelecionado(null)
    setModoModal('create')
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

  function validarFormulario() {
    if (!eventoSelecionado) {
      return 'Selecione um evento válido.'
    }

    if (!formulario.fullName.trim()) {
      return 'Informe o nome completo.'
    }

    if (!formulario.phone.trim()) {
      return 'Informe o telefone.'
    }

    const telefone = formulario.phone.replace(
      /\D/g,
      '',
    )

    if (telefone.length < 10) {
      return 'Informe um telefone válido com DDD.'
    }

    if (
      formulario.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formulario.email,
      )
    ) {
      return 'Informe um e-mail válido.'
    }

    if (!formulario.status) {
      return 'Selecione o status.'
    }

    return null
  }

  async function salvarParticipante(event) {
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

    setSalvando(true)
    setErroFormulario('')

    const eventSessionId =
      formulario.eventSessionId
        ? Number(formulario.eventSessionId)
        : null

    try {
      if (modoModal === 'create') {
        const novoParticipante =
          await criarParticipante({
            eventId: eventoSelecionado.id,
            eventSessionId,
            fullName: formulario.fullName,
            email: formulario.email || null,
            phone: formulario.phone,
            source: 'MANUAL',
            status: formulario.status,
            notes: formulario.notes || null,
          })

        setParticipantes(
          (participantesAtuais) =>
            ordenarParticipantes([
              ...participantesAtuais,
              novoParticipante,
            ]),
        )

        setMensagemSucesso(
          'Participante cadastrado com sucesso.',
        )
      }

      if (
        modoModal === 'edit' &&
        participanteSelecionado
      ) {
        const participanteAtualizado =
          await atualizarParticipante(
            participanteSelecionado.id,
            {
              eventSessionId,
              fullName: formulario.fullName,
              email: formulario.email || null,
              phone: formulario.phone,
              status: formulario.status,
              notes: formulario.notes || null,
              version: formulario.version,
            },
          )

        setParticipantes(
          (participantesAtuais) =>
            ordenarParticipantes(
              participantesAtuais.map(
                (participante) =>
                  participante.id ===
                  participanteAtualizado.id
                    ? participanteAtualizado
                    : participante,
              ),
            ),
        )

        setMensagemSucesso(
          'Participante atualizado com sucesso.',
        )
      }

      fecharModais()
    } catch (error) {
      setErroFormulario(
        error.message ||
          'Não foi possível salvar o participante.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarDesativarParticipante() {
    if (!participanteSelecionado) {
      return
    }

    setProcessandoAcao(true)
    setErro('')

    try {
      await desativarParticipante(
        participanteSelecionado.id,
      )

      setParticipantes(
        (participantesAtuais) =>
          participantesAtuais.filter(
            (participante) =>
              participante.id !==
              participanteSelecionado.id,
          ),
      )

      setMensagemSucesso(
        'Participante desativado com sucesso.',
      )

      setConfirmarDesativacao(false)
      setParticipanteSelecionado(null)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível desativar o participante.',
      )
    } finally {
      setProcessandoAcao(false)
    }
  }

  function obterTituloModal() {
    if (modoModal === 'view') {
      return 'Visualizar participante'
    }

    if (modoModal === 'edit') {
      return 'Editar participante'
    }

    return 'Novo participante'
  }

  return (
    <div className="participantes-page">
      <Toast
        tipo="success"
        mensagem={mensagemSucesso}
        visivel={Boolean(mensagemSucesso)}
      />

      <div className="participantes-heading">
        <div>
          <p className="participantes-eyebrow">
            Público
          </p>

          <h1>Participantes</h1>

          <p>
            Consulte, filtre e gerencie os
            participantes do evento.
          </p>
        </div>

        <div className="participantes-heading-actions">
          <button
            type="button"
            className="participante-new-button"
            onClick={abrirModalNovoParticipante}
            disabled={
              carregandoEventos ||
              !eventoSelecionado
            }
          >
            + Novo participante
          </button>
        </div>
      </div>

      {erro && (
        <div className="participantes-alert">
          {erro}
        </div>
      )}

      <section className="participantes-event-filter">
        <div className="participantes-filter-group">
          <label htmlFor="eventoParticipantes">
            Evento
          </label>

          <select
            id="eventoParticipantes"
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
      </section>

      <section className="participantes-summary">
        <div>
          <span>Total ativo</span>
          <strong>{resumo.total}</strong>
        </div>

        <div>
          <span>Inscritos</span>
          <strong>{resumo.inscritos}</strong>
        </div>

        <div>
          <span>Confirmados</span>
          <strong>{resumo.confirmados}</strong>
        </div>

        <div>
          <span>Sem sessão</span>
          <strong>{resumo.semSessao}</strong>
        </div>
      </section>

      <section className="participantes-card">
        <div className="participantes-filters">
          <div className="participantes-search">
            <label htmlFor="buscaParticipante">
              Buscar participante
            </label>

            <input
              id="buscaParticipante"
              type="search"
              placeholder="Nome, telefone ou e-mail..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          <div className="participantes-filter-group">
            <label htmlFor="origemParticipante">
              Origem
            </label>

            <select
              id="origemParticipante"
              value={filtroOrigem}
              onChange={(event) =>
                setFiltroOrigem(
                  event.target.value,
                )
              }
            >
              <option value="">Todas</option>
              <option value="MANUAL">
                Manual
              </option>
              <option value="SYMPLA">
                Sympla
              </option>
              <option value="IMPORT">
                Importação
              </option>
            </select>
          </div>

          <div className="participantes-filter-group">
            <label htmlFor="statusParticipante">
              Status
            </label>

            <select
              id="statusParticipante"
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(
                  event.target.value,
                )
              }
            >
              <option value="">Todos</option>
              <option value="REGISTERED">
                Inscrito
              </option>
              <option value="CONFIRMED">
                Confirmado
              </option>
              <option value="CANCELLED">
                Cancelado
              </option>
              <option value="NO_SHOW">
                Ausente
              </option>
            </select>
          </div>
        </div>

        <div className="participantes-card-header">
          <div>
            <h2>Lista de participantes</h2>

            <span>
              {participantesFiltrados.length}{' '}
              {participantesFiltrados.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="participantes-table-wrapper">
          <table className="participantes-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Contato</th>
                <th>Sessão</th>
                <th>Origem</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregandoParticipantes ? (
                <tr>
                  <td
                    colSpan="6"
                    className="participantes-empty"
                  >
                    Carregando participantes...
                  </td>
                </tr>
              ) : participantesFiltrados.length >
                0 ? (
                participantesFiltrados.map(
                  (participante) => {
                    const sessao =
                      participante.eventSessionId
                        ? sessoesPorId.get(
                            String(
                              participante.eventSessionId,
                            ),
                          )
                        : null

                    const origem =
                      ORIGEM_CONFIG[
                        participante.source
                      ] || {
                        label:
                          participante.source,
                        className: 'manual',
                      }

                    const status =
                      STATUS_CONFIG[
                        participante.status
                      ] || {
                        label:
                          participante.status,
                        className: 'registrado',
                      }

                    return (
                      <tr key={participante.id}>
                        <td>
                          <strong>
                            {participante.fullName}
                          </strong>

                          <span>
                            {participante.email ||
                              'Sem e-mail'}
                          </span>
                        </td>

                        <td>
                          {formatarTelefone(
                            participante.phone,
                          )}
                        </td>

                        <td>
                          {sessao ? (
                            <>
                              <strong>
                                {formatarData(
                                  sessao.date,
                                )}
                              </strong>

                              <span>
                                {formatarHorario(
                                  sessao.startTime,
                                )}
                              </span>
                            </>
                          ) : (
                            <span>
                              Não definida
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`origem-badge ${origem.className}`}
                          >
                            {origem.label}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`participante-status-badge ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td>
                          <div className="participante-actions">
                            <button
                              type="button"
                              className="participante-action"
                              onClick={() =>
                                abrirModalVisualizar(
                                  participante.id,
                                )
                              }
                              disabled={
                                carregandoDetalhes
                              }
                            >
                              Ver
                            </button>

                            <button
                              type="button"
                              className="participante-action"
                              onClick={() =>
                                abrirModalEditar(
                                  participante.id,
                                )
                              }
                              disabled={
                                carregandoDetalhes
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="participante-action participante-danger-action"
                              onClick={() =>
                                abrirConfirmacaoDesativacao(
                                  participante,
                                )
                              }
                            >
                              Desativar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="participantes-empty"
                  >
                    Nenhum participante encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalAberto && (
        <div
          className="participante-modal-overlay"
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
            className="participante-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-participante"
          >
            <div className="participante-modal-header">
              <div>
                <span>
                  {modoModal === 'create'
                    ? 'Cadastro manual'
                    : 'Participante'}
                </span>

                <h2 id="titulo-modal-participante">
                  {obterTituloModal()}
                </h2>
              </div>

              <button
                type="button"
                className="participante-modal-close"
                onClick={fecharModais}
                disabled={salvando}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <form
              className="participante-form"
              onSubmit={salvarParticipante}
            >
              <div className="participante-form-group">
                <label htmlFor="eventoFormulario">
                  Evento
                </label>

                <input
                  id="eventoFormulario"
                  value={
                    eventoSelecionado?.name || ''
                  }
                  disabled
                />
              </div>

              <div className="participante-form-group">
                <label htmlFor="nomeParticipante">
                  Nome completo
                </label>

                <input
                  id="nomeParticipante"
                  name="fullName"
                  type="text"
                  maxLength="150"
                  value={formulario.fullName}
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

              <div className="participante-form-row">
                <div className="participante-form-group">
                  <label htmlFor="telefoneParticipante">
                    Telefone
                  </label>

                  <input
                    id="telefoneParticipante"
                    name="phone"
                    type="tel"
                    maxLength="20"
                    value={formulario.phone}
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

                <div className="participante-form-group">
                  <label htmlFor="emailParticipante">
                    E-mail
                  </label>

                  <input
                    id="emailParticipante"
                    name="email"
                    type="email"
                    maxLength="180"
                    value={formulario.email}
                    onChange={
                      atualizarCampoFormulario
                    }
                    disabled={
                      salvando ||
                      somenteLeitura
                    }
                  />

                  <small>Campo opcional.</small>
                </div>
              </div>

              <div className="participante-form-group">
                <label htmlFor="sessaoParticipante">
                  Sessão
                </label>

                <select
                  id="sessaoParticipante"
                  name="eventSessionId"
                  value={
                    formulario.eventSessionId
                  }
                  onChange={
                    atualizarCampoFormulario
                  }
                  disabled={
                    salvando ||
                    somenteLeitura ||
                    carregandoSessoes
                  }
                >
                  <option value="">
                    Sem sessão definida
                  </option>

                  {sessoes.map((sessao) => (
                    <option
                      key={sessao.id}
                      value={sessao.id}
                    >
                      {formatarData(sessao.date)}
                      {' — '}
                      {formatarHorario(
                        sessao.startTime,
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="participante-form-row">
                <div className="participante-form-group">
                  <label htmlFor="origemParticipanteForm">
                    Origem
                  </label>

                  <select
                    id="origemParticipanteForm"
                    value={formulario.source}
                    disabled
                  >
                    <option value="MANUAL">
                      Manual
                    </option>
                    <option value="SYMPLA">
                      Sympla
                    </option>
                    <option value="IMPORT">
                      Importação
                    </option>
                  </select>
                </div>

                <div className="participante-form-group">
                  <label htmlFor="statusParticipanteForm">
                    Status
                  </label>

                  <select
                    id="statusParticipanteForm"
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
                    <option value="REGISTERED">
                      Inscrito
                    </option>
                    <option value="CONFIRMED">
                      Confirmado
                    </option>
                    <option value="CANCELLED">
                      Cancelado
                    </option>
                    <option value="NO_SHOW">
                      Ausente
                    </option>
                  </select>
                </div>
              </div>

              <div className="participante-form-group">
                <label htmlFor="observacoesParticipante">
                  Observações
                </label>

                <textarea
                  id="observacoesParticipante"
                  name="notes"
                  rows="4"
                  maxLength="2000"
                  value={formulario.notes}
                  onChange={
                    atualizarCampoFormulario
                  }
                  disabled={
                    salvando ||
                    somenteLeitura
                  }
                  placeholder="Informações adicionais sobre o participante."
                />
              </div>

              {erroFormulario && (
                <p
                  className="participante-form-error"
                  role="alert"
                >
                  {erroFormulario}
                </p>
              )}

              <div className="participante-modal-actions">
                <button
                  type="button"
                  className="participante-cancel-button"
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
                    className="participante-save-button"
                    disabled={salvando}
                  >
                    {salvando
                      ? 'Salvando...'
                      : modoModal === 'edit'
                        ? 'Salvar alterações'
                        : 'Salvar participante'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarDesativacao && (
        <div
          className="participante-modal-overlay"
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
            className="participante-modal participante-confirm-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="participante-modal-header">
              <div>
                <span>Atenção</span>
                <h2>Desativar participante</h2>
              </div>

              <button
                type="button"
                className="participante-modal-close"
                onClick={fecharModais}
                disabled={processandoAcao}
              >
                ×
              </button>
            </div>

            <div className="participante-confirm-content">
              <p>
                Deseja desativar{' '}
                <strong>
                  {
                    participanteSelecionado?.fullName
                  }
                </strong>
                ?
              </p>

              <small>
                O registro continuará armazenado no
                banco, mas deixará de aparecer na
                listagem de participantes ativos.
              </small>

              <div className="participante-modal-actions">
                <button
                  type="button"
                  className="participante-cancel-button"
                  onClick={fecharModais}
                  disabled={processandoAcao}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="participante-danger-button"
                  onClick={
                    confirmarDesativarParticipante
                  }
                  disabled={processandoAcao}
                >
                  {processandoAcao
                    ? 'Desativando...'
                    : 'Desativar participante'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Participantes