/* VEXOcar API · conta, perfil e "estado" (tudo o que o app precisa para abrir).
   POST  /api/auth/criar-conta   (só modo local) cria a conta e devolve o token
   POST  /api/auth/entrar        (só modo local) confere e-mail e senha e devolve o token
   GET   /api/estado             perfil + carros + manutenções + pagamentos + anúncios + oficinas...
   PATCH /api/usuario            muda nome, e-mail, perfil, notificações, favoritos, alertas lidos
   POST  /api/exemplo            troca os carros da conta pelo Polo e o CR-V de exemplo
   POST  /api/carros/:id/transferir   passa o carro (com o histórico) para a conta do comprador
   POST  /api/anuncios/:id/visita     conta uma visita no anúncio de outra pessoa */
const express = require('express');
const config = require('../config');
const banco = require('../banco');
const auth = require('../auth');
const exemplo = require('../exemplo');
const vitrine = require('../vitrine');

const r = express.Router();
const COLECOES_DO_USUARIO = ['carros', 'manutencoes', 'pagamentos', 'meusAnuncios', 'transferidos'];
const limpar = d => { const c = Object.assign({}, d); delete c.uid; delete c.atualizadoEm; return c; };
const porId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const mesAtual = () => new Date().toISOString().slice(0, 7);

/* ---------- Login do modo local (no modo firebase quem cuida é o Firebase Auth) ---------- */
function soModoLocal(req, res, next) {
  if (config.modo.login !== 'local') return res.status(404).json({ erro: 'O login é feito pelo Firebase.' });
  next();
}
r.post('/auth/criar-conta', soModoLocal, async (req, res, next) => {
  try {
    const { nome, email, senha, perfil } = req.body || {};
    const conta = await auth.criarContaLocal({ nome, email, senha });
    await criarPerfil(conta.uid, { nome: conta.nome, email: conta.email, perfil });
    res.status(201).json(auth.sessao(conta));
  } catch (e) { next(e); }
});
r.post('/auth/entrar', soModoLocal, async (req, res, next) => {
  try { res.json(auth.sessao(await auth.entrarLocal(req.body || {}))); } catch (e) { next(e); }
});

/* ---------- Perfil ---------- */
async function criarPerfil(uid, { nome, email, perfil }) {
  const p = {
    id: uid, uid, nome: String(nome || '').trim() || String(email || 'Motorista').split('@')[0], email: email || '',
    perfil: perfil === 'dono' ? 'dono' : 'motorista', cidade: 'Curitiba, PR', desde: mesAtual(),
    notificacoes: { revisao: true, documentos: true, interessados: true }, favoritos: [], vistos: {}
  };
  await banco.gravar('usuarios', uid, p);
  return p;
}
async function perfilDe(req) {
  return (await banco.obter('usuarios', req.usuario.uid)) || criarPerfil(req.usuario.uid, req.usuario);
}

r.get('/estado', auth.exigirLogin, async (req, res, next) => {
  try {
    const uid = req.usuario.uid;
    await vitrine.receberTransferencias(await perfilDe(req)); // carro que alguém transferiu para esta pessoa
    const [perfil, oficinas, anuncios, avaliacoes, comunidade, ...doUsuario] = await Promise.all([
      perfilDe(req), banco.listarTodos('oficinas'), banco.listarTodos('anuncios'), banco.listarTodos('avaliacoes'),
      vitrine.anunciosDaComunidade(uid),
      ...COLECOES_DO_USUARIO.map(c => banco.listarDoUsuario(c, uid))
    ]);
    const estado = {
      usuario: { nome: perfil.nome, email: perfil.email, perfil: perfil.perfil, cidade: perfil.cidade, desde: perfil.desde, whatsapp: perfil.whatsapp || '' },
      anunciosComunidade: comunidade,
      notificacoes: perfil.notificacoes || {}, favoritos: perfil.favoritos || [], vistos: perfil.vistos || {},
      oficinas: oficinas.sort(porId), anuncios: anuncios.sort(porId),
      avaliacoes: avaliacoes.map(v => Object.assign(limpar(v), { minha: v.uid === uid })).sort(porId)
    };
    COLECOES_DO_USUARIO.forEach((c, i) => { estado[c] = doUsuario[i].map(limpar).sort(porId); });
    res.json(estado);
  } catch (e) { next(e); }
});

const CAMPOS_PERFIL = ['nome', 'email', 'perfil', 'cidade', 'desde', 'whatsapp', 'notificacoes', 'favoritos', 'vistos'];
r.patch('/usuario', auth.exigirLogin, async (req, res, next) => {
  try {
    const p = await perfilDe(req), b = req.body || {};
    CAMPOS_PERFIL.forEach(k => { if (b[k] !== undefined) p[k] = b[k]; });
    if (typeof p.nome !== 'string' || p.nome.trim().length < 2) return res.status(400).json({ erro: 'Digite seu nome.' });
    if (!['motorista', 'dono'].includes(p.perfil)) p.perfil = 'motorista';
    if (!Array.isArray(p.favoritos)) p.favoritos = [];
    p.whatsapp = vitrine.soDigitos(p.whatsapp).slice(0, 13);
    if (p.whatsapp && p.whatsapp.length < 10) return res.status(400).json({ erro: 'WhatsApp com DDD, só números (ex.: 41 99999-9999).' });
    await banco.gravar('usuarios', p.id, p);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post('/exemplo', auth.exigirLogin, async (req, res, next) => {
  try {
    const uid = req.usuario.uid;
    for (const c of COLECOES_DO_USUARIO) {
      for (const d of await banco.listarDoUsuario(c, uid)) await banco.apagar(c, d.id);
    }
    const ex = exemplo.paraUsuario(uid);
    await banco.gravarVarios('carros', ex.carros);
    await banco.gravarVarios('manutencoes', ex.manutencoes);
    await banco.gravarVarios('pagamentos', ex.pagamentos);
    const p = await perfilDe(req);
    Object.assign(p, { favoritos: ex.favoritos, vistos: {}, notificacoes: ex.notificacoes });
    await banco.gravar('usuarios', uid, p);
    res.json({ ok: true, carros: ex.carros.length, manutencoes: ex.manutencoes.length });
  } catch (e) { next(e); }
});

r.post('/carros/:id/transferir', auth.exigirLogin, async (req, res, next) => {
  try {
    const b = req.body || {};
    res.json(await vitrine.transferir(req.usuario.uid, req.params.id, b.para, b.anuncioId));
  } catch (e) { next(e); }
});

r.post('/anuncios/:id/visita', auth.exigirLogin, async (req, res, next) => {
  try { await vitrine.contarVisita(req.usuario.uid, req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

module.exports = r;
