const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log('=======================================================');
  console.log(`🚀 UNSAAC TUPA Platform (API + Web) escuchando en: http://localhost:${env.port}`);
  console.log(`   Entorno: ${env.nodeEnv}`);
  console.log('=======================================================');
});
