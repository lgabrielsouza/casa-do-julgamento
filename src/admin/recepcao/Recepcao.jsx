import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'
import Toast from '../../components/ui/Toast'
import { listarEventos } from '../../services/eventService'
import { listarSessoes } from '../../services/sessionService'
import {
  alterarSessaoRecepcao,
  desfazerChegada,
  listarParticipantesRecepcao,
  marcarProntoParaGrupo,
  registrarChegada,
} from '../../services/receptionService'

import './Recepcao.css'

const STATUS_CONFIG = {
  NOT_ARRIVED: {
    label: 'Não chegou',
    className: 'nao-chegou',
  },
  ARRIVED: {
    label: 'Chegou',
    className: 'chegou',
  },
  READY_FOR_GROUP: {
    label: 'Pronto para grupo',
    className: 'pronto',
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

function formatarChegada(dataHora) {
  if (!dataHora) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dataHora))
}

function ParticipanteItem({
  participante,
  selecionado,
  sessao,
  onSelecionar,
}) {
  const status =
    STATUS_CONFIG[participante.arrivalStatus] ||
    STATUS_CONFIG.NOT_ARRIVED

  return (
    <button
      type="button"
      className={`recepcao-participante-item ${
        selecionado ? 'selecionado' : ''
      }`}
      onClick={() => onSelecionar(participante)}
    >
      <span
        className={`recepcao-status-indicator ${status.className}`}
        aria-hidden="true"
      >
        {participante.arrivalStatus ===
        'READY_FOR_GROUP'
          ? '✓'
          : ''}
      </span>

      <span className="recepcao-participante-main">
        <strong>{participante.fullName}</strong>

        <small>
          {sessao
            ? `${formatarData(
                sessao.date,
              )} • ${formatarHorario(
                sessao.startTime,
              )}`
            : 'Sem sessão'}
        </small>
      </span>

      <span className="recepcao-participante-meta">
        {participante.arrivedAt
          ? formatarChegada(participante.arrivedAt)
          : status.label}
      </span>
    </button>
  )
}

function ListaParticipantes({
  titulo,
  quantidade,
  tipo,
  participantes,
  participanteSelecionado,
  sessoesPorId,
  onSelecionar,
}) {
  return (
    <section className={`recepcao-lista-card ${tipo}`}>
      <header>
        <div>
          <span className="recepcao-lista-label">
            {titulo}
          </span>

          <strong>{quantidade}</strong>
        </div>
      </header>

      <div className="recepcao-lista-content">
        {participantes.length > 0 ? (
          participantes.map((participante) => (
            <ParticipanteItem
              key={participante.id}
              participante={participante}
              selecionado={
                participanteSelecionado?.id ===
                participante.id
              }
              sessao={
                participante.eventSessionId
                  ? sessoesPorId.get(
                      String(
                        participante.eventSessionId,
                      ),
                    )
                  : null
              }
              onSelecionar={onSelecionar}
            />
          ))
        ) : (
          <div className="recepcao-lista-vazia">
            Nenhum participante neste status.
          </div>
        )}
      </div>
    </section>
  )
}

