import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import {
  createDemoContactScenarios,
  createDemoPharmacyOffers,
  createDemoVigencyAlerts,
} from "@/shared/testing/prototype-service-experiences";

type DemoExperienceCard = Readonly<{
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  category: string;
  title: string;
  description: string;
  sourceLabel: string;
}>;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default function PrototypeServicesScreen() {
  const cards = useMemo<readonly DemoExperienceCard[]>(
    () => [
      ...createDemoContactScenarios().map((scenario) => ({
        id: scenario.id,
        icon: (scenario.kind === "telehealth" ? "videocam" : "forum") as React.ComponentProps<typeof MaterialIcons>["name"],
        category: scenario.kind === "telehealth" ? "TELEATENDIMENTO" : "CONTATO",
        title: scenario.title,
        description: scenario.description,
        sourceLabel: scenario.source.label,
      })),
      ...createDemoPharmacyOffers().map((offer) => ({
        id: offer.id,
        icon: "local-pharmacy" as React.ComponentProps<typeof MaterialIcons>["name"],
        category: "BENEFÍCIO FARMACÊUTICO",
        title: offer.title,
        description: `${offer.pharmacyLabel}. ${offer.benefitLabel}. Vigência ilustrativa: ${formatDate(offer.validUntil)}.`,
        sourceLabel: offer.source.label,
      })),
      ...createDemoVigencyAlerts().map((alert) => ({
        id: alert.id,
        icon: "event-available" as React.ComponentProps<typeof MaterialIcons>["name"],
        category: "VIGÊNCIA E DATAS",
        title: alert.title,
        description: `${alert.message} Data ilustrativa: ${formatDate(alert.dueAt)}.`,
        sourceLabel: alert.source.label,
      })),
    ],
    [],
  );

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
              eyebrow="SERVIÇOS"
              title="Experiências para demonstrar"
              description="Veja cenários sintéticos de contato, teleatendimento, benefícios e datas. O protótipo não executa nenhuma ação externa."
            />
            <View accessibilityRole="text" style={styles.warning}>
              <MaterialIcons name="info-outline" size={20} color="#075985" />
              <Text style={styles.warningText}>Dados, ofertas e contatos são fictícios. Não há compra, reserva, mensagem, ligação, vídeo, cobertura ou atendimento real.</Text>
            </View>
            <Text style={styles.sectionTitle}>Cenários disponíveis</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}><MaterialIcons name={item.icon} size={21} color="#075985" /></View>
              <View style={styles.copy}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.footer}>
              <Text style={styles.source}>{item.sourceLabel}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver restrição demonstrativa de ${item.title}`}
                onPress={() => Alert.alert("Ação indisponível no protótipo", "Este cenário serve somente para apresentar a interface. Nenhum serviço externo será acionado.")}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>Entendi</Text>
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
  warning: { alignItems: "flex-start", backgroundColor: "#E0F2FE", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 14 },
  warningText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: "#172033", fontSize: 18, fontWeight: "800", marginBottom: 12, marginTop: 24 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 20, borderWidth: 1, gap: 12, marginBottom: 12, padding: 16 },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  iconWrap: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 38, justifyContent: "center", width: 38 },
  copy: { flex: 1, gap: 2 },
  category: { color: "#075985", fontSize: 11, fontWeight: "800", letterSpacing: 0.7 },
  title: { color: "#172033", fontSize: 16, fontWeight: "800" },
  description: { color: "#526070", fontSize: 13, lineHeight: 19 },
  footer: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  source: { color: "#526070", flex: 1, fontSize: 12, fontWeight: "700" },
  button: { borderColor: "#075985", borderRadius: 11, borderWidth: 1, minHeight: 34, justifyContent: "center", paddingHorizontal: 12 },
  buttonPressed: { backgroundColor: "#F0F9FF", opacity: 0.85 },
  buttonText: { color: "#075985", fontSize: 13, fontWeight: "800" },
});
