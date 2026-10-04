const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function limparAutenticacao() {
  localStorage.removeItem('cj_token')
  localStorage.removeItem('cj_usuario')
}

async function extrairMensagemDeErro(response) {
  try {
    const erro = await response.json()

    return (
      erro.message ||
      'Não foi possível concluir a operação.'
    )
  } catch {
    return 'Não foi possível concluir a operação.'
  }
}

export async function apiRequest(
  caminho,
  opcoes = {},
) {
  const token = localStorage.getItem('cj_token')

  const headers = new Headers(opcoes.headers || {})

  if (
    opcoes.body &&
    !(opcoes.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json; charset=utf-8',
    )
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(
    `${API_URL}${caminho}`,
    {
      ...opcoes,
      headers,
    },
  )

  if (response.status === 401) {
    limparAutenticacao()

    window.location.href = '/admin/login'

    throw new Error(
      'Sua sessão expirou. Entre novamente.',
    )
  }

  if (response.status === 403) {
    throw new Error(
      'Você não possui permissão para realizar esta operação.',
    )
  }

  if (!response.ok) {
    const mensagem =
      await extrairMensagemDeErro(response)

    const error = new Error(mensagem)
    error.status = response.status

    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}