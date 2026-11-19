# Handoff — Project Progress para ORCA

Handoff **único** do projeto, na raiz. Os caminhos citados são relativos à raiz do repositório.

Última atualização: **2026-11-19**. **Estado atual e prompt de retomada na última seção.** **Projeto encerrado.** MVP implementado, validado no ORCA (A1–A12) e entregue; skill `project-plan` criada e testada ponta a ponta; repositório final publicado no GitHub. Neste MVP, o Codex Goal foi o coordenador.

## Como retomar
1. Abra a raiz do projeto como workspace. No Antigravity (uso manual), comece por `GEMINI.md`; no Codex ou Claude Code, comece por `AGENTS.md`, `CLAUDE.md` e `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`.
2. Leia o resumo acima e a seção mais recente no fim deste arquivo. Abra apenas os arquivos necessários para a tarefa.

## 1. 🎯 Objetivo geral
Entregar um **plugin nativo do ORCA**, derivado de `https://github.com/jonstuebe/orca-todos`, com **painel alternável na lateral direita**, visual de checklist vertical, fases/subtarefas, contagens e barras de progresso a partir de um plano Markdown canônico por workspace. O painel deve atualizar automaticamente ao modificar o plano e manter progresso persistente entre sessões; **sem Kanban, banco de dados, servidor ou serviço pago**. O prazo não foi definido; priorizar o menor MVP validável e encerrar ao comprovar A1–A12.

Fases: **1. Inspecionar a base/skill (pendente)** → **2. Adaptar parser + checklist TSX (pendente)** → **3. Integrar watcher/workspace (pendente)** → **4. Testar e validar no ORCA (pendente)** → **5. Entregar evidências (pendente)**. Marcar ✅ somente após verificação.

## 2. 📐 Decisões aprovadas (não reabrir)
Cada decisão com data e quem aprovou. Decisão superada: riscar ou marcar "(histórico, substituída em DD/MM)".
- **19/11/2026 — aprovado pelo responsável:** painel lateral direito alternável com explorador, checklist vertical com fases expansíveis, tarefas/subtarefas e percentual global; **sem Kanban**.
- **19/11/2026 — aprovado:** reutilizar `jonstuebe/orca-todos` (fork/cópia derivada segura), preservar licença e adaptar o mínimo possível.
- **19/11/2026 — aprovado:** **Claude Code ou Codex** podem liderar outros projetos; neste plugin a liderança é exclusivamente do **Codex Goal**; escopo e aceitação no `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`; skill oficial **`orca-plugin-authoring`** obrigatória.
- **19/11/2026 — aprovado:** arquivo Markdown canônico como fonte da verdade, plugin somente leitura, atualização automática e persistência entre sessões.
- **19/11/2026 — aprovado:** OpenCode Go e Gemini/Antigravity são **executores opcionais subordinados**, escolhidos pelo líder conforme franquias disponíveis, permissões e economia; GLM-5.3-Flash para UI, DeepSeek V4.1 Flash para parsing/testes se permitido, GLM-5.3 para integração difícil, Kimi K2.7 Code apenas quando justificado; confirmar IDs/limites. **Não automatizar assinatura pessoal do Antigravity por integração de terceiros não autorizada.**
- **19/11/2026 — aprovado:** regras anti-loop R1–R15, teto conservador sugerido do Goal, **passagem entre fases sem solicitar aprovação**, e proibição de cobranças extras ou automação não autorizada do Antigravity; **commit e push automáticos liberados somente na branch do fork**. Sem publicação no marketplace, merge em `main`, force-push ou instalação global não autorizada.

## 3. ✅ Progresso concluído
- **19/11 — preparação documental:** versões iniciais para a raiz de `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` e `HANDOFF.md`, alinhadas ao Prompt Mestre. **Nenhum código do plugin foi implementado nem commit confirmado.**

## 4. ⏳ Pendências vivas
- [ ] Criar/abrir o novo repositório no ORCA e colocar os documentos de referência na raiz — responsável: usuário. Se o Git remoto já estiver acessível, o Codex pode inicializar/forkar a base sem pedir novo aceite.
- [ ] Verificar estado real do Git e origem; fazer fork ou cópia derivada segura de `jonstuebe/orca-todos` sem sobrescrever os documentos do novo repositório — responsável: Codex Goal.
- [ ] Ler a skill `orca-plugin-authoring` da instalação, conferir CLI, scripts, modelos OpenCode Go, segurança e permissões — responsável: Codex Goal.
- [ ] Adaptar plugin ao checklist vertical e fonte Markdown, criar fixtures e testar A1–A12 — responsável: Codex Goal; delegação isolada a OpenCode Go ou Gemini autorizado apenas se compensar.
- [ ] Verificar painel real no ORCA e entregar evidências; se depender de autorização humana, registrar bloqueio objetivo — responsável: Codex Goal.

