import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={user?.rol === 'admin' ? '/admin' : '/usuario'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(correo.trim(), password);
      const destination = location.state?.from?.pathname;
      navigate(destination && destination !== '/login'
        ? destination
        : (loggedUser.rol === 'admin' ? '/admin' : '/usuario'), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || 'No fue posible iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">I</span><span>Inventario<span>EMPRESARIAL</span></span></div>
        <p className="eyebrow">BIENVENIDO DE NUEVO</p>
        <h1>Iniciar sesión</h1>
        <p className="subtitle">Ingresa tus credenciales para continuar.</p>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>Correo electrónico
            <input type="email" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} required maxLength={254} />
          </label>
          <label>Contraseña
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Validando…' : 'Entrar al sistema'}
          </button>
        </form>
        <p className="auth-switch">¿Aún no tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
      </section>
    </main>
  );
}
