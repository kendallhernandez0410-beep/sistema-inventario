import { Link } from 'react-router-dom';

const modules = [
  { to: '/productos', title: 'Productos', description: 'Consulta existencias, costos y relaciones de suministro.', icon: '▦' },
  { to: '/categorias', title: 'Categorías', description: 'Organiza los productos en grupos fáciles de encontrar.', icon: '▤' },
  { to: '/proveedores', title: 'Proveedores', description: 'Administra la información de tus proveedores.', icon: '♧' },
];

export default function Dashboard() {
  return (
    <>
      <header className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">RESUMEN GENERAL</p>
          <h1>Panel administrador</h1>
          <p className="subtitle">Administra los datos y catálogos del sistema empresarial.</p>
        </div>
      </header>
      <section className="welcome-banner">
        <div>
          <p className="eyebrow">SISTEMA DE INVENTARIO</p>
          <h2>Control claro para tomar mejores decisiones.</h2>
          <p>Gestiona productos y mantén organizada la información de tu operación.</p>
        </div>
        <span className="banner-decoration" aria-hidden="true">↗</span>
      </section>
      <section className="module-section">
        <div className="section-title">
          <div><p className="eyebrow">ESPACIOS DE TRABAJO</p><h2>Módulos</h2></div>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <Link className="module-card" to={module.to} key={module.to}>
              <span className="module-icon" aria-hidden="true">{module.icon}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <span className="module-link">Abrir módulo <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
