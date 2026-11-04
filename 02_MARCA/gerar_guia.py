"""Gera o guia da marca VEXOcar (marca_guia.html) e os SVGs do símbolo.

Rodar: python gerar_guia.py  (dentro de 02_MARCA)
"""
from pathlib import Path

AQUI = Path(__file__).parent

GRAFITE, GRAFITE2, LINHA = "#0E0F11", "#1A1C20", "#2A2D33"
OFF, VERDE, VERDE_ESC, AMBAR, CINZA, ERRO = "#F2F1EC", "#2FD47A", "#13914E", "#F5A524", "#8A8F98", "#E5484D"

TEMAS = {
    "escuro": dict(esq=OFF, dir=VERDE, faixa=GRAFITE, txt=OFF, car=VERDE),
    "claro": dict(esq=GRAFITE, dir=VERDE_ESC, faixa=OFF, txt=GRAFITE, car=VERDE_ESC),
    "mono": dict(esq=OFF, dir=OFF, faixa=GRAFITE, txt=OFF, car=OFF),
    "verde": dict(esq=GRAFITE, dir=GRAFITE, faixa=VERDE, txt=GRAFITE, car=GRAFITE),
}


def v_svg(w, h, t, faixa=True, extra=""):
    """O V de pista. viewBox justo (18 20 84 80)."""
    linha = (f'<line x1="91.6" y1="23" x2="66.2" y2="97" stroke="{t["faixa"]}" '
             f'stroke-width="2.8" stroke-dasharray="8 6"/>') if faixa else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.1f}" height="{h:.1f}" viewBox="18 20 84 80" {extra}>'
            f'<polygon points="18,20 37,20 60,78 60,100 50,100" fill="{t["esq"]}"/>'
            f'<polygon points="83,20 102,20 70,100 60,100 60,78" fill="{t["dir"]}"/>{linha}</svg>')


def logo(fs, tema="escuro"):
    t = TEMAS[tema]
    cap = fs * 0.71
    return (f'<div class="wm" style="font-size:{fs}px;color:{t["txt"]}">'
            f'{v_svg(cap * 1.02, cap, t, faixa=cap >= 17, extra=f"style=margin-right:{fs*0.03:.1f}px")}'
            f'EXO<span style="color:{t["car"]}">car</span></div>')


def icone(px, fundo=GRAFITE, tema="escuro", raio=0.23):
    t = TEMAS[tema]
    s = px * 0.56
    borda = f"border:1px solid {LINHA};" if fundo == GRAFITE else ""
    return (f'<div class="ico" style="width:{px}px;height:{px}px;border-radius:{px*raio:.0f}px;background:{fundo};{borda}">'
            f'{v_svg(s * 1.05, s, t, faixa=s >= 17)}</div>')


def cor(nome, hexa, uso, pct=None, claro=False):
    return (f'<div class="cor"><div class="amostra" style="background:{hexa};{"border:1px solid " + LINHA if not claro else ""}"></div>'
            f'<div class="cn">{nome}</div><div class="ch">{hexa}{" · " + pct if pct else ""}</div><div class="cu">{uso}</div></div>')


def tipo(nome, fonte, tam, peso, amostra, uso):
    fam = "Audiowide" if fonte == "Audiowide" else "Inter"
    return (f'<div class="tipo"><div class="tmeta"><b>{nome}</b><span>{fonte} {peso} · {tam}px</span><span>{uso}</span></div>'
            f'<div class="tam" style="font-family:{fam};font-size:{tam}px;font-weight:{ {"Regular": 400, "Medium": 500, "SemiBold": 600, "Bold": 700}.get(peso, 400) }">{amostra}</div></div>')


CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:{GRAFITE};color:{OFF};font-family:Inter,sans-serif;width:1440px}}
.sec{{padding:72px 96px;border-bottom:1px solid {LINHA}}}
.k{{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:{VERDE};font-weight:600;margin-bottom:12px}}
h2{{font-family:Audiowide;font-weight:400;font-size:36px;margin-bottom:12px}}
.lead{{font-size:17px;color:{CINZA};line-height:1.55;max-width:760px;margin-bottom:40px}}
.wm{{font-family:Audiowide;line-height:1;white-space:nowrap;display:inline-flex;align-items:baseline}}
.wm svg{{flex:none}}
.ico{{display:flex;align-items:center;justify-content:center;flex:none}}
.capa{{height:640px;display:flex;flex-direction:column;justify-content:center;padding:0 96px;background:{GRAFITE};border-bottom:1px solid {LINHA}}}
.capa .tag{{font-size:22px;color:{CINZA};margin-top:28px}}
.capa .meta{{margin-top:64px;font-size:13px;color:{CINZA};letter-spacing:.06em;text-transform:uppercase}}
.g2{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.g4{{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}}
.tile{{border:1px solid {LINHA};border-radius:16px;padding:48px 44px;min-height:220px;display:flex;flex-direction:column;justify-content:space-between;gap:28px}}
.tl{{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:{CINZA}}}
.claro .tl,.verde .tl{{color:#4A4D52}}
.row{{display:flex;align-items:flex-end;gap:40px;flex-wrap:wrap}}
.nota{{font-size:13px;color:{CINZA};margin-top:10px;line-height:1.5}}
.cor .amostra{{height:120px;border-radius:12px;margin-bottom:14px}}
.cn{{font-weight:600;font-size:16px}} .ch{{font-size:13px;color:{CINZA};margin-top:4px;font-variant-numeric:tabular-nums}} .cu{{font-size:14px;color:{CINZA};margin-top:8px;line-height:1.45}}
.tipo{{display:grid;grid-template-columns:260px 1fr;gap:32px;align-items:baseline;padding:22px 0;border-top:1px solid {LINHA}}}
.tmeta{{display:flex;flex-direction:column;gap:4px;font-size:13px;color:{CINZA}}} .tmeta b{{color:{OFF};font-size:15px;font-weight:600}}
.regras{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.regra{{border:1px solid {LINHA};border-radius:16px;padding:28px 32px}}
.regra h3{{font-size:16px;font-weight:600;margin-bottom:16px;display:flex;gap:10px;align-items:center}}
.regra li{{font-size:15px;color:{CINZA};line-height:1.5;margin:0 0 10px 20px}}
.dot{{width:10px;height:10px;border-radius:50%;display:inline-block}}
.card{{background:{GRAFITE2};border:1px solid {LINHA};border-radius:16px;padding:24px;width:380px}}
.btn{{display:inline-block;background:{VERDE};color:{GRAFITE};font-weight:600;font-size:15px;padding:13px 22px;border-radius:10px}}
.btn2{{display:inline-block;border:1px solid {LINHA};color:{OFF};font-weight:500;font-size:15px;padding:12px 22px;border-radius:10px}}
.alerta{{display:flex;gap:12px;align-items:center;background:rgba(245,165,36,.10);border:1px solid rgba(245,165,36,.35);color:{AMBAR};border-radius:12px;padding:14px 16px;font-size:14px;font-weight:500}}
"""

html = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>VEXOcar - guia da marca</title>
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600;700&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>

<section class="capa">
  {logo(128)}
  <div class="tag">O prontuário digital do seu carro.</div>
  <div class="meta">Guia da marca · v1 · novembro de 2026 · Projeto Integrador, Design Profissional</div>
</section>

<section class="sec">
  <div class="k">01 · Logo</div>
  <h2>O V de pista</h2>
  <p class="lead">O "V" de VEXO é uma estrada: a perna esquerda é o carro, a direita é a pista verde com a faixa tracejada.
  Ele é o próprio V do nome, nunca um ícone colado ao lado.</p>
  <div class="g2">
    <div class="tile" style="background:{GRAFITE}"><div class="tl">Principal · fundo escuro</div>{logo(72)}</div>
    <div class="tile claro" style="background:{OFF}"><div class="tl">Fundo claro</div>{logo(72, "claro")}</div>
    <div class="tile" style="background:{GRAFITE2}"><div class="tl">Monocromático · uma cor só</div>{logo(56, "mono")}</div>
    <div class="tile verde" style="background:{VERDE};border:0"><div class="tl">Sobre o verde · capa, banner</div>{logo(56, "verde")}</div>
  </div>
</section>

<section class="sec">
  <div class="k">02 · Tamanhos e respiro</div>
  <h2>Pequeno, sem perder a pista</h2>
  <p class="lead">Abaixo de 24 px de altura de letra a faixa tracejada sai: ela vira borrão. Deixe ao redor do logo um respiro
  igual à altura do "E", sem texto nem imagem encostando.</p>
  <div class="row">
    <div>{logo(72)}<div class="nota">72 px · títulos, capa</div></div>
    <div>{logo(40)}<div class="nota">40 px · cabeçalho do site</div></div>
    <div>{logo(24)}<div class="nota">24 px · menu do app (sem faixa)</div></div>
    <div>{logo(16)}<div class="nota">16 px · mínimo</div></div>
  </div>
</section>

<section class="sec">
  <div class="k">03 · Ícone</div>
  <h2>Só o V, onde o nome não cabe</h2>
  <p class="lead">No ícone do app, na aba do navegador e no avatar das redes sociais usamos só o V.</p>
  <div class="row">
    <div>{icone(160)}<div class="nota">App · padrão</div></div>
    <div>{icone(160, VERDE, "verde")}<div class="nota">App · verde</div></div>
    <div>{icone(160, OFF, "claro")}<div class="nota">App · claro</div></div>
    <div>{icone(160, GRAFITE, "escuro", raio=0.5)}<div class="nota">Avatar · redondo</div></div>
    <div>{icone(48)}<div class="nota">48 px</div></div>
    <div>{icone(32)}<div class="nota">32 px · aba</div></div>
    <div>{icone(16, raio=0.2)}<div class="nota">16 px</div></div>
  </div>
</section>

<section class="sec">
  <div class="k">04 · Cores</div>
  <h2>Grafite, off-white e uma pista verde</h2>
  <p class="lead">Fundo escuro na maior parte, texto claro, e o verde só onde importa: ação principal e dado positivo.
  O âmbar aparece apenas em alerta (revisão vencendo, IPVA). Vermelho só em erro.</p>
  <div class="g4">
    {cor("Grafite", GRAFITE, "Fundo principal do site e do app.", "70%")}
    {cor("Off-white", OFF, "Texto, perna esquerda do V, fundo claro.", "20%", claro=True)}
    {cor("Verde-pista", VERDE, "Botão principal, links, dado positivo, perna direita do V.", "8%", claro=True)}
    {cor("Âmbar", AMBAR, "Somente alertas: revisão, IPVA, licenciamento.", "2%", claro=True)}
  </div>
  <div class="g4" style="margin-top:28px">
    {cor("Grafite 2", GRAFITE2, "Cartões e superfícies acima do fundo.")}
    {cor("Linha", LINHA, "Bordas e divisórias.")}
    {cor("Cinza", CINZA, "Texto secundário, legendas.", claro=True)}
    {cor("Verde escuro", VERDE_ESC, "Verde sobre fundo claro (contraste).", claro=True)}
  </div>
</section>

<section class="sec">
  <div class="k">05 · Tipografia</div>
  <h2>Audiowide para gritar, Inter para conversar</h2>
  <p class="lead">Audiowide é a voz da marca: só no logo, títulos grandes e chamadas. Todo o resto, inclusive números,
  é Inter, que é feita para leitura em tela.</p>
  {tipo("Display", "Audiowide", 56, "Regular", "Seu carro tem história", "Landing, capa")}
  {tipo("Título 1", "Audiowide", 36, "Regular", "Minha garagem", "Título de página")}
  {tipo("Título 2", "Audiowide", 24, "Regular", "Próximas manutenções", "Seção")}
  {tipo("Título 3", "Inter", 20, "SemiBold", "Honda Civic EXL 2019", "Cartão, item")}
  {tipo("Corpo", "Inter", 16, "Regular", "Troca de óleo e filtro feita na Oficina do Zé, com nota fiscal anexada.", "Texto corrido")}
  {tipo("Número", "Inter", 32, "SemiBold", "48.320 km · R$ 389,90", "Km, valores, datas")}
  {tipo("Legenda", "Inter", 13, "Medium", "ÚLTIMA REVISÃO HÁ 4 MESES", "Rótulos, metadados")}
</section>

<section class="sec">
  <div class="k">06 · Em uso</div>
  <h2>Como a marca aparece no sistema</h2>
  <p class="lead">Interface limpa e escura, foto só quando ela é conteúdo (o carro). Animações curtas, de 150 a 250 ms.</p>
  <div class="row" style="align-items:flex-start;gap:32px">
    <div class="card">
      <div style="font-size:12px;color:{CINZA};letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">Minha garagem</div>
      <div style="font-size:20px;font-weight:600">Honda Civic EXL 2019</div>
      <div style="font-size:14px;color:{CINZA};margin-top:4px">ABC-1D23 · 48.320 km</div>
      <div style="margin:20px 0;display:flex;gap:28px">
        <div><div style="font-size:28px;font-weight:600;color:{VERDE}">92</div><div style="font-size:12px;color:{CINZA}">nota de saúde</div></div>
        <div><div style="font-size:28px;font-weight:600">14</div><div style="font-size:12px;color:{CINZA}">manutenções</div></div>
      </div>
      <div class="alerta">⚠ Revisão dos 50.000 km em 1.680 km</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="btn">Registrar manutenção</div>
      <div class="btn2">Ver histórico em PDF</div>
    </div>
  </div>
</section>

<section class="sec" style="border:0">
  <div class="k">07 · Regras</div>
  <h2>Faça e não faça</h2>
  <div class="regras">
    <div class="regra"><h3><span class="dot" style="background:{VERDE}"></span>Faça</h3><ul>
      <li>Use o logo inteiro sempre que houver espaço.</li>
      <li>Use só o V (ícone) quando o espaço for quadrado ou pequeno.</li>
      <li>Escreva o nome como VEXOcar: VEXO em maiúsculas, car em minúsculas.</li>
      <li>Use Inter em números, tabelas e textos longos.</li></ul></div>
    <div class="regra"><h3><span class="dot" style="background:{ERRO}"></span>Não faça</h3><ul>
      <li>Não estique, não incline e não gire o logo.</li>
      <li>Não troque as cores do V (a perna verde é sempre a da direita).</li>
      <li>Não use a faixa tracejada abaixo de 24 px.</li>
      <li>Não use Audiowide em parágrafos, botões ou números.</li>
      <li>Não use âmbar fora de alerta, nem verde como fundo de tela inteira no sistema.</li></ul></div>
  </div>
</section>
</body></html>"""

(AQUI / "marca_guia.html").write_text(html, encoding="utf-8")

# SVGs soltos para o código (favicon, ícone do app)
(AQUI / "vexocar-v.svg").write_text(v_svg(84, 80, TEMAS["escuro"]), encoding="utf-8")
(AQUI / "vexocar-v-claro.svg").write_text(v_svg(84, 80, TEMAS["claro"]), encoding="utf-8")
icone_app = ('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
             f'<rect width="512" height="512" rx="118" fill="{GRAFITE}"/>'
             f'<g transform="translate(105 112) scale(3.6)"><g transform="translate(-18 -20)">'
             f'<polygon points="18,20 37,20 60,78 60,100 50,100" fill="{OFF}"/>'
             f'<polygon points="83,20 102,20 70,100 60,100 60,78" fill="{VERDE}"/>'
             f'<line x1="91.6" y1="23" x2="66.2" y2="97" stroke="{GRAFITE}" stroke-width="2.8" stroke-dasharray="8 6"/>'
             '</g></g></svg>')
(AQUI / "vexocar-icone-app.svg").write_text(icone_app, encoding="utf-8")
print("ok")
