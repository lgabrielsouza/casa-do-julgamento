import { apiRequest } from './apiClient'

export function buscarStatusSympla(eventId) {
  return apiRequest(
    `/integrations/sympla/events/${eventId}/status`,
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