import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import {
  createDemoServiceDirectory,
  searchDemoServiceDirectory,
  type DemoAccessibilityOption,
  type DemoServiceDirectoryFilters,
  type DemoServiceModality,
} from "@/shared/testing/demo-service-directory";

const directoryEntries = createDemoServiceDirectory();
const specialties = ["Todas", ...new Set(directoryEntries.map((entry) => entry.specialty))] as const;
const healthPlans = ["Todos", ...new Set(directoryEntries.flatMap((entry) => entry.healthPlans))] as const;
const accessibilityOptions: ReadonlyArray<{ label: string; value?: DemoAccessibilityOption }> = [
  { label: "Todas" },
  { label: "Mobilidade", value: "mobility" },
  { label: "Visual", value: "visual" },
  { label: "Auditiva", value: "hearing" },
];
const modalities: ReadonlyArray<{ label: string; value?: DemoServiceModality }> = [
  { label: "Todas" },
  { label: "Presencial", value: "in_person" },
  { label: "Teleatendimento", value: "telehealth" },
];

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filtrar por ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.chipPressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ServiceDirectoryScreen() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("Todas");
  const [modality, setModality] = useState<DemoServiceModality | undefined>();
  const [susOnly, setSusOnly] = useState(false);
  const [healthPlan, setHealthPlan] = useState("Todos");
  const [accessibility, setAccessibility] = useState<DemoAccessibilityOption | undefined>();

  const filters = useMemo<DemoServiceDirectoryFilters>(
    () => ({
      query,
      specialty: specialty === "Todas" ? undefined : specialty,
      modality,
      acceptsSus: susOnly ? true : undefined,
      healthPlan: healthPlan === "Todos" ? undefined : healthPlan,
      accessibility,
    }),
    [accessibility, healthPlan, modality, query, specialty, susOnly],
  );
  const results = useMemo(() => searchDemoServiceDirectory(filters), [filters]);

  const resetFilters = () => {
    setQuery("");
    setSpecialty("Todas");
    setModality(undefined);
    setSusOnly(false);
    setHealthPlan("Todos");
    setAccessibility(undefined);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={results}
        keyExtractor={(entry) => entry.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="DIRETÓRIO"
              title="Encontre opções para demonstrar"
              description="Pesquisa ilustrativa de profissionais e serviços. Nenhum resultado representa atendimento, vaga, cobertura ou contato real."
            />
            <View accessibilityRole="text" style={styles.demoNotice}>
              <MaterialIcons name="science" size={20} color="#075985" />
              <View style={styles.demoNoticeCopy}>
                <Text style={styles.demoNoticeTitle}>Modo de demonstração</Text>
                <Text style={styles.demoNoticeText}>Todas as fontes, horários e convênios nesta tela são fictícios.</Text>
              </View>
            </View>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={21} color="#526070" />
              <TextInput
                accessibilityLabel="Buscar por profissional, especialidade ou unidade demonstrativa"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="Buscar especialidade ou serviço"
                placeholderTextColor="#6B7280"
                returnKeyType="search"
                style={styles.searchInput}
                value={query}
              />
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Especialidade</Text>
              <View style={styles.chipRow}>{specialties.map((item) => <FilterChip key={item} label={item} selected={specialty === item} onPress={() => setSpecialty(item)} />)}</View>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Modalidade</Text>
              <View style={styles.chipRow}>{modalities.map((item) => <FilterChip key={item.label} label={item.label} selected={modality === item.value} onPress={() => setModality(item.value)} />)}</View>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Convênio informado no cenário</Text>
              <View style={styles.chipRow}>{healthPlans.map((item) => <FilterChip key={item} label={item} selected={healthPlan === item} onPress={() => setHealthPlan(item)} />)}</View>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Acessibilidade declarada no cenário</Text>
              <View style={styles.chipRow}>{accessibilityOptions.map((item) => <FilterChip key={item.label} label={item.label} selected={accessibility === item.value} onPress={() => setAccessibility(item.value)} />)}</View>
            </View>
            <View style={styles.susRow}>
              <FilterChip label="Aceita SUS (ilustrativo)" selected={susOnly} onPress={() => setSusOnly((current) => !current)} />
              <Text style={styles.resultsCount}>{results.length} {results.length === 1 ? "resultado" : "resultados"}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <MaterialIcons name="search-off" size={28} color="#526070" />
            <Text style={styles.emptyTitle}>Nenhuma opção demonstrativa encontrada</Text>
            <Text style={styles.emptyText}>Ajuste os filtros para explorar outros cenários fictícios.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar filtros do diretório" onPress={resetFilters} style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}>
              <Text style={styles.resetButtonText}>Limpar filtros</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.avatar}><MaterialIcons name="person-outline" size={22} color="#075985" /></View>
              <View style={styles.cardTitleCopy}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.specialty} · {item.facilityName}</Text>
              </View>
            </View>
            <View style={styles.metaRow}><MaterialIcons name="place" size={17} color="#526070" /><Text style={styles.metaText}>{item.municipalityLabel}</Text></View>
            <View style={styles.metaRow}><MaterialIcons name={item.modality === "telehealth" ? "videocam" : "apartment"} size={17} color="#526070" /><Text style={styles.metaText}>{item.modality === "telehealth" ? "Teleatendimento ilustrativo" : "Atendimento presencial ilustrativo"}</Text></View>
            <Text style={styles.availability}>{item.availabilityLabel}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.sourceLabel}>{item.source.label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver estado demonstrativo de ${item.name}`}
                onPress={() => Alert.alert("Ação demonstrativa", "Este protótipo não envia pedidos, não inicia chamadas e não contata estabelecimentos reais.")}
                style={({ pressed }) => [styles.detailButton, pressed && styles.detailButtonPressed]}
              >
                <Text style={styles.detailButtonText}>Ver cenário</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36, paddingTop: 20 },
  demoNotice: { alignItems: "flex-start", backgroundColor: "#E0F2FE", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  demoNoticeCopy: { flex: 1, gap: 2 },
  demoNoticeTitle: { color: "#075985", fontSize: 14, fontWeight: "800" },
  demoNoticeText: { color: "#24506A", fontSize: 13, lineHeight: 18 },
  searchContainer: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#C9DCE5", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 18, minHeight: 50, paddingHorizontal: 14 },
  searchInput: { color: "#172033", flex: 1, fontSize: 15, paddingVertical: 10 },
  filterSection: { gap: 8, marginTop: 18 },
  filterLabel: { color: "#344054", fontSize: 13, fontWeight: "800" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FFFFFF", borderColor: "#C9DCE5", borderRadius: 16, borderWidth: 1, minHeight: 34, paddingHorizontal: 12, justifyContent: "center" },
  chipSelected: { backgroundColor: "#075985", borderColor: "#075985" },
  chipPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  chipText: { color: "#344054", fontSize: 13, fontWeight: "700" },
  chipTextSelected: { color: "#FFFFFF" },
  susRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 14, marginTop: 18 },
  resultsCount: { color: "#526070", flex: 1, fontSize: 13, textAlign: "right" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 20, borderWidth: 1, gap: 10, marginBottom: 12, padding: 16 },
  cardTitleRow: { alignItems: "center", flexDirection: "row", gap: 11 },
  avatar: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 36, justifyContent: "center", width: 36 },
  cardTitleCopy: { flex: 1, gap: 2 },
  cardTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: "#526070", fontSize: 13, lineHeight: 18 },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  metaText: { color: "#526070", flex: 1, fontSize: 13, lineHeight: 18 },
  availability: { backgroundColor: "#FFFAEB", borderRadius: 11, color: "#7A5B00", fontSize: 12, lineHeight: 17, padding: 10 },
  cardFooter: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between", marginTop: 2 },
  sourceLabel: { color: "#526070", flex: 1, fontSize: 12, fontWeight: "700" },
  detailButton: { borderColor: "#075985", borderRadius: 11, borderWidth: 1, minHeight: 34, justifyContent: "center", paddingHorizontal: 12 },
  detailButtonPressed: { backgroundColor: "#F0F9FF", opacity: 0.85 },
  detailButtonText: { color: "#075985", fontSize: 13, fontWeight: "800" },
  emptyCard: { alignItems: "center", backgroundColor: "#F6FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 4, padding: 22 },
  emptyTitle: { color: "#172033", fontSize: 16, fontWeight: "800", textAlign: "center" },
  emptyText: { color: "#526070", fontSize: 13, lineHeight: 19, textAlign: "center" },
  resetButton: { backgroundColor: "#075985", borderRadius: 12, marginTop: 4, minHeight: 40, justifyContent: "center", paddingHorizontal: 14 },
  resetButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  resetButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
