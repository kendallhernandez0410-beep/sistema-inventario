import PaginaEntidad from '../components/PaginaEntidad.jsx';

const config = {
  endpoint: '/proveedores',
  idKey: 'proveedor_id',
  singular: 'proveedor',
  eyebrow: 'CADENA DE SUMINISTRO',
  title: 'Proveedores',
  description: 'Mantén la información de contacto de tus socios comerciales.',
  fields: [
    { name: 'nombre', label: 'Nombre comercial', required: true, maxLength: 150 },
    { name: 'contacto', label: 'Persona de contacto', maxLength: 150 },
    { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 30 },
    { name: 'email', label: 'Correo electrónico', type: 'email', maxLength: 254 },
  ],
  references: [],
  columns: [
    { key: 'nombre', label: 'Proveedor' },
    { key: 'contacto', label: 'Contacto' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Correo' },
  ],
};

export default function Proveedores() {
  return <PaginaEntidad config={config} />;
}
