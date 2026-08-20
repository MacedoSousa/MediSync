import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function CaregiverRoutineScreen() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const grantsQuery = trpc.caregiver.listMine.useQuery();
  const routineQuery = trpc.medication.delegatedRoutine.useQuery(
    { patientUserId: selectedPatientId ?? 0 },
    { enabled: selectedPatientId !== null },
  );

  const activeMedicationGrants = (grantsQuery.data ?? []).filter((grant) => {
    const scopes = safeScopes(grant.scopesJson);
    return grant.caregiverUserId !== grant.patientUserId && !grant.revokedAt && grant.expiresAt > new Date() && scopes.includes("medications");
  });

  const header = (
    <View style={styles.header}>
      <View style={styles.iconWrap}><MaterialIcons name="volunteer-activism" size={23} color="#075985" /></View>
      <Text style={styles.title}>Rotina delegada</Text>
      <Text style={styles.subtitle}>Você vê somente planos de medicamento que a pessoa autorizou. Não há acesso a histórico, documentos ou outras informações de saúde.</Text>
      {selectedPatientId !== null && <Pressable accessibilityRole="button" onPress={() => setSelectedPatientId(null)} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Text style={styles.backText}>Trocar pessoa assistida</Text></Pressable>}
      {routineQuery.isLoading && <ActivityIndicator color="#075985" style={styles.loading} />}
      {routineQuery.isError && <Text style={styles.error}>O acesso não está ativo ou foi revogado. Nenhuma rotina foi exibida.</Text>}
    </View>
  );

  if (selectedPatientId !== null) {
    return (
      <ScreenContainer className="p-5">
        <FlatList
          data={routineQuery.data?.plans ?? []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          ListEmptyComponent={!routineQuery.isLoading ? <Text style={styles.empty}>Nenhum plano de demonstração disponível.</Text> : null}
          renderItem={({ item }) => <View style={styles.planCard}><Text style={styles.planName}>{item.displayName}</Text><Text style={styles.planText}>{item.instruction}</Text><Text style={styles.source}>{item.sourceLabel}</Text></View>}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-5">
      <FlatList
        data={activeMedicationGrants}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={!grantsQuery.isLoading ? <Text style={styles.empty}>Não há concessões ativas para rotina de medicamentos.</Text> : <ActivityIndicator color="#075985" />}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel="Abrir rotina autorizada" onPress={() => setSelectedPatientId(item.patientUserId)} style={({ pressed }) => [styles.grantCard, pressed && styles.pressed]}><View><Text style={styles.grantTitle}>Pessoa assistida autorizada</Text><Text style={styles.grantText}>Acesso a medicamentos até {new Intl.DateTimeFormat("pt-BR").format(new Date(item.expiresAt))}</Text></View><MaterialIcons name="chevron-right" size={25} color="#075985" /></Pressable>}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function safeScopes(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((scope): scope is string => typeof scope === "string") : [];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  backButton: { alignSelf: "flex-start", marginTop: 4, minHeight: 44, justifyContent: "center" },
  backText: { color: "#075985", fontSize: 14, fontWeight: "800" },
  content: { flexGrow: 1, gap: 12, paddingBottom: 24 },
  empty: { color: "#526070", fontSize: 15, lineHeight: 22, paddingHorizontal: 8, textAlign: "center" },
  error: { color: "#B42318", fontSize: 14, fontWeight: "700", lineHeight: 20, marginTop: 8 },
  grantCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D6E7F1", borderRadius: 16, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 78, padding: 16 },
  grantText: { color: "#526070", fontSize: 13, lineHeight: 19, marginTop: 3 },
  grantTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  header: { gap: 8, marginBottom: 16 },
  iconWrap: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  loading: { alignSelf: "flex-start", marginTop: 8 },
  planCard: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderRadius: 16, borderWidth: 1, gap: 7, padding: 16 },
  planName: { color: "#172033", fontSize: 17, fontWeight: "800" },
  planText: { color: "#31546A", fontSize: 15, lineHeight: 22 },
  pressed: { opacity: 0.7 },
  source: { color: "#0F766E", fontSize: 12, fontWeight: "800" },
  subtitle: { color: "#526070", fontSize: 15, lineHeight: 22 },
  title: { color: "#172033", fontSize: 27, fontWeight: "800" },
});
