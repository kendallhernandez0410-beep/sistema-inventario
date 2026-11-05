export function renderizarPaginaInicio(contenedor) {
  const pagina = document.createElement('section');
  pagina.className = 'panel welcome-panel';
  pagina.innerHTML = `
    <p class="eyebrow">PANEL PRINCIPAL</p>
    <h2>Bienvenido al sistema de inventario</h2>
    <p class="subtitle">
      Administra los productos y consulta sus existencias desde un solo lugar.
    </p>
    <a class="button-link" href="#/productos">Ir a productos</a>
  `;
  contenedor.append(pagina);
}
