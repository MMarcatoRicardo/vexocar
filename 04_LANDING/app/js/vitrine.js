/* VEXOcar · funções da vitrine (telas 09, 10, 11 e 21).
   Junta os anúncios de exemplo (dados.js) com os anúncios do próprio usuário (d.meusAnuncios). */
(function () {
  'use strict';

  /* Valor FIPE de exemplo por modelo e ano. Na versão final vem da API pública da tabela FIPE. */
  var FIPE_EXEMPLO = { 'Polo 2019': 72400, 'CR-V 2017': 104900 };
  function fipeDe(c) {
    var k = c.modelo + ' ' + c.ano;
    if (FIPE_EXEMPLO[k]) return FIPE_EXEMPLO[k];
    var idade = Math.max(0, VX.hoje().getFullYear() - c.ano);
    return Math.round(110000 * Math.pow(0.9, idade) / 100) * 100;
  }

  function categoriaDe(c) {
    // aceita com ou sem hífen: T-Cross / TCross, HR-V / HRV, CR-V / CRV
    var t = (c.marca + ' ' + c.modelo + ' ' + (c.versao || '')).toLowerCase();
    if (/cr-?v|rav4|q5|suv|compass|creta|t-?cross|tracker|hr-?v|kicks|renegade|nivus|taos|tiguan|pulse|fastback|duster|captur|ecosport|sportage|tucson|corolla cross/.test(t)) return 'suv';
    if (/corolla|civic|camry|sedan|virtus|onix plus|cruze|jetta|city/.test(t)) return 'seda';
    return 'hatch';
  }

  function carroDoAnuncio(d, u) {
    return VX.carro(d, u.carroId) || (d.transferidos || []).filter(function (c) { return c.id === u.carroId; })[0] || u.carro;
  }

  /* Monta um anúncio do usuário no mesmo formato dos anúncios de exemplo. */
  function doUsuario(d, u) {
    var c = carroDoAnuncio(d, u);
    if (!c) return null;
    var ms = d.manutencoes.filter(function (m) { return m.carroId === c.id; });
    return {
      id: u.id, meu: true, carroId: c.id, marca: c.marca, modelo: c.modelo, versao: c.versao, ano: c.ano, km: c.km,
      preco: u.preco, fipe: u.fipe, cidade: d.usuario.cidade || 'Curitiba, PR', categoria: categoriaDe(c),
      foto: (u.fotos && u.fotos[0]) || c.foto, fotos: (u.fotos && u.fotos.length ? u.fotos : [c.foto]),
      nota: VX.carro(d, c.id) ? VX.nota(d, c) : (u.nota || 80), manutencoes: ms.length,
      comprovadas: ms.filter(function (m) { return m.nota; }).length,
      publicado: u.publicado, visitas: u.visitas || 0, descricao: u.descricao, mostrarValores: u.mostrarValores,
      pausado: !!u.pausado, vendido: !!u.vendido,
      vendedor: { nome: d.usuario.nome, desde: d.usuario.desde, whatsapp: d.usuario.whatsapp || '' }
    };
  }

  /* Anúncio de outra pessoa (modo API): vem com o carro e o histórico; a nota de saúde é calculada aqui,
     com a mesma regra dos carros da garagem. */
  function daComunidade(x) {
    var c = x.carro, mini = { carros: [c], manutencoes: x.manutencoes, pagamentos: x.pagamentos, vistos: {} };
    return {
      id: x.id, comunidade: true, meu: false, carroId: c.id, marca: c.marca, modelo: c.modelo, versao: c.versao, ano: c.ano, km: c.km,
      preco: x.preco, fipe: x.fipe, cidade: x.cidade, categoria: categoriaDe(c), foto: x.fotos[0] || c.foto, fotos: x.fotos.length ? x.fotos : [c.foto],
      nota: VX.nota(mini, c), manutencoes: x.manutencoes.length, comprovadas: x.manutencoes.filter(function (m) { return m.nota; }).length,
      publicado: x.publicado, visitas: x.visitas, descricao: x.descricao, mostrarValores: x.mostrarValores, vendedor: x.vendedor,
      historico: x.manutencoes.map(function (m) { return { data: m.data, km: m.km, servico: m.servico, nota: m.nota, oficina: m.oficina, valor: m.valor }; })
    };
  }
  /* Anúncios de outras pessoas (os de verdade, no modo API) + os de exemplo. */
  function exemplos(d) {
    return (d.anunciosComunidade || []).map(daComunidade)
      .concat(d.anuncios.map(function (a) { return Object.assign({}, a, { meu: false, fotos: [a.foto] }); }));
  }
  function meus(d) { return (d.meusAnuncios || []).map(function (u) { return doUsuario(d, u); }).filter(Boolean); }
  /* O que aparece na vitrine pública: exemplos + meus ativos (não vendidos e não pausados). */
  function publicos(d) { return meus(d).filter(function (a) { return !a.vendido && !a.pausado; }).concat(exemplos(d)); }
  function achar(d, id) { return exemplos(d).concat(meus(d)).filter(function (a) { return a.id === id; })[0]; }
  function cru(d, id) { return (d.meusAnuncios || []).filter(function (u) { return u.id === id; })[0]; }

  function difFipe(preco, fipe) {
    if (!fipe) return { pct: 0, txt: '', cls: 'mudo' };
    var pct = Math.round((preco - fipe) / fipe * 100);
    if (pct === 0) return { pct: 0, txt: 'na média da FIPE', cls: 'mudo' };
    return { pct: pct, txt: Math.abs(pct) + '% ' + (pct < 0 ? 'abaixo' : 'acima') + ' da FIPE', cls: pct < 0 ? 'verde' : 'mudo' };
  }

  function nomeAnuncio(a) { return a.marca + ' ' + a.modelo + ' ' + a.ano; }

  /* Cartão da grade da vitrine. */
  function cartao(a, favorito) {
    var esc = VX.esc, fmt = VX.fmt, f = difFipe(a.preco, a.fipe);
    return '<article class="cartao anuncio-c">' +
      '<a class="foto" href="anuncio.html?id=' + a.id + '"><img src="' + esc(a.foto) + '" alt="' + esc(nomeAnuncio(a)) + '" loading="lazy">' +
      (a.meu ? '<span class="tag tag-v meu-tag">Seu anúncio</span>' : '') + '</a>' +
      (a.meu ? '' : '<button class="fav' + (favorito ? ' ativo' : '') + '" data-fav="' + a.id + '" aria-pressed="' + favorito + '" aria-label="' + (favorito ? 'Tirar dos favoritos' : 'Favoritar') + '">' + VX.icone('coracao') + '</button>') +
      '<a class="corpo" href="anuncio.html?id=' + a.id + '">' +
        '<div class="carro-topo"><div><h3>' + esc(a.marca + ' ' + a.modelo) + '</h3><p class="mudo peq">' + esc(a.versao) + '</p></div>' + VX.gauge(a.nota, 'p') + '</div>' +
        '<p class="mudo peq">' + a.ano + ' · ' + fmt.milKm(a.km) + ' · ' + esc(a.cidade) + '</p>' +
        '<div class="carro-preco"><span class="preco">' + fmt.moeda(a.preco) + '</span><span class="peq ' + f.cls + '">' + f.txt + '</span></div>' +
        '<div>' + VX.selo() + '</div>' +
      '</a></article>';
  }

  window.VXV = {
    fipeDe: fipeDe, categoriaDe: categoriaDe, carroDoAnuncio: carroDoAnuncio, doUsuario: doUsuario,
    exemplos: exemplos, meus: meus, publicos: publicos, achar: achar, cru: cru,
    difFipe: difFipe, nomeAnuncio: nomeAnuncio, cartao: cartao
  };
})();
