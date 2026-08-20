import MaterialIcons from "@/components/ui/material-icon";
import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { cancelDiscreteMedicationReminder, scheduleDiscreteMedicationReminder } from "@/lib/medication-reminders";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { createSyntheticMedicationPlans, medicationPlanView } from "@/shared/medication-plan";
import { createMedicationRoutineAlert } from "@/shared/medication-routine-alert";
import { SYNTHETIC_DATA_NOTICE } from "@/shared/testing/synthetic-health-fixtures";

export default function MedicationsScreen() {
  const plans = createSyntheticMedicationPlans().map(medicationPlanView);
  const [time, setTime] = useState("08:00");
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const { isAuthenticated } = useAuth();
  const intakesQuery = trpc.medication.listIntakes.useQuery(undefined, { enabled: isAuthenticated });
  const latestAttention = [...(intakesQuery.data ?? [])]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .find((intake) => intake.status !== "taken");
  const routineAlert = latestAttention
    ? createMedicationRoutineAlert({ status: latestAttention.status, occurredAt: new Date(latestAttention.occurredAt) })
    : null;

  async function enableReminder() {
    setIsSavingReminder(true);
    const result = await scheduleDiscreteMedicationReminder(time);
    setIsSavingReminder(false);
    if (result.ok) return setReminderMessage(`Lembrete discreto ativado para ${result.time}.`);
    if (result.reason === "unsupported") return setReminderMessage("No Web, configure lembretes no aplicativo Android ou iOS.");
    if (result.reason === "permission_denied") return setReminderMessage("A permissão não foi concedida. Você pode ativá-la nas configurações do dispositivo.");
    return setReminderMessage("Informe o horário no formato 24 horas, por exemplo 08:00.");
  }

  async function disableReminder() {
    await cancelDiscreteMedicationReminder();
    setReminderMessage("Lembrete discreto desativado neste dispositivo.");
  }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        contentContainerStyle={styles.content}
        data={plans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="Rotina de cuidado"
              title="Medicamentos"
              description="Lembretes não substituem prescrição, dispensação farmacêutica ou orientação profissional."
            />
            <View style={styles.safetyNotice}>
              <Text style={styles.noticeTitle}>Proteção contra erros</Text>
              <Text style={styles.noticeText}>
                O MedSync reproduz a instrução registrada pela fonte. Ele não calcula, altera ou sugere doses, horários ou substituições.
              </Text>
            </View>
            <View style={styles.demoNotice}>
              <MaterialIcons name="science" size={20} color="#075985" />
              <Text style={styles.demoText}>{SYNTHETIC_DATA_NOTICE}</Text>
            </View>
            {routineAlert && (
              <View accessibilityRole="alert" style={styles.routineAlert}>
                <View style={styles.alertHeading}>
                  <MaterialIcons name="info-outline" size={22} color="#9A3412" />
                  <Text style={styles.alertTitle}>{routineAlert.title}</Text>
                </View>
                <Text style={styles.alertText}>{routineAlert.evidence}</Text>
                <Text style={styles.alertAction}>{routineAlert.safeAction}</Text>
                <Text style={styles.alertLimit}>{routineAlert.clinicalLimit}</Text>
              </View>
            )}
            <View style={styles.reminderCard}>
              <View style={styles.reminderHeading}>
                <MaterialIcons name="notifications-none" size={22} color="#075985" />
                <Text style={styles.reminderTitle}>Lembrete discreto</Text>
              </View>
              <Text style={styles.reminderText}>
                O aviso na tela bloqueada não mostra medicamento, dose, horário da prescrição ou diagnóstico. Ele só convida você a abrir o MedSync.
              </Text>
              <Text style={styles.timeLabel}>Horário diário (24 h)</Text>
              <TextInput
                accessibilityLabel="Horário diário do lembrete no formato 24 horas"
                autoCapitalize="none"
                keyboardType={Platform.OS === "web" ? "default" : "numbers-and-punctuation"}
                maxLength={5}
                onChangeText={setTime}
                returnKeyType="done"
                style={styles.timeInput}
                value={time}
              />
              <View style={styles.reminderActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Ativar lembrete discreto" disabled={isSavingReminder} onPress={enableReminder} style={({ pressed }) => [styles.enableButton, (pressed || isSavingReminder) && styles.buttonPressed]}>
                  <Text style={styles.enableText}>{isSavingReminder ? "Configurando..." : "Ativar"}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Desativar lembrete discreto" onPress={disableReminder} style={({ pressed }) => [styles.disableButton, pressed && styles.buttonPressed]}>
                  <Text style={styles.disableText}>Desativar</Text>
                </Pressable>
              </View>
              {reminderMessage && <Text accessibilityLiveRegion="polite" style={styles.reminderStatus}>{reminderMessage}</Text>}
            </View>
            <Text style={styles.sectionTitle}>Planos registrados</Text>
          </>
        }
        renderItem={({ item }) => (
          <View accessibilityLabel={`${item.displayName}. ${item.sourceLabel}`} style={styles.planCard}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="medication" size={22} color="#075985" />
            </View>
            <View style={styles.planCopy}>
              <View style={styles.titleRow}>
                <Text style={styles.planTitle}>{item.displayName}</Text>
                {item.isSynthetic && <Text style={styles.demoTag}>DEMONSTRAÇÃO</Text>}
              </View>
              <Text style={styles.instruction}>{item.instruction}</Text>
              <Text style={styles.source}>{item.sourceLabel}</Text>
              <Text style={styles.noChange}>Apenas consulta: nenhuma alteração de dose está disponível.</Text>
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  alertAction: { color: "#7C2D12", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  alertHeading: { alignItems: "center", flexDirection: "row", gap: 8 },
  alertLimit: { color: "#9A3412", fontSize: 12, fontStyle: "italic", lineHeight: 18 },
  alertText: { color: "#7C2D12", fontSize: 14, lineHeight: 20 },
  alertTitle: { color: "#9A3412", fontSize: 16, fontWeight: "800" },
  content: { flexGrow: 1, paddingBottom: 32, paddingTop: 20 },
  demoNotice: { alignItems: "flex-start", backgroundColor: "#E0F2FE", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 12, padding: 14 },
  demoTag: { backgroundColor: "#E0F2FE", borderRadius: 6, color: "#075985", fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 },
  demoText: { color: "#075985", flex: 1, fontSize: 13, lineHeight: 19 },
  disableButton: { alignItems: "center", borderColor: "#9A3412", borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: 12 },
  disableText: { color: "#9A3412", fontSize: 14, fontWeight: "800" },
  enableButton: { alignItems: "center", backgroundColor: "#075985", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: 12 },
  enableText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  iconWrap: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  instruction: { color: "#172033", fontSize: 14, lineHeight: 20 },
  noChange: { color: "#9A3412", fontSize: 12, fontWeight: "700", lineHeight: 18 },
  noticeText: { color: "#7C2D12", fontSize: 14, lineHeight: 20 },
  noticeTitle: { color: "#9A3412", fontSize: 16, fontWeight: "800" },
  reminderActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  reminderCard: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 12, padding: 16 },
  reminderHeading: { alignItems: "center", flexDirection: "row", gap: 8 },
  reminderStatus: { color: "#31546A", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 2 },
  reminderText: { color: "#31546A", fontSize: 13, lineHeight: 19 },
  reminderTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  routineAlert: { backgroundColor: "#FFF7ED", borderColor: "#FED7AA", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 12, padding: 16 },
  timeInput: { backgroundColor: "#FFFFFF", borderColor: "#9CC8DC", borderRadius: 10, borderWidth: 1, color: "#172033", fontSize: 16, fontWeight: "700", minHeight: 44, paddingHorizontal: 12 },
  timeLabel: { color: "#31546A", fontSize: 13, fontWeight: "800", marginTop: 3 },
  planCard: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 11, padding: 15 },
  planCopy: { flex: 1, gap: 7 },
  planTitle: { color: "#172033", flex: 1, fontSize: 16, fontWeight: "800" },
  safetyNotice: { backgroundColor: "#FFF7ED", borderColor: "#FED7AA", borderRadius: 18, borderWidth: 1, gap: 6, marginTop: 22, padding: 18 },
  sectionTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 23 },
  source: { color: "#31546A", fontSize: 13, lineHeight: 18 },
  buttonPressed: { opacity: 0.72 },
  titleRow: { alignItems: "center", flexDirection: "row", gap: 8 },
});
