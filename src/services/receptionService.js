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

export function listarParticipantesRecepcao(
  filtros = {},
) {
  const ordenacao =
    filtros.sort ?? ['fullName,asc']

  const sorts = Array.isArray(ordenacao)
    ? ordenacao
    : [ordenacao]

  const query = montarQuery({
    eventId: filtros.eventId,
    eventSessionId: filtros.eventSessionId,
    name: filtros.name,
    phone: filtros.phone,
    arrivalStatus: filtros.arrivalStatus,
    page: filtros.page ?? 0,
    size: filtros.size ?? 500,
  })

  const sortQuery = sorts
    .map(
      (sort) =>
        `sort=${encodeURIComponent(sort)}`,
    )
    .join('&')

  const separador = query ? '&' : '?'

  return apiRequest(
    `/reception/participants${query}${separador}${sortQuery}`,
  )
}

export function registrarChegada(
  participantId,
  version,
) {
  return apiRequest(
    `/reception/participants/${participantId}/arrival`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        version,
      }),
    },
  )
}

export function marcarProntoParaGrupo(
  participantId,
  version,
) {
  return apiRequest(
    `/reception/participants/${participantId}/ready`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        version,
      }),
    },
  )
}

export function desfazerChegada(
  participantId,
  version,
) {
  return apiRequest(
    `/reception/participants/${participantId}/undo-arrival`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        version,
      }),
    },
  )
}

export function alterarSessaoRecepcao(
  participantId,
  eventSessionId,
  version,
) {
  return apiRequest(
    `/reception/participants/${participantId}/session`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        eventSessionId:
          eventSessionId === '' ||
          eventSessionId === undefined
            ? null
            : eventSessionId,
        version,
      }),
    },
  )
}

export function buscarListaImpressaoSessao(
  sessionId,
) {
  return apiRequest(
    `/reception/sessions/${sessionId}/print`,
  )
}

export function listarSessoesParaGrupos(
  eventId,
) {
  return apiRequest(
    `/groups/events/${eventId}/sessions`,
  )
}

export function alocarParticipanteNaSessao(
  participantId,
  sessionId,
) {
  return apiRequest(
    `/groups/participants/${participantId}/session/${sessionId}`,
    {
      method: 'PATCH',
    },
  )
}