import PaginaEntidad from '../components/PaginaEntidad.jsx';

const precio = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const config = {
  endpoint: '/productos',
  idKey: 'producto_id',
  singular: 'producto',
  eyebrow: 'CONTROL DE EXISTENCIAS',
  title: 'Productos',
  description: 'Consulta y administra artículos, stock y relaciones.',
  fields: [
    { name: 'sku', label: 'SKU', required: true, maxLength: 50, placeholder: 'Ej. PROD-001' },
    { name: 'nombre', label: 'Nombre del producto', required: true, maxLength: 255 },
    { name: 'precio', label: 'Precio', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'stock', label: 'Stock', type: 'number', required: true, min: 0, step: '1' },
    {
      name: 'categoria_id',
      label: 'Categoría',
      reference: 'categorias',
      referenceId: 'categoria_id',
    },
    {
      name: 'proveedor_id',
      label: 'Proveedor',
      reference: 'proveedores',
      referenceId: 'proveedor_id',
    },
  ],
  references: [
    { name: 'categorias', endpoint: '/categorias' },
    { name: 'proveedores', endpoint: '/proveedores' },
  ],
  columns: [
    { key: 'sku', label: 'SKU' },
    { key: 'nombre', label: 'Producto' },
    { key: 'precio', label: 'Precio', render: (row) => precio.format(Number(row.precio)) },
    { key: 'stock', label: 'Stock' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'proveedor', label: 'Proveedor' },
  ],
};

export default function Productos() {
  return <PaginaEntidad config={config} />;
}
