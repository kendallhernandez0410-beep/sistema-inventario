export default function TablaEntidad({ columns, rows, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="empty-panel" role="status">Cargando registros…</div>;
  }

  if (rows.length === 0) {
    return <div className="empty-panel">Todavía no hay registros. Crea el primero para comenzar.</div>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[columns[0].idKey || 'id'] ?? row.producto_id ?? row.categoria_id ?? row.proveedor_id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '—')}</td>
              ))}
              <td>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => onEdit(row)}>Editar</button>
                  <button className="text-button text-danger" type="button" onClick={() => onDelete(row)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
