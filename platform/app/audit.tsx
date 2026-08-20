import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const actionLabels = {
  legal_representative_requested: "Solicitação de responsável registrada",
  legal_representative_verified: "Vínculo de responsável verificado",
  caregiver_granted: "Acesso de cuidador concedido",
  caregiver_revoked: "Acesso de cuidador revogado",
  consent_granted: "Consentimento concedido",
  consent_revoked: "Consentimento revogado",
  access_denied: "Tentativa de acesso bloqueada",
  health_record_viewed: "Registro de saúde consultado",
  care_contact_created: "Contato de cuidado registrado",
  care_contact_removed: "Contato de cuidado removido",
  medication_intake_logged: "Registro de tomada de medicamento adicionado",
  medication_routine_viewed: "Rotina de medicamento consultada",
  appointment_viewed: "Consulta confirmada consultada",
  reschedule_requested: "Solicitação de reagendamento enviada",
  reschedule_status_updated: "Andamento do reagendamento atualizado",
  synthetic_asset_viewed: "Ativo demonstrativo de saúde consultado",
  assistive_summary_generated: "Resumo assistivo gerado",
} as const;

function formatAuditDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default function AuditScreen() {
  const { isAuthenticated, loading } = useAuth();
  const auditQuery = trpc.audit.listMine.useQuery(undefined, { enabled: isAuthenticated });

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={auditQuery.data ?? []}
        keyExtractor={(item, index) => `${item.occurredAt.toISOString()}-${item.action}-${index}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar para privacidade"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <MaterialIcons name="arrow-back" size={20} color="#075985" />
              <Text style={styles.backText}>Privacidade</Text>
            </Pressable>
            <ScreenHeader
              eyebrow="Transparência"
              title="Histórico de acessos"
              description="Veja ações registradas na sua conta. Este histórico não exibe conteúdos clínicos nem credenciais."
            />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.eventCard} accessibilityLabel={`${actionLabels[item.action]}. ${formatAuditDate(item.occurredAt)}`}>
            <View style={[styles.eventIcon, item.outcome === "denied" && styles.deniedIcon]}>
              <MaterialIcons name={item.outcome === "denied" ? "block" : "verified-user"} size={20} color={item.outcome === "denied" ? "#B42318" : "#0F766E"} />
            </View>
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{actionLabels[item.action]}</Text>
              <Text style={styles.eventText}>{formatAuditDate(item.occurredAt)} · Conta autorizada</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading || auditQuery.isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#075985" />
              <Text style={styles.emptyText}>Verificando o histórico protegido...</Text>
            </View>
          ) : !isAuthenticated ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="lock-outline" size={26} color="#526070" />
              <Text style={styles.emptyText}>Entre na sua conta para consultar o histórico de acessos.</Text>
            </View>
          ) : auditQuery.isError ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="error-outline" size={26} color="#B45309" />
              <Text style={styles.emptyText}>Não foi possível carregar o histórico agora. Nenhuma informação foi alterada.</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={26} color="#526070" />
              <Text style={styles.emptyText}>Nenhuma ação auditável foi registrada nesta conta ainda.</Text>
            </View>
          )
        }
        ListFooterComponent={<Text style={styles.footer}>Os eventos são encadeados e não podem ser alterados pelo aplicativo.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 28, paddingTop: 18 },
  deniedIcon: { backgroundColor: "#FEE4E2" },
  emptyState: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 26, padding: 24 },
  emptyText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  eventCard: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 12, padding: 15 },
  eventCopy: { flex: 1, gap: 3 },
  eventIcon: { alignItems: "center", backgroundColor: "#D1FAE5", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  eventText: { color: "#526070", fontSize: 13, lineHeight: 18 },
  eventTitle: { color: "#172033", fontSize: 15, fontWeight: "700", lineHeight: 20 },
  footer: { color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: "center" },
});
