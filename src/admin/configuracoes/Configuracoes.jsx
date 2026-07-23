import { useState } from 'react'
import './Configuracoes.css'

function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('geral')

  return (
    <div className="configuracoes-page">
      <div className="configuracoes-heading">
        <div>
          <p className="configuracoes-eyebrow">
            Administração
          </p>

          <h1>Configurações</h1>

          <p>
            Gerencie preferências gerais, integrações e configurações
            administrativas do sistema.
          </p>
        </div>
      </div>

      <div className="configuracoes-layout">
        <aside className="configuracoes-menu">
          <button
            type="button"
            className={abaAtiva === 'geral' ? 'active' : ''}
            onClick={() => setAbaAtiva('geral')}
          >
            Geral
          </button>

          <button
            type="button"
            className={abaAtiva === 'evento' ? 'active' : ''}
            onClick={() => setAbaAtiva('evento')}
          >
            Evento
          </button>

          <button
            type="button"
            className={abaAtiva === 'integracoes' ? 'active' : ''}
            onClick={() => setAbaAtiva('integracoes')}
          >
            Integrações
          </button>

          <button
            type="button"
            className={abaAtiva === 'seguranca' ? 'active' : ''}
            onClick={() => setAbaAtiva('seguranca')}
          >
            Segurança
          </button>
        </aside>

        <section className="configuracoes-content">
          {abaAtiva === 'geral' && (
            <div className="config-section">
              <div className="config-section-header">
                <h2>Configurações gerais</h2>

                <p>
                  Informações básicas exibidas dentro do sistema.
                </p>
              </div>

              <form className="config-form">
                <div className="config-form-group">
                  <label htmlFor="nomeProjeto">
                    Nome do projeto
                  </label>

                  <input
                    id="nomeProjeto"
                    type="text"
                    defaultValue="Casa do Julgamento"
                  />
                </div>

                <div className="config-form-row">
                  <div className="config-form-group">
                    <label htmlFor="emailProjeto">
                      E-mail administrativo
                    </label>

                    <input
                      id="emailProjeto"
                      type="email"
                      placeholder="admin@casadojulgamento.com"
                    />
                  </div>

                  <div className="config-form-group">
                    <label htmlFor="telefoneProjeto">
                      Telefone
                    </label>

                    <input
                      id="telefoneProjeto"
                      type="tel"
                      placeholder="(83) 99999-9999"
                    />
                  </div>
                </div>

                <div className="config-form-group">
                  <label htmlFor="instagramProjeto">
                    Instagram
                  </label>

                  <input
                    id="instagramProjeto"
                    type="text"
                    placeholder="@casadojulgamento"
                  />
                </div>

                <div className="config-form-actions">
                  <button type="submit">
                    Salvar alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {abaAtiva === 'evento' && (
            <div className="config-section">
              <div className="config-section-header">
                <h2>Evento ativo</h2>

                <p>
                  Configure informações utilizadas como padrão no painel.
                </p>
              </div>

              <form className="config-form">
                <div className="config-form-group">
                  <label htmlFor="eventoAtual">
                    Evento selecionado
                  </label>

                  <select
                    id="eventoAtual"
                    defaultValue="cj2026"
                  >
                    <option value="cj2026">
                      Casa do Julgamento 2026
                    </option>
                  </select>
                </div>

                <div className="config-form-row">
                  <div className="config-form-group">
                    <label htmlFor="inicioEvento">
                      Data inicial
                    </label>

                    <input
                      id="inicioEvento"
                      type="date"
                      defaultValue="2026-10-29"
                    />
                  </div>

                  <div className="config-form-group">
                    <label htmlFor="fimEvento">
                      Data final
                    </label>

                    <input
                      id="fimEvento"
                      type="date"
                      defaultValue="2026-11-14"
                    />
                  </div>
                </div>

                <div className="config-form-group">
                  <label htmlFor="statusEventoConfig">
                    Status padrão
                  </label>

                  <select
                    id="statusEventoConfig"
                    defaultValue="ativo"
                  >
                    <option value="ativo">
                      Ativo
                    </option>

                    <option value="rascunho">
                      Rascunho
                    </option>

                    <option value="encerrado">
                      Encerrado
                    </option>
                  </select>
                </div>

                <div className="config-form-actions">
                  <button type="submit">
                    Salvar evento
                  </button>
                </div>
              </form>
            </div>
          )}

          {abaAtiva === 'integracoes' && (
            <div className="config-section">
              <div className="config-section-header">
                <h2>Integrações</h2>

                <p>
                  Gerencie serviços externos utilizados pela plataforma.
                </p>
              </div>

              <div className="integration-card">
                <div className="integration-card-header">
                  <div>
                    <span>Venda de ingressos</span>
                    <h3>PagTickets</h3>
                  </div>

                  <span className="integration-status manual">
                    Integração manual
                  </span>
                </div>

                <p>
                  Atualmente a PagTickets não disponibiliza integração
                  automática por API ou webhook para o nosso fluxo.
                </p>

                <div className="integration-details">
                  <div>
                    <span>Venda online</span>
                    <strong>PagTickets</strong>
                  </div>

                  <div>
                    <span>QR Code</span>
                    <strong>PagTickets</strong>
                  </div>

                  <div>
                    <span>Validação</span>
                    <strong>App PagTickets</strong>
                  </div>

                  <div>
                    <span>Importação</span>
                    <strong>Arquivo manual</strong>
                  </div>
                </div>

                <div className="integration-warning">
                  <strong>
                    Sem sincronização automática
                  </strong>

                  <p>
                    Alterações realizadas na PagTickets, incluindo check-ins,
                    não serão refletidas automaticamente neste sistema enquanto
                    não houver API ou webhook disponível.
                  </p>
                </div>
              </div>

              <div className="future-integration">
                <span>Preparado para o futuro</span>

                <h3>API / Webhook PagTickets</h3>

                <p>
                  A arquitetura será mantida preparada para receber integração
                  automática quando esses recursos forem disponibilizados.
                </p>

                <button
                  type="button"
                  disabled
                >
                  Integração indisponível
                </button>
              </div>
            </div>
          )}

          {abaAtiva === 'seguranca' && (
            <div className="config-section">
              <div className="config-section-header">
                <h2>Segurança</h2>

                <p>
                  Preferências relacionadas ao acesso administrativo.
                </p>
              </div>

              <div className="security-options">
                <div className="security-option">
                  <div>
                    <strong>Sessão autenticada</strong>

                    <p>
                      Usuários deverão estar autenticados para acessar
                      o painel administrativo.
                    </p>
                  </div>

                  <span className="security-status planned">
                    Será implementado
                  </span>
                </div>

                <div className="security-option">
                  <div>
                    <strong>Controle por perfil</strong>

                    <p>
                      Administrador, Recepção e Portaria terão permissões
                      diferentes.
                    </p>
                  </div>

                  <span className="security-status planned">
                    Será implementado
                  </span>
                </div>

                <div className="security-option">
                  <div>
                    <strong>Senhas protegidas</strong>

                    <p>
                      As senhas serão armazenadas no backend utilizando
                      hash seguro.
                    </p>
                  </div>

                  <span className="security-status planned">
                    Será implementado
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Configuracoes