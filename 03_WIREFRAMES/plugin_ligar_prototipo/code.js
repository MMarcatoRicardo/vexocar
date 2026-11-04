// VEXOcar - liga os botões dos 22 wireframes (modo protótipo) e cria os pontos de partida dos fluxos.
// Rodar UMA vez no arquivo "VEXOcar" (Figma desktop > Plugins > Development > VEXOcar - ligar protótipo).
// Pode rodar de novo sem problema: ele só substitui as mesmas ligações.

const ID = { 1: "6:2", 2: "7:2", 3: "8:2", 4: "9:2", 5: "10:2", 6: "11:2", 7: "12:2", 8: "13:2", 9: "14:2", 10: "15:2", 11: "16:2",
  12: "17:2", 13: "18:2", 14: "19:2", 15: "21:2", 16: "22:2", 17: "23:2", 18: "24:2", 19: "25:2", 20: "26:2", 21: "27:2", 22: "28:2" };

// [tela, texto do botão, tela de destino, opções]  inc = contém o texto; last = última ocorrência; all = todas; up = cartão inteiro
const LIGACOES = [
  [1, "Criar conta grátis", 15, { all: 1 }], [1, "Começar grátis", 15], [1, "Entrar", 2], [1, "Ver a vitrine", 9], [1, "Vitrine", 9],
  [2, "Entrar com Google", 3, { inc: 1 }], [2, "Entrar", 3, { last: 1 }], [2, "Esqueci a senha", 16], [2, "Criar conta", 15, { inc: 1, last: 1 }],
  [2, "Entrar como oficina", 13, { inc: 1 }],
  [15, "Criar com Google", 17, { inc: 1 }], [15, "Criar conta", 17, { last: 1 }], [15, "Já tem conta", 2, { inc: 1 }], [15, "‹", 2],
  [16, "Voltar ao login", 2], [16, "‹", 2], [16, "Enviar link", 2],
  [17, "Adicionar meu primeiro carro", 4],
  [4, "Salvar carro", 3], [4, "✕", 3],
  [3, "Honda Civic EXL 2019", 5, { up: 1 }], [3, "+", 6], [3, "+ Adicionar carro", 4], [3, "Revisão dos 50.000 km", 7, { inc: 1 }], [3, "Gasto do mês", 14],
  [5, "+ Manutenção", 6], [5, "Histórico PDF", 8], [5, "Anunciar na vitrine", 11], [5, "‹", 3],
  [6, "Salvar manutenção", 5], [6, "✕", 5],
  [7, "Achar oficina ›", 12], [7, "Registrar troca ›", 6],
  [8, "‹", 5], [8, "QR", 22], [8, "Baixar PDF", 22],
  [9, "Honda Civic EXL 2019", 10, { up: 1 }],
  [10, "‹", 9], [10, "ver PDF ›", 22],
  [11, "Publicar na vitrine", 10], [11, "✕", 5],
  [12, "Oficina do Zé · parceira", 19, { inc: 1 }],
  [13, "Enviar com selo", 20, { inc: 1 }],
  [18, "Sair", 1], [18, "Meus anúncios", 21], [18, "‹", 3],
  [19, "‹", 12],
  [20, "Aprovar e adicionar ao histórico", 5], [20, "‹", 3],
  [21, "Transferir prontuário", 3], [21, "Só marcar como vendido", 3], [21, "‹", 18],
  [22, "Criar minha conta", 15],
];
const NAV = { Garagem: 3, Alertas: 7, Vitrine: 9, Oficinas: 12, Gastos: 14 };

(async () => {
  try {
    const page = figma.root.children.find(p => p.name === "Wireframes");
    if (!page) throw new Error('Página "Wireframes" não encontrada. Rode no arquivo VEXOcar.');
    await figma.setCurrentPageAsync(page);
    const tops = new Set(Object.values(ID));
    const frames = {};
    for (const k in ID) {
      frames[k] = await figma.getNodeByIdAsync(ID[k]);
      if (!frames[k]) throw new Error("Tela " + k + " não encontrada (id " + ID[k] + ").");
    }
    const hot = (t, up) => {
      if (up) { let p = t; while (p.parent && !(p.type === "FRAME" && p.width >= 300 && p.width <= 360)) p = p.parent; return p; }
      const p = t.parent;
      if (p && p.type === "FRAME" && !tops.has(p.id) && p.children.length <= 3 && p.width <= 360) return p;
      return t;
    };
    const reacao = dest => ({ trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId: ID[dest], navigation: "NAVIGATE",
      transition: { type: "DISSOLVE", duration: 0.2, easing: { type: "EASE_OUT" } }, preserveScrollPosition: false }] });
    let ok = 0; const falhas = [];
    const textos = f => frames[f].findAllWithCriteria({ types: ["TEXT"] });

    for (const [f, txt, dest, o0] of LIGACOES) {
      const o = o0 || {};
      let ts = textos(f).filter(t => o.inc ? t.characters.includes(txt) : t.characters.trim() === txt);
      if (!ts.length) { falhas.push(f + ' "' + txt + '"'); continue; }
      if (o.last) ts = [ts[ts.length - 1]]; else if (!o.all) ts = [ts[0]];
      for (const t of ts) { await hot(t, o.up).setReactionsAsync([reacao(dest)]); ok++; }
    }
    for (const f of [3, 17]) {   // avatar no topo da garagem -> perfil
      const av = frames[f].findAll(n => n.type === "FRAME" && Math.round(n.width) === 36 && Math.round(n.height) === 36)[0];
      if (av) { await av.setReactionsAsync([reacao(18)]); ok++; } else falhas.push(f + " avatar");
    }
    for (const k in frames) for (const [txt, d] of Object.entries(NAV)) {   // barra de baixo
      for (const t of textos(k).filter(t => t.characters.trim() === txt && t.fontSize === 10)) { await hot(t).setReactionsAsync([reacao(d)]); ok++; }
    }
    page.flowStartingPoints = [
      { nodeId: ID[1], name: "1 · Chegar pelo site e criar conta" },
      { nodeId: ID[3], name: "2 · App no dia a dia (já logado)" },
      { nodeId: ID[9], name: "3 · Comprador na vitrine" },
      { nodeId: ID[13], name: "4 · Oficina verifica serviço" },
    ];
    figma.closePlugin("VEXOcar: " + ok + " ligações criadas" + (falhas.length ? " · não achei: " + falhas.join(", ") : " · tudo certo!"));
  } catch (e) {
    figma.closePlugin("Erro: " + e.message);
  }
})();
