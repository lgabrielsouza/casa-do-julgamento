const API_URL = 'http://localhost:8080/api'

export async function login(email, senha) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  })

  if (!response.ok) {
    let mensagem = 'Não foi possível realizar o login.'

    try {
      const erro = await response.json()

      if (erro.message) {
        mensagem = erro.message
      }
    } catch {
      // Mantém a mensagem padrão quando a resposta não for JSON.
    }

    throw new Error(mensagem)
  }

  return response.json()
}