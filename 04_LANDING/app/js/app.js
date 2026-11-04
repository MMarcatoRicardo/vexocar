/* VEXOcar · funções comuns a todas as telas do sistema.
   Cada tela (arquivo .html) carrega dados.js + app.js e tem o seu próprio <script> no fim.
   Tudo o que a tela precisa fica em window.VX. */
(function () {
  'use strict';

  var CHAVE = 'vexocar:v1';
  var memoria = null; // usado quando o navegador bloqueia o localStorage

  /* ================= Dados ================= */
  function copia(o) { return JSON.parse(JSON.stringify(o)); }

  // No modo API (js/api.js), os dados vêm do servidor; db() e salvar() passam por lá.
  function api() { return window.VXAPI && window.VXAPI.ativo ? window.VXAPI : null; }

  function db() {
    if (api()) return api().db();
    var d = null;
    try { d = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { d = memoria; }
    if (!d || d.versao !== window.VX_DADOS.versao) { d = copia(window.VX_DADOS); salvar(d); }
    return d;
  }
  function salvar(d) {
    if (api()) return api().salvar(d);
    memoria = d;
    try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) { /* sem espaço ou bloqueado: fica na memória */ }
  }
  function restaurar() { var d = copia(window.VX_DADOS); d.logado = true; salvar(d); return d; }
  function novoId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  /* ================= Datas e números ================= */
  function hoje() { return parseData(window.VX_DADOS.hoje); }
  function parseData(s) { var p = String(s).split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
  function isoData(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function somaDias(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function somaMeses(d, n) { var r = new Date(d); r.setMonth(r.getMonth() + n); return r; }
  function diasEntre(a, b) { return Math.round((b - a) / 86400000); }
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var fmt = {
    moeda: function (v) { return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); },
    moedaCheia: function (v) { return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    km: function (v) { return Number(v || 0).toLocaleString('pt-BR') + ' km'; },
    milKm: function (v) { return v >= 1000 ? Math.round(v / 1000) + ' mil km' : fmt.km(v); },
    data: function (s) { var d = typeof s === 'string' ? parseData(s) : s; return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); },
    mesAno: function (s) { var d = typeof s === 'string' ? parseData(s) : s; return MESES[d.getMonth()] + '/' + d.getFullYear(); },
    placa: function (p) { p = String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return p.length === 7 ? p.slice(0, 3) + '-' + p.slice(3) : p; },
    dias: function (n) {
      if (n === 0) return 'hoje';
      if (n === 1) return 'amanhã';
      if (n === -1) return 'ontem';
      if (n < 0) return 'há ' + (-n) + ' dias';
      if (n < 60) return 'em ' + n + ' dias';
      return 'em ' + Math.round(n / 30) + ' meses';
    }
  };

  /* ================= Carros ================= */
  function carro(d, id) { return d.carros.filter(function (c) { return c.id === id; })[0]; }
  function nomeCarro(c) { return c.marca + ' ' + c.modelo + ' ' + c.ano; }
  function nomeCurto(c) { return c.modelo + ' ' + c.ano; }
  function manutDoCarro(d, id) {
    return d.manutencoes.filter(function (m) { return m.carroId === id; })
      .sort(function (a, b) { return a.data < b.data ? 1 : -1; });
  }
  function pagamentosDoCarro(d, id) {
    return (d.pagamentos || []).filter(function (p) { return p.carroId === id; })
      .sort(function (a, b) { return a.data < b.data ? 1 : -1; });
  }
  function pago(d, carroId, tipo, ano) {
    return (d.pagamentos || []).some(function (p) { return p.carroId === carroId && p.tipo === tipo && p.ano === ano; });
  }
  /* Registra IPVA ou licenciamento pago (vai para a linha do tempo e some dos alertas). */
  function registrarPagamento(d, carroId, tipo, ano, valor, data) {
    d.pagamentos = d.pagamentos || [];
    d.pagamentos.push({ id: novoId('d'), carroId: carroId, tipo: tipo, ano: ano, data: data || isoData(hoje()), valor: valor || 0 });
  }
  var NOME_DOC = { ipva: 'IPVA', licenciamento: 'Licenciamento' };
  /* Nota da oficina = base antiga (o.nota × o.avaliacoes) + avaliações dos usuários em d.avaliacoes. */
  function avaliacoesDa(d, id) {
    return (d.avaliacoes || []).filter(function (v) { return v.oficinaId === id; })
      .sort(function (a, b) { return (b.minha ? 1 : 0) - (a.minha ? 1 : 0) || (a.data < b.data ? 1 : -1); });
  }
  function notaOficina(d, o) {
    var vs = avaliacoesDa(d, o.id), soma = o.nota * o.avaliacoes, total = o.avaliacoes;
    vs.forEach(function (v) { soma += v.nota; total++; });
    return { media: total ? Math.round(soma / total * 10) / 10 : 0, total: total, lista: vs };
  }
  function minhaAvaliacao(d, id) { return avaliacoesDa(d, id).filter(function (v) { return v.minha; })[0] || null; }
  function finalPlaca(c) { var m = String(c.placa).match(/(\d)\D*$/); return m ? +m[1] : 0; }

  /* Próximo serviço por km ou por data (o que vier primeiro). */
  function proximo(c, ms, tipos, intervaloKm, intervaloMeses) {
    var ult = ms.filter(function (m) { return tipos.indexOf(m.tipo) >= 0; })[0];
    var baseKm = ult ? ult.km : Math.floor(c.km / intervaloKm) * intervaloKm;
    var alvoKm = baseKm + intervaloKm;
    var alvoData = ult ? somaMeses(parseData(ult.data), intervaloMeses) : null;
    var falta = alvoKm - c.km;
    var diasKm = c.kmMes > 0 ? Math.round(falta / (c.kmMes / 30)) : 9999;
    var dataKm = somaDias(hoje(), diasKm);
    var prazo = alvoData && alvoData < dataKm ? alvoData : dataKm;
    var dias = diasEntre(hoje(), prazo);
    var status = falta <= 0 || dias < 0 ? 'vencido' : (dias <= 45 || falta <= 1500 ? 'proximo' : 'ok');
    return { alvoKm: alvoKm, falta: falta, prazo: prazo, dias: dias, status: status, porData: prazo === alvoData, ultimo: ult };
  }

  /* Todos os alertas de um carro. Regras de IPVA e licenciamento simplificadas (calendário do Detran-PR varia por ano). */
  function alertasCarro(d, c) {
    var ms = manutDoCarro(d, c.id), lista = [], ano = hoje().getFullYear(), fim = finalPlaca(c);

    var rev = proximo(c, ms, ['revisao'], 10000, 12);
    lista.push({ id: c.id + ':rev' + rev.alvoKm, carroId: c.id, tipo: 'revisao', status: rev.status, dias: rev.dias, data: rev.prazo,
      titulo: 'Revisão dos ' + fmt.km(Math.round(rev.alvoKm / 10000) * 10000),
      texto: rev.status === 'vencido'
        ? (rev.porData ? 'Venceu por data em ' + fmt.data(rev.prazo) + ' (12 meses desde a última)' : 'Passou ' + fmt.km(-rev.falta) + ' do previsto')
        : 'Faltam ' + fmt.km(rev.falta) + ' (por volta de ' + fmt.data(rev.prazo) + ')',
      acao: { txt: 'Achar oficina', href: 'oficinas.html' } });

    var oleo = proximo(c, ms, ['oleo', 'revisao'], 10000, 12);
    lista.push({ id: c.id + ':oleo' + oleo.alvoKm, carroId: c.id, tipo: 'oleo', status: oleo.status, dias: oleo.dias, data: oleo.prazo,
      titulo: 'Troca de óleo',
      texto: oleo.status === 'vencido' ? 'Passou do prazo' : 'Faltam ' + fmt.km(oleo.falta) + ' (por volta de ' + fmt.data(oleo.prazo) + ')',
      acao: { txt: 'Registrar troca', href: 'nova-manutencao.html?carro=' + c.id + '&tipo=oleo' } });

    var mesLic = fim === 0 ? 12 : Math.min(12, fim + 3);
    var lic = new Date(ano, mesLic, 0); // último dia do mês
    var licPago = pago(d, c.id, 'licenciamento', ano);
    var dLic = diasEntre(hoje(), lic);
    lista.push({ id: c.id + ':lic' + ano, carroId: c.id, tipo: 'licenciamento', doc: 'lic' + ano,
      status: licPago ? 'pago' : (dLic < 0 ? 'vencido' : (dLic <= 60 ? 'proximo' : 'ok')), dias: dLic, data: lic,
      titulo: 'Licenciamento ' + ano,
      texto: licPago ? 'Pago' : 'Placa final ' + fim + (dLic < 0 ? ' venceu em ' : ' vence em ') + fmt.data(lic),
      acao: licPago ? null : { txt: 'Marcar como pago', pagar: { carroId: c.id, tipo: 'licenciamento', ano: ano } } });

    var ipva = new Date(ano + 1, 0, 10 + fim);
    var ipvaPago = pago(d, c.id, 'ipva', ano + 1);
    var dIpva = diasEntre(hoje(), ipva);
    lista.push({ id: c.id + ':ipva' + (ano + 1), carroId: c.id, tipo: 'ipva', doc: 'ipva' + (ano + 1),
      status: ipvaPago ? 'pago' : (dIpva < 0 ? 'vencido' : (dIpva <= 90 ? 'proximo' : 'ok')), dias: dIpva, data: ipva,
      titulo: 'IPVA ' + (ano + 1),
      texto: ipvaPago ? 'Pago' : 'Placa final ' + fim + ', cota única vence em ' + fmt.data(ipva),
      acao: ipvaPago ? null : { txt: 'Marcar como pago', pagar: { carroId: c.id, tipo: 'ipva', ano: ano + 1 } } });

    var pneu = proximo(c, ms.filter(function (m) { return /troca|pneus novos/i.test(m.servico); }), ['pneus'], 40000, 60);
    lista.push({ id: c.id + ':pneu' + pneu.alvoKm, carroId: c.id, tipo: 'pneus', status: pneu.falta <= 3000 ? (pneu.falta <= 0 ? 'vencido' : 'proximo') : 'ok', dias: pneu.dias, data: pneu.prazo,
      titulo: 'Troca de pneus', texto: 'Previsão pelos ' + fmt.km(pneu.alvoKm) + ' (faltam ' + fmt.km(Math.max(0, pneu.falta)) + ')',
      acao: { txt: 'Registrar troca', href: 'nova-manutencao.html?carro=' + c.id + '&tipo=pneus' } });

    var vistos = d.vistos || {};
    lista.forEach(function (a) { a.visto = !!vistos[a.id]; });
    var ordem = { vencido: 0, proximo: 1, ok: 2, pago: 3 };
    return lista.sort(function (a, b) { return ordem[a.status] - ordem[b.status] || a.dias - b.dias; });
  }

  function alertas(d) {
    var r = [];
    d.carros.forEach(function (c) { r = r.concat(alertasCarro(d, c)); });
    return r;
  }
  function contaAlertas(d) {
    return alertas(d).filter(function (a) { return (a.status === 'vencido' || a.status === 'proximo') && !a.visto; }).length;
  }
  /* Marcar alerta como lido: sai da contagem do menu, mas continua na lista. */
  function marcarVisto(d, id, sim) {
    d.vistos = d.vistos || {};
    if (sim) d.vistos[id] = true; else delete d.vistos[id];
  }

  /* Nota de saúde (0 a 100): começa em 85, ganha por histórico e por nota fiscal anexada, perde por pendências. */
  function nota(d, c) {
    var ms = manutDoCarro(d, c.id), al = alertasCarro(d, c);
    var n = 85 + Math.min(6, ms.filter(function (m) { return m.nota; }).length) + Math.min(5, ms.length);
    al.forEach(function (a) {
      if (a.status === 'vencido') n -= (a.tipo === 'revisao' ? 18 : a.tipo === 'oleo' ? 8 : 6);
    });
    if (al.some(function (a) { return a.status === 'proximo' && (a.tipo === 'revisao' || a.tipo === 'oleo'); })) n -= 4;
    if (!ms.length || diasEntre(parseData(ms[0].data), hoje()) > 365) n -= 15;
    return Math.max(20, Math.min(100, n));
  }
  function textoNota(n) {
    if (n >= 90) return 'Excelente. Revisões em dia.';
    if (n >= 80) return 'Bom estado, com algo chegando.';
    if (n >= 60) return 'Atenção: tem pendência.';
    return 'Precisa de cuidados.';
  }

  /* ================= Pedaços de HTML ================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function gauge(n, tam) {
    return '<div class="gauge ' + (tam || '') + '" data-nota="' + n + '" role="img" aria-label="Nota de saúde ' + n + ' de 100">' +
      '<svg viewBox="0 0 120 70" aria-hidden="true"><path class="g-fundo" d="M10 64 A50 50 0 0 1 110 64"/>' +
      '<path class="g-valor" d="M10 64 A50 50 0 0 1 110 64" pathLength="100"/></svg><b>' + n + '</b></div>';
  }
  function animarGauges(raiz) {
    (raiz || document).querySelectorAll('.gauge[data-nota]').forEach(function (g) {
      var n = +g.dataset.nota;
      g.style.setProperty('--cor', n >= 80 ? 'var(--verde)' : n >= 60 ? 'var(--ambar)' : 'var(--erro)');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        g.querySelector('.g-valor').style.strokeDasharray = n + ' 100';
      }); });
    });
  }
  function selo(txt) { return '<span class="selo"><svg><use href="#v"/></svg>' + esc(txt || 'Histórico VEXOcar') + '</span>'; }
  function tagStatus(s) {
    return { vencido: '<span class="tag tag-e">Vencido</span>', proximo: '<span class="tag tag-a">Próximo</span>',
      ok: '<span class="tag">Em dia</span>', pago: '<span class="tag tag-v">' + icone('check') + 'Pago</span>' }[s] || '';
  }
  var NOME_TIPO = { revisao: 'Revisão', oleo: 'Troca de óleo', freios: 'Freios', pneus: 'Pneus', suspensao: 'Suspensão', eletrica: 'Elétrica', outro: 'Outro' };

  var V_SIMBOLO = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="v" viewBox="18 20 84 80">' +
    '<polygon points="18,20 37,20 60,78 60,100 50,100" fill="#F2F1EC"/><polygon points="83,20 102,20 70,100 60,100 60,78" fill="#2FD47A"/>' +
    '<line class="faixa" x1="91.6" y1="23" x2="66.2" y2="97" stroke="#0E0F11" stroke-width="2.8" stroke-dasharray="8 6"/></symbol></svg>';
  function logo(href) { return '<a class="wm" href="' + (href || 'garagem.html') + '" aria-label="VEXOcar"><svg><use href="#v"/></svg>EXO<span>car</span></a>'; }

  /* ================= Ícones (traço, 24x24) ================= */
  var I = {
    garagem: '<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-6h10v6"/><path d="M7 18h10"/>',
    alertas: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    vitrine: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13v8h14v-8"/>',
    oficinas: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    gastos: '<path d="M3 3v18h18"/><path d="M7 15v3"/><path d="M12 10v8"/><path d="M17 6v12"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    voltar: '<path d="m15 18-6-6 6-6"/>',
    fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
    seta: '<path d="m9 18 6-6-6-6"/>',
    coracao: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    compartilhar: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    verificado: '<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/><path d="m8 12 3 3 5-6"/>',
    documento: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    baixar: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    busca: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    alerta: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    mapa: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    estrela: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    chave: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    velocimetro: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    olho: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    olhoFechado: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    lixo: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    whatsapp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
    rota: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>',
    transferir: '<path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/>',
    oficina: '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>',
    loc: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'
  };
  function icone(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>';
  }
  function iconeGoogle() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"/></svg>';
  }

  /* ================= Estrutura das telas ================= */
  var MENU = [
    ['garagem', 'Garagem', 'garagem.html'],
    ['alertas', 'Alertas', 'alertas.html'],
    ['vitrine', 'Vitrine', 'vitrine.html'],
    ['oficinas', 'Oficinas', 'oficinas.html'],
    ['gastos', 'Gastos', 'gastos.html']
  ];
  function iniciais(nome) { return String(nome || '?').split(' ').filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase(); }

  /* Coloca o menu lateral (computador) e a barra de baixo (celular). ativo = item do menu. */
  function shell(ativo) {
    var d = db(), n = contaAlertas(d);
    var links = MENU.map(function (m) {
      return '<a href="' + m[2] + '"' + (m[0] === ativo ? ' aria-current="page"' : '') + '>' + icone(m[0]) + '<span>' + m[1] + '</span>' +
        (m[0] === 'alertas' && n ? '<i class="bolinha">' + n + '</i>' : '') + '</a>';
    }).join('');
    var lateral = document.createElement('aside');
    lateral.className = 'lateral';
    lateral.innerHTML = logo() + '<nav aria-label="Menu principal">' + links + '</nav>' +
      '<a class="eu" href="perfil.html"><span class="avatar">' + iniciais(d.usuario.nome) + '</span><span><strong>' + esc(d.usuario.nome.split(' ')[0]) + '</strong><small>Ver perfil</small></span></a>';
    var barra = document.createElement('nav');
    barra.className = 'barra';
    barra.setAttribute('aria-label', 'Menu principal');
    barra.innerHTML = links;
    document.body.insertAdjacentHTML('afterbegin', V_SIMBOLO);
    document.body.insertBefore(lateral, document.body.children[1]);
    document.body.appendChild(barra);
  }
  /* Atualiza o número de alertas do menu sem recarregar a página (some quando chega a 0). */
  function atualizarBolinha() {
    var n = contaAlertas(db());
    document.querySelectorAll('.lateral nav a[href="alertas.html"], .barra a[href="alertas.html"]').forEach(function (a) {
      var b = a.querySelector('.bolinha');
      if (!n) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('i'); b.className = 'bolinha'; a.appendChild(b); }
      b.textContent = n;
    });
  }
  /* Telas sem menu (login, cadastro, página pública) só precisam do símbolo do logo. */
  function simbolo() { document.body.insertAdjacentHTML('afterbegin', V_SIMBOLO); }

  /* ================= Interação ================= */
  var timerToast;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = icone('verificado') + '<span>' + esc(msg) + '</span>';
    requestAnimationFrame(function () { t.classList.add('mostra'); });
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.classList.remove('mostra'); }, 2600);
  }
  /* Aviso para mostrar na próxima tela (depois de salvar e redirecionar). */
  function avisoDepois(msg) { try { sessionStorage.setItem('vx:toast', msg); } catch (e) {} }
  function mostrarAvisoPendente() {
    var m = null;
    try { m = sessionStorage.getItem('vx:toast'); sessionStorage.removeItem('vx:toast'); } catch (e) {}
    if (m) setTimeout(function () { toast(m); }, 200);
  }

  /* Janela de confirmação. Devolve uma Promise com true/false. */
  function confirmar(titulo, texto, ok, perigo) {
    return new Promise(function (resolve) {
      var f = document.createElement('div');
      f.className = 'janela-fundo';
      f.innerHTML = '<div class="janela" role="dialog" aria-modal="true" aria-labelledby="jt"><h2 id="jt">' + esc(titulo) + '</h2><p>' + esc(texto) + '</p>' +
        '<div class="fila-btn"><button class="btn btn-s" data-r="0">Cancelar</button><button class="btn ' + (perigo ? 'btn-perigo' : 'btn-p') + '" data-r="1">' + esc(ok || 'Confirmar') + '</button></div></div>';
      document.body.appendChild(f);
      requestAnimationFrame(function () { f.classList.add('aberta'); });
      f.querySelector('[data-r="1"]').focus();
      function fecha(v) { f.classList.remove('aberta'); setTimeout(function () { f.remove(); }, 200); resolve(v); }
      f.addEventListener('click', function (e) {
        if (e.target === f) return fecha(false);
        var b = e.target.closest('[data-r]');
        if (b) fecha(b.dataset.r === '1');
      });
      document.addEventListener('keydown', function tecla(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', tecla); fecha(false); } });
    });
  }

  function param(n) { return new URLSearchParams(location.search).get(n); }
  /* Link do WhatsApp. numero 'demo' = contato de demonstração (dados.js > contatoDemo); vazio = a pessoa escolhe o contato.
     Nunca usar número inventado: pode ser de alguém real. */
  function whats(numero, texto) {
    if (numero === 'demo') numero = window.VX_DADOS.contatoDemo || '';
    numero = String(numero || '').replace(/\D/g, '');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto || '');
  }

  /* Lê uma foto escolhida e reduz (para caber no navegador). Devolve uma Promise com o endereço da imagem. */
  function lerFoto(arquivo, max) {
    max = max || 900;
    return new Promise(function (ok, erro) {
      var r = new FileReader();
      r.onerror = erro;
      r.onload = function () {
        var img = new Image();
        img.onerror = erro;
        img.onload = function () {
          var k = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          ok(cv.toDataURL('image/jpeg', .75));
        };
        img.src = r.result;
      };
      r.readAsDataURL(arquivo);
    });
  }

  /* ================= Voltar para a tela anterior =================
     Cada tela visitada entra numa pilha. Formulários (body data-pilha="nao") não entram,
     para o "voltar" depois de salvar não cair de novo no formulário. */
  var PILHA = 'vx:pilha';
  function lerPilha() { try { return JSON.parse(sessionStorage.getItem(PILHA)) || []; } catch (e) { return []; } }
  function gravarPilha(p) { try { sessionStorage.setItem(PILHA, JSON.stringify(p.slice(-30))); } catch (e) {} }
  // Sempre com .html (o endereço pode estar sem a extensão), para a pilha funcionar nos dois jeitos
  function aqui() { var n = location.pathname.split('/').pop() || 'index.html'; return (/\./.test(n) ? n : n + '.html') + location.search; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function registrarTela() {
    if (document.body.dataset.pilha === 'nao') { ss('vx:form', '1'); ss('vx:veioDe', null); return; }
    var p = lerPilha(), atual = aqui(), passouForm = ss('vx:form');
    ss('vx:form', null);
    if (p[p.length - 1] === atual) return;
    if (p[p.length - 2] === atual) { p.pop(); ss('vx:veioDe', null); }
    else { ss('vx:veioDe', passouForm ? null : (p[p.length - 1] || null)); p.push(atual); }
    gravarPilha(p);
  }
  function anterior() {
    var p = lerPilha(), atual = aqui();
    while (p.length && p[p.length - 1] === atual) p.pop();
    return p[p.length - 1] || null;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.voltar, [data-voltar]');
    if (!b || e.defaultPrevented) return;
    var alvo = anterior();
    if (!alvo) return;
    e.preventDefault();
    // Veio direto da tela anterior: usa o voltar do navegador (mantém o histórico dele em ordem).
    if (ss('vx:veioDe') === alvo && history.length > 1) history.back();
    else location.href = alvo;
  });
  // Página restaurada do cache do navegador (voltar): recarrega para mostrar os dados atuais.
  window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });

  /* Mostrar/ocultar senha em qualquer .campo-senha */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.campo-senha button');
    if (!b) return;
    var i = b.parentNode.querySelector('input');
    var ver = i.type === 'password';
    i.type = ver ? 'text' : 'password';
    b.innerHTML = icone(ver ? 'olhoFechado' : 'olho');
    b.setAttribute('aria-label', ver ? 'Ocultar senha' : 'Mostrar senha');
  });
  document.addEventListener('DOMContentLoaded', function () {
    registrarTela();
    document.querySelectorAll('.campo-senha button').forEach(function (b) { b.innerHTML = icone('olho'); });
    document.querySelectorAll('[data-icone]').forEach(function (el) { el.insertAdjacentHTML('afterbegin', icone(el.dataset.icone)); });
    mostrarAvisoPendente();
  });

  window.VX = {
    db: db, salvar: salvar, restaurar: restaurar, novoId: novoId,
    hoje: hoje, parseData: parseData, isoData: isoData, diasEntre: diasEntre, fmt: fmt,
    carro: carro, nomeCarro: nomeCarro, nomeCurto: nomeCurto, manutDoCarro: manutDoCarro, finalPlaca: finalPlaca,
    pagamentosDoCarro: pagamentosDoCarro, avaliacoesDa: avaliacoesDa, notaOficina: notaOficina, minhaAvaliacao: minhaAvaliacao, pago: pago, registrarPagamento: registrarPagamento, NOME_DOC: NOME_DOC,
    alertasCarro: alertasCarro, alertas: alertas, contaAlertas: contaAlertas, marcarVisto: marcarVisto, nota: nota, textoNota: textoNota,
    esc: esc, gauge: gauge, animarGauges: animarGauges, selo: selo, tagStatus: tagStatus, NOME_TIPO: NOME_TIPO,
    icone: icone, iconeGoogle: iconeGoogle, logo: logo, iniciais: iniciais,
    shell: shell, simbolo: simbolo, atualizarBolinha: atualizarBolinha, toast: toast, avisoDepois: avisoDepois, confirmar: confirmar,
    param: param, whats: whats, lerFoto: lerFoto, anterior: anterior
  };

  /* App instalável (PWA): registra o service worker (../sw.js ou sw.js) e mostra os botões [data-instalar]
     quando o celular/navegador oferece a instalação. Só pelo servidor; pelo computador (file://) não existe. */
  (function () {
    if (!/^https?:$/.test(location.protocol) || !('serviceWorker' in navigator)) return;
    var raiz = /\/app\/[^/]*$/.test(location.pathname) ? '../' : '';
    navigator.serviceWorker.register(raiz + 'sw.js', { scope: raiz || './' }).catch(function () {});
    var pedido = null;
    function botoes(mostrar) { document.querySelectorAll('[data-instalar]').forEach(function (b) { b.hidden = !mostrar; }); }
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedido = e; botoes(true); });
    window.addEventListener('appinstalled', function () { pedido = null; botoes(false); });
    document.addEventListener('click', function (e) {
      if (!pedido || !e.target.closest('[data-instalar]')) return;
      e.preventDefault();
      pedido.prompt();
      pedido.userChoice.then(function () { pedido = null; botoes(false); });
    });
  })();
})();
