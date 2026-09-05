import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import logoCasaJulgamento from '../../main/resources/static/assets/images/logo-cj.png'
import './AdminLayout.css'

function AdminLayout() {
  const navigate = useNavigate()

  const usuarioSalvo =
    localStorage.getItem('cj_usuario')

  let usuario = {
    nome: 'Usuário',
    role: 'SEM PERFIL',
  }

  try {
    if (usuarioSalvo) {
      usuario = JSON.parse(usuarioSalvo)
    }
  } catch {
    localStorage.removeItem('cj_usuario')
  }

  const role = usuario.role

  const isAdmin = role === 'ADMIN'
  const isCoordenador = role === 'COORDENADOR'

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

  const podeAcessarConfiguracoes =
    isAdmin || isCoordenador

  const inicial =
    usuario.nome
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || 'U'

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

              {(isAdmin || isCoordenador) && (
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
              {inicial}
            </div>

            <div>
              <strong>{usuario.nome}</strong>
              <span>{usuario.role}</span>
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