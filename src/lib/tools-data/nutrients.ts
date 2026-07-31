export type NutrientMobility = "mobile" | "immobile" | "semi-mobile";
export type NutrientClass = "macro" | "micro";

export interface NutrientDeficiency {
  location: "old" | "new" | "all";
  visual: string[];
  progression: string;
  causes: string[];
  fixes: string[];
}

export interface NutrientExcess {
  visual: string[];
  fixes: string[];
}

export interface Nutrient {
  id: string;
  name: string;
  symbol: string;
  class: NutrientClass;
  mobility: NutrientMobility;
  function: string;
  deficiency: NutrientDeficiency;
  excess: NutrientExcess;
  phSoil: string;
  phHydro: string;
  rare?: boolean;
}

export const NUTRIENTS: Nutrient[] = [
  {
    id: "nitrogen",
    name: "Nitrogênio",
    symbol: "N",
    class: "macro",
    mobility: "mobile",
    function: "Componente essencial de aminoácidos, proteínas e clorofila. Responsável pelo crescimento vegetativo vigoroso e coloração verde intensa das folhas.",
    deficiency: {
      location: "old",
      visual: [
        "Folhas velhas ficam pálidas e depois amarelas",
        "Amarelamento começa nas pontas e margens",
        "Folhas caem prematuramente",
        "Crescimento geral lento e caules finos",
      ],
      progression: "Começa pelas folhas mais velhas (baixeiras) e sobe gradualmente para as mais novas. A planta 'canibaliza' o N das folhas velhas para alimentar o novo crescimento.",
      causes: [
        "pH fora da faixa ideal (mais comum)",
        "Substrato pobre ou esgotado",
        "Rega excessiva com lavagem de nutrientes",
        "Fase de floração avançada (natural)",
      ],
      fixes: [
        "Corrigir pH para 6.0–7.0 (solo) ou 5.5–6.5 (hidro)",
        "Aplicar fertilizante rico em N (ex: emulsão de peixe, ureia)",
        "Foliar com solução de N diluída como resposta rápida",
        "Revisar rotina de irrigação para evitar lixiviação excessiva",
      ],
    },
    excess: {
      visual: [
        "Folhas verde-escuro intenso, quase azuladas",
        "Queima das pontas (nitrogen burn) — pontas marrons enroladas",
        "Folhas largas em excesso",
        "Em floração: atrasa desenvolvimento de flores, buds mais frouxos",
      ],
      fixes: [
        "Reduzir dose de fertilizante nitrogenado",
        "Irrigar abundantemente para lavar excesso do substrato",
        "Em floração: parar de fornecer N adicional",
      ],
    },
    phSoil: "6.0–7.0",
    phHydro: "5.5–6.5",
  },
  {
    id: "phosphorus",
    name: "Fósforo",
    symbol: "P",
    class: "macro",
    mobility: "mobile",
    function: "Essencial para transferência de energia (ATP/ADP), síntese de DNA/RNA e desenvolvimento radicular. Fundamental para floração e formação de sementes.",
    deficiency: {
      location: "old",
      visual: [
        "Descoloração marrom-seca nas folhas velhas",
        "Caules e nervuras ficam vermelhos ou roxos",
        "Manchas escuras (quase pretas) nas folhas",
        "Folhas ficam brilhantes e depois tombam",
      ],
      progression: "Manifesta primeiro nas folhas mais velhas. A coloração roxa/avermelhada dos caules é sinal precoce característico, especialmente em plantas jovens expostas ao frio.",
      causes: [
        "pH baixo demais (<5.5 em solo) ou alto demais (>7.5) — bloqueio de P",
        "Temperatura baixa na zona radicular (<15°C reduz absorção)",
        "Excesso de zinco ou ferro antagonizando o P",
        "Substrato muito argiloso ou compactado",
      ],
      fixes: [
        "Ajustar pH para 6.0–7.0 (solo) — pico de absorção em ~6.5",
        "Aquecer zona radicular acima de 18°C",
        "Aplicar fertilizante fosfatado (farinha de osso, superfosfato)",
        "Foliar com solução de fosfato mono-potássico diluída",
      ],
    },
    excess: {
      visual: [
        "Deficiências secundárias de Fe, Mn, Zn (bloqueados por excesso de P)",
        "Pontas das folhas queimadas",
        "Clorose generalizada por micronutrientes travados",
      ],
      fixes: [
        "Reduzir ou eliminar fontes de P",
        "Lavar substrato com água pH correta",
        "Checar e suplementar micronutrientes bloqueados",
      ],
    },
    phSoil: "6.0–7.0",
    phHydro: "5.5–6.5",
  },
  {
    id: "potassium",
    name: "Potássio",
    symbol: "K",
    class: "macro",
    mobility: "mobile",
    function: "Regula abertura dos estômatos, síntese de proteínas e transporte de açúcares. Aumenta resistência a doenças, seca e temperaturas extremas.",
    deficiency: {
      location: "old",
      visual: [
        "Pontas e margens das folhas ficam marrons e queimadas",
        "Borda das folhas amarela ('scorch' marginal)",
        "Folhas enrolam para cima ou para baixo",
        "Sintomas avançam para o interior da folha",
      ],
      progression: "Inicia nas margens das folhas velhas como amarelamento, progride para necrose marrom. Planta parece 'queimada' nas bordas. Pode ser confundida com queima por fertilizante.",
      causes: [
        "pH incorreto (travamento mais comum que deficiência real)",
        "Excesso de Ca ou Mg antagonizando K",
        "Substrato lixiviado ou pobre",
        "Demanda alta em floração (pico de consumo de K)",
      ],
      fixes: [
        "Ajustar pH para 6.0–7.0 (solo)",
        "Aplicar sulfato de potássio ou nitrato de potássio",
        "Monitorar balanço Ca:Mg:K para evitar antagonismo",
        "Em floração: usar fertilizante específico rico em P-K",
      ],
    },
    excess: {
      visual: [
        "Pontas das folhas marrons (similar a queima por sal)",
        "Deficiências de Mg, Ca, Fe, Mn por antagonismo",
        "Clorose entre nervuras (Mg e Fe bloqueados)",
      ],
      fixes: [
        "Reduzir suprimento de K",
        "Lavar substrato abundantemente",
        "Verificar e corrigir micronutrientes secundários",
      ],
    },
    phSoil: "6.0–7.5",
    phHydro: "5.5–6.5",
  },
  {
    id: "calcium",
    name: "Cálcio",
    symbol: "Ca",
    class: "macro",
    mobility: "immobile",
    function: "Componente estrutural das paredes celulares. Essencial para divisão celular, estabilidade de membranas e sinalização. Absorvido apenas pelas pontas das raízes jovens.",
    deficiency: {
      location: "new",
      visual: [
        "Folhas novas ficam deformadas, enrolam e têm formas incomuns",
        "Manchas amarelo-marrons com bordas escuras no novo crescimento",
        "Pontas do crescimento apical ficam marrons e mortas",
        "Caules fracos e quebradiços",
      ],
      progression: "Afeta sempre o crescimento mais novo (Ca é imóvel — a planta não consegue redistribuí-lo). Crescimento apical prejudicado é sinal clássico. Raízes também são afetadas silenciosamente.",
      causes: [
        "pH baixo em solo (<6.0) ou hidro (<5.5)",
        "Excesso de K ou NH4+ inibindo absorção de Ca",
        "Substrato seco (Ca move pela corrente transpiratória — precisa de água)",
        "Água muito mole (baixo Ca e Mg naturalmente)",
      ],
      fixes: [
        "Ajustar pH para 6.2–7.0 em solo",
        "Usar Cal-Mag ou nitrato de cálcio",
        "Manter substrato levemente úmido (não deixar secar completamente)",
        "Em hidro: verificar ppm de Ca (ideal 150–200 ppm)",
      ],
    },
    excess: {
      visual: [
        "Depósitos brancos no substrato ou bandejas",
        "Bloqueio de Mg, K e micronutrientes",
        "Folhas com manchas branquicentas e rígidas",
      ],
      fixes: [
        "Reduzir suprimento de Ca",
        "Lavar substrato e checar pH",
        "Balancear Ca:Mg em proporção 3:1 a 4:1",
      ],
    },
    phSoil: "6.2–7.0",
    phHydro: "5.5–6.5",
  },
  {
    id: "magnesium",
    name: "Magnésio",
    symbol: "Mg",
    class: "macro",
    mobility: "mobile",
    function: "Átomo central da molécula de clorofila. Essencial para fotossíntese e ativação de mais de 300 enzimas. Cofator no transporte de P.",
    deficiency: {
      location: "old",
      visual: [
        "Clorose interveinal nas folhas velhas (nervuras verdes, entre elas amarelam)",
        "Manchas marrons enferrujadas entre as nervuras",
        "Folhas ficam crocantes e podem cairir",
        "Coloração amarela-ouro característica",
      ],
      progression: "Inicia nas folhas velhas intermediárias como amarelamento entre nervuras. É uma das deficiências mais comuns em cannabis, especialmente com água mole ou pH incorreto.",
      causes: [
        "pH incorreto — mais comum que deficiência real",
        "Excesso de Ca ou K inibindo Mg (antagonismo)",
        "Água de torneira com baixo Mg",
        "Substrato arenoso ou lixiviado",
      ],
      fixes: [
        "Ajustar pH para 6.0–7.0 (solo)",
        "Aplicar sulfato de magnésio (sal Epsom) — 5g/L foliar, 1g/L radicular",
        "Usar Cal-Mag regularmente em água mole",
        "Balancear Ca:Mg:K para evitar antagonismo",
      ],
    },
    excess: {
      visual: [
        "Folhas escuras e rígidas",
        "Deficiências de Ca e K por antagonismo",
        "Queima das pontas em casos severos",
      ],
      fixes: [
        "Reduzir suplementação de Mg",
        "Lavar substrato com água pH correta",
      ],
    },
    phSoil: "6.0–7.0",
    phHydro: "5.5–6.5",
  },
  {
    id: "sulfur",
    name: "Enxofre",
    symbol: "S",
    class: "macro",
    mobility: "immobile",
    function: "Componente de aminoácidos (cisteína, metionina) e proteínas. Essencial para síntese de clorofila e produção de terpenos/compostos aromáticos.",
    deficiency: {
      location: "new",
      visual: [
        "Folhas novas ficam verde-limão e depois amarelas",
        "Amarelamento uniforme (diferente de N, que começa pelas velhas)",
        "Folhas ficam rígidas e quebradiças",
        "Coloração pálida geral no novo crescimento",
      ],
      progression: "Por ser imóvel, afeta primeiro o crescimento mais novo. Similar à deficiência de N, mas inicia nas folhas novas e não nas velhas. Rara em cultivos com fertilização adequada.",
      causes: [
        "Substrato muito pobre em matéria orgânica",
        "pH acima de 7.5 (S precipita em pH alto)",
        "Ausência de fertilizantes sulfatados",
      ],
      fixes: [
        "Aplicar sulfato de magnésio (Epsom), sulfato de potássio ou sulfato de cálcio",
        "Corrigir pH para 6.0–7.0",
        "Adicionar matéria orgânica rica em S (farinha de pena, farinha de peixe)",
      ],
    },
    excess: {
      visual: [
        "Amarelamento e queima nas pontas das folhas",
        "Folhas com coloração bronzeada",
        "Crescimento geral suprimido",
      ],
      fixes: [
        "Lavar substrato abundantemente",
        "Reduzir ou eliminar fontes de S por alguns ciclos",
      ],
    },
    phSoil: "6.0–7.0",
    phHydro: "5.5–6.5",
  },
  {
    id: "iron",
    name: "Ferro",
    symbol: "Fe",
    class: "micro",
    mobility: "semi-mobile",
    function: "Essencial para síntese de clorofila e transporte de elétrons na fotossíntese. Deve ser reduzido de Fe³⁺ para Fe²⁺ antes da absorção radicular.",
    deficiency: {
      location: "new",
      visual: [
        "Clorose interveinal nas folhas NOVAS (nervuras verdes, entre elas amarelas/brancas)",
        "Folhas novas quase brancas em casos severos",
        "Contraste nítido entre nervuras verdes e entre-nervuras amarelas",
        "Sem manchas — clorose limpa e uniforme",
      ],
      progression: "Começa no novo crescimento. A clorose interveinal é quase idêntica à de Mn e Zn — a localização nas folhas novas é a chave diagnóstica principal. Responde rápido à correção de pH.",
      causes: [
        "pH alto (>6.8 em solo) — causa mais comum; Fe precipita em pH alto",
        "Excesso de Mn, Cu, Ca, Mg ou Zn inibindo absorção de Fe",
        "Substrato encharcado (reduz O₂ na rizosfera, impedindo redução Fe³⁺→Fe²⁺)",
        "Água fria demais na raiz",
      ],
      fixes: [
        "Reduzir pH para 5.8–6.5 (solo) ou 5.5–6.0 (hidro)",
        "Aplicar quelato de ferro (EDDHA funciona até pH 8.0; EDTA até pH 6.5)",
        "Melhorar drenagem e oxigenação do substrato",
        "Foliar com sulfato ferroso diluído como solução de emergência",
      ],
    },
    excess: {
      visual: [
        "Folhas bronze-douradas ou amarronzadas",
        "Manchas necróticas espalhadas",
        "Deficiências de P, Mn e Mo induzidas",
      ],
      fixes: [
        "Elevar pH para reduzir disponibilidade de Fe",
        "Lavar substrato",
        "Evitar quelatos de ferro em solos já ricos em Fe",
      ],
    },
    phSoil: "5.5–6.5",
    phHydro: "5.5–6.0",
  },
  {
    id: "manganese",
    name: "Manganês",
    symbol: "Mn",
    class: "micro",
    mobility: "immobile",
    function: "Cofator enzimático na fotossíntese (cadeia de transporte de elétrons), síntese de clorofila e metabolismo de nitrogênio.",
    deficiency: {
      location: "new",
      visual: [
        "Clorose pálida nas folhas novas, começando próximo à base da folha",
        "Manchas necróticas marrons pequenas entre nervuras",
        "Folhas novas com aparência desbotada e manchada",
        "Nervuras permanecem verdes por mais tempo que em deficiência de Fe",
      ],
      progression: "Afeta o novo crescimento. Similar a Fe, mas as manchas necróticas (pontos marrons) são mais características. A clorose tende a ser menos intensa e uniforme que em deficiência de Fe.",
      causes: [
        "pH alto (>6.5 em solo) — principal causa",
        "Excesso de Fe inibindo absorção de Mn",
        "Solo com pouca matéria orgânica",
      ],
      fixes: [
        "Baixar pH para 6.0–6.5 (solo)",
        "Aplicar sulfato de manganês foliar ou radicular",
        "Checar relação Fe:Mn para evitar desequilíbrio",
      ],
    },
    excess: {
      visual: [
        "Manchas marrons em folhas velhas",
        "Deficiência de Fe e Zn induzidas",
        "Clorose generalizada",
      ],
      fixes: [
        "Elevar pH levemente",
        "Reduzir fontes de Mn",
        "Suplementar Fe e Zn se necessário",
      ],
    },
    phSoil: "6.0–6.5",
    phHydro: "5.5–6.0",
  },
  {
    id: "zinc",
    name: "Zinco",
    symbol: "Zn",
    class: "micro",
    mobility: "immobile",
    function: "Cofator de mais de 300 enzimas. Essencial para síntese de auxinas (hormônios de crescimento), metabolismo de carboidratos e formação de clorofila.",
    deficiency: {
      location: "new",
      visual: [
        "Clorose interveinal nas folhas novas (similar a Fe e Mn)",
        "Folhas novas distorcidas, amassadas ou enrugadas",
        "Internós muito curtos — folhas pequenas agrupadas",
        "Folhas podem girar ~90° em relação ao eixo normal",
      ],
      progression: "Afeta o crescimento apical. A distorção física das folhas novas é o sinal mais distinto para diferenciar de Fe/Mn. Internós curtos e folhas pequenas são característicos.",
      causes: [
        "pH alto (>7.0 em solo) — principal causa",
        "Excesso de P bloqueando Zn",
        "Solo pobre em matéria orgânica",
        "Água altamente alcalina",
      ],
      fixes: [
        "Ajustar pH para 6.0–6.5 em solo",
        "Aplicar quelato de zinco ou sulfato de zinco",
        "Reduzir fontes excessivas de P",
        "Foliar com solução de Zn diluída",
      ],
    },
    excess: {
      visual: [
        "Inibição de crescimento",
        "Deficiências de Fe e Mn induzidas",
        "Necrose nas pontas das raízes",
      ],
      fixes: [
        "Lavar substrato",
        "Corrigir pH",
        "Suplementar Fe e Mn afetados",
      ],
    },
    phSoil: "6.0–6.5",
    phHydro: "5.5–6.0",
  },
  {
    id: "boron",
    name: "Boro",
    symbol: "B",
    class: "micro",
    mobility: "immobile",
    function: "Essencial para formação e integridade das paredes celulares, divisão celular, transporte de açúcares através do floema e germinação do tubo polínico.",
    deficiency: {
      location: "new",
      visual: [
        "Novo crescimento murcha apesar de substrato úmido",
        "Caules e folhas novas tortos, deformados e de cor amarelo-marrom",
        "Pontas do crescimento apical morrem (morte de meristema)",
        "Internós muito curtos — planta parece comprimida",
      ],
      progression: "Afeta meristemas e novo crescimento. A morte do ápice vegetativo é sinal grave. Sem boro, as paredes celulares não se formam adequadamente, interrompendo o crescimento.",
      causes: [
        "pH alto (>7.0) reduz disponibilidade de B",
        "Substrato seco — B é absorvido pela corrente transpiratória",
        "Excesso de Ca inibindo B",
        "Solo arenoso com baixo B orgânico",
      ],
      fixes: [
        "Ajustar pH para 6.0–6.5",
        "Aplicar ácido bórico ou borax diluído (atenção — doses muito baixas; excesso é tóxico)",
        "Manter substrato levemente úmido",
        "Usar fertilizante completo com micronutrientes",
      ],
    },
    excess: {
      visual: [
        "Queima das pontas das folhas velhas",
        "Clorose e necrose progressiva",
        "B é um dos nutrientes mais tóxicos em excesso — margem estreita",
      ],
      fixes: [
        "Lavar substrato imediatamente com grande volume de água",
        "Monitorar ppm de B estritamente em hidroponia",
      ],
    },
    phSoil: "6.0–6.5",
    phHydro: "5.5–6.0",
  },
  {
    id: "copper",
    name: "Cobre",
    symbol: "Cu",
    class: "micro",
    mobility: "semi-mobile",
    function: "Componente de enzimas oxidativas, síntese de clorofila e lignina. Essencial para transporte de elétrons na fotossíntese.",
    rare: true,
    deficiency: {
      location: "new",
      visual: [
        "Murcha lenta e persistente mesmo com substrato úmido",
        "Novo crescimento torcido, retorcido",
        "Folhas novas com coloração azul-esverdeada intensa",
        "Borda das folhas enrola para baixo",
      ],
      progression: "Rara em cultivos com fertilização adequada. Murcha não responsiva a irrigação é o sinal mais distintivo. Confundida frequentemente com problema de raízes ou excesso de calor.",
      causes: [
        "pH alto (>7.0) bloqueando Cu",
        "Excesso de P ou Zn antagonizando Cu",
        "Substrato com muita matéria orgânica ligando Cu (tornando-o indisponível)",
      ],
      fixes: [
        "Ajustar pH para 6.0–6.5",
        "Aplicar sulfato de cobre muito diluído (extremamente potente — cuidado)",
        "Usar fertilizante completo com micronutrientes quelatos",
      ],
    },
    excess: {
      visual: [
        "Inibição grave do crescimento",
        "Raízes marrons e necróticas",
        "Deficiências de Fe e Mn induzidas",
        "Fitotoxicidade — muito tóxico em excesso",
      ],
      fixes: [
        "Lavar substrato imediatamente",
        "Elevar pH para reduzir disponibilidade",
        "Trocar substrato em casos graves",
      ],
    },
    phSoil: "6.0–7.0",
    phHydro: "5.5–6.0",
  },
  {
    id: "molybdenum",
    name: "Molibdênio",
    symbol: "Mo",
    class: "micro",
    mobility: "mobile",
    rare: true,
    function: "Cofator essencial para redução de nitrato (nitrato→amônio) e fixação de nitrogênio. Presente em quantidades mínimas no tecido vegetal.",
    deficiency: {
      location: "old",
      visual: [
        "Clorose interveinal nas folhas velhas (similar a Mg)",
        "Margens das folhas enrolam para cima",
        "Folhas ficam pálidas e desbotadas",
        "Agravado por temperaturas baixas",
      ],
      progression: "Por ser móvel, manifesta nas folhas velhas. Muito rara. A semelhança com deficiência de N/Mg pode mascarar o diagnóstico. Temperaturas baixas (<15°C) pioram a absorção de Mo.",
      causes: [
        "pH baixo (<6.0 em solo) — Mo é mais disponível em pH alto (incomum entre nutrientes)",
        "Substrato muito ácido",
        "Solo com baixa CTC (capacidade de troca catiônica)",
      ],
      fixes: [
        "ELEVAR pH para 6.5–7.0 (oposto da maioria dos nutrientes)",
        "Aplicar molibdato de sódio ou amônio em doses mínimas",
        "Manter temperatura da zona radicular acima de 18°C",
      ],
    },
    excess: {
      visual: [
        "Descoloração amarela-laranja das folhas (rara)",
        "Geralmente não visível — tóxico apenas em concentrações muito altas",
      ],
      fixes: [
        "Reduzir suplementação",
        "Lavar substrato",
      ],
    },
    phSoil: "6.5–7.0",
    phHydro: "5.5–6.5",
  },
];
