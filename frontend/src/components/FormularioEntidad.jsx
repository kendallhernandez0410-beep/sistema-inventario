import { useEffect, useState } from 'react';

function valorInicial(fields, initialValue) {
  return Object.fromEntries(fields.map((field) => [
    field.name,
    initialValue?.[field.name] ?? '',
  ]));
}

export default function FormularioEntidad({
  title,
  fields,
  initialValue,
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState(() => valorInicial(fields, initialValue));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(valorInicial(fields, initialValue));
  }, [fields, initialValue]);

  function handleChange(event) {
    const { name, value, type } = event.target;
    const field = fields.find((item) => item.name === name);
    setValues((current) => ({
      ...current,
      [name]: (type === 'number' || field?.options) && value !== '' ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (requestError) {
      setError(requestError.response?.data?.errores?.join(' ') || requestError.response?.data?.mensaje || 'No se pudo guardar el registro.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{initialValue ? 'ACTUALIZACIÓN' : 'NUEVO REGISTRO'}</p>
            <h2 id="form-title">{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar formulario">×</button>
        </div>
        <form className="entity-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {fields.map((field) => (
              <label className={field.wide ? 'field-wide' : ''} key={field.name}>
                {field.label}{field.required && <span className="required"> *</span>}
                {field.options ? (
                  <select
                    name={field.name}
                    value={values[field.name]}
                    required={field.required}
                    onChange={handleChange}
                  >
                    <option value="">Sin asignar</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    value={values[field.name]}
                    required={field.required}
                    maxLength={field.maxLength}
                    min={field.min}
                    step={field.step}
                    autoComplete={field.autoComplete}
                    onChange={handleChange}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </label>
            ))}
          </div>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
