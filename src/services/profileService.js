const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080/api'

function getToken() {
  return localStorage.getItem('cj_token')
}

async function lerErro(response, mensagemPadrao) {
  try {
    const erro = await response.json()

    if (erro?.message) {
      return erro.message
    }
  } catch {
    // Mantém a mensagem padrão.
  }

  return mensagemPadrao
}

export async function buscarMeuPerfil() {
  const response = await fetch(
    `${API_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível carregar o perfil.',
      ),
    )
  }

  return response.json()
}

export async function atualizarMeuPerfil({
  nome,
  telefone,
}) {
  const response = await fetch(
    `${API_URL}/me`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type':
          'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        nome,
        telefone,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível atualizar o perfil.',
      ),
    )
  }

  return response.json()
}

export async function alterarMinhaSenha({
  senhaAtual,
  novaSenha,
}) {
  const response = await fetch(
    `${API_URL}/me/password`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type':
          'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        senhaAtual,
        novaSenha,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível alterar a senha.',
      ),
    )
  }
}

export async function atualizarFotoPerfil(arquivo) {
  const formData = new FormData()

  formData.append('file', arquivo)

  const response = await fetch(
    `${API_URL}/me/photo`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível atualizar a foto.',
      ),
    )
  }

  return response.json()
}

export async function removerFotoPerfil() {
  const response = await fetch(
    `${API_URL}/me/photo`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível remover a foto.',
      ),
    )
  }

  return response.json()
}

export async function buscarFotoPerfil() {
  const response = await fetch(
    `${API_URL}/me/photo`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      await lerErro(
        response,
        'Não foi possível carregar a foto.',
      ),
    )
  }

  return response.blob()
}