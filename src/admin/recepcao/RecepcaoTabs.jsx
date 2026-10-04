import { NavLink } from 'react-router-dom'

function RecepcaoTabs() {
  return (
    <div className="recepcao-tabs">
      <NavLink
        to="/admin/recepcao"
        end
        className={({ isActive }) =>
          `recepcao-tab ${isActive ? 'active' : ''}`
        }
      >
        Atendimento
      </NavLink>

      <NavLink
        to="/admin/recepcao/grupos"
        className={({ isActive }) =>
          `recepcao-tab ${isActive ? 'active' : ''}`
        }
      >
        Grupos
      </NavLink>
    </div>
  )
}

export default RecepcaoTabs