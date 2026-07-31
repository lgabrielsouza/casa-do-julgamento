import { useEffect, useMemo, useState } from 'react'

import { gerarSessoes } from '../../services/sessionService'

const FORMULARIO_INICIAL = {
  startDate: '',
  endDate: '',
  startTime: '18:00',
  endTime: '22:00',
  intervalMinutes: 15,
  capacity: 25,
  status: 'PLANNED',
  weekdays: [],
}

const DIAS_SEMANA = [
  {
    value: 'SUNDAY',
    label: 'DOM',
    icon: '☀',
    weekend: true,
  },
  {
    value: 'MONDAY',
    label: 'SEG',
    icon: '▣',
  },
  {
    value: 'TUESDAY',
    label: 'TER',
    icon: '◔',
  },
  {
    value: 'WEDNESDAY',
    label: 'QUA',
    icon: '◆',
  },
  {
    value: 'THURSDAY',
    label: 'QUI',
    icon: '▦',
  },
  {
    value: 'FRIDAY',
    label: 'SEX',
    icon: '▤',
  },
  {
    value: 'SATURDAY',
    label: 'SÁB',
    icon: '★',
    weekend: true,
  },
]

function calcularQuantidade(formulario) {
  if (
    !formulario.startDate ||
    !formulario.endDate ||
    !formulario.startTime ||
    !formulario.endTime
  ) {
    return 0
  }

  const inicioData = new Date(
    `${formulario.startDate}T00:00:00`,
  )

  const fimData = new Date(
    `${formulario.endDate}T00:00:00`,
  )

  if (fimData < inicioData) {
    return 0
  }

  const [horaInicio, minutoInicio] =
    formulario.startTime.split(':').map(Number)

  const [horaFim, minutoFim] =
    formulario.endTime.split(':').map(Number)

  const minutosInicio =
    horaInicio * 60 + minutoInicio

  const minutosFim =
    horaFim * 60 + minutoFim

  const intervalo = Number(
    formulario.intervalMinutes,
  )

  if (
    minutosFim <= minutosInicio ||
    !Number.isInteger(intervalo) ||
    intervalo < 1
  ) {
    return 0
  }

  const sessoesPorDia = Math.ceil(
    (minutosFim - minutosInicio) / intervalo,
  )

  let quantidadeDias = 0
  const dataAtual = new Date(inicioData)

  while (dataAtual <= fimData) {
    const diaSemana = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ][dataAtual.getDay()]

    if (
      formulario.weekdays.length === 0 ||
      formulario.weekdays.includes(diaSemana)
    ) {
      quantidadeDias += 1
    }

    dataAtual.setDate(dataAtual.getDate() + 1)
  }

  return quantidadeDias * sessoesPorDia
}

