import MaterialIcons from "@/components/ui/material-icon";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatAppointmentDate(value: Date, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(value);
}

function sourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    clinic: "Clínica",
    demo: "Demonstração",
    hospital: "Hospital",
    partner: "Parceiro integrado",
    professional: "Profissional",
  };
  return labels[type] ?? "Fonte identificada";
}

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isAuthenticated, loading } = useAuth();
  const appointmentId = typeof id === "string" && uuidPattern.test(id) ? id : undefined;
  const appointmentQuery = trpc.appointment.getMine.useQuery(
    { appointmentId: appointmentId ?? "00000000-0000-4000-8000-000000000000" },
    { enabled: isAuthenticated && Boolean(appointmentId) },
  );
  const appointment = appointmentQuery.data;
  const rescheduleMutation = trpc.reschedule.request.useMutation();

  const requestReschedule = () => {
    if (!appointment) return;
    rescheduleMutation.mutate({
      appointmentId: appointment.id,
      // O ID da consulta é UUID e garante um pedido idempotente por agendamento.
      idempotencyKey: appointment.id,
    });
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para agenda"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <MaterialIcons name="arrow-back" size={20} color="#075985" />
          <Text style={styles.backText}>Agenda</Text>
        </Pressable>
        {loading || appointmentQuery.isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#075985" />
            <Text style={styles.emptyText}>Carregando a confirmação protegida...</Text>
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="lock-outline" size={28} color="#526070" />
            <Text style={styles.emptyTitle}>Entre para ver esta consulta</Text>
            <Text style={styles.emptyText}>A confirmação fica disponível somente para a conta titular autorizada.</Text>
          </View>
        ) : !appointment ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="event-busy" size={28} color="#526070" />
            <Text style={styles.emptyTitle}>Consulta indisponível</Text>
            <Text style={styles.emptyText}>Esta confirmação não existe, não pertence à sua conta ou ainda não está disponível.</Text>
          </View>
        ) : (
          <>
            <ScreenHeader
              eyebrow={appointment.status === "cancelled" ? "Confirmação cancelada" : "Consulta confirmada"}
              title={formatAppointmentDate(appointment.startsAt, appointment.timezone)}
              description="Informações recebidas da fonte identificada; o MedSync não altera dados de agendamento."
            />
            <View style={[styles.statusCard, appointment.status === "cancelled" && styles.statusCardCancelled]}>
              <MaterialIcons name={appointment.status === "cancelled" ? "event-busy" : "event-available"} size={21} color={appointment.status === "cancelled" ? "#B42318" : "#0F766E"} />
              <View style={styles.statusCopy}>
                <Text style={[styles.statusTitle, appointment.status === "cancelled" && styles.statusTitleCancelled]}>
                  {appointment.status === "cancelled" ? "Cancelada pela fonte" : "Confirmada pela fonte"}
                </Text>
                <Text style={[styles.statusText, appointment.status === "cancelled" && styles.statusTextCancelled]}>
                  {appointment.status === "cancelled" && appointment.cancelledAt
                    ? `Atualização recebida em ${formatAppointmentDate(appointment.cancelledAt, appointment.timezone)}.`
                    : "Aguarde os canais oficiais para qualquer mudança de data, horário ou local."}
                </Text>
              </View>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.label}>Data e horário</Text>
              <Text style={styles.value}>{formatAppointmentDate(appointment.startsAt, appointment.timezone)}</Text>
              <Text style={styles.label}>Fuso horário</Text>
              <Text style={styles.value}>{appointment.timezone}</Text>
              <Text style={styles.label}>Local</Text>
              <Text style={styles.value}>{appointment.location}</Text>
              <Text style={styles.label}>Profissional</Text>
              <Text style={styles.value}>{appointment.professionalLabel}</Text>
              <Text style={styles.label}>Preparo informado</Text>
              <Text style={styles.value}>{appointment.preparationInstructions}</Text>
            </View>
            <Text style={styles.sectionTitle}>Origem da confirmação</Text>
            <View style={styles.sourceCard}>
              <MaterialIcons name="verified-user" size={22} color="#075985" />
              <View style={styles.sourceCopy}>
                <Text style={styles.sourceTitle}>{appointment.source.label}</Text>
                <Text style={styles.sourceText}>{sourceTypeLabel(appointment.source.type)} · recebida em {formatAppointmentDate(appointment.source.receivedAt, appointment.timezone)}</Text>
              </View>
            </View>
            {appointment.status === "confirmed" ? (
              <View style={styles.rescheduleSection}>
                <Text style={styles.sectionTitle}>Precisa alterar este horário?</Text>
                <Text style={styles.rescheduleText}>O pedido será enviado à fonte identificada. Ele não confirma uma nova consulta e dependerá da resposta do estabelecimento.</Text>
                {rescheduleMutation.isSuccess ? (
                  <View style={styles.rescheduleSuccess} accessibilityLiveRegion="polite">
                    <MaterialIcons name="check-circle" size={18} color="#0F766E" />
                    <Text style={styles.rescheduleSuccessText}>Solicitação registrada. Acompanhe a atualização na agenda.</Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Solicitar reagendamento desta consulta"
                    disabled={rescheduleMutation.isPending}
                    onPress={requestReschedule}
                    style={({ pressed }) => [styles.rescheduleButton, (pressed || rescheduleMutation.isPending) && styles.rescheduleButtonPressed]}
                  >
                    {rescheduleMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <MaterialIcons name="event-repeat" size={20} color="#FFFFFF" />}
                    <Text style={styles.rescheduleButtonText}>{rescheduleMutation.isPending ? "Registrando pedido..." : "Solicitar reagendamento"}</Text>
                  </Pressable>
                )}
                {rescheduleMutation.isError ? <Text style={styles.rescheduleError}>Não foi possível registrar o pedido agora. Nenhuma consulta foi alterada.</Text> : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 30, paddingTop: 18 },
  detailCard: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 7, marginTop: 16, padding: 16 },
  emptyCard: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 38, padding: 24 },
  emptyText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  emptyTitle: { color: "#172033", fontSize: 17, fontWeight: "800", textAlign: "center" },
  label: { color: "#075985", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginTop: 7, textTransform: "uppercase" },
  sectionTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 24 },
  rescheduleButton: { alignItems: "center", backgroundColor: "#075985", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 14, minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  rescheduleButtonPressed: { opacity: 0.72 },
  rescheduleButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  rescheduleError: { color: "#B42318", fontSize: 13, lineHeight: 19, marginTop: 10 },
  rescheduleSection: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 18, borderWidth: 1, marginTop: 20, padding: 16 },
  rescheduleSuccess: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 12, flexDirection: "row", gap: 8, marginTop: 14, padding: 12 },
  rescheduleSuccessText: { color: "#166534", flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  rescheduleText: { color: "#31546A", fontSize: 14, lineHeight: 20, marginTop: 7 },
  sourceCard: { alignItems: "flex-start", backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 10, padding: 15 },
  sourceCopy: { flex: 1, gap: 4 },
  sourceText: { color: "#31546A", fontSize: 13, lineHeight: 19 },
  sourceTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  statusCard: { alignItems: "flex-start", backgroundColor: "#ECFDF5", borderColor: "#A7F3D0", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  statusCardCancelled: { backgroundColor: "#FEF3F2", borderColor: "#FECDCA" },
  statusCopy: { flex: 1, gap: 3 },
  statusText: { color: "#166534", fontSize: 13, lineHeight: 19 },
  statusTextCancelled: { color: "#912018" },
  statusTitle: { color: "#0F766E", fontSize: 15, fontWeight: "800" },
  statusTitleCancelled: { color: "#B42318" },
  value: { color: "#31546A", fontSize: 14, lineHeight: 20 },
});
