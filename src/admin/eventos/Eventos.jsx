import { useEffect, useMemo, useState } from 'react'

import {
  atualizarEvento,
  buscarEventoPorId,
  criarEvento,
  desativarEvento,
  listarEventos,
} from '../../services/eventService'
import Toast from '../../components/ui/Toast'
import EventoTable from './EventoTable'
import {EventoConfirmacaoModal, EventoVisualizacaoModal,} from './EventoModals'
import './Eventos.css'

const FORMULARIO_INICIAL = {
  name: '',
  description: '',
  city: '',
  state: '',
  venueName: '',
  address: '',
  startDate: '',
  endDate: '',
  status: 'DRAFT',
  pagTicketsUrl: '',
  version: null,
}

const FILTROS_INICIAIS = {
  name: '',
  status: '',
  active: 'true',
}

function Eventos() {
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [eventoEmEdicaoId, setEventoEmEdicaoId] =
    useState(null)

  const [eventoVisualizado, setEventoVisualizado] =
    useState(null)

  const [eventoParaDesativar, setEventoParaDesativar] =
    useState(null)

  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [carregandoEvento, setCarregandoEvento] =
    useState(false)
  const [salvando, setSalvando] = useState(false)
  const [desativando, setDesativando] = useState(false)

  const [erro, setErro] = useState('')
  const [erroFormulario, setErroFormulario] =
    useState('')
  const [erroDesativacao, setErroDesativacao] =
    useState('')
  const [mensagemSucesso, setMensagemSucesso] =
    useState('')

  const [filtros, setFiltros] = useState(
    FILTROS_INICIAIS,
  )

  const [filtrosAplicados, setFiltrosAplicados] =
    useState(FILTROS_INICIAIS)

  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [totalElementos, setTotalElementos] =
    useState(0)

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const resumo = useMemo(() => {
    return eventos.reduce(
      (acumulador, evento) => {
        acumulador.totalPagina += 1

        if (evento.status === 'PLANNING') {
          acumulador.planejamento += 1
        }

        if (evento.status === 'PUBLISHED') {
          acumulador.publicados += 1
        }

        if (evento.status === 'IN_PROGRESS') {
          acumulador.emAndamento += 1
        }

        return acumulador
      },
      {
        totalPagina: 0,
        planejamento: 0,
        publicados: 0,
        emAndamento: 0,
      },
    )
  }, [eventos])

  async function carregarEventos() {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await listarEventos({
        page: pagina,
        size: 10,
        sort: 'startDate,asc',
        name:
          filtrosAplicados.name.trim() || undefined,
        status:
          filtrosAplicados.status || undefined,
        active:
          filtrosAplicados.active === ''
            ? undefined
            : filtrosAplicados.active,
      })

      setEventos(resposta.content || [])
      setTotalPaginas(resposta.totalPages || 0)
      setTotalElementos(resposta.totalElements || 0)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os eventos.',
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarEventos()
  }, [pagina, filtrosAplicados])

  function exibirMensagemSucesso(mensagem) {
    setMensagemSucesso(mensagem)

    window.setTimeout(() => {
      setMensagemSucesso('')
    }, 4000)
  }

  function handleFiltroChange(event) {
    const { name, value } = event.target

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
    }))
  }

  function handleAplicarFiltros() {
    setPagina(0)

    setFiltrosAplicados({
      name: filtros.name.trim(),
      status: filtros.status,
      active: filtros.active,
    })
  }

  function handleLimparFiltros() {
    setPagina(0)
    setFiltros(FILTROS_INICIAIS)
    setFiltrosAplicados(FILTROS_INICIAIS)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  function abrirModalCadastro() {
    setModoEdicao(false)
    setEventoEmEdicaoId(null)
    setFormulario(FORMULARIO_INICIAL)
    setErroFormulario('')
    setModalAberto(true)
  }

  async function handleEditar(evento) {
    setErro('')
    setErroFormulario('')
    setCarregandoEvento(true)

    try {
      const eventoCompleto =
        await buscarEventoPorId(evento.id)

      setFormulario({
        name: eventoCompleto.name || '',
        description:
          eventoCompleto.description || '',
        city: eventoCompleto.city || '',
        state: eventoCompleto.state || '',
        venueName:
          eventoCompleto.venueName || '',
        address: eventoCompleto.address || '',
        startDate:
          eventoCompleto.startDate || '',
        endDate: eventoCompleto.endDate || '',
        status:
          eventoCompleto.status || 'DRAFT',
        pagTicketsUrl:
          eventoCompleto.pagTicketsUrl || '',
        version: eventoCompleto.version,
      })

      setEventoEmEdicaoId(eventoCompleto.id)
      setModoEdicao(true)
      setModalAberto(true)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar o evento.',
      )
    } finally {
      setCarregandoEvento(false)
    }
  }

  async function handleVisualizar(evento) {
    setErro('')
    setCarregandoEvento(true)

    try {
      const eventoCompleto =
        await buscarEventoPorId(evento.id)

      setEventoVisualizado(eventoCompleto)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar os detalhes do evento.',
      )
    } finally {
      setCarregandoEvento(false)
    }
  }

  function fecharVisualizacao() {
    setEventoVisualizado(null)
  }

  function solicitarDesativacao(evento) {
    setErroDesativacao('')
    setEventoParaDesativar(evento)
  }

  function cancelarDesativacao() {
    if (desativando) {
      return
    }

    setEventoParaDesativar(null)
    setErroDesativacao('')
  }

  async function confirmarDesativacao() {
    if (!eventoParaDesativar) {
      return
    }

    setDesativando(true)
    setErroDesativacao('')
    setErro('')

    try {
      await desativarEvento(eventoParaDesativar.id)

      setEventoParaDesativar(null)
      exibirMensagemSucesso(
        'Evento desativado com sucesso.',
      )

      await carregarEventos()
    } catch (error) {
      setErroDesativacao(
        error.message ||
          'Não foi possível desativar o evento.',
      )
    } finally {
      setDesativando(false)
    }
  }

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setModoEdicao(false)
    setEventoEmEdicaoId(null)
    setErroFormulario('')
    setFormulario(FORMULARIO_INICIAL)
  }

  function validarFormulario() {
    if (!formulario.name.trim()) {
      return 'Informe o nome do evento.'
    }

    if (!formulario.startDate) {
      return 'Informe a data inicial.'
    }

    if (!formulario.endDate) {
      return 'Informe a data final.'
    }

    if (formulario.endDate < formulario.startDate) {
      return 'A data final não pode ser anterior à data inicial.'
    }

    if (
      formulario.state.trim() &&
      formulario.state.trim().length !== 2
    ) {
      return 'O estado deve possuir exatamente duas letras.'
    }

    if (
      modoEdicao &&
      formulario.version === null
    ) {
      return 'Não foi possível identificar a versão do evento. Recarregue a página.'
    }

    return ''
  }

  function montarDadosDoFormulario() {
    const dados = {
      name: formulario.name.trim(),
      description:
        formulario.description.trim() || null,
      city: formulario.city.trim() || null,
      state:
        formulario.state
          .trim()
          .toUpperCase() || null,
      venueName:
        formulario.venueName.trim() || null,
      address:
        formulario.address.trim() || null,
      startDate: formulario.startDate,
      endDate: formulario.endDate,
      status: formulario.status,
      pagTicketsUrl:
        formulario.pagTicketsUrl.trim() || null,
    }

    if (modoEdicao) {
      return {
        ...dados,
        version: formulario.version,
      }
    }

    return dados
  }

  async function handleSubmit(event) {
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
      const dados = montarDadosDoFormulario()
      const eraEdicao = modoEdicao

      if (eraEdicao) {
        await atualizarEvento(
          eventoEmEdicaoId,
          dados,
        )
      } else {
        await criarEvento(dados)
      }

      setModalAberto(false)
      setModoEdicao(false)
      setEventoEmEdicaoId(null)
      setFormulario(FORMULARIO_INICIAL)

      exibirMensagemSucesso(
        eraEdicao
          ? 'Evento atualizado com sucesso.'
          : 'Evento cadastrado com sucesso.',
      )

      await carregarEventos()
    } catch (error) {
      setErroFormulario(
        error.message ||
          `Não foi possível ${
            modoEdicao ? 'atualizar' : 'cadastrar'
          } o evento.`,
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="eventos-page">
      <div className="eventos-heading">
        <div>
          <p className="eventos-eyebrow">
            Gerenciamento
          </p>

          <h1>Eventos</h1>

          <p>
            Cadastre e gerencie os eventos da Casa do
            Julgamento.
          </p>
        </div>

        <button
          type="button"
          className="novo-evento-button"
          onClick={abrirModalCadastro}
          disabled={carregandoEvento}
        >
          {carregandoEvento
            ? 'Carregando...'
            : '+ Novo evento'}
        </button>
      </div>

      <Toast
        tipo="success"
        mensagem={mensagemSucesso}
        visivel={Boolean(mensagemSucesso)}
      />


      <section className="eventos-summary-grid">
        <article className="eventos-summary-card">
          <span>Total encontrado</span>
          <strong>{totalElementos}</strong>
          <small>Com os filtros aplicados</small>
        </article>

        <article className="eventos-summary-card">
          <span>Nesta página</span>
          <strong>{resumo.totalPagina}</strong>
          <small>Máximo de 10 registros</small>
        </article>

        <article className="eventos-summary-card">
          <span>Planejamento</span>
          <strong>{resumo.planejamento}</strong>
          <small>Nesta página</small>
        </article>

        <article className="eventos-summary-card">
          <span>Publicados / andamento</span>

          <strong>
            {resumo.publicados + resumo.emAndamento}
          </strong>

          <small>Nesta página</small>
        </article>
      </section>

      <section className="eventos-filters">
        <div className="eventos-filter-field eventos-filter-search">
          <label htmlFor="eventNameFilter">
            Buscar evento
          </label>

          <input
            id="eventNameFilter"
            name="name"
            type="search"
            placeholder="Digite o nome do evento"
            value={filtros.name}
            onChange={handleFiltroChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAplicarFiltros()
              }
            }}
          />
        </div>

        <div className="eventos-filter-field">
          <label htmlFor="eventStatusFilter">
            Status
          </label>

          <select
            id="eventStatusFilter"
            name="status"
            value={filtros.status}
            onChange={handleFiltroChange}
          >
            <option value="">Todos</option>
            <option value="DRAFT">
              Rascunho
            </option>
            <option value="PLANNING">
              Planejamento
            </option>
            <option value="PUBLISHED">
              Publicado
            </option>
            <option value="IN_PROGRESS">
              Em andamento
            </option>
            <option value="FINISHED">
              Encerrado
            </option>
            <option value="CANCELLED">
              Cancelado
            </option>
          </select>
        </div>

        <div className="eventos-filter-field">
          <label htmlFor="eventActiveFilter">
            Situação
          </label>

          <select
            id="eventActiveFilter"
            name="active"
            value={filtros.active}
            onChange={handleFiltroChange}
          >
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>

        <div className="eventos-filter-actions">
          <button
            type="button"
            className="eventos-filter-clear"
            onClick={handleLimparFiltros}
          >
            Limpar
          </button>

          <button
            type="button"
            className="eventos-filter-apply"
            onClick={handleAplicarFiltros}
          >
            Aplicar filtros
          </button>
        </div>
      </section>

      <section className="eventos-card">
        <div className="eventos-card-header">
          <div>
            <h2>Eventos cadastrados</h2>

            <span>
              {totalElementos}{' '}
              {totalElementos === 1
                ? 'evento encontrado'
                : 'eventos encontrados'}
            </span>
          </div>
        </div>

        <EventoTable
          eventos={eventos}
          carregando={carregando}
          erro={erro}
          onEditar={handleEditar}
          onVisualizar={handleVisualizar}
          onDesativar={solicitarDesativacao}
        />

        {totalPaginas > 1 && (
          <div className="eventos-pagination">
            <button
              type="button"
              disabled={pagina === 0}
              onClick={() =>
                setPagina(
                  (paginaAtual) =>
                    paginaAtual - 1,
                )
              }
            >
              Anterior
            </button>

            <span>
              Página {pagina + 1} de{' '}
              {totalPaginas}
            </span>

            <button
              type="button"
              disabled={
                pagina + 1 >= totalPaginas
              }
              onClick={() =>
                setPagina(
                  (paginaAtual) =>
                    paginaAtual + 1,
                )
              }
            >
              Próxima
            </button>
          </div>
        )}
      </section>

      {modalAberto && (
        <div className="evento-modal-overlay">
          <div className="evento-modal">
            <div className="evento-modal-header">
              <div>
                <span>
                  {modoEdicao
                    ? 'Editar evento'
                    : 'Novo evento'}
                </span>

                <h2>
                  {modoEdicao
                    ? 'Atualizar evento'
                    : 'Cadastrar evento'}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={fecharModal}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="evento-form"
              onSubmit={handleSubmit}
            >
              {erroFormulario && (
                <div className="evento-form-error">
                  {erroFormulario}
                </div>
              )}

              <div className="evento-form-group full">
                <label htmlFor="name">
                  Nome do evento *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  maxLength="120"
                  value={formulario.name}
                  onChange={handleChange}
                  disabled={salvando}
                />
              </div>

              <div className="evento-form-row">
                <div className="evento-form-group">
                  <label htmlFor="startDate">
                    Data inicial *
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formulario.startDate}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>

                <div className="evento-form-group">
                  <label htmlFor="endDate">
                    Data final *
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formulario.endDate}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="evento-form-row">
                <div className="evento-form-group">
                  <label htmlFor="city">
                    Cidade
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    maxLength="100"
                    value={formulario.city}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>

                <div className="evento-form-group">
                  <label htmlFor="state">
                    Estado
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    maxLength="2"
                    value={formulario.state}
                    onChange={handleChange}
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="evento-form-group full">
                <label htmlFor="venueName">
                  Local
                </label>

                <input
                  id="venueName"
                  name="venueName"
                  type="text"
                  maxLength="150"
                  value={formulario.venueName}
                  onChange={handleChange}
                  disabled={salvando}
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="address">
                  Endereço
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  maxLength="255"
                  value={formulario.address}
                  onChange={handleChange}
                  disabled={salvando}
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="description">
                  Descrição
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  maxLength="5000"
                  value={formulario.description}
                  onChange={handleChange}
                  disabled={salvando}
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="pagTicketsUrl">
                  Link do PagTickets
                </label>

                <input
                  id="pagTicketsUrl"
                  name="pagTicketsUrl"
                  type="url"
                  maxLength="500"
                  value={formulario.pagTicketsUrl}
                  onChange={handleChange}
                  disabled={salvando}
                  placeholder="https://..."
                />
              </div>

              <div className="evento-form-group full">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formulario.status}
                  onChange={handleChange}
                  disabled={salvando}
                >
                  <option value="DRAFT">
                    Rascunho
                  </option>
                  <option value="PLANNING">
                    Planejamento
                  </option>
                  <option value="PUBLISHED">
                    Publicado
                  </option>
                  <option value="IN_PROGRESS">
                    Em andamento
                  </option>
                  <option value="FINISHED">
                    Encerrado
                  </option>
                  <option value="CANCELLED">
                    Cancelado
                  </option>
                </select>
              </div>

              <div className="evento-modal-actions">
                <button
                  type="button"
                  className="evento-cancel-button"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="evento-save-button"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : modoEdicao
                      ? 'Atualizar evento'
                      : 'Salvar evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EventoVisualizacaoModal
        evento={eventoVisualizado}
        onFechar={fecharVisualizacao}
      />

      <EventoConfirmacaoModal
        evento={eventoParaDesativar}
        erro={erroDesativacao}
        desativando={desativando}
        onCancelar={cancelarDesativacao}
        onConfirmar={confirmarDesativacao}
      />
      
    </div>
  )
}

export default Eventos