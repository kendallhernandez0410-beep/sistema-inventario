const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-bytes';

const app = require('../src/app');

let server;
let baseUrl;
const token = jwt.sign({ role: 'usuario' }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  subject: '1',
  issuer: 'inventario-api',
  expiresIn: '8h',
});
const adminToken = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  subject: '1',
  issuer: 'inventario-api',
  expiresIn: '8h',
});

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

async function postJson(ruta, cuerpo, authToken = token) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  return fetch(`${baseUrl}${ruta}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(cuerpo),
  });
}

test('requiere autenticación para todos los endpoints CRUD', async () => {
  const endpoints = [
    ['GET', '/api/productos'],
    ['GET', '/api/productos/1'],
    ['POST', '/api/productos'],
    ['PUT', '/api/productos/1'],
    ['DELETE', '/api/productos/1'],
    ['GET', '/api/categorias'],
    ['GET', '/api/categorias/1'],
    ['POST', '/api/categorias'],
    ['PUT', '/api/categorias/1'],
    ['DELETE', '/api/categorias/1'],
    ['GET', '/api/proveedores'],
    ['GET', '/api/proveedores/1'],
    ['POST', '/api/proveedores'],
    ['PUT', '/api/proveedores/1'],
    ['DELETE', '/api/proveedores/1'],
  ];

  for (const [method, ruta] of endpoints) {
    const respuesta = await fetch(`${baseUrl}${ruta}`, { method });
    assert.equal(respuesta.status, 401, `${method} ${ruta} debe requerir JWT`);
  }
});

test('el usuario no puede crear, actualizar ni eliminar entidades', async () => {
  const endpoints = [
    ['POST', '/api/productos', { sku: 'X', nombre: 'X', precio: 1, stock: 1 }],
    ['PUT', '/api/productos/1', { sku: 'X', nombre: 'X', precio: 1, stock: 1 }],
    ['DELETE', '/api/productos/1'],
    ['POST', '/api/categorias', { nombre: 'X' }],
    ['PUT', '/api/categorias/1', { nombre: 'X' }],
    ['DELETE', '/api/categorias/1'],
    ['POST', '/api/proveedores', { nombre: 'X' }],
    ['PUT', '/api/proveedores/1', { nombre: 'X' }],
    ['DELETE', '/api/proveedores/1'],
  ];

  for (const [method, ruta, body] of endpoints) {
    const headers = { Authorization: `Bearer ${token}` };
    if (body) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${baseUrl}${ruta}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal(response.status, 403, `${method} ${ruta} solo permite administradores`);
  }
});

test('rechaza un token inválido', async () => {
  const respuesta = await fetch(`${baseUrl}/api/categorias`, {
    headers: { Authorization: 'Bearer invalid-token' },
  });
  assert.equal(respuesta.status, 401);
});

test('rechaza tokens sin rol válido', async () => {
  const invalidRoleToken = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: '1',
    issuer: 'inventario-api',
  });
  const response = await fetch(`${baseUrl}/api/productos`, {
    headers: { Authorization: `Bearer ${invalidRoleToken}` },
  });
  assert.equal(response.status, 401);
});

test('protege el endpoint del usuario autenticado', async () => {
  const respuesta = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(respuesta.status, 401);
});

test('rechaza productos sin los campos obligatorios con 400', async () => {
  const respuesta = await postJson('/api/productos', {
    sku: '',
    nombre: '',
    precio: -1,
    stock: 1.5,
  }, adminToken);

  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.ok(cuerpo.errores.length >= 4);
});

test('rechaza categorías sin nombre con 400', async () => {
  const respuesta = await postJson('/api/categorias', {}, adminToken);
  assert.equal(respuesta.status, 400);
});

test('rechaza proveedores sin nombre con 400', async () => {
  const respuesta = await postJson('/api/proveedores', {}, adminToken);
  assert.equal(respuesta.status, 400);
});

test('rechaza identificadores de relación que no son positivos', async () => {
  const respuesta = await postJson('/api/productos', {
    sku: 'TEST-001',
    nombre: 'Producto de prueba',
    precio: 10,
    stock: 2,
    categoria_id: 0,
  }, adminToken);

  assert.equal(respuesta.status, 400);
});

test('rechaza registro con contraseña menor a ocho caracteres', async () => {
  const respuesta = await postJson('/api/auth/register', {
    nombre: 'Usuario de prueba',
    correo: 'prueba@example.com',
    password: 'short',
  }, null);

  assert.equal(respuesta.status, 400);
});

test('rechaza identificadores mal formados antes de consultar la base', async () => {
  const respuesta = await fetch(`${baseUrl}/api/productos/no-es-id`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(respuesta.status, 400);
});
