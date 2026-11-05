# API

API REST do VEXOcar, em `05_API/src`. Todas as rotas começam com `/api`.

| Ambiente | Endereço base |
|---|---|
| Computador | `http://localhost:3000` |
| Publicada (Render) | `https://vexocar.onrender.com` |

## Regras gerais

- Corpo e resposta em **JSON**. Limite do corpo: **5 MB**.
- **Login:** as rotas marcadas com "sim" exigem o cabeçalho `Authorization: Bearer <token>`.
  O token vem do Firebase Auth (modo Firebase) ou de `/api/auth/entrar` (modo local).
- **Erros** sempre no formato `{ "erro": "mensagem" }`.

| Código | Quando |
|---|---|
| `400` | Dado inválido (a mensagem diz qual) |
| `401` | Sem token ou token vencido: "Faça login para continuar." / "Sua sessão expirou. Entre de novo." |
| `403` | Registro de outra conta, ou carro que não está na garagem de quem pediu |
| `404` | Rota que não existe: "Rota não encontrada: MÉTODO /caminho" |
| `409` | Criar conta local com e-mail que já tem conta |
| `413` | Corpo ou foto grande demais |
| `500` | Erro no servidor: "Erro no servidor. Tente de novo." (o detalhe fica só no terminal) |

## Resumo das rotas

| Método | Rota | Login | Arquivo |
|---|---|---|---|
| GET | `/api/saude` | não | `rotas/publico.js` |
| GET | `/api/config` | não | `rotas/publico.js` |
| GET | `/api/publico/carros/:id` | não | `rotas/publico.js` |
| POST | `/api/fotos` | sim | `rotas/publico.js` |
| POST | `/api/auth/criar-conta` | não (só modo local) | `rotas/conta.js` |
| POST | `/api/auth/entrar` | não (só modo local) | `rotas/conta.js` |
| GET | `/api/estado` | sim | `rotas/conta.js` |
| PATCH | `/api/usuario` | sim | `rotas/conta.js` |
| POST | `/api/exemplo` | sim | `rotas/conta.js` |
| POST | `/api/carros/:id/transferir` | sim | `rotas/conta.js` |
| POST | `/api/anuncios/:id/visita` | sim | `rotas/conta.js` |
| PUT | `/api/:colecao/:id` | sim | `rotas/colecoes.js` |
| DELETE | `/api/:colecao/:id` | sim | `rotas/colecoes.js` |

## Rotas públicas

### `GET /api/saude`

Diz se a API está no ar e em que modo. Abra antes de uma apresentação para "acordar" o Render.

```json
{ "ok": true, "app": "VEXOcar API", "banco": "firestore", "login": "firebase", "fotos": "cloudinary", "hora": "2026-11-04T12:00:00.000Z" }
```

`banco` é `firestore` ou `local`; `login` é `firebase` ou `local`; `fotos` é `cloudinary` ou `local`.

### `GET /api/config`

Diz ao app como fazer login.

```json
{ "login": "firebase", "firebase": { "apiKey": "...", "authDomain": "...", "projectId": "..." } }
```

No modo local: `{ "login": "local", "firebase": null }`. A configuração web do Firebase é pública por natureza.

### `GET /api/publico/carros/:id`

Histórico público do QR code. Não precisa de login.

- **Sem valores em R$**, **sem a foto da nota fiscal** (só `nota: true/false`) e com a **placa mascarada**
  (`BRA2E19` vira `BRA***9`).
- `404` se o carro não existe: `{ "erro": "Histórico não encontrado." }`.

```json
{
  "carro": { "id": "c1", "marca": "Volkswagen", "modelo": "Polo", "versao": "1.0 TSI Highline", "ano": 2019,
             "km": 87400, "kmMes": 4200, "foto": "https://...", "cor": "Azul", "placa": "BRA***9" },
  "manutencoes": [ { "id": "m1", "carroId": "c1", "data": "2026-10-12", "km": 86900, "tipo": "oleo",
                     "servico": "Troca de óleo e filtro", "oficina": "Oficina do Zé", "nota": true } ],
  "pagamentos": [ { "id": "d1", "carroId": "c1", "tipo": "ipva", "ano": 2026, "data": "2026-01-19" } ]
}
```

