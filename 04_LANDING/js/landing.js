// VEXOcar · landing page: menu sólido ao rolar, revelar seções, velocímetros, contador e paralaxe.
(function () {
  document.documentElement.classList.add('js');

  // Quem volta da demonstração ("Voltar ao início") sai dela: Entrar e Criar conta voltam a ser de verdade.
  // Abrindo do computador (file://) o app é sempre demonstração, então não muda nada.
  try { if (localStorage.getItem('vx:modo') === '"demo"') localStorage.removeItem('vx:modo'); } catch (e) {}

  // Endereço limpo: .../vexocar/index.html vira .../vexocar/ (só pelo servidor; pelo computador fica como está)
  if (/^https?:$/.test(location.protocol) && /index\.html$/.test(location.pathname)) {
    try { history.replaceState(history.state, '', location.pathname.replace(/index\.html$/, '') + location.search + location.hash); } catch (e) {}
  }
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menu fica sólido depois do topo
  const nav = document.querySelector('.nav');
  const menu = () => nav.classList.toggle('solido', window.scrollY > 40);
  menu();

  // Velocímetro: cor pela nota (verde >= 80, âmbar abaixo)
  document.querySelectorAll('.gauge').forEach(g => {
    const n = Number(g.dataset.nota);
    g.style.setProperty('--nota', n);
    g.style.setProperty('--cor', n >= 80 ? 'var(--verde)' : 'var(--ambar)');
  });

  // Contador do dado da pesquisa
  function contar(el) {
    const alvo = Number(el.dataset.alvo);
    if (calmo) { el.textContent = alvo; return; }
    const ini = performance.now(), dur = 1600;
    const passo = t => {
      const p = Math.min((t - ini) / dur, 1);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // Revelar ao rolar
  const alvos = document.querySelectorAll('.revela, .passos, .gauge');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(itens => {
      itens.forEach(i => {
        if (!i.isIntersecting) return;
        const el = i.target;
        el.classList.add(el.classList.contains('gauge') ? 'cheio' : 'visivel');
        el.querySelectorAll('.contador').forEach(contar);
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    alvos.forEach(el => io.observe(el));
  } else {
    alvos.forEach(el => el.classList.add('visivel', 'cheio'));
    document.querySelectorAll('.contador').forEach(c => (c.textContent = c.dataset.alvo));
  }

  // Paralaxe leve nas fotos de fundo
  const hero = document.querySelector('.hero-foto');
  const camadas = [...document.querySelectorAll('[data-parallax]')];
  let pedido = false;
  function paralaxe() {
    pedido = false;
    const y = window.scrollY, h = window.innerHeight;
    if (y < h) hero.style.translate = `0 ${y * 0.25}px`;
    camadas.forEach(c => {
      const r = c.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      const centro = (r.top + r.height / 2 - h / 2) / h;
      c.style.translate = `0 ${centro * -60}px`;
    });
  }
  window.addEventListener('scroll', () => {
    menu();
    if (!calmo && !pedido) { pedido = true; requestAnimationFrame(paralaxe); }
  }, { passive: true });
  if (!calmo) paralaxe();
  /* App instalável (PWA): registra o service worker (../sw.js ou sw.js) e cuida dos botões [data-instalar].
     O botão aparece sempre (menos dentro do app já instalado e pelo computador via file://, onde não dá).
     Clique: se o navegador oferece a instalação (Chrome/Edge), abre a dele; se não (iPhone, Firefox,
     Samsung Internet...), mostra o passo a passo daquele aparelho. */
  (function () {
    var instalado = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    var podeInstalar = /^https?:$/.test(location.protocol) && !instalado;
    function botoes(mostrar) { document.querySelectorAll('[data-instalar]').forEach(function (b) { b.hidden = !mostrar; }); }
    function iniciar() { botoes(podeInstalar); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
    if (!podeInstalar) return;

    var raiz = /\/app\/[^/]*$/.test(location.pathname) ? '../' : '';
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(raiz + 'sw.js', { scope: raiz || './' }).catch(function () {});
    var pedido = null;
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedido = e; });
    window.addEventListener('appinstalled', function () { pedido = null; botoes(false); });

    function passos() {
      var ua = navigator.userAgent;
      var ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
      if (ios) return ['No iPhone', ['Abra este site no <b>Safari</b>.', 'Toque em <b>Compartilhar</b> (o quadrado com a seta para cima).',
        'Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.']];
      if (/android/i.test(ua)) return ['No Android', ['Toque no menu <b>⋮</b> do navegador (canto de cima).',
        'Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.', 'Confirme em <b>Instalar</b>.']];
      return ['No computador', ['Abra no <b>Chrome</b> ou no <b>Edge</b>.',
        'Clique no ícone de instalar, à direita da barra de endereço (ou no menu <b>⋮</b> &gt; <b>Instalar VEXOcar</b>).', 'Confirme em <b>Instalar</b>.']];
    }
    function janela() {
      var p = passos(), d = document.createElement('dialog');
      d.setAttribute('aria-label', 'Instalar o VEXOcar');
      d.style.cssText = 'position:fixed;inset:0;margin:auto;height:fit-content;max-height:calc(100% - 32px);overflow:auto;box-sizing:border-box;max-width:380px;width:calc(100% - 32px);padding:28px 24px 22px;border:1px solid #2A2D33;border-radius:20px;' +
        'background:#1A1C20;color:#F2F1EC;font-family:Inter,system-ui,sans-serif;box-shadow:0 24px 80px rgba(0,0,0,.6)';
      d.innerHTML = '<style>dialog::backdrop{background:rgba(0,0,0,.65);backdrop-filter:blur(4px)}</style>' +
        '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px"><img src="' + raiz + 'img/app/icone-192.png" alt="" width="52" height="52" style="border-radius:13px">' +
        '<div><p style="margin:0;font-size:18px;font-weight:700">Instalar o VEXOcar</p><p style="margin:2px 0 0;color:#8A8F98;font-size:14px">' + p[0] + ', em 3 passos</p></div></div>' +
        '<ol style="margin:0 0 22px;padding-left:22px;line-height:1.55;font-size:15px;color:rgba(242,241,236,.85)">' +
        p[1].map(function (t) { return '<li style="margin-bottom:8px">' + t + '</li>'; }).join('') + '</ol>' +
        '<button type="button" style="width:100%;height:46px;border:0;border-radius:999px;background:#2FD47A;color:#0E0F11;font:inherit;font-weight:700;cursor:pointer">Entendi</button>';
      document.body.appendChild(d);
      d.querySelector('button').addEventListener('click', function () { d.close(); });
      d.addEventListener('close', function () { d.remove(); });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-instalar]')) return;
      e.preventDefault();
      if (pedido) { pedido.prompt(); pedido.userChoice.then(function (r) { pedido = null; if (r.outcome === 'accepted') botoes(false); }); }
      else janela();
    });
  })();
})();
