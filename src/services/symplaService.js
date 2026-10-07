import { apiRequest } from './apiClient'

export function buscarStatusSympla(eventId) {
  return apiRequest(
    `/integrations/sympla/events/${eventId}/status`,
  )
}

export function vincularEventoSympla(
  eventId,
  externalEventId,
) {
  return apiRequest(
    `/integrations/sympla/events/${eventId}/link`,
    {
      method: 'PUT',
      body: JSON.stringify({
        externalEventId,
      }),
    },
  )
}

export function sincronizarParticipantesSympla(
  eventId,
) {
  return apiRequest(
    `/integrations/sympla/events/${eventId}/sync`,
    {
      method: 'POST',
    },
  )
}