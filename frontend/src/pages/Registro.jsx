import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Registro() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
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
      await register(nombre.trim(), correo.trim(), password);
      navigate('/usuario', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.errores?.join(' ') || requestError.response?.data?.mensaje || 'No fue posible crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">I</span><span>Inventario<span>EMPRESARIAL</span></span></div>
        <p className="eyebrow">ACCESO AL SISTEMA</p>
        <h1>Crear cuenta</h1>
        <p className="subtitle">Registra tus datos para administrar el inventario.</p>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>Nombre
            <input type="text" autoComplete="name" value={nombre} onChange={(event) => setNombre(event.target.value)} required maxLength={150} />
          </label>
          <label>Correo electrónico
            <input type="email" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} required maxLength={254} />
          </label>
          <label>Contraseña
            <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          </label>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </section>
    </main>
  );
}
