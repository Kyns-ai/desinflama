# Fontes do conteúdo clínico — Desinflama

Este documento lista as fontes que embasam o conteúdo do programa (jornada,
aulas, gatilhos, trocas e receitas). É material para **revisão da nutricionista**
antes da publicação. O conteúdo do app é educativo, escrito como copy acessível —
**não é diagnóstico nem substitui acompanhamento profissional**, e foca em
sintomas (inchaço, gases, digestão, energia, pele), nunca em calorias ou peso.

> Pesquisa realizada em maio/2026. As fontes abaixo foram consultadas para
> validar os fundamentos; a nutricionista deve revisar porções e alimentos
> específicos para o público brasileiro com a base mais recente do app Monash.

---

## 1. Base FODMAP (grupos e classificação)

O programa se apoia na dieta **Low FODMAP**, desenvolvida pela **Monash University**.
FODMAP = *Fermentable Oligosaccharides, Disaccharides, Monosaccharides and Polyols*
— carboidratos de cadeia curta mal absorvidos que fermentam no intestino e podem
causar gás e distensão.

Grupos (usados em `foods.ts`, `swaps.ts`, `journey.ts`):
- **Oligossacarídeos** — frutanos (trigo, centeio, cebola, alho) e GOS (feijão,
  grão-de-bico, lentilha, soja).
- **Dissacarídeos** — lactose (leite, iogurte, queijos frescos).
- **Monossacarídeos** — frutose em excesso (maçã, pera, manga, melancia, mel).
- **Polióis** — sorbitol, manitol, xilitol (frutas como maçã/pera, cogumelo,
  couve-flor e adoçantes "sem açúcar"/diet).

Fontes:
- Monash FODMAP — High and low FODMAP foods: https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/
- Monash University — Low FODMAP Diet (origem): https://www.monash.edu/monash-innovation/impact/annual-reports/monash-university-low-fodmap-diet
- Healthline — High FODMAP foods (lista de apoio): https://www.healthline.com/nutrition/foods-high-in-fodmaps
- Canadian Digestive Health Foundation — Understanding the FODMAP diet: https://cdhf.ca/en/understanding-the-fodmap-diet/

**Nota de validação:** muitos alimentos são *low FODMAP em porção pequena* e
*high em porção grande* (sistema de "semáforo" do Monash). As porções sugeridas
no app (ex.: ⅛ de abacate, 2–3 colheres de feijão bem cozido) seguem essa lógica
e devem ser conferidas pela nutri no app Monash oficial.

## 2. As 3 fases (estrutura da jornada)

A jornada espelha as 3 fases do método Monash:
1. **Eliminação/Restrição** (no app: Choque + Remove, dias 1–7) — melhora típica
   em 2–6 semanas.
2. **Reintrodução/Desafio** (no app: dias 8–11) — testar **um grupo FODMAP por
   vez**, em porção pequena, observando a tolerância.
3. **Personalização/Manutenção** (no app: Repair + Modo Manutenção) — retomar o
   que se tolera; restringir só o que é gatilho pessoal.

Fontes:
- Monash FODMAP — The 3 phases of the low FODMAP diet: https://www.monashfodmap.com/blog/3-phases-low-fodmap-diet/
- Monash FODMAP — Order of FODMAP reintroduction: https://www.monashfodmap.com/blog/order-of-fodmap-reintroduction/
- Monash FODMAP — Practical tips for FODMAP reintroduction: https://www.monashfodmap.com/blog/practical-tips-fodmap-reintroduction/

**Nota de simplificação (importante para a revisão):** no protocolo clássico,
cada grupo é testado ao longo de ~3 dias (dose crescente) com dias de "lavagem".
Para caber no formato de 14 dias e manter a adesão, o app testa **um grupo por
dia** como uma primeira leitura de tolerância. A nutri pode orientar testes mais
longos no acompanhamento individual. O app deixa claro que o resultado é um
"mapa pessoal" inicial, não um diagnóstico.

## 3. Framework 5R (organização das fases)

As fases nomeadas do programa seguem o **5R** do *Institute for Functional
Medicine* (Remove, Replace, Reinoculate, Repair, Rebalance):
- **Remove** — retirar gatilhos/fermentadores (fase Choque/Remove).
- **Replace/Reinoculate** — apoiar digestão e repor bactérias boas
  (fermentados/prebióticos, dias 13 e Manutenção).
- **Repair** — nutrientes da mucosa: **L-glutamina, ômega-3, zinco** (dias 12–14).
- **Rebalance** — sono, estresse e movimento (Reset Profundo, dias 15–21).

Fontes:
- Institute for Functional Medicine — 5R Framework (visão geral): https://www.collaborativemed.com/the-5-r-gut-healing-process/
- Pure Encapsulations — Nutrient solutions to complement the 5R protocol: https://www.pureencapsulationspro.com/blog/nutrient-solutions-to-complement-the-5r-protocol-a-comprehensive-approach-to-maintaining-gut-health
- Maxwell Clinic — 5R Gut Protocol: https://maxwellclinic.com/five-rs-gut-restoration-2/

## 4. Eixo intestino-pele e intestino-cérebro (aulas)

Embasam as aulas "intestino-pele" e "intestino-cérebro" (`library.ts`) e os
ganhos de pele/energia mostrados no Progresso.
- A relação intestino-pele é **bidirecional**, mediada por imunidade, inflamação
  sistêmica e disbiose; ligada a acne, psoríase e dermatite.
- O eixo intestino-cérebro conecta microbiota, sistema nervoso entérico e SNC
  (nervo vago, sistema imune e neuroendócrino), influenciando humor e energia.

Fontes:
- Gut-skin axis: emerging insights — narrative review (WJG): https://www.wjgnet.com/2150-5330/full/v16/i3/108952.htm
- The gut-skin axis: bi-directional, microbiota-driven relationship (Gut Microbes): https://www.tandfonline.com/doi/full/10.1080/19490976.2025.2473524
- The gut-skin-brain axis in human health and disease (PMC): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9979212/
- Microbiota gut-brain axis and innate immunity (Frontiers): https://www.frontiersin.org/journals/cellular-and-infection-microbiology/articles/10.3389/fcimb.2023.1282431/full

## 4b. Mente-Intestino — respiração/relaxamento (Calmaria)

Embasam o pilar **Calmaria** (`content/calmaria.ts`): respiração guiada com
expiração prolongada + microeducação intestino-cérebro.
- Terapias dirigidas ao eixo intestino-cérebro (hipnoterapia, CBT) reduzem
  sintomas de SII **tanto quanto a dieta**, e a **AGA** as recomenda como parte
  do cuidado baseado em evidência. RCT do app de hipnoterapia (Nerva): ~81% com
  redução clinicamente significativa, mantida em 6 meses.
- Estresse/ansiedade amplificam a **sensibilidade visceral** (hipervigilância);
  acalmar o sistema nervoso reduz o desconforto real.
- Expiração mais longa que a inspiração aumenta o tônus **parassimpático/vagal**
  (efeito calmante).
- Enquadramento honesto e esperançoso importa: no SII o efeito **placebo ~40%** e
  o **nocebo ~32%** — medo piora, acolhimento melhora o desfecho.

Fontes:
- Digital gut-directed hypnotherapy RCT — Am J Gastroenterol (2024): https://doi.org/10.14309/ajg.0000000000002921
- Hypnotherapy vs low-FODMAP (equivalência) — PubMed 27397586: https://pubmed.ncbi.nlm.nih.gov/27397586/
- AGA / brain-gut behavioral therapies; ACG Clinical Guideline IBS (2021): https://journals.lww.com/ajg/fulltext/2021/01000/acg_clinical_guideline__management_of_irritable.11.aspx
- CBT for IBS (revisão de >30 RCTs, eixo cérebro-intestino-microbioma) — PMC8630837: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8630837/
- Placebo response in IBS (meta-análise) — Lancet Gastroenterol Hepatol: https://www.thelancet.com/journals/langas/article/PIIS2468-1253(21)00023-6/abstract

## 5. Hidratação, retenção e movimento

Apoiam as aulas de hábitos e os checklists (água ~2L, caminhada, sono).
- Hidratação adequada e redução de sódio ajudam a reduzir retenção; movimento
  estimula o trânsito intestinal. (Orientações gerais de educação em saúde —
  conferir guidelines locais; sem prescrição.)

## 6. "Detox não resolve"

A aula desmistificando "detox" baseia-se no consenso de que fígado e rins já
realizam a detoxificação; sucos detox podem, inclusive, concentrar FODMAPs
(maçã + folhas) e piorar o inchaço. Conferir comunicação para não soar como
promessa de cura.

---

## Itens para a nutricionista revisar antes de publicar
- [ ] Porções específicas de cada alimento contra o app Monash oficial (mais recente).
- [ ] Ordem e duração dos testes de reintrodução (decidir se mantém 1/dia ou expande).
- [ ] Mensagens de "reparo" (glutamina/zinco/ômega-3) — ajustar para educação, sem dose.
- [ ] Adequação dos alimentos brasileiros (ex.: mandioquinha, kabocha, polvilho).
- [ ] Linguagem de saúde: garantir que nada soe como diagnóstico ou cura.
- [ ] Disclaimer visível ligando à recomendação de procurar médico em sintomas intensos.

## Arquivos de conteúdo
- `journey.ts` — desafio 14 dias + Reset 15–21
- `challenges.ts` — desafios mensais (Reset pós-festa, Semana sem açúcar)
- `library.ts` — aulas por tema
- `foods.ts` — gatilhos (alto FODMAP que "parecem saudáveis")
- `swaps.ts` — biblioteca de trocas
- `recipes.ts` — receitas low FODMAP por fase
- `onboarding.ts` — perfis do Mapa de Inchaço
