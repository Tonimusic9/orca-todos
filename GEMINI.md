# Project Progress para ORCA no Gemini Antigravity

Abra **esta pasta raiz** (`Project Progress`) como workspace (o nome exato da pasta será o escolhido no ORCA). Este arquivo orienta a leitura; não substitui as decisões do projeto. **Claude Code ou Codex podem liderar projetos; neste MVP, o Codex Goal é o líder e Gemini/Antigravity somente um possível executor delegado.**

## Ao iniciar

1. Leia `AGENTS.md` (regras técnicas e limites), `CLAUDE.md` (comportamento), `HANDOFF.md` (estado e decisões) e, se participar da implementação, a seção pertinente de `PROMPT_MESTRE_CODEX_GOAL_ORCA_PROJECT_PROGRESS.md`. No handoff, priorize a última seção.
2. Use os caminhos em `HANDOFF.md` e a estrutura em `AGENTS.md` para encontrar os documentos do assunto pedido. Abra apenas os arquivos relevantes para a tarefa. Não trate rascunhos como aprovados.
3. Confirme no serviço correspondente qualquer estado externo que a tarefa exija (publicação, preço, disponibilidade, deploy). Não deduza que algo aconteceu só porque foi agendado ou pedido.

## Prioridade das informações

Pedido atual do responsável → Prompt Mestre aprovado para o MVP e decisão explícita mais recente no `HANDOFF.md` → documentos aprovados → rascunhos e estudos → registros históricos. Quando houver divergência material, aponte-a antes de agir. Preserve trabalhos já produzidos e mudanças fora do pedido.

## Operação

- Responda em português simples e curto. Mostre primeiro o resultado ou a próxima ação.
- Não publique em marketplace, envie mensagens, gaste dinheiro, ative anúncios ou altere algo já agendado sem autorização específica. **Commit e push na branch de trabalho do fork estão autorizados**, se o agente líder atribuir a tarefa e remoto/branch forem verificados; jamais push em `main` ou force-push.
- O repositório, especialmente `HANDOFF.md` e o arquivo de planejamento Markdown, é a fonte de verdade do projeto. Notas externas não substituem o estado verificável. Não copie credenciais nem dados pessoais para os documentos.
- Se não conseguir abrir um caminho fora do workspace (Obsidian, iCloud), informe a limitação; não invente o conteúdo desse arquivo.
- Se contribuir manualmente para o plugin, consultar a skill oficial `orca-plugin-authoring` e a seção aplicável do Prompt Mestre. Não instalar globalmente nem alterar a máquina sem autorização; não editar planos reais do usuário.
- **Antigravity/Gemini podem receber delegações do Codex ou Claude Code conforme limites disponíveis, desde que o meio de acesso seja oficialmente permitido.** Não usar assinatura pessoal do Antigravity como API controlada por wrappers/terceiros sem autorização do provedor; se não houver caminho permitido, retornar indisponibilidade e deixar o líder seguir pelo OpenCode ou diretamente.

## Papel do Antigravity no projeto

- **Claude Code e Codex podem liderar projetos**. Para **este** plugin, o **Codex Goal é o único líder**; Gemini/Antigravity atua como executor delegado opcional apenas com integração autorizada, franquia suficiente e vantagem real. OpenCode Go é a alternativa usual. Não criar sessões coordenadoras concorrentes.
- **Não gere imagens desnecessárias:** o MVP é um painel TSX; screenshots de validação devem vir do ORCA real, não de geração de imagens.
- Faça somente tarefas autorizadas e delimitadas; pare em senha, 2FA, CAPTCHA, pagamento, política de privacidade ou acesso ao ambiente. Devolva evidência curta (arquivo, diff, teste e captura real), sem segredos.
- Não assuma arquitetura, integração final ou aceite A1–A12, que pertencem ao Codex Goal. Respeite duas tentativas por causa, uma correção por entrega e encerramento de abordagem sem progresso. **Não solicite aprovação a cada fase**: execute o subescopo delegado com autonomia e devolva evidência.
- Não são necessárias integrações específicas do Antigravity para este MVP.

## Quando o responsável pedir para salvar tudo e voltar ao Codex ou Claude Code

Siga o protocolo **"Transferência entre Antigravity, Codex e Claude Code"** em `AGENTS.md`. Salve os arquivos da tarefa e o estado verificável no repositório, atualize `HANDOFF.md`, confira o diff; **commit/push na branch de trabalho estão autorizados quando essa tarefa for delegada pelo líder**, com Git e ausência de segredos verificados. Deixe um prompt de retomada que funcione para os dois líderes. Informe qualquer arquivo ou ação externa que não tenha conseguido salvar ou verificar. Não dependa de memória exclusiva do Antigravity.