function GerarSessoesModal({
  evento,
  onGenerated,
  onSuccess,
  onError,
}) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] =
    useState('')

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const quantidadePrevista = useMemo(
    () => calcularQuantidade(formulario),
    [formulario],
  )

  useEffect(() => {
    if (!aberto || !evento) {
      return
    }

    setFormulario({
      ...FORMULARIO_INICIAL,
      startDate: evento.startDate || '',
      endDate: evento.endDate || '',
    })

    setErroFormulario('')
  }, [aberto, evento])

  useEffect(() => {
    if (!aberto) {
      return undefined
    }

    function fecharComEscape(event) {
      if (event.key === 'Escape' && !salvando) {
        setAberto(false)
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
  }, [aberto, salvando])

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  function alternarDiaSemana(dia) {
    setFormulario((formularioAtual) => {
      const selecionado =
        formularioAtual.weekdays.includes(dia)

      return {
        ...formularioAtual,
        weekdays: selecionado
          ? formularioAtual.weekdays.filter(
              (item) => item !== dia,
            )
          : [...formularioAtual.weekdays, dia],
      }
    })
  }

  function validarFormulario() {
    if (!evento) {
      return 'Selecione um evento válido.'
    }

    if (
      !formulario.startDate ||
      !formulario.endDate ||
      !formulario.startTime ||
      !formulario.endTime ||
      !formulario.intervalMinutes ||
      !formulario.capacity ||
      !formulario.status
    ) {
      return 'Preencha todos os campos obrigatórios.'
    }

    if (formulario.startDate > formulario.endDate) {
      return 'A data inicial não pode ser posterior à data final.'
    }

    if (
      formulario.startDate < evento.startDate ||
      formulario.endDate > evento.endDate
    ) {
      return 'O período deve estar dentro das datas do evento.'
    }

    if (
      formulario.startTime >= formulario.endTime
    ) {
      return 'O horário inicial deve ser anterior ao horário final.'
    }

    const intervalo = Number(
      formulario.intervalMinutes,
    )

    if (
      !Number.isInteger(intervalo) ||
      intervalo < 1
    ) {
      return 'O intervalo deve ser um número inteiro maior que zero.'
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

    if (quantidadePrevista < 1) {
      return 'A configuração informada não gera nenhuma sessão.'
    }

    if (quantidadePrevista > 1000) {
      return 'A geração está limitada a 1.000 sessões por operação.'
    }

    return null
  }

  async function enviarFormulario(event) {
    event.preventDefault()

    const mensagemValidacao =
      validarFormulario()

    if (mensagemValidacao) {
      setErroFormulario(mensagemValidacao)
      return
    }

    setSalvando(true)
    setErroFormulario('')

    try {
      const sessoesGeradas = await gerarSessoes({
        eventId: evento.id,
        startDate: formulario.startDate,
        endDate: formulario.endDate,
        startTime: formulario.startTime,
        endTime: formulario.endTime,
        intervalMinutes: Number(
          formulario.intervalMinutes,
        ),
        capacity: Number(formulario.capacity),
        status: formulario.status,
        weekdays: formulario.weekdays,
      })

      setAberto(false)

      onSuccess?.(
        `${sessoesGeradas.length} ${
          sessoesGeradas.length === 1
            ? 'sessão foi gerada'
            : 'sessões foram geradas'
        } com sucesso.`,
      )

      await onGenerated?.(sessoesGeradas)
    } catch (error) {
      const mensagem =
        error.message ||
        'Não foi possível gerar as sessões.'

      setErroFormulario(mensagem)
      onError?.(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="gerar-sessoes-button"
        disabled={!evento}
        onClick={() => setAberto(true)}
      >
        <span aria-hidden="true">↻</span>
        Gerar sessões
      </button>

      {aberto && (
        <div
          className="sessao-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !salvando
            ) {
              setAberto(false)
            }
          }}
        >
          <div
            className="sessao-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-gerar-sessoes"
          >
            <div className="sessao-modal-header">
              <div>
                <span>Geração automática</span>

                <h2 id="titulo-gerar-sessoes">
                  Gerar sessões
                </h2>
              </div>

              <button
                type="button"
                className="sessao-modal-close"
                aria-label="Fechar modal"
                onClick={() => setAberto(false)}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="sessao-form"
              onSubmit={enviarFormulario}
            >
              <div className="sessao-form-group">
                <label>Evento</label>

                <input
                  type="text"
                  value={evento?.name || ''}
                  disabled
                />
              </div>

              <div className="sessao-form-row">
                <div className="sessao-form-group">
                  <label htmlFor="geracaoDataInicial">
                    Data inicial
                  </label>

                  <input
                    id="geracaoDataInicial"
                    name="startDate"
                    type="date"
                    value={formulario.startDate}
                    min={evento?.startDate}
                    max={evento?.endDate}
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>

                <div className="sessao-form-group">
                  <label htmlFor="geracaoDataFinal">
                    Data final
                  </label>

                  <input
                    id="geracaoDataFinal"
                    name="endDate"
                    type="date"
                    value={formulario.endDate}
                    min={evento?.startDate}
                    max={evento?.endDate}
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>
              </div>

              <div className="sessao-form-row">
                <div className="sessao-form-group">
                  <label htmlFor="geracaoHoraInicial">
                    Horário inicial
                  </label>

                  <input
                    id="geracaoHoraInicial"
                    name="startTime"
                    type="time"
                    value={formulario.startTime}
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>

                <div className="sessao-form-group">
                  <label htmlFor="geracaoHoraFinal">
                    Horário final
                  </label>

                  <input
                    id="geracaoHoraFinal"
                    name="endTime"
                    type="time"
                    value={formulario.endTime}
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>
              </div>

              <div className="sessao-form-row">
                <div className="sessao-form-group">
                  <label htmlFor="geracaoIntervalo">
                    Intervalo em minutos
                  </label>

                  <input
                    id="geracaoIntervalo"
                    name="intervalMinutes"
                    type="number"
                    min="1"
                    max="1440"
                    step="1"
                    value={
                      formulario.intervalMinutes
                    }
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>

                <div className="sessao-form-group">
                  <label htmlFor="geracaoCapacidade">
                    Capacidade
                  </label>

                  <input
                    id="geracaoCapacidade"
                    name="capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={formulario.capacity}
                    onChange={atualizarCampo}
                    disabled={salvando}
                    required
                  />
                </div>
              </div>

              <div className="sessao-form-group">
                <label htmlFor="geracaoStatus">
                  Status
                </label>

                <select
                  id="geracaoStatus"
                  name="status"
                  value={formulario.status}
                  onChange={atualizarCampo}
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

            <div className="sessao-form-group">
            <label>Dias da semana</label>

            <small>
                Nenhum selecionado significa todos os dias do
                período.
            </small>

            <div className="geracao-weekdays">
                {DIAS_SEMANA.map((dia) => {
                const selecionado =
                    formulario.weekdays.includes(dia.value)

                return (
                    <button
                    key={dia.value}
                    type="button"
                    className={[
                        'geracao-weekday',
                        selecionado ? 'active' : '',
                        dia.weekend ? 'weekend' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    onClick={() =>
                        alternarDiaSemana(dia.value)
                    }
                    disabled={salvando}
                    aria-pressed={selecionado}
                    title={
                        selecionado
                        ? `Remover ${dia.label}`
                        : `Selecionar ${dia.label}`
                    }
                    >
                    <span
                        className="geracao-weekday-icon"
                        aria-hidden="true"
                    >
                        {dia.icon}
                    </span>

                    <strong>{dia.label}</strong>

                    <span
                        className="geracao-weekday-check"
                        aria-hidden="true"
                    >
                        {selecionado ? '✓' : ''}
                    </span>
                    </button>
                )
                })}
            </div>
            </div>

            <div className="geracao-preview">
            
            <div className="geracao-preview-icon" aria-hidden="true">
                ▣
            </div>

            <div className="geracao-preview-content">
                <div>
                <span>Previsão:</span>

                <strong>
                    {quantidadePrevista}{' '}
                    {quantidadePrevista === 1
                    ? 'sessão'
                    : 'sessões'}
                </strong>
                </div>

                <small>
                O horário final não é incluído como início de
                uma nova sessão.
                </small>
            </div>
            </div>
              

              <div className="sessao-modal-actions">
                <button
                  type="button"
                  className="sessao-cancel-button"
                  onClick={() => setAberto(false)}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="sessao-save-button"
                  disabled={
                    salvando ||
                    quantidadePrevista < 1
                  }
                >
                  {salvando
                    ? 'Gerando...'
                    : `Gerar ${quantidadePrevista} sessões`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default GerarSessoesModal