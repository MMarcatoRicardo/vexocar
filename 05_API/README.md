# VEXOcar API

Back-end do VEXOcar: API REST em **Node.js + Express**, banco **Firestore**, login **Firebase Auth**
(e-mail/senha e Google) e fotos no **Cloudinary**. A API também serve o site e o app (pasta `../04_LANDING`).

## Rodar no computador

```bash
cd 05_API
npm install      # só na primeira vez
npm start        # abre em http://localhost:3000  (app: http://localhost:3000/app/entrar.html)
```

Sem `.env`, tudo roda no **modo local**: banco no arquivo `dados-locais.json`, contas criadas pela própria API
(senha com scrypt) e fotos na pasta `uploads/`. Serve para programar e testar sem internet.
Com o `.env` preenchido (veja `.env.exemplo`), cada parte passa sozinha para Firestore, Firebase Auth e Cloudinary.
O terminal mostra o modo de cada uma ao ligar.

## Os dois modos do app

| Como abre | Modo | Dados |
|---|---|---|
| Arquivo direto (`file://`) ou `?modo=demo` | Demonstração | No navegador (plano B da apresentação) |
| Pelo servidor (`http://localhost:3000` ou site publicado) | API | No banco, com login de verdade (`?modo=api` volta para este) |

As telas não mudaram: continuam chamando `VX.db()` e `VX.salvar(d)`. O arquivo `app/js/api.js` compara o que
mudou, coloca numa **fila** guardada no navegador e manda para a API um pedido por vez. Se a internet cair ou a
pessoa trocar de tela, nada se perde: a fila continua na próxima tela. Fotos sobem antes para `/api/fotos`.

## Rotas

| Método | Rota | Login | O que faz |
|---|---|---|---|
| GET | `/api/saude` | não | A API está no ar? (abra antes da apresentação para "acordar" o Render) |
| GET | `/api/config` | não | Modo de login e config pública do Firebase |
| POST | `/api/auth/criar-conta` · `/api/auth/entrar` | não | Login do modo local (no modo Firebase quem faz é o Firebase) |
| GET | `/api/estado` | sim | Tudo o que o app precisa: perfil, carros, manutenções, pagamentos, anúncios, oficinas |
| PATCH | `/api/usuario` | sim | Nome, e-mail, perfil, notificações, favoritos, alertas lidos |
| PUT / DELETE | `/api/:colecao/:id` | sim | Cria, altera ou apaga: `carros`, `manutencoes`, `pagamentos`, `meusAnuncios`, `transferidos`, `avaliacoes` |
| POST | `/api/fotos` | sim | Recebe a foto (base64) e devolve o endereço |
| POST | `/api/exemplo` | sim | Troca os carros da conta pelos 3 carros de exemplo (Polo, CR-V e Camry) |
| GET | `/api/publico/carros/:id` | não | Histórico do QR code: sem valores em R$, placa mascarada, sem foto da nota |

Segurança: todo documento leva o `uid` do dono e a API só deixa o dono ler e alterar; cada coleção tem validação
(placa, ano, km, datas, valores); manutenção e pagamento só entram em carro da própria garagem.

## Estrutura

```
src/servidor.js      liga tudo (CORS, JSON, rotas, site)
src/config.js        lê o .env e escolhe os modos
src/auth.js          confere o token (Firebase ou local)
src/banco/           index.js escolhe: firestore.js ou local.js (mesmas 6 funções)
src/fotos.js         Cloudinary ou pasta uploads/
src/exemplo.js       dados de exemplo (lê ../04_LANDING/app/js/dados.js)
src/rotas/           conta.js, colecoes.js, publico.js
```

## Ligar o Firebase e o Cloudinary (passo a passo)

1. **Firebase:** console.firebase.google.com > Adicionar projeto `vexocar` (pode desligar o Analytics).
2. **Firestore:** Criação > Firestore Database > Criar banco > região `southamerica-east1` > modo de produção
   (ninguém acessa direto; só a API, pela chave de serviço).
3. **Login:** Criação > Authentication > Começar > ative **E-mail/senha** e **Google**.
4. **Config web:** engrenagem > Configurações do projeto > Seus apps > ícone `</>` > registre `vexocar-web`.
   Copie o `apiKey` para `FIREBASE_API_KEY` no `.env`.
5. **Chave de serviço:** Configurações do projeto > Contas de serviço > Gerar nova chave privada.
   Salve o arquivo como `05_API/serviceAccountKey.json` (está no `.gitignore`; nunca mande para ninguém).
6. **Cloudinary:** cloudinary.com > cadastro grátis > Dashboard > copie a "API environment variable" para `CLOUDINARY_URL`.
7. `npm start` de novo: o terminal deve mostrar `Banco: firestore · Login: firebase · Fotos: cloudinary`.
