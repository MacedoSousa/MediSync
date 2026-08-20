import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";

interface CareActionProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  description: string;
  onPress: () => void;
}

function CareAction({ icon, title, description, onPress }: CareActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
    >
      <View style={styles.actionIcon}>
        <MaterialIcons name={icon} size={23} color="#075985" />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={20} color="#075985" />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="MedSync"
          title="Cuidado conectado, no seu ritmo"
          description="Organize sua saúde com dados autorizados, fontes identificadas e controle de acesso."
        />
        <View style={styles.setupCard}>
          <View style={styles.setupHeading}>
            <View style={styles.setupIcon}>
              <MaterialIcons name="shield" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.setupCopy}>
              <Text style={styles.setupLabel}>PRIMEIROS PASSOS</Text>
              <Text style={styles.setupTitle}>Seu espaço começa protegido</Text>
            </View>
          </View>
          <Text style={styles.setupText}>
            Este ambiente inicial não exibe dados clínicos reais. A conexão de informações só será feita com origem identificada e sua autorização.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Conhecer os controles de privacidade"
            onPress={() => router.push("./profile")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>Conhecer a privacidade</Text>
            <MaterialIcons name="arrow-forward" size={19} color="#075985" />
          </Pressable>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Organize seu cuidado</Text>
          <Text style={styles.sectionDescription}>Escolha uma área para entender como ela funcionará.</Text>
        </View>
        <View style={styles.actions}>
          <CareAction
            icon="fact-check"
            title="Histórico de saúde"
            description="Consultas, exames e documentos com origem clara."
            onPress={() => router.push("./health")}
          />
          <CareAction
            icon="medication"
            title="Medicamentos"
            description="Rotina, registros e alertas com limites seguros."
            onPress={() => router.push("./medications")}
          />
          <CareAction
            icon="event"
            title="Consultas e agenda"
            description="Solicitações transparentes e confirmação pela instituição."
            onPress={() => router.push("./agenda")}
          />
        </View>
        <View style={styles.note}>
          <MaterialIcons name="info-outline" size={18} color="#075985" />
          <Text style={styles.noteText}>O MedSync não realiza diagnóstico, prescrição, triagem ou decisão de encaminhamento.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingTop: 20,
  },
  setupCard: {
    backgroundColor: "#075985",
    borderRadius: 26,
    marginTop: 24,
    overflow: "hidden",
    padding: 22,
  },
  setupHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  setupIcon: {
    alignItems: "center",
    backgroundColor: "#0F766E",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  setupCopy: {
    flex: 1,
    gap: 2,
  },
  setupLabel: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  setupTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  setupText: {
    color: "#E0F2FE",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 17,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: "#075985",
    fontSize: 15,
    fontWeight: "800",
  },
  sectionHeader: {
    gap: 4,
    marginTop: 30,
  },
  sectionTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#526070",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 14,
  },
  actionCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8EE",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    minHeight: 88,
    padding: 15,
  },
  actionCardPressed: {
    backgroundColor: "#F6FAFC",
    transform: [{ scale: 0.99 }],
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 17,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "800",
  },
  actionDescription: {
    color: "#526070",
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    padding: 15,
  },
  noteText: {
    color: "#24506A",
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
