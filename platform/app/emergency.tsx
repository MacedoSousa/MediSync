import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { buildEmergencyContingency } from "@/shared/emergency-contingency";

const contingency = buildEmergencyContingency({ aiAvailable: false, networkAvailable: false });

export default function EmergencyScreen() {
  const callEmergency = async () => {
    const available = await Linking.canOpenURL(contingency.phoneUri);
    if (available) await Linking.openURL(contingency.phoneUri);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={20} color="#7F1D1D" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <View style={styles.icon}><MaterialIcons name="emergency" size={34} color="#B42318" /></View>
        <Text style={styles.title}>Precisa de ajuda agora?</Text>
        <Text style={styles.description}>{contingency.message}</Text>
        <Text style={styles.note}>Este caminho funciona sem usar IA e não depende de uma resposta gerada. O MedSync não avalia sintomas nem substitui serviços de emergência.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Ligar para o SAMU 192" onPress={callEmergency} style={({ pressed }) => [styles.callButton, pressed && styles.callPressed]}>
          <MaterialIcons name="phone-in-talk" size={22} color="#FFFFFF" />
          <Text style={styles.callText}>Ligar para SAMU 192</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir contatos de cuidado autorizados" onPress={() => router.push("../care-contacts")} style={({ pressed }) => [styles.contactsButton, pressed && styles.pressed]}>
          <MaterialIcons name="contacts" size={20} color="#075985" />
          <Text style={styles.contactsText}>Contatos de cuidado</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "center", flexDirection: "row", gap: 7, minHeight: 44 },
  backText: { color: "#7F1D1D", fontSize: 15, fontWeight: "800" },
  callButton: { alignItems: "center", backgroundColor: "#B42318", borderRadius: 16, flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 24, minHeight: 54, paddingHorizontal: 20 },
  callPressed: { backgroundColor: "#8F1D16", transform: [{ scale: 0.98 }] },
  callText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  contactsButton: { alignItems: "center", borderColor: "#BAE6FD", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 12, minHeight: 50, paddingHorizontal: 20 },
  contactsText: { color: "#075985", fontSize: 15, fontWeight: "800" },
  content: { flex: 1, justifyContent: "center", paddingBottom: 48 },
  description: { color: "#172033", fontSize: 17, lineHeight: 25, marginTop: 18, textAlign: "center" },
  icon: { alignSelf: "center", alignItems: "center", backgroundColor: "#FEE4E2", borderRadius: 36, height: 72, justifyContent: "center", marginTop: 20, width: 72 },
  note: { color: "#526070", fontSize: 13, lineHeight: 19, marginTop: 14, textAlign: "center" },
  pressed: { opacity: 0.7 },
  title: { color: "#7F1D1D", fontSize: 27, fontWeight: "900", marginTop: 22, textAlign: "center" },
});
