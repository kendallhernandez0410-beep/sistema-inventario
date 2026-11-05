import { crearFormularioProducto } from '../components/producto-formulario.js';
import { crearTablaProductos } from '../components/productos-tabla.js';

const API_PRODUCTOS = '/api/productos';

async function solicitarProductos() {
  const respuesta = await fetch(API_PRODUCTOS);
  const productos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(productos.mensaje || 'No se pudieron cargar los productos.');
  }

  return productos;
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
      const productos = await solicitarProductos();
      tablaContenedor.replaceChildren(crearTablaProductos(productos));
      estado.textContent = '';
      estado.className = 'message';
      tablaContenedor
        .querySelector('.secondary-button')
        .addEventListener('click', cargarProductos);
    } catch (error) {
      estado.textContent = `No fue posible conectar con la API. ${error.message}`;
      estado.className = 'message error';
    }
  }

  async function guardarProducto(producto) {
    const respuesta = await fetch(API_PRODUCTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.errores?.join(' ') || resultado.mensaje || 'No se pudo guardar.');
    }

    await cargarProductos();
  }

  contenedor.prepend(crearFormularioProducto(guardarProducto));
  cargarProductos();
}
