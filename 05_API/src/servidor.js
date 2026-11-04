/* VEXOcar API · servidor.
   Rode com:  npm start   e abra  http://localhost:3000  (a API também serve o site e o app).
   Tudo o que é /api/... é a API REST; o resto são os arquivos do site (pasta 04_LANDING). */
const express = require('express');
const cors = require('cors');
const config = require('./config');
const exemplo = require('./exemplo');

const app = express();
app.set('trust proxy', 1); // no Render a API fica atrás de um proxy (https)
app.disable('x-powered-by');

/* Quem pode chamar a API pelo navegador: os sites de ORIGENS_PERMITIDAS e qualquer localhost.
   Sem lista no .env, libera todos (o login é por token no cabeçalho, não por cookie). */
app.use(cors({
  origin(origem, ok) {
    if (!origem || !config.origens.length || config.origens.includes(origem) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origem)) return ok(null, true);
    ok(null, false);
  }
}));
app.use(express.json({ limit: '5mb' })); // fotos chegam em base64

app.use('/api', require('./rotas/publico'));
app.use('/api', require('./rotas/conta'));
app.use('/api', require('./rotas/colecoes'));
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada: ' + req.method + ' ' + req.originalUrl }));

// Erros: mensagem amigável para o app; o detalhe fica só no terminal
app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ erro: status >= 500 ? 'Erro no servidor. Tente de novo.' : err.message });
});

// Fotos do modo local e o site
app.use('/uploads', express.static(config.pastaUploads, { maxAge: '7d' }));
app.use(express.static(config.pastaFront, { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile('404.html', { root: config.pastaFront }));

exemplo.prepararBanco()
  .catch(e => console.error('Não consegui gravar os dados de exemplo:', e.message))
  .finally(() => {
    app.listen(config.porta, () => {
      console.log(`\n  VEXOcar no ar: http://localhost:${config.porta}`);
      console.log(`  App:  http://localhost:${config.porta}/app/entrar.html`);
      console.log(`  Banco: ${config.modo.banco} · Login: ${config.modo.login} · Fotos: ${config.modo.fotos}\n`);
    });
  });
