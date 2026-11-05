const TOKEN_KEY = 'inventario.jwt';

export function obtenerToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function guardarToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function cerrarSesion() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function solicitarApi(url, opciones = {}) {
  const headers = new Headers(opciones.headers || {});
  const token = obtenerToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (opciones.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const respuesta = await fetch(url, { ...opciones, headers });
  const cuerpo = await respuesta.json().catch(() => ({}));

  if (respuesta.status === 401 && token) {
    cerrarSesion();
    window.location.hash = '#/login';
  }

  if (!respuesta.ok) {
    throw new Error(cuerpo.errores?.join(' ') || cuerpo.mensaje || 'No se pudo completar la solicitud.');
  }

  return cuerpo;
}
