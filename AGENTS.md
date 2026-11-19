# AGENTS.md

Instruções técnicas e de contexto para qualquer agente de IA (Codex, Claude Code, OpenCode, Gemini/Antigravity, Cursor etc.) trabalhando neste projeto. Para regras de comportamento e forma de agir, ver `CLAUDE.md`, que vale para todos os agentes. **Claude Code e Codex podem liderar projetos; neste MVP, por decisão explícita, o Codex Goal é o único coordenador.** OpenCode e Gemini/Antigravity são executores opcionais do agente líder, conforme franquias disponíveis, permissões e vantagem real. Nenhuma liderança paralela neste Goal.

## Visão geral do projeto

**Project Progress para ORCA** é um plugin nativo, derivado de [`jonstuebe/orca-todos`](https://github.com/jonstuebe/orca-todos), para acompanhar visualmente o plano completo do projeto no painel lateral direito do ORCA. Exibe barra de progresso, fases expansíveis e checklist vertical a partir de um plano Markdown do workspace ativo, com atualização automática ao salvar o arquivo. O objetivo é entregar **um MVP mínimo, seguro e validado**, sem Kanban, servidor externo, banco de dados ou sistema complexo de agentes; não há prazo fixo aprovado.

O estado do trabalho, as decisões, os caminhos dos documentos e o próximo passo estão em `HANDOFF.md`, na raiz. **Ler antes de agir.** A especificação completa e os critérios A1–A12 estão em `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`. `GEMINI.md` é a entrada curta para uso manual do Gemini/Antigravity.

## Regras básicas (para agentes que não leem o CLAUDE.md global)

- **Idioma:** mensagens ao usuário, comentários, docstrings e commits em português do Brasil; nomes de variáveis, funções e classes em inglês.
- **Segurança:** nunca hardcodar chaves, senhas ou tokens (usar `.env`); nunca commitar `.env` real, só `.env.example`; conferir o `.gitignore` antes de `git add`; nunca push direto em `main`; nunca deletar arquivo sem confirmação explícita do responsável pelo projeto.
- **Simplicidade:** o mínimo que resolve o pedido; mudanças cirúrgicas; seguir o estilo existente; não refatorar o que não foi pedido.

## Transferência entre Antigravity, Codex e Claude Code

Quando o responsável pedir para **salvar as documentações** antes de trocar de agente, deixe o trabalho legível no repositório compartilhado, não apenas no histórico do chat, na memória do aplicativo ou no Obsidian:

1. Salve os documentos e fontes editáveis da tarefa nas pastas existentes. Atualize o arquivo de origem antes de regenerar arquivos gerados (PNG, PDF, build). Registre o estado como **aprovado, rascunho, arquivado ou publicado**. Preserve versões anteriores e trabalho não relacionado.
2. Atualize o `HANDOFF.md` com decisões novas, o que foi feito e conferido, caminhos dos arquivos, IDs/links e horário de ações externas, pendências, próximo passo, branch de trabalho e um prompt de retomada **neutro para Codex e Claude Code**. Registre também o estado do Goal, critérios A1–A12 comprovados e tentativas que falharam; dê prioridade ao trecho mais recente. Não declare instalação, publicação, aprovação ou validação sem conferência.
3. Regras permanentes entram em `AGENTS.md`; instruções específicas do Antigravity ficam em `GEMINI.md`. Notas do Obsidian podem espelhar a sessão, mas as decisões necessárias para retomar devem estar no repositório. Para arquivos externos que não possam ser copiados, registre caminho, estado e limite de acesso, sem credenciais ou dados pessoais.
4. Confira `git status` e o diff; inclua **todos os arquivos da tarefa** necessários para reprodução, sem caches, segredos ou alterações alheias. **Commit e push automáticos estão autorizados na branch de trabalho do fork**, sem novo pedido a cada fase; nunca faça push em `main`, force-push, publicação no marketplace nem PR/merge automático. Antes do push, confirme remoto, branch, arquivos e ausência de segredos. Registre hash e remoto somente se verificados. Se não houver remote autenticado, prossiga localmente e registre o impedimento sem entrar em loop.

O agente que retoma começa por `AGENTS.md`, `CLAUDE.md` e `HANDOFF.md`, depois lê as fontes da tarefa. Não precisa reler todo o acervo em cada sessão.

## Stack

- **Base técnica prevista:** TypeScript, componentes TSX nativos do ORCA, Node.js/npm, Markdown e APIs de plugin do ORCA; confirmar versões e scripts reais após examinar o fork.
- **Banco de dados/backend/servidor:** não há; proibidos no MVP. A fonte de verdade é um plano Markdown canônico por workspace/worktree selecionado.
- **Interface visual:** painel lateral direito, checklist vertical somente leitura, fases/subtarefas, percentual geral e por fase; sem Kanban.
- **Skill oficial obrigatória:** `orca-plugin-authoring`; usar a skill já disponível e consultar referências da instalação atual antes de modificar o plugin.
- **Liderança:** tanto Claude Code quanto Codex podem coordenar projetos. **Exceção específica deste MVP:** liderança exclusiva do Codex Goal; Claude Code não inicia outra coordenação em paralelo.
- **Execução delegada:** OpenCode Go e Gemini/Antigravity são **opções subordinadas** ao agente principal, escolhidas conforme franquias restantes, capacidade, custo de supervisão e meios de acesso permitidos. **Nunca** utilizar acesso pessoal ao Antigravity por wrappers de terceiros não autorizados; se não houver integração oficial habilitada, deixar Gemini de fora e prosseguir com OpenCode/Codex.
- **Modelos preferenciais de execução delegada:** DeepSeek V4.1 Flash (parsing, testes e tarefas simples, se privacidade permitir); GLM-5.3-Flash (UI e TSX); GLM-5.3 (integração/raciocínio difícil); Kimi K2.7 Code (alternativa para código difícil). Verificar IDs e disponibilidade reais antes de usar.
- **Orçamento:** teto inicial sugerido para Goal de 40.000 tokens, se suportado e autorizado; não é previsão nem inclui necessariamente os tokens externos do OpenCode Go. Extra Usage proibido sem aprovação.

## Comandos

```bash
# Descoberta segura: conferir comandos/IDs locais antes de executar
orca skills get orca-plugin-authoring
opencode --version
opencode models

# Delegação somente se houver ganho real, assinatura verificada e ID de modelo confirmado
# opencode run --model <provider/model-confirmado> "<tarefa isolada, com testes>"

# Validar scripts e CLI no fork e na skill antes de rodar
npm run typecheck
npm test
# orca plugin test . --json
# orca plugin check . --json
# orca plugin validate . --json
# orca plugin dev load . --json  # apenas se permissões estiverem autorizadas
```

Não executar comandos perigosos, `--dangerously-skip-permissions` ou instalações globais automaticamente. O `9router` existente pode ser inspecionado com segurança; **não é dependência** nem deve ser instalado ou reconfigurado neste MVP.

## Estrutura de diretórios

- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`: regras compartilhadas e entradas por agente.
- `HANDOFF.md`: handoff único (decisões, progresso, regras de ouro, prompt de retomada).
- `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`: escopo e aceitação A1–A12; **referência obrigatória**.
- `src/panel.tsx`: painel lateral, previsto na base `orca-todos` (confirmar após importar fork).
- `src/todo-file.ts`: leitura/parser de Markdown, previsto na base (confirmar após importar fork).
- `src/worker.ts`: seleção de workspace e monitoramento do arquivo, previsto na base (confirmar após importar fork).
- `orca-plugin.json`, `README.md`, `LICENSE`: manifesto, instruções e licença a preservar da base (confirmar após importar fork).
- `docs/GOAL_CHECKPOINT.md`: checkpoint curto **se necessário**, com marcos, testes, bloqueios e próxima ação; sem logs extensos.

## Convenções

- **Código:** seguir a nomenclatura, os arquivos e os padrões TypeScript/TSX já adotados no fork. Nomes de variáveis, funções e classes em inglês; documentação, relatórios e commits em português brasileiro.
- **Interface:** usar componentes nativos do ORCA, respeitar tema claro/escuro, acessibilidade e largura estreita da barra lateral; não introduzir CSS/HTML externo sem necessidade comprovada.
- **Markdown:** preservar cabeçalhos e checkboxes existentes; tratar itens-pai sem contagem dupla e não inferir que algo está concluído sem `- [x]` (ou marcador equivalente explicitamente validado).

## Testes e validação

- **Peça visual:** após carregar o plugin no ORCA, conferir a captura real do painel lateral e comparar com a referência do Prompt Mestre; não afirmar validação visual sem acesso real ao ORCA.
- **Script ou automação:** testar primeiro a falha específica; executar a suíte completa **uma vez na validação final**, repetindo apenas se alterações posteriores invalidarem a prova.
- **Informação de terceiros:** toda afirmação factual externa relevante deve ter fonte; se não houver evidência, indicar "não verificado".
- **Critérios do MVP:** seguir A1–A12 em `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`; verificar parser, 9/15 = 60%, fases vazias, subtarefas, watcher, troca de workspace, somente leitura e TSX.
- **CLI:** confirmar comandos atuais na skill; preferir `npm run typecheck`, `npm test` e `orca plugin validate . --json` onde estiverem disponíveis.
- **Concluído tecnicamente:** somente com provas para os critérios aplicáveis; quando faltar autorização para inspeção real, marcar "implementado, validação pendente", nunca aprovado. O aceite final do usuário continua separado da conclusão técnica do Goal.
- **Anti-loop obrigatório:** máximo 2 tentativas por causa, no máximo 1 correção por delegação, parar após 2 iterações sem progresso verificável e **encerrar o Goal assim que o MVP atender aos critérios**. **As fases técnicas são automáticas:** não pedir `ok` entre planejamento, codificação, testes e entrega.

## Limites e áreas restritas

- Não alterar sem aprovação: decisões do `HANDOFF.md` marcadas aprovadas, o Prompt Mestre, configurações globais, credenciais e **repositórios de trabalho que não sejam o fork isolado**.
- Arquivos gerados não se editam à mão: editar a fonte e gerar novamente; não modificar `node_modules`, builds, caches ou snapshots produzidos automaticamente.
- Chaves (APIs, serviços): só no `.env` local não versionado ou mecanismo seguro preexistente; nunca no chat, em documentos ou no git.
- Não instalar globalmente, publicar em marketplace, alterar VPS/9router, mudar privacidade/região do OpenCode Go ou ativar Extra Usage sem consentimento explícito.
- Não declarar que fork, branch, instalação ou testes já existem sem verificação. Planejamento real do usuário é **somente leitura** para este plugin.

## Fluxo de commits e PR

- Mensagem de commit em português, curta, explicando a mudança; manter `Co-Authored-By` apenas quando apropriado e factual.
- Branch local sugerida: `feat/project-progress-mvp`; criar/verificar somente quando existir repositório Git e condição segura para isso. `origin` e URL do fork **a confirmar**, não presumir.
- **Autorização permanente para este MVP:** fazer `git commit` e `git push` automaticamente **na branch de trabalho do fork**, após conferir `git status`, diff, origem/remoto e ausência de segredos. Nunca push direto em `main`, force-push ou merge automático. Não abrir PR nem publicar no marketplace sem pedido específico.
- Antes de qualquer `git add`, conferir `git status`, diff e `.gitignore`; incluir só alterações da tarefa, sem caches, segredos ou alterações de terceiros.

## Divisão Claude Code / Codex × OpenCode Go / Gemini e economia de limite

**Regra geral:** tanto **Claude Code** quanto **Codex** podem assumir a liderança de projetos. O agente líder planeja, decide, delega e valida. **Regra específica deste projeto:** o **Codex Goal** é o coordenador único do MVP; Claude Code não assume a liderança enquanto esse Goal estiver ativo. O líder pode delegar a OpenCode Go ou Gemini/Antigravity conforme limite disponível e economia provável, sem passar a eles a responsabilidade final.

### Ordem de delegação
1. **Codex Goal direto:** decisões de arquitetura, mudanças pequenas, integração final, aceite A1–A12 e segurança. Não delegar se preparar o executor custar mais que a tarefa.
2. **OpenCode Go, preferencial na execução delegada:** no máximo **2 delegações substantivas** no MVP e **1 executor por vez**. Usar DeepSeek V4.1 Flash para parsing/testes (se permitido), GLM-5.3-Flash para TSX, GLM-5.3 para integração difícil e Kimi K2.7 Code apenas para dificuldade de programação justificada. Confirmar **IDs e limites reais**, sem supor cotas separadas.
3. **Gemini/Antigravity, alternativa condicionada:** o líder pode escolher Gemini para uma tarefa isolada se houver **interface oficial/autorizada**, franquia confirmada e economia demonstrável. Não usar assinatura pessoal do Antigravity como API de ferramenta terceira nem contornar controles de uso. Sem rota permitida, ignorar Gemini e continuar sem bloqueio.
4. **Claude Code:** apto a liderar outros projetos; neste MVP só atua se convocado pontualmente pelo Codex Goal, sem abrir outro fluxo.
5. **9router:** verificar somente se já está funcional; não construir pipeline ou reconfigurar ambiente por causa deste plugin.

A delegação recebe arquivos permitidos, tarefa delimitada, critérios e testes; devolve diff, resultado e bloqueios de forma curta. O Codex confere o trabalho antes de marcar a tarefa como concluída. Falhar duas vezes não autoriza automaticamente modelo mais caro: diagnosticar a causa primeiro.

| Fica com o líder deste MVP: Codex Goal | Executor OpenCode Go ou Gemini autorizado (se houver vantagem concreta) |
|---|---|
| Escopo, decisões e encerramento A1–A12 | Parser de fases e testes isolados |
| Verificação da skill/API e integração do fork | Componente TSX delimitado e seus testes |
| Comparação visual e comprovação no ORCA | Correção localizada após diagnóstico |
| Segurança, permissões e aprovação externa | Nenhuma operação de cobrança, publicação ou acesso global |

### Protocolo de alerta (vale para todos os agentes)
O agente sinaliza **"⚠️ Limite:"** e para **somente** quando houver necessidade real de senha, 2FA/CAPTCHA, permissão perigosa do ORCA, alteração global, privacidade, cobrança, conflito de dados, operação destrutiva ou publicação. **Fork e commit/push na branch de trabalho já estão autorizados** desde que o Git esteja corretamente configurado. Decisões técnicas rotineiras e passagem entre fases **não** exigem novo "ok".

Antes de cada nova tentativa: qual critério falha, qual evidência existe, qual a menor correção possível e o que mudou em relação à tentativa anterior? **Duas iterações sem progresso ⇒ interromper a abordagem e registrar o bloqueio.**

### Como gastar menos limite no Codex Goal
- Abrir com `HANDOFF.md` e o Prompt Mestre; uma meta por thread.
- Fazer inspeção inicial e plano curto **uma vez**; consultar apenas arquivos relevantes nos próximos passos.
- Executar testes focalizados antes de suíte completa, evitar revisores e delegações em cadeia.
- Manter checkpoint curto e não repetir logs; encerrar no primeiro momento em que A1–A12 estiverem comprovados.
- Usar orçamento inicial conservador; **não aumentar teto automaticamente**, e não confundir limite do Goal com franquia do OpenCode Go.

## Auditoria cruzada (Claude Code ↔ Codex)

Auditoria entre agentes **não é etapa obrigatória** deste MVP simples. Só solicitar revisão independente caso haja risco concreto de segurança, mudança difícil de desfazer ou falha material não resolvida, respeitando a autonomia e o orçamento do Goal. Não iniciar revisão de revisão ou `claudex-loop` sem solicitação explícita.

**Quando auditar:** risco real não coberto pelos testes, migração/exclusão, mudança de cobrança/permissão ou impasse técnico documentado. Tarefas rotineiras e checklist visual não exigem auditoria cruzada.

**Qual skill usar (se já disponível e autorizada):**

| Skill | O que faz | Quando |
|---|---|---|
| `claudex-route` | Segunda opinião breve | Somente se houver dúvida material |
| `codex-review` | Revisão focalizada | Plano de mudança arriscada, não o MVP normal |
| `/claudex-loop` | Planejamento/revisão completos | **Não usar** neste MVP sem pedido expresso |

**Modelo do auditor:** verificar disponibilidade real antes de escolher; não fixar modelos ou versões presumidas.

**Regras:**
- Auditor trabalha **só em leitura**; não edita o projeto.
- No máximo **uma rodada por risco** no MVP; duas falhas sem progresso acionam parada, não novo auditor.
- Erro, resposta vazia ou timeout não significam aprovação; registrar como **não verificado**.
- Registrar no `HANDOFF.md` apenas a auditoria efetivamente feita, evidências e pendências.
- Auditoria não substitui aprovação do responsável para ações externas.

## Segurança

- Nunca commitar chaves, tokens ou credenciais.
- Nunca enviar mensagem real (WhatsApp, e-mail, post) sem aprovação explícita; envio automático de WhatsApp é proibido.
- Pedir confirmação antes de instalação global, ferramentas fora do ambiente isolado, operação externa **não relacionada ao push na branch de trabalho** ou qualquer gasto; dependências locais do fork são permitidas após conferir origem e escopo.
- Imagens geradas por IA não são necessárias; para comprovar interface usar captura **real** do ORCA, nunca mockup apresentado como teste.
- Não alterar projetos reais, credenciais, repositórios de terceiros, configurações globais ou qualquer plano de usuários durante os testes; usar fixtures locais.
