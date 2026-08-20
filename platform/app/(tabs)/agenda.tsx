import MaterialIcons from "@/components/ui/material-icon";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/medsync/empty-state";
import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

function formatAppointmentDate(value: Date, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(value);
}

const rescheduleStatusLabels = {
  requested: "Pedido enviado",
  under_review: "Em análise",
  options_received: "Opções recebidas",
  completed: "Concluído",
  declined: "Sem opção no momento",
  withdrawn: "Pedido cancelado",
} as const;

export default function AgendaScreen() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const appointmentsQuery = trpc.appointment.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const requestsQuery = trpc.reschedule.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const seedMutation = trpc.appointment.ensureDemoMine.useMutation({
    onSuccess: () => {
      utils.appointment.listMine.invalidate();
      utils.reschedule.listMine.invalidate();
    },
  });
  const appointments = appointmentsQuery.data ?? [];
  const requestsByAppointment = new Map((requestsQuery.data ?? []).map((request) => [request.appointmentId, request]));

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="Organize seu atendimento"
              title="Agenda"
              description="Somente confirmações recebidas de clínicas, hospitais ou profissionais identificados aparecem aqui."
            />
            <View style={styles.processCard}>
              <Text style={styles.processTitle}>Reagendamento seguro</Text>
              <Text style={styles.processText}>Uma solicitação será rastreável, mas não será tratada como consulta confirmada até a resposta do estabelecimento.</Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const request = requestsByAppointment.get(item.id);
          return <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir consulta ${formatAppointmentDate(item.startsAt, item.timezone)}`}
            onPress={() => router.push({ pathname: "../appointment-detail", params: { id: item.id } })}
            style={({ pressed }) => [styles.appointmentCard, pressed && styles.appointmentCardPressed]}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.statusBadge, item.status === "cancelled" && styles.statusBadgeCancelled]}>
                <MaterialIcons name={item.status === "cancelled" ? "event-busy" : "event-available"} size={17} color={item.status === "cancelled" ? "#B42318" : "#0F766E"} />
                <Text style={[styles.statusText, item.status === "cancelled" && styles.statusTextCancelled]}>{item.status === "cancelled" ? "Cancelada" : "Confirmada"}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={23} color="#526070" />
            </View>
            <Text style={styles.appointmentDate}>{formatAppointmentDate(item.startsAt, item.timezone)}</Text>
            <Text style={styles.appointmentMeta}>{item.professionalLabel}</Text>
            <Text style={styles.appointmentMeta}>{item.location}</Text>
            <View style={styles.sourceRow}>
              <MaterialIcons name="verified-user" size={16} color="#075985" />
              <Text style={styles.sourceText}>Fonte: {item.source.label} · {item.timezone}</Text>
            </View>
            {request ? (
              <View style={styles.requestRow}>
                <MaterialIcons name="sync" size={16} color="#7A4D00" />
                <Text style={styles.requestText}>Reagendamento: {rescheduleStatusLabels[request.status]}</Text>
              </View>
            ) : null}
          </Pressable>
        }}
        ListEmptyComponent={
          loading || appointmentsQuery.isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#075985" />
              <Text style={styles.loadingText}>Consultando confirmações protegidas...</Text>
            </View>
          ) : !isAuthenticated ? (
            <EmptyState
              icon="lock-outline"
              eyebrow="Acesso protegido"
              title="Entre para consultar sua agenda"
              description="As confirmações são exibidas somente para a conta titular autorizada."
              actionLabel="Entrar na minha conta"
              onAction={() => router.push("/profile")}
            />
          ) : appointmentsQuery.isError ? (
            <EmptyState icon="error-outline" eyebrow="Agenda indisponível" title="Não foi possível carregar as confirmações" description="Nenhuma informação foi alterada. Tente novamente em alguns instantes." />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="event-available"
                eyebrow="Demonstração opcional"
                title="Prepare uma agenda demonstrativa"
                description="Crie quatro confirmações fictícias, protegidas e identificadas como demonstração. Isso não agenda atendimento real."
                actionLabel={seedMutation.isPending ? "Preparando agenda..." : "Preparar agenda demonstrativa"}
                onAction={() => seedMutation.mutate()}
              />
              {seedMutation.isError ? <Text style={styles.seedError}>Não foi possível preparar os dados agora. Nenhum agendamento real foi criado.</Text> : null}
            </View>
          )
        }
        ListFooterComponent={<Text style={styles.footer}>O MedSync informa o status recebido; alterações de agenda dependem da resposta do estabelecimento.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  appointmentCard: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 7, marginTop: 14, padding: 16 },
  appointmentCardPressed: { opacity: 0.7 },
  appointmentDate: { color: "#172033", fontSize: 16, fontWeight: "800", lineHeight: 22 },
  appointmentMeta: { color: "#526070", fontSize: 14, lineHeight: 20 },
  cardTopRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  content: {
    flexGrow: 1,
    paddingBottom: 118,
    paddingTop: 20,
  },
  emptyWrap: { alignSelf: "center", marginTop: 26, maxWidth: 560, width: "100%" },
  footer: { color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: "center" },
  loadingState: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 24, padding: 24 },
  loadingText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  processCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8EE",
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    marginTop: 22,
    padding: 18,
  },
  processTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "800",
  },
  processText: {
    color: "#526070",
    fontSize: 14,
    lineHeight: 20,
  },
  requestRow: { alignItems: "center", backgroundColor: "#FFFAEB", borderRadius: 10, flexDirection: "row", gap: 6, marginTop: 4, paddingHorizontal: 9, paddingVertical: 7 },
  requestText: { color: "#7A4D00", flex: 1, fontSize: 12, fontWeight: "700", lineHeight: 17 },
  seedError: { color: "#B42318", fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: "center" },
  sourceRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 4 },
  sourceText: { color: "#31546A", flex: 1, fontSize: 12, lineHeight: 18 },
  statusBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#ECFDF5", borderRadius: 999, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 5 },
  statusBadgeCancelled: { backgroundColor: "#FEF3F2" },
  statusText: { color: "#0F766E", fontSize: 12, fontWeight: "800" },
  statusTextCancelled: { color: "#B42318" },
});
