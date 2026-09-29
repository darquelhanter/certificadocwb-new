# Certificado CWB — documento de continuidade

Este arquivo é a **fonte da verdade entre computadores**. O Claude Code lê ele automaticamente ao abrir esta pasta, em qualquer PC. A memória local do Claude (`~/.claude/...`) NÃO viaja entre máquinas; este arquivo sim, porque está no Git.

## Regra de ouro para o Claude (ler primeiro)

1. **Responder sempre em português.**
2. **Ao final de cada bloco de trabalho** (feature, correção, decisão ou passo de configuração externa): atualizar a seção "Pendências" e acrescentar uma linha em "Histórico de sessões" aqui, e dar `commit` + `push` deste arquivo junto com o trabalho.
3. **Nunca gravar segredos aqui** (chaves, senhas, tokens, string do banco). Só o NOME das variáveis e onde obter o valor.
4. Ao retomar: ler "Pendências" e "Histórico de sessões", conferir `git log --oneline | head`, e só então propor o próximo passo.

## Como abrir em outro PC

1. Instalar Node.js LTS e Git. Instalar o Claude Code.
2. `git clone https://github.com/darquelhanter/certificadocwb-new.git` e entrar na pasta.
3. `npm install`
4. Criar o `.env` a partir de `.env.example` (o `.env` é ignorado pelo Git). Valores reais: painel da Vercel → projeto → Settings → Environment Variables. Variáveis marcadas como "Sensitive" não podem ser lidas de volta; nesse caso pegar no serviço de origem (Asaas, Resend, Anthropic, Railway) ou gerar de novo.
5. `npm run dev` → http://localhost:3000 (Express + Vite, só para desenvolvimento).
6. Skills do Claude são locais de cada máquina. Reinstalar as usadas neste projeto:
   - `npx skills add https://github.com/anthropics/skills --skill frontend-design`
   - `npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser`
   - `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`
   - `npx skills add https://github.com/coreyhaines31/marketingskills --skill marketing-psychology`
   - `npx skills add https://github.com/pbakaus/impeccable --skill impeccable`
   - `token-efficiency` e `requesting-code-review` estavam só na máquina original: pedir ao Claude para recriar.
7. Para testar no navegador: `npm i -g agent-browser && agent-browser install`. No Windows, screenshot de página inteira é `agent-browser screenshot -f arquivo.png`; usar sempre `--session <nome>`.

## O que é

Site de venda de certificados digitais (e-CPF / e-CNPJ) da empresa Hantech Ltda, marca Certificado CWB, Curitiba. Produção: https://www.certificadocwb.com.br (Vercel). Repo: https://github.com/darquelhanter/certificadocwb-new (branch `main`; **push na `main` faz deploy automático na Vercel**).

Stack: React 19 + TypeScript + Vite 6 + Tailwind v4, funções serverless da Vercel em `api/`, Postgres (Neon), Asaas (pagamento), Evolution API (WhatsApp), Resend (e-mail), Claude Haiku 4.5 (bot de FAQ).

## Regras de arquitetura que já quebraram produção (não repetir)

- **A Vercel NÃO roda o `server.ts`.** Ele é só para `npm run dev`. Produção = site estático + funções em `api/`. Toda rota nova precisa existir nos DOIS lugares: `api/<rota>.ts` (produção) e `server.ts` (dev).
- **Código compartilhado do backend fica em `api/_lib/`** e é importado com extensão explícita `.js` (ex.: `'./_lib/db.js'`). Um `lib/` na raiz ou import sem `.js` dá `ERR_MODULE_NOT_FOUND` em produção e passa no build local.
- **Nunca mudar `build.outDir` do `vite.config.ts`** (a Vercel espera `dist/index.html`).
- **Mudou variável de ambiente na Vercel = precisa novo deploy** (ex.: `git commit --allow-empty -m "chore: redeploy" && git push`).
- Rodar `npm run lint && npm run build` antes de cada push.
- Como o site é SPA, `curl` na home NÃO mostra o texto renderizado. Para confirmar deploy, comparar o hash do bundle (`assets/index-XXXX.js`) do `curl` com o do `dist/` do build local.

