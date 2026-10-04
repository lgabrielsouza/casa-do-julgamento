import './Toast.css'

function Toast({
  tipo = 'success',
  mensagem,
  visivel,
}) {
  if (!visivel || !mensagem) {
    return null
  }

  const icones = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  }

  return (
    <div className={`toast toast-${tipo}`}>
      <div className="toast-icon">
        {icones[tipo]}
      </div>

      <div className="toast-content">
        <strong>
          {tipo === 'success' && 'Sucesso'}
          {tipo === 'error' && 'Erro'}
          {tipo === 'warning' && 'Atenção'}
          {tipo === 'info' && 'Informação'}
        </strong>

        <span>{mensagem}</span>
      </div>
    </div>
  )
}

export default Toast