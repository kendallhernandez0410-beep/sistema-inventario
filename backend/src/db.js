const sql = require('mssql');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serverConfig = (process.env.DB_SERVER || '').split('\\');
const configuredPort = process.env.DB_PORT?.trim();
const port = configuredPort ? Number(configuredPort) : undefined;
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: serverConfig[0],
  ...(port ? { port } : {}),
  database: process.env.DB_NAME || process.env.DATABASE_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    ...(!port && (process.env.DB_INSTANCE_NAME || serverConfig[1])
      ? { instanceName: process.env.DB_INSTANCE_NAME || serverConfig[1] }
      : {}),
  },
};

const requiredVariables = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER'];
let connectionPromise;

function connectToDatabase() {
  const missingVariables = requiredVariables.filter((variable) => !process.env[variable]);

  if (configuredPort && (!Number.isInteger(port) || port < 1 || port > 65535)) {
    return Promise.reject(new Error('DB_PORT debe ser un puerto TCP entero entre 1 y 65535.'));
  }

  if (!config.database) {
    missingVariables.push('DB_NAME (o DATABASE_NAME)');
  }

  if (missingVariables.length > 0) {
    return Promise.reject(
      new Error(`Faltan variables de entorno para SQL Server: ${missingVariables.join(', ')}`),
    );
  }

  if (!connectionPromise) {
    connectionPromise = new sql.ConnectionPool(config).connect().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

module.exports = { sql, connectToDatabase };
