import { useEffect, useMemo, useState } from 'react'
import {
  alterarStatusUsuario,
  atualizarUsuario,
  criarUsuario,
  listarUsuarios,
  redefinirSenhaUsuario,
} from '../../services/userService'
import './Usuarios.css'

const PERFIS = {
  ADMIN: 'Administrador',
  COORDENADOR: 'Coordenador',
  LIDER: 'Líder',
  RECEPCAO: 'Recepção',
}

const CLASSES_PERFIL = {
  ADMIN: 'administrador',
  COORDENADOR: 'coordenador',
  LIDER: 'lider',
  RECEPCAO: 'recepcao',
}

function traduzirPerfil(role) {
  return PERFIS[role] ?? role ?? 'Não informado'
}

function Usuarios() {
  const [busca, setBusca] = useState('')
  const [perfil, setPerfil] = useState('todos')
  const [status, setStatus] = useState('todos')

  const [modalAberto, setModalAberto] = useState(false)
  const [usuarioGerenciado, setUsuarioGerenciado] = useState(null)

  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')

  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [erroEdicao, setErroEdicao] = useState('')

  const [alterandoStatus, setAlterandoStatus] = useState(false)

  const [redefinindoSenha, setRedefinindoSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')

  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: '',
    senha: '',
    confirmarSenha: '',
  })

  const [usuarioEdicao, setUsuarioEdicao] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: '',
  })

  async function carregarUsuarios() {
    try {
      setCarregando(true)
      setErro('')

      const resposta = await listarUsuarios()

      setUsuarios(
        Array.isArray(resposta)
          ? resposta
          : [],
      )
    } catch (error) {
      setErro(
        error?.message ||
          'Não foi possível carregar os usuários.',
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      const correspondeBusca =
        !termo ||
        usuario.nome
          ?.toLowerCase()
          .includes(termo) ||
        usuario.email
          ?.toLowerCase()
          .includes(termo)

      const correspondePerfil =
        perfil === 'todos' ||
        usuario.role === perfil

      const correspondeStatus =
        status === 'todos' ||
        (status === 'Ativo' && usuario.ativo) ||
        (status === 'Inativo' && !usuario.ativo)

      return (
        correspondeBusca &&
        correspondePerfil &&
        correspondeStatus
      )
    })
  }, [usuarios, busca, perfil, status])

  function abrirModalNovoUsuario() {
    setNovoUsuario({
      nome: '',
      email: '',
      telefone: '',
      role: '',
      senha: '',
      confirmarSenha: '',
    })

    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setErroFormulario('')
  }

  function atualizarCampoNovoUsuario(event) {
    const { name, value } = event.target

    setNovoUsuario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  async function handleCriarUsuario(event) {
    event.preventDefault()

    setErroFormulario('')

    if (!novoUsuario.nome.trim()) {
      setErroFormulario(
        'Informe o nome do usuário.',
      )
      return
    }

    if (!novoUsuario.email.trim()) {
      setErroFormulario(
        'Informe o e-mail do usuário.',
      )
      return
    }

    if (!novoUsuario.role) {
      setErroFormulario(
        'Selecione o perfil de acesso.',
      )
      return
    }

    if (
      novoUsuario.senha.length < 8 ||
      novoUsuario.senha.length > 72
    ) {
      setErroFormulario(
        'A senha deve possuir entre 8 e 72 caracteres.',
      )
      return
    }

    if (
      novoUsuario.senha !==
      novoUsuario.confirmarSenha
    ) {
      setErroFormulario(
        'As senhas informadas não coincidem.',
      )
      return
    }

    try {
      setSalvando(true)

      await criarUsuario({
        nome: novoUsuario.nome.trim(),
        email: novoUsuario.email
          .trim()
          .toLowerCase(),
        telefone:
          novoUsuario.telefone.trim() || null,
        senha: novoUsuario.senha,
        role: novoUsuario.role,
      })

      setModalAberto(false)

      await carregarUsuarios()
    } catch (error) {
      setErroFormulario(
        error?.message ||
          'Não foi possível criar o usuário.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function handleAlterarStatusUsuario() {
    if (!usuarioGerenciado) {
      return
    }

    const novoStatus = !usuarioGerenciado.ativo

    const mensagem = novoStatus
      ? `Deseja ativar o usuário "${usuarioGerenciado.nome}"?`
      : `Deseja desativar o usuário "${usuarioGerenciado.nome}"?`

    if (!window.confirm(mensagem)) {
      return
    }

    try {
      setAlterandoStatus(true)
      setErroEdicao('')

      const usuarioAtualizado =
        await alterarStatusUsuario(
          usuarioGerenciado.id,
          novoStatus,
        )

      setUsuarioGerenciado(usuarioAtualizado)

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((usuario) =>
          usuario.id === usuarioAtualizado.id
            ? usuarioAtualizado
            : usuario,
        ),
      )
    } catch (error) {
      setErroEdicao(
        error?.message ||
          'Não foi possível alterar o status do usuário.',
      )
    } finally {
      setAlterandoStatus(false)
    }
  }

  function abrirModalGerenciar(usuario) {
    setUsuarioGerenciado(usuario)

    setUsuarioEdicao({
      nome: usuario.nome ?? '',
      email: usuario.email ?? '',
      telefone: usuario.telefone ?? '',
      role: usuario.role ?? '',
    })

    setNovaSenha('')
    setConfirmarNovaSenha('')
    setErroEdicao('')
    setErroSenha('')
    setMensagemSenha('')
  }

  function fecharModalGerenciar() {
    if (
      salvandoEdicao ||
      alterandoStatus ||
      redefinindoSenha
    ) {
      return
    }

    setUsuarioGerenciado(null)
    setErroEdicao('')
    setErroSenha('')
    setMensagemSenha('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
  }

  function atualizarCampoEdicao(event) {
    const { name, value } = event.target

    setUsuarioEdicao((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  async function handleAtualizarUsuario(event) {
    event.preventDefault()

    setErroEdicao('')

    if (!usuarioEdicao.nome.trim()) {
      setErroEdicao(
        'Informe o nome do usuário.',
      )
      return
    }

    if (!usuarioEdicao.email.trim()) {
      setErroEdicao(
        'Informe o e-mail do usuário.',
      )
      return
    }

    if (!usuarioEdicao.role) {
      setErroEdicao(
        'Selecione o perfil de acesso.',
      )
      return
    }

    try {
      setSalvandoEdicao(true)

      await atualizarUsuario(
        usuarioGerenciado.id,
        {
          nome: usuarioEdicao.nome.trim(),
          email: usuarioEdicao.email
            .trim()
            .toLowerCase(),
          telefone:
            usuarioEdicao.telefone.trim() || null,
          role: usuarioEdicao.role,
        },
      )

      setUsuarioGerenciado(null)

      await carregarUsuarios()
    } catch (error) {
      setErroEdicao(
        error?.message ||
          'Não foi possível atualizar o usuário.',
      )
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function handleRedefinirSenha() {
    setErroSenha('')
    setMensagemSenha('')

    if (!usuarioGerenciado) {
      return
    }

    if (!novaSenha) {
      setErroSenha(
        'Informe a nova senha.',
      )
      return
    }

    if (
      novaSenha.length < 8 ||
      novaSenha.length > 72
    ) {
      setErroSenha(
        'A nova senha deve possuir entre 8 e 72 caracteres.',
      )
      return
    }

    if (!confirmarNovaSenha) {
      setErroSenha(
        'Confirme a nova senha.',
      )
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha(
        'As senhas informadas não coincidem.',
      )
      return
    }

    const confirmou = window.confirm(
      `Deseja redefinir a senha do usuário "${usuarioGerenciado.nome}"?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setRedefinindoSenha(true)

      await redefinirSenhaUsuario(
        usuarioGerenciado.id,
        novaSenha,
      )

      setNovaSenha('')
      setConfirmarNovaSenha('')

      setMensagemSenha(
        'Senha redefinida com sucesso.',
      )
    } catch (error) {
      setErroSenha(
        error?.message ||
          'Não foi possível redefinir a senha.',
      )
    } finally {
      setRedefinindoSenha(false)
    }
  }

  const bloqueadoGerenciamento =
    salvandoEdicao ||
    alterandoStatus ||
    redefinindoSenha

  return (
    <div className="usuarios-page">
      <div className="usuarios-heading">
        <div>
          <p className="usuarios-eyebrow">
            Administração
          </p>

          <h1>Usuários</h1>

          <p>
            Gerencie os acessos e permissões do painel
            administrativo.
          </p>
        </div>

        <button
          type="button"
          className="novo-usuario-button"
          onClick={abrirModalNovoUsuario}
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
                  usuario.role === 'ADMIN',
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Coordenadores</span>

          <strong>
            {
              usuarios.filter(
                (usuario) =>
                  usuario.role === 'COORDENADOR',
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
                  usuario.role === 'RECEPCAO',
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

              <option value="ADMIN">
                Administrador
              </option>

              <option value="COORDENADOR">
                Coordenador
              </option>

              <option value="LIDER">
                Líder
              </option>

              <option value="RECEPCAO">
                Recepção
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

        {erro && (
          <div className="usuarios-error">
            {erro}
          </div>
        )}

        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="5">
                    Carregando usuários...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map(
                  (usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>
                          {usuario.nome}
                        </strong>

                        <span>
                          {usuario.email}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`usuario-perfil ${
                            CLASSES_PERFIL[
                              usuario.role
                            ] ?? ''
                          }`}
                        >
                          {traduzirPerfil(
                            usuario.role,
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            usuario.ativo
                              ? 'usuario-status ativo'
                              : 'usuario-status inativo'
                          }
                        >
                          {usuario.ativo
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </td>

                      <td>
                        {usuario.telefone ||
                          'Não informado'}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="usuario-action"
                          onClick={() =>
                            abrirModalGerenciar(
                              usuario,
                            )
                          }
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="usuarios-permissoes">
        <div className="usuarios-permissoes-header">
          <h2>Perfis de acesso</h2>

          <p>
            Visão geral das permissões previstas
            no sistema.
          </p>
        </div>

        <div className="permissoes-grid">
          <article className="permissao-card">
            <span className="permissao-number">
              01
            </span>

            <h3>Administrador</h3>

            <p>
              Possui acesso geral e às funções
              administrativas do sistema.
            </p>

            <ul>
              <li>Eventos e sessões</li>
              <li>Participantes</li>
              <li>Recepção e grupos</li>
              <li>Integrações</li>
              <li>Usuários</li>
              <li>Relatórios</li>
              <li>Configurações</li>
            </ul>
          </article>

          <article className="permissao-card">
            <span className="permissao-number">
              02
            </span>

            <h3>Coordenador</h3>

            <p>
              Possui acesso geral às áreas
              operacionais e de coordenação.
            </p>

            <ul>
              <li>Eventos e sessões</li>
              <li>Participantes</li>
              <li>Recepção e grupos</li>
              <li>Integração com a Sympla</li>
            </ul>
          </article>

          <article className="permissao-card">
            <span className="permissao-number">
              03
            </span>

            <h3>Líder</h3>

            <p>
              Acesso às operações relacionadas
              ao evento.
            </p>

            <ul>
              <li>Eventos</li>
              <li>Sessões</li>
              <li>Participantes</li>
              <li>Recepção e grupos</li>
            </ul>
          </article>

          <article className="permissao-card">
            <span className="permissao-number">
              04
            </span>

            <h3>Recepção</h3>

            <p>
              Acesso operacional às atividades
              do evento e atendimento.
            </p>

            <ul>
              <li>Eventos e sessões</li>
              <li>Participantes</li>
              <li>Atendimento</li>
              <li>Formação de grupos</li>
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
                onClick={fecharModal}
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form
              className="usuario-form"
              onSubmit={handleCriarUsuario}
            >
              <div className="usuario-form-group">
                <label htmlFor="nomeUsuario">
                  Nome
                </label>

                <input
                  id="nomeUsuario"
                  name="nome"
                  type="text"
                  placeholder="Nome do usuário"
                  value={novoUsuario.nome}
                  onChange={atualizarCampoNovoUsuario}
                  disabled={salvando}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="emailUsuario">
                  E-mail
                </label>

                <input
                  id="emailUsuario"
                  name="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={novoUsuario.email}
                  onChange={atualizarCampoNovoUsuario}
                  disabled={salvando}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="telefoneUsuario">
                  Telefone
                </label>

                <input
                  id="telefoneUsuario"
                  name="telefone"
                  type="text"
                  placeholder="Telefone"
                  value={novoUsuario.telefone}
                  onChange={atualizarCampoNovoUsuario}
                  disabled={salvando}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="perfilNovoUsuario">
                  Perfil
                </label>

                <select
                  id="perfilNovoUsuario"
                  name="role"
                  value={novoUsuario.role}
                  onChange={atualizarCampoNovoUsuario}
                  disabled={salvando}
                >
                  <option
                    value=""
                    disabled
                  >
                    Selecione
                  </option>

                  <option value="ADMIN">
                    Administrador
                  </option>

                  <option value="COORDENADOR">
                    Coordenador
                  </option>

                  <option value="LIDER">
                    Líder
                  </option>

                  <option value="RECEPCAO">
                    Recepção
                  </option>
                </select>
              </div>

              <div className="usuario-form-row">
                <div className="usuario-form-group">
                  <label htmlFor="senhaUsuario">
                    Senha inicial
                  </label>

                  <input
                    id="senhaUsuario"
                    name="senha"
                    type="password"
                    placeholder="Digite uma senha"
                    value={novoUsuario.senha}
                    onChange={atualizarCampoNovoUsuario}
                    disabled={salvando}
                  />
                </div>

                <div className="usuario-form-group">
                  <label htmlFor="confirmarSenhaUsuario">
                    Confirmar senha
                  </label>

                  <input
                    id="confirmarSenhaUsuario"
                    name="confirmarSenha"
                    type="password"
                    placeholder="Repita a senha"
                    value={novoUsuario.confirmarSenha}
                    onChange={atualizarCampoNovoUsuario}
                    disabled={salvando}
                  />
                </div>
              </div>

              {erroFormulario && (
                <div className="usuarios-error">
                  {erroFormulario}
                </div>
              )}

              <div className="usuario-security-note">
                <strong>Segurança</strong>

                <p>
                  As senhas são armazenadas no
                  backend utilizando hash seguro.
                </p>
              </div>

              <div className="usuario-modal-actions">
                <button
                  type="button"
                  className="usuario-cancel-button"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuario-save-button"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Criando...'
                    : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioGerenciado && (
        <div className="usuario-modal-overlay">
          <div className="usuario-modal">
            <div className="usuario-modal-header">
              <div>
                <span>Gerenciamento</span>
                <h2>Editar usuário</h2>
              </div>

              <button
                type="button"
                className="usuario-modal-close"
                onClick={fecharModalGerenciar}
                disabled={bloqueadoGerenciamento}
              >
                ×
              </button>
            </div>

            <form
              className="usuario-form"
              onSubmit={handleAtualizarUsuario}
            >
              <div className="usuario-form-group">
                <label htmlFor="editarNomeUsuario">
                  Nome
                </label>

                <input
                  id="editarNomeUsuario"
                  name="nome"
                  type="text"
                  value={usuarioEdicao.nome}
                  onChange={atualizarCampoEdicao}
                  disabled={bloqueadoGerenciamento}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="editarEmailUsuario">
                  E-mail
                </label>

                <input
                  id="editarEmailUsuario"
                  name="email"
                  type="email"
                  value={usuarioEdicao.email}
                  onChange={atualizarCampoEdicao}
                  disabled={bloqueadoGerenciamento}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="editarTelefoneUsuario">
                  Telefone
                </label>

                <input
                  id="editarTelefoneUsuario"
                  name="telefone"
                  type="text"
                  value={usuarioEdicao.telefone}
                  onChange={atualizarCampoEdicao}
                  disabled={bloqueadoGerenciamento}
                />
              </div>

              <div className="usuario-form-group">
                <label htmlFor="editarPerfilUsuario">
                  Perfil
                </label>

                <select
                  id="editarPerfilUsuario"
                  name="role"
                  value={usuarioEdicao.role}
                  onChange={atualizarCampoEdicao}
                  disabled={bloqueadoGerenciamento}
                >
                  <option value="ADMIN">
                    Administrador
                  </option>

                  <option value="COORDENADOR">
                    Coordenador
                  </option>

                  <option value="LIDER">
                    Líder
                  </option>

                  <option value="RECEPCAO">
                    Recepção
                  </option>
                </select>
              </div>

              {erroEdicao && (
                <div className="usuarios-error">
                  {erroEdicao}
                </div>
              )}

              <div className="usuario-security-note">
                <strong>Status da conta</strong>

                <p>
                  Este usuário está atualmente{' '}
                  <strong>
                    {usuarioGerenciado.ativo
                      ? 'ativo'
                      : 'inativo'}
                  </strong>.
                </p>

                <button
                  type="button"
                  className="usuario-action"
                  onClick={handleAlterarStatusUsuario}
                  disabled={bloqueadoGerenciamento}
                >
                  {alterandoStatus
                    ? 'Alterando...'
                    : usuarioGerenciado.ativo
                      ? 'Desativar usuário'
                      : 'Ativar usuário'}
                </button>
              </div>

              <div className="usuario-security-note">
                <strong>Redefinir senha</strong>

                <p>
                  Defina uma nova senha para este usuário.
                </p>

                <div className="usuario-form-row">
                  <div className="usuario-form-group">
                    <label htmlFor="novaSenhaUsuario">
                      Nova senha
                    </label>

                    <input
                      id="novaSenhaUsuario"
                      type="password"
                      value={novaSenha}
                      onChange={(event) => {
                        setNovaSenha(event.target.value)
                        setErroSenha('')
                        setMensagemSenha('')
                      }}
                      placeholder="Mínimo de 8 caracteres"
                      disabled={bloqueadoGerenciamento}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="usuario-form-group">
                    <label htmlFor="confirmarNovaSenhaUsuario">
                      Confirmar nova senha
                    </label>

                    <input
                      id="confirmarNovaSenhaUsuario"
                      type="password"
                      value={confirmarNovaSenha}
                      onChange={(event) => {
                        setConfirmarNovaSenha(
                          event.target.value,
                        )
                        setErroSenha('')
                        setMensagemSenha('')
                      }}
                      placeholder="Repita a nova senha"
                      disabled={bloqueadoGerenciamento}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {erroSenha && (
                  <div className="usuarios-error">
                    {erroSenha}
                  </div>
                )}

                {mensagemSenha && (
                  <p>
                    <strong>
                      {mensagemSenha}
                    </strong>
                  </p>
                )}

                <button
                  type="button"
                  className="usuario-action"
                  onClick={handleRedefinirSenha}
                  disabled={bloqueadoGerenciamento}
                >
                  {redefinindoSenha
                    ? 'Redefinindo...'
                    : 'Redefinir senha'}
                </button>
              </div>

              <div className="usuario-modal-actions">
                <button
                  type="button"
                  className="usuario-cancel-button"
                  onClick={fecharModalGerenciar}
                  disabled={bloqueadoGerenciamento}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuario-save-button"
                  disabled={bloqueadoGerenciamento}
                >
                  {salvandoEdicao
                    ? 'Salvando...'
                    : 'Salvar alterações'}
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