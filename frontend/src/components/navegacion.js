import { cerrarSesion, obtenerToken } from '../auth.js';

export function crearNavegacion() {
  const header = document.createElement('header');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <p class="eyebrow">SISTEMA DE GESTIÓN</p>
      <a class="brand-link" href="#/inicio"><h1>Inventario</h1></a>
      <p class="subtitle">Gestión de productos, existencias y proveedores.</p>
    </div>
    ${obtenerToken()
      ? `<nav class="main-nav" aria-label="Navegación principal">
          <a href="#/inicio">Inicio</a>
          <a href="#/productos">Productos</a>
          <button type="button" class="secondary-button logout-button">Cerrar sesión</button>
        </nav>`
      : ''}
  `;
  header.querySelector('.logout-button')?.addEventListener('click', () => {
    cerrarSesion();
    window.location.hash = '#/login';
  });
  return header;
}
