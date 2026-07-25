import { useEffect, useRef, useState } from 'react'

function EventoActions({
  evento,
  onEditar,
  onVisualizar,
  onDesativar,
}) {
  const [aberto, setAberto] = useState(false)

  const menuRef = useRef(null)

  useEffect(() => {
    function fechar(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', fechar)

    return () =>
      document.removeEventListener(
        'mousedown',
        fechar,
      )
  }, [])

  return (
    <div
      className="evento-actions"
      ref={menuRef}
    >
      <button
        type="button"
        className="evento-actions-button"
        onClick={() => setAberto(!aberto)}
      >
        ⋮
      </button>

      {aberto && (
        <div className="evento-actions-menu">
          <button
            type="button"
            onClick={() => {
              setAberto(false)
              onEditar(evento)
            }}
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            onClick={() => {
              setAberto(false)
              onVisualizar(evento)
            }}
          >
            👁️ Visualizar
          </button>

          <button
            type="button"
            className="danger"
            onClick={() => {
              setAberto(false)
              onDesativar(evento)
            }}
          >
            🚫 Desativar
          </button>
        </div>
      )}
    </div>
  )
}

export default EventoActions