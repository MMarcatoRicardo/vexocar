/* VEXOcar API · CRUD das coleções do usuário.
   PUT    /api/:colecao/:id   cria ou atualiza (o id vem do app)
   DELETE /api/:colecao/:id   apaga
   Coleções: carros, manutencoes, pagamentos, meusAnuncios, transferidos, avaliacoes.
   Regra de ouro: cada documento leva o uid do dono, e só o dono altera. */
const express = require('express');
const banco = require('../banco');
const { exigirLogin } = require('../auth');

const r = express.Router();

const data = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const texto = s => typeof s === 'string' && s.trim().length > 0;
const num = (v, min, max) => typeof v === 'number' && isFinite(v) && v >= min && v <= (max == null ? Infinity : max);
const TIPOS_MANUT = ['revisao', 'oleo', 'freios', 'pneus', 'suspensao', 'eletrica', 'outro'];

/* Validação de cada coleção: devolve a mensagem de erro, ou '' se estiver tudo certo. */
const REGRAS = {
  carros: c =>
    !texto(c.marca) ? 'Informe a marca.' :
    !texto(c.modelo) ? 'Informe o modelo.' :
    !num(c.ano, 1950, new Date().getFullYear() + 1) ? 'Ano inválido.' :
    !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(c.placa || '') ? 'Placa inválida (ex.: ABC1D23).' :
    !num(c.km, 0, 3e6) ? 'Quilometragem inválida.' :
    !num(c.kmMes || 0, 0, 5e4) ? 'Km por mês inválido.' : '',
  manutencoes: m =>
    !texto(m.carroId) ? 'Falta o carro.' : !data(m.data) ? 'Data inválida.' : !num(m.km, 0, 3e6) ? 'Km inválido.' :
    !texto(m.servico) ? 'Descreva o serviço.' : !num(m.valor, 0, 1e7) ? 'Valor inválido.' :
    !TIPOS_MANUT.includes(m.tipo) ? 'Tipo de serviço inválido.' : '',
  pagamentos: p =>
    !texto(p.carroId) ? 'Falta o carro.' : !['ipva', 'licenciamento'].includes(p.tipo) ? 'Tipo inválido.' :
    !num(p.ano, 2000, 2100) ? 'Ano inválido.' : !data(p.data) ? 'Data inválida.' : !num(p.valor || 0, 0, 1e6) ? 'Valor inválido.' : '',
  meusAnuncios: a => !texto(a.carroId) ? 'Falta o carro.' : !num(a.preco, 1, 1e8) ? 'Preço inválido.' : '',
  transferidos: c => !texto(c.marca) || !texto(c.modelo) ? 'Carro inválido.' : '',
  avaliacoes: v => !texto(v.oficinaId) ? 'Falta a oficina.' : !num(v.nota, 1, 5) ? 'Nota de 1 a 5.' : ''
};
// Coleções cujo documento aponta para um carro do usuário
const COM_CARRO = ['manutencoes', 'pagamentos', 'meusAnuncios'];

/* A foto tem que ir antes para /api/fotos; aqui só entra o endereço (ou o desenho SVG pequeno de "sem foto"). */
function temFotoCrua(o) {
  if (typeof o === 'string') return o.startsWith('data:image/') && !o.startsWith('data:image/svg') && o.length > 2000;
  if (o && typeof o === 'object') return Object.values(o).some(temFotoCrua);
  return false;
}

async function carroEhDoUsuario(carroId, uid) {
  const [c, t] = await Promise.all([banco.obter('carros', carroId), banco.obter('transferidos', carroId)]);
  return (!!c && c.uid === uid) || (!!t && t.uid === uid);
}

/* Só responde por coleções conhecidas; o resto segue para a próxima rota (ou 404). */
function colecaoValida(req, res, next) {
  if (!REGRAS[req.params.colecao]) return next('route');
  if (!/^[\w-]{1,80}$/.test(req.params.id)) return res.status(400).json({ erro: 'Id inválido.' });
  exigirLogin(req, res, next);
}

r.put('/:colecao/:id', colecaoValida, async (req, res, next) => {
  try {
    const { colecao, id } = req.params, uid = req.usuario.uid;
    const doc = Object.assign({}, req.body || {}, { id });
    delete doc.minha;
    const erro = REGRAS[colecao](doc);
    if (erro) return res.status(400).json({ erro });
    if (temFotoCrua(doc)) return res.status(400).json({ erro: 'Envie a foto para /api/fotos primeiro.' });
    const atual = await banco.obter(colecao, id);
    if (atual && atual.uid !== uid) return res.status(403).json({ erro: 'Esse registro é de outra conta.' });
    if (COM_CARRO.includes(colecao) && !(await carroEhDoUsuario(doc.carroId, uid))) {
      return res.status(403).json({ erro: 'Esse carro não está na sua garagem.' });
    }
    if (colecao === 'avaliacoes') {
      const perfil = await banco.obter('usuarios', uid);
      doc.autor = (perfil && perfil.nome) || 'Usuário VEXOcar';
    }
    // Visitas são contadas pelo servidor: o app do dono pode estar com um número antigo
    if (colecao === 'meusAnuncios' && atual) doc.visitas = Math.max(atual.visitas || 0, doc.visitas || 0);
    doc.uid = uid;
    doc.atualizadoEm = new Date().toISOString();
    await banco.gravar(colecao, id, doc);
    res.status(atual ? 200 : 201).json({ ok: true });
  } catch (e) { next(e); }
});

r.delete('/:colecao/:id', colecaoValida, async (req, res, next) => {
  try {
    const { colecao, id } = req.params;
    const atual = await banco.obter(colecao, id);
    if (!atual) return res.json({ ok: true }); // já não existe: tudo certo
    if (atual.uid !== req.usuario.uid) return res.status(403).json({ erro: 'Esse registro é de outra conta.' });
    await banco.apagar(colecao, id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = r;
