# Project Progress para ORCA

Veja o checklist do workspace em foco na barra lateral direita do ORCA. O painel mostra o percentual geral, fases expansíveis e tarefas aninhadas. A edição é feita no Markdown. O painel reflete o arquivo após cada gravação, inclusive quando um editor o substitui em um save atômico.

## Plano do workspace

A descoberta usa esta ordem dentro da raiz do workspace local ativo:

`PROJECT_PLAN.md` → `PLAN.md` → `ROADMAP.md` → `TASKS.md` → `TODO.md` → `docs/PLAN.md` → `docs/ROADMAP.md`.

A primeira fonte com checkboxes utilizáveis vira o plano. Quando há várias, **Plano canônico** permite escolher uma. A preferência fica no armazenamento do plugin por workspace. Se o arquivo escolhido sumir ou ficar vazio, o painel volta à ordem de descoberta. A contagem é sempre de uma fonte por vez.

```markdown
# Plano de entrega

## Planejamento
- [x] Definir requisitos

## Implementação
- [ ] Entregar painel
  - [x] Desenhar checklist
  - [ ] @doing Conferir na sidebar
```

O primeiro `#` serve de título do documento. Os demais cabeçalhos organizam fases. Apenas checkboxes sem subtarefas contam para os percentuais. `[x]` marca conclusão e `@doing` no início de uma tarefa aberta marca andamento. `@me` e `@agent` continuam aceitos em arquivos legados. Fases vazias mostram **Sem tarefas**.

Ao trocar de worktree, o painel usa a raiz do novo worktree. Se houver gravações concorrentes, o painel reflete o texto que ficou no disco. Se a leitura falhar, mostra o erro e sinaliza a última leitura válida do workspace, quando disponível. Links simbólicos ficam fora da descoberta.

## Desenvolvimento e ativação

Use o ORCA 1.4.248 ou superior. As verificações foram feitas com o ORCA 1.4.262.

```sh
npm ci
orca plugin types . --json
npm run typecheck
npm test
orca plugin validate . --json
orca plugin dev load . --json
```

Na primeira carga o ORCA pede consentimento para executar o worker Node com acesso da conta do usuário, consultar os workspaces e guardar a escolha do plano no armazenamento próprio. Depois de autorizar, clique em **Project Progress** na barra lateral direita. O ícone do explorador volta à árvore de arquivos. Também é possível abrir o painel com:

```sh
orca plugin open local.project-progress --panel progress --json
```

Os testes cobrem renderização e expansão de fases, 9 de 15 folhas (60%), hierarquia, código cercado, fase vazia, troca de workspace, seleção persistente, atualização com save atômico e tratamento de erro de leitura. Os planos em [fixtures/sample](fixtures/sample) e [fixtures/other](fixtures/other) servem de exemplo.

Derivado de [Todos for Orca](https://github.com/jonstuebe/orca-todos), de Jon Stuebe. [Licença MIT](LICENSE).
