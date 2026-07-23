import { useMemo, useState } from 'react'
import './Usuarios.css'

function Usuarios() {
  const [busca, setBusca] = useState('')
  const [perfil, setPerfil] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)

  const usuarios = [
    {
      id: 1,
      nome: 'Administrador CJ',
      email: 'admin@casadojulgamento.com',
      perfil: 'Administrador',
      status: 'Ativo',
      ultimoAcesso: '21/07/2026 19:40',
    },
    {
      id: 2,
      nome: 'Equipe Recepção 01',
      email: 'recepcao01@casadojulgamento.com',
      perfil: 'Recepção',
      status: 'Ativo',
      ultimoAcesso: '21/07/2026 18:52',
    },
    {
      id: 3,
      nome: 'Portaria 01',
      email: 'portaria01@casadojulgamento.com',
      perfil: 'Portaria',
      status: 'Ativo',
      ultimoAcesso: '21/07/2026 18:48',
    },
    {
      id: 4,
      nome: 'Portaria 02',
      email: 'portaria02@casadojulgamento.com',
      perfil: 'Portaria',
      status: 'Inativo',
      ultimoAcesso: 'Nunca',
    },
  ]

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      const correspondeBusca =
        !termo ||
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo)

      const correspondePerfil =
        perfil === 'todos' || usuario.perfil === perfil

      const correspondeStatus =
        status === 'todos' || usuario.status === status

      return (
        correspondeBusca &&
        correspondePerfil &&
        correspondeStatus
      )
    })
  }, [busca, perfil, status])

  return (
    <div className="usuarios-page">
      <div className="usuarios-heading">
        <div>
          <p className="usuarios-eyebrow">
            Administração
          </p>

          <h1>Usuários</h1>

          <p>
            Gerencie os acessos e permissões do painel administrativo.
          </p>
        </div>

        <button
          type="button"
          className="novo-usuario-button"
          onClick={() => setModalAberto(true)}
        >
          + Novo usuário
        </button>
      </div>

      <section className="usuarios-summary">
        <div>
          <span>Total</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div>
          <span>Administradores</span>
          <strong>
            {
              usuarios.filter(
                (usuario) =>
                  usuario.perfil === 'Administrador',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Recepção</span>
          <strong>
            {
              usuarios.filter(
                (usuario) =>
                  usuario.perfil === 'Recepção',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Portaria</span>
          <strong>
            {
              usuarios.filter(
                (usuario) =>
                  usuario.perfil === 'Portaria',
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="usuarios-card">
        <div className="usuarios-filters">
          <div className="usuarios-search">
            <label htmlFor="buscarUsuario">
              Buscar
            </label>

            <input
              id="buscarUsuario"
              type="search"
              placeholder="Nome ou e-mail..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          <div className="usuarios-filter">
            <label htmlFor="perfilUsuario">
              Perfil
            </label>

            <select
              id="perfilUsuario"
              value={perfil}
              onChange={(event) =>
                setPerfil(event.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="Administrador">
                Administrador
              </option>

              <option value="Recepção">
                Recepção
              </option>

              <option value="Portaria">
                Portaria
              </option>
            </select>
          </div>

          <div className="usuarios-filter">
            <label htmlFor="statusUsuario">
              Status
            </label>

            <select
              id="statusUsuario"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="Ativo">
                Ativo
              </option>

              <option value="Inativo">
                Inativo
              </option>
            </select>
          </div>
        </div>

        <div className="usuarios-card-header">
          <div>
            <h2>Usuários cadastrados</h2>

            <span>
              {usuariosFiltrados.length}{' '}
              {usuariosFiltrados.length === 1
                ? 'resultado'
                : 'resultados'}
            </span>
          </div>
        </div>

        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último acesso</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nome}</strong>

                    <span>{usuario.email}</span>
                  </td>

                  <td>
                    <span
                      className={`usuario-perfil ${usuario.perfil
                        .toLowerCase()
                        .replace('ç', 'c')
                        .replace('ã', 'a')}`}
                    >
                      {usuario.perfil}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        usuario.status === 'Ativo'
                          ? 'usuario-status ativo'
                          : 'usuario-status inativo'
                      }
                    >
                      {usuario.status}
                    </span>
                  </td>

                  <td>
                    {usuario.ultimoAcesso}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="usuario-action"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="usuarios-permissoes">
        <div className="usuarios-permissoes-header">
          <h2>Perfis de acesso</h2>

          <p>
            Visão geral das permissões previstas no sistema.
          </p>
        </div>

        <div className="permissoes-grid">
          <article className="permissao-card">
            <span className="permissao-number">
              01
            </span>

            <h3>Administrador</h3>

            <p>
              Possui acesso completo ao sistema.
            </p>

            <ul>
              <li>Dashboard</li>
              <li>Eventos e sessões</li>
              <li>Participantes e ingressos</li>
              <li>Portaria</li>
              <li>Decisões e igrejas</li>
              <li>Usuários e relatórios</li>
              <li>Configurações</li>
            </ul>
          </article>

          <article className="permissao-card">
            <span className="permissao-number">
              02
            </span>

            <h3>Recepção</h3>

            <p>
              Acesso operacional para atendimento ao público.
            </p>

            <ul>
              <li>Participantes</li>
              <li>Ingressos</li>
              <li>Consulta de sessões</li>
              <li>Apoio à portaria</li>
            </ul>
          </article>

          <article className="permissao-card">
            <span className="permissao-number">
              03
            </span>

            <h3>Portaria</h3>

            <p>
              Perfil restrito ao controle de acesso.
            </p>

            <ul>
              <li>Central de Portaria</li>
              <li>Consulta de participante</li>
              <li>Validação interna</li>
            </ul>
          </article>
        </div>
      </section>

      {modalAberto && (
        <div className="usuario-modal-overlay">
          <div className="usuario-modal">
            <div className="usuario-modal-header">
              <div>
                <span>Acesso</span>

                <h2>Novo usuário</h2>
              </div>

              <button
                type="button"
                className="usuario-modal-close"
                onClick={() =>
                  setModalAberto(false)
                }
              >
                ×
              </button>
            </div>

            <form className="usuario-form">
              <div className="usuario-form-group">
                <label htmlFor="nomeUsuario">
                  Nome
                </label>

                <input
                  id="nomeUsuario"
                  type="text"
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="emailUsuario">
                  E-mail
                </label>

                <input
                  id="emailUsuario"
                  type="email"
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="perfilNovoUsuario">
                    Perfil
                  </label>

                  <select
                    id="perfilNovoUsuario"
                    defaultValue=""
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione
                    </option>

                    <option value="Administrador">
                      Administrador
                    </option>

                    <option value="Recepção">
                      Recepção
                    </option>

                    <option value="Portaria">
                      Portaria
                    </option>
                  </select>
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="statusNovoUsuario">
                    Status
                  </label>

                  <select
                    id="statusNovoUsuario"
                    defaultValue="Ativo"
                  >
                    <option value="Ativo">
                      Ativo
                    </option>

                    <option value="Inativo">
                      Inativo
                    </option>
                  </select>
                </div>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="senhaUsuario">
                    Senha inicial
                  </label>

                  <input
                    id="senhaUsuario"
                    type="password"
                    placeholder="Digite uma senha"
                  />
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="confirmarSenhaUsuario">
                    Confirmar senha
                  </label>

                  <input
                    id="confirmarSenhaUsuario"
                    type="password"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <div className="usuario-security-note">
                <strong>
                  Segurança
                </strong>

                <p>
                  Quando conectarmos o backend, as senhas não
                  serão armazenadas em texto simples. Elas serão
                  protegidas por hash seguro.
                </p>
              </div>

              <div className="usuario-modal-actions">
                <button
                  type="button"
                  className="usuario-cancel-button"
                  onClick={() =>
                    setModalAberto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuario-save-button"
                >
                  Criar usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios