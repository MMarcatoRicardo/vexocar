/* VEXOcar API · rotas sem login (e a de fotos).
   GET  /api/saude                 a API está no ar? (use para "acordar" o Render antes da apresentação)
   GET  /api/config                como o app deve fazer login (firebase ou local) e a config pública do Firebase
   GET  /api/publico/carros/:id    histórico público do QR code: sem valores em R$, placa mascarada, sem nota fiscal
   POST /api/fotos                 (com login) recebe uma foto e devolve o endereço dela */
const express = require('express');
const config = require('../config');
const banco = require('../banco');
const { exigirLogin } = require('../auth');
const { salvarFoto } = require('../fotos');

const r = express.Router();

r.get('/saude', (req, res) => res.json({
  ok: true, app: 'VEXOcar API', banco: config.modo.banco, login: config.modo.login, fotos: config.modo.fotos, hora: new Date().toISOString()
}));

r.get('/config', (req, res) => res.json({
  login: config.modo.login, firebase: config.modo.login === 'firebase' ? config.firebaseWeb : null
}));

function mascararPlaca(p) {
  p = String(p || '');
  return p.length < 7 ? p : p.slice(0, 3) + '***' + p.slice(-1); // BRA2E19 -> BRA***9 (o final da placa continua visível)
}

r.get('/publico/carros/:id', async (req, res, next) => {
  try {
    const c = await banco.obter('carros', req.params.id);
    if (!c) return res.status(404).json({ erro: 'Histórico não encontrado.' });
    const [ms, ps] = await Promise.all([banco.listarDoUsuario('manutencoes', c.uid), banco.listarDoUsuario('pagamentos', c.uid)]);
    res.json({
      carro: { id: c.id, marca: c.marca, modelo: c.modelo, versao: c.versao || '', ano: c.ano, km: c.km, kmMes: c.kmMes, foto: c.foto, cor: c.cor || '', placa: mascararPlaca(c.placa) },
      manutencoes: ms.filter(m => m.carroId === c.id)
        .map(m => ({ id: m.id, carroId: m.carroId, data: m.data, km: m.km, tipo: m.tipo, servico: m.servico, oficina: m.oficina, nota: !!m.nota })),
      pagamentos: ps.filter(p => p.carroId === c.id)
        .map(p => ({ id: p.id, carroId: p.carroId, tipo: p.tipo, ano: p.ano, data: p.data }))
    });
  } catch (e) { next(e); }
});

const PASTAS = ['carros', 'notas', 'anuncios'];
r.post('/fotos', exigirLogin, async (req, res, next) => {
  try {
    const pasta = PASTAS.includes(req.body && req.body.pasta) ? req.body.pasta : 'carros';
    const base = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({ url: await salvarFoto(req.body && req.body.dados, pasta, req.usuario.uid, base) });
  } catch (e) { next(e); }
});

module.exports = r;
