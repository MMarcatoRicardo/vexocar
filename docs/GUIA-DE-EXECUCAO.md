# Guia de execução

Como rodar o VEXOcar no seu computador.

## Jeito 1: só abrir os arquivos (modo demonstração)

Não precisa instalar nada.

1. Baixe ou clone o repositório.
2. Abra `04_LANDING/index.html` no navegador (dois cliques no arquivo).
3. Clique em **Ver demonstração** ou **Entrar**.

Aberto assim (`file://`), o app entra sempre em **modo demonstração**: 3 carros de exemplo (Polo, CR-V e Camry),
dados guardados no próprio navegador, data de "hoje" fixa em 03/11/2026. Para recomeçar: Perfil >
**Restaurar dados de exemplo**.

> O mapa das oficinas precisa de internet para carregar. Sem internet, a lista continua funcionando.
> O botão **Instalar app** não aparece pelo `file://`.

## Jeito 2: rodar a API (modo API, com login)

### O que precisa

- **Node.js 20.12 ou mais novo** (o `package.json` pede `"node": ">=20.12"`; a API usa `process.loadEnvFile`,
  que chegou nessa versão). Confira com `node -v`.
- npm (vem com o Node).

### Passo a passo

```bash
cd 05_API
npm install      # só na primeira vez
npm start
```

O terminal mostra algo assim:

```
  VEXOcar no ar: http://localhost:3000
  App:  http://localhost:3000/app/entrar.html
  Banco: local · Login: local · Fotos: local
```

Abra:

| Endereço | O quê |
|---|---|
| http://localhost:3000 | landing page |
| http://localhost:3000/app/entrar.html | login do app |
| http://localhost:3000/app/demo.html | demonstração (mesmo rodando a API) |
| http://localhost:3000/api/saude | a API está no ar? |

Para programar com a API reiniciando sozinha a cada mudança: `npm run dev` (usa `node --watch`).

### Modo local (sem `.env`)

Sem o arquivo `05_API/.env`, **tudo roda local**, sem nenhuma conta na internet:

| Parte | Onde fica |
|---|---|
| Banco | `05_API/dados-locais.json` (criado sozinho) |
| Login | contas criadas pela própria API, só e-mail e senha (Google não funciona neste modo) |
| Fotos | pasta `05_API/uploads/` |

Na primeira vez, a API grava as oficinas, os anúncios e as avaliações de exemplo. Crie uma conta em
**Criar conta**: a garagem começa vazia. Para ter os carros de exemplo na sua conta: Perfil >
**Restaurar dados de exemplo**.

Para começar do zero, pare a API e apague `dados-locais.json` e a pasta `uploads/`.

### Opcional: ligar Firebase e Cloudinary

1. Copie `05_API/.env.exemplo` para `05_API/.env`.
2. Preencha as variáveis (os nomes estão abaixo). O passo a passo de como criar o projeto no Firebase e a conta no
   Cloudinary está no [README da API](../05_API/README.md#ligar-o-firebase-e-o-cloudinary-passo-a-passo).
3. Rode `npm start` de novo. O terminal deve mostrar `Banco: firestore · Login: firebase · Fotos: cloudinary`.

| Variável | Para quê |
|---|---|
| `PORT` | porta (padrão 3000) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON inteiro da chave de serviço do Firebase (alternativa ao arquivo `serviceAccountKey.json` na pasta `05_API`) |
| `FIREBASE_KEY_FILE` | outro nome para o arquivo da chave (padrão `serviceAccountKey.json`) |
| `FIREBASE_API_KEY` | `apiKey` do app web do Firebase (liga o login pelo Firebase) |
| `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID` | opcionais; sem eles, saem da chave de serviço |
| `CLOUDINARY_URL` | endereço `cloudinary://...` do painel do Cloudinary |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | alternativa ao `CLOUDINARY_URL` |
| `ORIGENS_PERMITIDAS` | sites que podem chamar a API, separados por vírgula |
| `SEGREDO_LOCAL` | segredo que assina os tokens do modo local |
| `PASTA_FRONT` | pasta do site servida pela API (padrão `../04_LANDING`) |

Dá para ligar só uma parte. Exemplo: só o `CLOUDINARY_URL` deixa banco e login locais e manda as fotos para o
Cloudinary.

> **Nunca** coloque o `.env` nem o `serviceAccountKey.json` no Git. Os dois já estão no `.gitignore`.

### Testar no celular, na mesma rede Wi-Fi

Descubra o IP do computador (algo como `192.168.0.10`) e abra `http://192.168.0.10:3000` no celular.
Endereços `192.168.*` usam a API do próprio computador. O login com Google não funciona nesse endereço, a menos que
ele esteja nos domínios autorizados do Firebase.

## Problemas comuns

| Sintoma | Causa | O que fazer |
|---|---|---|
| `Error: listen EADDRINUSE ... :3000` | A porta 3000 já está em uso (outra API aberta, outro programa) | Feche o outro terminal, ou use outra porta: `PORT=3001 npm start` (Git Bash) ou `$env:PORT=3001; npm start` (PowerShell). Também dá para pôr `PORT=3001` no `.env`. |
| "Não consegui falar com o servidor. Confira a internet (ou se a API está ligada)." | A API não está rodando, ou caiu | Rode `npm start` na pasta `05_API` e confira http://localhost:3000/api/saude |
| O site publicado demora uns segundos e depois funciona | A API no Render (plano grátis) **dorme depois de 15 minutos** sem uso; o primeiro pedido acorda | Abra https://vexocar.onrender.com/api/saude antes de usar e espere responder (pode levar cerca de 1 minuto). O que a pessoa salvou fica na fila e é enviado quando a API acordar. |
| "Este endereço não está liberado no Firebase (Authentication > Settings > Authorized domains)." | O login com Google só funciona em domínios autorizados | No console do Firebase, em Authentication > Settings > Authorized domains, adicione o endereço que você está usando (veja [DEPLOY.md](DEPLOY.md#firebase-domínios-autorizados)). |
| "Entrar com Google precisa do Firebase ligado na API. Use e-mail e senha." | A API está no modo local | Use e-mail e senha, ou ligue o Firebase no `.env` |
| `FIREBASE_SERVICE_ACCOUNT não é um JSON válido.` no terminal | A variável foi colada com quebra ou aspas erradas | Cole o JSON inteiro numa linha só |
| "Esqueci a senha" diz que mandou, mas o e-mail não chega | No modo local nenhum e-mail é enviado | Só funciona com o Firebase ligado |
| O app abriu em demonstração sem querer | O modo ficou guardado no navegador | Abra qualquer tela com `?modo=api` no fim do endereço, ou volte pela landing |
| Mudei o JS ou o CSS e o navegador mostra o antigo | Cache do navegador | Recarregue com Ctrl+F5. Antes de publicar, suba o `?v=` (veja [DEPLOY.md](DEPLOY.md#versão-dos-arquivos-v)) |
| Mudei `dados.js` e os dados de exemplo não mudaram | O navegador e a API só recarregam o exemplo quando a `versao` muda | Suba o número de `versao` em `dados.js` |
