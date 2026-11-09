import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import FormularioEntidad from './FormularioEntidad.jsx';
import TablaEntidad from './TablaEntidad.jsx';

export default function PaginaEntidad({ config }) {
  const [rows, setRows] = useState([]);
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listResponse, ...referenceResponses] = await Promise.all([
        api.get(config.endpoint),
        ...config.references.map((reference) => api.get(reference.endpoint)),
      ]);
      setRows(listResponse.data);
      setReferences(Object.fromEntries(config.references.map((reference, index) => [
        reference.name,
        referenceResponses[index].data,
      ])));
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || 'No se pudieron cargar los registros.');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  const fields = config.fields.map((field) => (
    field.reference
      ? {
          ...field,
          options: (references[field.reference] || []).map((item) => ({
            value: item[field.referenceId],
            label: item.nombre,
          })),
        }
      : field
  ));

  async function save(values) {
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ]));

    if (editing) {
      await api.put(`${config.endpoint}/${editing[config.idKey]}`, payload);
    } else {
      await api.post(config.endpoint, payload);
    }

    setEditing(null);
    setCreating(false);
    await load();
  }

  async function edit(row) {
    setError('');
    try {
      const { data } = await api.get(`${config.endpoint}/${row[config.idKey]}`);
      setEditing(data);
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || 'No se pudo cargar el registro.');
    }
  }

  async function remove(row) {
    const description = row.nombre || row.sku || `#${row[config.idKey]}`;
    if (!window.confirm(`¿Eliminar "${description}"? Esta acción no se puede deshacer.`)) return;

    setError('');
    try {
      await api.delete(`${config.endpoint}/${row[config.idKey]}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || 'No se pudo eliminar el registro.');
    }
  }

  const modalInitialValue = editing || null;

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className="subtitle">{config.description}</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setCreating(true)}>
          <span aria-hidden="true">＋</span> Nuevo registro
        </button>
      </header>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <section className="panel data-panel" aria-label={`Listado de ${config.title.toLowerCase()}`}>
        <div className="panel-toolbar">
          <div>
            <h2>Todos los registros</h2>
            <p>{loading ? 'Actualizando…' : `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`}</p>
          </div>
          <button className="button button-quiet" type="button" onClick={load} disabled={loading}>
            Actualizar
          </button>
        </div>
        <TablaEntidad
          columns={config.columns}
          rows={rows}
          loading={loading}
          onEdit={edit}
          onDelete={remove}
        />
      </section>
      {(creating || editing) && (
        <FormularioEntidad
          title={editing ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
          fields={fields}
          initialValue={modalInitialValue}
          onSubmit={save}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
