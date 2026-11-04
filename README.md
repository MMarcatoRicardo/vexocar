# VEXOcar

**O prontuário digital do seu carro.** Histórico de manutenção comprovado por nota fiscal, alertas de revisão, óleo,
IPVA e licenciamento, painel de gastos, oficinas próximas com avaliações e uma vitrine onde o carro é vendido junto com
o histórico (e transferido para a conta do comprador).

Projeto Integrador de **Design Profissional** (Prof. Sedenilso Machado), Universidade Positivo, 2026.
Segmento: **4. Hub Digital de Manutenção e Histórico Veicular**.

| | |
|---|---|
| Site e app | https://mmarcatoricardo.github.io/vexocar/ |
| App direto | https://mmarcatoricardo.github.io/vexocar/app/entrar.html |
| Demonstração (sem criar conta, 3 carros de exemplo) | https://mmarcatoricardo.github.io/vexocar/app/demo.html |
| API | https://vexocar.onrender.com/api/saude |

QR code do site: [`02_MARCA/qrcode-site.png`](02_MARCA/qrcode-site.png) (simples) e [`02_MARCA/qrcode-site-marca.png`](02_MARCA/qrcode-site-marca.png) (com a marca).
No celular, o site pode ser instalado como app: botão **Instalar app** na página inicial ou no Perfil.

> A API roda no plano grátis do Render, que "dorme" depois de 15 minutos parado. O primeiro acesso pode levar
> cerca de 1 minuto para acordar.

## Equipe

| Integrante | Curso |
|---|---|
| Ricardo Medeiros Marcato | Engenharia de Software |
| Daniel Ribeiro da Costa | Engenharia de Software |
| Lucas Markovicz Costa | Sistemas de Informação |

## O que tem no repositório

| Pasta | O quê |
|---|---|
| `01_PESQUISA/` | Script do Google Forms da pesquisa com o público (motoristas de app e donos de carro) |
| `02_MARCA/` | Logo "V de pista", ícone, guia da marca (Audiowide + Inter, grafite + verde-pista) |
| `03_WIREFRAMES/` | Gerador dos wireframes e plugin do Figma que liga o protótipo |
| `04_LANDING/` | **O front-end:** landing page (`index.html`) e o app com 18 telas (`app/`) |
| `05_API/` | **O back-end:** API REST em Node.js + Express ([README próprio](05_API/README.md)) |
| `06_ALTA_FIDELIDADE/` | Gerador das telas de alta fidelidade enviadas ao Figma |

## Tecnologias

- **Front-end:** HTML, CSS e JavaScript puros, Leaflet (mapa das oficinas), publicado no GitHub Pages.
- **Back-end:** Node.js 20+, Express 5, publicado no Render.
- **Banco e login:** Firebase (Firestore + Authentication com e-mail/senha e Google).
- **Fotos:** Cloudinary (carros, notas fiscais, anúncios).
- **Design:** Figma (marca, wireframes e alta fidelidade).

## Rodar no computador

```bash
cd 05_API
npm install
npm start
```

Abra http://localhost:3000 (site) ou http://localhost:3000/app/entrar.html (app).
Sem o arquivo `.env`, tudo roda em **modo local** (banco em arquivo, login próprio, fotos em pasta), sem precisar de
nenhuma conta. Para usar Firebase e Cloudinary, copie `05_API/.env.exemplo` para `05_API/.env` e preencha.

Também dá para abrir `04_LANDING/index.html` direto no navegador: o app entra em **modo demonstração**, com dados
de exemplo guardados no próprio navegador.

## Licença

MIT. Fotos da landing: Unsplash (ver `04_LANDING/CREDITOS.md`).
