/* VEXOcar API · dados de exemplo.
   Lê o mesmo arquivo de exemplo do site (04_LANDING/app/js/dados.js), para não ter duas cópias.
   - oficinas, anúncios e avaliações de exemplo: entram no banco uma vez (todo mundo vê)
   - Polo e CR-V: entram na conta de quem clica em "Restaurar dados de exemplo" (Perfil) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const config = require('./config');
const banco = require('./banco');

function carregar() {
  const arq = path.join(config.pastaFront, 'app', 'js', 'dados.js');
  const caixa = { window: {} };
  vm.runInNewContext(fs.readFileSync(arq, 'utf8'), caixa, { filename: 'dados.js' });
  return caixa.window.VX_DADOS;
}

/* Na primeira vez que a API sobe com um banco vazio, grava oficinas, anúncios e avaliações de exemplo. */
async function prepararBanco() {
  const ex = carregar();
  const versao = await banco.obter('sistema', 'exemplo');
  if (versao && versao.versao === ex.versao) return;
  await banco.gravarVarios('oficinas', ex.oficinas);
  await banco.gravarVarios('anuncios', ex.anuncios);
  await banco.gravarVarios('avaliacoes', ex.avaliacoes.map(v => { const c = Object.assign({}, v, { uid: null }); delete c.minha; return c; }));
  await banco.gravar('sistema', 'exemplo', { id: 'exemplo', versao: ex.versao, em: new Date().toISOString() });
  console.log('Dados de exemplo (oficinas, anúncios e avaliações) gravados no banco.');
}

/* Carros de exemplo para uma conta. Os ids ganham um sufixo para não colidir entre usuários (c1 -> c1-ab12cd). */
function paraUsuario(uid) {
  const ex = carregar();
  const suf = '-' + crypto.randomBytes(3).toString('hex');
  const novoId = id => id + suf;
  const comUid = o => Object.assign({}, o, { uid });
  return {
    carros: ex.carros.map(c => comUid(Object.assign({}, c, { id: novoId(c.id) }))),
    manutencoes: ex.manutencoes.map(m => comUid(Object.assign({}, m, { id: novoId(m.id), carroId: novoId(m.carroId) }))),
    pagamentos: ex.pagamentos.map(p => comUid(Object.assign({}, p, { id: novoId(p.id), carroId: novoId(p.carroId) }))),
    favoritos: ex.favoritos.slice(),
    notificacoes: Object.assign({}, ex.notificacoes)
  };
}

module.exports = { carregar, prepararBanco, paraUsuario };
