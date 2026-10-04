import { useEffect, useState } from 'react'
import {
  alterarMinhaSenha,
  atualizarFotoPerfil,
  atualizarMeuPerfil,
  buscarFotoPerfil,
  buscarMeuPerfil,
  removerFotoPerfil,
} from '../../services/profileService'
import './Configuracoes.css'

function Configuracoes() {
  const [perfil, setPerfil] = useState(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')

  const [fotoUrl, setFotoUrl] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvandoPerfil, setSalvandoPerfil] =
    useState(false)
  const [salvandoFoto, setSalvandoFoto] =
    useState(false)
  const [alterandoSenha, setAlterandoSenha] =
    useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] =
    useState('')

  const [mensagemPerfil, setMensagemPerfil] =
    useState('')
  const [erroPerfil, setErroPerfil] =
    useState('')

  const [mensagemSenha, setMensagemSenha] =
    useState('')
  const [erroSenha, setErroSenha] =
    useState('')

  const [erroFoto, setErroFoto] = useState('')

  useEffect(() => {
    carregarDados()

    return () => {
      if (fotoUrl) {
        URL.revokeObjectURL(fotoUrl)
      }
    }
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)
      setErroPerfil('')

      const dados = await buscarMeuPerfil()

      setPerfil(dados)
      setNome(dados.nome || '')
      setTelefone(dados.telefone || '')

      if (dados.fotoPerfil) {
        await carregarFoto()
      }
    } catch (error) {
      setErroPerfil(error.message)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarFoto() {
    try {
      const blob = await buscarFotoPerfil()

      if (!blob) {
        setFotoUrl(null)
        return
      }

      const novaUrl = URL.createObjectURL(blob)

      setFotoUrl((urlAnterior) => {
        if (urlAnterior) {
          URL.revokeObjectURL(urlAnterior)
        }

        return novaUrl
      })
    } catch (error) {
      setErroFoto(error.message)
    }
  }

  function atualizarUsuarioLocalStorage(usuarioAtualizado) {
    const usuarioSalvo =
      localStorage.getItem('cj_usuario')

    let usuarioAtual = {}

    try {
      usuarioAtual = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : {}
    } catch {
      usuarioAtual = {}
    }

    const novoUsuario = {
      ...usuarioAtual,
      ...usuarioAtualizado,
    }

    localStorage.setItem(
      'cj_usuario',
      JSON.stringify(novoUsuario),
    )
    window.dispatchEvent(
    new CustomEvent('cj-profile-updated'),
  )
  }

  async function handleSalvarPerfil(event) {
    event.preventDefault()

    setMensagemPerfil('')
    setErroPerfil('')

    try {
      setSalvandoPerfil(true)

      const atualizado =
        await atualizarMeuPerfil({
          nome,
          telefone,
        })

      setPerfil(atualizado)
      setNome(atualizado.nome || '')
      setTelefone(atualizado.telefone || '')

      atualizarUsuarioLocalStorage(atualizado)

      setMensagemPerfil(
        'Perfil atualizado com sucesso.',
      )
    } catch (error) {
      setErroPerfil(error.message)
    } finally {
      setSalvandoPerfil(false)
    }
  }

  async function handleSelecionarFoto(event) {
    const arquivo = event.target.files?.[0]

    event.target.value = ''

    if (!arquivo) {
      return
    }

    setErroFoto('')

    try {
      setSalvandoFoto(true)

      const atualizado =
        await atualizarFotoPerfil(arquivo)

      setPerfil(atualizado)
      atualizarUsuarioLocalStorage(atualizado)

      await carregarFoto()
    } catch (error) {
      setErroFoto(error.message)
    } finally {
      setSalvandoFoto(false)
    }
  }

  async function handleRemoverFoto() {
    setErroFoto('')

    try {
      setSalvandoFoto(true)

      const atualizado =
        await removerFotoPerfil()

      setPerfil(atualizado)
      atualizarUsuarioLocalStorage(atualizado)

      setFotoUrl((urlAnterior) => {
        if (urlAnterior) {
          URL.revokeObjectURL(urlAnterior)
        }

        return null
      })
    } catch (error) {
      setErroFoto(error.message)
    } finally {
      setSalvandoFoto(false)
    }
  }

  async function handleAlterarSenha(event) {
    event.preventDefault()

    setMensagemSenha('')
    setErroSenha('')

    if (novaSenha !== confirmarSenha) {
      setErroSenha(
        'A confirmação da nova senha não confere.',
      )
      return
    }

    if (novaSenha.length < 8) {
      setErroSenha(
        'A nova senha deve possuir pelo menos 8 caracteres.',
      )
      return
    }

    try {
      setAlterandoSenha(true)

      await alterarMinhaSenha({
        senhaAtual,
        novaSenha,
      })

      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')

      setMensagemSenha(
        'Senha alterada com sucesso.',
      )
    } catch (error) {
      setErroSenha(error.message)
    } finally {
      setAlterandoSenha(false)
    }
  }

  if (carregando) {
    return (
      <div className="configuracoes-page">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="configuracoes-page">
        <h1>Configurações</h1>

        {erroPerfil && (
          <div className="config-alert error">
            {erroPerfil}
          </div>
        )}
      </div>
    )
  }

  const inicial =
    perfil.nome
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || 'U'

  return (
    <div className="configuracoes-page">
      <div className="configuracoes-header">
        <div>
          <p className="configuracoes-subtitle">
            MINHA CONTA
          </p>

          <h1>Configurações</h1>

          <p>
            Gerencie seus dados pessoais,
            foto e senha de acesso.
          </p>
        </div>
      </div>

      <section className="config-card">
        <div className="config-card-header">
          <div>
            <h2>Foto de perfil</h2>
            <p>
              Esta foto será usada na sua
              identificação no painel.
            </p>
          </div>
        </div>

        <div className="profile-photo-area">
          <div className="profile-photo-preview">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
              />
            ) : (
              <span>{inicial}</span>
            )}
          </div>

          <div className="profile-photo-actions">
            <label
              className={`config-button ${
                salvandoFoto ? 'disabled' : ''
              }`}
            >
              {salvandoFoto
                ? 'Enviando...'
                : 'Alterar foto'}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSelecionarFoto}
                disabled={salvandoFoto}
                hidden
              />
            </label>

            {perfil.fotoPerfil && (
              <button
                type="button"
                className="config-button secondary"
                onClick={handleRemoverFoto}
                disabled={salvandoFoto}
              >
                Remover foto
              </button>
            )}

            <small>
              JPG, PNG ou WEBP. Máximo de 5 MB.
            </small>
          </div>
        </div>

        {erroFoto && (
          <div className="config-alert error">
            {erroFoto}
          </div>
        )}
      </section>

      <section className="config-card">
        <div className="config-card-header">
          <div>
            <h2>Dados pessoais</h2>
            <p>
              Atualize as informações básicas
              da sua conta.
            </p>
          </div>
        </div>

        <form
          className="config-form"
          onSubmit={handleSalvarPerfil}
        >
          <div className="config-field">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="config-field">
            <label htmlFor="telefone">
              Telefone
            </label>

            <input
              id="telefone"
              type="text"
              value={telefone}
              onChange={(event) =>
                setTelefone(event.target.value)
              }
              maxLength={20}
              placeholder="Digite seu telefone"
            />
          </div>

          <div className="config-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={perfil.email || ''}
              disabled
            />

            <small>
              O e-mail não pode ser alterado
              nesta tela.
            </small>
          </div>

          <div className="config-field">
            <label htmlFor="role">
              Perfil de acesso
            </label>

            <input
              id="role"
              type="text"
              value={perfil.role || ''}
              disabled
            />
          </div>

          {mensagemPerfil && (
            <div className="config-alert success">
              {mensagemPerfil}
            </div>
          )}

          {erroPerfil && (
            <div className="config-alert error">
              {erroPerfil}
            </div>
          )}

          <div className="config-form-actions">
            <button
              type="submit"
              className="config-button"
              disabled={salvandoPerfil}
            >
              {salvandoPerfil
                ? 'Salvando...'
                : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>

      <section className="config-card">
        <div className="config-card-header">
          <div>
            <h2>Alterar senha</h2>
            <p>
              Informe sua senha atual antes de
              definir uma nova.
            </p>
          </div>
        </div>

        <form
          className="config-form"
          onSubmit={handleAlterarSenha}
        >
          <div className="config-field">
            <label htmlFor="senhaAtual">
              Senha atual
            </label>

            <input
              id="senhaAtual"
              type="password"
              value={senhaAtual}
              onChange={(event) =>
                setSenhaAtual(
                  event.target.value,
                )
              }
              required
              autoComplete="current-password"
            />
          </div>

          <div className="config-field">
            <label htmlFor="novaSenha">
              Nova senha
            </label>

            <input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(event) =>
                setNovaSenha(
                  event.target.value,
                )
              }
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
            />
          </div>

          <div className="config-field">
            <label htmlFor="confirmarSenha">
              Confirmar nova senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(
                  event.target.value,
                )
              }
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
            />
          </div>

          {mensagemSenha && (
            <div className="config-alert success">
              {mensagemSenha}
            </div>
          )}

          {erroSenha && (
            <div className="config-alert error">
              {erroSenha}
            </div>
          )}

          <div className="config-form-actions">
            <button
              type="submit"
              className="config-button"
              disabled={alterandoSenha}
            >
              {alterandoSenha
                ? 'Alterando...'
                : 'Alterar senha'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Configuracoes