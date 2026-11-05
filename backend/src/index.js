const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, () => {
  console.log(`Servidor iniciado en http://localhost:${PUERTO}`);
});
