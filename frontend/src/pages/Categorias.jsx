import PaginaEntidad from '../components/PaginaEntidad.jsx';

const config = {
  endpoint: '/categorias',
  idKey: 'categoria_id',
  singular: 'categoría',
  eyebrow: 'CATÁLOGO',
  title: 'Categorías',
  description: 'Clasifica y organiza los productos de tu inventario.',
  fields: [
    { name: 'nombre', label: 'Nombre', required: true, maxLength: 100, placeholder: 'Ej. Electrónica' },
    { name: 'descripcion', label: 'Descripción', maxLength: 255, placeholder: 'Descripción breve de la categoría' },
  ],
  references: [],
  columns: [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ],
};

export default function Categorias() {
  return <PaginaEntidad config={config} />;
}
