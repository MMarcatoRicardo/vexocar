/* Roda dentro de cada tela (Playwright) e devolve { css, html, classes } "congelados":
   - CSS de todas as folhas, com as media queries resolvidas para a largura W (não depende mais da janela)
     e todas as regras com escopo #ID (várias telas convivem no mesmo documento);
   - vh/vw viram px; imagens, fundos e canvas viram data URI; <use> do SVG vira o desenho em si;
   - valores digitados nos campos viram atributos. */
async ({ W, H, ID }) => {
  const toData = async (url) => {
    try {
      const r = await fetch(url, { mode: 'cors' });
      const b = await r.blob();
      return await new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); });
    } catch (e) { return url; }
  };

  function casa(m) {
    m = m.toLowerCase().trim();
    if (!m || m === 'all' || m === 'screen') return true;
    return m.split(',').some(q => {
      q = q.trim();
      if (/print|prefers-reduced-motion|hover:\s*none|pointer:\s*coarse/.test(q)) return false;
      let ok = true;
      q.replace(/min-width:\s*([\d.]+)px/g, (_, n) => { if (W < +n) ok = false; });
      q.replace(/max-width:\s*([\d.]+)px/g, (_, n) => { if (W > +n) ok = false; });
      return ok;
    });
  }
  function dividir(sel) {
    const out = []; let n = 0, cur = '';
    for (const ch of sel) {
      if (ch === '(') n++; if (ch === ')') n--;
      if (ch === ',' && !n) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur); return out.map(s => s.trim()).filter(Boolean);
  }
  function escopo(sel) {
    return dividir(sel).map(s => {
      s = s.replace(/^(html|:root)(?![\w-])/, '#' + ID);
      s = s.replace(new RegExp('^#' + ID + '\\s+body(?![\\w-])'), '#' + ID).replace(/^body(?![\w-])/, '#' + ID);
      if (s.startsWith('#' + ID)) return s;
      // classe que estava no <body> (ex.: .shell .conteudo) agora está no próprio quadro da tela
      return '#' + ID + ' ' + s + (/^[.\[]/.test(s) ? ', #' + ID + s : '');
    }).join(', ');
  }
  const unidades = t => t.replace(/(-?[\d.]+)d?s?vh\b/g, (_, n) => (n * H / 100).toFixed(1) + 'px')
                         .replace(/(-?[\d.]+)vw\b/g, (_, n) => (n * W / 100).toFixed(1) + 'px');
  const urls = [];
  function regras(lista, base) {
    let out = '';
    for (const r of lista) {
      if (r instanceof CSSMediaRule) { if (casa(r.media.mediaText)) out += regras(r.cssRules, base); }
      else if (typeof CSSSupportsRule !== 'undefined' && r instanceof CSSSupportsRule) { if (CSS.supports(r.conditionText)) out += regras(r.cssRules, base); }
      else if (r instanceof CSSStyleRule) {
        let txt = unidades(r.style.cssText);
        txt = txt.replace(/url\("?([^")]+)"?\)/g, (m, u) => { if (u.startsWith('data:')) return m; const abs = new URL(u, base).href; urls.push(abs); return 'url("' + abs + '")'; });
        out += escopo(r.selectorText) + ' { ' + txt + ' }\n';
        if (r.cssRules && r.cssRules.length) out += regras(r.cssRules, base);
      }
      else if (r instanceof CSSKeyframesRule) out += r.cssText + '\n';
    }
    return out;
  }
  let css = '';
  for (const s of [...document.styleSheets]) {
    if (s.href && /fonts\.googleapis/.test(s.href)) continue;
    let lista;
    try { lista = s.cssRules; } catch (e) {
      try { const t = await (await fetch(s.href)).text(); const st = new CSSStyleSheet(); st.replaceSync(t); lista = st.cssRules; } catch (e2) { continue; }
    }
    css += regras(lista, s.href || location.href);
  }
  for (const u of [...new Set(urls)]) { const d = await toData(u); css = css.split('url("' + u + '")').join('url("' + d + '")'); }

  // Campos: o valor digitado vira atributo
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) el.setAttribute('checked', ''); else el.removeAttribute('checked'); }
    else if (el.tagName === 'SELECT') [...el.options].forEach(o => o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'));
    else if (el.tagName === 'TEXTAREA') el.textContent = el.value;
    else if (el.type !== 'file') el.setAttribute('value', el.value);
  });
  // Canvas (QR code) vira imagem
  document.querySelectorAll('canvas').forEach(c => {
    try { const i = document.createElement('img'); i.src = c.toDataURL(); i.style.cssText = c.style.cssText; i.width = c.width; i.height = c.height; i.className = c.className; c.replaceWith(i); } catch (e) {}
  });

  // Velocímetros: o Figma não entende pathLength nem o tamanho dado pelo CSS ao SVG.
  // Redesenha cada um com o arco exato da nota, tamanho e cores escritos no próprio SVG (sem tracejado).
  document.querySelectorAll('.gauge[data-nota] svg, .gauge svg').forEach(svg => {
    const g = svg.closest('.gauge'), n = Math.max(0, Math.min(100, parseFloat(g.dataset.nota) || 0));
    const fundo = svg.querySelector('.g-fundo'), valor = svg.querySelector('.g-valor') || svg.querySelectorAll('path')[1];
    if (!fundo || !valor) return;
    const r = svg.getBoundingClientRect();
    svg.setAttribute('width', r.width.toFixed(1)); svg.setAttribute('height', r.height.toFixed(1));
    svg.setAttribute('viewBox', '0 0 120 70'); svg.setAttribute('fill', 'none');
    [fundo, valor].forEach(el => {
      const cs = getComputedStyle(el);
      el.setAttribute('stroke', cs.stroke); el.setAttribute('stroke-width', parseFloat(cs.strokeWidth));
      el.setAttribute('stroke-linecap', cs.strokeLinecap); el.setAttribute('fill', 'none');
      el.removeAttribute('class'); el.removeAttribute('pathLength'); el.removeAttribute('style');
    });
    const a = Math.PI * n / 100, x = 60 - 50 * Math.cos(a), y = 64 - 50 * Math.sin(a);
    if (n <= 0) valor.remove(); else valor.setAttribute('d', 'M10 64 A50 50 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2));
    svg.removeAttribute('class'); svg.style.cssText = 'width:' + r.width.toFixed(1) + 'px;height:' + r.height.toFixed(1) + 'px';
  });
  // Velocímetros e o "V" do logo viram PNG 3x: o Figma desenha esses SVGs no tamanho errado.
  async function rasterizar(svg) {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const c = svg.cloneNode(true);
    c.querySelectorAll('use').forEach(u => {
      const sym = document.querySelector(u.getAttribute('href') || u.getAttribute('xlink:href'));
      if (!sym) return;
      if (sym.getAttribute('viewBox')) c.setAttribute('viewBox', sym.getAttribute('viewBox'));
      [...sym.childNodes].forEach(n => u.parentNode.insertBefore(n.cloneNode(true), u));
      u.remove();
    });
    // partes escondidas pelo CSS (ex.: faixa do V em tamanho pequeno)
    const orig = [...svg.querySelectorAll('*')], doClone = [...c.querySelectorAll('*')];
    const escondeFaixa = svg.closest('.wm-p, .selo');
    if (escondeFaixa) c.querySelectorAll('.faixa').forEach(e => e.remove());
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    c.setAttribute('width', r.width); c.setAttribute('height', r.height);
    c.style.color = getComputedStyle(svg).color;
    const txt = new XMLSerializer().serializeToString(c);
    const img = new Image();
    await new Promise(ok => { img.onload = ok; img.onerror = ok; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt); });
    const cv = document.createElement('canvas'); cv.width = Math.ceil(r.width * 3); cv.height = Math.ceil(r.height * 3);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    const png = document.createElement('img');
    png.src = cv.toDataURL('image/png');
    const cs = getComputedStyle(svg);
    png.style.cssText = `width:${r.width}px;height:${r.height}px;display:${cs.display === 'inline' ? 'inline-block' : cs.display};margin:${cs.margin};vertical-align:${cs.verticalAlign};flex:none;position:${cs.position};top:${cs.top};left:${cs.left};right:${cs.right};bottom:${cs.bottom}`;
    png.setAttribute('alt', '');
    svg.replaceWith(png);
  }
  for (const svg of [...document.querySelectorAll('.gauge svg, svg')].filter((s, i, a) => a.indexOf(s) === i)) {
    if (svg.closest('.gauge') || svg.querySelector('use[href="#v"]')) await rasterizar(svg);
  }
  // O que está escondido na tela (hidden, display:none) sai do documento: o Figma não respeita o atributo hidden
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest('svg')) return;
    if (getComputedStyle(el).display === 'none') el.setAttribute('data-oculto', '');
  });
  const corpo = document.body.cloneNode(true);
  corpo.querySelectorAll('script, noscript, .toast, .janela-fundo, [data-oculto]').forEach(e => e.remove());
  // <use href="#v"> -> desenho do símbolo
  corpo.querySelectorAll('use').forEach(u => {
    const ref = u.getAttribute('href') || u.getAttribute('xlink:href');
    const sym = ref && document.querySelector(ref);
    const svg = u.closest('svg');
    if (!sym || !svg) return;
    if (!svg.getAttribute('viewBox') && sym.getAttribute('viewBox')) svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
    [...sym.childNodes].forEach(n => svg.insertBefore(n.cloneNode(true), u));
    u.remove();
  });
  corpo.querySelectorAll('symbol').forEach(s => { const svg = s.closest('svg'); if (svg && svg.querySelectorAll('symbol').length === svg.children.length) svg.remove(); });
  // imagens -> data URI
  for (const img of corpo.querySelectorAll('img')) {
    const src = img.currentSrc || img.src;
    if (src && !src.startsWith('data:')) img.setAttribute('src', await toData(new URL(src, location.href).href));
    img.removeAttribute('srcset'); img.removeAttribute('loading');
  }
  // primeiro as medidas (vh/vw), depois as imagens: o texto base64 da imagem não pode passar pela troca de unidades
  corpo.querySelectorAll('[style]').forEach(el => { const st = el.getAttribute('style'); if (!st.includes('data:')) el.setAttribute('style', unidades(st)); });
  for (const el of corpo.querySelectorAll('[style*="url("]')) {
    let st = el.getAttribute('style'); const ms = [...st.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
    for (const m of ms) if (!m[1].startsWith('data:')) st = st.split(m[1]).join(await toData(new URL(m[1], location.href).href));
    el.setAttribute('style', st);
  }
  return { css, html: corpo.innerHTML, classes: (document.documentElement.className + ' ' + document.body.className).trim() };
}
