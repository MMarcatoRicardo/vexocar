/* VEXOcar · ligação das telas com a API (etapa 7).
   Carregado em toda tela, entre dados.js e app.js.

   Dois modos:
   - DEMONSTRAÇÃO: abrindo os arquivos direto do computador (file://) ou com ?modo=demo.
     Tudo fica no navegador, como na etapa 5. É o plano B da apresentação.
   - API: aberto por um servidor (http://localhost:3000 ou o site publicado). Login de verdade
     e os dados ficam no banco (Firestore). Para voltar ao normal depois do ?modo=demo: ?modo=api.

   Como as telas não mudam: elas continuam chamando VX.db() e VX.salvar(d).
   - VX.db() devolve a cópia local (cache) do que veio da API.
   - VX.salvar(d) compara com a última versão enviada, descobre o que mudou e coloca numa FILA
     (guardada no navegador). A fila manda para a API um pedido por vez: se a internet cair ou a
     pessoa trocar de tela no meio, nada se perde, a fila continua na próxima tela.
   - Ao abrir cada tela, o app busca o estado no servidor; se algo mudou (outro aparelho), atualiza. */
(function () {
  'use strict';

  /* ===== Endereço da API publicada (Render). Publicada na etapa 12. ===== */
  var API_PUBLICADA = 'https://vexocar.onrender.com';

  var K = { fotos: 'vx:api:fotos', modo: 'vx:modo', sessao: 'vx:sessao', cache: 'vx:api:cache', base: 'vx:api:base', fila: 'vx:api:fila', cfg: 'vx:api:cfg' };
  // Coleções que são da pessoa (as outras, como oficinas e anúncios de exemplo, só se lê)
  var COLECOES = ['carros', 'transferidos', 'manutencoes', 'pagamentos', 'meusAnuncios', 'avaliacoes'];
  var CAMPOS_PERFIL = ['usuario', 'notificacoes', 'favoritos', 'vistos'];
  var PUBLICAS = ['entrar.html', 'criar-conta.html', 'esqueci-senha.html', 'h.html', 'termos.html'];
  var PASTA_FOTO = { carros: 'carros', transferidos: 'carros', manutencoes: 'notas', meusAnuncios: 'anuncios' };

  function ler(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Qual modo? ---------- */
  var q = new URLSearchParams(location.search).get('modo');
  if (q === 'demo' || q === 'api') gravar(K.modo, q);
  var porServidor = /^https?:$/.test(location.protocol);
  var ativo = porServidor && ler(K.modo) !== 'demo';
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /^192\.168\./.test(location.hostname);
  var API = local ? location.origin : API_PUBLICADA;
  // Nome da tela com .html, aberta como garagem.html ou garagem (endereço sem .html)
  var pagina = location.pathname.split('/').pop() || 'index.html';
  if (!/\./.test(pagina)) pagina += '.html';

  // Endereço limpo: pelo servidor (GitHub Pages, Render, localhost) a barra mostra .../app/garagem, sem o .html.
  // Os dois servidores abrem o arquivo certo sem a extensão. Pelo computador (file://) precisa do .html, então fica.
  if (porServidor && /\.html$/.test(location.pathname)) {
    try { history.replaceState(history.state, '', location.pathname.replace(/\.html$/, '') + location.search + location.hash); } catch (e) {}
  }

  if (!ativo) {
    // demo: true = demonstração aberta pelo site (botão "Ver demonstração"), não pelos arquivos do computador
    window.VXAPI = { ativo: false, demo: porServidor };
    if (porServidor) seloDemo();
    return;
  }

  /* Selo da demonstração pelo site: avisa que é a conta de exemplo e tem duas saídas:
     "Criar minha conta" (?modo=api, o modo fica guardado no navegador) e "Voltar ao início" (a landing desliga a demo). */
  function seloDemo() {
    if (pagina === 'demo.html') return;
    function por() {
      var s = document.createElement('div');
      s.className = 'selo-demo';
      s.setAttribute('role', 'status');
      s.innerHTML =
        '<div class="selo-txt"><span class="selo-tag"><span class="selo-modo">Modo </span>demonstração</span>' +
          '<span class="selo-mais">Você está vendo uma conta de exemplo. Nada aqui é salvo de verdade.</span>' +
          '</div>' +
        '<div class="selo-acoes">' +
          '<a class="selo-conta" href="criar-conta.html?modo=api"><span class="selo-mais">Criar minha conta</span><span class="selo-curto">Criar conta</span></a>' +
          '<a class="selo-inicio" href="../index.html"><span class="selo-mais">← Voltar ao início</span><span class="selo-curto">Início</span></a>' +
        '</div>';
      document.body.appendChild(s);
    }
    if (document.body) por(); else document.addEventListener('DOMContentLoaded', por);
  }

  // No modo API, "hoje" é a data de verdade (na demonstração ela fica fixa em 03/11/2026)
  var agora = new Date();
  window.VX_DADOS.hoje = agora.getFullYear() + '-' + ('0' + (agora.getMonth() + 1)).slice(-2) + '-' + ('0' + agora.getDate()).slice(-2);

  /* ---------- Sessão (login) ---------- */
  function sessao() { return ler(K.sessao); }
  function limparTudo() { [K.sessao, K.cache, K.base, K.fila, K.fotos].forEach(function (k) { gravar(k, null); }); }
  function irParaLogin() {
    if (PUBLICAS.indexOf(pagina) >= 0) return;
    location.replace('entrar.html?ir=' + encodeURIComponent(pagina.replace(/\.html$/, '')));
  }
  // Tela que precisa de login e ninguém entrou: vai para o login antes de desenhar
  if (!sessao() && PUBLICAS.indexOf(pagina) < 0) irParaLogin();

  function config() {
    var c = null;
    try { c = JSON.parse(sessionStorage.getItem(K.cfg)); } catch (e) {}
    if (c) return Promise.resolve(c);
    return fetch(API + '/api/config').then(function (r) { return r.json(); }).then(function (j) {
      try { sessionStorage.setItem(K.cfg, JSON.stringify(j)); } catch (e) {}
      return j;
    });
  }

  /* Token do Firebase vale 1 hora: renova sozinho com o refresh token. */
  function token() {
    var s = sessao();
    if (!s) return Promise.reject(erroLogin());
    if (s.modo !== 'firebase' || s.exp - 60000 > Date.now()) return Promise.resolve(s.token);
    return config().then(function (c) {
      return fetch('https://securetoken.googleapis.com/v1/token?key=' + c.firebase.apiKey, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.refresh)
      });
    }).then(function (r) {
      if (!r.ok) throw erroLogin();
      return r.json();
    }).then(function (j) {
      s.token = j.id_token; s.refresh = j.refresh_token; s.exp = Date.now() + (+j.expires_in) * 1000;
      gravar(K.sessao, s);
      return s.token;
    });
  }
  function erroLogin() { var e = new Error('Sua sessão expirou. Entre de novo.'); e.status = 401; return e; }

  /* Chamada à API com o token. Devolve o JSON da resposta; erro vem com .status e a mensagem da API. */
  function chamar(metodo, caminho, corpo, opcoes) {
    return token().then(function (t) {
      var txt = corpo === undefined ? undefined : JSON.stringify(corpo);
      return fetch(API + caminho, {
        method: metodo, body: txt,
        headers: Object.assign({ Authorization: 'Bearer ' + t }, txt ? { 'Content-Type': 'application/json' } : {}),
        keepalive: !!(opcoes && opcoes.keepalive) && (!txt || txt.length < 60000)
      });
    }).then(resposta);
  }
  function resposta(r) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      if (r.ok) return j;
      var e = new Error(j.erro || 'Erro ' + r.status); e.status = r.status; throw e;
    });
  }

  /* ---------- Dados: cache local + estado do servidor ---------- */
  function vazio() {
    var d = copia(window.VX_DADOS);
    d.carros = []; d.manutencoes = []; d.pagamentos = []; d.meusAnuncios = []; d.transferidos = []; d.favoritos = []; d.vistos = {};
    d.avaliacoes = d.avaliacoes.filter(function (v) { return !v.minha; });
    return d;
  }
  /* Junta o que veio da API com o que é fixo do app (data de hoje, contato de demonstração...). */
  function montar(estado) {
    var d = Object.assign(vazio(), estado);
    d.logado = true;
    return d;
  }
  function db() { return ler(K.cache) || vazio(); }

  function carregarEstado() {
    return chamar('GET', '/api/estado').then(function (estado) {
      var d = montar(estado);
      gravar(K.cache, d); gravar(K.base, d);
      return d;
    });
  }

  /* ---------- Fila de envio ---------- */
  function fila() { return ler(K.fila) || []; }
  function porIdMapa(lista) { var m = {}; (lista || []).forEach(function (x) { m[x.id] = x; }); return m; }
  function igual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function daPessoa(col, x) { return col !== 'avaliacoes' || x.minha; }

  /* Compara o estado novo com o último enviado e devolve a lista de pedidos para a API. */
  function diferencas(base, d) {
    var gravacoes = [], remocoes = [], perfil = {};
    COLECOES.forEach(function (col) {
      var antes = porIdMapa((base[col] || []).filter(function (x) { return daPessoa(col, x); }));
      var depois = porIdMapa((d[col] || []).filter(function (x) { return daPessoa(col, x); }));
      Object.keys(depois).forEach(function (id) {
        if (!antes[id] || !igual(antes[id], depois[id])) gravacoes.push({ m: 'PUT', p: '/api/' + col + '/' + encodeURIComponent(id), b: depois[id], col: col, id: id });
      });
      Object.keys(antes).forEach(function (id) {
        if (!depois[id]) remocoes.push({ m: 'DELETE', p: '/api/' + col + '/' + encodeURIComponent(id), col: col, id: id });
      });
    });
    CAMPOS_PERFIL.forEach(function (k) {
      if (!igual(base[k], d[k])) {
        if (k === 'usuario') Object.assign(perfil, d.usuario); else perfil[k] = d[k];
      }
    });
    var ops = gravacoes.concat(remocoes); // grava antes de apagar (ex.: transferir = cria "transferido" e tira da garagem)
    if (Object.keys(perfil).length) ops.unshift({ m: 'PATCH', p: '/api/usuario', b: perfil });
    return ops;
  }

  function salvar(d) {
    d = trocarConhecidas(d); // a tela pode ainda ter a foto em base64 que já subiu: usa o endereço
    gravar(K.cache, d);
    var base = ler(K.base) || vazio();
    var ops = diferencas(base, d);
    if (!ops.length) return;
    var f = fila();
    ops.forEach(function (op) {
      // Se o mesmo registro já está esperando na fila, troca pelo mais novo
      var i = -1;
      f.forEach(function (x, j) { if (x.p === op.p && x.m === op.m && op.m !== 'PATCH') i = j; });
      if (op.m === 'PATCH') f.forEach(function (x, j) { if (x.m === 'PATCH') { op.b = Object.assign({}, x.b, op.b); i = j; } });
      if (i >= 0) f.splice(i, 1);
      f.push(op);
    });
    gravar(K.fila, f);
    gravar(K.base, d);
    enviar();
  }

  /* Acha fotos ainda em base64 (data:image/...) dentro de um registro. */
  function fotosCruas(o, achadas) {
    achadas = achadas || [];
    if (typeof o === 'string') { if (/^data:image\/(jpeg|png|webp)/.test(o) && achadas.indexOf(o) < 0) achadas.push(o); }
    else if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { fotosCruas(o[k], achadas); });
    return achadas;
  }
  function trocar(o, de, para) {
    if (typeof o === 'string') return o === de ? para : o;
    if (Array.isArray(o)) return o.map(function (x) { return trocar(x, de, para); });
    if (o && typeof o === 'object') { var r = {}; Object.keys(o).forEach(function (k) { r[k] = trocar(o[k], de, para); }); return r; }
    return o;
  }
  /* Fotos que já subiram: { marca da foto: endereço }. Evita subir a mesma foto duas vezes. */
  function marcaFoto(dados) { return dados.length + ':' + dados.slice(23, 87) + dados.slice(-64); }
  function trocarConhecidas(o) {
    var mapa = ler(K.fotos) || {};
    fotosCruas(o).forEach(function (dados) { var url = mapa[marcaFoto(dados)]; if (url) o = trocar(o, dados, url); });
    return o;
  }
  function lembrarFoto(dados, url) {
    var mapa = ler(K.fotos) || {}, chaves = Object.keys(mapa);
    if (chaves.length > 60) delete mapa[chaves[0]];
    mapa[marcaFoto(dados)] = url;
    gravar(K.fotos, mapa);
  }

  /* Sobe as fotos do pedido para /api/fotos e troca o base64 pelo endereço (no pedido, no cache e na base). */
  function subirFotos(op) {
    var cruas = op.b ? fotosCruas(op.b) : [];
    return cruas.reduce(function (p, dados) {
      return p.then(function () {
        var ja = (ler(K.fotos) || {})[marcaFoto(dados)];
        return (ja ? Promise.resolve({ url: ja }) : chamar('POST', '/api/fotos', { dados: dados, pasta: PASTA_FOTO[op.col] || 'carros' })).then(function (r) {
          lembrarFoto(dados, r.url);
          op.b = trocar(op.b, dados, r.url);
          [K.cache, K.base].forEach(function (k) { var d = ler(k); if (d) gravar(k, trocar(d, dados, r.url)); });
          var f = fila(); f.forEach(function (x) { if (x.b) x.b = trocar(x.b, dados, r.url); }); gravar(K.fila, f);
        });
      });
    }, Promise.resolve());
  }

  var enviando = null, tentativa = null;
  function enviar() {
    if (enviando) return enviando;
    enviando = (function proximo() {
      var f = fila();
      if (!f.length) return Promise.resolve();
      var op = f[0];
      return subirFotos(op).then(function () {
        return chamar(op.m, op.p, op.b, { keepalive: true });
      }).then(function () {
        tirarDaFila(op); return proximo();
      }, function (e) {
        if (e.status === 401) { limparTudo(); irParaLogin(); throw e; }
        if (e.status >= 400 && e.status < 500) {
          // A API recusou (dado inválido): avisa e segue com o resto
          tirarDaFila(op);
          if (window.VX && VX.toast) VX.toast('Não deu para salvar: ' + e.message);
          return proximo();
        }
        // Sem internet ou servidor dormindo: tenta de novo daqui a pouco
        clearTimeout(tentativa); tentativa = setTimeout(enviar, 8000);
        throw e;
      });
    })().then(function () { enviando = null; }, function (e) { enviando = null; throw e; });
    return enviando;
  }
  function tirarDaFila(op) {
    var f = fila(), i = f.findIndex(function (x) { return x.p === op.p && x.m === op.m; });
    if (i >= 0 && igual(f[i].b, op.b)) f.splice(i, 1); // se mudou enquanto enviava, fica para mandar a versão nova
    gravar(K.fila, f);
  }

  /* Ao abrir uma tela: manda o que estava na fila e confere se o servidor tem algo mais novo. */
  function sincronizar() {
    if (!sessao() || PUBLICAS.indexOf(pagina) >= 0) return;
    enviar().then(function () {
      if (fila().length) return;
      return chamar('GET', '/api/estado').then(function (estado) {
        if (fila().length) return; // a pessoa salvou algo enquanto buscava: fica para a próxima
        var novo = montar(estado), atual = db();
        if (igual(normal(novo), normal(atual))) return;
        gravar(K.cache, novo); gravar(K.base, novo);
        // Formulário aberto não recarrega (perderia o que a pessoa digitou)
        var marca = 'vx:recarregou:' + location.href;
        if (document.body.dataset.pilha !== 'nao' && !sessionStorage.getItem(marca)) {
          sessionStorage.setItem(marca, '1');
          location.reload();
        }
      });
    }).catch(function () { /* sem internet: segue com o que tem no navegador */ });
  }
  function normal(d) {
    var r = {};
    COLECOES.concat(CAMPOS_PERFIL, ['oficinas', 'anuncios', 'anunciosComunidade']).forEach(function (k) {
      var v = d[k];
      r[k] = Array.isArray(v) && v.length && v[0] && v[0].id ? v.slice().sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }) : v;
    });
    return r;
  }
  window.addEventListener('load', function () {
    try { sessionStorage.removeItem('vx:recarregou:' + location.href); } catch (e) {}
    setTimeout(sincronizar, 50);
  });
  window.addEventListener('online', enviar);

  /* ---------- Login, cadastro e saída ---------- */
  var ERROS = {
    EMAIL_NOT_FOUND: 'E-mail ou senha incorretos.', INVALID_PASSWORD: 'E-mail ou senha incorretos.',
    INVALID_LOGIN_CREDENTIALS: 'E-mail ou senha incorretos.', EMAIL_EXISTS: 'Esse e-mail já tem conta. Entre com ele.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Muitas tentativas. Espere alguns minutos.', USER_DISABLED: 'Essa conta foi desativada.',
    INVALID_EMAIL: 'Esse e-mail não parece válido.', MISSING_PASSWORD: 'Digite sua senha.'
  };
  function erroFirebase(j) {
    var cod = String((j.error && j.error.message) || '').split(' ')[0];
    if (/^WEAK_PASSWORD/.test(cod)) return new Error('Senha fraca: use pelo menos 8 caracteres.');
    return new Error(ERROS[cod] || 'Não deu para entrar agora. Tente de novo.');
  }
  function identity(acao, corpo) {
    return config().then(function (c) {
      return fetch('https://identitytoolkit.googleapis.com/v1/accounts:' + acao + '?key=' + c.firebase.apiKey, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo)
      });
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw erroFirebase(j); return j; });
    });
  }
  function guardarSessaoFirebase(j) {
    gravar(K.sessao, { modo: 'firebase', token: j.idToken, refresh: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000, uid: j.localId, email: j.email });
  }
  function guardarSessaoLocal(j) { gravar(K.sessao, { modo: 'local', token: j.token, exp: j.exp, uid: j.uid, email: j.email }); }
  function postSemLogin(caminho, corpo) {
    return fetch(API + caminho, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }).then(resposta);
  }
  function semServidor(e) {
    if (e instanceof TypeError) throw new Error('Não consegui falar com o servidor. Confira a internet (ou se a API está ligada).');
    throw e;
  }

  function entrar(email, senha) {
    limparTudo();
    return config().then(function (c) {
      if (c.login === 'firebase') return identity('signInWithPassword', { email: email, password: senha, returnSecureToken: true }).then(guardarSessaoFirebase);
      return postSemLogin('/api/auth/entrar', { email: email, senha: senha }).then(guardarSessaoLocal);
    }).then(carregarEstado).catch(semServidor);
  }

  function criarConta(nome, email, senha, perfil) {
    limparTudo();
    return config().then(function (c) {
      if (c.login === 'firebase') {
        return identity('signUp', { email: email, password: senha, returnSecureToken: true }).then(guardarSessaoFirebase)
          .then(function () { return chamar('PATCH', '/api/usuario', { nome: nome, email: email, perfil: perfil }); });
      }
      return postSemLogin('/api/auth/criar-conta', { nome: nome, email: email, senha: senha, perfil: perfil }).then(guardarSessaoLocal);
    }).then(carregarEstado).catch(semServidor);
  }

  /* Google: precisa do Firebase (o SDK só é baixado quando a pessoa clica). */
  function carregarScript(src) {
    return new Promise(function (ok, erro) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s);
    });
  }
  function google() {
    limparTudo();
    return config().then(function (c) {
      if (c.login !== 'firebase') throw new Error('Entrar com Google precisa do Firebase ligado na API. Use e-mail e senha.');
      var v = 'https://www.gstatic.com/firebasejs/10.12.2/';
      return carregarScript(v + 'firebase-app-compat.js').then(function () { return carregarScript(v + 'firebase-auth-compat.js'); }).then(function () {
        if (!firebase.apps.length) firebase.initializeApp(c.firebase);
        return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
      });
    }).then(function (res) {
      var u = res.user;
      return u.getIdToken().then(function (t) {
        gravar(K.sessao, { modo: 'firebase', token: t, refresh: u.refreshToken, exp: Date.now() + 3300000, uid: u.uid, email: u.email });
      });
    }).then(carregarEstado).catch(function (e) {
      if (e && e.code === 'auth/popup-closed-by-user') throw new Error('Login com Google cancelado.');
      if (e && e.code === 'auth/unauthorized-domain') throw new Error('Este endereço não está liberado no Firebase (Authentication > Settings > Authorized domains).');
      return semServidor(e);
    });
  }

  function esqueciSenha(email) {
    return config().then(function (c) {
      if (c.login !== 'firebase') return { local: true }; // modo local não manda e-mail
      return identity('sendOobCode', { requestType: 'PASSWORD_RESET', email: email }).catch(function (e) {
        // Não conta para quem não tem conta se o e-mail existe ou não (segurança)
        if (/incorretos/.test(e.message)) return {};
        throw e;
      });
    }).catch(semServidor);
  }

  function sair() {
    var pendente = fila().length;
    var fim = function () { limparTudo(); try { if (window.firebase && firebase.apps.length) firebase.auth().signOut(); } catch (e) {} };
    return (pendente ? enviar().catch(function () {}) : Promise.resolve()).then(fim);
  }

  function restaurarExemplo() {
    return enviar().then(function () { return chamar('POST', '/api/exemplo'); }).then(carregarEstado);
  }

  /* Transferir o prontuário: o servidor passa o carro e o histórico para a conta do comprador
     (ou deixa esperando até ele criar a conta com aquele e-mail/WhatsApp). */
  function transferir(carroId, para, anuncioId) {
    return enviar().then(function () {
      return chamar('POST', '/api/carros/' + encodeURIComponent(carroId) + '/transferir', { para: para, anuncioId: anuncioId });
    }).then(function (r) { return carregarEstado().then(function () { return r; }); });
  }
  function visita(anuncioId) {
    var k = 'vx:visita:' + anuncioId;
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
    chamar('POST', '/api/anuncios/' + encodeURIComponent(anuncioId) + '/visita').catch(function () {});
  }

  /* Histórico público (QR code): não precisa de login. */
  function publico(id) {
    return fetch(API + '/api/publico/carros/' + encodeURIComponent(id || '')).then(resposta).then(function (j) {
      return { carros: [j.carro], manutencoes: j.manutencoes, pagamentos: j.pagamentos, vistos: {}, oficinas: [] };
    });
  }

  window.VXAPI = {
    ativo: true, endereco: API,
    db: db, salvar: salvar, enviar: enviar, carregarEstado: carregarEstado, pendentes: function () { return fila().length; },
    entrar: entrar, criarConta: criarConta, google: google, esqueciSenha: esqueciSenha, sair: sair,
    restaurarExemplo: restaurarExemplo, publico: publico, transferir: transferir, visita: visita, sessao: sessao
  };
})();