## Mapa do código

- `src/App.tsx` — página inteira (hero, preços em `PRICING_PLANS`, FAQ em `FAQS`, formulário de lead, blog, rodapé). Eventos de anúncio: `trackPixelEvent` (Meta) e `trackGoogleLeadConversion` (Google).
- `src/components/PaymentModal.tsx` — checkout (nome, CPF/CNPJ, e-mail e WhatsApp obrigatórios; mídia física opcional com 10% de desconto no combo) → `/api/create-payment` → redireciona para a fatura do Asaas.
- `src/components/HistoryTab.tsx` + `AdminLogin.tsx` — painel de Leads. Acesso: ícone de cadeado quase invisível no canto inferior direito do rodapé; senha = `ADMIN_PASSWORD`. Mostra cartões de visualizações e visitantes únicos.
- `src/components/GuillocheWatermark.tsx` — marca d'água do hero.
- `api/submit-lead.ts` — grava lead no banco + avisa por WhatsApp.
- `api/create-payment.ts`, `api/asaas-webhook.ts` — cobrança e confirmação (evento `PAYMENT_CONFIRMED` **e** `PAYMENT_RECEIVED`; Pix só dispara o segundo).
- `api/whatsapp-webhook.ts` — mensagens recebidas → bot de FAQ; se o admin responder manualmente, o bot pausa aquele número por 24h. Na primeira mensagem de um número novo (só a primeira, não repete nas seguintes), manda um e-mail de aviso pra `cwbcertificado@gmail.com` **e** `darquelhanter1@gmail.com` (o dono pediu para acompanhar pessoalmente no começo; tirar o segundo e-mail depois se não precisar mais).
- `api/track-pageview.ts`, `api/stats/pageviews.ts` — contador anônimo de visitas.
- `api/leads/{list,update-status,delete}.ts` — CRUD protegido por senha (`x-admin-password`).
- `api/_lib/` — `db.ts`, `adminAuth.ts`, `asaas.ts`, `evolutionApi.ts`, `email.ts`, `postPaymentNotify.ts`, `supportBot.ts`, `metaConversions.ts`.
- Tabelas Postgres (criadas sozinhas em `db.ts`): `leads`, `whatsapp_messages`, `whatsapp_pauses`, `page_views`.

Conteúdo que precisa ser mantido igual em 3 lugares: **documentos exigidos** (`supportBot.ts`, `postPaymentNotify.ts`, FAQ em `App.tsx`). e-CPF: documento com foto + telefone + e-mail + endereço. e-CNPJ: documento do representante + Cartão CNPJ + Contrato Social em vigor + e-mail e telefone do titular.

## Variáveis de ambiente (só nomes; ver `.env.example`)

`EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` (= `CertificadoCWB`), `ASAAS_API_KEY`, `ASAAS_ENV` (`production`), `ASAAS_WEBHOOK_TOKEN`, `DATABASE_URL`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `WHATSAPP_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `META_CONVERSIONS_API_TOKEN` (ainda não configurado).

## Serviços externos e onde configurar

- **Vercel**: hospeda o site e as funções; banco Neon vem pela aba Storage.
- **Evolution API (Railway)**: WhatsApp do número oficial 41 99244-7846; instância `CertificadoCWB`. A instância antiga `SiteBot` está abandonada.
- **Asaas (produção, dinheiro real)**: Configurações → Integrações → Webhooks → `https://www.certificadocwb.com.br/api/asaas-webhook`, com os eventos `PAYMENT_CONFIRMED` e `PAYMENT_RECEIVED` marcados. Token do webhook não pode ter mais de 4 caracteres iguais seguidos. Pagamentos de teste criam clientes reais no Asaas.
- **Resend**: domínio `certificadocwb.com.br` verificado (DKIM/SPF/DMARC no Registro.br). Remetente `Certificado CWB <pagamentos@certificadocwb.com.br>`; e-mail do admin `cwbcertificado@gmail.com`.
- **Meta**: Pixel `1036956412492940` (PageView, Lead, InitiateCheckout no navegador; Purchase pelo servidor via Conversions API assim que houver token).
- **Google Ads** (conta de `darquelhanter1@gmail.com`, pré-pago por Pix): tag base `AW-18445597087` no `index.html`; conversão "Enviar formulário de lead" disparada no envio do formulário.
- **Google Analytics 4** (conta "Hantech" → propriedade "Certificado CWB", Measurement ID `G-1CDDGTST87`, mesmo `gtag.js` do `index.html`): criado e vinculado à conta do Google Ads (482-391-7499) em 2026-09-28. Leva até 24h pra dados cruzados aparecerem.
- **Instagram**: https://www.instagram.com/cwbcertificadodigital

