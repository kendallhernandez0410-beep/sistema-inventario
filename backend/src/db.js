const sql = require('mssql');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serverConfig = (process.env.DB_SERVER || '').split('\\');
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: serverConfig[0],
  database: process.env.DB_NAME || process.env.DATABASE_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    ...(process.env.DB_INSTANCE_NAME || serverConfig[1]
      ? { instanceName: process.env.DB_INSTANCE_NAME || serverConfig[1] }
      : {}),
  },
};

const requiredVariables = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER'];
let connectionPromise;

function connectToDatabase() {
  const missingVariables = requiredVariables.filter((variable) => !process.env[variable]);

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
