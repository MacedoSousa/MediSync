import MaterialIcons from "@/components/ui/material-icon";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

type QueueItem =
  | { type: "rule"; id: string; ruleId: string; version: string; ownerLabel: string; reviewStatus: "approved" | "pending" | "rejected" | "disabled"; enabled: boolean; reviewedAt: Date }
  | { type: "review"; id: string; ruleRecordId: string; correlationId: string; status: "pending" | "approved" | "blocked"; reason: string; feedback: "helpful" | "not_helpful" | "safety_concern" | null; createdAt: Date };

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

export default function AiGovernanceScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const enabled = user?.role === "admin";
  const rules = trpc.assistiveGovernance.listRules.useQuery(undefined, { enabled });
  const queue = trpc.assistiveGovernance.listResponseReviewQueue.useQuery(undefined, { enabled });
  const metrics = trpc.assistiveGovernance.metrics.useQuery(undefined, { enabled });
  const refresh = () => { void rules.refetch(); void queue.refetch(); void metrics.refetch(); };
  const decideRule = trpc.assistiveGovernance.decideRule.useMutation({ onSuccess: refresh });
  const decideReview = trpc.assistiveGovernance.decideResponseReview.useMutation({ onSuccess: refresh });

  if (authLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator size="large" color="#075985" /></ScreenContainer>;
  if (!enabled) {
    return <ScreenContainer className="px-5"><View style={styles.restricted}><MaterialIcons name="lock" size={28} color="#075985" /><Text style={styles.restrictedTitle}>Acesso administrativo necessário</Text><Text style={styles.restrictedText}>A governança da IA é separada do cuidado do paciente e só pode ser consultada por contas autorizadas.</Text><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backButtonText}>Voltar</Text></Pressable></View></ScreenContainer>;
  }

  const data: QueueItem[] = [
    ...(rules.data ?? []).map((rule) => ({ type: "rule" as const, id: rule.id, ruleId: rule.ruleId, version: rule.version, ownerLabel: rule.ownerLabel, reviewStatus: rule.reviewStatus, enabled: rule.enabled, reviewedAt: rule.reviewedAt })),
    ...(queue.data ?? []).map((review) => ({ type: "review" as const, id: review.id, ruleRecordId: review.ruleRecordId, correlationId: review.correlationId, status: review.status, reason: review.reason, feedback: review.feedback, createdAt: review.createdAt })),
  ];

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={data}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.content}
        refreshing={rules.isFetching || queue.isFetching || metrics.isFetching}
        onRefresh={refresh}
        ListHeaderComponent={<><ScreenHeader eyebrow="ADMINISTRAÇÃO" title="Governança assistiva" description="Fila sem conteúdo clínico, decisões humanas rastreáveis e métricas agregadas." /><View style={styles.notice}><MaterialIcons name="gpp-good" size={20} color="#075985" /><Text style={styles.noticeText}>A IA continua apenas assistiva. Esta área não permite diagnóstico, prescrição, triagem ou acionamento autônomo.</Text></View><View style={styles.metrics}><Metric label="Gerados" value={metrics.data?.generated ?? 0} /><Metric label="Bloqueados" value={metrics.data?.blocked ?? 0} /><Metric label="Sinais de segurança" value={metrics.data?.feedbackSafetyConcern ?? 0} /></View><Text style={styles.sectionTitle}>Regras e fila humana</Text></>}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Nenhum item pendente</Text><Text style={styles.emptyText}>As métricas permanecem agregadas; nenhum texto de resposta ou dado de paciente é exibido aqui.</Text></View>}
        renderItem={({ item }) => item.type === "rule" ? (
          <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.cardTitle}>{item.ruleId}</Text><Text style={styles.meta}>Versão {item.version} · {item.ownerLabel}</Text></View><Text style={[styles.badge, item.enabled ? styles.badgeActive : styles.badgeMuted]}>{item.reviewStatus}</Text></View>{item.reviewStatus === "pending" ? <View style={styles.actions}><Pressable onPress={() => decideRule.mutate({ ruleRecordId: item.id, decision: "approve" })} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Aprovar</Text></Pressable><Pressable onPress={() => decideRule.mutate({ ruleRecordId: item.id, decision: "reject" })} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>Rejeitar</Text></Pressable></View> : item.enabled ? <Pressable onPress={() => decideRule.mutate({ ruleRecordId: item.id, decision: "disable" })} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>Desativar regra</Text></Pressable> : null}</View>
        ) : (
          <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Revisão humana pendente</Text><Text style={styles.meta}>Motivo: {item.reason} · Retorno: {item.feedback ?? "não informado"}</Text></View><Text style={[styles.badge, styles.badgeWarning]}>pendente</Text></View><Text style={styles.queueText}>A revisão usa somente identificadores técnicos e motivo padronizado. O conteúdo assistivo não é exibido nesta fila.</Text><View style={styles.actions}><Pressable onPress={() => decideReview.mutate({ reviewId: item.id, decision: "approve" })} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Encerrar como seguro</Text></Pressable><Pressable onPress={() => decideReview.mutate({ reviewId: item.id, decision: "block" })} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>Bloquear</Text></Pressable></View></View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingTop: 20, gap: 12 },
  notice: { alignItems: "flex-start", backgroundColor: "#F0F9FF", borderRadius: 16, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  noticeText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
  metrics: { flexDirection: "row", gap: 10, marginTop: 14 },
  metric: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 16, borderWidth: 1, flex: 1, minHeight: 80, padding: 12 },
  metricValue: { color: "#075985", fontSize: 22, fontWeight: "800" }, metricLabel: { color: "#526070", fontSize: 12, lineHeight: 16, marginTop: 4 },
  sectionTitle: { color: "#172033", fontSize: 19, fontWeight: "800", marginTop: 22 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 14, padding: 16 },
  cardHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between" }, cardTitle: { color: "#172033", flexShrink: 1, fontSize: 15, fontWeight: "800" }, meta: { color: "#526070", fontSize: 12, lineHeight: 17, marginTop: 4 },
  badge: { borderRadius: 99, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textTransform: "uppercase" }, badgeActive: { backgroundColor: "#DCFCE7", color: "#166534" }, badgeMuted: { backgroundColor: "#E2E8F0", color: "#475569" }, badgeWarning: { backgroundColor: "#FEF3C7", color: "#92400E" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, primary: { alignItems: "center", backgroundColor: "#075985", borderRadius: 12, minHeight: 42, paddingHorizontal: 13, justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, secondary: { alignItems: "center", borderColor: "#9DB8C6", borderRadius: 12, borderWidth: 1, minHeight: 42, paddingHorizontal: 13, justifyContent: "center" }, secondaryText: { color: "#075985", fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  queueText: { color: "#526070", fontSize: 13, lineHeight: 19 }, empty: { backgroundColor: "#F8FAFC", borderRadius: 16, marginTop: 12, padding: 18 }, emptyTitle: { color: "#172033", fontSize: 16, fontWeight: "800" }, emptyText: { color: "#526070", fontSize: 13, lineHeight: 19, marginTop: 5 },
  restricted: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 22 }, restrictedTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 14, textAlign: "center" }, restrictedText: { color: "#526070", fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center" }, backButton: { backgroundColor: "#075985", borderRadius: 12, marginTop: 20, paddingHorizontal: 18, paddingVertical: 12 }, backButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
