import MaterialIcons from "@/components/ui/material-icon";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

function DisclosureBlock({ icon, title, items, tone = "blue" }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; items: readonly string[]; tone?: "blue" | "amber" }) {
  return <View style={[styles.block, tone === "amber" && styles.blockAmber]}><View style={styles.blockHeading}><MaterialIcons name={icon} size={20} color={tone === "amber" ? "#92400E" : "#075985"} /><Text style={[styles.blockTitle, tone === "amber" && styles.blockTitleAmber]}>{title}</Text></View>{items.map((item) => <View key={item} style={styles.item}><MaterialIcons name="check-circle" size={16} color={tone === "amber" ? "#B45309" : "#0F766E"} /><Text style={styles.itemText}>{item}</Text></View>)}</View>;
}

export default function AiTransparencyScreen() {
  const { isAuthenticated, loading } = useAuth();
  const status = trpc.assistiveTransparency.getMine.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.assistiveTransparency.setEnabled.useMutation({ onSuccess: () => void status.refetch() });
  const preference = status.data;
  const transparency = preference?.transparency;

  if (loading || status.isLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator size="large" color="#075985" /></ScreenContainer>;
  if (!isAuthenticated || !preference || !transparency) return <ScreenContainer className="px-5"><View style={styles.empty}><MaterialIcons name="lock-outline" size={28} color="#526070" /><Text style={styles.emptyText}>Entre na sua conta para consultar e ajustar a preferência da IA assistiva.</Text></View></ScreenContainer>;

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Pressable accessibilityRole="button" accessibilityLabel="Voltar ao resumo assistivo" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={20} color="#075985" /><Text style={styles.backText}>Resumo assistivo</Text></Pressable><ScreenHeader eyebrow="TRANSPARÊNCIA" title="Uso e limites da IA" description="Você controla se novos resumos podem ser gerados. A sua preferência pode ser alterada a qualquer momento." /><View style={styles.preference}><View style={styles.preferenceCopy}><Text style={styles.preferenceTitle}>Resumo assistivo</Text><Text style={styles.preferenceText}>{preference.enabled ? "Ativado para novos resumos." : "Desativado. Nenhum novo resumo será gerado."}</Text></View><Switch value={preference.enabled} disabled={update.isPending} onValueChange={(enabled) => update.mutate({ enabled })} trackColor={{ false: "#CBD5E1", true: "#0F766E" }} accessibilityLabel="Ativar ou desativar novos resumos assistivos" /></View><Text style={styles.preferenceHint}>{transparency.disableInstructions}</Text><DisclosureBlock icon="storage" title="Dados usados" items={transparency.dataUse} /><DisclosureBlock icon="gpp-bad" title="O que a IA não faz" items={transparency.prohibitedCapabilities} tone="amber" /><View style={styles.emergency}><MaterialIcons name="emergency" size={22} color="#B42318" /><View style={styles.emergencyCopy}><Text style={styles.emergencyTitle}>Emergência continua independente</Text><Text style={styles.emergencyText}>{transparency.emergencyFallback}</Text><Pressable onPress={() => router.push("../emergency")} style={({ pressed }) => [styles.emergencyButton, pressed && styles.pressed]}><Text style={styles.emergencyButtonText}>Abrir emergência</Text></Pressable></View></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, paddingTop: 18 }, back: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 }, backText: { color: "#075985", fontSize: 15, fontWeight: "700" }, pressed: { opacity: 0.7 },
  preference: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#0F766E", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 20, padding: 16 }, preferenceCopy: { flex: 1 }, preferenceTitle: { color: "#172033", fontSize: 16, fontWeight: "800" }, preferenceText: { color: "#526070", fontSize: 13, lineHeight: 18, marginTop: 4 }, preferenceHint: { color: "#526070", fontSize: 12, lineHeight: 18, marginTop: 8 },
  block: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 18, padding: 16 }, blockAmber: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }, blockHeading: { alignItems: "center", flexDirection: "row", gap: 9 }, blockTitle: { color: "#075985", fontSize: 16, fontWeight: "800" }, blockTitleAmber: { color: "#92400E" }, item: { alignItems: "flex-start", flexDirection: "row", gap: 8 }, itemText: { color: "#334155", flex: 1, fontSize: 13, lineHeight: 19 },
  emergency: { alignItems: "flex-start", backgroundColor: "#FFF7F6", borderColor: "#FECDCA", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 18, padding: 16 }, emergencyCopy: { flex: 1 }, emergencyTitle: { color: "#B42318", fontSize: 15, fontWeight: "800" }, emergencyText: { color: "#7A271A", fontSize: 13, lineHeight: 19, marginTop: 5 }, emergencyButton: { alignSelf: "flex-start", borderColor: "#B42318", borderRadius: 10, borderWidth: 1, marginTop: 12, paddingHorizontal: 12, paddingVertical: 9 }, emergencyButtonText: { color: "#B42318", fontSize: 13, fontWeight: "800" },
  empty: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", paddingHorizontal: 24 }, emptyText: { color: "#526070", fontSize: 14, lineHeight: 21, textAlign: "center" },
});
