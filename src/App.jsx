import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Login from './admin/login/Login.jsx'
import AdminLayout from './admin/layouts/AdminLayout.jsx'
import Dashboard from './admin/dashboard/Dashboard.jsx'
import Eventos from './admin/eventos/Eventos.jsx'
import Sessoes from './admin/sessoes/Sessoes.jsx'
import Participantes from './admin/participantes/Participantes.jsx'
import Recepcao from './admin/recepcao/Recepcao.jsx'
import RecepcaoPrint from './admin/recepcao/RecepcaoPrint.jsx'
import Ingressos from './admin/ingressos/Ingressos.jsx'
import Decisoes from './admin/decisoes/Decisoes.jsx'
import Igrejas from './admin/igrejas/Igrejas.jsx'
import Usuarios from './admin/usuarios/Usuarios.jsx'
import Relatorios from './admin/relatorios/Relatorios.jsx'
import Configuracoes from './admin/configuracoes/Configuracoes.jsx'
import Sympla from './admin/sympla/Sympla.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

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
          <ProtectedRoute>
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
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="eventos"
          element={<Eventos />}
        />

        <Route
          path="sessoes"
          element={<Sessoes />}
        />

        <Route
          path="participantes"
          element={<Participantes />}
        />

        <Route
          path="recepcao"
          element={<Recepcao />}
        />

        <Route
          path="ingressos"
          element={<Ingressos />}
        />

        <Route
          path="sympla"
          element={<Sympla />}
        />

        <Route
          path="decisoes"
          element={<Decisoes />}
        />

        <Route
          path="igrejas"
          element={<Igrejas />}
        />

        <Route
          path="usuarios"
          element={<Usuarios />}
        />

        <Route
          path="relatorios"
          element={<Relatorios />}
        />

        <Route
          path="configuracoes"
          element={<Configuracoes />}
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