## Fotos

### `POST /api/fotos` (login: sim)

Recebe uma foto e devolve o endereço dela. O navegador já reduz a foto antes de mandar.

| Campo do corpo | Tipo | Regra |
|---|---|---|
| `dados` | texto | data URL `data:image/jpeg;base64,...` (JPG, PNG ou WEBP), até **3 MB** |
| `pasta` | texto | `carros`, `notas` ou `anuncios` (outro valor vira `carros`) |

Resposta `201`: `{ "url": "https://..." }`.
No Cloudinary, a foto vai para a pasta `vexocar/<uid>/<pasta>`. No modo local, para `uploads/<uid>-<pasta>/`
e o endereço é `http://<servidor>/uploads/...`.

Erros: `400` "Mande a foto em JPG, PNG ou WEBP."; `413` "Foto grande demais (máximo 3 MB)."; `502` se o
Cloudinary recusar.

## Conta e perfil

### `POST /api/auth/criar-conta` (só modo local)

| Campo | Regra |
|---|---|
| `nome` | texto |
| `email` | e-mail válido (guardado em minúsculas) |
| `senha` | pelo menos 8 caracteres |
| `perfil` | `motorista` ou `dono` (outro valor vira `motorista`) |

Resposta `201`: `{ "token": "...", "uid": "u...", "email": "...", "exp": 1767225600000 }` (`exp` em milissegundos,
30 dias). Também cria o perfil em `usuarios`.
Erros: `400` e-mail ou senha inválidos; `409` "Esse e-mail já tem conta. Entre com ele.".
No modo Firebase responde `404` "O login é feito pelo Firebase.".

### `POST /api/auth/entrar` (só modo local)

Corpo: `{ "email": "...", "senha": "..." }`. Resposta igual à de criar conta.
Erro `401` "E-mail ou senha incorretos.".

### `GET /api/estado` (login: sim)

Tudo o que o app precisa para abrir. Antes de responder, entrega os carros que alguém transferiu para esta pessoa
(veja a transferência abaixo). Se o perfil ainda não existe (primeiro acesso pelo Firebase), ele é criado.

```json
{
  "usuario": { "nome": "...", "email": "...", "perfil": "motorista", "cidade": "Curitiba, PR", "desde": "2026-11", "whatsapp": "" },
  "notificacoes": { "revisao": true, "documentos": true, "interessados": true },
  "favoritos": ["a4"],
  "vistos": { "c1:rev90000": true },
  "carros": [], "manutencoes": [], "pagamentos": [], "meusAnuncios": [], "transferidos": [],
  "oficinas": [], "anuncios": [], "avaliacoes": [],
  "anunciosComunidade": []
}
```

- `carros`, `manutencoes`, `pagamentos`, `meusAnuncios` e `transferidos` são só da pessoa (sem os campos internos
  `uid` e `atualizadoEm`).
- `oficinas`, `anuncios` (de exemplo) e `avaliacoes` são de todos. Cada avaliação vem com `minha: true/false`.
- `anunciosComunidade`: anúncios **ativos de outras pessoas**, com o carro (placa mascarada) e o histórico
  (sem foto da nota; com `valor` só se o dono marcou "mostrar valores"), do mais novo para o mais antigo.

### `PATCH /api/usuario` (login: sim)

Muda só os campos enviados. Campos aceitos: `nome`, `email`, `perfil`, `cidade`, `desde`, `whatsapp`,
`notificacoes`, `favoritos`, `vistos`.

| Regra | Erro |
|---|---|
| `nome` com pelo menos 2 letras | `400` "Digite seu nome." |
| `perfil` diferente de `motorista`/`dono` vira `motorista` | — |
| `favoritos` que não é lista vira `[]` | — |
| `whatsapp`: só dígitos, no máximo 13; se informado, pelo menos 10 | `400` "WhatsApp com DDD, só números (ex.: 41 99999-9999)." |

Resposta: `{ "ok": true }`.

### `POST /api/exemplo` (login: sim)

**Apaga** os carros, manutenções, pagamentos, anúncios e transferidos da conta e grava os **carros de exemplo**
de `dados.js` (hoje: Polo, CR-V e Camry) com os históricos. Os ids ganham um sufixo aleatório para não colidir
entre contas (`c1` vira `c1-ab12cd`). Também volta favoritos, alertas lidos e notificações ao exemplo.

