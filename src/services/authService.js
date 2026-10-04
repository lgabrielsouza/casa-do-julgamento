const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function login(email, senha) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    },
  )

  if (!response.ok) {
    let mensagem =
      'Não foi possível realizar o login.'

    try {
      const erro = await response.json()

      if (erro.message) {
        mensagem = erro.message
      }
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new Error(mensagem)
  }

  return response.json()
}

export function logout() {
  localStorage.removeItem('cj_token')
  localStorage.removeItem('cj_usuario')
}