"""Gera os wireframes de baixa fidelidade do VEXOcar (wireframes.html).

Cada tela fica num <div class="tela"> (vira um frame próprio no Figma via html_to_figma, cssSelector ".tela").
Todos os SVGs têm viewBox igual ao tamanho em px (a conversão para o Figma não reescala viewBox).
Rodar: python gerar_wireframes.py
"""
from pathlib import Path

AQUI = Path(__file__).parent
L, T, T2, BG, FILL = "#9A9A9A", "#2B2B2B", "#8C8C8C", "#FFFFFF", "#EDEDED"
W = 350  # largura útil do celular (390 - 2x20)


def ph(w, h, label="", r=8):
    """Placeholder de imagem: caixa com X."""
    return (f'<div class="ph" style="width:{w}px;height:{h}px;border-radius:{r}px">'
            f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}"><line x1="0" y1="0" x2="{w}" y2="{h}" stroke="#C4C4C4" stroke-width="1"/>'
            f'<line x1="{w}" y1="0" x2="0" y2="{h}" stroke="#C4C4C4" stroke-width="1"/></svg>'
            f'{f"<span>{label}</span>" if label else ""}</div>')


def gauge(s, nota="92"):
    """Velocímetro da nota de saúde (meia-lua)."""
    r = s / 2 - 6
    cx, cy = s / 2, s / 2
    return (f'<div class="gauge" style="width:{s}px;height:{s/2+18:.0f}px">'
            f'<svg width="{s}" height="{s/2+6:.0f}" viewBox="0 0 {s} {s/2+6:.0f}">'
            f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {cx+r} {cy}" fill="none" stroke="#D6D6D6" stroke-width="8"/>'
            f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {cx+r*0.82:.1f} {cy-r*0.57:.1f}" fill="none" stroke="#555" stroke-width="8"/>'
            f'</svg><div class="gn">{nota}</div></div>')


def btn(t, tipo="p", w=None):
    st = f"width:{w}px;" if w else ""
    return f'<div class="btn {tipo}" style="{st}">{t}</div>'


def campo(rot, val="", w=W):
    return f'<div class="campo" style="width:{w}px"><div class="cr">{rot}</div><div class="ci">{val}</div></div>'


def chips(*itens, ativo=0):
    return '<div class="chips">' + "".join(f'<div class="chip{" on" if i == ativo else ""}">{t}</div>' for i, t in enumerate(itens)) + "</div>"


def topo(titulo, esq="‹", dir_=""):
    return f'<div class="topo"><span class="ti">{esq}</span><b>{titulo}</b><span class="ti">{dir_}</span></div>'


def nav(ativo):
    itens = ["Garagem", "Alertas", "Vitrine", "Oficinas", "Gastos"]
    return ('<div class="nav">' + "".join(
        f'<div class="ni{" on" if t == ativo else ""}"><div class="nic"></div>{t}</div>' for t in itens) + "</div>")


def linha(w, h=8, cor="#D9D9D9"):
    return f'<div style="width:{w}px;height:{h}px;border-radius:4px;background:{cor}"></div>'


def tela(num, titulo, nivel, nota, corpo, larg=390, alt=844, celular=True):
    moldura = "cel" if celular else "desk"
    return f'''
<div class="tela" style="width:{larg + 48}px">
  <div class="th"><span class="tn">{num:02d}</span><b>{titulo}</b><span class="tag">{nivel}</span></div>
  <div class="{moldura}" style="width:{larg}px;min-height:{alt}px">{corpo}</div>
  <div class="tnota">{nota}</div>
</div>'''


def caixa(conteudo, extra=""):
    return f'<div class="box" style="{extra}">{conteudo}</div>'


CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#F4F4F4;font-family:Inter,sans-serif;color:{T};padding:40px;display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start;width:3000px}}
.tela{{background:#fff;border:1px solid #DADADA;border-radius:16px;padding:24px}}
.th{{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:18px}}
.tn{{font-size:13px;font-weight:700;background:{T};color:#fff;border-radius:6px;padding:3px 7px}}
.tag{{margin-left:auto;font-size:11px;border:1px solid {L};color:{T2};border-radius:20px;padding:3px 9px;letter-spacing:.03em}}
.tnota{{font-size:13px;color:{T2};line-height:1.5;margin-top:14px;max-width:100%}}
.cel{{border:2px solid {L};border-radius:36px;padding:14px 20px 0;position:relative;display:flex;flex-direction:column;gap:14px;background:{BG};overflow:hidden}}
.desk{{border:2px solid {L};border-radius:10px;background:{BG};display:flex;flex-direction:column}}
.sb{{display:flex;justify-content:space-between;font-size:11px;color:{T2};padding:0 8px}}
.topo{{display:flex;justify-content:space-between;align-items:center;font-size:17px;padding:4px 0}}
.ti{{font-size:20px;color:{T2};min-width:28px;white-space:nowrap}}
.ph{{background:{FILL};position:relative;overflow:hidden;flex:none;display:flex;align-items:center;justify-content:center}}
.ph svg{{position:absolute;left:0;top:0}}
.ph span{{position:relative;background:{FILL};font-size:11px;color:{T2};padding:2px 6px;border-radius:4px}}
.btn{{border-radius:10px;padding:13px 16px;font-size:14px;font-weight:600;text-align:center}}
.btn.p{{background:{T};color:#fff}} .btn.s{{border:1.5px solid {T};color:{T}}} .btn.g{{border:1px solid #CFCFCF;color:{T}}}
.campo{{display:flex;flex-direction:column;gap:6px}} .cr{{font-size:12px;color:{T2}}}
.ci{{border:1.5px solid #CFCFCF;border-radius:8px;height:44px;padding:12px;font-size:14px;color:{T}}}
.chips{{display:flex;gap:8px;flex-wrap:wrap}} .chip{{border:1px solid #CFCFCF;border-radius:20px;padding:6px 12px;font-size:12px}}
.chip.on{{background:{T};color:#fff;border-color:{T}}}
.nav{{margin-top:auto;border-top:1px solid #DADADA;display:flex;justify-content:space-around;padding:10px 0 22px;margin-left:-20px;margin-right:-20px}}
.ni{{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:{T2}}} .ni.on{{color:{T};font-weight:700}}
.nic{{width:22px;height:22px;border-radius:6px;border:1.5px solid currentColor}}
.box{{border:1.5px solid #CFCFCF;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px}}
.row{{display:flex;gap:12px;align-items:center}} .sp{{justify-content:space-between}}
.h1{{font-size:24px;font-weight:700}} .h2{{font-size:16px;font-weight:700}} .p{{font-size:13px;color:{T2};line-height:1.45}}
.sm{{font-size:12px;color:{T2}}} .b{{font-weight:700}}
.alerta{{border:1.5px dashed {T};border-radius:10px;padding:10px 12px;font-size:13px;display:flex;gap:8px;align-items:center}}
.gauge{{position:relative;flex:none}} .gn{{position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:20px;font-weight:700}}
.tl{{display:flex;flex-direction:column;gap:0;border-left:2px solid #CFCFCF;margin-left:6px;padding-left:16px}}
.tli{{position:relative;padding:8px 0}} .tli:before{{content:"";position:absolute;left:-23px;top:13px;width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid {T}}}
.selo{{display:inline-block;border:1.5px solid {T};border-radius:6px;font-size:11px;font-weight:700;padding:3px 7px}}
.lp-nav{{display:flex;align-items:center;gap:32px;padding:22px 48px;border-bottom:1px solid #DADADA;font-size:14px}}
.lp-sec{{padding:56px 48px;border-bottom:1px solid #E3E3E3;display:flex;flex-direction:column;gap:24px}}
.cols{{display:flex;gap:24px}}
.fab{{position:absolute;right:20px;bottom:86px;width:56px;height:56px;border-radius:16px;background:{T};color:#fff;font-size:28px;display:flex;align-items:center;justify-content:center}}
"""

SB = '<div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div>'

telas = []

# 01 Landing (desktop)
lp = f'''
<div class="lp-nav"><b style="font-size:20px">VEXOcar</b><span>Como funciona</span><span>Vitrine</span><span>Oficinas</span>
<span style="margin-left:auto">Entrar</span>{btn("Criar conta grátis", "p")}</div>
<div style="position:relative">{ph(1200, 560, "", 0)}
  <div style="position:absolute;right:48px;top:24px;background:#EDEDED;font-size:12px;color:#8C8C8C">foto/vídeo do carro em tela cheia (cinematográfico)</div>
  <div style="position:absolute;left:48px;bottom:56px;display:flex;flex-direction:column;gap:16px;background:#fff;padding:24px;border-radius:12px;width:560px">
    <div style="font-size:40px;font-weight:800;line-height:1.1">O prontuário digital do seu carro</div>
    <div class="p" style="font-size:16px">Lembra das revisões, acha oficina perto de você e, na hora de vender, vira um anúncio com histórico comprovado.</div>
    <div class="row">{btn("Começar grátis", "p", 200)}{btn("Ver a vitrine", "s", 160)}</div>
  </div></div>
<div class="lp-sec"><div class="h1">Por que usar</div><div class="cols">
  {"".join(caixa(ph(48, 48, "", 10) + f'<div class="h2">{t}</div><div class="p">{d}</div>', "width:352px") for t, d in [
    ("Nunca mais esqueça a revisão", "Alerta por km e por data, mais IPVA e licenciamento pelo final da placa."),
    ("Histórico que vale dinheiro", "Toda manutenção com nota e foto. Na venda, vira PDF e selo de confiança."),
    ("Oficina perto de você", "Mapa com oficinas reais e serviços verificados pela própria oficina.")])}
</div></div>
<div class="lp-sec"><div class="h1">Como funciona</div><div class="cols">
  {"".join(f'<div style="width:352px;display:flex;flex-direction:column;gap:10px"><div class="tn" style="width:28px;text-align:center">{i}</div><div class="h2">{t}</div><div class="p">{d}</div></div>' for i, t, d in [
    (1, "Cadastre seu carro", "Placa, modelo, ano e km. Leva 1 minuto."),
    (2, "Registre cada manutenção", "Data, km, serviço, valor e foto da nota."),
    (3, "Venda com histórico", "Anuncie na vitrine com selo e nota de saúde.")])}
</div></div>
<div class="lp-sec"><div class="row sp"><div class="h1">Na vitrine agora</div><span class="sm">ver todos ›</span></div><div class="cols">
  {"".join(caixa(ph(320, 180, "foto") + '<div class="h2">Modelo · Ano</div><div class="row sp"><span class="b">R$ 00.000</span><span class="selo">HISTÓRICO VEXOcar</span></div>', "width:352px") for _ in range(3))}
</div></div>
<div class="lp-sec" style="align-items:center;text-align:center"><div class="h1">79% dos motoristas querem um histórico do carro</div>
<div class="p">Dado da nossa pesquisa com motoristas de aplicativo e donos de carro (número final após 13/11).</div>{btn("Criar conta grátis", "p", 240)}</div>
<div style="padding:32px 48px;display:flex;gap:32px" class="sm"><b style="color:#2B2B2B">VEXOcar</b><span>Sobre</span><span>Contato</span><span>Termos e privacidade</span><span style="margin-left:auto">Projeto Integrador · Universidade Positivo</span></div>
'''
telas.append(tela(1, "Landing page", "Site", "Primeira impressão. Versão final cinematográfica (foto grande, animação ao rolar, referências Aston Martin e Porsche). Leva para o cadastro e para a vitrine.", lp, 1200, 0, False))

# 02 Login / cadastro
c = f'''{SB}<div style="height:40px"></div>
<div class="h1" style="text-align:center;font-size:28px">VEXOcar</div><div class="p" style="text-align:center">O prontuário digital do seu carro</div>
<div style="height:24px"></div>{btn("G  Entrar com Google", "g")}
<div class="row" style="gap:8px"><div style="flex:1;height:1px;background:#DADADA"></div><span class="sm">ou</span><div style="flex:1;height:1px;background:#DADADA"></div></div>
{campo("E-mail", "voce@email.com")}{campo("Senha", "••••••••")}<div class="sm" style="text-align:right">Esqueci a senha</div>
{btn("Entrar", "p")}<div class="p" style="text-align:center">Não tem conta? <b>Criar conta</b></div>
<div style="margin-top:auto;padding-bottom:24px" class="sm" ><div style="text-align:center">Sou oficina · <b>Entrar como oficina</b></div></div>'''
telas.append(tela(2, "Login e cadastro", "MVP", "Google ou e-mail e senha (Firebase Auth). O link de baixo leva ao perfil oficina (nível 3).", c))

# 03 Minha garagem
carro = lambda m, p, km, n: caixa(f'<div class="row">{ph(96, 72, "foto")}<div style="display:flex;flex-direction:column;gap:4px;flex:1"><div class="h2">{m}</div><div class="sm">{p} · {km} km</div></div>{gauge(64, n)}</div>')
c = f'''{SB}<div class="row sp"><div class="h1">Minha garagem</div>{ph(36, 36, "", 18)}</div>
<div class="alerta">⚠ <span><b>Revisão dos 50.000 km</b> em 1.680 km · Civic</span></div>
{carro("Honda Civic EXL 2019", "ABC-1D23", "48.320", "92")}{carro("Fiat Mobi Like 2021", "XYZ-9K87", "61.050", "74")}
<div class="box" style="border-style:dashed;align-items:center;color:#8C8C8C;font-size:13px">+ Adicionar carro</div>
<div class="row sp"><span class="h2">Gasto do mês</span><span class="b">R$ 389,90</span></div>
<div class="fab">+</div>{nav("Garagem")}'''
telas.append(tela(3, "Minha garagem", "MVP", "Tela inicial depois do login. Cada carro com foto, placa, km e a nota de saúde (velocímetro). O botão + registra manutenção rápida.", c))

# 04 Adicionar carro
c = f'''{SB}{topo("Adicionar carro", "✕")}
{ph(W, 160, "toque para adicionar foto do carro")}{campo("Placa", "ABC-1D23")}
<div class="row">{campo("Marca", "Honda", 169)}{campo("Modelo", "Civic EXL", 169)}</div>
<div class="row">{campo("Ano", "2019", 169)}{campo("Km atual", "48.320", 169)}</div>
{campo("Km por mês (média)", "2.500")}<div class="p">Usamos a placa para avisar IPVA e licenciamento, e o km para prever a próxima revisão.</div>
<div style="margin-top:auto;padding-bottom:24px">{btn("Salvar carro", "p")}</div>'''
telas.append(tela(4, "Adicionar carro", "MVP", "Cadastro do carro. A média de km por mês permite prever a data da próxima revisão. Foto vai para o Cloudinary.", c))

# 05 Detalhe do carro
tl = "".join(f'<div class="tli"><div class="row sp"><span class="b" style="font-size:14px">{s}</span><span class="sm">{v}</span></div><div class="sm">{d}</div></div>' for s, v, d in [
    ("Troca de óleo e filtro", "R$ 389,90", "12/10/2026 · 47.900 km · Oficina do Zé · ✓ verificado"),
    ("Pastilhas de freio", "R$ 420,00", "03/07/2026 · 42.300 km · nota anexada"),
    ("Revisão 40.000 km", "R$ 1.180,00", "15/02/2026 · 40.100 km · Concessionária")])
c = f'''{SB}{topo("Civic EXL 2019", "‹", "⋯")}{ph(W, 180, "foto do carro")}
<div class="row sp">{gauge(120, "92")}<div style="display:flex;flex-direction:column;gap:6px"><div class="sm">NOTA DE SAÚDE</div><div class="p">Em dia com as revisões.<br>14 manutenções registradas.</div></div></div>
<div class="row">{btn("+ Manutenção", "p", 169)}{btn("Histórico PDF", "s", 169)}</div>
<div class="row sp"><span class="h2">Linha do tempo</span><span class="sm">filtrar</span></div><div class="tl">{tl}</div>
{btn("Anunciar na vitrine", "g")}{nav("Garagem")}'''
telas.append(tela(5, "Detalhe do carro", "MVP", "O prontuário: nota de saúde (calculada pelas revisões em dia), linha do tempo de manutenções e atalhos para registrar, gerar PDF e anunciar.", c))

# 06 Nova manutenção
c = f'''{SB}{topo("Nova manutenção", "✕")}
<div class="sm">CARRO</div>{chips("Civic 2019", "Mobi 2021")}
<div class="row">{campo("Data", "12/10/2026", 169)}{campo("Km", "47.900", 169)}</div>
<div class="sm">SERVIÇO</div>{chips("Troca de óleo", "Freios", "Pneus", "Revisão", "Suspensão", "Outro", ativo=0)}
{campo("Peças trocadas", "Óleo 5W30, filtro de óleo")}<div class="row">{campo("Valor", "R$ 389,90", 169)}{campo("Oficina", "Oficina do Zé", 169)}</div>
{ph(W, 90, "foto da nota fiscal")}<div style="margin-top:auto;padding-bottom:24px">{btn("Salvar manutenção", "p")}</div>'''
telas.append(tela(6, "Nova manutenção", "MVP", "Registro em menos de 1 minuto: chips para o tipo de serviço, foto da nota como prova. Ao salvar, recalcula a nota de saúde e os alertas.", c))

# 07 Alertas
al = lambda t, d, a, forte=False: f'<div class="box" style="{"border:1.5px solid #2B2B2B" if forte else ""}"><div class="row sp"><span class="h2" style="font-size:14px">{t}</span>{ph(20, 20, "", 10)}</div><div class="sm">{d}</div><div class="sm b" style="color:#2B2B2B">{a}</div></div>'
c = f'''{SB}<div class="h1">Alertas</div>{chips("Todos", "Civic", "Mobi")}
<div class="sm b">VENCIDO</div>{al("Licenciamento 2026 · Mobi", "Placa final 7 venceu em 30/09", "Ver como pagar ›", True)}
<div class="sm b">PRÓXIMOS</div>{al("Revisão dos 50.000 km · Civic", "Faltam 1.680 km (por volta de 05/12)", "Achar oficina ›")}
{al("IPVA 2027 · Civic", "Placa final 3 vence em 15/01/2027", "Lembrar 7 dias antes")}{al("Troca de pneus · Mobi", "Previsão pelos 60.000 km rodados", "Registrar troca ›")}
{nav("Alertas")}'''
telas.append(tela(7, "Alertas", "MVP", "Tudo que vence: revisão (por km e por data), IPVA e licenciamento pelo final da placa. Na versão final, o âmbar marca os alertas.", c))

# 08 Histórico PDF
c = f'''{SB}{topo("Histórico em PDF")}
<div class="box" style="align-items:center;background:#FAFAFA"><div style="width:250px;height:340px;border:1px solid #CFCFCF;background:#fff;padding:16px;display:flex;flex-direction:column;gap:8px">
<div class="b" style="font-size:12px">VEXOcar · Histórico do veículo</div>{linha(160)}{linha(120)}{ph(218, 70, "foto")}
{linha(218, 6)}{linha(200, 6)}{linha(218, 6)}{linha(180, 6)}{linha(218, 6)}{linha(150, 6)}<div class="row sp" style="margin-top:auto">{ph(44, 44, "QR", 4)}<span class="sm" style="font-size:9px">verificar autenticidade</span></div></div></div>
<div class="sm">INCLUIR</div>{chips("Fotos das notas", "Valores", "Oficinas", ativo=0)}
{btn("Baixar PDF", "p")}{btn("Enviar pelo WhatsApp", "s")}
<div class="p" style="text-align:center">O QR code abre a página pública do histórico, para o comprador conferir.</div>'''
telas.append(tela(8, "Histórico em PDF", "MVP", "O documento de revenda: dados do carro, todas as manutenções e QR code de verificação. O dono escolhe se mostra os valores.", c))

# 09 Vitrine
anuncio = lambda: caixa(f'{ph(318, 150, "foto")}<div class="row sp"><span class="h2">Honda Civic EXL 2019</span>{gauge(54, "92")}</div><div class="row sp"><span class="b">R$ 112.900</span><span class="sm">FIPE R$ 115.400</span></div><div class="row sp"><span class="selo">HISTÓRICO VEXOcar</span><span class="sm">48 mil km · Curitiba</span></div>')
c = f'''{SB}<div class="h1">Vitrine</div>{campo("", "⌕  Buscar modelo, marca…")}
{chips("Filtros", "Até R$ 60 mil", "Sedã", "Nota 80+", "Perto de mim", ativo=0)}<div class="row sp"><span class="sm">128 carros</span><span class="sm">Ordenar: mais recentes</span></div>
{anuncio()}{anuncio()}{nav("Vitrine")}'''
telas.append(tela(9, "Vitrine", "Nível 2", "Busca e filtros. Cada anúncio mostra preço comparado à FIPE (API pública), nota de saúde e o selo de histórico.", c))

# 10 Anúncio
c = f'''{SB}{topo("", "‹", "♡  ⤴")}{ph(W, 200, "galeria de fotos  1/8")}
<div class="h2" style="font-size:20px">Honda Civic EXL 2019</div><div class="row sp"><span class="h1">R$ 112.900</span><span class="sm">FIPE R$ 115.400<br>2% abaixo</span></div>
<div class="row sp">{gauge(110, "92")}<div style="display:flex;flex-direction:column;gap:6px"><span class="selo">HISTÓRICO VEXOcar</span><span class="sm">14 manutenções<br>3 verificadas por oficina</span></div></div>
<div class="row sp"><span class="h2">Histórico</span><span class="sm">ver PDF ›</span></div>
<div class="tl"><div class="tli"><span class="b" style="font-size:13px">Troca de óleo</span><div class="sm">out/2026 · ✓ Oficina do Zé</div></div><div class="tli"><span class="b" style="font-size:13px">Pastilhas de freio</span><div class="sm">jul/2026 · nota anexada</div></div></div>
<div class="row">{ph(40, 40, "", 20)}<div><div class="b" style="font-size:14px">Ricardo M.</div><div class="sm">Curitiba · na VEXOcar desde 2026</div></div></div>
<div style="margin-top:auto;padding-bottom:24px">{btn("Tenho interesse (WhatsApp)", "p")}</div>'''
telas.append(tela(10, "Anúncio", "Nível 2", "Página do carro à venda: o diferencial é a linha do tempo comprovada. 'Tenho interesse' abre o WhatsApp do vendedor (sem pagamento no app).", c))

# 11 Anunciar carro
c = f'''{SB}{topo("Anunciar carro", "✕")}<div class="sm">QUAL CARRO?</div>{chips("Civic 2019", "Mobi 2021")}
<div class="row">{ph(105, 80, "+ foto")}{ph(105, 80, "")}{ph(105, 80, "")}</div>
{campo("Preço", "R$ 112.900")}<div class="box" style="background:#FAFAFA"><div class="row sp"><span class="sm">Tabela FIPE (out/2026)</span><span class="b">R$ 115.400</span></div><div class="sm">Seu preço está 2% abaixo da FIPE</div></div>
{campo("Descrição", "Único dono, sempre revisado…")}<div class="row sp"><span class="p">Mostrar valores das manutenções</span><span class="chip on">sim</span></div>
<div style="margin-top:auto;padding-bottom:24px">{btn("Publicar na vitrine", "p")}</div>'''
telas.append(tela(11, "Anunciar carro", "Nível 2", "Transforma o carro da garagem em anúncio, levando o histórico junto. Mostra a FIPE para ajudar no preço. Depois: marcar vendido e transferir o prontuário ao comprador.", c))

# 12 Oficinas próximas
mapa = (f'<div class="ph" style="width:390px;height:430px;margin:0 -20px;border-radius:0"><svg width="390" height="430" viewBox="0 0 390 430">'
        + "".join(f'<line x1="0" y1="{y}" x2="390" y2="{y + 40}" stroke="#D6D6D6" stroke-width="6"/>' for y in (60, 190, 320))
        + "".join(f'<line x1="{x}" y1="0" x2="{x - 50}" y2="430" stroke="#D6D6D6" stroke-width="6"/>' for x in (110, 260))
        + "".join(f'<circle cx="{x}" cy="{y}" r="11" fill="#555"/>' for x, y in ((90, 120), (220, 210), (300, 90), (160, 330)))
        + '<circle cx="195" cy="250" r="8" fill="#fff" stroke="#2B2B2B" stroke-width="4"/></svg><span style="position:absolute;top:12px;left:12px">mapa (OpenStreetMap)</span></div>')
of = lambda n, d, a: f'<div class="row sp" style="padding:8px 0;border-bottom:1px solid #EEE"><div><div class="b" style="font-size:14px">{n}</div><div class="sm">{d}</div></div><span class="sm">{a}</span></div>'
c = f'''{SB}<div class="row sp"><div class="h1">Oficinas</div><span class="sm">lista ☰</span></div>{chips("Todas", "Parceiras VEXOcar", "Abertas agora")}{mapa}
<div style="margin-top:-30px;background:#fff;border-radius:18px 18px 0 0;border-top:1.5px solid #CFCFCF;padding:12px 0 0;display:flex;flex-direction:column">
<div style="width:40px;height:4px;background:#CFCFCF;border-radius:2px;margin:0 auto 8px"></div>
{of("Oficina do Zé · parceira", "Mecânica geral · 0,8 km", "★ 4,8")}{of("Auto Center Veloz", "Pneus, alinhamento · 1,4 km", "★ 4,6")}</div>{nav("Oficinas")}'''
telas.append(tela(12, "Oficinas próximas", "Nível 3", "Mapa com oficinas reais perto do usuário (OpenStreetMap, grátis). Lista por baixo, puxável. Oficinas parceiras podem verificar serviços.", c))

# 13 Perfil oficina
c = f'''{SB}<div class="row">{ph(56, 56, "logo", 12)}<div><div class="h2">Oficina do Zé</div><div class="sm">Parceira VEXOcar · ★ 4,8</div></div></div>
<div class="box"><div class="h2" style="font-size:14px">Registrar serviço no carro do cliente</div>{campo("Placa do cliente", "ABC-1D23", 318)}{btn("Buscar carro", "p")}</div>
<div class="box"><div class="row sp"><span class="b" style="font-size:14px">Civic EXL 2019 · ABC-1D23</span></div><div class="sm">Dono: Ricardo M. (vai receber para aprovar)</div>
{chips("Troca de óleo", "Freios", "Revisão")}<div class="row">{campo("Km", "47.900", 150)}{campo("Valor", "R$ 389,90", 150)}</div>{btn("Enviar com selo ✓ verificado", "s")}</div>
<div class="row sp"><span class="h2">Últimos serviços</span><span class="sm">32 este mês</span></div>
{linha(W, 10)}{linha(300, 10)}{linha(W, 10)}<div style="height:20px"></div>'''
telas.append(tela(13, "Perfil oficina", "Nível 3", "Visão da oficina: busca o carro pela placa e registra o serviço. O dono aprova, e o item entra no histórico com o selo 'verificado por oficina'.", c))

# 14 Painel de gastos
barras = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1"><div style="width:26px;height:{h}px;background:{"#2B2B2B" if i == 5 else "#CFCFCF"};border-radius:4px"></div><span class="sm" style="font-size:10px">{m}</span></div>'
                 for i, (m, h) in enumerate([("mai", 60), ("jun", 30), ("jul", 110), ("ago", 20), ("set", 45), ("out", 95)]))
cat = lambda n, v, w: f'<div class="row sp"><span class="p" style="color:#2B2B2B;width:110px">{n}</span><div style="flex:1;height:8px;background:#EEE;border-radius:4px"><div style="width:{w}%;height:8px;background:#555;border-radius:4px"></div></div><span class="sm" style="width:80px;text-align:right">{v}</span></div>'
c = f'''{SB}<div class="h1">Gastos</div>{chips("Civic", "Mobi", "Todos", ativo=2)}{chips("6 meses", "12 meses", "Tudo")}
<div class="row"><div class="box" style="flex:1"><div class="sm">TOTAL EM 6 MESES</div><div class="h1">R$ 2.890</div></div><div class="box" style="flex:1"><div class="sm">CUSTO POR KM</div><div class="h1">R$ 0,19</div></div></div>
<div class="box"><div class="sm">POR MÊS</div><div class="row" style="align-items:flex-end;height:130px">{barras}</div></div>
<div class="sm">POR CATEGORIA</div>{cat("Revisão", "R$ 1.180", 80)}{cat("Freios", "R$ 420", 30)}{cat("Óleo", "R$ 390", 27)}{cat("Pneus", "R$ 900", 62)}
{nav("Gastos")}'''
telas.append(tela(14, "Painel de gastos", "Extra", "Quanto o carro custa: total, custo por km (importante para motorista de app) e divisão por categoria. Calculado das manutenções registradas.", c))

# ---------- Telas que completam o fluxo (15 a 22) ----------
extras = []

# 15 Criar conta
c = f'''{SB}{topo("Criar conta")}{btn("G  Criar com Google", "g")}
<div class="row" style="gap:8px"><div style="flex:1;height:1px;background:#DADADA"></div><span class="sm">ou</span><div style="flex:1;height:1px;background:#DADADA"></div></div>
{campo("Nome", "Ricardo Medeiros")}{campo("E-mail", "voce@email.com")}{campo("Senha", "mínimo 8 caracteres")}
<div class="sm">VOCÊ É</div>{chips("Motorista de app", "Dono(a) de carro")}
<div class="row" style="gap:8px"><div style="width:18px;height:18px;border:1.5px solid #2B2B2B;border-radius:4px"></div><span class="sm">Li e aceito os termos e a política de privacidade</span></div>
{btn("Criar conta", "p")}<div class="p" style="text-align:center">Já tem conta? <b>Entrar</b></div>'''
extras.append(tela(15, "Criar conta", "MVP", "Cadastro com Google ou e-mail. 'Você é' vem da pesquisa: motorista de app vê custo por km em destaque. Leva à garagem vazia.", c))

# 16 Esqueci a senha
c = f'''{SB}{topo("Esqueci a senha")}<div style="height:12px"></div>
<div class="p">Digite o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.</div>
{campo("E-mail", "voce@email.com")}{btn("Enviar link", "p")}
<div class="box" style="background:#FAFAFA"><div class="b" style="font-size:14px">✓ Link enviado</div><div class="sm">Confira sua caixa de entrada e o spam. O link vale por 1 hora.</div></div>
<div class="p" style="text-align:center"><b>Voltar ao login</b></div>'''
extras.append(tela(16, "Esqueci a senha", "MVP", "Recuperação de senha pelo próprio Firebase Auth (e-mail com link). A caixa de baixo é o estado depois de enviar.", c))

# 17 Garagem vazia
c = f'''{SB}<div class="row sp"><div class="h1">Minha garagem</div>{ph(36, 36, "", 18)}</div><div style="height:30px"></div>
<div style="display:flex;justify-content:center">{ph(200, 140, "ilustração do carro")}</div>
<div class="h2" style="text-align:center;font-size:20px">Sua garagem está vazia</div>
<div class="p" style="text-align:center">Cadastre seu carro para receber os alertas de revisão, IPVA e licenciamento.</div>
{btn("Adicionar meu primeiro carro", "p")}
<div class="box"><div class="sm">✓ Lembrete de revisão por km e data</div><div class="sm">✓ Histórico com nota e foto</div><div class="sm">✓ PDF pronto para vender</div></div>
{nav("Garagem")}'''
extras.append(tela(17, "Garagem vazia", "MVP", "Primeiro acesso, logo depois de criar a conta. Um único caminho óbvio: cadastrar o primeiro carro.", c))

# 18 Perfil e configurações
item = lambda t, d="›": f'<div class="row sp" style="padding:12px 0;border-bottom:1px solid #EEE"><span style="font-size:14px">{t}</span><span class="sm">{d}</span></div>'
tog = lambda t: f'<div class="row sp" style="padding:8px 0"><span style="font-size:14px">{t}</span><div style="width:40px;height:22px;border-radius:11px;background:#2B2B2B"></div></div>'
c = f'''{SB}{topo("Perfil")}<div class="row">{ph(64, 64, "", 32)}<div><div class="h2">Ricardo Medeiros</div><div class="sm">voce@email.com</div><span class="chip on" style="display:inline-block;margin-top:6px">Motorista de app</span></div></div>
<div><div class="sm b" style="margin-top:6px">NOTIFICAÇÕES</div>{tog("Revisão por km e data")}{tog("IPVA e licenciamento")}{tog("Interessados nos meus anúncios")}</div>
<div>{item("Meus dados")}{item("Favoritos", "3 ›")}{item("Meus anúncios", "1 ›")}{item("Termos e privacidade")}</div>
<div class="p" style="color:#2B2B2B"><b>Sair</b></div>{nav("Garagem")}'''
extras.append(tela(18, "Perfil e configurações", "MVP", "Abre pelo avatar no topo da garagem. Liga e desliga notificações, mostra favoritos e anúncios (onde se marca o carro como vendido).", c))

# 19 Perfil público da oficina
c = f'''{SB}{topo("", "‹", "♡")}{ph(W, 150, "foto da fachada")}
<div class="row sp"><div><div class="h2" style="font-size:20px">Oficina do Zé</div><div class="sm">Mecânica geral · 0,8 km</div></div><div class="b">★ 4,8</div></div>
<div class="row"><span class="selo">PARCEIRA VEXOcar</span><span class="sm">120 serviços verificados</span></div>
<div class="sm">Rua Exemplo, 123 · Curitiba · aberta até 18h</div>
<div class="sm b">SERVIÇOS</div>{chips("Troca de óleo", "Freios", "Suspensão", "Revisão", "Elétrica", ativo=-1)}
<div class="row">{btn("Chamar no WhatsApp", "p", 169)}{btn("Como chegar", "s", 169)}</div>
<div class="sm b">AVALIAÇÕES</div>{linha(W, 10)}{linha(280, 10)}{linha(320, 10)}<div style="height:20px"></div>'''
extras.append(tela(19, "Perfil da oficina (público)", "Nível 3", "O que o motorista vê ao tocar numa oficina do mapa: serviços, selo de parceira, contato pelo WhatsApp e rota no mapa.", c))

# 20 Aprovar serviço da oficina
c = f'''{SB}{topo("Novo serviço para aprovar")}
<div class="box"><div class="row">{ph(44, 44, "logo", 10)}<div><div class="b" style="font-size:14px">Oficina do Zé</div><div class="sm">registrou um serviço no seu carro</div></div></div></div>
<div class="box"><div class="row sp"><span class="h2">Troca de óleo e filtro</span><span class="b">R$ 389,90</span></div>
<div class="sm">Civic EXL 2019 · ABC-1D23</div><div class="sm">12/10/2026 · 47.900 km</div><div class="sm">Peças: óleo 5W30, filtro de óleo</div>{ph(318, 80, "nota fiscal enviada pela oficina")}</div>
<div class="p">Ao aprovar, o serviço entra no histórico com o selo <b>✓ verificado por oficina</b>, que aparece no PDF e na vitrine.</div>
<div style="margin-top:auto;padding-bottom:24px;display:flex;flex-direction:column;gap:10px">{btn("Aprovar e adicionar ao histórico", "p")}{btn("Não reconheço este serviço", "g")}</div>'''
extras.append(tela(20, "Aprovar serviço da oficina", "Nível 3", "Chega por notificação quando a oficina registra um serviço (tela 13). O dono confirma, e só então o selo de verificado é aplicado.", c))

# 21 Marcar vendido e transferir
c = f'''{SB}{topo("Carro vendido")}
<div class="box"><div class="row">{ph(80, 60, "foto")}<div><div class="h2">Civic EXL 2019</div><div class="sm">Anúncio ativo há 12 dias · 41 visitas</div></div></div></div>
<div class="sm b">PARA QUEM VOCÊ VENDEU?</div>{campo("E-mail ou celular do comprador", "comprador@email.com")}
<div class="box" style="background:#FAFAFA"><div class="b" style="font-size:14px">O que acontece</div>
<div class="sm">✓ O anúncio sai da vitrine</div><div class="sm">✓ O comprador recebe o carro com todo o histórico</div><div class="sm">✓ Seus valores pagos ficam ocultos para ele</div></div>
<div style="margin-top:auto;padding-bottom:24px;display:flex;flex-direction:column;gap:10px">{btn("Transferir prontuário", "p")}{btn("Só marcar como vendido", "g")}</div>'''
extras.append(tela(21, "Vendido e transferir prontuário", "Nível 2", "Fecha o ciclo: o histórico continua com o carro e passa para o novo dono. É o que faz o prontuário valer mais a cada venda.", c))

# 22 Página pública do histórico (comprador)
tl2 = "".join(f'<div class="tli"><div class="row sp"><span class="b" style="font-size:14px">{s}</span><span class="sm">{v}</span></div><div class="sm">{d}</div></div>' for s, v, d in [
    ("Troca de óleo e filtro", "out/2026", "47.900 km · ✓ verificado pela Oficina do Zé"),
    ("Pastilhas de freio", "jul/2026", "42.300 km · nota anexada"),
    ("Revisão 40.000 km", "fev/2026", "40.100 km · concessionária")])
c = f'''<div style="margin:0 -20px;padding:10px 16px;background:#F2F2F2;border-bottom:1px solid #DADADA" class="sm">navegador · vexocar.app/h/ABC1D23</div>
<div class="row sp"><b style="font-size:16px">VEXOcar</b><span class="selo">✓ DOCUMENTO AUTÊNTICO</span></div>
<div class="h2" style="font-size:20px">Honda Civic EXL 2019</div><div class="sm">Placa ABC-1D23 · 48.320 km · gerado em 03/11/2026</div>
<div class="row sp">{gauge(110, "92")}<div class="sm">14 manutenções<br>3 verificadas por oficina<br>revisões em dia</div></div>
<div class="tl">{tl2}</div>
<div class="box" style="background:#FAFAFA"><div class="b" style="font-size:14px">Também tem carro?</div><div class="sm">Guarde o histórico do seu e venda por mais.</div>{btn("Criar minha conta", "p")}</div><div style="height:12px"></div>'''
extras.append(tela(22, "Histórico público (QR code)", "MVP", "O que o comprador vê ao ler o QR code do PDF, sem precisar de conta. Prova que o histórico é real e convida a criar conta (aquisição).", c))


def doc(corpo, titulo):
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>{corpo}</body></html>'''


(AQUI / "wireframes.html").write_text(doc("".join(telas + extras), "VEXOcar - wireframes"), encoding="utf-8")
(AQUI / "wireframes_extra.html").write_text(doc("".join(extras), "VEXOcar - telas de fluxo"), encoding="utf-8")


# ---------- Fluxograma do usuário ----------
def no(n, t, ext=False):
    estilo = "border:1.5px dashed #9A9A9A;color:#8C8C8C" if ext else "border:1.5px solid #2B2B2B"
    num = f'<span class="tn">{n}</span>' if n else ""
    return f'<div class="fn" style="{estilo}">{num}<span>{t}</span></div>'


SETA = ('<svg width="44" height="14" viewBox="0 0 44 14"><line x1="2" y1="7" x2="34" y2="7" stroke="#2B2B2B" stroke-width="2"/>'
        '<polygon points="34,2 43,7 34,12" fill="#2B2B2B"/></svg>')


def cadeia(*nos):
    return '<div class="ch">' + SETA.join(nos) + "</div>"


raias = [
    ("1", "Chegar e criar conta", "o primeiro uso", [
        cadeia(no("01", "Landing page"), no("15", "Criar conta"), no("17", "Garagem vazia"), no("04", "Adicionar carro"), no("03", "Minha garagem"))]),
    ("2", "Já tenho conta", "entrar de novo", [
        cadeia(no("01", "Landing page"), no("02", "Login"), no("03", "Minha garagem")),
        cadeia(no("02", "Login"), no("16", "Esqueci a senha"), no("02", "Login"))]),
    ("3", "Cuidar do carro", "o dia a dia (MVP)", [
        cadeia(no("03", "Minha garagem"), no("05", "Detalhe do carro"), no("06", "Nova manutenção"), no("05", "Detalhe (nota recalculada)")),
        cadeia(no("03", "Minha garagem"), no("07", "Alertas"), no("12", "Oficinas próximas"), no("19", "Perfil da oficina"), no("", "WhatsApp da oficina", True)),
        cadeia(no("03", "Minha garagem"), no("14", "Painel de gastos")),
        cadeia(no("03", "Minha garagem"), no("18", "Perfil e configurações"))]),
    ("4", "Vender o carro", "o histórico vira dinheiro", [
        cadeia(no("05", "Detalhe do carro"), no("08", "Histórico em PDF"), no("22", "Histórico público (QR)")),
        cadeia(no("05", "Detalhe do carro"), no("11", "Anunciar carro"), no("10", "Anúncio na vitrine"), no("18", "Perfil › Meus anúncios"), no("21", "Vendido e transferir"))]),
    ("5", "Comprar um carro", "quem chega pela vitrine", [
        cadeia(no("01", "Landing page"), no("09", "Vitrine"), no("10", "Anúncio"), no("22", "Histórico público"), no("15", "Criar conta")),
        cadeia(no("10", "Anúncio"), no("", "WhatsApp do vendedor", True))]),
    ("6", "Oficina verifica", "o selo de confiança", [
        cadeia(no("02", "Login (oficina)"), no("13", "Perfil oficina"), no("20", "Dono aprova"), no("05", "Detalhe com selo ✓"))]),
]

CSS_FLUXO = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,sans-serif;color:#2B2B2B;background:#fff}
.fluxo{width:1700px;padding:56px;background:#fff;border:1px solid #DADADA;border-radius:16px}
.ft{font-size:36px;font-weight:800} .fs{font-size:16px;color:#8C8C8C;margin:8px 0 36px}
.raia{display:flex;gap:28px;padding:24px 0;border-top:1px solid #E3E3E3}
.rl{width:230px;flex:none;display:flex;flex-direction:column;gap:4px}
.rl .rn{width:30px;height:30px;border-radius:50%;background:#2B2B2B;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:14px;margin-bottom:6px}
.rl b{font-size:18px} .rl span{font-size:13px;color:#8C8C8C}
.cs{display:flex;flex-direction:column;gap:14px}
.ch{display:flex;align-items:center;gap:4px}
.fn{display:flex;align-items:center;gap:8px;border-radius:10px;padding:10px 12px;font-size:13px;font-weight:600;background:#fff;width:200px;min-height:46px}
.tn{font-size:11px;font-weight:700;background:#2B2B2B;color:#fff;border-radius:5px;padding:2px 6px;flex:none}
.leg{display:flex;gap:24px;margin-top:28px;font-size:13px;color:#8C8C8C;align-items:center}
"""
corpo = '<div class="fluxo"><div class="ft">Fluxo do usuário</div><div class="fs">Os 6 caminhos principais pelo VEXOcar. O número é a tela nos wireframes abaixo; no modo protótipo do Figma, os botões levam de uma tela à outra.</div>'
for n, t, s, cads in raias:
    corpo += f'<div class="raia"><div class="rl"><div class="rn">{n}</div><b>{t}</b><span>{s}</span></div><div class="cs">{"".join(cads)}</div></div>'
corpo += f'<div class="leg">{no("03", "tela do app")}{no("", "fora do app", True)}<span>→ toque / próximo passo</span></div></div>'
(AQUI / "fluxo.html").write_text(f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>VEXOcar - fluxo</title>'
                                 f'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=block" rel="stylesheet">'
                                 f'<style>{CSS_FLUXO}</style></head><body>{corpo}</body></html>', encoding="utf-8")
print("ok", len(telas) + len(extras), "telas + fluxo")
