import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('cj_token')
  const usuarioSalvo =
    localStorage.getItem('cj_usuario')

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  if (roles?.length) {
    let usuario = null

    try {
      usuario = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : null
    } catch {
      localStorage.removeItem('cj_token')
      localStorage.removeItem('cj_usuario')

      return (
        <Navigate
          to="/admin/login"
          replace
        />
      )
    }

    if (
      !usuario?.role ||
      !roles.includes(usuario.role)
    ) {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      )
    }
  }

  return children
}

export default ProtectedRoute