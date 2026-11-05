import { crearNavegacion } from '../components/navegacion.js';
import { obtenerToken } from '../auth.js';
import { renderizarPaginaInicio } from '../pages/inicio.page.js';
import { renderizarPaginaLogin } from '../pages/login.page.js';
import { renderizarPaginaNoEncontrada } from '../pages/no-encontrada.page.js';
import { renderizarPaginaProductos } from '../pages/productos.page.js';

const rutas = {
  '/inicio': renderizarPaginaInicio,
  '/productos': renderizarPaginaProductos,
  '/login': renderizarPaginaLogin,
};

function obtenerRutaActual() {
  return window.location.hash.slice(1) || '/inicio';
}

function renderizarRuta(contenedor) {
  const contenido = document.createElement('main');
  contenido.className = 'layout';
  contenido.append(crearNavegacion());

  const rutaSolicitada = obtenerRutaActual();
  const rutaProtegida = rutaSolicitada !== '/login';
  const renderizarPagina = rutaProtegida && !obtenerToken()
    ? renderizarPaginaLogin
    : rutas[rutaSolicitada] || renderizarPaginaNoEncontrada;
  renderizarPagina(contenido);

  const pie = document.createElement('footer');
  pie.textContent = 'Los productos, categorías y proveedores se guardan en SQL Server.';
  contenido.append(pie);

  contenedor.replaceChildren(contenido);
}

export function iniciarEnrutador(contenedor) {
  window.addEventListener('hashchange', () => renderizarRuta(contenedor));
  renderizarRuta(contenedor);
}
