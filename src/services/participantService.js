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

export function listarParticipantes(
  filtros = {},
) {
  const ordenacao =
    filtros.sort ?? ['fullName,asc']

  const sorts = Array.isArray(ordenacao)
    ? ordenacao
    : [ordenacao]

  const query = montarQuery({
    page: filtros.page ?? 0,
    size: filtros.size ?? 20,
    eventId: filtros.eventId,
    eventSessionId: filtros.eventSessionId,
    name: filtros.name,
    phone: filtros.phone,
    source: filtros.source,
    status: filtros.status,
    active: filtros.active,
  })

  const sortQuery = sorts
    .map(
      (sort) =>
        `sort=${encodeURIComponent(sort)}`,
    )
    .join('&')

  const separador = query ? '&' : '?'

  return apiRequest(
    `/participants${query}${separador}${sortQuery}`,
  )
}

export function buscarParticipantePorId(id) {
  return apiRequest(`/participants/${id}`)
}

export function criarParticipante(dados) {
  return apiRequest('/participants', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarParticipante(
  id,
  dados,
) {
  return apiRequest(`/participants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function desativarParticipante(id) {
  return apiRequest(`/participants/${id}`, {
    method: 'DELETE',
  })
}