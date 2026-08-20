import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import type { AssistiveSummary } from "@/shared/assistive-summary";

export default function AssistiveSummaryScreen() {
  const { isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState<AssistiveSummary>();
  const [mode, setMode] = useState<"model" | "deterministic_fallback">();
  const mutation = trpc.assistiveSummary.generateDemoMine.useMutation({
    onSuccess: (result) => {
      setSummary(result.summary);
      setMode(result.mode);
    },
  });

  const isBusy = loading || mutation.isPending;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={summary?.items ?? []}
        keyExtractor={(item) => item.recordId}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar para minha saúde" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
              <MaterialIcons name="arrow-back" size={20} color="#075985" />
              <Text style={styles.backText}>Minha saúde</Text>
            </Pressable>
            <ScreenHeader eyebrow="Apoio à organização" title="Resumo assistivo" description="Organiza registros autorizados para facilitar sua revisão; não realiza avaliação clínica." />
            <View style={styles.safetyCard}>
              <MaterialIcons name="verified-user" size={21} color="#075985" />
              <Text style={styles.safetyText}>Nesta etapa, o resumo usa somente registros fictícios. Ele não faz diagnóstico, prescrição, cálculo de dose, prognóstico ou decisão de cuidado.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir acesso de emergência ao SAMU 192"
              onPress={() => router.push("../emergency")}
              style={({ pressed }) => [styles.emergencyButton, pressed && styles.emergencyButtonPressed]}
            >
              <MaterialIcons name="emergency" size={20} color="#B42318" />
              <Text style={styles.emergencyText}>Em emergência, acesse SAMU 192</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gerar resumo assistivo dos dados de demonstração"
              disabled={!isAuthenticated || isBusy}
              onPress={() => mutation.mutate()}
              style={({ pressed }) => [styles.generateButton, (pressed || !isAuthenticated || isBusy) && styles.generateButtonPressed]}
            >
              {isBusy ? <ActivityIndicator color="#FFFFFF" /> : <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />}
              <Text style={styles.generateText}>{isBusy ? "Organizando registros..." : "Gerar resumo de demonstração"}</Text>
            </Pressable>
            {!isAuthenticated && !loading && <Text style={styles.helpText}>Entre na sua conta para gerar e auditar o resumo protegido.</Text>}
            {mutation.isError && <View style={styles.errorCard}><MaterialIcons name="error-outline" size={20} color="#B42318" /><Text style={styles.errorText}>O resumo não pôde ser gerado agora. Nenhum registro foi alterado.</Text></View>}
            {summary && <View style={styles.disclaimerCard}><Text style={styles.disclaimerText}>{summary.disclaimer}</Text><Text style={styles.modeText}>{mode === "model" ? "Resumo estruturado pelo assistente" : "Resumo determinístico de segurança"}</Text></View>}
            {summary && <Text style={styles.listTitle}>Registros organizados</Text>}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard} accessibilityLabel={`Resumo referente ao registro ${item.recordId}`}>
            <View style={styles.itemIcon}><MaterialIcons name="fact-check" size={20} color="#075985" /></View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemText}>{item.text}</Text>
              <Text style={styles.evidenceText}>Origem: {item.evidence[0]?.sourceName ?? "Origem declarada"}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={summary ? null : <View style={styles.emptyState}><MaterialIcons name="psychology-alt" size={30} color="#526070" /><Text style={styles.emptyText}>Gere um resumo para visualizar os registros demonstrativos organizados com suas respectivas origens.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 28, paddingTop: 18 },
  disclaimerCard: { backgroundColor: "#F0FDF4", borderColor: "#86EFAC", borderRadius: 16, borderWidth: 1, gap: 6, marginTop: 16, padding: 14 },
  disclaimerText: { color: "#166534", fontSize: 13, lineHeight: 19 },
  emptyState: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 22, padding: 24 },
  emptyText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  errorCard: { alignItems: "flex-start", backgroundColor: "#FEF3F2", borderColor: "#FECDCA", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 9, marginTop: 14, padding: 13 },
  errorText: { color: "#B42318", flex: 1, fontSize: 13, lineHeight: 19 },
  evidenceText: { color: "#31546A", fontSize: 12, lineHeight: 17 },
  emergencyButton: { alignItems: "center", backgroundColor: "#FFF7F6", borderColor: "#FECDCA", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 12, minHeight: 48, paddingHorizontal: 14 },
  emergencyButtonPressed: { backgroundColor: "#FEE4E2", opacity: 0.82 },
  emergencyText: { color: "#B42318", fontSize: 14, fontWeight: "800" },
  generateButton: { alignItems: "center", backgroundColor: "#075985", borderRadius: 15, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 16, minHeight: 50, paddingHorizontal: 18 },
  generateButtonPressed: { opacity: 0.68 },
  generateText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  helpText: { color: "#526070", fontSize: 13, lineHeight: 18, marginTop: 9, textAlign: "center" },
  itemCard: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 10, padding: 14 },
  itemCopy: { flex: 1, gap: 5 },
  itemIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 15, height: 34, justifyContent: "center", width: 34 },
  itemText: { color: "#172033", fontSize: 15, fontWeight: "700", lineHeight: 21 },
  listTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 22 },
  modeText: { color: "#526070", fontSize: 12, fontWeight: "700" },
  safetyCard: { alignItems: "flex-start", backgroundColor: "#E0F2FE", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  safetyText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
});
