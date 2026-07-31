export type PestSeverity = "low" | "medium" | "high";

export interface Pest {
  id: string;
  name: string;
  emoji: string;
  severity: PestSeverity;
  description: string;
  identification: string[];
  symptoms: string[];
  favorableConditions: string[];
  organicTreatments: { name: string; description: string }[];
  chemicalTreatments: { name: string; description: string; warning?: string }[];
  prevention: string[];
  lifecycle?: string;
}

export const PESTS: Pest[] = [
  {
    id: "spider-mites",
    name: "Ácaros (Spider Mites)",
    emoji: "🕷️",
    severity: "high",
    description: "Os ácaros são uma das pragas mais comuns e destrutivas do cultivo indoor. Reproduzem-se rapidamente, especialmente em ambientes quentes e secos, e desenvolvem resistência a pesticidas com facilidade.",
    identification: [
      "Minúsculos (0,5mm), difíceis de ver a olho nu — use lupa 10x",
      "Corpo oval, 4 pares de pernas (8 pernas — são aracnídeos, não insetos)",
      "Encontrados na face inferior das folhas",
      "Adultos podem ser vermelhos, marrons ou amarelos",
      'Variante "Borg" tem 2 manchas escuras no dorso e desenvolve resistência muito rapidamente',
    ],
    symptoms: [
      "Pontinhos brancos, amarelos ou alaranjados na superfície superior das folhas",
      "Teia fina entre folhas e caules (infestação avançada)",
      "Folhas ficam bronze, amarelas e morrem",
      "Dano começa nas folhas mais velhas e se espalha para cima",
      "Clorose pontilhada (estipulação) visível ao examinar a face inferior",
    ],
    favorableConditions: [
      "Temperatura alta (>26°C)",
      "Umidade baixa (<40% UR)",
      "Ar parado, sem circulação",
      "Plantas estressadas por calor ou falta de água",
    ],
    organicTreatments: [
      {
        name: "Óleos Essenciais",
        description: "Spray com mistura de óleo de alecrim, hortelã, óleo de neem ou óleo de pimenta diluídos. Aplicar na face inferior das folhas a cada 2–3 dias.",
      },
      {
        name: "Spinosad",
        description: "Pesticida orgânico derivado de bactéria do solo. Não tóxico a humanos, pets ou plantas. Ativo apenas ~24h após mistura — preparar e aplicar no mesmo dia.",
      },
      {
        name: "Sabão Inseticida",
        description: "Sais de ácidos graxos que destroem a cutícula dos ácaros. Exige cobertura total da face inferior das folhas. Reaplicar a cada 3 dias.",
      },
      {
        name: "Diatomita (Terra Diatomácea)",
        description: "Pó de algas microscópicas silicosas. Espalhar no substrato e ao redor da planta. Corta mecanicamente os ácaros, causando desidratação. Inofensivo a humanos.",
      },
      {
        name: "Ácaros Predadores",
        description: "Phytoseiulus persimilis ou Neoseiulus californicus — ácaros predadores que consomem ácaros-praga. Eficaz para prevenção e controle leve.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Piretrina",
        description: "Inseticida de contato rápido, biodegradável. Aplicar SOMENTE com luzes apagadas — luz UV degrada rapidamente. Não usar perto da colheita.",
        warning: "Tóxico a abelhas e organismos aquáticos. Nunca aplicar com luzes acesas.",
      },
      {
        name: "Floramite",
        description: "Acaricida específico para ácaros. Reservar como último recurso — risco de resistência. Uma ou duas aplicações máximo.",
        warning: "Usar somente como último recurso. Rotacionar com outros métodos.",
      },
      {
        name: "Abamectina",
        description: "Potente acaricida/inseticida de origem fermentativa. Evitar próximo à colheita.",
        warning: "Não usar nas últimas 4 semanas de floração.",
      },
    ],
    prevention: [
      "Quarentena de 1 semana para qualquer clone ou planta nova",
      "Manter temperatura abaixo de 24°C e UR acima de 50%",
      "Boa circulação de ar — ácaros odeiam vento",
      "Inspecionar a face inferior das folhas semanalmente com lupa",
      "Desinfetar ferramentas e superfícies entre cultivos",
      "Nunca trazer plantas externas direto para o espaço de cultivo",
    ],
    lifecycle: "Ovo → Larva (3 pares de pernas, 6 pernas) → Ninfa I → Ninfa II → Adulto. Em temperaturas altas (27°C), o ciclo completo leva apenas 7–10 dias, possibilitando explosão populacional rápida. A fêmea adulta pode viver 30 dias e botar centenas de ovos.",
  },
  {
    id: "thrips",
    name: "Trips",
    emoji: "🦗",
    severity: "medium",
    description: "Insetos minúsculos que raspam e sugam o conteúdo das células foliares. Os adultos são rápidos e difíceis de capturar; as ninfas são pálidas e quase invisíveis.",
    identification: [
      "Adultos minúsculos, rápidos — cor escura, dourada, amarela ou transparente",
      "Ninfas pálidas, gordas e quase vermiformes (tubulares)",
      "Visíveis ao sacudir levemente a planta sobre papel branco",
      "Preferem zonas com crescimento novo e flores",
    ],
    symptoms: [
      "Manchas prateadas ou bronzeadas nas folhas (maiores e mais irregulares que as de ácaros)",
      "Brilho escorregadio ou aspecto de 'cuspe seco' nas áreas danificadas",
      "Rastros prateados brilhantes na superfície das folhas",
      "Dano severo resulta em morte foliar progressiva",
      "Nas flores: partículas escuras (fezes) e dano direto aos pistilos",
    ],
    favorableConditions: [
      "Temperatura moderada a alta (22–28°C)",
      "Plantas densas com pouca circulação de ar",
      "Ausência de predadores naturais",
    ],
    organicTreatments: [
      {
        name: "Spinosad",
        description: "Orgânico e seguro para plantas. Funciona por ingestão e contato. Ativo por ~24h. Preparar e aplicar no mesmo dia. Rotar com outros métodos para evitar resistência.",
      },
      {
        name: "Sabão Inseticida",
        description: "Destrói a cutícula das ninfas. Exige cobertura perfeita e reaplicação a cada 3 dias por pelo menos 2 semanas.",
      },
      {
        name: "Óleo de Neem",
        description: "Naturalmente inseticida e repelente. Não aplicar diretamente nas flores. Usar com pulverizador fino para cobertura completa.",
      },
      {
        name: "Diatomita",
        description: "Espalhar no substrato e superfícies para controlar adultos e larvas que caem no solo.",
      },
      {
        name: "Piretrina",
        description: "Inseticida botânico de ação rápida. Aplicar somente com luzes apagadas.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Spinosyn A+D (Conserve)",
        description: "Versão concentrada e refinada do Spinosad. Eficaz contra trips com boa janela de segurança.",
        warning: "Respeitar período de carência antes da colheita.",
      },
    ],
    prevention: [
      "Armadilhas adesivas amarelas — monitorar e atrair adultos",
      "Inspecionar plantas novas antes de introduzir no espaço",
      "Manter boa circulação de ar",
      "Introduzir predadores (Amblyseius cucumeris) preventivamente",
      "Desinfetar o ambiente entre cultivos",
    ],
  },
  {
    id: "fungus-gnats",
    name: "Mosquito do Fungo (Fungus Gnats)",
    emoji: "🦟",
    severity: "medium",
    description: "Moscas minúsculas que se reproduzem no substrato úmido. Os adultos são apenas incômodos, mas as larvas danificam raízes jovens, causando sintomas que mimetizam deficiências e doenças.",
    identification: [
      "Adultos: moscas pretas/marrom-escuras com 2mm, parecem mosquitos minúsculos",
      "Voam lentamente perto do substrato e da base da planta",
      "Larvas: vermes brancos/translúcidos com cabeça preta nos 3–5cm superiores do substrato",
      "Fácil de detectar colocando batata crua na superfície do solo por 24h (larvas são atraídas)",
    ],
    symptoms: [
      "Mudas tombam (damping off) — caules enfraquecem na base",
      "Murcha, amarelamento e caída das folhas sem causa aparente",
      "Sinais de deficiência de nutrientes não responsivos a correções",
      "Crescimento paralisado ou muito lento",
      "Dano radicular visível ao inspecionar as raízes (marrons, manchadas)",
    ],
    favorableConditions: [
      "Substrato sempre úmido na superfície",
      "Temperatura quente",
      "Presença de fungos e matéria em decomposição no solo",
      "Falta de circulação de ar sobre o substrato",
    ],
    organicTreatments: [
      {
        name: "Deixar Secar",
        description: "Permitir que os 3–5cm superiores do substrato sequem completamente entre regas. Larvas morrem sem umidade.",
      },
      {
        name: "Armadilhas Adesivas Amarelas",
        description: "Colocar ao nível do substrato para capturar adultos e monitorar a população.",
      },
      {
        name: "BTi (Bacillus thuringiensis israelensis)",
        description: "Bactéria que impede larvas de se alimentar. Dissolver Mosquito Bits (ou similar) em água e regar. Inofensivo a humanos, pets e plantas.",
      },
      {
        name: "Diatomita",
        description: "Espalhar uma camada fina na superfície do substrato. Mata adultos e larvas que atravessam o pó.",
      },
      {
        name: "Nematóides Patogênicos",
        description: "Steinernema feltiae — nematóides microscópicos que parasitam e matam as larvas no solo. Aplicar via irrigação.",
      },
      {
        name: "Ácaros Predadores",
        description: "Hypoaspis miles — ácaros predadores de solo que se alimentam de larvas de mosquito-do-fungo.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Peróxido de Hidrogênio (H₂O₂)",
        description: "Solução de 1 parte de H₂O₂ 3% para 4 partes de água. Regar o substrato — mata larvas pelo oxigênio liberado. Não prejudica raízes em dosagem correta.",
        warning: "Usar H₂O₂ de grau alimentar 3%. Concentrações maiores podem queimar as raízes.",
      },
      {
        name: "Essentria IC3",
        description: "Blend de óleos horticulturais com certificação orgânica. Aplicar no substrato para controlar larvas.",
      },
    ],
    prevention: [
      "Nunca deixar a superfície do substrato permanentemente úmida",
      "Usar leite de pedra (perlita ou argila expandida) na superfície para dificultar postura dos adultos",
      "Limpar resíduos de substrato e folhas mortas das bandejas",
      "Inspecionar substrato novo (alguns já vêm contaminados)",
      "Manter circulação de ar sobre o substrato",
      "Preferir mudas de semente a clones quando possível",
    ],
  },
  {
    id: "aphids",
    name: "Pulgões",
    emoji: "🐛",
    severity: "medium",
    description: "Insetos de corpo mole que se reproduzem explosivamente — uma fêmea parturiente pode gerar clones sem fecundação. Excretam 'honeydew' que favorece fungos.",
    identification: [
      "Corpo oval, mole, 1–3mm — brancos, verdes, amarelos, pretos ou marrons conforme estágio",
      "Ninfas: finos, longos, geralmente brancos ou pálidos",
      "Encontrados em grupos na face inferior das folhas e nos caules",
      "Adultos alados surgem quando a colônia fica superlotada",
      "Presença de formigas perto das plantas é sinal — formigas 'pastoreiam' pulgões pelo honeydew",
    ],
    symptoms: [
      "Folhas amareladas e murchas por estresse",
      "Depósitos pegajosos de honeydew nas folhas (aspecto brilhoso)",
      "Fumagina (fungo preto) crescendo sobre o honeydew",
      "Manchas brancas em buds (ninfas e exúvias)",
      "Distorção foliar em infestações pesadas",
    ],
    favorableConditions: [
      "Temperatura amena (18–24°C) favorece reprodução rápida",
      "Plantas estressadas ou com excesso de nitrogênio (tecido mole)",
      "Ambiente sem predadores naturais",
    ],
    organicTreatments: [
      {
        name: "Sabão Inseticida",
        description: "Ácidos graxos destroem o exoesqueleto. Cobertura total é essencial — face inferior das folhas, caules, axílas. Reaplicar a cada 3 dias por 2 semanas.",
      },
      {
        name: "Spinosad",
        description: "Orgânico, seguro para plantas. Ativo por ~24h após mistura. Preparar na hora de usar.",
      },
      {
        name: "Óleo de Neem",
        description: "Repelente e inseticida. Não aplicar diretamente nas flores. Eficaz para controle inicial.",
      },
      {
        name: "Insetos Benéficos",
        description: "Joaninhas (Coccinella septempunctata) e crisopas (Chrysoperla carnea) são predadores naturais de pulgões. Introduzir preventivamente ou em infestação inicial.",
      },
      {
        name: "Spray de Água",
        description: "Jato de água com pressão moderada remove fisicamente a maioria dos pulgões das folhas. Mais eficaz em infestações leves.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Piretrinas Naturais",
        description: "Inseticida botânico de contato e ingestão. Aplicar fora das horas de luz.",
        warning: "Evitar tratamentos químicos com inseticidas neurotóxicos (malation, clorpirifós, acefato) por riscos à saúde.",
      },
    ],
    prevention: [
      "Inspeção semanal da face inferior das folhas",
      "Controlar formigas — elas protegem pulgões de predadores",
      "Introduzir joaninhas preventivamente em cultivos externos",
      "Quarentena de novas plantas antes de inserir no espaço",
      "Remover folhas e brotos infestados imediatamente",
    ],
  },
  {
    id: "whiteflies",
    name: "Mosca Branca (Whiteflies)",
    emoji: "🦋",
    severity: "medium",
    description: "Insetos minúsculos semelhantes a traças brancas que sugam seiva das folhas. Voam em nuvem quando a planta é perturbada. Difíceis de eliminar por causa de ovos e ninfas resistentes.",
    identification: [
      "Adultos: insetos brancos de 1–2mm, parecem minúsculas mariposas",
      "Nuvem de insetos brancos ao agitar a planta — sinal claro",
      "Ovos e ninfas na face inferior das folhas (escamas transparentes)",
      "Ninfas imóveis e achatadas (escamoides) — passam por 4 estágios",
    ],
    symptoms: [
      "Folhas amareladas, desbotadas e com aspecto de sugar seco",
      "Honeydew pegajoso nas superfícies foliares",
      "Fumagina (fungo preto) sobre o honeydew",
      "Clorose geral e queda de folhas em infestações pesadas",
      "Crescimento retardado",
    ],
    favorableConditions: [
      "Temperatura quente (24–30°C)",
      "Alta umidade",
      "Pouca ventilação",
      "Ambiente protegido (indoor, estufa)",
    ],
    organicTreatments: [
      {
        name: "Armadilhas Adesivas Amarelas",
        description: "Capturar adultos voadores. Colocar perto das plantas. Monitorar o nível de infestação semanalmente.",
      },
      {
        name: "Sabão Inseticida",
        description: "Cobertura total da face inferior. Mata adultos, ninfas e ovos por contato. Reaplicar a cada 3 dias.",
      },
      {
        name: "Óleo de Neem",
        description: "Repelente e inseticida. Aplicar com pulverizador fino. Não usar nas flores. Combinar com sabão para melhor adesão.",
      },
      {
        name: "Spinosad",
        description: "Eficaz por ingestão e contato. Preparar e usar no mesmo dia. Rotar com outros métodos.",
      },
      {
        name: "Mulch Reflexivo",
        description: "Plástico prata/reflexivo na superfície do substrato confunde adultos e reduz pouso nas plantas.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Piretrina",
        description: "Inseticida botânico de contato. Aplicar com luzes apagadas. Eficaz contra adultos.",
        warning: "Não usar nas últimas 2–3 semanas antes da colheita.",
      },
      {
        name: "Imidacloprida",
        description: "Inseticida sistêmico — a planta absorve e o inseto morre ao sugar. Eficaz, mas não usar em floração.",
        warning: "Proibido perto da colheita. Resíduos persistem no tecido vegetal.",
      },
    ],
    prevention: [
      "Telas anti-inseto nas entradas de ar",
      "Armadilhas adesivas como monitoramento preventivo",
      "Inspecionar plantas novas antes de introduzir no cultivo",
      "Manter ventilação adequada — mosca branca detesta vento forte",
      "Introduzir Encarsia formosa (parasitoide natural) preventivamente",
    ],
  },
];
