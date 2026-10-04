import {
  useEffect,
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import logoCasaJulgamento from '../../main/resources/static/assets/images/logo-cj.png'
import { buscarFotoPerfil } from '../../services/profileService'

import './AdminLayout.css'

function AdminLayout() {
  const navigate = useNavigate()

  const [fotoUrl, setFotoUrl] = useState(null)

  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo =
      localStorage.getItem('cj_usuario')

    try {
      return usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : {
            nome: 'Usuário',
            role: 'SEM PERFIL',
          }
    } catch {
      localStorage.removeItem('cj_usuario')

      return {
        nome: 'Usuário',
        role: 'SEM PERFIL',
      }
    }
  })

  const role = usuario.role

  const isAdmin = role === 'ADMIN'

  const isCoordenador =
    role === 'COORDENADOR'

  const podeAcessarEvento = [
    'ADMIN',
    'COORDENADOR',
    'LIDER',
    'RECEPCAO',
  ].includes(role)

  const podeAcessarSympla =
    isAdmin || isCoordenador

  const podeAcessarMinisterio =
    isAdmin || isCoordenador

  const podeAcessarRelatorios =
    isAdmin || isCoordenador

  const podeAcessarConfiguracoes = true

  const inicial =
    usuario.nome
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || 'U'

  useEffect(() => {
    let urlCriada = null

    async function carregarFotoUsuario() {
      try {
        const blob =
          await buscarFotoPerfil()

        if (!blob) {
          setFotoUrl(null)
          return
        }

        urlCriada =
          URL.createObjectURL(blob)

        setFotoUrl(urlCriada)
      } catch {
        setFotoUrl(null)
      }
    }

    carregarFotoUsuario()

    return () => {
      if (urlCriada) {
        URL.revokeObjectURL(
          urlCriada,
        )
      }
    }
  }, [])

  useEffect(() => {
  function atualizarPerfilNoHeader() {
    const usuarioSalvo =
      localStorage.getItem('cj_usuario')

    try {
      if (usuarioSalvo) {
        setUsuario(
          JSON.parse(usuarioSalvo),
        )
      }
    } catch {
      // Mantém o usuário atual.
    }

    carregarFotoUsuarioAtualizada()
  }

  async function carregarFotoUsuarioAtualizada() {
    try {
      const blob =
        await buscarFotoPerfil()

      if (!blob) {
        setFotoUrl((urlAnterior) => {
          if (urlAnterior) {
            URL.revokeObjectURL(
              urlAnterior,
            )
          }

          return null
        })

        return
      }

      const novaUrl =
        URL.createObjectURL(blob)

      setFotoUrl((urlAnterior) => {
        if (urlAnterior) {
          URL.revokeObjectURL(
            urlAnterior,
          )
        }

        return novaUrl
      })
    } catch {
      // Mantém a foto atual.
    }
  }

  window.addEventListener(
    'cj-profile-updated',
    atualizarPerfilNoHeader,
  )

  return () => {
    window.removeEventListener(
      'cj-profile-updated',
      atualizarPerfilNoHeader,
    )
  }
}, [])

  function handleLogout() {
    localStorage.removeItem('cj_token')
    localStorage.removeItem('cj_usuario')

    navigate('/admin/login', {
      replace: true,
    })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img
            src={logoCasaJulgamento}
            alt="Casa do Julgamento"
            className="sidebar-logo"
          />

          <div className="sidebar-brand-text">
            <span>Casa do</span>
            <strong>Julgamento</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard">
            Dashboard
          </NavLink>

          {podeAcessarEvento && (
            <>
              <p className="sidebar-section-title">
                EVENTO
              </p>

              <NavLink to="/admin/eventos">
                Eventos
              </NavLink>

              <NavLink to="/admin/sessoes">
                Sessões
              </NavLink>

              <NavLink to="/admin/participantes">
                Participantes
              </NavLink>

              <NavLink
                to="/admin/recepcao"
                className={({ isActive }) =>
                  isActive
                    ? 'admin-nav-link active'
                    : 'admin-nav-link'
                }
              >
                <span>Recepção</span>
              </NavLink>

              {(isAdmin ||
                isCoordenador) && (
                <NavLink to="/admin/ingressos">
                  Ingressos
                </NavLink>
              )}

              {podeAcessarSympla && (
                <NavLink to="/admin/sympla">
                  Sympla
                </NavLink>
              )}
            </>
          )}

          {podeAcessarMinisterio && (
            <>
              <p className="sidebar-section-title">
                MINISTÉRIO
              </p>

              <NavLink to="/admin/decisoes">
                Decisões
              </NavLink>

              <NavLink to="/admin/igrejas">
                Igrejas Parceiras
              </NavLink>
            </>
          )}

          {(isAdmin ||
            podeAcessarRelatorios ||
            podeAcessarConfiguracoes) && (
            <>
              <p className="sidebar-section-title">
                ADMINISTRAÇÃO
              </p>

              {isAdmin && (
                <NavLink to="/admin/usuarios">
                  Usuários
                </NavLink>
              )}

              {podeAcessarRelatorios && (
                <NavLink to="/admin/relatorios">
                  Relatórios
                </NavLink>
              )}

              {podeAcessarConfiguracoes && (
                <NavLink to="/admin/configuracoes">
                  Configurações
                </NavLink>
              )}
            </>
          )}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Sair
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header-small">
              Casa do Julgamento
            </p>

            <strong>
              Painel Administrativo
            </strong>
          </div>

          <div className="admin-user">
            <div className="admin-user-avatar">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  className="admin-user-avatar-image"
                />
              ) : (
                inicial
              )}
            </div>

            <div>
              <strong>
                {usuario.nome}
              </strong>

              <span>
                {usuario.role}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout