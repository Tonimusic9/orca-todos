# PROMPT MESTRE — ORCA Project Progress

> **Missão executiva para Codex Goal** · Versão 1.1 · 19/11/2026 · Idioma de execução e relatórios: **português brasileiro**
>
> **Uso:** coloque este documento na raiz do repositório do plugin aberto no ORCA e inicie uma conversa Codex nesse diretório. Ative a meta com o comando curto da seção **15**. Este arquivo é a **especificação operacional e os critérios de aceitação**; a meta `/goal` é propositalmente curta para não duplicar instruções nem esbarrar no limite de entrada do comando.

---

## 0. Mandato e prioridades inegociáveis

**Regra geral:** tanto Claude Code quanto Codex podem liderar projetos e delegar tarefas conforme franquias. **Para este projeto, por escolha explícita do usuário, você é o Codex Goal, único agente principal e responsável pela entrega**. Não abra outro coordenador concorrente. Seu trabalho é construir autonomamente, com intervenções humanas mínimas, um **MVP funcional, simples e comprovadamente testado** de plugin nativo do ORCA chamado provisoriamente **Project Progress**.

Prioridades, nesta ordem:

1. **Resultado visível:** um checklist macro do plano inteiro do projeto, na **barra lateral direita** do ORCA, no espaço/aba onde também aparece o explorador de arquivos. O usuário deve poder alternar entre explorador e checklist.
2. **Confiabilidade:** representar o estado real do plano registrado em Markdown, sem inventar conclusões; cada tarefa só conta como feita quando estiver marcada/verificada no arquivo-fonte.
3. **Reutilização:** partir do projeto open source [`jonstuebe/orca-todos`](https://github.com/jonstuebe/orca-todos), preservando a licença MIT, sua integração com o ORCA e suas rotinas úteis. Fazer **fork** quando possível; **não recomeçar do zero**.
4. **Autonomia com limites:** escolher, implementar, testar, corrigir, fazer commit/push na branch de trabalho e encerrar sem solicitar aprovação em cada fase; interromper só por risco ou permissão verdadeiramente fora do escopo, custo, limite ou bloqueio real.
5. **Economia:** modificar somente o necessário, usar poucos tokens do Codex, aproveitar opcionalmente o OpenCode Go já configurado para trabalhos isolados, evitar agentes/revisões redundantes.

**A solicitação NÃO é:** Kanban, quadro de cartões, gerenciador de projetos completo, ferramenta SaaS, monitor de sessões do agente, sistema de tickets, dashboard web externo ou pipeline multiagente complexa.

**Não amplie o escopo mesmo que identifique ideias interessantes.** O sucesso significa atender aos critérios da seção 9, não criar a solução mais sofisticada possível.

## 1. Contexto validado das decisões do usuário

- O usuário desenvolve no **ORCA IDE**, alternando entre projetos, Claude Code, Codex e OpenCode.
- Quer a visualização **persistente do plano completo do repositório**, não apenas o checklist transitório de uma conversa.
- A interface desejada é **vertical, compacta, legível na lateral direita**, com progresso total, fases expansíveis e tarefas com ícones de estado.
- O projeto deve permanecer simples: **sem Kanban**, sem instalar um segundo gerenciador, sem replicar as tarefas em banco de dados.
- Os agentes já podem registrar trabalho nos arquivos Markdown do projeto; o plugin só deve refletir mudanças efetivas.
- O usuário quer **supervisionar muito pouco**. Claude Code e Codex podem liderar projetos, mas **neste plugin a execução é exclusivamente sob o Codex Goal**. O Codex planeja, delega apenas quando economiza trabalho, integra e valida, **sem portões de aprovação por fase**.
- Há interesse em usar a franquia **OpenCode Go**, especialmente DeepSeek V4.1 Flash, GLM-5.3-Flash, GLM-5.3 e Kimi K2.7 Code, sem ativar cobranças adicionais.
- Há um roteador de modelos chamado **9router** possivelmente instalado no Mac ou em VPS. Verifique se existe e se é utilizável, mas **não instale, reconfigure ou dependa dele** para esse MVP.
- O usuário também dispõe de Gemini/Antigravity e deseja que **OpenCode Go ou Gemini possam atuar como executores**, conforme limite de tokens/franquia no momento. **A escolha deve ser condicional e econômica, não obrigação de usá-los**. Só delegar Gemini por interface/API oficialmente permitida; **não automatizar assinatura pessoal do Antigravity por wrapper/cliente terceiro não autorizado**. Sem caminho permitido, seguir pelo OpenCode ou Codex sem bloquear o MVP.

### O exemplo visual a reproduzir

```text
┌───────────────────────────────────────┐
│ Projeto — Visão geral          60%    │
│ ██████████████░░░░░░░░░░              │
│ 9 de 15 tarefas concluídas            │
│                                       │
│ ✅ Fase 1 — Planejamento       3/3    │
│    ☑ Definir requisitos               │
│    ☑ Arquitetura do sistema            │
│    ☑ Organizar o repositório           │
│                                       │
│ ✅ Fase 2 — Backend            3/3    │
│    ☑ Implementar API                  │
│    ☑ Configurar banco de dados         │
│    ☑ Testar endpoints                 │
│                                       │
│ ◉ Fase 3 — Frontend            3/5    │
│    ☑ Criar componentes                │
│    ☑ Implementar navegação            │
│    ☑ Conectar API                     │
│    ◉ Implementar autenticação         │
│    ☐ Validar responsividade           │
│                                       │
│ ○ Fase 4 — Testes e entrega    0/4    │
│    ☐ Executar testes integrados       │
│    ☐ Revisar segurança                │
│    ☐ Preparar deploy                  │
│    ☐ Validar entrega final            │
└───────────────────────────────────────┘
```

**Atenção:** acima é um *mockup ilustrativo*, não dados reais nem uma captura funcional. Reproduzir o **padrão visual**, não copiar porcentagens. Adaptar ao tema do ORCA e à largura de uma sidebar, sem dependência de navegador externo. Se o usuário anexar a captura de referência ao Codex, priorizá-la para o ajuste visual.

## 2. Fonte técnica obrigatória: fork do Todos for ORCA

**Base:** https://github.com/jonstuebe/orca-todos

O README do repositório descreve:

- `src/panel.tsx`: painel nativo de componentes do ORCA;
- `src/worker.ts`: identifica o worktree em foco e observa `TODO.md`;
- `src/todo-file.ts`: parser e edição de tarefas Markdown;
- `orca-plugin.json`: manifesto do plugin;
- `npm run typecheck` e `npm test` (test/check da CLI ORCA);
- `orca plugin dev load . --json` para carregamento de desenvolvimento.

**Fluxo de origem:**

1. Inspecione o conteúdo e confirme a versão real, APIs, licença e scripts. **Não confie cegamente nesta descrição se o código divergir.**
2. Se este diretório já for um **fork de `jonstuebe/orca-todos`**, trabalhe nele; não clone uma segunda cópia.
3. Se for um repositório vazio, **está autorizado a criar um fork/cópia derivada segura e configurar a branch de trabalho sem pedir confirmação**, quando as credenciais Git já estiverem disponíveis e a operação não sobrescrever dados existentes. Se houver impedimento de autenticação, use uma **cópia derivada local** da base no repositório atual, preservando `LICENSE`, autoria e referência de `upstream`; registre quando ainda não for um fork hospedado. Não sobrescreva arquivos ou histórico existentes.
4. Faça o trabalho em uma **branch local própria** (por exemplo `feat/project-progress-mvp`), salvo se o ORCA/Git já tiver preparado um branch de trabalho equivalente.
5. Reutilize identificação de workspace, observação de arquivos, ciclo de vida e componentes. **Não reimplemente o host ORCA nem crie infraestrutura duplicada.**
6. Remova ou neutralize com cautela, **somente se necessário**, recursos de marcação manual ou envio de mensagens que contrariem um painel **somente leitura**. Preserve testes e funções que ainda sejam úteis.
7. Mantenha a atribuição original e o texto da licença MIT. **Commit e push na branch de trabalho do fork estão pré-autorizados**, após conferir remoto, diff, `.gitignore` e ausência de segredos; **não** fazer push em `main`, force-push, merge, abertura de PR ou publicação no marketplace sem pedido específico. Não instalar globalmente sem autorização.

## 3. Pré-requisito obrigatório: skill oficial `orca-plugin-authoring`

Antes de alterar o plugin, **carregue a skill oficial correspondente à versão instalada do ORCA**. Fontes:

- https://github.com/stablyai/orca/blob/main/skill-guides/orca-plugin-authoring.md
- https://github.com/stablyai/orca/blob/main/docs/site/content/docs/cli/skills.mdx

Procedimento sugerido, adaptando ao binário efetivamente instalado. **Preferir skill já presente**; instalar globalmente apenas se indispensável e autorizado, pois `--global` altera o ambiente do usuário:

```bash
# Se a skill estiver ausente, consulte o modo de instalação autorizado.
# Exemplo oficial para uso global (NÃO executar sem necessidade/consentimento):
npx skills add https://github.com/stablyai/orca --skill orca-plugin-authoring --global

# Resolva o executável correto (orca, orca-dev, orca-ide ou ORCA_CLI_COMMAND)
orca skills get orca-plugin-authoring
orca skills get orca-plugin-authoring --references
# Leia apenas referências necessárias, por exemplo:
orca skills get orca-plugin-authoring --reference references/components.md
orca skills get orca-plugin-authoring --reference references/workflow.md
orca skills get orca-plugin-authoring --reference references/testing.md
orca skills get orca-plugin-authoring --reference references/manifest.md
```

**O comando `orca` acima é um exemplo:** a skill ensina a resolver o executável real da instalação. Use `--json` nos comandos `plugin` conforme o guia. Não invente API, flags, identificadores ou permissões. O código existente e as referências geradas pela **instalação local** têm prioridade sobre exemplos antigos da web.

Preferir o painel **TSX components** existente do fork ao uso de HTML, CSS ou React externo. Painéis components têm restrições próprias (não pressupor DOM, hooks React nem imports de bibliotecas não permitidas). Consultar a skill antes da implementação.

## 4. Definição funcional exata do MVP

### 4.1 Interface (obrigatória)

1. **Painel nativo do ORCA na barra lateral direita**, selecionável pela barra de atividade; não substituir permanentemente o explorador de arquivos nem forçar reorganização da interface.
2. Cabeçalho com **nome do projeto/workspace**, percentual total e contador `X de Y tarefas`.
3. **Uma barra horizontal de progresso global**.
4. **Fases sequenciais e expansíveis**, cada uma com título, estado, `X/Y` e, se viável sem dependência extra, uma barra discreta própria.
5. **Checklist vertical**, com tarefas/subtarefas indentadas e ícones distinguindo **concluída**, **em execução (somente se explicitamente registrada)** e **pendente**.
6. Itens longos devem quebrar linha/truncar de maneira acessível, mantendo legibilidade em largura estreita e rolagem vertical.
7. Adaptar-se ao tema do ORCA (claro/escuro), utilizando preferencialmente componentes/cores nativas.
8. Estado vazio inteligível: `Nenhum plano Markdown com checkboxes encontrado`, com orientação curta; nunca mostrar 100% num plano vazio.
9. Estado de erro distinguível: se leitura falhar, mostrar a falha sem apagar permanentemente os dados válidos em memória; não exibir dado antigo como se fosse atualizado.
10. **Somente leitura no MVP**: o plugin não deve marcar caixas, alterar o plano, mandar mensagens a agentes, criar tarefas ou executar ações destrutivas.

### 4.2 Origem do planejamento (obrigatória, simples)

- **Uma fonte canônica Markdown por projeto**. Priorizar arquivo de plano existente em vez de inventar planejamento novo.
- Para manter o MVP pequeno, detectar arquivos com checkboxes em ordem definida e documentada, por exemplo: `PROJECT_PLAN.md`, `PLAN.md`, `ROADMAP.md`, `TASKS.md`, `TODO.md`, e, se necessário, variantes diretas em `docs/` como `docs/PLAN.md` e `docs/ROADMAP.md`. **Escolher o primeiro candidato existente com tarefas verificáveis**; se houver múltiplas fontes candidatas, mostrar o nome do arquivo usado e nunca somar indiscriminadamente documentos que podem duplicar tarefas.
- Se o fork já usa `TODO.md`, preservá-lo como opção totalmente compatível. Não forçar duplicação de `PLAN.md` em `TODO.md` só para alimentar o painel.
- Se a descoberta automática simples for ambígua, apresentar **um seletor mínimo de arquivo** ou aceitar uma configuração por projeto, sem criar uma tela de preferências complexa. Uma decisão de seleção explícita deve persistir ao trocar de sessão.
- Ler cabeçalhos Markdown (`#`, `##`, `###`) como estrutura de fases conforme a hierarquia real; tarefas são checkboxes `- [ ]` e `- [x]` (e equivalentes com `*`). Suportar tarefas aninhadas por indentação onde o formato permitir.
- Desconsiderar caixas fictícias dentro de cercas de código; preservar nomes repetidos e ordem do documento. Não tentar interpretar prosa vaga como tarefa concluída.
- Um indicador opcional de **em andamento** pode ser representado por marcador textual explícito no item ainda não concluído (por exemplo `@doing`), **sem alterar as convenções do plano original**. Se não houver marcador verificável, mostrar pendente, não inferir atividade por sessão.
- Não modificar nenhum plano do usuário durante a criação ou teste; usar **fixtures de exemplo no repositório do plugin**.

### 4.3 Regras de contagem (obrigatórias)

- **Unidade de contagem:** checkbox de tarefa **folha**; cabeçalhos de fase não contam como tarefas. Se houver um checkbox pai e subtarefas, evitar dupla contagem: tratar a regra de forma explícita, estável e testada (preferir contabilizar folhas; pai apenas como agrupamento quando tiver filhos).
- Total global = soma das tarefas contabilizáveis das fases; concluídas = itens `x` contabilizáveis. **Percentual = arredondar(100 × concluídas ÷ total)** quando total > 0.
- Fases: cálculo independente, concluída se todas as tarefas contabilizáveis estiverem marcadas; andamento se alguma concluída ou item explicitamente ativo; pendente se nenhuma concluída nem ativa. Fase vazia = **sem tarefas**, não concluída.
- Todo progresso deve refletir **somente o arquivo-fonte**. Código escrito, commits, logs ou afirmações do agente não comprovam conclusão sem atualização explícita do checklist.
- Usar ícones/cores com legenda implícita e leitura textual; não depender de cor apenas.

### 4.4 Atualização e persistência (obrigatórias)

- Reutilizar o *file watcher* do fork, com atualização automática após gravação válida do arquivo Markdown, evitando polling agressivo e loops de eventos.
- Aceitar gravações temporariamente incompletas sem crash; usar debounce pequeno se preciso.
- Ao alternar para outro projeto/workspace no ORCA, exibir o plano **desse projeto**, não o do projeto anterior.
- O progresso é persistente porque **está no Markdown do projeto**, não numa memória temporária de sessão do Codex/Claude/OpenCode.
- Evitar mudanças no arquivo por parte do plugin e evitar conflitos entre agentes editores; se agentes concorrentes alterarem o mesmo plano, o comportamento deve ser seguro e explicitamente documentado.
- **MVP não exige agregar diferentes planos de worktrees distintos nem centralizar múltiplos documentos**. Em cada projeto/worktree selecionado, mostrar o **plano completo canônico** correspondente. Se for possível usar a raiz comum do projeto sem ampliar complexidade, ótimo; caso contrário, documentar claramente esse limite sem mascará-lo.

## 5. O que NÃO será desenvolvido

**Proibido no MVP:** Kanban, drag-and-drop, banco de dados, backend web, servidor HTTP, SaaS, sistema de notificações, gerenciamento de usuários, integração com Linear/Jira, time tracking, Gantt, editor Markdown completo, importação de 10 formatos, dashboard multiplataforma, resumo por LLM, métricas fictícias, monitoramento de tokens em tempo real, roteador multiagente novo, redesign do ORCA, análise automática de todos os arquivos do repositório ou histórico Git como prova de conclusão.

**O 9router não é pré-requisito.** Não reestruture máquinas, VPS ou rede para usá-lo. Não transforme este projeto numa plataforma de coordenação de agentes.

## 6. Papéis dos agentes e roteamento econômico

### 6.1 Agente principal: Codex com Goal

Embora Claude Code também possa liderar projetos, **neste MVP não há alternância de líder**. O Goal do Codex conduz todas as fases sem novo aceite, inclusive commits e push na branch de trabalho.

Responsável por diagnóstico inicial, arquitetura mínima, divisão de tarefas (se necessária), integração do código, comparação visual, testes, verificação de permissões, auditoria de critérios e decisão final de conclusão/bloqueio. Executa tarefas pequenas diretamente em vez de delegar. **Modelo principal:** preferir o modelo Codex que o usuário tiver selecionado, especialmente **GPT-6 Sol** quando disponível; confirmar o identificador real no ambiente, sem forçar troca de modelo nem alterar configurações globais. O êxito depende mais do contrato Goal do que de escolher uma variante específica.

O **Goal é ligado à conversa/thread**, não é memória global nem substitui este arquivo. Continue na mesma thread de Codex enquanto a meta estiver ativa. Nunca afirme que o Goal funciona em background fora dos limites e permissões do Codex. Siga a documentação https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex .

### 6.2 Executor secundário: OpenCode Go, somente quando compensar

Antes de delegar:

1. Verifique `opencode --version`, `opencode run --help`, autenticação e inventário de modelos **sem imprimir credenciais**. Catálogo: `opencode models`/seletor da instalação; endpoint oficial de consulta, se necessário: https://opencode.ai/inference/go/v1/models . Confirme o ID exato `provider/model` em tempo de execução; **não suponha que as strings abaixo são necessariamente iguais na instalação local**.
2. Confirme que a assinatura Go está ativa, que a franquia tem disponibilidade e que **Extra Usage está desligado**. Se não puder confirmar o estado de cobrança, **não executar tarefa paga delegada** até obter uma confirmação segura. Nunca habilitar Extra Usage, créditos extras, novas assinaturas ou provedores pagos.
3. Confirme a política de privacidade do workspace. Para DeepSeek, **não habilitar região Global automaticamente**; se estiver bloqueado, escolher outro modelo.
4. Se já existir 9router, apenas inspecione sua configuração **de forma segura e somente leitura** e use-o apenas se houver um caminho funcional já disponível. Caso contrário, `opencode run` diretamente.
5. Execute **no máximo uma delegação em andamento**. A tarefa precisa ter limites de arquivos, entrada, saída, critérios de aceite e testes identificáveis. Não delegue coordenação nem repasse autorização ampla.

#### Mapa de modelos por tipo de tarefa (preferências, sujeitas à disponibilidade real)

| Natureza da tarefa | Modelo Go preferido | Reserva / escalonamento | Condição |
|---|---|---|---|
| Parser de Markdown, testes unitários, mudanças repetitivas, ajustes localizados | **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash` como candidato) | **GLM-5.3-Flash** | DeepSeek apenas se privacidade/região já permitirem |
| UI TSX simples, componentes, estados de interface, estilos nativos | **GLM-5.3-Flash** (`opencode-go/glm-5.3-flash`) | DeepSeek V4.1 Flash, se permitido | Priorizar execução barata e pequena |
| Bug de API ORCA, raciocínio mais pesado, problema de integração comprovado | **GLM-5.3** (`opencode-go/glm-5.3`) | Codex principal | Escalonar apenas com hipótese e evidência |
| Modificação de código realmente difícil e isolada, quando a primeira tentativa falhou por capacidade | **Kimi K2.7 Code** (`opencode-go/kimi-k2.7-code`) | GLM-5.3 ou Codex | Não usar automaticamente só por ter “Code” no nome |
| Decisão arquitetural, aceitação, integração final, segurança, encerramento | **Codex principal** | Não delegar, salvo necessidade excepcional | Responsabilidade final indelegável |

**Observação:** essa tabela é uma **política operacional proposta**, não garantia de superioridade de benchmarks nem promessa de preço. Os modelos, limites, taxas e disponibilidade podem mudar. Os modelos pagos do Go **compartilham a mesma franquia** e o consumo dos executores externos **não é necessariamente contabilizado no orçamento de tokens do Goal**. O GLM-5.3 tem promoção de limites anunciada até **22/11/2026**; não conte com ela em execuções posteriores.

Exemplo **somente após confirmar o ID disponível**:

```bash
opencode run --model opencode-go/glm-5.3-flash \
  "No fork atual, implemente SOMENTE o parser de fases Markdown e testes associados. Não modifique manifesto, worker ou outros arquivos. Entregue diffs, testes executados e pendências em até 12 linhas."
```

**Não usar `--auto` ou permissões irrestritas para subprocessos** apenas para reduzir prompts. O processo do OpenCode deve atuar no mesmo repositório isolado com escopo restrito e sem acessar secrets. Se o comando/modelo não for suportado, corrigir o identificador após inspeção **uma única vez** ou trabalhar diretamente com Codex.

### 6.3 Regra de delegação por vantagem real

Além do OpenCode Go, **Gemini pode ser delegado pelo agente líder** se houver integração oficialmente autorizada e saldo/franquia disponíveis. Para este MVP o líder é sempre Codex Goal. Confirmar limites reais antes de escolher; não contornar políticas do Antigravity pessoal nem gastar para configurar integração nova.

Delegar só quando: (a) a tarefa estiver isolada, (b) tiver testes claros, (c) não compartilhar arquivos editados simultaneamente, (d) custar visivelmente mais esforço ao Codex executá-la do que supervisioná-la. **No máximo 2 delegações substantivas no MVP**, salvo bloqueio excepcional e justificado. Nunca criar cadeia de agentes ou “revisor do revisor”. Se o OpenCode falhar, Codex investiga antes de escolher outro modelo.

## 7. PROTOCOLO ANTI-LOOP — cláusulas obrigatórias

Essas regras têm precedência sobre qualquer impulso de “melhorar até ficar perfeito”. São limites de **processo**, além do orçamento nativo do Goal:

**R1 — Máximo de duas tentativas por causa identificada.** A segunda só pode ocorrer após diagnóstico e alteração material da hipótese, código ou configuração. Mesma tentativa com mesmo erro e mesmo insumo é proibida.

**R2 — Duas iterações consecutivas sem progresso observável = parar aquela abordagem.** Progresso observável significa pelo menos uma destas evidências: teste antes falho passou, bug reproduzível foi corrigido, critério de aceite demonstrado, erro diminuiu de forma mensurável, alteração mínima validada. Logs extensos, mais reflexão ou repetir comandos não contam.

**R3 — Uma revisão/correção por entrega delegada.** O executor recebe feedback objetivo uma vez. Depois, Codex integra/corrige diretamente ou interrompe a abordagem. Não criar subagentes revisores adicionais.

**R4 — Uma delegação por vez.** Não abrir agentes em paralelo, árvores de subagentes ou processos permanentes sem utilidade demonstrada. Encerrar sessões/processos auxiliares ao finalizar.

**R5 — Proibido revisar o projeto inteiro novamente a cada continuação do Goal.** Usar diff, arquivos relevantes, checkpoint e resultado de testes recentes. Reabrir documentação somente quando houver evidência de incompatibilidade.

**R6 — Teste mais estreito primeiro.** Corrigir uma falha com teste focalizado, depois executar suite geral **uma vez na validação final** (ou após alterações que a invalidem). Não repetir build completo sem diferença técnica justificável.

**R7 — Pare no MVP.** Assim que os requisitos obrigatórios e evidências da seção 9 forem satisfeitos, **marcar o Goal como concluído**. Não fazer polish, perf tuning, refatoração estrutural, documentação extra ou novas integrações além das mínimas para uso seguro.

**R8 — Não escalar cegamente modelo.** Uma falha de permissão, ambiente, especificação ou dependência não se resolve trocando para um LLM mais caro. Classificar primeiro a causa.

**R9 — Orçamento fechado, sem extensão automática.** Orçamento inicial **sugerido de 40.000 tokens no Goal Codex** como teto de planejamento, **não previsão** nem garantia de custo. Não aumentar o limite sozinho. Pode e deve concluir antes. Orçamento externo Go deve ser monitorado separadamente; jamais compensar um limite atingido ativando cobrança extra.

**R10 — Bloqueio verdadeiro encerra tentativa.** Exigir humano somente para permissão sensível real do ORCA, login/2FA sem sessão válida, alteração global ou de privacidade, cobrança, conflito de dados, operação destrutiva ou impossibilidade comprovada de testar. **Não solicitar aprovação para fases, fork seguro, commit ou push na branch de trabalho autenticada.** Apresentar uma única ação mínima necessária e preservar o trabalho.

**R11 — Verificação factual.** Nunca afirmar “funciona no ORCA” se só passou TypeScript, nem “atualiza automaticamente” sem simular alteração no arquivo; separar **verificado**, **não verificado** e **bloqueado**.

**R12 — Segurança do repositório.** Não usar `git reset --hard`, `git clean -fd`, exclusão em massa, sobrescrever configuração global, expor tokens ou editar projetos reais. **Commit/push automáticos são permitidos exclusivamente na branch de trabalho do fork**, sem force-push e somente após conferir `git status`, diff, `git remote -v`, branch e segredos. Preserve toda alteração preexistente do usuário.

**R13 — Checkpoints enxutos.** Manter um único arquivo transitório `docs/GOAL_CHECKPOINT.md` (ou outro equivalente já existente) com no máximo ~50 linhas, atualizado **em marcos significativos**, não a cada resposta. Registrar: itens aceitos, arquivos alterados, comandos/testes e resultado, uma falha ativa, tentativas gastas e próximo passo. Não copiar logs enormes. Ao fim, esse checkpoint pode virar o resumo de validação.

**R14 — Anti-planejamento infinito.** Faça **uma inspeção inicial e um plano curto (máx. 5–7 passos)**. Depois comece o código. Proibido produzir sucessivas propostas sem executá-las. Não criar um projeto paralelo para planejar o projeto.

**R15 — Critério de parada antecipada.** Caso a solução já esteja praticamente disponível no fork, prefira menor modificação, inclusive **não mudar** partes prontas. Provar por teste antes de criar código novo.

### Decisão a cada iteração do Goal

Antes de qualquer nova ação, responda internamente de forma breve:

1. Qual critério ainda está faltando e qual evidência prova isso?
2. Qual é a **menor** ação nova capaz de melhorá-lo?
3. Essa ação já foi tentada? Se sim, o que realmente mudou?
4. O custo e o risco justificam prosseguir dentro do orçamento?
5. Se não há caminho defensável: **parar e relatar bloqueio**, não entrar em loop.

## 8. Plano de execução recomendado (mínimo)

1. **Inventário curto:** Git/worktree atual, arquivos preexistentes, ORCA + skill oficial, fork base, `npm`, scripts, OpenCode opcional, estado seguro de cobrança. Resumir em 10–15 linhas. Não reinstalar o que já existe.
2. **Reaproveitamento:** identificar menor patch possível em `src/panel.tsx`, `src/todo-file.ts` e, se necessário, `src/worker.ts`; manter manifesto e tipagem válidos. Usar `npm ci` com lockfile existente, se compatível. Não criar um novo scaffold paralelo.
3. **Implementar parser/contagem + fixtures:** cobrir fases, checkbox aninhada, sem tarefas, cercas de código, percentuais e status explícito. Delegação pequena ao Go se realmente compensar.
4. **Montar painel vertical:** cabeçalho, barra, grupos expansíveis, ícones, estados vazios e modo compacto. Reaproveitar componentes nativos ORCA; nada de Kanban.
5. **Conectar ao watcher/workspace:** ler fonte canônica, atualizar com mudanças, não editar arquivo do usuário, tratar troca de projeto/ambiguidade.
6. **Validar com skill:** testes de unidade, typecheck, `plugin test`, `plugin check`, `plugin validate`, carregamento real e captura de tela se ambiente permitir. Fazer no máximo um ajuste visual focalizado após evidência.
7. **Encerrar e entregar:** relatório compacto de evidências, limitações, comando para abrir painel e eventual ação humana essencial. Parar sem polimento opcional.

## 9. CRITÉRIOS DE ACEITAÇÃO — a única definição de “concluído”

Use checkboxes abaixo como contrato de verificação, **não marque sem prova**:

- [ ] **A1. Origem reutilizada:** desenvolvimento baseado no código `jonstuebe/orca-todos`, licença/atribuição preservadas, sem reiniciar do zero.
- [ ] **A2. Painel ORCA:** o painel é exibido na **barra lateral direita** e é alternável com o explorador (com teste/inspeção real ou, se bloqueado, evidência clara da limitação).
- [ ] **A3. Aparência:** coluna vertical compacta, progresso geral, fases, `X/Y`, checklist hierárquico com estados concluído/pendente e ativo quando explicitamente marcado; **sem Kanban**.
- [ ] **A4. Matemática:** em fixture com 9 de 15 tarefas concluídas, exibe 60%; fases refletem contagens e não há dupla contagem de checkbox pai.
- [ ] **A5. Parsing:** ao menos dois níveis de hierarquia quando o Markdown permitir, ordem estável, código cercado ignorado, estado vazio correto.
- [ ] **A6. Atualização:** alterar `- [ ]` para `- [x]` na fixture provoca atualização e muda contagem/percentual **sem reiniciar o plugin**, demonstrado por teste ou pelo ORCA.
- [ ] **A7. Persistência:** fechar/abrir painel ou nova sessão do agente não altera o estado exibido se o arquivo permanece igual.
- [ ] **A8. Projeto correto:** ao alternar entre dois workspaces de teste, o painel não mistura tarefas de projetos distintos. Uma fonte por projeto, visível/documentada.
- [ ] **A9. Somente leitura:** nenhum arquivo de planejamento real é modificado automaticamente pelo plugin.
- [ ] **A10. Segurança/compilação:** `npm run typecheck`, `npm test` e `orca plugin validate . --json` aprovados, ou justificativa objetiva para um comando indisponível na versão instalada; sem erros de frame relevantes.
- [ ] **A11. Evidência visual:** screenshot do plugin no ORCA comparada ao mockup/captura do usuário, **se o ambiente ORCA puder ser acessado**; caso contrário registrar a validação visual como pendente, sem afirmar equivalência pixel a pixel.
- [ ] **A12. Entrega:** README com instruções concisas de desenvolvimento/ativação, exemplos de plano Markdown e resumo de testes; **commit e push na branch do fork quando remoto autenticado estiver disponível**, registrando hash e branch; sem publicação no marketplace, PR automático ou merge em `main`.

### Fixtures mínimas

Criar fixtures de teste dentro do **repositório do plugin**, com:

- Plano de 4 fases e 15 tarefas, 9 concluídas → **60%**;
- Fase vazia → estado “sem tarefas”, não 100%; 
- Checklist aninhada + code fence falso → contagem exata;
- Dois projetos/workspaces diferentes → nenhum vazamento de tarefas;
- Alteração de arquivo em tempo de execução → progresso atualizado.

**Nota sobre A2/A11:** se a CLI ou ORCA exigir aprovação interativa, **não falsifique**. Os outros testes podem estar verdes, mas o resultado será **“implementado, validação no ORCA pendente por aprovação”**, e não “concluído e comprovado” até a verificação ocorrer. Solicite apenas essa aprovação e interrompa com reporte claro se não for possível continuar.

## 10. Comandos de validação: derivar da skill e da base, não decorar

Execute conforme a versão **real** da CLI. O README atual da base indica:

```bash
npm ci
npm run typecheck
npm test
orca plugin dev load . --json
```

A skill `orca-plugin-authoring` documenta ainda (substituir `orca` pelo binário resolvido):

```bash
orca plugin test . --json
orca plugin check . --json
orca plugin validate . --json
orca plugin inspect . --json
# Para iteração visual, quando viável:
orca plugin dev watch . --check --shot ./.orca/shots --json
```

**Restrições:** não executar fluxo de criação `plugin create` por cima do fork. `dev load` pode precisar de consentimento; **nunca usar `--approve` sem autorização para as capacidades exatamente exibidas**. Não invente um screenshot se o host estiver indisponível. Se comando divergir, leia referência atual da CLI na skill e adapte a execução.

## 11. Gestão de custo, permissões e segurança

- O teto de **40.000 tokens do Goal** é uma **sugestão**. Na configuração compatível do Codex, a chave documentada é:

  ```toml
  [goals]
  max_goal_token_budget = 40000
  ```

  **Não edite automaticamente `~/.codex/config.toml` nem outra configuração global.** Verifique suporte local, respeite preferências existentes e, quando apropriado, explique ao usuário como aplicar o teto. O orçamento do Goal pode não incluir gastos do subprocesso OpenCode.
- Não permitir `Extra Usage` automático. Não ativar serviços pagos ou mudanças de privacidade. Não usar tokens próprios do usuário para testes de stress desnecessários.
- Não solicitar credenciais já válidas; nunca imprimir variáveis de ambiente sensíveis, arquivos `.env`, API keys ou payloads privados em logs e relatórios.
- Instalação da skill e dependências: executar somente o necessário, com origem oficial, e não alterar configurações globais sem necessidade/consentimento.
- O usuário autoriza **trabalho local e fork/cópia derivada, commit e push automáticos na branch de trabalho deste repositório isolado**. Isso não autoriza marketplace, PR/merge, push em `main`, operações em VPS ou alterações em outros repositórios.
- Se houver múltiplos caminhos igualmente bons, escolher o mais simples e seguro sem perguntar ao usuário. Reservar pedidos humanos a **autorizações reais**, não opções de cor, nomes de função ou escolhas rotineiras de código.

## 12. Padrão de comunicação e checkpoints

**Durante a execução:** só enviar atualização curta quando um marco real for concluído, houver bloqueio ou gasto relevante. Evitar narrar toda chamada de ferramenta.

**Checkpoint objetivo (máx. 50 linhas):**

```text
Meta: Project Progress ORCA — MVP
Estado: em desenvolvimento | concluído com evidências | bloqueado
Progresso: A1–A12 (IDs comprovados)
Alterações: <arquivos principais>
Evidências: <comando/resultado/captura>
Tentativas por falha: <causa + 1/2 ou 2/2>
Delegações Go: <modelo/escopo/resultado> ou nenhuma
Próximo passo mínimo: <ação concreta>
Bloqueio, se houver: <única ação necessária>
```

**Relatório final obrigatório**, com quatro seções curtas:

1. **Entregue:** features efetivamente verificadas, caminho/branch e principais arquivos.
2. **Provas:** comandos, saídas resumidas, screenshot quando existir, checklist A1–A12 com status.
3. **Limitações reais:** não verificadas, bloqueios e itens conscientemente fora do MVP.
4. **Como abrir:** instruções mínimas no ORCA, sem publicar ou instalar globalmente.

## 13. Política de saída do Goal (obrigatória)

- **Concluir** somente depois de verificar os critérios de aceitação possíveis no ambiente e sem bloqueios críticos; não afirmar sucesso integral se A2/A11 não puderam ser comprovados.
- **Interromper por bloqueio** apenas se depender de credencial, permissão sensível, cobrança ou ambiente realmente indisponível. **Não bloquear por mudança de fase nem por push normal na branch já autenticada.** Preservar branch e checklist, informar **uma ação humana clara**.
- **Interromper por ausência de progresso** ao alcançar limite R1/R2. Relatar causa, evidência, tentativas e única próxima alternativa defensável. **Não iniciar outro Goal sozinho.**
- **Interromper por orçamento** sem aumentar franquias ou pedir cobranças extras. Orçamento atingido **não equivale a sucesso**.
- Após sucesso, **não fazer mais uma rodada opcional de melhoria**.

## 14. Fontes e hierarquia de autoridade

Priorize, nesta ordem:

1. Código, `README.md`, `package.json`, `orca-plugin.json` e testes da **versão local do fork**;
2. Skill oficial **versionada ao ORCA instalado**, pelo comando `orca skills get orca-plugin-authoring` e referências relevantes;
3. Documentação oficial ORCA: https://github.com/stablyai/orca/blob/main/skill-guides/orca-plugin-authoring.md ;
4. Documentação OpenAI Goal: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex ;
5. Repositório upstream: https://github.com/jonstuebe/orca-todos ;
6. Documentação OpenCode Go: https://opencode.ai/docs/console/go ;
7. OpenCode modelos e CLI: https://opencode.ai/docs/models e https://opencode.ai/docs/cli/commands .

Fatos mutáveis (versões, catálogo, promoções, IDs, quotas, flags) **precisam ser confirmados no ambiente real**. Esta especificação expressa a intenção do usuário, não substitui a realidade das APIs e permissões.

## 15. Comando curto para iniciar o Codex Goal

**Abra uma nova conversa do Codex na raiz do repositório que será usado pelo plugin.** Confirme que `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md` está na raiz. Então cole **uma única mensagem**:

```text
/goal Entregue e valide o MVP do plugin Project Progress para ORCA, seguindo integralmente o arquivo PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md na raiz deste repositório. Use o código jonstuebe/orca-todos como base/fork, a skill oficial orca-plugin-authoring e o menor patch possível. Resultado verificável: checklist macro vertical na lateral direita, fases expansíveis, progresso global e por fase, fonte Markdown única por projeto e atualização automática. Execute com autonomia, sem pedir aprovação por fase; utilize OpenCode Go ou Gemini autorizado somente quando a economia compensar e os limites disponíveis permitirem. Faça commit e push automaticamente na branch de trabalho do fork após verificação de segurança. Cumpra rigorosamente as regras anti-loop R1–R15 e os critérios A1–A12; jamais ative cobranças extras ou publique sem autorização. Depois de cada tentativa, escolha somente a menor ação com progresso comprovável. Encerre imediatamente quando os critérios estiverem comprovados; se houver permissão bloqueante, ausência de progresso ou teto de orçamento, pare e entregue evidências, pendências e uma única ação humana necessária.
```

> **Importante:** `/goal` é um comando do Codex em versões compatíveis, não necessariamente do campo de mensagens de outros agentes. A documentação oficial indica suporte a partir do Codex CLI `0.128.0`. Verifique `codex --version`. Se a instalação não reconhecer `/goal`, não invente sintaxe: consulte a documentação da versão ou use uma conversa normal até o usuário atualizar o Codex.

---

**Ordem final ao Codex:** não transforme este documento em novo planejamento interminável. Inspecione o essencial, construa o menor MVP, prove o que funciona, pare quando terminar. **Autonomia útil > número de agentes. Evidência > narrativa. Simplicidade > recursos extras.**
