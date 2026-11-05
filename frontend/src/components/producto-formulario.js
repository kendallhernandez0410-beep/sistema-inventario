function mostrarMensaje(elemento, mensaje, tipo = '') {
  elemento.textContent = mensaje;
  elemento.className = `message ${tipo}`.trim();
}

export function crearFormularioProducto(alGuardar) {
  const seccion = document.createElement('section');
  seccion.className = 'panel';
  seccion.setAttribute('aria-labelledby', 'form-title');
  seccion.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">NUEVO REGISTRO</p>
        <h2 id="form-title">Agregar producto</h2>
      </div>
    </div>
    <form>
      <div class="form-grid">
        <label>
          SKU <span class="required">*</span>
          <input name="sku" type="text" placeholder="Ej. PROD-001" required />
        </label>
        <label>
          Nombre <span class="required">*</span>
          <input name="nombre" type="text" placeholder="Nombre del producto" required />
        </label>
        <label>
          Precio <span class="required">*</span>
          <input name="precio" type="number" min="0" step="0.01" placeholder="0.00" required />
        </label>
        <label>
          Stock <span class="required">*</span>
          <input name="stock" type="number" min="0" step="1" placeholder="0" required />
        </label>
        <label>
          ID de categoría
          <input name="categoria_id" type="number" min="1" step="1" placeholder="Opcional" />
        </label>
        <label>
          ID de proveedor
          <input name="proveedor_id" type="number" min="1" step="1" placeholder="Opcional" />
        </label>
      </div>
      <div class="form-footer">
        <p class="hint"><span class="required">*</span> Campos obligatorios</p>
        <button type="submit">Guardar producto</button>
      </div>
      <p class="message" role="status" aria-live="polite"></p>
    </form>
  `;

  const formulario = seccion.querySelector('form');
  const boton = formulario.querySelector('button');
  const mensaje = formulario.querySelector('.message');

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    boton.disabled = true;
    mostrarMensaje(mensaje, '');

    const datos = new FormData(formulario);
    const producto = {
      sku: datos.get('sku').trim(),
      nombre: datos.get('nombre').trim(),
      precio: Number(datos.get('precio')),
      stock: Number(datos.get('stock')),
      categoria_id: datos.get('categoria_id') ? Number(datos.get('categoria_id')) : null,
      proveedor_id: datos.get('proveedor_id') ? Number(datos.get('proveedor_id')) : null,
    };

    try {
      await alGuardar(producto);
      formulario.reset();
      mostrarMensaje(mensaje, 'Producto guardado correctamente.', 'success');
    } catch (error) {
      mostrarMensaje(mensaje, error.message, 'error');
    } finally {
      boton.disabled = false;
    }
  });

  return seccion;
}