Resposta: `{ "ok": true, "carros": 3, "manutencoes": 18 }`.

## Vitrine e transferência

### `POST /api/carros/:id/transferir` (login: sim)

Passa o carro, as manutenções e os pagamentos para a conta do comprador.

| Campo | Regra |
|---|---|
| `para` | e-mail ou celular com DDD (pelo menos 10 dígitos) do comprador |
| `anuncioId` | opcional; se for da pessoa, o anúncio é marcado como vendido |

Resposta: `{ "ok": true, "status": "transferido", "carroId": "..." }` quando o comprador já tem conta, ou
`"status": "esperando"` quando ainda não tem (o carro é entregue quando ele entrar com aquele e-mail ou cadastrar
aquele WhatsApp).

Erros: `403` "Esse carro não está na sua garagem."; `400` "Informe o e-mail ou o celular com DDD do comprador."
ou "Esse contato é o seu. Informe o do comprador.".

### `POST /api/anuncios/:id/visita` (login: sim)

Soma 1 visita no anúncio. Não conta se o anúncio é da própria pessoa ou não existe. Resposta: `{ "ok": true }`.

## Coleções da pessoa (CRUD)

### `PUT /api/:colecao/:id` (login: sim)

Cria ou troca o documento inteiro. O **id vem do app**. Resposta `201` (criou) ou `200` (atualizou):
`{ "ok": true }`. A API grava junto o `uid` do dono e `atualizadoEm`.

### `DELETE /api/:colecao/:id` (login: sim)

Apaga. Se já não existe, responde `{ "ok": true }` do mesmo jeito.

**Coleções aceitas:** `carros`, `manutencoes`, `pagamentos`, `meusAnuncios`, `transferidos`, `avaliacoes`.
Qualquer outro nome cai no `404`. O `id` precisa ter de 1 a 80 caracteres entre letras, números, `_` e `-`.

**Validação de cada coleção** (`REGRAS` em `rotas/colecoes.js`):

| Coleção | Regras |
|---|---|
| `carros` | `marca` e `modelo` com texto; `ano` de 1950 até o ano atual + 1; `placa` no formato `ABC1234` ou `ABC1D23` (maiúsculas, sem hífen); `km` de 0 a 3.000.000; `kmMes` de 0 a 50.000 |
| `manutencoes` | `carroId`; `data` no formato `AAAA-MM-DD`; `km` de 0 a 3.000.000; `servico` com texto; `valor` de 0 a 10.000.000; `tipo` em `revisao`, `oleo`, `freios`, `pneus`, `suspensao`, `eletrica`, `outro` |
| `pagamentos` | `carroId`; `tipo` em `ipva` ou `licenciamento`; `ano` de 2000 a 2100; `data` `AAAA-MM-DD`; `valor` de 0 a 1.000.000 |
| `meusAnuncios` | `carroId`; `preco` de 1 a 100.000.000 |
| `transferidos` | `marca` e `modelo` com texto |
| `avaliacoes` | `oficinaId`; `nota` de 1 a 5 |

**Outras regras do PUT:**

- Foto em base64 (`data:image/...` grande, que não seja SVG) é recusada: "Envie a foto para /api/fotos primeiro.".
- Registro que já existe e é de outra conta: `403` "Esse registro é de outra conta.".
- `manutencoes`, `pagamentos` e `meusAnuncios` só entram se o `carroId` for um carro (ou carro transferido) da
  pessoa: senão `403` "Esse carro não está na sua garagem.".
- Em `avaliacoes`, o servidor preenche o `autor` com o nome do perfil.
- Em `meusAnuncios`, o servidor mantém o **maior** número de visitas (o app do dono pode estar com um número antigo).
- O campo `minha` enviado pelo app é ignorado.

## Arquivos que não são `/api`

A mesma API serve:

- `/uploads/...`: as fotos do modo local (cache de 7 dias);
- o site da pasta `04_LANDING`, com endereços sem `.html` (ex.: `/app/garagem`);
- `404.html` para qualquer outro endereço.
