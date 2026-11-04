/* VEXOcar API · banco local (modo de desenvolvimento).
   Guarda tudo no arquivo dados-locais.json, no formato { colecao: { id: documento } }.
   Bom para programar e testar sem internet. Em produção o banco é o Firestore. */
const fs = require('fs');
const config = require('../config');

let dados = {};
if (fs.existsSync(config.arquivoLocal)) {
  try { dados = JSON.parse(fs.readFileSync(config.arquivoLocal, 'utf8')); } catch (e) { console.error('dados-locais.json com defeito; começando vazio.'); }
}

function gravarArquivo() {
  const tmp = config.arquivoLocal + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(dados, null, 1));
  fs.renameSync(tmp, config.arquivoLocal);
}
const col = nome => (dados[nome] = dados[nome] || {});
const copia = o => (o == null ? null : JSON.parse(JSON.stringify(o)));

module.exports = {
  nome: 'local',
  async listarDoUsuario(colecao, uid) { return Object.values(col(colecao)).filter(d => d.uid === uid).map(copia); },
  async listarTodos(colecao) { return Object.values(col(colecao)).map(copia); },
  async obter(colecao, id) { return copia(col(colecao)[id] || null); },
  async gravar(colecao, id, doc) { col(colecao)[id] = copia(doc); gravarArquivo(); },
  async apagar(colecao, id) { delete col(colecao)[id]; gravarArquivo(); },
  async gravarVarios(colecao, docs) { docs.forEach(d => { col(colecao)[d.id] = copia(d); }); gravarArquivo(); }
};
