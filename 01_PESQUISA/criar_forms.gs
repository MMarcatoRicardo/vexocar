/**
 * VEXOcar - Pesquisa de campo (Projeto Integrador, Design Profissional)
 * Versão 2: refaz o formulário JÁ PUBLICADO, mantendo o mesmo link.
 *
 * Como usar:
 * 1. No mesmo projeto do script.google.com, apague o código antigo e cole este arquivo inteiro
 * 2. Escolha a função reconstruirPesquisaVexocar e clique em Executar
 * 3. Veja em "Registro de execução" a ordem final das perguntas e o link da nova planilha
 *
 * ATENÇÃO: APAGAR_RESPOSTAS = true apaga as respostas já recebidas (as de teste).
 * Se alguém de verdade já respondeu e você quer guardar, troque para false antes de executar.
 *
 * Fluxo:
 * Perfil -> Motorista de app -> Compra e venda -> Final -> Enviar
 *        -> Dono(a) de carro -> Compra e venda -> Final -> Enviar
 *        -> Nenhuma das opções -> Obrigado! -> Enviar
 */
var FORM_ID = '1ty6h6DDFj26c2rbqKg4JHhhiKaH-mXOZr1QMWAaXKdc';
var APAGAR_RESPOSTAS = true;

function reconstruirPesquisaVexocar() {
  var form = FormApp.openById(FORM_ID);

  // Limpa o formulário antigo
  if (APAGAR_RESPOSTAS) form.deleteAllResponses();
  limparFormulario_(form);

  form.setTitle('VEXOcar | Pesquisa sobre manutenção de carros');
  form.setDescription(
    'Olá! Somos estudantes de Engenharia de Software e Sistemas de Informação da Universidade Positivo e estamos criando o VEXOcar, ' +
    'um aplicativo que guarda o histórico de manutenção do carro, lembra das revisões e ajuda na hora de vender.\n\n' +
    'A pesquisa é para motoristas de aplicativo e para quem tem carro. Leva cerca de 4 minutos e é anônima. ' +
    'Não existe resposta certa: queremos saber como é no seu dia a dia. Obrigado! 🚗'
  );
  form.setProgressBar(true);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage('Muito obrigado! Sua resposta vai ajudar a construir o VEXOcar. 🏁');

  // ---------- Perfil (primeira pergunta) ----------
  var perfil = form.addMultipleChoiceItem()
    .setTitle('Qual opção descreve melhor você hoje?')
    .setHelpText('Se você dirige por aplicativo e também usa o carro no dia a dia, escolha "Dirijo por aplicativo".')
    .setRequired(true);

  // ---------- Seção A: motorista de aplicativo ----------
  var pagA = form.addPageBreakItem()
    .setTitle('Motorista de aplicativo')
    .setHelpText('As perguntas abaixo são sobre o carro que você usa para trabalhar no aplicativo.');

  form.addMultipleChoiceItem()
    .setTitle('Há quanto tempo você dirige por aplicativo?')
    .setChoiceValues(['Menos de 6 meses', 'De 6 meses a 1 ano', 'De 1 a 3 anos', 'Mais de 3 anos'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('O carro que você usa para rodar no aplicativo é:')
    .setChoiceValues(['Meu, já quitado', 'Meu, ainda financiado', 'Alugado (de locadora ou de outra pessoa)', 'Emprestado de familiar ou amigo'])
    .setRequired(true);

  anoCarro_(form);

  form.addMultipleChoiceItem()
    .setTitle('Em uma semana normal, quantos quilômetros você roda com esse carro?')
    .setHelpText('Some as corridas e os deslocamentos. Pode ser um valor aproximado.')
    .setChoiceValues(['Até 500 km', 'De 500 a 1.000 km', 'De 1.000 a 2.000 km', 'Mais de 2.000 km', 'Não sei'])
    .setRequired(true);

  controle_(form);

  form.addMultipleChoiceItem()
    .setTitle('Nos últimos 12 meses, você ficou algum dia sem trabalhar porque o carro quebrou ou precisou de um conserto que você não esperava?')
    .setChoiceValues(['Sim, mais de uma vez', 'Sim, uma vez', 'Não'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Em média, quanto você gasta por mês com a manutenção do carro?')
    .setHelpText('Conte revisões, peças, pneus e consertos. Não conte combustível.')
    .setChoiceValues(['Até R$ 200', 'De R$ 200 a R$ 500', 'De R$ 500 a R$ 1.000', 'Mais de R$ 1.000', 'Não sei'])
    .setRequired(true);

  esquecimento_(form);

  form.addScaleItem()
    .setTitle('Para você, quão difícil é encontrar uma oficina de confiança perto de onde você mora ou trabalha?')
    .setBounds(1, 5)
    .setLabels('Muito fácil', 'Muito difícil')
    .setRequired(true);

  dorDeCabeca_(form);

  // ---------- Seção B: dono(a) de carro ----------
  var pagB = form.addPageBreakItem()
    .setTitle('Dono(a) de carro')
    .setHelpText('As perguntas abaixo são sobre o carro que você (ou sua família) usa no dia a dia.');

  form.addCheckboxItem()
    .setTitle('Para que você mais usa o carro?')
    .setHelpText('Marque todas as opções que se aplicam.')
    .setChoiceValues(['Ir e voltar do trabalho ou da faculdade', 'Levar e buscar a família', 'Passeios, fins de semana e viagens', 'Trabalho (visitas a clientes, entregas)'])
    .showOtherOption(true)
    .setRequired(true);

  anoCarro_(form);

  form.addMultipleChoiceItem()
    .setTitle('Em um mês normal, quantos quilômetros você roda com o carro?')
    .setHelpText('Pode ser um valor aproximado.')
    .setChoiceValues(['Até 500 km', 'De 500 a 1.000 km', 'De 1.000 a 2.000 km', 'Mais de 2.000 km', 'Não sei'])
    .setRequired(true);

  controle_(form);

  form.addMultipleChoiceItem()
    .setTitle('Sem consultar nenhum papel ou adesivo: você sabe quando foi a última troca de óleo do seu carro?')
    .setChoiceValues(['Sim, sei a data ou a quilometragem', 'Sei mais ou menos (o mês aproximado)', 'Não sei'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Você guarda as notas fiscais e os comprovantes dos serviços feitos no carro?')
    .setChoiceValues(['Sim, guardo todos e sei onde estão', 'Guardo alguns, mas muitos se perdem', 'Não guardo'])
    .setRequired(true);

  esquecimento_(form);

  form.addCheckboxItem()
    .setTitle('Quando o carro precisa de manutenção ou conserto, como você escolhe a oficina?')
    .setHelpText('Marque todas as opções que se aplicam.')
    .setChoiceValues(['Indicação de amigos ou família', 'A que fica mais perto', 'A que cobra mais barato', 'Pelas avaliações no Google ou no Maps', 'Vou sempre na mesma', 'Levo na concessionária'])
    .showOtherOption(true)
    .setRequired(true);

  dorDeCabeca_(form);

  // ---------- Seção D: compra e venda ----------
  form.addPageBreakItem()
    .setTitle('Compra e venda de carro usado')
    .setHelpText('Quase lá!');

  form.addMultipleChoiceItem()
    .setTitle('Você já comprou ou vendeu um carro usado?')
    .setChoiceValues(['Já comprei', 'Já vendi', 'Já comprei e já vendi', 'Nunca'])
    .setRequired(true);

  form.addScaleItem()
    .setTitle('Na compra de um carro usado, quando o vendedor diz que "as revisões estão em dia", quanto você acredita nisso?')
    .setBounds(1, 5)
    .setLabels('Não acredito', 'Acredito totalmente')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Imagine dois carros iguais à venda, mas só um deles tem o histórico de manutenção comprovado (notas fiscais, datas e oficinas). O que você faria?')
    .setChoiceValues(['Pagaria mais pelo carro com histórico', 'Pagaria o mesmo valor, mas escolheria o carro com histórico', 'Tanto faz, não faria diferença para mim'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Onde você procuraria ou anunciaria um carro usado?')
    .setHelpText('Marque todas as opções que se aplicam.')
    .setChoiceValues(['OLX', 'Webmotors', 'iCarros', 'Marketplace do Facebook', 'Concessionária ou loja de carros', 'Com amigos e família'])
    .showOtherOption(true)
    .setRequired(true);

  // ---------- Seção F: final ----------
  form.addPageBreakItem()
    .setTitle('Última parte: o que você usaria no VEXOcar?');

  form.addGridItem()
    .setTitle('O VEXOcar pode ter as funções abaixo. Dê uma nota de 1 a 5 para o quanto você usaria cada uma.')
    .setHelpText('1 = não usaria  |  5 = usaria muito')
    .setRows([
      'Lembretes de revisão, troca de óleo, IPVA e licenciamento',
      'Histórico do carro com as fotos das notas fiscais dos serviços',
      'Mapa com oficinas próximas e avaliações de outros motoristas',
      'Anunciar o carro para venda com o histórico de manutenção junto',
      'Consultar o valor do carro na tabela FIPE',
      'Painel mostrando quanto você gasta com o carro por mês e por quilômetro'
    ])
    .setColumns(['1', '2', '3', '4', '5'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Você usaria um aplicativo como o VEXOcar?')
    .setChoiceValues(['Sim, com certeza', 'Talvez', 'Não'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Se o VEXOcar fosse pago, quanto você pagaria por mês?')
    .setChoiceValues(['Nada, só usaria se fosse grátis', 'Até R$ 9,90', 'De R$ 10 a R$ 20', 'Mais de R$ 20'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Qual a sua idade?')
    .setChoiceValues(['Até 24 anos', 'De 25 a 34 anos', 'De 35 a 44 anos', 'De 45 a 59 anos', '60 anos ou mais'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Tem alguma função que você gostaria que o VEXOcar tivesse? (opcional)')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Topa uma conversa rápida de 5 minutos para contar mais? Se sim, deixe seu WhatsApp. (opcional)')
    .setHelpText('Usado só para essa conversa da pesquisa acadêmica. Não será divulgado.')
    .setRequired(false);

  // ---------- Página de agradecimento (quem não é do público) ----------
  var pagObrigado = form.addPageBreakItem()
    .setTitle('Obrigado!')
    .setHelpText(
      'Esta pesquisa é voltada para motoristas de aplicativo e para quem tem carro, então ela termina por aqui para você.\n\n' +
      'Agradecemos muito pelo seu tempo! Se conhecer alguém que dirige, compartilhe o link com essa pessoa. 🚗\n\n' +
      'Clique em "Enviar" para finalizar.'
    );

  // ---------- Ramificação ----------
  perfil.setChoices([
    perfil.createChoice('Dirijo por aplicativo (Uber, 99, inDrive...)', pagA),
    perfil.createChoice('Tenho carro para uso pessoal ou da família', pagB),
    perfil.createChoice('Nenhuma das opções', pagObrigado)
  ]);
  pagB.setGoToPage(paginaPorTitulo_(form, 'Compra e venda de carro usado')); // fim da seção A -> pula a B
  pagObrigado.setGoToPage(FormApp.PageNavigationType.SUBMIT);                 // fim da seção Final -> envia

  // ---------- Planilha nova e limpa ----------
  try { form.removeDestination(); } catch (e) {}
  var planilha = SpreadsheetApp.create('VEXOcar | Respostas da pesquisa (v2)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());
  form.setAcceptingResponses(true);

  Logger.log('LINK PARA ENVIAR (o mesmo de antes): ' + form.getPublishedUrl());
  Logger.log('Planilha de respostas (nova): ' + planilha.getUrl());
  Logger.log('Ordem final:');
  form.getItems().forEach(function (it, n) {
    var sec = it.getType() === FormApp.ItemType.PAGE_BREAK;
    Logger.log((sec ? '== SEÇÃO: ' : '   ' + n + '. ') + it.getTitle());
  });
}

// ---------- Perguntas usadas nas duas seções ----------
function anoCarro_(form) {
  form.addMultipleChoiceItem()
    .setTitle('Em que ano o seu carro foi fabricado?')
    .setChoiceValues(['2022 ou mais novo', 'Entre 2018 e 2021', 'Entre 2013 e 2017', '2012 ou mais antigo', 'Não sei'])
    .setRequired(true);
}

function controle_(form) {
  form.addCheckboxItem()
    .setTitle('Hoje, como você sabe quando está na hora de fazer a manutenção do carro (troca de óleo, revisão, pneus)?')
    .setHelpText('Marque todas as opções que você usa.')
    .setChoiceValues(['Não acompanho, só levo quando dá problema', 'Guardo de cabeça', 'Anoto em caderno ou papel', 'Uso uma planilha',
                      'Uso um aplicativo', 'Pelo adesivo de troca de óleo no para-brisa', 'A oficina ou a concessionária me avisa'])
    .showOtherOption(true)
    .setRequired(true);
}

function esquecimento_(form) {
  form.addCheckboxItem()
    .setTitle('Nos últimos 2 anos, você esqueceu ou atrasou algum destes?')
    .setHelpText('Marque todos que aconteceram.')
    .setChoiceValues(['Revisão ou troca de óleo', 'Pagamento do IPVA', 'Licenciamento', 'Renovação do seguro', 'Troca de pneus', 'Nenhum, nunca esqueci'])
    .setRequired(true);
}

function dorDeCabeca_(form) {
  form.addParagraphTextItem()
    .setTitle('Qual é a sua maior dor de cabeça com a manutenção do carro? Se lembrar, conte uma situação. (opcional)')
    .setRequired(false);
}

// O Google não deixa apagar uma seção que ainda é destino de um desvio.
// Ordem segura: 1) apaga as perguntas (inclusive a de perfil, com os desvios),
// 2) desliga o "ir para" das seções, 3) apaga as seções.
function limparFormulario_(form) {
  var itens = form.getItems();
  for (var i = itens.length - 1; i >= 0; i--) {
    if (itens[i].getType() !== FormApp.ItemType.PAGE_BREAK) form.deleteItem(itens[i]);
  }
  var secoes = form.getItems(FormApp.ItemType.PAGE_BREAK);
  secoes.forEach(function (s) { s.asPageBreakItem().setGoToPage(FormApp.PageNavigationType.CONTINUE); });
  for (var j = secoes.length - 1; j >= 0; j--) form.deleteItem(secoes[j]);
}

function paginaPorTitulo_(form, titulo) {
  return form.getItems(FormApp.ItemType.PAGE_BREAK).filter(function (it) {
    return it.getTitle() === titulo;
  })[0].asPageBreakItem();
}
