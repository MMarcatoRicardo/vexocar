/* VEXOcar API · configuração.
   Lê o arquivo .env (se existir) e decide em que modo cada parte roda:
   - banco:  "firestore" (com a chave do Firebase) ou "local" (arquivo dados-locais.json)
   - login:  "firebase"  (Firebase Auth)         ou "local" (contas guardadas no próprio banco)
   - fotos:  "cloudinary" (com as chaves)        ou "local" (pasta uploads/)
   Sem .env nenhum, tudo roda no modo local: dá para programar e testar sem internet. */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const arquivoEnv = path.join(RAIZ, '.env');
if (fs.existsSync(arquivoEnv)) process.loadEnvFile(arquivoEnv);

const env = process.env;

/* Chave de serviço do Firebase Admin: variável FIREBASE_SERVICE_ACCOUNT (JSON inteiro, usado no Render)
   ou o arquivo serviceAccountKey.json na pasta da API (usado no computador). Os dois ficam fora do GitHub. */
function chaveFirebase() {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try { return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT); } catch (e) { console.error('FIREBASE_SERVICE_ACCOUNT não é um JSON válido.'); }
  }
  const arq = path.resolve(RAIZ, env.FIREBASE_KEY_FILE || 'serviceAccountKey.json');
  if (fs.existsSync(arq)) return JSON.parse(fs.readFileSync(arq, 'utf8'));
  return null;
}

/* Cloudinary: aceita CLOUDINARY_URL (cloudinary://chave:segredo@nome) ou as três variáveis separadas. */
function chaveCloudinary() {
  if (env.CLOUDINARY_URL) {
    const m = env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) return { apiKey: m[1], apiSecret: m[2], nuvem: m[3] };
  }
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    return { nuvem: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET };
  }
  return null;
}

const firebase = chaveFirebase();
const cloudinary = chaveCloudinary();

/* Configuração "pública" do Firebase (vai para o navegador; não é segredo). */
const firebaseWeb = env.FIREBASE_API_KEY ? {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN || (firebase ? firebase.project_id + '.firebaseapp.com' : ''),
  projectId: env.FIREBASE_PROJECT_ID || (firebase ? firebase.project_id : '')
} : null;

module.exports = {
  RAIZ,
  porta: Number(env.PORT) || 3000,
  // Pasta do site (landing + app) servida pela própria API em http://localhost:3000
  pastaFront: path.resolve(RAIZ, env.PASTA_FRONT || '../04_LANDING'),
  // Sites que podem chamar a API (o GitHub Pages entra aqui na etapa 12). Separe por vírgula.
  origens: (env.ORIGENS_PERMITIDAS || '').split(',').map(s => s.trim()).filter(Boolean),
  firebase,
  firebaseWeb,
  cloudinary,
  modo: {
    banco: firebase ? 'firestore' : 'local',
    login: firebase && firebaseWeb ? 'firebase' : 'local',
    fotos: cloudinary ? 'cloudinary' : 'local'
  },
  // Só para o modo local: assina os "crachás" (tokens) de login. Troque no .env se quiser.
  segredoLocal: env.SEGREDO_LOCAL || 'vexocar-modo-local-so-para-testes',
  arquivoLocal: path.join(RAIZ, 'dados-locais.json'),
  pastaUploads: path.join(RAIZ, 'uploads')
};