## 5. 🔍 Auditorias cruzadas
| Data | O que foi auditado | Auditor e modelo | Veredito | Pontos aceitos / recusados |
|---|---|---|---|---|
| — | Ainda não realizada | — | Não se aplica | Nenhuma auditoria solicitada/confirmada |

## 6. 🛑 Regras de ouro e restrições
- **Escopo:** checklist macro vertical na sidebar direita, sem Kanban, tickets, banco de dados ou dashboard web externo.
- **Anti-loop:** duas tentativas por causa com mudança material, parar após duas iterações sem progresso verificável; no máximo uma revisão por delegação e uma delegação por vez; sem revisão de revisão (ver R1–R15 no Prompt Mestre).
- **Verificação:** não marcar tarefa concluída sem prova; não afirmar que a instalação no ORCA funcionou sem teste real; 9/15 deve dar 60%.
- **Segurança:** sem Extra Usage, gasto, alteração global ou mudança de privacidade; **push automático permitido na branch do fork, não em `main`**. Sem publicação marketplace nem uso automatizado não autorizado da assinatura pessoal do Antigravity.
- **Terminar no MVP:** atender aos critérios A1–A12 e encerrar o Goal, ou registrar um bloqueio real sem entrar em ciclos.

---

## Registro de sessões (a mais recente no fim; marcar a vigente com "PREVALECE")

### Sessão de 19/11/2026 — Preparação documental (histórico)

**Feito e conferido**
- Lidos os quatro modelos Markdown fornecidos; conteúdos adaptados ao projeto e à divisão **Codex Goal (líder) / OpenCode Go ou Gemini autorizado (delegados)**. Confirmada apenas a documentação, **sem execução ou validação do plugin**.

**Decisões novas**
- Mantidas as decisões da seção 2. Ajustado o fluxo: **Claude Code ou Codex podem liderar projetos, mas este usa somente Codex Goal; fases e push na branch ocorrem sem pedidos de aprovação**, respeitando limites de segurança.

**Pendências e próximo passo**
- Abrir o novo repositório no ORCA com estes documentos e o Prompt Mestre; iniciar o Codex Goal; inspecionar e reutilizar o fork antes de desenvolver, seguindo automaticamente por todas as fases e realizando commit/push na branch quando houver remoto autenticado.

**Branch e último commit:** **a verificar no novo repositório** (sugestão de branch local: `feat/project-progress-mvp`); **nenhum hash conferido nesta preparação**.

**Prompt de retomada (serve para Codex e Claude Code)**
```
Leia AGENTS.md, CLAUDE.md, PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md e a última seção do HANDOFF.md.
Objetivo desta sessão: entregar o MVP Project Progress no ORCA sob Codex Goal, cumprindo critérios A1–A12 e regras anti-loop R1–R15.
Comece por: verificar o Git/workspace e a base jonstuebe/orca-todos; carregar a skill oficial orca-plugin-authoring e propor a menor adaptação segura antes de editar código.
```

### Sessão de 19/11/2026 — MVP implementado, Goal bloqueado por consentimento (histórico)

