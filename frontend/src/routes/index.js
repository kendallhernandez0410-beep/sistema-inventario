import { crearNavegacion } from '../components/navegacion.js';
import { renderizarPaginaInicio } from '../pages/inicio.page.js';
import { renderizarPaginaNoEncontrada } from '../pages/no-encontrada.page.js';
import { renderizarPaginaProductos } from '../pages/productos.page.js';

const rutas = {
  '/inicio': renderizarPaginaInicio,
  '/productos': renderizarPaginaProductos,
};

function obtenerRutaActual() {
  return window.location.hash.slice(1) || '/inicio';
}

function renderizarRuta(contenedor) {
  const contenido = document.createElement('main');
  contenido.className = 'layout';
  contenido.append(crearNavegacion());

  const renderizarPagina = rutas[obtenerRutaActual()] || renderizarPaginaNoEncontrada;
  renderizarPagina(contenido);

  const pie = document.createElement('footer');
  pie.textContent = 'Los datos se guardan temporalmente en memoria y se reinician al apagar el servidor.';
  contenido.append(pie);

  contenedor.replaceChildren(contenido);
}

export function iniciarEnrutador(contenedor) {
  window.addEventListener('hashchange', () => renderizarRuta(contenedor));
  renderizarRuta(contenedor);
}
