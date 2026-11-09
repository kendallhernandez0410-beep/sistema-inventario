import { useEffect, useState } from 'react';
import api from '../services/api.js';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function PanelUsuario() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/productos')
      .then(({ data }) => {
        if (active) setProducts(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.mensaje || 'No se pudo consultar el inventario.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">CONSULTA DE INVENTARIO</p>
          <h1>Panel de usuario</h1>
          <p className="subtitle">Consulta productos y existencias. Este panel es de solo lectura.</p>
        </div>
      </header>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <section className="panel data-panel" aria-label="Inventario de productos">
        <div className="panel-toolbar">
          <div>
            <h2>Inventario disponible</h2>
            <p>{loading ? 'Actualizando…' : `${products.length} productos`}</p>
          </div>
          <button
            className="button button-quiet"
            type="button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              api.get('/productos')
                .then(({ data }) => setProducts(data))
                .catch((requestError) => setError(requestError.response?.data?.mensaje || 'No se pudo consultar el inventario.'))
                .finally(() => setLoading(false));
            }}
          >
            Actualizar
          </button>
        </div>
        {loading ? (
          <div className="empty-panel" role="status">Cargando inventario…</div>
        ) : products.length === 0 ? (
          <div className="empty-panel">No hay productos registrados.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Existencias</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.producto_id}>
                    <td>{product.sku}</td>
                    <td>{product.nombre}</td>
                    <td>{product.categoria || '—'}</td>
                    <td>{product.proveedor || '—'}</td>
                    <td>{currency.format(Number(product.precio))}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
