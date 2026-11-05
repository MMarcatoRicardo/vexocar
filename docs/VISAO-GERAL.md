# Visão geral

## O problema

Quem tem carro costuma guardar o histórico de manutenção "de cabeça", num papel ou no adesivo do para-brisa.
Com isso acontecem três coisas:

- **Esquece prazos.** Revisão, troca de óleo, IPVA e licenciamento passam da data.
- **Perde a prova.** Notas fiscais se perdem. Na hora de vender, o dono diz que "as revisões estão em dia",
  mas não tem como mostrar.
- **Não sabe quanto o carro custa.** Sem os gastos somados, ninguém sabe o custo por quilômetro.
  Para quem dirige por aplicativo, esse número entra direto na conta de cada corrida.

## Público

| Perfil | Como o app trata |
|---|---|
| **Motorista de app** (Uber, 99, inDrive...) | Roda muito por mês. O painel mostra o **custo por km em destaque**, "para entrar na conta da corrida". |
| **Dono(a) de carro** (uso pessoal ou da família) | O painel destaca o gasto do mês e o que está para vencer. |

O perfil é escolhido ao criar a conta e pode ser trocado no Perfil. A pesquisa com o público usa os mesmos dois
perfis (veja [PESQUISA.md](PESQUISA.md)).

## Proposta de valor

> **O prontuário digital do seu carro.** Lembra das revisões, acha oficina perto de você e, na hora de vender,
> vira um anúncio com histórico comprovado.

1. **Nunca mais esquecer a revisão:** alertas por km e por data, mais IPVA e licenciamento pelo final da placa.
2. **Histórico que vale dinheiro:** cada serviço com data, km, peças, valor e a foto da nota fiscal.
   Com a nota anexada, o serviço aparece como **comprovado**. Na venda, o histórico vira PDF com QR code.
3. **Oficina perto de você:** mapa com oficinas, avaliações de quem usa, horário e WhatsApp.
4. **Vitrine com histórico:** o carro é anunciado junto com o prontuário e, depois da venda, o prontuário é
   **transferido para a conta do comprador**.

## Escopo por nível

O escopo foi dividido em níveis desde os wireframes (o nível de cada tela está em `03_WIREFRAMES/gerar_wireframes.py`).

| Nível | O que entra | Telas |
|---|---|---|
| **MVP** | Conta, garagem, carros, manutenções com nota fiscal, alertas, nota de saúde, histórico em PDF e página pública do QR code | `entrar`, `criar-conta`, `esqueci-senha`, `garagem` (cheia e vazia), `adicionar-carro`, `carro`, `nova-manutencao`, `alertas`, `historico-pdf`, `h`, `perfil` |
| **Nível 2: vitrine** | Anunciar o carro com o histórico, comparar com a FIPE, falar com o vendedor pelo WhatsApp, marcar vendido e transferir o prontuário | `vitrine`, `anuncio`, `anunciar`, `vendido` |
| **Nível 3: oficinas** | Mapa e lista de oficinas, distância, "aberta agora", perfil da oficina, avaliações dos usuários | `oficinas`, `oficina` |
| **Extras** | Painel de gastos com custo por km, app instalável (PWA), modo demonstração, termos e privacidade | `gastos`, `demo`, `termos` |

A descrição de cada tela está em [FUNCIONALIDADES.md](FUNCIONALIDADES.md).

## O que ficou fora e por quê

| Ideia | Situação | Por quê |
|---|---|---|
| **Oficina usando o app** (perfil da oficina que registra o serviço e o dono aprova) | Fora. Estava nos wireframes (telas 13 e 20), foi retirada em 04/11/2026. | O registro fica com o dono do carro. A prova do serviço é a **nota fiscal anexada**. Os termos deixam claro: o selo verde quer dizer "com nota fiscal anexada", não que alguém conferiu o serviço. |
| **Pagamento dentro do app** | Fora. | O VEXOcar não vende carros nem intermedia pagamentos. O contato entre comprador e vendedor (e com a oficina) é pelo **WhatsApp**. |
| **Modo offline** | Fora (decisão de 04/11/2026). | O service worker existe só para o app poder ser instalado. As telas sempre vêm da rede; sem internet aparece uma página "Sem internet". |
| **Tabela FIPE de verdade** | Ainda não. | O valor FIPE hoje é **de exemplo** (`app/js/vitrine.js`). O código já indica que, na versão final, ele viria da API pública da FIPE. |
| **Oficinas reais do mapa** | Ainda não. | As 6 oficinas são de exemplo, em Curitiba (`app/js/dados.js`). A tela avisa que, na versão final, elas viriam do OpenStreetMap. |
| **Envio de notificações** | Ainda não. | O Perfil guarda as preferências (revisão, documentos, interessados), mas o app não envia notificações. Os avisos aparecem na tela de Alertas e no número do menu. |
| **Favoritar oficina** | Só visual. | O coração na tela da oficina não é salvo. Favoritos de anúncios são salvos. |

## Equipe

| Integrante | Curso | Função |
|---|---|---|
| Ricardo Medeiros Marcato | Engenharia de Software | Tech Lead e Marca: arquitetura, banco, deploy, integração |
| Daniel Ribeiro da Costa | Engenharia de Software | UX/UI e Protótipo: telas e front-end |
| Lucas Markovicz Costa | Sistemas de Informação | Pesquisa e Produto (PO): API e relatório |

Orientação: Prof. Sedenilso Machado. Segmento do Projeto Integrador: **Hub Digital de Manutenção e Histórico Veicular**.
