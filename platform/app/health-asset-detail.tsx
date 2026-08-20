import MaterialIcons from "@/components/ui/material-icon";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function HealthAssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isAuthenticated, loading } = useAuth();
  const assetId = typeof id === "string" && uuidPattern.test(id) ? id : undefined;
  const assetQuery = trpc.syntheticAsset.getMine.useQuery({ assetId: assetId ?? "00000000-0000-4000-8000-000000000000" }, { enabled: isAuthenticated && Boolean(assetId) });
  const asset = assetQuery.data;

  return <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar para exames e imagens" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}><MaterialIcons name="arrow-back" size={20} color="#075985" /><Text style={styles.backText}>Exames e imagens</Text></Pressable>
    {loading || assetQuery.isLoading ? <View style={styles.emptyCard}><ActivityIndicator color="#075985" /><Text style={styles.emptyText}>Carregando o ativo protegido...</Text></View> : !isAuthenticated || !asset ? <View style={styles.emptyCard}><MaterialIcons name="lock-outline" size={28} color="#526070" /><Text style={styles.emptyTitle}>Ativo indisponível</Text><Text style={styles.emptyText}>O item não existe, não pertence à sua conta ou ainda não está disponível.</Text></View> : <View style={styles.body}>
      <ScreenHeader eyebrow="Demonstração protegida" title={asset.title} description="Item sintético, sem valor diagnóstico e exclusivo para teste de interface." />
      {asset.previewUrl ? <Image source={{ uri: asset.previewUrl }} style={styles.image} contentFit="cover" transition={180} accessibilityLabel="Imagem abstrata demonstrativa, sem uso clínico" /> : <View style={styles.imageFallback}><MaterialIcons name="image-not-supported" size={42} color="#075985" /></View>}
      <View style={styles.warningCard}><MaterialIcons name="warning-amber" size={22} color="#7C4A03" /><Text style={styles.warningText}>Não use esta imagem ou este texto para avaliar sintomas, tomar medicamentos ou decidir sobre atendimento. Em caso de necessidade de saúde, procure orientação profissional ou o serviço de urgência apropriado.</Text></View>
      <View style={styles.detailCard}><Text style={styles.label}>Descrição demonstrativa</Text><Text style={styles.value}>{asset.summary}</Text><Text style={styles.label}>Origem</Text><Text style={styles.value}>{asset.source.label}</Text><Text style={styles.label}>Data do registro</Text><Text style={styles.value}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(asset.occurredAt)}</Text><Text style={styles.label}>Proteção</Text><Text style={styles.value}>Item sintético, cifrado em repouso e com visualização auditável.</Text></View>
    </View>}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 }, backButtonPressed: { opacity: 0.65 }, backText: { color: "#075985", fontSize: 15, fontWeight: "700" }, body: { alignSelf: "center", maxWidth: 720, width: "100%" }, content: { flexGrow: 1, paddingBottom: 32, paddingTop: 18 }, detailCard: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 7, marginTop: 16, padding: 16 }, emptyCard: { alignItems: "center", alignSelf: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 8, marginTop: 38, maxWidth: 560, padding: 24, width: "100%" }, emptyText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" }, emptyTitle: { color: "#172033", fontSize: 17, fontWeight: "800", textAlign: "center" }, image: { backgroundColor: "#E0F2FE", borderRadius: 20, marginTop: 20, width: "100%", aspectRatio: 1 }, imageFallback: { alignItems: "center", aspectRatio: 1, backgroundColor: "#E0F2FE", borderRadius: 20, justifyContent: "center", marginTop: 20, width: "100%" }, label: { color: "#075985", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginTop: 7, textTransform: "uppercase" }, value: { color: "#31546A", fontSize: 14, lineHeight: 21 }, warningCard: { alignItems: "flex-start", backgroundColor: "#FFF8E7", borderColor: "#F4C76B", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 16, padding: 14 }, warningText: { color: "#7C4A03", flex: 1, fontSize: 13, lineHeight: 19 },
});