function Recepcao() {
  const buscaInputRef = useRef(null)

  const navigate = useNavigate()

  const [eventos, setEventos] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [participantes, setParticipantes] =
    useState([])

  const [
    eventoSelecionadoId,
    setEventoSelecionadoId,
  ] = useState('')

  const [
    sessaoSelecionadaId,
    setSessaoSelecionadaId,
  ] = useState('')

  const [
    participanteSelecionado,
    setParticipanteSelecionado,
  ] = useState(null)

  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] =
    useState(true)
  const [processando, setProcessando] =
    useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const eventoSelecionado = useMemo(
    () =>
      eventos.find(
        (evento) =>
          String(evento.id) ===
          String(eventoSelecionadoId),
      ) || null,
    [eventos, eventoSelecionadoId],
  )

  const sessoesPorId = useMemo(
    () =>
      new Map(
        sessoes.map((sessao) => [
          String(sessao.id),
          sessao,
        ]),
      ),
    [sessoes],
  )

  const sessaoFiltrada = useMemo(
    () =>
      sessoes.find(
        (sessao) =>
          String(sessao.id) ===
          String(sessaoSelecionadaId),
      ) || null,
    [sessoes, sessaoSelecionadaId],
  )

  const participantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const numeros = termo.replace(/\D/g, '')

    return participantes.filter((participante) => {
      const correspondeSessao =
        !sessaoSelecionadaId ||
        String(participante.eventSessionId) ===
          String(sessaoSelecionadaId)

      const correspondeNome =
        participante.fullName
          .toLowerCase()
          .includes(termo)

      const correspondeEmail =
        participante.email
          ?.toLowerCase()
          .includes(termo) ?? false

      const correspondeTelefone =
        numeros.length > 0 &&
        participante.phone.includes(numeros)

      const correspondeBusca =
        !termo ||
        correspondeNome ||
        correspondeEmail ||
        correspondeTelefone

      return correspondeSessao && correspondeBusca
    })
  }, [
    participantes,
    busca,
    sessaoSelecionadaId,
  ])

  const naoChegaram = useMemo(
    () =>
      participantesFiltrados.filter(
        (participante) =>
          participante.arrivalStatus ===
          'NOT_ARRIVED',
      ),
    [participantesFiltrados],
  )

  const chegaram = useMemo(
    () =>
      participantesFiltrados.filter(
        (participante) =>
          participante.arrivalStatus === 'ARRIVED',
      ),
    [participantesFiltrados],
  )

  const prontos = useMemo(
    () =>
      participantesFiltrados.filter(
        (participante) =>
          participante.arrivalStatus ===
          'READY_FOR_GROUP',
      ),
    [participantesFiltrados],
  )

  const resumo = useMemo(() => {
    const total = participantesFiltrados.length

    const chegaramTotal =
      chegaram.length + prontos.length

    const semSessao =
      participantesFiltrados.filter(
        (participante) =>
          participante.eventSessionId == null,
      ).length

    return {
      total,
      chegaram: chegaramTotal,
      prontos: prontos.length,
      naoChegaram: naoChegaram.length,
      semSessao,
    }
  }, [
    participantesFiltrados,
    chegaram,
    prontos,
    naoChegaram,
  ])

  const percentualChegada =
    resumo.total > 0
      ? Math.round(
          (resumo.chegaram / resumo.total) * 100,
        )
      : 0

  useEffect(() => {
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!eventoSelecionadoId) {
      return
    }

    carregarDadosDoEvento(eventoSelecionadoId)
  }, [eventoSelecionadoId])

  useEffect(() => {
    if (!sucesso) {
      return undefined
    }

    const timeout = window.setTimeout(
      () => setSucesso(''),
      3500,
    )

    return () => window.clearTimeout(timeout)
  }, [sucesso])

  function focarBusca() {
    window.setTimeout(() => {
      buscaInputRef.current?.focus()
    }, 50)
  }

  async function carregarEventos() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await listarEventos({
        page: 0,
        size: 100,
        active: true,
        sort: 'startDate,asc',
      })

      const lista = resposta.content || []

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

      setCarregando(false)
    }
  }

  async function carregarDadosDoEvento(eventId) {
    setCarregando(true)
    setErro('')
    setParticipanteSelecionado(null)

    try {
      const [
        respostaParticipantes,
        respostaSessoes,
      ] = await Promise.all([
        listarParticipantesRecepcao({
          eventId,
          page: 0,
          size: 500,
          sort: 'fullName,asc',
        }),

        listarSessoes({
          eventId,
          active: true,
          page: 0,
          size: 500,
          sort: [
            'date,asc',
            'startTime,asc',
          ],
        }),
      ])

      setParticipantes(
        respostaParticipantes.content || [],
      )

      setSessoes(
        respostaSessoes.content || [],
      )

      focarBusca()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar a Recepção.',
      )
    } finally {
      setCarregando(false)
    }
  }

  async function recarregarMantendoParticipante(
    eventId,
    participantId,
  ) {
    try {
      const [
        respostaParticipantes,
        respostaSessoes,
      ] = await Promise.all([
        listarParticipantesRecepcao({
          eventId,
          page: 0,
          size: 500,
          sort: 'fullName,asc',
        }),

        listarSessoes({
          eventId,
          active: true,
          page: 0,
          size: 500,
          sort: [
            'date,asc',
            'startTime,asc',
          ],
        }),
      ])

      const listaAtualizada =
        respostaParticipantes.content || []

      setParticipantes(listaAtualizada)
      setSessoes(respostaSessoes.content || [])

      const participanteAtualizado =
        listaAtualizada.find(
          (participante) =>
            participante.id === participantId,
        ) || null

      setParticipanteSelecionado(
        participanteAtualizado,
      )
    } catch {
      // A mensagem original da operação será mantida.
    }
  }

  function atualizarParticipanteNaLista(
    participanteAtualizado,
  ) {
    setParticipantes((listaAtual) =>
      listaAtual.map((participante) =>
        participante.id ===
        participanteAtualizado.id
          ? participanteAtualizado
          : participante,
      ),
    )

    setParticipanteSelecionado(
      participanteAtualizado,
    )
  }

  function selecionarProximoPendente(
    participanteAtual,
  ) {
    const proximo = naoChegaram.find(
      (participante) =>
        participante.id !== participanteAtual.id,
    )

    setParticipanteSelecionado(proximo || null)
    setBusca('')
    focarBusca()
  }

  async function executarAcao(
    acao,
    mensagem,
    opcoes = {},
  ) {
    if (!participanteSelecionado) {
      return
    }

    const participanteEmAtendimento =
      participanteSelecionado

    setProcessando(true)
    setErro('')

    try {
      const participanteAtualizado =
        await acao(
          participanteEmAtendimento.id,
          participanteEmAtendimento.version,
        )

      atualizarParticipanteNaLista(
        participanteAtualizado,
      )

      setSucesso(mensagem)

      if (opcoes.selecionarProximo) {
        selecionarProximoPendente(
          participanteEmAtendimento,
        )
      }
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível concluir a operação.',
      )

      await recarregarMantendoParticipante(
        eventoSelecionadoId,
        participanteEmAtendimento.id,
      )
    } finally {
      setProcessando(false)
    }
  }

  async function registrarChegadaSelecionado() {
    await executarAcao(
      registrarChegada,
      'Chegada registrada. Agora o participante pode ser marcado como pronto.',
    )
  }

  async function marcarSelecionadoPronto() {
    await executarAcao(
      marcarProntoParaGrupo,
      'Participante pronto para grupo.',
      {
        selecionarProximo: true,
      },
    )
  }

  async function desfazerChegadaSelecionado() {
    await executarAcao(
      desfazerChegada,
      'Chegada desfeita com sucesso.',
      {
        selecionarProximo: true,
      },
    )
  }

  async function trocarSessao(event) {
    if (!participanteSelecionado) {
      return
    }

    const participanteAtual =
      participanteSelecionado

    const novoId = event.target.value

    setProcessando(true)
    setErro('')

    try {
      const participanteAtualizado =
        await alterarSessaoRecepcao(
          participanteAtual.id,
          novoId ? Number(novoId) : null,
          participanteAtual.version,
        )

      atualizarParticipanteNaLista(
        participanteAtualizado,
      )

      setSucesso(
        novoId
          ? 'Sessão alterada com sucesso.'
          : 'Participante removido da sessão.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível alterar a sessão.',
      )

      await recarregarMantendoParticipante(
        eventoSelecionadoId,
        participanteAtual.id,
      )
    } finally {
      setProcessando(false)
    }
  }

  const sessaoDoSelecionado =
    participanteSelecionado?.eventSessionId
      ? sessoesPorId.get(
          String(
            participanteSelecionado.eventSessionId,
          ),
        )
      : null

  const statusSelecionado =
    participanteSelecionado
      ? STATUS_CONFIG[
          participanteSelecionado.arrivalStatus
        ]
      : null

  return (
    <div className="recepcao-page">
      <Toast
        tipo="success"
        mensagem={sucesso}
        visivel={Boolean(sucesso)}
      />

      <header className="recepcao-page-header">
        <div>
          <p className="recepcao-eyebrow">
            Operação do evento
          </p>

          <h1>Recepção</h1>

          <p>
            Registre chegadas e prepare os
            participantes para os grupos.
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
            <span>Sessão visualizada</span>

            <strong>
              {sessaoFiltrada
                ? `${formatarHorario(
                    sessaoFiltrada.startTime,
                  )} • ${formatarData(
                    sessaoFiltrada.date,
                  )}`
                : 'Todas as sessões'}
            </strong>
          </div>

          <span className="recepcao-evento-ativo">
            Evento ativo
          </span>
        </div>
      </header>

      {erro && (
        <div className="recepcao-alert">
          {erro}
        </div>
      )}

      <section className="recepcao-toolbar">
        <div className="recepcao-toolbar-group">
          <label htmlFor="eventoRecepcao">
            Evento
          </label>

          <select
            id="eventoRecepcao"
            value={eventoSelecionadoId}
            onChange={(event) => {
              setEventoSelecionadoId(
                event.target.value,
              )

              setSessaoSelecionadaId('')
              setBusca('')
            }}
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
          <label htmlFor="sessaoRecepcao">
            Sessão
          </label>

          <select
            id="sessaoRecepcao"
            value={sessaoSelecionadaId}
            onChange={(event) => {
              setSessaoSelecionadaId(
                event.target.value,
              )

              setParticipanteSelecionado(null)
            }}
          >
            <option value="">
              Todas as sessões
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

        <div className="recepcao-search">
          <label htmlFor="buscaRecepcao">
            Buscar participante
          </label>

          <input
            ref={buscaInputRef}
            id="buscaRecepcao"
            type="search"
            placeholder="Digite o nome, telefone ou e-mail..."
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="recepcao-refresh-button"
          onClick={() =>
            carregarDadosDoEvento(
              eventoSelecionadoId,
            )
          }
          disabled={carregando}
        >
          {carregando
            ? 'Atualizando...'
            : 'Atualizar'}
        </button>
        <div className="recepcao-print-tooltip">
          <button
            type="button"
            className="recepcao-print-session-button"
            onClick={() =>
              navigate(
                `/admin/recepcao/imprimir/${sessaoSelecionadaId}`,
              )
            }
            disabled={
              carregando ||
              !sessaoSelecionadaId
            }
          >
            Imprimir lista
          </button>

          {!sessaoSelecionadaId && (
            <span className="recepcao-print-tooltip-text">
              Selecione uma sessão para imprimir
            </span>
          )}
        </div>
      </section>

      <section className="recepcao-summary">
        <div>
          <span>Esperados</span>
          <strong>{resumo.total}</strong>
        </div>

        <div className="chegaram">
          <span>Chegaram</span>
          <strong>{resumo.chegaram}</strong>
          <small>{percentualChegada}%</small>
        </div>

        <div className="prontos">
          <span>Prontos para grupo</span>
          <strong>{resumo.prontos}</strong>
        </div>

        <div className="pendentes">
          <span>Ainda não chegaram</span>
          <strong>{resumo.naoChegaram}</strong>
        </div>

        <div className="sem-sessao">
          <span>Sem sessão</span>
          <strong>{resumo.semSessao}</strong>
        </div>
      </section>

      {carregando ? (
        <div className="recepcao-loading">
          Carregando operação da Recepção...
        </div>
      ) : (
        <main className="recepcao-workspace">
            <div className="recepcao-listas">
            <ListaParticipantes
                titulo="Ainda não chegaram"
                quantidade={naoChegaram.length}
                tipo="nao-chegaram"
                participantes={naoChegaram}
                participanteSelecionado={
                participanteSelecionado
                }
                sessoesPorId={sessoesPorId}
                onSelecionar={
                setParticipanteSelecionado
                }
            />

            <ListaParticipantes
                titulo="Chegaram"
                quantidade={chegaram.length}
                tipo="chegaram"
                participantes={chegaram}
                participanteSelecionado={
                participanteSelecionado
                }
                sessoesPorId={sessoesPorId}
                onSelecionar={
                setParticipanteSelecionado
                }
            />

            <ListaParticipantes
                titulo="Prontos para grupo"
                quantidade={prontos.length}
                tipo="prontos"
                participantes={prontos}
                participanteSelecionado={
                participanteSelecionado
                }
                sessoesPorId={sessoesPorId}
                onSelecionar={
                setParticipanteSelecionado
                }
            />
            </div>

          <aside className="recepcao-detail-panel">
            {participanteSelecionado ? (
              <>
                <div className="recepcao-detail-heading">
                  <div className="recepcao-avatar">
                    {participanteSelecionado.fullName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <span>
                      Participante selecionado
                    </span>

                    <h2>
                      {
                        participanteSelecionado.fullName
                      }
                    </h2>

                    <p>
                      {formatarTelefone(
                        participanteSelecionado.phone,
                      )}
                    </p>

                    <small>
                      {participanteSelecionado.email ||
                        'Sem e-mail'}
                    </small>
                  </div>
                </div>

                <div className="recepcao-detail-grid">
                  <div>
                    <span>Status atual</span>

                    <strong
                      className={`recepcao-detail-status ${statusSelecionado?.className}`}
                    >
                      {statusSelecionado?.label}
                    </strong>
                  </div>

                  <div>
                    <span>Horário da chegada</span>

                    <strong>
                      {formatarChegada(
                        participanteSelecionado.arrivedAt,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Sessão atual</span>

                    <strong>
                      {sessaoDoSelecionado
                        ? `${formatarHorario(
                            sessaoDoSelecionado.startTime,
                          )} • ${formatarData(
                            sessaoDoSelecionado.date,
                          )}`
                        : 'Sem sessão'}
                    </strong>
                  </div>

                  <div>
                    <span>Origem</span>

                    <strong>
                      {
                        participanteSelecionado.source
                      }
                    </strong>
                  </div>
                </div>

                <div className="recepcao-session-control">
                  <label htmlFor="trocarSessao">
                    Alterar sessão
                  </label>

                  <select
                    id="trocarSessao"
                    value={
                      participanteSelecionado.eventSessionId ??
                      ''
                    }
                    onChange={trocarSessao}
                    disabled={processando}
                  >
                    <option value="">
                      Sem sessão
                    </option>

                    {sessoes.map((sessao) => (
                      <option
                        key={sessao.id}
                        value={sessao.id}
                      >
                        {formatarData(
                          sessao.date,
                        )}
                        {' — '}
                        {formatarHorario(
                          sessao.startTime,
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="recepcao-observacoes">
                  <span>Observações</span>

                  <p>
                    {participanteSelecionado.notes ||
                      'Nenhuma observação registrada.'}
                  </p>
                </div>

                {participanteSelecionado.arrivalStatus ===
                  'ARRIVED' && (
                  <div className="recepcao-intermediate-alert">
                    A chegada foi registrada. Agora
                    confirme quando o participante
                    estiver pronto para entrar em um
                    grupo.
                  </div>
                )}

                <div className="recepcao-actions">
                  <button
                    type="button"
                    className="recepcao-action chegada"
                    onClick={
                      registrarChegadaSelecionado
                    }
                    disabled={
                      processando ||
                      participanteSelecionado.arrivalStatus !==
                        'NOT_ARRIVED'
                    }
                  >
                    Registrar chegada
                  </button>

                  <button
                    type="button"
                    className="recepcao-action pronto"
                    onClick={
                      marcarSelecionadoPronto
                    }
                    disabled={
                      processando ||
                      participanteSelecionado.arrivalStatus !==
                        'ARRIVED'
                    }
                  >
                    Pronto para grupo
                  </button>

                  <button
                    type="button"
                    className="recepcao-action desfazer"
                    onClick={
                      desfazerChegadaSelecionado
                    }
                    disabled={
                      processando ||
                      participanteSelecionado.arrivalStatus ===
                        'NOT_ARRIVED'
                    }
                  >
                    Desfazer chegada
                  </button>
                </div>
              </>
            ) : (
              <div className="recepcao-no-selection">
                <strong>
                  Selecione um participante
                </strong>

                <p>
                  Pesquise ou clique em um nome para
                  visualizar os dados e executar as
                  ações da Recepção.
                </p>
              </div>
            )}
          </aside>
        </main>
      )}
    </div>
  )
}

export default Recepcao