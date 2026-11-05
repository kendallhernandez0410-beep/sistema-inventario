export function crearNavegacion() {
  const header = document.createElement('header');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <p class="eyebrow">SISTEMA DE GESTIÓN</p>
      <a class="brand-link" href="#/inicio"><h1>Inventario</h1></a>
      <p class="subtitle">Gestión de productos, existencias y proveedores.</p>
    </div>
    <nav class="main-nav" aria-label="Navegación principal">
      <a href="#/inicio">Inicio</a>
      <a href="#/productos">Productos</a>
    </nav>
  `;
  return header;
}
