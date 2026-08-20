import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import {
  createPrototypeInstitutionalJourneys,
  type PrototypeInstitutionalJourneyId,
} from "@/shared/testing/prototype-institutional-journeys";

const JOURNEY_ICONS: Record<PrototypeInstitutionalJourneyId, React.ComponentProps<typeof MaterialIcons>["name"]> = {
  schedule_queue: "event-note",
  coverage_status: "verified-user",
  digital_prescription: "description",
  hospital_capacity: "monitor-heart",
};

export default function InstitutionalDemoScreen() {
  const router = useRouter();
  const journeys = createPrototypeInstitutionalJourneys();

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={journeys}
        keyExtractor={(journey) => journey.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="PAINEL INSTITUCIONAL"
              title="Operação simulada, decisões humanas"
              description="Cenários sintéticos para explicar como filas e estados serão visualizados após integrações autorizadas."
            />
            <View style={styles.notice}>
              <MaterialIcons name="info-outline" size={20} color="#075985" />
              <Text style={styles.noticeText}>
                Nenhuma informação desta tela é uma confirmação real de agenda, cobertura, receita, vaga ou encaminhamento.
              </Text>
            </View>
          </>
        }
        renderItem={({ item: journey }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <MaterialIcons name={JOURNEY_ICONS[journey.id]} size={22} color="#075985" />
              </View>
              <View style={styles.cardTitleCopy}>
                <Text style={styles.cardTitle}>{journey.title}</Text>
                <Text style={styles.status}>{journey.status}</Text>
              </View>
            </View>
            <Text style={styles.description}>{journey.description}</Text>
            <Text style={styles.detail}>{journey.detail}</Text>
            <View style={styles.sourceRow}>
              <MaterialIcons name="science" size={15} color="#0F766E" />
              <Text style={styles.sourceText}>{journey.source.label}</Text>
            </View>
            <View style={styles.blockedBox}>
              <MaterialIcons name="block" size={17} color="#B54708" />
              <Text style={styles.blockedText}>{journey.blockedMessage}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar aos portais demonstrativos"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={19} color="#075985" />
            <Text style={styles.backText}>Voltar aos portais</Text>
          </Pressable>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingTop: 20 },
  notice: { alignItems: "flex-start", backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 22, marginBottom: 18, padding: 15 },
  noticeText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 20, borderWidth: 1, marginBottom: 13, padding: 16 },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  iconBox: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 40, justifyContent: "center", width: 40 },
  cardTitleCopy: { flex: 1, gap: 3 },
  cardTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  status: { color: "#0F766E", fontSize: 12, fontWeight: "700", lineHeight: 17 },
  description: { color: "#526070", fontSize: 13, lineHeight: 19, marginTop: 14 },
  detail: { color: "#24506A", fontSize: 13, fontWeight: "600", lineHeight: 19, marginTop: 10 },
  sourceRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 14 },
  sourceText: { color: "#0F766E", fontSize: 12, fontWeight: "800" },
  blockedBox: { alignItems: "flex-start", backgroundColor: "#FFFBEB", borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 13, padding: 11 },
  blockedText: { color: "#7A3900", flex: 1, fontSize: 12, lineHeight: 17 },
  backButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#BAE6FD", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, marginTop: 10, minHeight: 44, paddingHorizontal: 15 },
  backText: { color: "#075985", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
