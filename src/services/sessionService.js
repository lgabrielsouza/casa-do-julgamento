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
        parametros.append(chave, valor)
      }
    },
  )

  const query = parametros.toString()

  return query ? `?${query}` : ''
}

export function listarSessoes(filtros = {}) {
  const ordenacao =
    filtros.sort ?? ['date,asc', 'startTime,asc']

  const sorts = Array.isArray(ordenacao)
    ? ordenacao
    : [ordenacao]

  const query = montarQuery({
    page: filtros.page ?? 0,
    size: filtros.size ?? 100,
    eventId: filtros.eventId,
    date: filtros.date,
    status: filtros.status,
    active: filtros.active,
  })

  const sortQuery = sorts
    .map((sort) => `sort=${encodeURIComponent(sort)}`)
    .join('&')

  const separador = query ? '&' : '?'

  return apiRequest(
    `/sessions${query}${separador}${sortQuery}`,
  )
}

export function buscarSessaoPorId(id) {
  return apiRequest(`/sessions/${id}`)
}

export function criarSessao(dados) {
  return apiRequest('/sessions', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarSessao(id, dados) {
  return apiRequest(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function desativarSessao(id) {
  return apiRequest(`/sessions/${id}`, {
    method: 'DELETE',
  })
}