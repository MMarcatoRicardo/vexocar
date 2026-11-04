/* VEXOcar API · fotos (carro, nota fiscal, anúncio).
   O navegador já reduz a foto (no máximo ~1000 px) e manda como "data URL" (texto base64).
   - Modo cloudinary: envia para o Cloudinary (grátis, sem cartão) e devolve o endereço https da foto.
   - Modo local: grava na pasta uploads/ e a API serve em /uploads/... */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const TIPOS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 3 * 1024 * 1024;

function lerDataUrl(dados) {
  const m = String(dados || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw Object.assign(new Error('Mande a foto em JPG, PNG ou WEBP.'), { status: 400 });
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > MAX_BYTES) throw Object.assign(new Error('Foto grande demais (máximo 3 MB).'), { status: 413 });
  return { tipo: m[1], bytes };
}

async function enviarCloudinary(dados, pasta) {
  const { nuvem, apiKey, apiSecret } = config.cloudinary;
  const timestamp = Math.floor(Date.now() / 1000);
  // Assinatura: parâmetros em ordem alfabética + segredo, em SHA-1 (regra do Cloudinary)
  const assinatura = crypto.createHash('sha1').update(`folder=${pasta}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  const form = new FormData();
  form.append('file', dados);
  form.append('folder', pasta);
  form.append('timestamp', String(timestamp));
  form.append('api_key', apiKey);
  form.append('signature', assinatura);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${nuvem}/image/upload`, { method: 'POST', body: form });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error('Cloudinary recusou a foto: ' + (j.error && j.error.message)), { status: 502 });
  return j.secure_url;
}

function gravarLocal({ tipo, bytes }, pasta, baseUrl) {
  const dir = path.join(config.pastaUploads, pasta.replace(/[^a-z0-9-]/gi, ''));
  fs.mkdirSync(dir, { recursive: true });
  const nome = Date.now().toString(36) + crypto.randomBytes(4).toString('hex') + '.' + TIPOS[tipo];
  fs.writeFileSync(path.join(dir, nome), bytes);
  return `${baseUrl}/uploads/${path.basename(dir)}/${nome}`;
}

/* pasta: carros | notas | anuncios (organiza as fotos de cada usuário) */
async function salvarFoto(dados, pasta, uid, baseUrl) {
  const foto = lerDataUrl(dados);
  const destino = `vexocar/${uid}/${pasta}`;
  if (config.modo.fotos === 'cloudinary') return enviarCloudinary(dados, destino);
  return gravarLocal(foto, uid + '-' + pasta, baseUrl);
}

module.exports = { salvarFoto };
