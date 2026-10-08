
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './admin/login/Login.jsx'
import AdminLayout from './admin/layouts/AdminLayout.jsx'
import Eventos from './admin/eventos/Eventos.jsx'
import Sessoes from './admin/sessoes/Sessoes.jsx'
import Participantes from './admin/participantes/Participantes.jsx'
import Recepcao from './admin/recepcao/Recepcao.jsx'
import RecepcaoPrint from './admin/recepcao/RecepcaoPrint.jsx'
import Usuarios from './admin/usuarios/Usuarios.jsx'
import Configuracoes from './admin/configuracoes/Configuracoes.jsx'
import Sympla from './admin/sympla/Sympla.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RecepcaoGrupos from './admin/recepcao/RecepcaoGrupos.jsx'

const PERFIS_EVENTO = [
  'ADMIN',
  'COORDENADOR',
  'LIDER',
  'RECEPCAO',
]

const PERFIS_GERAIS = [
  'ADMIN',
  'COORDENADOR',
]

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      <Route
        path="/admin/login"
        element={<Login />}
      />

      <Route
        path="/admin/recepcao/imprimir/:sessionId"
        element={
          <ProtectedRoute roles={PERFIS_EVENTO}>
            <RecepcaoPrint />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="eventos"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <Navigate
              to="/admin/eventos"
              replace
            />
          }
        />

        <Route
          path="eventos"
          element={
            <ProtectedRoute roles={PERFIS_EVENTO}>
              <Eventos />
            </ProtectedRoute>
          }
        />

        <Route
          path="sessoes"
          element={
            <ProtectedRoute roles={PERFIS_EVENTO}>
              <Sessoes />
            </ProtectedRoute>
          }
        />

        <Route
          path="participantes"
          element={
            <ProtectedRoute roles={PERFIS_EVENTO}>
              <Participantes />
            </ProtectedRoute>
          }
        />

        <Route
          path="recepcao"
          element={
            <ProtectedRoute roles={PERFIS_EVENTO}>
              <Recepcao />
            </ProtectedRoute>
          }
        />

        <Route
          path="recepcao/grupos"
          element={
            <ProtectedRoute roles={PERFIS_EVENTO}>
              <RecepcaoGrupos />
            </ProtectedRoute>
          }
        />

        <Route
          path="sympla"
          element={
            <ProtectedRoute roles={PERFIS_GERAIS}>
              <Sympla />
            </ProtectedRoute>
          }
        />

        <Route
          path="usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="configuracoes"
          element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <h1>Página não encontrada</h1>
        }
      />
    </Routes>
  )
}

export default App
