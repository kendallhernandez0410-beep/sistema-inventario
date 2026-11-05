export function renderizarPaginaNoEncontrada(contenedor) {
  const pagina = document.createElement('section');
  pagina.className = 'panel welcome-panel';
  pagina.innerHTML = `
    <p class="eyebrow">404</p>
    <h2>Página no encontrada</h2>
    <p class="subtitle">La sección solicitada no existe.</p>
    <a class="button-link" href="#/inicio">Volver al inicio</a>
  `;
  contenedor.append(pagina);
}
