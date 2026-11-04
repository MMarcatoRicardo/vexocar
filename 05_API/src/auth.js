/* VEXOcar API · login.
   O navegador manda em toda chamada o cabeçalho  Authorization: Bearer <token>.
   - Modo firebase: o token vem do Firebase Auth (e-mail/senha ou Google) e é conferido com o firebase-admin.
   - Modo local: a própria API cria as contas (senha guardada com scrypt, nunca em texto) e assina o token. */
const crypto = require('crypto');
const config = require('./config');
const banco = require('./banco');

let adminAuth = null;
if (config.modo.login === 'firebase') {
  const { getAuth } = require('firebase-admin/auth');
  adminAuth = getAuth(require('./firebase'));
}

/* ---------- Token do modo local: base64(dados) + "." + assinatura HMAC ---------- */
const b64 = s => Buffer.from(s).toString('base64url');
function assinar(dados) {
  const corpo = b64(JSON.stringify(dados));
  const sig = crypto.createHmac('sha256', config.segredoLocal).update(corpo).digest('base64url');
  return corpo + '.' + sig;
}
function conferir(token) {
  const [corpo, sig] = String(token).split('.');
  if (!corpo || !sig) return null;
  const esperado = crypto.createHmac('sha256', config.segredoLocal).update(corpo).digest('base64url');
  if (sig.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString());
  return dados.exp > Date.now() ? dados : null;
}

/* Middleware: só deixa passar quem mandou um token válido. Coloca req.usuario = { uid, email, nome }. */
async function exigirLogin(req, res, next) {
  const m = String(req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ erro: 'Faça login para continuar.' });
  try {
    if (adminAuth) {
      const t = await adminAuth.verifyIdToken(m[1]);
      req.usuario = { uid: t.uid, email: t.email || '', nome: t.name || '' };
    } else {
      const t = conferir(m[1]);
      if (!t) throw new Error('token inválido');
      req.usuario = { uid: t.uid, email: t.email, nome: t.nome || '' };
    }
    next();
  } catch (e) {
    res.status(401).json({ erro: 'Sua sessão expirou. Entre de novo.' });
  }
}

/* ---------- Contas do modo local ---------- */
const DIAS_SESSAO = 30;
function hashSenha(senha, sal) { return crypto.scryptSync(senha, sal, 64).toString('hex'); }
const idConta = email => String(email || '').trim().toLowerCase();
const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function sessao(conta) {
  const exp = Date.now() + DIAS_SESSAO * 86400000;
  return { token: assinar({ uid: conta.uid, email: conta.email, nome: conta.nome, exp }), uid: conta.uid, email: conta.email, exp };
}

async function criarContaLocal({ nome, email, senha }) {
  email = idConta(email);
  if (!emailValido(email)) throw Object.assign(new Error('Esse e-mail não parece válido.'), { status: 400 });
  if (String(senha || '').length < 8) throw Object.assign(new Error('A senha precisa ter pelo menos 8 caracteres.'), { status: 400 });
  if (await banco.obter('contasLocais', email)) throw Object.assign(new Error('Esse e-mail já tem conta. Entre com ele.'), { status: 409 });
  const sal = crypto.randomBytes(16).toString('hex');
  const conta = { id: email, uid: 'u' + crypto.randomBytes(10).toString('hex'), email, nome: String(nome || '').trim(), sal, hash: hashSenha(senha, sal) };
  await banco.gravar('contasLocais', email, conta);
  return conta;
}

async function entrarLocal({ email, senha }) {
  const conta = await banco.obter('contasLocais', idConta(email));
  const ok = conta && crypto.timingSafeEqual(Buffer.from(hashSenha(String(senha || ''), conta.sal), 'hex'), Buffer.from(conta.hash, 'hex'));
  if (!ok) throw Object.assign(new Error('E-mail ou senha incorretos.'), { status: 401 });
  return conta;
}

module.exports = { exigirLogin, criarContaLocal, entrarLocal, sessao };
