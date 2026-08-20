import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { getSyntheticHealthRecordDetail } from "@/shared/health-record-detail";
import { SYNTHETIC_DATA_NOTICE, createSyntheticHealthScenario } from "@/shared/testing/synthetic-health-fixtures";
import { provenanceLabel } from "@/shared/timeline-view";

export default function HealthEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const scenario = createSyntheticHealthScenario();
  const record = typeof id === "string" ? getSyntheticHealthRecordDetail(scenario, scenario.patient.id, id) : undefined;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar para minha saúde" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <MaterialIcons name="arrow-back" size={20} color="#075985" />
          <Text style={styles.backText}>Minha saúde</Text>
        </Pressable>
        {!record ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="lock-outline" size={28} color="#526070" />
            <Text style={styles.emptyTitle}>Registro indisponível</Text>
            <Text style={styles.emptyText}>O registro não existe, não pertence a esta conta demonstrativa ou ainda não foi autorizado.</Text>
          </View>
        ) : (
          <>
            <ScreenHeader eyebrow="Detalhe protegido" title={record.title} description="Origem e disponibilidade são mostradas antes de qualquer conteúdo." />
            <View style={styles.noticeCard}>
              <MaterialIcons name="science" size={21} color="#075985" />
              <Text style={styles.noticeText}>{SYNTHETIC_DATA_NOTICE}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.label}>Origem</Text>
              <Text style={styles.value}>{provenanceLabel(record.provenance)}</Text>
              <Text style={styles.label}>Resumo</Text>
              <Text style={styles.value}>{record.summary}</Text>
            </View>
            <Text style={styles.sectionTitle}>Anexos</Text>
            {record.attachments.length === 0 ? (
              <Text style={styles.muted}>Não há anexos associados a este registro de demonstração.</Text>
            ) : record.attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentCard}>
                <MaterialIcons name="picture-as-pdf" size={22} color="#B45309" />
                <View style={styles.attachmentCopy}>
                  <Text style={styles.attachmentTitle}>{attachment.title}</Text>
                  <Text style={styles.attachmentText}>Fonte não conectada. O arquivo não pode ser aberto nesta demonstração.</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  attachmentCard: { alignItems: "flex-start", backgroundColor: "#FFF8E7", borderColor: "#F4C76B", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 10, padding: 15 },
  attachmentCopy: { flex: 1, gap: 4 },
  attachmentText: { color: "#7C4A03", fontSize: 13, lineHeight: 19 },
  attachmentTitle: { color: "#7C4A03", fontSize: 15, fontWeight: "800" },
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 30, paddingTop: 18 },
  detailCard: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 7, marginTop: 16, padding: 16 },
  emptyCard: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 38, padding: 24 },
  emptyText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  emptyTitle: { color: "#172033", fontSize: 17, fontWeight: "800" },
  label: { color: "#075985", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginTop: 7, textTransform: "uppercase" },
  muted: { color: "#526070", fontSize: 14, lineHeight: 20 },
  noticeCard: { alignItems: "flex-start", backgroundColor: "#FFF8E7", borderColor: "#F4C76B", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  noticeText: { color: "#7C4A03", flex: 1, fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 24 },
  value: { color: "#31546A", fontSize: 14, lineHeight: 20 },
});
