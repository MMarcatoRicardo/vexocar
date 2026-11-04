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
