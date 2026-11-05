import { guardarToken } from '../auth.js';

export function renderizarPaginaLogin(contenedor) {
  const panel = document.createElement('section');
  panel.className = 'panel auth-panel';
  panel.innerHTML = `
    <p class="eyebrow">ACCESO SEGURO</p>
    <h2>Iniciar sesión</h2>
    <p class="subtitle">Accede al sistema de inventario.</p>
    <form>
      <label class="auth-name" hidden>
        Nombre
        <input name="nombre" type="text" maxlength="150" autocomplete="name" />
      </label>
      <label>
        Correo
        <input name="correo" type="email" maxlength="254" autocomplete="email" required />
      </label>
      <label>
        Contraseña
        <input name="password" type="password" minlength="8" autocomplete="current-password" required />
      </label>
      <div class="form-footer">
        <button type="submit">Iniciar sesión</button>
        <button class="secondary-button auth-toggle" type="button">Crear una cuenta</button>
      </div>
      <p class="message" role="status" aria-live="polite"></p>
    </form>
  `;

  const form = panel.querySelector('form');
  const nameLabel = panel.querySelector('.auth-name');
  const passwordInput = form.elements.password;
  const submitButton = form.querySelector('[type="submit"]');
  const toggleButton = panel.querySelector('.auth-toggle');
  const message = panel.querySelector('.message');
  let registering = false;

  toggleButton.addEventListener('click', () => {
    registering = !registering;
    nameLabel.hidden = !registering;
    form.elements.nombre.required = registering;
    passwordInput.autocomplete = registering ? 'new-password' : 'current-password';
    submitButton.textContent = registering ? 'Crear cuenta' : 'Iniciar sesión';
    toggleButton.textContent = registering ? 'Ya tengo una cuenta' : 'Crear una cuenta';
    panel.querySelector('h2').textContent = registering ? 'Crear cuenta' : 'Iniciar sesión';
    message.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    message.textContent = '';
    message.className = 'message';

    const body = {
      correo: form.elements.correo.value.trim(),
      password: passwordInput.value,
    };

    try {
      if (registering) {
        body.nombre = form.elements.nombre.value.trim();
        const registration = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const registrationBody = await registration.json();
        if (!registration.ok) {
          throw new Error(registrationBody.errores?.join(' ') || registrationBody.mensaje);
        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: body.correo, password: body.password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errores?.join(' ') || result.mensaje || 'No se pudo iniciar sesión.');
      }

      guardarToken(result.token);
      window.location.hash = '#/productos';
    } catch (error) {
      message.textContent = error.message || 'No se pudo completar la autenticación.';
      message.className = 'message error';
    } finally {
      submitButton.disabled = false;
    }
  });

  contenedor.append(panel);
}
