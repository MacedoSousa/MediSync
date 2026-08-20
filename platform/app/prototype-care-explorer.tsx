import MaterialIcons from "@/components/ui/material-icon";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import {
  createPrototypeAppointmentRequests,
  createPrototypePharmacyCatalog,
  createPrototypeVigencyDetails,
  filterPrototypePharmacyCatalog,
  type PrototypePharmacyCategory,
} from "@/shared/testing/prototype-care-explorer";

type ExplorerSection = "agenda" | "pharmacy" | "vigency";
type PharmacyFilter = "all" | PrototypePharmacyCategory;

type ExplorerCard = Readonly<{
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  kicker: string;
  title: string;
  description: string;
  meta: string;
  blockedMessage: string;
}>;

const SECTIONS: readonly { id: ExplorerSection; label: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[] = [
  { id: "agenda", label: "Agenda", icon: "event" },
  { id: "pharmacy", label: "Farmácia", icon: "local-pharmacy" },
  { id: "vigency", label: "Vigências", icon: "event-available" },
];

const PHARMACY_FILTERS: readonly { id: PharmacyFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "medicine", label: "Rótulos de medicamento" },
  { id: "wellness", label: "Bem-estar" },
  { id: "accessibility", label: "Acessibilidade" },
];

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default function PrototypeCareExplorerScreen() {
  const [section, setSection] = useState<ExplorerSection>("agenda");
  const [pharmacyFilter, setPharmacyFilter] = useState<PharmacyFilter>("all");

  const cards = useMemo<readonly ExplorerCard[]>(() => {
    if (section === "agenda") {
      return createPrototypeAppointmentRequests().map((request) => ({
        id: request.id,
        icon: "event-note" as const,
        kicker: "SOLICITAÇÃO DE AGENDA",
        title: request.specialty,
        description: request.availabilityLabel,
        meta: request.source.label,
        blockedMessage: request.blockedMessage,
      }));
    }

    if (section === "pharmacy") {
      return filterPrototypePharmacyCatalog(createPrototypePharmacyCatalog(), pharmacyFilter).map((item) => ({
        id: item.id,
        icon: item.category === "medicine" ? "medication" : "local-pharmacy",
        kicker: item.category === "medicine" ? "RÓTULO DE MEDICAMENTO" : "CATÁLOGO ILUSTRATIVO",
        title: item.title,
        description: item.description,
        meta: `${item.pharmacyLabel} · vigência: ${formatDate(item.validUntil)}`,
        blockedMessage: item.blockedMessage,
      }));
    }

    return createPrototypeVigencyDetails().map((detail) => ({
      id: detail.id,
      icon: "event-available" as const,
      kicker: "LEMBRETE DE VIGÊNCIA",
      title: detail.title,
      description: detail.detail,
      meta: `Data ilustrativa: ${formatDate(detail.dueAt)}`,
      blockedMessage: detail.blockedMessage,
    }));
  }, [pharmacyFilter, section]);

  const currentSection = SECTIONS.find((item) => item.id === section)!;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="EXPLORADOR DEMONSTRATIVO"
              title="Agenda, catálogo e datas sem ação real"
              description="Use os filtros para conhecer os fluxos que poderão ser conectados no futuro, sempre com fonte e vigência identificadas."
            />
            <View style={styles.notice}>
              <MaterialIcons name="science" size={20} color="#075985" />
              <Text style={styles.noticeText}>Todos os itens desta tela são sintéticos. Não há compra, reserva, consulta, confirmação, dispensação, entrega ou orientação clínica.</Text>
            </View>
            <View style={styles.segmented} accessibilityRole="tablist">
              {SECTIONS.map((item) => {
                const selected = item.id === section;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Exibir ${item.label}`}
                    onPress={() => setSection(item.id)}
                    style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.pressed]}
                  >
                    <MaterialIcons name={item.icon} size={17} color={selected ? "#FFFFFF" : "#526070"} />
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {section === "pharmacy" ? (
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Filtrar o catálogo fictício</Text>
                <View style={styles.filters}>
                  {PHARMACY_FILTERS.map((filter) => {
                    const selected = filter.id === pharmacyFilter;
                    return (
                      <Pressable
                        key={filter.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setPharmacyFilter(filter.id)}
                        style={({ pressed }) => [styles.filter, selected && styles.filterSelected, pressed && styles.pressed]}
                      >
                        <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{filter.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <View style={styles.listHeading}>
              <MaterialIcons name={currentSection.icon} size={20} color="#075985" />
              <Text style={styles.listTitle}>{currentSection.label}</Text>
            </View>
          </>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum cenário sintético corresponde ao filtro selecionado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}><MaterialIcons name={item.icon} size={21} color="#075985" /></View>
              <View style={styles.cardCopy}>
                <Text style={styles.kicker}>{item.kicker}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.meta}>{item.meta}</Text>
            <View style={styles.blockedRow}>
              <MaterialIcons name="block" size={17} color="#B54708" />
              <Text style={styles.blockedText}>{item.blockedMessage}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver limitação do cenário ${item.title}`}
              onPress={() => Alert.alert("Ação bloqueada no protótipo", item.blockedMessage)}
              style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}
            >
              <Text style={styles.detailButtonText}>Ver limitação</Text>
              <MaterialIcons name="arrow-forward" size={17} color="#075985" />
            </Pressable>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36, paddingTop: 20 },
  notice: { alignItems: "flex-start", backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  noticeText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
  segmented: { backgroundColor: "#EAF1F5", borderRadius: 15, flexDirection: "row", gap: 4, marginTop: 20, padding: 4 },
  segment: { alignItems: "center", borderRadius: 11, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 40, paddingHorizontal: 6 },
  segmentSelected: { backgroundColor: "#075985" },
  segmentText: { color: "#526070", fontSize: 12, fontWeight: "800" },
  segmentTextSelected: { color: "#FFFFFF" },
  filterGroup: { marginTop: 20 },
  filterLabel: { color: "#526070", fontSize: 13, fontWeight: "800", marginBottom: 9 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 99, borderWidth: 1, minHeight: 34, justifyContent: "center", paddingHorizontal: 11 },
  filterSelected: { backgroundColor: "#E0F2FE", borderColor: "#075985" },
  filterText: { color: "#526070", fontSize: 12, fontWeight: "700" },
  filterTextSelected: { color: "#075985", fontWeight: "800" },
  listHeading: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 12, marginTop: 24 },
  listTitle: { color: "#172033", fontSize: 19, fontWeight: "800" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 20, borderWidth: 1, marginBottom: 13, padding: 16 },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  iconBox: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 40, justifyContent: "center", width: 40 },
  cardCopy: { flex: 1, gap: 3 },
  kicker: { color: "#075985", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  cardTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  description: { color: "#526070", fontSize: 13, lineHeight: 19, marginTop: 14 },
  meta: { color: "#0F766E", fontSize: 12, fontWeight: "800", lineHeight: 17, marginTop: 10 },
  blockedRow: { alignItems: "flex-start", backgroundColor: "#FFFBEB", borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 13, padding: 11 },
  blockedText: { color: "#7A3900", flex: 1, fontSize: 12, lineHeight: 17 },
  detailButton: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 6, marginTop: 14, minHeight: 32 },
  detailButtonText: { color: "#075985", fontSize: 13, fontWeight: "800" },
  emptyText: { color: "#526070", fontSize: 14, paddingVertical: 22, textAlign: "center" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
