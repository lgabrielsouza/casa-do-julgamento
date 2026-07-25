import { useEffect, useRef, useState } from 'react'

import './EventoActions.css'

function EventoActions({
  evento,
  onEditar,
  onVisualizar,
  onDesativar,
}) {
  const [aberto, setAberto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setAberto(false)
      }
    }

    function fecharComEscape(event) {
      if (event.key === 'Escape') {
        setAberto(false)
      }
    }

    document.addEventListener(
      'mousedown',
      fecharAoClicarFora,
    )

    document.addEventListener(
      'keydown',
      fecharComEscape,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        fecharAoClicarFora,
      )

      document.removeEventListener(
        'keydown',
        fecharComEscape,
      )
    }
  }, [])

  function executarAcao(callback) {
    setAberto(false)
    callback(evento)
  }

  return (
    <div
      className="evento-actions"
      ref={menuRef}
    >
      <button
        type="button"
        className="evento-actions-trigger"
        aria-label={`Abrir ações do evento ${evento.name}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() =>
          setAberto((estadoAtual) => !estadoAtual)
        }
      >
        <span aria-hidden="true">⋮</span>
      </button>

      {aberto && (
        <div
          className="evento-actions-menu"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              executarAcao(onVisualizar)
            }
          >
            <span
              className="evento-actions-icon"
              aria-hidden="true"
            >
              👁
            </span>

            <span>Visualizar</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              executarAcao(onEditar)
            }
          >
            <span
              className="evento-actions-icon"
              aria-hidden="true"
            >
              ✏
            </span>

            <span>Editar</span>
          </button>

          <div className="evento-actions-divider" />

          <button
            type="button"
            role="menuitem"
            className="evento-actions-danger"
            onClick={() =>
              executarAcao(onDesativar)
            }
          >
            <span
              className="evento-actions-icon"
              aria-hidden="true"
            >
              ⛔
            </span>

            <span>Desativar</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default EventoActions