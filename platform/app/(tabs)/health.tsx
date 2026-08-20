import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { SYNTHETIC_DATA_NOTICE, createSyntheticHealthScenario } from "@/shared/testing/synthetic-health-fixtures";
import { buildTimelineView, provenanceLabel } from "@/shared/timeline-view";

const categoryIcon = {
  consultation: "medical-services",
  document: "description",
  exam: "biotech",
  medication: "medication",
} as const;

const categoryLabel = {
  consultation: "Consulta",
  document: "Documento",
  exam: "Exame",
  medication: "Medicamento",
} as const;

export default function HealthScreen() {
  const scenario = createSyntheticHealthScenario();
  const timeline = buildTimelineView(scenario.timeline);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        contentContainerStyle={styles.content}
        data={timeline}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="Seu registro"
              title="Minha saúde"
              description="Visualize somente dados com origem e autorização identificadas."
            />
            <View style={styles.noticeCard}>
              <MaterialIcons name="science" size={21} color="#075985" />
              <Text style={styles.noticeText}>{SYNTHETIC_DATA_NOTICE}</Text>
            </View>
            <View style={styles.trustCard}>
              <Text style={styles.trustTitle}>Como seus dados aparecem aqui</Text>
              <Text style={styles.trustText}>
                Cada registro mostra data e origem. Nesta etapa, nenhuma informação é histórico clínico confirmado ou substitui uma consulta.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir acesso de emergência ao SAMU 192"
              onPress={() => router.push("../emergency")}
              style={({ pressed }) => [styles.emergencyLink, pressed && styles.emergencyLinkPressed]}
            >
              <View style={styles.emergencyLinkIcon}><MaterialIcons name="emergency" size={21} color="#B42318" /></View>
              <View style={styles.assetLinkCopy}>
                <Text style={styles.emergencyLinkTitle}>Emergência</Text>
                <Text style={styles.assetLinkText}>Acesso direto ao SAMU 192, sem depender da IA.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#B42318" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir resumo assistivo de dados demonstrativos"
              onPress={() => router.push("../assistive-summary")}
              style={({ pressed }) => [styles.assistantLink, pressed && styles.assetLinkPressed]}
            >
              <View style={styles.assistantLinkIcon}><MaterialIcons name="auto-awesome" size={21} color="#6D28D9" /></View>
              <View style={styles.assetLinkCopy}>
                <Text style={styles.assetLinkTitle}>Resumo assistivo</Text>
                <Text style={styles.assetLinkText}>Organize registros demonstrativos com origem explícita, sem diagnóstico ou prescrição.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#6D28D9" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir acervo demonstrativo de exames e imagens"
              onPress={() => router.push("../health-assets")}
              style={({ pressed }) => [styles.assetLink, pressed && styles.assetLinkPressed]}
            >
              <View style={styles.assetLinkIcon}><MaterialIcons name="collections-bookmark" size={21} color="#075985" /></View>
              <View style={styles.assetLinkCopy}>
                <Text style={styles.assetLinkTitle}>Exames e imagens demonstrativos</Text>
                <Text style={styles.assetLinkText}>Consulte resultados, documentos e imagens fictícias para teste da experiência.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#075985" />
            </Pressable>
            <Text style={styles.listTitle}>Linha do tempo</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.title}. ${provenanceLabel(item.provenance)}`}
            onPress={() => router.push({ pathname: "../health-entry", params: { id: item.id } })}
            style={({ pressed }) => [styles.timelineCard, pressed && styles.timelineCardPressed]}
          >
            <View style={styles.timelineIcon}>
              <MaterialIcons name={categoryIcon[item.category]} size={21} color="#075985" />
            </View>
            <View style={styles.timelineCopy}>
              <View style={styles.entryTopline}>
                <Text style={styles.category}>{categoryLabel[item.category]}</Text>
                {item.isSynthetic && <Text style={styles.demoTag}>DEMONSTRAÇÃO</Text>}
              </View>
              <Text style={styles.entryTitle}>{item.title}</Text>
              <Text style={styles.entryMeta}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.occurredAt))}</Text>
              <Text style={styles.provenance}>{provenanceLabel(item.provenance)}</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={<Text style={styles.footer}>Quando fontes autorizadas forem conectadas, cada evento continuará exibindo sua origem, data de registro e status de autorização.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingTop: 20,
  },
  category: { color: "#075985", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  assistantLink: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDD6FE", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, padding: 14 },
  assistantLinkIcon: { alignItems: "center", backgroundColor: "#EDE9FE", borderRadius: 15, height: 36, justifyContent: "center", width: 36 },
  assetLink: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#BAE6FD", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, padding: 14 },
  assetLinkPressed: { backgroundColor: "#F0F9FF", opacity: 0.82 },
  assetLinkCopy: { flex: 1, gap: 3 },
  assetLinkIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 15, height: 36, justifyContent: "center", width: 36 },
  assetLinkText: { color: "#31546A", fontSize: 13, lineHeight: 18 },
  assetLinkTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  demoTag: { backgroundColor: "#E0F2FE", borderRadius: 6, color: "#075985", fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 },
  emergencyLink: { alignItems: "center", backgroundColor: "#FFF7F6", borderColor: "#FECDCA", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, padding: 14 },
  emergencyLinkIcon: { alignItems: "center", backgroundColor: "#FEE4E2", borderRadius: 15, height: 36, justifyContent: "center", width: 36 },
  emergencyLinkPressed: { backgroundColor: "#FEE4E2", opacity: 0.82 },
  emergencyLinkTitle: { color: "#7F1D1D", fontSize: 15, fontWeight: "800" },
  entryMeta: { color: "#526070", fontSize: 13 },
  entryTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  entryTopline: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  footer: { color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: "center" },
  listTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 24 },
  noticeCard: { alignItems: "flex-start", backgroundColor: "#FFF8E7", borderColor: "#F4C76B", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  noticeText: { color: "#7C4A03", flex: 1, fontSize: 13, lineHeight: 19 },
  provenance: { color: "#31546A", fontSize: 13, lineHeight: 18 },
  timelineCard: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 13, marginTop: 11, padding: 15 },
  timelineCardPressed: { backgroundColor: "#F6FAFC", opacity: 0.85 },
  timelineCopy: { flex: 1, gap: 5 },
  timelineIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  trustCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 18,
    gap: 6,
    marginTop: 22,
    padding: 18,
  },
  trustTitle: {
    color: "#075985",
    fontSize: 16,
    fontWeight: "800",
  },
  trustText: {
    color: "#24506A",
    fontSize: 14,
    lineHeight: 20,
  },
});
