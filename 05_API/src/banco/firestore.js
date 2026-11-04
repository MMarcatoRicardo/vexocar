/* VEXOcar API · banco Firestore (produção).
   Cada coleção do app vira uma coleção do Firestore. Os documentos do usuário levam o campo uid
   (o id da conta no Firebase Auth), e toda rota filtra por ele: ninguém lê nem altera o que é de outro. */
const { getFirestore } = require('firebase-admin/firestore');
const app = require('../firebase');

const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

const lista = snap => snap.docs.map(d => d.data());

module.exports = {
  nome: 'firestore',
  async listarDoUsuario(colecao, uid) { return lista(await db.collection(colecao).where('uid', '==', uid).get()); },
  async listarTodos(colecao) { return lista(await db.collection(colecao).get()); },
  async obter(colecao, id) { const s = await db.collection(colecao).doc(id).get(); return s.exists ? s.data() : null; },
  async gravar(colecao, id, doc) { await db.collection(colecao).doc(id).set(doc); },
  async apagar(colecao, id) { await db.collection(colecao).doc(id).delete(); },
  async gravarVarios(colecao, docs) {
    // O Firestore aceita até 500 gravações por lote
    for (let i = 0; i < docs.length; i += 400) {
      const lote = db.batch();
      docs.slice(i, i + 400).forEach(d => lote.set(db.collection(colecao).doc(d.id), d));
      await lote.commit();
    }
  }
};
