import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <section className="empty-panel not-found">
      <p className="eyebrow">404</p>
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al panel principal</Link>
    </section>
  );
}