## Identidade visual (redesenhada em 2026-09-16)

Conceito: o site parece um documento oficial emitido, não um SaaS genérico. Tokens em `src/index.css` (`@theme`): `ink #14213d`, `ink-light #1f2f52`, `parchment #f7f3e9`, `seal #8c6118`, `seal-light #c99a3d`, `verify #1f6f54`, `hairline #d8cbb0`.

- Títulos em Fraunces (`font-display`), corpo em Inter, mono só para dado tabular (preço, CPF, data).
- **Contraste (já medido)**: `bg-seal` com `text-white`; `bg-seal-light` com `text-ink`. Nunca `text-ink` sobre `bg-seal` (2,9:1, reprova) nem `text-white` sobre `bg-seal-light`. `text-seal` só sobre fundo claro.
- Cards com canto reto (`rounded-sm`) e borda `hairline`, sem sombra suave. Sem rótulos em caixa-alta acima de cada seção; numeração só onde há sequência real (os 5 passos).
- Verde do botão do WhatsApp é a cor da marca WhatsApp, de propósito.

## Catálogo e preços (conferir no `PRICING_PLANS`)

e-CPF A1 R$99,90 · e-CNPJ A1 R$149,90 (destaque "Mais Vendido") · e-CPF A3 R$159,90 (1 ano) / R$199,90 (2 anos) · e-CNPJ A3 R$229,90 / R$289,90. A3 é só o certificado; Token R$149,90, Cartão R$99,90 e Leitora R$179,90 são adicionais, com 10% de desconto no combo. Prova social real informada pelo dono: atende desde 2022, cerca de 20 certificados por mês (não inventar números maiores).

## Pendências (atualizar sempre)

1. **Meta Conversions API**: gerar token (Gerenciador de Eventos → Pixel `1036956412492940` → Configurações → Conversions API), colocar em `META_CONVERSIONS_API_TOKEN` na Vercel e no `.env`, e fazer novo deploy. O código já está pronto e não faz nada sem o token (`api/_lib/metaConversions.ts`).
2. **Meta Business Manager**: verificar o domínio `certificadocwb.com.br` (registro TXT no Registro.br), conta de anúncios e forma de pagamento. Exige o celular com Instagram/Facebook (2FA).
3. **Google Ads**: recarregar o saldo pré-pago (estava baixo). Campanha ativa: "Pesquisa - Certificado Digital - Curitiba" (R$20/dia, Maximizar conversões, só Rede de Pesquisa, local Curitiba, português). Depois de alguns dias: ver relatório de termos de pesquisa e criar palavras-chave negativas; conferir se o "AI Max" está desligado (voltou a aparecer ativado no resumo); confirmar que a conversão foi verificada. **"Campaign #1" (Performance Max) fica PAUSADA; não reativar** (gastou cerca de R$58 em Display/apps/YouTube com 0 lead).
   - **Achado da análise automática de 2026-09-28** (ver projeto separado `google-ads-claude-analyzer`): 7 dias, R$5,51 gastos, 258 impressões, 2 cliques, CTR 0,78% (baixo pra Rede de Pesquisa), 0 conversões. Verificar: (a) se o rastreamento de conversão está mesmo registrando algo em Metas → Conversões; (b) se "Incluir Rede de Display"/parceiros de pesquisa não foi ativado sem querer nas configurações da campanha; (c) relatório de termos de pesquisa, pra ver se as 258 impressões são de buscas relevantes; (d) parcela de impressões perdida por orçamento vs. classificação, pra saber se é caso de subir lance ou subir orçamento.
