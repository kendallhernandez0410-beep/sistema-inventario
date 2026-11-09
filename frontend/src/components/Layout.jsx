import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'admin';
  const home = isAdmin ? '/admin' : '/usuario';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to={home}>Inventario<span>EMPRESARIAL</span></NavLink>
        <nav className="side-nav" aria-label="Navegación principal">
          <NavLink end to={home}>{isAdmin ? 'Panel administrador' : 'Panel usuario'}</NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/productos">Productos</NavLink>
              <NavLink to="/categorias">Categorías</NavLink>
              <NavLink to="/proveedores">Proveedores</NavLink>
            </>
          ) : (
            <NavLink to="/usuario">Inventario</NavLink>
          )}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar" aria-hidden="true">{user?.nombre?.slice(0, 1).toUpperCase()}</div>
          <div className="user-details">
            <strong>{user?.nombre}</strong>
            <span>{isAdmin ? 'Administrador' : 'Usuario'} · {user?.correo}</span>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
            ↪
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
