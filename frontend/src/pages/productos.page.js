import { crearFormularioProducto } from '../components/producto-formulario.js';
import { crearTablaProductos } from '../components/productos-tabla.js';
import { solicitarApi } from '../auth.js';

const API_PRODUCTOS = '/api/productos';

async function solicitarJson(url) {
  return solicitarApi(url);
}

export function renderizarPaginaProductos(contenedor) {
  const estado = document.createElement('p');
  estado.className = 'message';
  estado.setAttribute('role', 'status');
  estado.setAttribute('aria-live', 'polite');
  contenedor.append(estado);

  const tablaContenedor = document.createElement('div');
  contenedor.append(tablaContenedor);

  async function cargarProductos() {
    estado.textContent = 'Cargando productos…';
    estado.className = 'message';

    try {
      const [productos, categorias, proveedores] = await Promise.all([
        solicitarJson(API_PRODUCTOS),
        solicitarJson('/api/categorias'),
        solicitarJson('/api/proveedores'),
      ]);
      tablaContenedor.replaceChildren(crearTablaProductos(productos));
      estado.textContent = '';
      estado.className = 'message';
      tablaContenedor.querySelector('.secondary-button').addEventListener('click', cargarProductos);
      if (!contenedor.querySelector('form')) {
        contenedor.prepend(crearFormularioProducto(guardarProducto, { categorias, proveedores }));
      }
    } catch (error) {
      estado.textContent = `No fue posible conectar con la API. ${error.message}`;
      estado.className = 'message error';
    }
  }

  async function guardarProducto(producto) {
    await solicitarApi(API_PRODUCTOS, {
      method: 'POST',
      body: JSON.stringify(producto),
    });

    await cargarProductos();
  }

  cargarProductos();
}
