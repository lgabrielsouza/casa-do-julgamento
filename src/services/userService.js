import { apiRequest } from './apiClient'

export function listarUsuarios() {
  return apiRequest('/users')
}

export function criarUsuario(dados) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarUsuario(id, dados) {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function alterarStatusUsuario(id, ativo) {
  return apiRequest(`/users/${id}/status?ativo=${ativo}`, {
    method: 'PATCH',
  })
}

export function redefinirSenhaUsuario(id, novaSenha) {
  return apiRequest(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({
      novaSenha,
    }),
  })
}