
import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import logoCasaJulgamento from '../../main/resources/static/assets/images/logo-cj.png'
import { buscarFotoPerfil } from '../../services/profileService'
import './AdminLayout.css'

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem('cj_usuario')

    return salvo
      ? JSON.parse(salvo)
      : { nome: 'Usuário', role: 'SEM PERFIL' }
  } catch {
    localStorage.removeItem('cj_usuario')
    return { nome: 'Usuário', role: 'SEM PERFIL' }
  }
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [usuario, setUsuario] = useState(lerUsuarioSalvo)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false)

  const role = usuario?.role
  const isAdmin = role === 'ADMIN'
  const isCoordenador = role === 'COORDENADOR'

  const podeAcessarEvento = [
    'ADMIN',
    'COORDENADOR',
    'LIDER',
    'RECEPCAO',
  ].includes(role)

  const podeAcessarSympla = isAdmin || isCoordenador

  const inicial =
    usuario?.nome?.trim()?.charAt(0)?.toUpperCase() || 'U'

  useEffect(() => {
    let ativo = true
    let urlAtual = null

    async function atualizarFoto() {
      try {
        const blob = await buscarFotoPerfil()

        if (!ativo) return

        if (blob) {
          const novaUrl = URL.createObjectURL(blob)
          urlAtual = novaUrl
          setFotoUrl(novaUrl)
        } else {
          setFotoUrl(null)
        }
      } catch {
        if (ativo) setFotoUrl(null)
      }
    }

    atualizarFoto()

    function atualizarPerfil() {
      setUsuario(lerUsuarioSalvo())

      buscarFotoPerfil()
        .then((blob) => {
          if (!ativo) return

          const novaUrl = blob
            ? URL.createObjectURL(blob)
            : null

          const anterior = urlAtual
          urlAtual = novaUrl
          setFotoUrl(novaUrl)

          if (anterior) {
            URL.revokeObjectURL(anterior)
          }
        })
        .catch(() => {
          // Mantém a foto anterior.
        })
    }

    window.addEventListener(
      'cj-profile-updated',
      atualizarPerfil,
    )

    return () => {
      ativo = false

      window.removeEventListener(
        'cj-profile-updated',
        atualizarPerfil,
      )

      if (urlAtual) {
        URL.revokeObjectURL(urlAtual)
      }
    }
  }, [])

  useEffect(() => {
    setMenuAberto(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuAberto) return

    function aoPressionarTecla(event) {
      if (event.key === 'Escape') {
        setMenuAberto(false)
      }
    }

    function aoRedimensionar() {
      if (window.innerWidth > 700) {
        setMenuAberto(false)
      }
    }

    window.addEventListener('keydown', aoPressionarTecla)
    window.addEventListener('resize', aoRedimensionar)

    return () => {
      window.removeEventListener('keydown', aoPressionarTecla)
      window.removeEventListener('resize', aoRedimensionar)
    }
  }, [menuAberto])

  function fecharMenu() {
    setMenuAberto(false)
  }

  function handleLogout() {
    fecharMenu()

    localStorage.removeItem('cj_token')
    localStorage.removeItem('cj_usuario')

    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-layout">
      {menuAberto && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={fecharMenu}
          aria-label="Fechar menu de navegação"
          tabIndex={-1}
        />
      )}

      <aside
        id="admin-navigation"
        className={`admin-sidebar ${
          menuAberto ? 'admin-sidebar-open' : ''
        }`}
        aria-label="Navegação administrativa"
      >
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

          <button
            type="button"
            className="sidebar-close-button"
            onClick={fecharMenu}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {podeAcessarEvento && (
            <>
              <p className="sidebar-section-title">
                EVENTO
              </p>

              <NavLink
                to="/admin/eventos"
                onClick={fecharMenu}
              >
                Eventos
              </NavLink>

              <NavLink
                to="/admin/sessoes"
                onClick={fecharMenu}
              >
                Sessões
              </NavLink>

              <NavLink
                to="/admin/participantes"
                onClick={fecharMenu}
              >
                Participantes
              </NavLink>

              <NavLink
                to="/admin/recepcao"
                end
                onClick={fecharMenu}
              >
                Recepção
              </NavLink>

              <NavLink
                to="/admin/recepcao/grupos"
                onClick={fecharMenu}
              >
                Formação de Grupos
              </NavLink>

              {podeAcessarSympla && (
                <NavLink
                  to="/admin/sympla"
                  onClick={fecharMenu}
                >
                  Sympla
                </NavLink>
              )}
            </>
          )}

          <p className="sidebar-section-title">
            ADMINISTRAÇÃO
          </p>

          {isAdmin && (
            <NavLink
              to="/admin/usuarios"
              onClick={fecharMenu}
            >
              Usuários
            </NavLink>
          )}

          <NavLink
            to="/admin/configuracoes"
            onClick={fecharMenu}
          >
            Configurações
          </NavLink>
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
          <div className="admin-header-start">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMenuAberto((atual) => !atual)}
              aria-label="Abrir menu de navegação"
              aria-expanded={menuAberto}
              aria-controls="admin-navigation"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="admin-header-title">
              <p className="admin-header-small">
                Casa do Julgamento
              </p>
              <strong>Painel Administrativo</strong>
            </div>
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

            <div className="admin-user-details">
              <strong>{usuario?.nome || 'Usuário'}</strong>
              <span>{role || 'SEM PERFIL'}</span>
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