- **Goal bloqueado.** O consentimento permaneceu pendente em três turnos de verificação. Código, README e fixtures estão no fork `Tonimusic9/orca-todos`, branch `feat/project-progress-mvp`. O push e o SHA remoto `663ac54bdd4fddd7029b863a773f117ff244b5e7` foram conferidos. Base MIT `jonstuebe/orca-todos` importada por histórico a partir de `fb2628b`. Documentos de coordenação permanecem no workspace local.
- **A1, A3–A10 e A12 verificados** por histórico, revisão de escopo, TypeScript e testes. No ORCA 1.4.262, `npm run typecheck`, `npm test` (10 testes) e `orca plugin validate . --json` passaram. `npm test` também executa `plugin check` (três cenários, zero problemas ou avisos). `plugin inspect` passou sobre uma cópia limpa do commit, pois a inspeção direta inclui links de `node_modules/.bin`.
- **Evidências principais:** fixture 9/15 = 60%, save atômico = 10/15 = 67%, fase vazia em 0%, dois workspaces com o mesmo nome isolados pelo ID, seleção canônica retomada após reiniciar o worker. O código usa uma fonte por vez, mantém preferências no armazenamento próprio e abre arquivos Markdown em modo de leitura.
- **A2 e A11 pendentes.** `orca plugin dev load . --json` (1ª tentativa) devolveu `approval_required`. O ORCA pede execução de worker Node com acesso da conta do usuário, `workspace:read` e `storage:own`. Consentimento solicitado. A prévia em cenário (1ª tentativa) requer janela oculta ou minimizada. Nenhuma captura foi gerada.
- **Próximo passo após consentimento explícito:** usar a aprovação emitida pelo ORCA para a pasta atual, abrir `local.project-progress` com `orca plugin open local.project-progress --panel progress --json`, verificar alternância com o explorador e salvar uma captura real em `.orca/shots/`, de preferência com fixture. Comparar com o exemplo da seção 1 do Prompt Mestre e registrar A2/A11 antes de encerrar.
- **Delegação:** nenhuma. OpenCode Go instalado, franquia e cobrança não verificadas. A execução direta bastou.

**Prompt de retomada**

```
Leia AGENTS.md, CLAUDE.md e a última seção de HANDOFF.md. Confira a branch e a decisão sobre as permissões do ORCA. Conclua a validação real A2/A11 com fixture, sem editar planos reais. Consulte a skill orca-plugin-authoring da instalação e a seção 9 do Prompt Mestre. Se o consentimento continuar pendente, preserve o estado e registre a limitação.
```

### Sessão de 19/11/2026, 02:32 BRT — Validação concluída (PREVALECE)

- **Goal concluído, A1–A12 verificados.** Após consentimento explícito, o ORCA 1.4.262 carregou `local.project-progress` e abriu o painel na lateral direita. A2 confirmado ao clicar em **Explorador**, constatar a mudança de conteúdo e reabrir o painel pela CLI.
- **A11:** captura real em `.orca/shots/project-progress.png`. A comparação com a seção 1 do Prompt Mestre confirmou coluna única, barra global, quatro fases com contadores e checklist hierárquico em 253 px, tema escuro. A segunda captura, `.orca/shots/project-progress-atualizado.png`, confirma 67% após alteração na fixture de 60%, sem reabrir o painel nem reiniciar o plugin. Ambas tiveram zero erros e zero pedidos pendentes.
- A fixture foi testada na worktree local isolada `project-progress-validacao`, branch `test/project-progress-validacao`. O Markdown foi restaurado ao fim. O ORCA voltou à worktree original com o painel aberto e exibiu o estado vazio, sem tarefas da fixture.
- Código conferido sem mudanças desde `663ac54bdd4fddd7029b863a773f117ff244b5e7`. O mesmo SHA foi conferido em `origin/feat/project-progress-mvp`. As capturas e este handoff ficaram locais.

### Sessão de 19/11/2026 — Encerramento e skill `project-plan` (PREVALECE)

- **Projeto encerrado.** Goal concluído, A1–A12 verificados, código sem mudanças desde `663ac54bdd4fddd7029b863a773f117ff244b5e7`.
- **Skill `project-plan` criada** para gerar `PROJECT_PLAN.md` na raiz da worktree com fases e checkboxes no formato exato do parser. Instalada em `~/.codex/skills/project-plan` com links em Claude Code, OpenCode e `~/.agents`, detectada pelo ORCA nos três providers. A descrição dispara sozinha quando o usuário pede plano, checklist ou progresso de projeto.
- **Validação da skill:** plano de exemplo gerado no formato da skill e lido pelo parser real do plugin — 2 fases, 6 folhas, 2 concluídas (33%), `@doing` reconhecido como andamento.
- **Teste ponta a ponta:** em worktree isolada `project-plan-teste`, o worker real (`progress.get`) leu o plano gerado pela skill (3 fases, 4/11 = 36%). Ao marcar uma tarefa como `[x]` e salvar, o mesmo worker passou a 5/11 (45%) na mesma worktree, sem reiniciar o plugin. O `PROJECT_PLAN.md` real da worktree principal (12/12) não foi tocado. A worktree e a branch de teste foram removidas ao fim.
- **Repositório final publicado no GitHub** com toda a documentação, código e fixtures; branch de trabalho `feat/project-progress-mvp`, sem merge em `main`, sem PR automático e sem publicação no marketplace.

**Estado final:** concluído. Sem pendências técnicas. Próxima ação: nenhuma — aguardar apenas eventual pedido do responsável.
