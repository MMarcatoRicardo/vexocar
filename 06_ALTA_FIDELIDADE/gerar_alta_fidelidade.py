"""VEXOcar · etapa 11: telas de alta fidelidade para o Figma, geradas a partir do site pronto.

Abre cada tela (modo demonstração, dados de exemplo, "hoje" = 03/11/2026), congela o HTML + CSS
(capturar.js) e junta tudo em dois documentos que o Figma converte em camadas editáveis:
  celular.html (390 px) e computador.html (1440 px). Cada <section class="tela"> vira um frame.
Precisa da API ligada (cd 05_API && npm start) porque as páginas são servidas por ela.
Uso: python gerar_alta_fidelidade.py
"""
import json, pathlib, time
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).parent
BASE = 'http://localhost:3000/'
JS = (AQUI / 'capturar.js').read_text(encoding='utf-8')

CELULAR = [
    ('01 Login', 'app/entrar.html'), ('02 Criar conta', 'app/criar-conta.html'), ('03 Esqueci a senha', 'app/esqueci-senha.html'),
    ('04 Garagem', 'app/garagem.html'), ('05 Garagem vazia', 'app/garagem.html#vazia'), ('06 Adicionar carro', 'app/adicionar-carro.html'),
    ('07 Prontuário do carro', 'app/carro.html?id=c1'), ('08 Nova manutenção', 'app/nova-manutencao.html?carro=c1&tipo=oleo'),
    ('09 Alertas', 'app/alertas.html'), ('10 Histórico em PDF', 'app/historico-pdf.html?id=c1'), ('11 Histórico público (QR)', 'app/h.html?id=c1'),
    ('12 Vitrine', 'app/vitrine.html'), ('13 Anúncio', 'app/anuncio.html?id=a4'), ('14 Anunciar carro', 'app/anunciar.html?carro=c1'),
    ('15 Vendido e transferir', 'app/vendido.html?id=uDEMO'), ('16 Oficinas próximas', 'app/oficinas.html'),
    ('17 Perfil da oficina', 'app/oficina.html?id=o1'), ('18 Painel de gastos', 'app/gastos.html'), ('19 Perfil', 'app/perfil.html'),
    ('20 Termos e privacidade', 'app/termos.html'),
]
COMPUTADOR = [
    ('Landing page', 'index.html'), ('Página 404', '404.html'), ('Login', 'app/entrar.html'), ('Garagem', 'app/garagem.html'),
    ('Prontuário do carro', 'app/carro.html?id=c1'), ('Alertas', 'app/alertas.html'), ('Vitrine', 'app/vitrine.html'),
    ('Anúncio', 'app/anuncio.html?id=a4'), ('Oficinas próximas', 'app/oficinas.html'), ('Painel de gastos', 'app/gastos.html'),
    ('Histórico em PDF', 'app/historico-pdf.html?id=c1'),
]

PREPARO = """(vazia) => {
  var d = VX.restaurar();
  d.meusAnuncios = [{ id: 'uDEMO', carroId: 'c1', preco: 74900, fipe: 72400, descricao: 'Polo 2019 com todas as revisões registradas.',
    mostrarValores: false, fotos: ['../img/carros/polo.jpg'], publicado: '2026-10-27', visitas: 38, vendido: false, pausado: false }];
  if (vazia) { d.carros = []; d.manutencoes = []; d.pagamentos = []; d.meusAnuncios = []; }
  VX.salvar(d);
}"""


def capturar(ctx, nome, url, W, H, i):
    p = ctx.new_page()
    vazia = url.endswith('#vazia')
    url = url.replace('#vazia', '')
    sep = '&' if '?' in url else '?'
    if url.startswith('app/'):
        p.goto(BASE + 'app/termos.html?modo=demo'); p.evaluate(PREPARO, vazia)
        p.goto(BASE + url + sep + 'modo=demo')
    else:
        p.goto(BASE + url)
    p.wait_for_load_state('networkidle')
    if url == 'index.html':  # landing: rola até o fim para revelar seções e contar o 79%
        alt = p.evaluate('document.body.scrollHeight')
        for y in range(0, alt, 500):
            p.evaluate(f'window.scrollTo(0,{y})'); time.sleep(0.12)
        time.sleep(2.5); p.evaluate('window.scrollTo(0,0)'); time.sleep(0.8)
        p.evaluate("document.querySelectorAll('.revela,.passos').forEach(e=>e.classList.add('visivel'));document.querySelectorAll('.gauge').forEach(e=>e.classList.add('cheio'))")
    time.sleep(1.8)  # velocímetros e mapa
    ident = f't{i}'
    r = p.evaluate(JS, {'W': W, 'H': H, 'ID': ident})
    p.close()
    return ident, nome, r


def documento(telas, W, H, titulo):
    css = '\n'.join(r['css'] for _, _, r in telas)
    corpo = '\n'.join(
        f'<section class="tela {r["classes"]}" id="{ident}" data-nome="{nome}" aria-label="{nome}">{r["html"]}</section>'
        for ident, nome, r in telas)
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
html, body {{ margin: 0; background: #070809; }}
body {{ display: flex; flex-wrap: wrap; align-items: flex-start; gap: 120px; padding: 120px; width: {(W + 120) * (4 if W < 800 else 2) + 120}px; }}
.tela {{ position: relative; transform: translateZ(0); width: {W}px; min-height: {H}px; overflow: hidden; flex: none; box-sizing: border-box; }}
.tela *, .tela *::before, .tela *::after {{ transition: none !important; animation: none !important; }}
</style>
<style>{css}</style></head><body>{corpo}</body></html>"""


with sync_playwright() as pw:
    b = pw.chromium.launch(channel='chrome')
    for nomeArq, lista, W, H in [('celular.html', CELULAR, 390, 844), ('computador.html', COMPUTADOR, 1440, 900)]:
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1)
        telas = []
        for i, (nome, url) in enumerate(lista):
            telas.append(capturar(ctx, nome, url, W, H, i))
            print('  ok', W, nome, flush=True)
        html = documento(telas, W, H, 'VEXOcar alta fidelidade ' + str(W))
        (AQUI / nomeArq).write_text(html, encoding='utf-8')
        print(nomeArq, round(len(html) / 1e6, 1), 'MB')
        ctx.close()
    b.close()