4. **Asaas**: limpar clientes de teste com e-mail inválido `teste@certificadocwb.com.br` ("Teste Telefone Modal" pode excluir; "TESTE WEBHOOK NAO PAGAR" tem R$10 recebido, só trocar o e-mail). Confirmar que os SMS de "e-mail inválido" pararam.
5. **Portal de parceiros (revenda para escritórios contábeis)**: só planejamento. Decisões até agora: fica SEPARADO do projeto atual; forma de cobrança do cliente final fica para depois ("fase de revenda"); primeiro escopo = cadastro do escritório + tabela de preço de custo (com histórico, porque os valores mudam). Falta o dono definir COMO separar tecnicamente (repositório/subdomínio/outra ideia).
6. Pequenos: trocar `...` por `…` nos textos restantes (`HistoryTab`, `AdminLogin`); o botão "Copiar Link" do blog só mostra um alert e não copia; favicon novo pode ficar em cache no navegador.
7. **Google Analytics 4**: feito e vinculado ao Google Ads (ver seção "Serviços externos"). Passos opcionais que o próprio Google sugeriu e ainda não foram feitos: criar conversões no GA4 a partir dos eventos-chave, e criar um público-alvo de remarketing. Também falta considerar o **Google Meu Negócio** (Perfil da Empresa no Google) — ainda não criado, foi identificado como próxima melhoria pendente numa conversa sobre um vídeo de dicas de SEO.

## Projetos relacionados

- **`google-ads-claude-analyzer`** (`Documents\Hantech\google-ads-claude-analyzer`, projeto Python separado, sem Git ainda): lê métricas da campanha do Google Ads acima e pede análise ao Claude. Tem seu próprio `CLAUDE.md` com todas as credenciais já configuradas (conta de gerente Hantech 782-777-9099, projeto Google Cloud `certificado-cwb-ads`, nível de acesso "Exploração" aprovado em 2026-09-28).

## Histórico de sessões

- **2026-06-16/22** — projeto criado no Google AI Studio (simulador de certificado, blog, leads em localStorage).
- **2026-09-04** — backend de aviso de lead por WhatsApp (Evolution API).
- **2026-09-08** — deploy real na Vercel (funções em `api/`, correção do `ERR_MODULE_NOT_FOUND` e do `outDir`); Asaas (Pix/boleto/cartão); simulador removido; catálogo real de preços.
- **2026-09-09** — preços ajustados, e-CNPJ A1 como destaque, revisões de texto, Instagram e Meta Pixel.
- **2026-09-10** — leads em Postgres com painel protegido por senha; WhatsApp do número oficial; aviso pós-pagamento (WhatsApp + e-mail) para cliente e admin; bot de FAQ com Claude (tool-use, pausa de 24h quando o dono assume); contador de visitas; novo título do hero.
- **2026-09-11** — Purchase do Meta via servidor (aguarda token); acesso ao painel de Leads escondido no rodapé; conta do Google Ads criada, com tag e conversão instaladas no site. O assistente do Google criou uma campanha Performance Max ("Campaign #1") que ficou ativa alguns dias e gastou cerca de R$58 sem gerar lead.
- **2026-09-14** — campanha de Pesquisa "Pesquisa - Certificado Digital - Curitiba" criada e publicada; Campaign #1 pausada.
- **2026-09-16** — revisão de acessibilidade (aria-label, autocomplete, foco, reduced-motion); nova identidade visual (documento oficial); copy com psicologia de marketing (prova social real, aversão à perda, preço mensal equivalente nos planos de 2 anos); favicon.
- **2026-09-21** — este documento de continuidade criado; conversa sobre integrar Google Ads ao Claude (Windsor.ai / servidor MCP) e sobre o portal de parceiros, sem código novo.
- **2026-09-28** — criado o projeto `google-ads-claude-analyzer` (script Python separado): conta de gerente Hantech, vínculo com a conta Certificado CWB, projeto no Google Cloud, OAuth e nível de acesso "Exploração" aprovado. Rodado pela primeira vez com sucesso — achados registrados na pendência 3 acima.
