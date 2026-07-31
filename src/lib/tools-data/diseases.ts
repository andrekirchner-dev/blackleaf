export type DiseaseSeverity = "critical" | "high" | "medium";
export type DiseaseType = "fungal" | "oomycete" | "bacterial";
export type DiseaseLocation = "aerial" | "root" | "vascular" | "seedling";

export interface Disease {
  id: string;
  name: string;
  pathogen: string;
  emoji: string;
  type: DiseaseType;
  location: DiseaseLocation;
  severity: DiseaseSeverity;
  description: string;
  identification: string[];
  favorableConditions: string[];
  organicTreatments: { name: string; description: string }[];
  chemicalTreatments: { name: string; description: string; warning?: string }[];
  prevention: string[];
  isCurable: boolean;
  curingNote?: string;
}

export const DISEASES: Disease[] = [
  {
    id: "botrytis",
    name: "Mofo Cinzento (Bud Rot)",
    pathogen: "Botrytis cinerea",
    emoji: "🍄",
    type: "fungal",
    location: "aerial",
    severity: "critical",
    isCurable: false,
    curingNote: "Área afetada não tem recuperação. A prioridade é conter o avanço.",
    description: "O fungo mais temido do cultivo indoor. Infecta caules, folhas e buds, cobrindo-os com mofo cinza esponjoso. Em floração avançada pode destruir uma planta em 48h em condições favoráveis. Esporula prolificamente e se espalha pelo ar.",
    identification: [
      "Crescimento cinza-acinzentado, esponjoso e pulverulento sobre o bud ou caule",
      "Tecido marrom-escuro e aquoso por baixo do mofo (apodrecimento úmido)",
      "Folhas dentro do bud ficam amarelas sem motivo aparente (sinal precoce)",
      "Ao sacudir, libera nuvem de esporos cinza-esverdeados",
      "Cheiro de feno molhado ou terra úmida incomum nos buds",
      "Caules escurecem e amolecem em casos de stem rot",
    ],
    favorableConditions: [
      "Umidade relativa >60% na floração — especialmente >70% é crítico",
      "Temperatura fria (15–22°C) com alta UR",
      "Buds densos que retém umidade internamente",
      "Ar parado / ventilação insuficiente",
      "Folhas senescentes ou mortas dentro do dossel",
      "Ferimentos em caules (de podas, suportes, etc.)",
    ],
    organicTreatments: [
      {
        name: "Remoção Imediata e Cirúrgica",
        description: "Cortar pelo menos 5cm além da área visivelmente afetada. Colocar em saco plástico SEM agitar (evitar dispersão de esporos). Esterilizar tesoura com álcool 70% antes de cada corte. Esta é sempre a primeira ação.",
      },
      {
        name: "Bicarbonato de Potássio",
        description: "Spray foliar com 5–10g/L de bicarbonato de potássio (Armicarb, MilStop). Altera o pH da superfície foliar para ambiente inóspito ao fungo. Aplicar preventivamente e em áreas ao redor da infecção.",
      },
      {
        name: "Bacillus subtilis (Serenade)",
        description: "Bactéria antagonista que produz lipopeptídeos antifúngicos. Aplicar via spray ou irrigação preventivamente desde o início da floração. Coloniza a superfície das plantas e compete com Botrytis.",
      },
      {
        name: "Trichoderma",
        description: "Fungo micoparasita que ataca Botrytis e outros patógenos. Aplicar ao substrato desde o início do cultivo. Atua preventivamente — não cura infecção estabelecida.",
      },
      {
        name: "Peróxido de Hidrogênio (H₂O₂)",
        description: "Spray com H₂O₂ 3% diluído em água (1:10) nas áreas ao redor da infecção. Mata esporos na superfície. Nunca aplicar nos buds diretamente — pode danificar tricomas.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Fungicidas à Base de Cobre",
        description: "Caldas cúpricas (Bordeaux, hidróxido de cobre) — eficazes preventivamente ou em estágios vegetativos. Não aplicar em floração avançada.",
        warning: "Não aplicar nas últimas 4–5 semanas de floração. Cobre acumula no tecido e não é adequado para consumo.",
      },
      {
        name: "Iprodione / Vinclosoline",
        description: "Fungicidas de contato eficazes contra Botrytis e Sclerotinia. Usados em cultivos comerciais. Evitar em cannabis para consumo.",
        warning: "Presença de resíduos no produto final. Uso restrito a fases vegetativas ou aplicação preventiva muito precoce.",
      },
    ],
    prevention: [
      "Manter UR abaixo de 50% nas últimas 4 semanas de floração — este é o controle mais efetivo",
      "Boa circulação de ar 24h/dia — oscilação do dossel é essencial",
      "Desfolha (Lollipopping) para melhorar penetração de ar no interior do dossel",
      "Remover folhas mortas, senescentes e galhos sem função imediatamente",
      "Evitar ferimentos desnecessários em caules durante a floração",
      "Em clima úmido: usar desumidificador calibrado para a fase de floração",
      "Colher em janelas sem chuva — umidade pós-colheita durante cura é crítica",
    ],
  },
  {
    id: "powdery-mildew",
    name: "Oídio (Powdery Mildew)",
    pathogen: "Golovinomyces cichoracearum / Podosphaera xanthii",
    emoji: "⬜",
    type: "fungal",
    location: "aerial",
    severity: "high",
    isCurable: true,
    curingNote: "Detectado cedo, o oídio é controlável. Em floração avançada o controle é difícil.",
    description: "Manchas brancas pulverulentas que se espalham pela superfície das folhas. Diferente da Botrytis, o oídio cresce sobre a superfície foliar (não dentro do tecido). Reduz a fotossíntese e enfraquece a planta. Não mata diretamente, mas compromete yield e qualidade.",
    identification: [
      "Manchas brancas circulares, pulverulentas, na superfície SUPERIOR das folhas",
      "Aspecto de 'farinha' ou pó branco espalhado sobre as folhas",
      "Diferente da Botrytis: não causa apodrecimento úmido",
      "As folhas não ficam amarelas — o pó branco é a característica principal",
      "Em casos avançados, cobre toda a folha e passa para caules e buds",
      "Lupa: estruturas brancas ramificadas (hifas) visíveis na superfície",
    ],
    favorableConditions: [
      "Umidade moderada a alta (50–70% UR) + temperatura amena (18–26°C)",
      "Circulação de ar insuficiente no dossel",
      "Mudanças abruptas de temperatura (noite/dia com grande diferença)",
      "Plantas estressadas por deficiências ou excesso de N",
      "Espaços confinados com pouca renovação de ar",
    ],
    organicTreatments: [
      {
        name: "Bicarbonato de Potássio",
        description: "Spray com 5–10g/L. Altera pH da superfície foliar — inibindo e matando o fungo. Eficácia superior ao bicarbonato de sódio. Aplicar a cada 5–7 dias. Também possui efeito preventivo.",
      },
      {
        name: "Leite/Soro de Leite",
        description: "Spray com solução de leite integral diluído 1:9 em água. Proteínas do leite formam ambiente hostil para o fungo ao oxidar na luz solar. Aplicar a cada 3 dias. Custo baixíssimo.",
      },
      {
        name: "Óleo de Neem",
        description: "Aplicar como spray (2mL/L com emulsificante) na superfície afetada. Azadiractina e outros compostos do neem inibem a germinação dos esporos. Não usar em floração avançada.",
      },
      {
        name: "Enxofre Molhável",
        description: "Fungicida orgânico clássico contra oídio — altamente eficaz. Disponível como pó molhável. NUNCA aplicar quando temperatura > 32°C (risco de fitotoxicidade) ou com luz intensa.",
      },
      {
        name: "Ampelomyces quisqualis",
        description: "Fungo hiperparasita do oídio — habita e mata as células do patógeno. Disponível comercialmente (AQ10). Aplicação preventiva ou em estágio inicial da infecção.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Fungicidas Sistêmicos (DMI / Triazóis)",
        description: "Miclobutanil (Eagle 20EW), Trifloxistrobina, Tebuconazol. Sistêmicos — absorvidos pela planta e impedem o fungo de produzir ergosterol. Muito eficazes, mas resistência desenvolve-se rapidamente.",
        warning: "Não usar em floração. Resíduos persistem no tecido. Rotar classes para evitar resistência.",
      },
    ],
    prevention: [
      "Manter UR entre 40–55% — o controle mais efetivo",
      "Ventilação constante com oscilação suave do dossel",
      "Não deixar a temperatura cair abruptamente à noite (variação <10°C ideal)",
      "Introduzir Bacillus subtilis e Trichoderma preventivamente no substrato",
      "Quarentena de qualquer clone novo — oídio é frequentemente introduzido via material vegetativo",
      "Spray preventivo de bicarbonato de K ou enxofre a cada 10–14 dias no vegetativo",
    ],
  },
  {
    id: "pythium-root-rot",
    name: "Podridão de Raízes (Root Rot)",
    pathogen: "Pythium spp. / Phytophthora spp.",
    emoji: "🌱",
    type: "oomycete",
    location: "root",
    severity: "critical",
    isCurable: true,
    curingNote: "Detectado cedo, pode-se salvar a planta. Em estágio avançado, perda total é provável.",
    description: "Oomicetos (pseudo-fungos) que colonizam as raízes em condições de excesso de umidade e baixo oxigênio. As raízes deixam de funcionar e a planta começa a mostrar sintomas de múltiplas deficiências e murcha. Principal causa de perda em cultivos hidropônicos mal gerenciados.",
    identification: [
      "Raízes marrom-escuras a pretas, viscosas ao toque (saudáveis = brancas e firmes)",
      "Cheiro característico de esgoto, podridão ou terra fermentada nas raízes",
      "Murcha persistente mesmo com substrato úmido / reservatório cheio",
      "Folhas amarelas com sintomas de várias deficiências simultâneas (raízes não absorvem)",
      "Crescimento parado ou lentíssimo sem causa aparente",
      "Em hidro: água do reservatório com aspecto leitoso ou espumoso",
    ],
    favorableConditions: [
      "Substrato sempre úmido — falta do ciclo seco-úmido",
      "Temperatura da zona radicular >22°C (oomicetos prosperam no calor)",
      "Baixo oxigênio nas raízes / substrato compactado",
      "Água do reservatório quente (hidro) — ideal manter <20°C",
      "Substrato com alta retenção de água sem drenagem adequada",
      "Material vegetal em decomposição no substrato",
    ],
    organicTreatments: [
      {
        name: "Corrigir a Causa Raiz (Irrigação)",
        description: "Imediato: parar regas até o substrato secar parcialmente. Raízes precisam de oxigênio. Nenhum tratamento funciona sem corrigir o manejo de água.",
      },
      {
        name: "Peróxido de Hidrogênio (H₂O₂)",
        description: "Irrigação com H₂O₂ 3% (1 parte H₂O₂ para 4 partes de água). O oxigênio extra mata os oomicetos anaeróbicos e oxigena as raízes. Aplicar uma vez, aguardar 2–3 dias.",
      },
      {
        name: "Bacillus subtilis / Trichoderma",
        description: "Aplicar via irrigação — colonizam a rizosfera e competem ativamente com Pythium e Phytophthora. Bacillus cereus UW85 tem eficácia documentada contra damping-off de leguminosas. Trichoderma harzianum é altamente eficaz contra oomicetos.",
      },
      {
        name: "Pseudomonas fluorescens",
        description: "Bactéria antagonista produtora de antibióticos antifúngicos (siderophores, fenazinas). Disponível em produtos como Dagger G. Reduz damping-off e root rot por Pythium e Rhizoctonia.",
      },
      {
        name: "Reduzir Temperatura das Raízes",
        description: "Em hidro: usar chillers ou garrafas de gelo para manter água <20°C. Em substrato: isolar o vaso da superfície quente, usar vasos brancos ou refletivos.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Metalaxyl (Ridomil)",
        description: "Fungicida sistêmico específico para oomicetos (Pythium, Phytophthora). Aplicado ao substrato como drench. Muito eficaz, mas não atua contra fungos verdadeiros.",
        warning: "Resistência se desenvolve rapidamente se usado sozinho. Rotar com outros métodos. Período de carência obrigatório.",
      },
    ],
    prevention: [
      "Ciclo seco-úmido obrigatório: regar APENAS quando substrato está 70–80% seco",
      "Vasos com drenagem excelente (airpots, vasos de tecido favorece oxigenação)",
      "Em hidroponia: manter temperatura da água <20°C e usar pedra de ar para oxigenação",
      "Adicionar Trichoderma + Bacillus ao substrato desde o início",
      "Esterilizar o ambiente, vasos e substratos antes de cada cultivo",
      "Evitar substrato compactado — perlita (30%+) melhora drenagem significativamente",
    ],
  },
  {
    id: "fusarium-wilt",
    name: "Murcha de Fusarium",
    pathogen: "Fusarium oxysporum",
    emoji: "⚠️",
    type: "fungal",
    location: "vascular",
    severity: "critical",
    isCurable: false,
    curingNote: "Sem cura. Planta afetada deve ser removida e destruída imediatamente.",
    description: "Fungo soilborne que infecta o sistema vascular da planta (xilema), bloqueando o transporte de água e nutrientes. Causa murcha irreversível que não responde a rega. O fungo persiste no substrato por anos. Mais comum em clones de fontes não verificadas.",
    identification: [
      "Murcha súbita de um ou mais galhos — sem causa aparente",
      "Murcha não melhora após rega — sinal clássico de doença vascular",
      "Corte transversal do caule revela coloração marrom-escura no interior (tecido vascular infectado)",
      "Folhas amarelam assimetricamente — às vezes apenas um lado da planta",
      "Caule pode mostrar estrias marrons do exterior em casos avançados",
      "Raízes podem parecer saudáveis inicialmente (infecção começa pelos vasos)",
    ],
    favorableConditions: [
      "Solo ácido (pH <6.0)",
      "Temperatura do solo alta (>25°C)",
      "Excesso de nitrogênio amoniacal",
      "Dano mecânico às raízes (transplante mal feito, substratos compactados)",
      "Reutilização de substrato infectado de cultivos anteriores",
      "Clones de fontes não certificadas",
    ],
    organicTreatments: [
      {
        name: "Remoção e Descarte Imediato",
        description: "ÚNICA ação para planta infectada: remover completamente, incluindo raízes e substrato ao redor. Embalar em plástico e descartar fora do espaço de cultivo. Não compostar.",
      },
      {
        name: "Desinfecção Total do Ambiente",
        description: "Lavar vasos, bandejas e superfícies com hipoclorito de sódio (10%). Trocar todo o substrato da área afetada. Fungo sobrevive no substrato por anos em forma de clamidósporos.",
      },
      {
        name: "Estirpes Não-Patogênicas de Fusarium",
        description: "Pré-tratamento preventivo com cepas não-patogênicas de F. oxysporum que colonizam as raízes e competem com cepas patogênicas. Eficácia documentada para múltiplas culturas. Aplicar como substrato inoculado antes do plantio.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Fumigação do Substrato (Dazomet)",
        description: "Fumigante de solo que elimina Fusarium e outros patógenos de substrato antes do plantio. Usado em produção comercial.",
        warning: "Produto químico perigoso. Exige período de desgasificação (14–21 dias) antes do plantio. Mata também microorganismos benéficos.",
      },
    ],
    prevention: [
      "Nunca reutilizar substrato entre cultivos — usar sempre substrato virgem e esterilizado",
      "Obter clones apenas de fontes confiáveis com histórico limpo",
      "Manter pH do substrato entre 6.0–6.5",
      "Evitar danos às raízes durante transplante",
      "Inocular substrato com Trichoderma e Bacillus preventivamente",
      "Esterilizar toda ferramenta que toca raízes entre plantas (álcool 70% ou hipoclorito)",
    ],
  },
  {
    id: "damping-off",
    name: "Tombamento (Damping Off)",
    pathogen: "Pythium spp. / Rhizoctonia solani / Fusarium spp.",
    emoji: "🌱",
    type: "oomycete",
    location: "seedling",
    severity: "high",
    isCurable: false,
    curingNote: "Mudas tombadas raramente sobrevivem. Foco em prevenir e salvar as restantes.",
    description: "Síndrome que afeta mudas e seedlings causada por múltiplos patógenos de solo. O caule na linha do substrato apodrece, a muda perde sustentação e tomba. Pode eliminar lotes inteiros de seedlings em 24–48h em condições favoráveis.",
    identification: [
      "Caule da muda estreita e murcha na linha do substrato (pescoço)",
      "Muda dobra e cai — raiz ainda conectada mas sem sustentação estrutural",
      "Tecido do caule na base fica marrom-escuro, amolecido e translúcido",
      "Em pré-emergência: semente apodrece antes de germinar",
      "Afeta mudas jovens em bandejas — pode criar 'patchwork' de mortes no canteiro",
      "Substrato excessivamente úmido é sinal de contexto",
    ],
    favorableConditions: [
      "Substrato sempre encharcado — causa principal",
      "Temperatura moderada-alta do substrato (20–28°C)",
      "Alta densidade de plantio (plantas muito próximas)",
      "Alta umidade do ar no nível do substrato",
      "Substrato não esterilizado / reutilizado",
      "Semeio muito profundo ou sementes muito cobertas de substrato",
    ],
    organicTreatments: [
      {
        name: "Isolamento das Mudas Afetadas",
        description: "Remover imediatamente as mudas tombadas e o substrato ao redor. Evitar que os esporos migrem pela água de irrigação.",
      },
      {
        name: "Canela em Pó",
        description: "Polvilhar levemente canela na superfície do substrato. Contém óleos essenciais (cinamaldeído) com propriedades antifúngicas comprovadas. Barreira eficaz e completamente natural.",
      },
      {
        name: "Chá de Camomila",
        description: "Regar mudas com chá de camomila frio e diluído. Propriedades antifúngicas brandas que inibem o crescimento de Pythium e Fusarium superficialmente.",
      },
      {
        name: "BTi (Bacillus thuringiensis israelensis)",
        description: "Também eficaz contra damping off por Pythium — previne larvas de mosquito do fungo que co-ocorrem e pioram o ambiente. Aplicar via irrigação.",
      },
      {
        name: "Reduzir Irrigação Imediatamente",
        description: "Parar de regar por 2–3 dias. Usar ventilação para secar a superfície do substrato. Retomar apenas com rega de baixo (bandeja) para evitar molhar o caule.",
      },
    ],
    chemicalTreatments: [
      {
        name: "Thiram / PCNB (Quintozene)",
        description: "Fungicidas de solo aplicados preventivamente antes da semeadura. Protegem sementes e radiculas de Pythium, Rhizoctonia e Fusarium.",
        warning: "Usar apenas no substrato — não em contato direto com partes consumíveis. Thiram é moderadamente tóxico.",
      },
    ],
    prevention: [
      "Rega de baixo (por capilaridade via bandeja) nas primeiras semanas — nunca molhar o caule",
      "Substrato específico para seedlings: leve, bem drenante, estéril",
      "Semear em vermiculita ou coco de alta qualidade + esterilizado",
      "Polvilhar canela na superfície ao semear como preventivo",
      "Boa circulação de ar sobre as bandejas de germinação",
      "Dome de germinação com ventilação diária — umidade controlada",
      "Inocular substrato com Bacillus subtilis e Trichoderma antes de semear",
    ],
  },
];
