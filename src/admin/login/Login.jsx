import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import logoCasaJulgamento from '../../main/resources/static/assets/images/logo-cj.png'
import { login } from '../../services/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      const resposta = await login(email.trim(), senha)

      localStorage.setItem('cj_token', resposta.token)

      localStorage.setItem(
        'cj_usuario',
        JSON.stringify({
          id: resposta.id,
          nome: resposta.nome,
          email: resposta.email,
          role: resposta.role,
        }),
      )

      navigate('/admin/dashboard')
    } catch (error) {
      setErro(error.message || 'E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-logo">
            <img
              src={logoCasaJulgamento}
              alt="Casa do Julgamento"
            />
          </div>

          <div>
            <p className="login-brand-subtitle">Painel Administrativo</p>
            <h1>Casa do Julgamento</h1>
          </div>
        </div>

        <div className="login-content">
          <p className="login-welcome">Bem-vindo de volta</p>

          <h2>Acesse sua conta</h2>

          <p className="login-description">
            Entre com seus dados para acessar o painel administrativo.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>

              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={carregando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>

              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete="current-password"
                disabled={carregando}
              />
            </div>

            {erro && <p className="login-error">{erro}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="login-footer">
            Casa do Julgamento • Administração
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login