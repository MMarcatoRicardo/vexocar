/* VEXOcar · dados de exemplo (etapa 5, só front-end).
   Na etapa 7 estes dados passam a vir da API (Express + Firestore). Até lá, ficam no navegador (localStorage).
   Para voltar ao começo: Perfil > "Restaurar dados de exemplo".
   A prova de cada serviço é a nota fiscal anexada (nota: true). A oficina não usa o app (decisão de 04/11/2026). */
window.VX_DADOS = {
  versao: 5, // subir quando os dados de exemplo mudarem (o navegador recarrega o exemplo)
  hoje: '2026-11-03', // data fixa para a demonstração ficar sempre igual

  // WhatsApp de TODOS os vendedores e oficinas de exemplo (whatsapp: 'demo').
  // Use um número do grupo, só com dígitos e DDI+DDD, ex.: '55DDNNNNNNNNN'. Vazio = o WhatsApp abre a lista de contatos.
  // Atenção: este arquivo vai para o GitHub (público) na etapa 12.
  contatoDemo: '',

  usuario: { nome: 'Ricardo Medeiros', email: 'ricardo@exemplo.com', perfil: 'motorista', cidade: 'Curitiba, PR', desde: '2026-03' },

  carros: [
    { id: 'c1', marca: 'Volkswagen', modelo: 'Polo', versao: '1.0 TSI Highline', ano: 2019, placa: 'BRA2E19', km: 87400, kmMes: 4200, foto: '../img/carros/polo.jpg', cor: 'Azul' },
    { id: 'c2', marca: 'Honda', modelo: 'CR-V', versao: 'EXL 2.0', ano: 2017, placa: 'QTP4C37', km: 61050, kmMes: 1100, foto: '../img/carros/crv.jpg', cor: 'Branco' }
  ],

  // tipo: revisao | oleo | freios | pneus | suspensao | eletrica | outro
  manutencoes: [
    { id: 'm1', carroId: 'c1', data: '2026-10-12', km: 86900, tipo: 'oleo', servico: 'Troca de óleo e filtro', pecas: 'Óleo 5W40 sintético, filtro de óleo', valor: 389.90, oficina: 'Oficina do Zé', oficinaId: 'o1', nota: true },
    { id: 'm2', carroId: 'c1', data: '2026-08-21', km: 83100, tipo: 'freios', servico: 'Pastilhas de freio dianteiras', pecas: 'Jogo de pastilhas Bosch', valor: 420.00, oficina: 'Freios & Cia', oficinaId: 'o5', nota: true },
    { id: 'm3', carroId: 'c1', data: '2026-06-10', km: 80200, tipo: 'revisao', servico: 'Revisão dos 80.000 km', pecas: 'Filtros de ar, cabine e combustível, velas', valor: 1180.00, oficina: 'Oficina do Zé', oficinaId: 'o1', nota: true },
    { id: 'm4', carroId: 'c1', data: '2026-04-02', km: 76300, tipo: 'oleo', servico: 'Troca de óleo e filtro', pecas: 'Óleo 5W40 sintético, filtro de óleo', valor: 359.90, oficina: 'Oficina do Zé', oficinaId: 'o1', nota: true },
    { id: 'm5', carroId: 'c1', data: '2026-01-15', km: 71800, tipo: 'suspensao', servico: 'Amortecedores traseiros', pecas: '2 amortecedores Cofap', valor: 980.00, oficina: 'Mecânica Boa Vista', oficinaId: 'o3', nota: true },
    { id: 'm6', carroId: 'c1', data: '2025-11-20', km: 67500, tipo: 'oleo', servico: 'Troca de óleo e filtro', pecas: 'Óleo 5W40 sintético, filtro de óleo', valor: 339.90, oficina: 'Oficina do Zé', oficinaId: 'o1', nota: false },
    { id: 'm7', carroId: 'c1', data: '2025-09-05', km: 63000, tipo: 'pneus', servico: 'Troca dos 4 pneus', pecas: '4 pneus 195/55 R16', valor: 2240.00, oficina: 'Auto Center Veloz', oficinaId: 'o2', nota: true },
    { id: 'm8', carroId: 'c1', data: '2025-06-18', km: 59800, tipo: 'revisao', servico: 'Revisão dos 60.000 km', pecas: 'Filtros, fluido de freio, correia', valor: 1450.00, oficina: 'Concessionária VW', oficinaId: null, nota: true },
    { id: 'm9', carroId: 'c2', data: '2026-03-14', km: 58200, tipo: 'oleo', servico: 'Troca de óleo e filtro', pecas: 'Óleo 0W20, filtro de óleo', valor: 420.00, oficina: 'Auto Center Veloz', oficinaId: 'o2', nota: true },
    { id: 'm10', carroId: 'c2', data: '2025-09-20', km: 52000, tipo: 'revisao', servico: 'Revisão dos 50.000 km', pecas: 'Filtros, fluido de freio, velas', valor: 1690.00, oficina: 'Concessionária Honda', oficinaId: null, nota: true },
    { id: 'm11', carroId: 'c2', data: '2025-05-08', km: 49100, tipo: 'eletrica', servico: 'Bateria nova', pecas: 'Bateria Moura 60 Ah', valor: 610.00, oficina: 'Elétrica Curitibana', oficinaId: 'o4', nota: false },
    { id: 'm12', carroId: 'c2', data: '2024-10-02', km: 44800, tipo: 'pneus', servico: 'Alinhamento e balanceamento', pecas: '', valor: 160.00, oficina: 'Auto Center Veloz', oficinaId: 'o2', nota: false }
  ],

  // IPVA e licenciamento pagos (entram na linha do tempo; o que falta pagar vira alerta). Valores de exemplo.
  pagamentos: [
    { id: 'd1', carroId: 'c1', tipo: 'ipva', ano: 2026, data: '2026-01-19', valor: 1342.60 },
    { id: 'd2', carroId: 'c1', tipo: 'licenciamento', ano: 2026, data: '2026-10-20', valor: 186.12 },
    { id: 'd3', carroId: 'c1', tipo: 'ipva', ano: 2025, data: '2025-01-17', valor: 2465.40 },
    { id: 'd4', carroId: 'c1', tipo: 'licenciamento', ano: 2025, data: '2025-12-10', valor: 179.80 },
    { id: 'd5', carroId: 'c2', tipo: 'ipva', ano: 2026, data: '2026-01-17', valor: 2003.50 },
    { id: 'd6', carroId: 'c2', tipo: 'ipva', ano: 2025, data: '2025-01-15', valor: 3712.00 },
    { id: 'd7', carroId: 'c2', tipo: 'licenciamento', ano: 2025, data: '2025-10-28', valor: 179.80 }
  ],

  oficinas: [
    { id: 'o1', nome: 'Oficina do Zé', especialidade: 'Mecânica geral', endereco: 'Rua Mateus Leme, 1200 · Centro Cívico', lat: -25.4152, lng: -49.2695, nota: 4.8, avaliacoes: 214, horario: 'Seg a sex, 8h às 18h · sáb até 12h', fecha: 18, whatsapp: 'demo', servicos: ['Troca de óleo', 'Revisão', 'Freios', 'Suspensão', 'Injeção'], foto: '../img/oficina.jpg' },
    { id: 'o2', nome: 'Auto Center Veloz', especialidade: 'Pneus e alinhamento', endereco: 'Av. Sete de Setembro, 3150 · Rebouças', lat: -25.4408, lng: -49.2718, nota: 4.6, avaliacoes: 158, horario: 'Seg a sáb, 8h às 19h', fecha: 19, whatsapp: 'demo', servicos: ['Pneus', 'Alinhamento', 'Balanceamento', 'Troca de óleo'], foto: '../img/motor.jpg' },
    { id: 'o3', nome: 'Mecânica Boa Vista', especialidade: 'Mecânica geral', endereco: 'Rua Holanda, 820 · Boa Vista', lat: -25.3895, lng: -49.2552, nota: 4.5, avaliacoes: 96, horario: 'Seg a sex, 8h às 17h30', fecha: 17.5, whatsapp: 'demo', servicos: ['Revisão', 'Suspensão', 'Embreagem'], foto: '../img/motor.jpg' },
    { id: 'o4', nome: 'Elétrica Curitibana', especialidade: 'Elétrica e bateria', endereco: 'Rua Brigadeiro Franco, 2400 · Rebouças', lat: -25.4466, lng: -49.2843, nota: 4.3, avaliacoes: 61, horario: 'Seg a sex, 8h às 18h', fecha: 18, whatsapp: 'demo', servicos: ['Bateria', 'Elétrica', 'Ar-condicionado'], foto: '../img/motor.jpg' },
    { id: 'o5', nome: 'Freios & Cia', especialidade: 'Freios e suspensão', endereco: 'Av. Visconde de Guarapuava, 4100 · Batel', lat: -25.4387, lng: -49.2860, nota: 4.7, avaliacoes: 133, horario: 'Seg a sex, 7h30 às 18h', fecha: 18, whatsapp: 'demo', servicos: ['Freios', 'Suspensão', 'Amortecedores'], foto: '../img/oficina.jpg' },
    { id: 'o6', nome: 'Revisa Já Água Verde', especialidade: 'Revisão rápida', endereco: 'Av. República Argentina, 1500 · Água Verde', lat: -25.4512, lng: -49.2789, nota: 4.4, avaliacoes: 72, horario: 'Seg a sáb, 8h às 20h', fecha: 20, whatsapp: 'demo', servicos: ['Troca de óleo', 'Revisão', 'Filtros'], foto: '../img/motor.jpg' }
  ],

  // Avaliações feitas pelos usuários (tela 19). Cada oficina tem `nota` e `avaliacoes` como base das avaliações antigas;
  // a média mostrada junta a base com estas (VX.notaOficina). minha: true = feita por quem está usando o app.
  avaliacoes: [
    { id: 'v1', oficinaId: 'o1', autor: 'Motorista de app', nota: 5, servico: 'oleo', texto: 'Atendimento rápido e me deram a nota fiscal certinha. Preço justo.', data: '2026-10-14', minha: false },
    { id: 'v2', oficinaId: 'o1', autor: 'Dona de um hatch', nota: 5, servico: 'revisao', texto: 'Explicaram tudo antes de fazer e mandaram foto das peças trocadas.', data: '2026-09-22', minha: false },
    { id: 'v3', oficinaId: 'o1', autor: 'Carlos R.', nota: 4, servico: 'freios', texto: 'Bom serviço. Demorou um pouco mais do que o combinado, mas ficou certo.', data: '2026-08-05', minha: false },
    { id: 'v4', oficinaId: 'o2', autor: 'Juliana P.', nota: 5, servico: 'pneus', texto: 'Alinhamento e balanceamento em 40 minutos. Carro parou de puxar.', data: '2026-10-20', minha: false },
    { id: 'v5', oficinaId: 'o2', autor: 'Motorista de app', nota: 4, servico: 'pneus', texto: 'Preço bom nos pneus, mas a fila no sábado é grande.', data: '2026-09-02', minha: false },
    { id: 'v6', oficinaId: 'o3', autor: 'Felipe A.', nota: 5, servico: 'suspensao', texto: 'Resolveram o barulho na suspensão que outra oficina não achou.', data: '2026-10-08', minha: false },
    { id: 'v7', oficinaId: 'o3', autor: 'Dono de um sedã', nota: 4, servico: 'revisao', texto: 'Honestos no orçamento. Só não aceitam cartão.', data: '2026-07-16', minha: false },
    { id: 'v8', oficinaId: 'o4', autor: 'Marina S.', nota: 4, servico: 'eletrica', texto: 'Trocaram a bateria na hora e testaram o alternador sem cobrar.', data: '2026-10-11', minha: false },
    { id: 'v9', oficinaId: 'o4', autor: 'Motorista de app', nota: 3, servico: 'eletrica', texto: 'Resolveram, mas precisei voltar duas vezes.', data: '2026-08-27', minha: false },
    { id: 'v10', oficinaId: 'o5', autor: 'André K.', nota: 5, servico: 'freios', texto: 'Pastilha e disco com garantia por escrito. Recomendo.', data: '2026-10-25', minha: false },
    { id: 'v11', oficinaId: 'o5', autor: 'Dona de um SUV', nota: 5, servico: 'suspensao', texto: 'Mostraram o amortecedor velho vazando antes de trocar.', data: '2026-09-30', minha: false },
    { id: 'v12', oficinaId: 'o5', autor: 'Beatriz L.', nota: 4, servico: 'freios', texto: 'Serviço caprichado, preço um pouco acima da média.', data: '2026-08-12', minha: false },
    { id: 'v13', oficinaId: 'o6', autor: 'Motorista de app', nota: 5, servico: 'oleo', texto: 'Troca de óleo em 20 minutos, abre até as 20h. Salva a rotina de quem roda.', data: '2026-10-29', minha: false },
    { id: 'v14', oficinaId: 'o6', autor: 'Rodrigo T.', nota: 4, servico: 'revisao', texto: 'Rápido e organizado. Revisão completa só com hora marcada.', data: '2026-09-18', minha: false }
  ],

  // categoria: hatch | seda | suv | esportivo | classico
  anuncios: [
    { id: 'a1', marca: 'Toyota', modelo: 'RAV4', versao: 'Hybrid SX', ano: 2020, km: 48000, preco: 189900, fipe: 196300, cidade: 'Curitiba, PR', categoria: 'suv', foto: '../img/carros/rav4.jpg', nota: 94, manutencoes: 11, comprovadas: 9, publicado: '2026-10-28', visitas: 212,
      vendedor: { nome: 'Marina S.', desde: '2026-02', whatsapp: 'demo' },
      descricao: 'Único dono, todas as revisões na concessionária e registradas no VEXOcar. Pneus com 70%.',
      historico: [
        { data: '2026-09-14', km: 46500, servico: 'Revisão dos 45.000 km', nota: true, oficina: 'Concessionária Toyota' },
        { data: '2026-03-02', km: 40100, servico: 'Troca de óleo e filtro', nota: true, oficina: 'Oficina do Zé' },
        { data: '2025-09-10', km: 35200, servico: 'Revisão dos 35.000 km', nota: false, oficina: 'Concessionária Toyota' } ] },
    { id: 'a2', marca: 'Hyundai', modelo: 'i30', versao: '1.6 N Line', ano: 2019, km: 72300, preco: 84900, fipe: 82100, cidade: 'Curitiba, PR', categoria: 'hatch', foto: '../img/carros/i30.jpg', nota: 86, manutencoes: 9, comprovadas: 7, publicado: '2026-10-30', visitas: 98,
      vendedor: { nome: 'Felipe A.', desde: '2026-05', whatsapp: 'demo' },
      descricao: 'Carro de garagem, nunca bateu. Revisão recente e freios novos.',
      historico: [
        { data: '2026-10-01', km: 71800, servico: 'Pastilhas e discos de freio', nota: true, oficina: 'Freios & Cia' },
        { data: '2026-05-20', km: 66000, servico: 'Revisão dos 65.000 km', nota: true, oficina: 'Oficina do Zé' },
        { data: '2025-11-11', km: 60100, servico: 'Troca de óleo e filtro', nota: false, oficina: 'Mecânica Boa Vista' } ] },
    { id: 'a3', marca: 'Toyota', modelo: 'Camry', versao: 'XLE 2.5', ano: 2019, km: 63000, preco: 159900, fipe: 164500, cidade: 'São José dos Pinhais, PR', categoria: 'seda', foto: '../img/carros/camry.jpg', nota: 91, manutencoes: 12, comprovadas: 10, publicado: '2026-10-21', visitas: 154,
      vendedor: { nome: 'Carlos R.', desde: '2026-04', whatsapp: 'demo' },
      descricao: 'Sedã executivo muito econômico na estrada. Manual e chave reserva.',
      historico: [
        { data: '2026-08-08', km: 61200, servico: 'Revisão dos 60.000 km', nota: true, oficina: 'Concessionária Toyota' },
        { data: '2026-02-17', km: 55400, servico: 'Troca de óleo e filtro', nota: true, oficina: 'Auto Center Veloz' },
        { data: '2025-08-30', km: 50300, servico: 'Revisão dos 50.000 km', nota: false, oficina: 'Concessionária Toyota' } ] },
    { id: 'a4', marca: 'Fiat', modelo: '500', versao: 'Cult 1.4', ano: 2014, km: 78400, preco: 48900, fipe: 47200, cidade: 'Curitiba, PR', categoria: 'hatch', foto: '../img/carros/fiat500.jpg', nota: 88, manutencoes: 14, comprovadas: 11, publicado: '2026-10-25', visitas: 187,
      vendedor: { nome: 'Juliana P.', desde: '2026-03', whatsapp: 'demo' },
      descricao: 'Perfeito para a cidade. Embreagem trocada em 2026, ar gelando.',
      historico: [
        { data: '2026-07-19', km: 76900, servico: 'Kit de embreagem', nota: true, oficina: 'Mecânica Boa Vista' },
        { data: '2026-01-08', km: 73000, servico: 'Revisão completa', nota: true, oficina: 'Oficina do Zé' },
        { data: '2025-06-22', km: 68800, servico: 'Troca de óleo e filtro', nota: false, oficina: 'Oficina do Zé' } ] },
    { id: 'a5', marca: 'Volkswagen', modelo: 'Fusca', versao: '1300 restaurado', ano: 1974, km: 12300, preco: 39900, fipe: 31800, cidade: 'Ponta Grossa, PR', categoria: 'classico', foto: '../img/carros/fusca.jpg', nota: 81, manutencoes: 7, comprovadas: 4, publicado: '2026-10-15', visitas: 341,
      vendedor: { nome: 'Seu Antônio', desde: '2026-06', whatsapp: 'demo' },
      descricao: 'Restauração completa em 2024, motor retificado. Km zerado após o restauro.',
      historico: [
        { data: '2026-04-11', km: 11200, servico: 'Regulagem do carburador', nota: false, oficina: 'Mecânica Boa Vista' },
        { data: '2025-10-03', km: 8100, servico: 'Revisão pós-restauro', nota: true, oficina: 'Oficina do Zé' },
        { data: '2024-12-15', km: 0, servico: 'Restauração completa', nota: false, oficina: 'Garagem Clássicos' } ] },
    { id: 'a6', marca: 'Audi', modelo: 'Q5', versao: 'Prestige 2.0 TFSI', ano: 2019, km: 52300, preco: 189900, fipe: 193800, cidade: 'Curitiba, PR', categoria: 'suv', foto: '../img/carros/q5.jpg', nota: 95, manutencoes: 10, comprovadas: 9, publicado: '2026-11-01', visitas: 76,
      vendedor: { nome: 'Rodrigo T.', desde: '2026-01', whatsapp: 'demo' },
      descricao: 'Revisões na rede Audi até 50 mil, depois na Oficina do Zé. Todas com nota fiscal.',
      historico: [
        { data: '2026-10-05', km: 52000, servico: 'Revisão dos 50.000 km', nota: true, oficina: 'Oficina do Zé' },
        { data: '2026-04-18', km: 46100, servico: 'Troca de óleo e filtro', nota: true, oficina: 'Oficina do Zé' },
        { data: '2025-10-09', km: 40200, servico: 'Revisão dos 40.000 km', nota: true, oficina: 'Concessionária Audi' } ] },
    { id: 'a7', marca: 'Tesla', modelo: 'Model 3', versao: 'Long Range', ano: 2021, km: 31000, preco: 229900, fipe: 238000, cidade: 'São Paulo, SP', categoria: 'seda', foto: '../img/carros/tesla.jpg', nota: 97, manutencoes: 5, comprovadas: 5, publicado: '2026-10-29', visitas: 263,
      vendedor: { nome: 'Beatriz L.', desde: '2026-02', whatsapp: 'demo' },
      descricao: 'Elétrico, bateria com 94% de saúde. Carregador de parede incluso.',
      historico: [
        { data: '2026-07-02', km: 28400, servico: 'Rodízio de pneus e filtro de cabine', nota: true, oficina: 'Auto Center Veloz' },
        { data: '2025-12-12', km: 21000, servico: 'Fluido de freio', nota: true, oficina: 'Freios & Cia' },
        { data: '2025-03-30', km: 14000, servico: 'Inspeção anual', nota: false, oficina: 'Tesla Service' } ] },
    { id: 'a8', marca: 'Chevrolet', modelo: 'Camaro', versao: 'SS 6.2 V8', ano: 2017, km: 31200, preco: 289900, fipe: 281500, cidade: 'Curitiba, PR', categoria: 'esportivo', foto: '../img/carros/camaro.jpg', nota: 71, manutencoes: 6, comprovadas: 3, publicado: '2026-10-18', visitas: 402,
      vendedor: { nome: 'André K.', desde: '2026-07', whatsapp: 'demo' },
      descricao: 'Revisão dos 30 mil pendente, preço já considera. Escapamento original guardado.',
      historico: [
        { data: '2025-08-14', km: 27900, servico: 'Troca de óleo e filtro', nota: true, oficina: 'Oficina do Zé' },
        { data: '2024-09-03', km: 21500, servico: 'Revisão dos 20.000 km', nota: false, oficina: 'Concessionária Chevrolet' },
        { data: '2023-11-20', km: 15000, servico: 'Pneus traseiros', nota: false, oficina: 'Auto Center Veloz' } ] }
  ],

  meusAnuncios: [],      // anúncios criados pelo usuário (tela 11)
  favoritos: ['a4'],
  notificacoes: { revisao: true, documentos: true, interessados: true },
  logado: false
};
