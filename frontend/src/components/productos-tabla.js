function crearCelda(valor) {
  const celda = document.createElement('td');
  celda.textContent = valor ?? '—';
  return celda;
}

export function crearTablaProductos(productos) {
  const seccion = document.createElement('section');
  seccion.className = 'panel';
  seccion.setAttribute('aria-labelledby', 'list-title');
  seccion.innerHTML = `
    <div class="section-heading list-heading">
      <div>
        <p class="eyebrow">EXISTENCIAS</p>
        <h2 id="list-title">Productos registrados</h2>
      </div>
      <button type="button" class="secondary-button">Actualizar</button>
    </div>
    <p class="message" role="status" aria-live="polite"></p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">SKU</th>
            <th scope="col">Producto</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col">Categoría</th>
            <th scope="col">Proveedor</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <p class="empty-state" hidden>Aún no hay productos registrados.</p>
  `;

  const filas = seccion.querySelector('tbody');
  const estadoVacio = seccion.querySelector('.empty-state');
  const precioMXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  productos.forEach((producto) => {
    const fila = document.createElement('tr');
    fila.append(
      crearCelda(producto.sku),
      crearCelda(producto.nombre),
      crearCelda(precioMXN.format(producto.precio)),
      crearCelda(producto.stock),
      crearCelda(producto.categoria || producto.categoria_id),
      crearCelda(producto.proveedor || producto.proveedor_id),
    );
    filas.append(fila);
  });

  estadoVacio.hidden = productos.length !== 0;
  return seccion;
}
