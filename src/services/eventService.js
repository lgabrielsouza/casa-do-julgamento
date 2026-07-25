import { apiRequest } from './apiClient'

function montarQuery(filtros = {}) {
  const parametros = new URLSearchParams()

  Object.entries(filtros).forEach(
    ([chave, valor]) => {
      if (
        valor !== undefined &&
        valor !== null &&
        valor !== ''
      ) {
        parametros.set(chave, valor)
      }
    },
  )

  const query = parametros.toString()

  return query ? `?${query}` : ''
}

export function listarEventos(filtros = {}) {
  const query = montarQuery({
    page: filtros.page ?? 0,
    size: filtros.size ?? 10,
    sort: filtros.sort ?? 'startDate,asc',
    name: filtros.name,
    city: filtros.city,
    state: filtros.state,
    status: filtros.status,
    active: filtros.active,
    startDateFrom: filtros.startDateFrom,
    startDateTo: filtros.startDateTo,
  })

  return apiRequest(`/events${query}`)
}

export function buscarEventoPorId(id) {
  return apiRequest(`/events/${id}`)
}

export function criarEvento(dados) {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarEvento(id, dados) {
  return apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function desativarEvento(id) {
  return apiRequest(`/events/${id}`, {
    method: 'DELETE',
  })
}