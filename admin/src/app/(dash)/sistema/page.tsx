import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Info,
  MinusCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { getProvider } from "@/data/provider";
import { env, usingMock } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * O que está ligado de verdade.
 *
 * Painel que finge ter dado real é pior que painel vazio: alguém toma decisão
 * em cima de número inventado. Esta tela existe para que, em qualquer momento,
 * dê pra saber de onde cada número da casa está vindo.
 */

interface Integracao {
  nome: string;
  para: string;
  ligada: boolean;
  detalhe: string;
}

export default async function Sistema() {
  const sinais = await getProvider().getSinaisDeProduto();

  const integracoes: Integracao[] = [
    {
      nome: "Supabase",
      para: "Usuárias, assinaturas, registros e os agregados de produto",
      ligada: env.supabase.configured,
      detalhe: env.supabase.configured
        ? "service-role configurada (o admin ignora RLS de propósito)"
        : "sem SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — tudo nesta casa é demonstração",
    },
    {
      nome: "Senha do painel",
      para: "Acesso a este admin",
      ligada: Boolean(env.admin.password),
      detalhe: env.admin.password
        ? "ADMIN_PASSWORD definida"
        : "usando a senha de demonstração — trocar ANTES de expor o painel na internet",
    },
    {
      nome: "Allowlist de e-mails",
      para: "Quem pode entrar",
      ligada: env.admin.emails.length > 0,
      detalhe: env.admin.emails.length
        ? `${env.admin.emails.length} e-mail(s) liberados`
        : "ADMIN_EMAILS vazia",
    },
  ];

  const tabelas = [
    { nome: "profiles", onda: "1", guarda: "Perfil e onboarding" },
    { nome: "subscriptions", onda: "1", guarda: "Espelho do entitlement do RevenueCat" },
    { nome: "journey_progress", onda: "1", guarda: "Dia atual, fase, dias concluídos" },
    { nome: "daily_logs", onda: "1", guarda: "Check-in diário" },
    { nome: "gut_scores", onda: "1", guarda: "Índice Intestinal por dia" },
    { nome: "leads", onda: "1", guarda: "Interesse em acompanhamento" },
    { nome: "content", onda: "1", guarda: "CMS opcional" },
    { nome: "meals", onda: "2", guarda: "Refeições com a Nota Desinflama como ela viu" },
    { nome: "seeds", onda: "2", guarda: "Saldo e acumulado — duas colunas, nunca uma" },
    { nome: "rewards_redeemed", onda: "2", guarda: "Resgates da loja, com o preço da época" },
    { nome: "tolerance_results", onda: "2", guarda: "Mapa de Tolerância, teste a teste" },
    { nome: "food_preferences", onda: "2", guarda: "Gosto / não é pra mim" },
  ];

  return (
    <>
      <PageHeader
        title="Sistema"
        subtitle="De onde vem cada número desta casa."
      />

      {usingMock && (
        <Nota
          icone={AlertTriangle}
          titulo="Esta casa está em modo demonstração"
          tom="atencao"
        >
          Sem Supabase configurado, TODOS os números de usuárias, leads e
          assinaturas são inventados para a tela não ficar vazia. O conteúdo e
          as mecânicas (jornada, receitas, Broto, nota, cardápio) são reais —
          eles vêm direto do código do app.
        </Nota>
      )}

      <Secao titulo="Integrações">
        <Tabela colunas={["Serviço", "Serve para", "Estado"]}>
          {integracoes.map((i) => (
            <Linha key={i.nome}>
              <Celula>
                <span className="font-semibold text-ink">{i.nome}</span>
              </Celula>
              <Celula className="text-ink-soft">{i.para}</Celula>
              <Celula>
                <span className="flex items-start gap-2">
                  {i.ligada ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--color-nota-boa)]" />
                  ) : (
                    <MinusCircle className="mt-0.5 size-4 shrink-0 text-gold-dark" />
                  )}
                  <span className="text-ink-soft">{i.detalhe}</span>
                </span>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Sinais de produto"
        descricao="Contar assinatura diz se o negócio vive. Isto diz o que consertar."
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Numero
            valor={sinais.notaMedia ?? "—"}
            rotulo="Nota Desinflama média"
            detalhe={`${sinais.refeicoesRegistradas} refeições registradas`}
          />
          <Numero
            valor={sinais.maisRecusados[0]?.alimento ?? "—"}
            rotulo="Alimento mais recusado"
            detalhe="cada recusa é uma receita que precisa de alternativa"
            tom="gold"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="eyebrow mb-2">Mais recusados</p>
            <Tabela colunas={["Alimento", "Recusas"]}>
              {sinais.maisRecusados.map((r) => (
                <Linha key={r.alimento}>
                  <Celula>{r.alimento}</Celula>
                  <Celula numerica>{r.quantas}</Celula>
                </Linha>
              ))}
            </Tabela>
          </div>

          <div>
            <p className="eyebrow mb-2">Prazeres mais resgatados</p>
            <Tabela colunas={["Prazer", "Resgates"]}>
              {sinais.prazeresMaisResgatados.map((p) => (
                <Linha key={p.nome}>
                  <Celula>{p.nome}</Celula>
                  <Celula numerica>{p.quantas}</Celula>
                </Linha>
              ))}
            </Tabela>
          </div>

          <div>
            <p className="eyebrow mb-2">Gatilhos mais comuns</p>
            <Tabela colunas={["Grupo", "Reações"]}>
              {sinais.gatilhosMaisComuns.map((g) => (
                <Linha key={g.grupo}>
                  <Celula>
                    <Chip tom="media">{g.grupo}</Chip>
                  </Celula>
                  <Celula numerica>{g.quantas}</Celula>
                </Linha>
              ))}
            </Tabela>
          </div>
        </div>
      </Secao>

      <Secao
        titulo="Tabelas"
        descricao="O SQL completo está em admin/supabase/schema.sql — aplicar no editor do Supabase."
      >
        <Nota icone={Info} titulo="Por que a nota fica gravada na refeição">
          A Nota Desinflama é calculada no aparelho com o Mapa de Tolerância
          daquele momento. Recalcular depois daria um número diferente do que a
          cliente viu — histórico tem que refletir o que ela viu, não o que a
          regra diria hoje. Mesma lógica no preço do resgate.
        </Nota>

        <Tabela colunas={["Tabela", "Onda", "Guarda"]}>
          {tabelas.map((t) => (
            <Linha key={t.nome}>
              <Celula>
                <span className="inline-flex items-center gap-2">
                  <Database className="size-3.5 text-ink-faint" />
                  <span className="font-mono text-xs text-ink">{t.nome}</span>
                </span>
              </Celula>
              <Celula>
                <Chip tom={t.onda === "2" ? "rose" : "neutro"}>{t.onda}</Chip>
              </Celula>
              <Celula className="text-ink-soft">{t.guarda}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
