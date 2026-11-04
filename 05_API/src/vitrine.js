/* VEXOcar API · vitrine entre usuários e transferência do prontuário.
   - anunciosDaComunidade(uid): anúncios ativos das OUTRAS pessoas, com o carro e o histórico
     (valores em R$ só se o dono marcou "mostrar valores"; placa mascarada).
   - transferir(): o carro, as manutenções e os impostos vão para a conta do comprador.
     Se o comprador ainda não tem conta, a transferência fica esperando e é entregue quando ele
     entrar com aquele e-mail (ou cadastrar aquele WhatsApp no perfil). */
const crypto = require('crypto');
const banco = require('./banco');

const COM_CARRO = ['manutencoes', 'pagamentos'];
const soDigitos = s => String(s || '').replace(/\D/g, '');
const ehEmail = s => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
function normalizarContato(v) {
  v = String(v || '').trim().toLowerCase();
  return ehEmail(v) ? v : soDigitos(v);
}
function mascararPlaca(p) {
  p = String(p || '');
  return p.length < 7 ? p : p.slice(0, 3) + '***' + p.slice(-1); // o final continua visível (alertas de IPVA)
}

async function carroDoAnuncio(a) {
  const c = await banco.obter('carros', a.carroId);
  if (c && c.uid === a.uid) return c;
  const t = await banco.obter('transferidos', a.carroId);
  return t && t.uid === a.uid ? t : null;
}

async function anunciosDaComunidade(uid) {
  const todos = (await banco.listarTodos('meusAnuncios')).filter(a => a.uid !== uid && !a.vendido && !a.pausado);
  const lista = [];
  for (const a of todos) {
    const c = await carroDoAnuncio(a);
    if (!c) continue;
    const [dono, ms, ps] = await Promise.all([
      banco.obter('usuarios', a.uid), banco.listarDoUsuario('manutencoes', a.uid), banco.listarDoUsuario('pagamentos', a.uid)
    ]);
    lista.push({
      id: a.id, carroId: a.carroId, preco: a.preco, fipe: a.fipe, descricao: a.descricao || '', fotos: a.fotos || [c.foto],
      publicado: a.publicado, visitas: a.visitas || 0, mostrarValores: !!a.mostrarValores, cidade: (dono && dono.cidade) || 'Curitiba, PR',
      vendedor: { nome: (dono && dono.nome) || 'Usuário VEXOcar', desde: (dono && dono.desde) || a.publicado.slice(0, 7), whatsapp: (dono && dono.whatsapp) || '' },
      carro: { id: c.id, marca: c.marca, modelo: c.modelo, versao: c.versao || '', ano: c.ano, km: c.km, kmMes: c.kmMes || 0, foto: c.foto, placa: mascararPlaca(c.placa) },
      manutencoes: ms.filter(m => m.carroId === c.id).map(m => {
        const r = { id: m.id, carroId: m.carroId, data: m.data, km: m.km, tipo: m.tipo, servico: m.servico, oficina: m.oficina || '', nota: !!m.nota };
        if (a.mostrarValores) r.valor = m.valor;
        return r;
      }),
      pagamentos: ps.filter(p => p.carroId === c.id).map(p => ({ id: p.id, carroId: p.carroId, tipo: p.tipo, ano: p.ano, data: p.data }))
    });
  }
  return lista.sort((x, y) => (x.publicado < y.publicado ? 1 : -1));
}

/* Muda o dono do carro e de tudo o que é dele (manutenções e impostos). */
async function mudarDono(carroId, deUid, paraUid) {
  const c = await banco.obter('carros', carroId);
  await banco.gravar('carros', carroId, Object.assign(c, { uid: paraUid, atualizadoEm: new Date().toISOString() }));
  for (const col of COM_CARRO) {
    for (const d of await banco.listarDoUsuario(col, deUid)) {
      if (d.carroId === carroId) await banco.gravar(col, d.id, Object.assign(d, { uid: paraUid }));
    }
  }
}

async function acharUsuarioPorContato(contato) {
  const usuarios = await banco.listarTodos('usuarios');
  return usuarios.find(u => (ehEmail(contato) ? String(u.email || '').toLowerCase() === contato : contato.length >= 10 && soDigitos(u.whatsapp).endsWith(contato.slice(-10)))) || null;
}

async function transferir(uid, carroId, para, anuncioId) {
  const c = await banco.obter('carros', carroId);
  if (!c || c.uid !== uid) throw Object.assign(new Error('Esse carro não está na sua garagem.'), { status: 403 });
  const contato = normalizarContato(para);
  if (!ehEmail(contato) && contato.length < 10) throw Object.assign(new Error('Informe o e-mail ou o celular com DDD do comprador.'), { status: 400 });

  const hoje = new Date().toISOString().slice(0, 10);
  const comprador = await acharUsuarioPorContato(contato);
  if (comprador && comprador.uid === uid) throw Object.assign(new Error('Esse contato é o seu. Informe o do comprador.'), { status: 400 });

  // Fica com o vendedor só uma "lembrança" do carro (aparece como vendido nos anúncios dele)
  const lembranca = Object.assign({}, c, { uid, transferidoPara: String(para).trim(), transferidoEm: hoje, atualizadoEm: new Date().toISOString() });
  await banco.gravar('transferidos', carroId, lembranca);

  let status;
  if (comprador) {
    await mudarDono(carroId, uid, comprador.uid);
    status = 'transferido';
  } else {
    const id = 't' + crypto.randomBytes(8).toString('hex');
    await mudarDono(carroId, uid, 'espera:' + id);
    await banco.gravar('transferencias', id, { id, carroId, de: uid, para: contato, em: hoje });
    status = 'esperando';
  }

  if (anuncioId) {
    const a = await banco.obter('meusAnuncios', anuncioId);
    if (a && a.uid === uid) {
      const carro = Object.assign({}, c); delete carro.uid; delete carro.atualizadoEm;
      await banco.gravar('meusAnuncios', anuncioId, Object.assign(a, { vendido: true, vendidoEm: hoje, transferidoPara: String(para).trim(), carro }));
    }
  }
  return { ok: true, status, carroId };
}

/* Chamado quando a pessoa abre o app: entrega os carros que estavam esperando por ela. */
async function receberTransferencias(perfil) {
  const email = String(perfil.email || '').toLowerCase(), zap = soDigitos(perfil.whatsapp);
  const minhas = (await banco.listarTodos('transferencias')).filter(t => t.para === email || (zap.length >= 10 && t.para.length >= 10 && zap.endsWith(t.para.slice(-10))));
  for (const t of minhas) {
    if (t.de === perfil.uid) continue;
    await mudarDono(t.carroId, 'espera:' + t.id, perfil.uid);
    await banco.apagar('transferencias', t.id);
  }
  return minhas.length;
}

async function contarVisita(uid, anuncioId) {
  const a = await banco.obter('meusAnuncios', anuncioId);
  if (!a || a.uid === uid) return;
  a.visitas = (a.visitas || 0) + 1;
  await banco.gravar('meusAnuncios', anuncioId, a);
}

module.exports = { anunciosDaComunidade, transferir, receberTransferencias, contarVisita, soDigitos };
