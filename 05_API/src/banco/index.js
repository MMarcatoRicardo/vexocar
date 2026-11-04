/* VEXOcar API · banco de dados.
   As rotas só conhecem estas 6 funções; quem guarda de verdade é o Firestore ou o arquivo local.
   Assim o mesmo código roda no computador (sem internet) e no Render (com o Firestore).

   listarDoUsuario(colecao, uid) -> documentos daquele usuário (campo uid)
   listarTodos(colecao)          -> todos os documentos (oficinas, anúncios de exemplo...)
   obter(colecao, id)            -> um documento ou null
   gravar(colecao, id, doc)      -> cria ou troca o documento inteiro
   apagar(colecao, id)
   gravarVarios(colecao, docs)   -> grava uma lista de uma vez (usado nos dados de exemplo) */
const config = require('../config');

const banco = config.modo.banco === 'firestore' ? require('./firestore') : require('./local');
module.exports = banco;
