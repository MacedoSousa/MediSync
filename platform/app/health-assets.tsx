import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/medsync/empty-state";
import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const assetMeta = {
  exam_result: { icon: "biotech", label: "Resultado" },
  radiology_image: { icon: "image-search", label: "Imagem" },
  document: { icon: "description", label: "Documento" },
} as const;

export default function HealthAssetsScreen() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const assetsQuery = trpc.syntheticAsset.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const seedMutation = trpc.syntheticAsset.ensureDemoMine.useMutation({
    onSuccess: () => utils.syntheticAsset.listMine.invalidate(),
  });
  const assets = assetsQuery.data ?? [];

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar para minha saúde" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
              <MaterialIcons name="arrow-back" size={20} color="#075985" />
              <Text style={styles.backText}>Minha saúde</Text>
            </Pressable>
            <ScreenHeader eyebrow="Acervo protegido" title="Exames e imagens" description="Este acervo é fictício, está cifrado e foi criado exclusivamente para testar a experiência do MedSync." />
            <View style={styles.noticeCard}>
              <MaterialIcons name="science" size={21} color="#7C4A03" />
              <Text style={styles.noticeText}>Demonstração: as imagens, os documentos e os resultados desta área não correspondem a exames reais e não devem orientar decisões de saúde.</Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const meta = assetMeta[item.assetType];
          return (
            <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${meta.label.toLowerCase()} demonstrativo: ${item.title}`} onPress={() => router.push({ pathname: "/health-asset-detail", params: { id: item.id } })} style={({ pressed }) => [styles.assetCard, pressed && styles.assetCardPressed]}>
              {item.previewUrl ? <Image source={{ uri: item.previewUrl }} style={styles.preview} contentFit="cover" transition={180} /> : <View style={styles.previewFallback}><MaterialIcons name={meta.icon} size={30} color="#075985" /></View>}
              <View style={styles.assetCopy}>
                <View style={styles.assetTopline}><Text style={styles.assetType}>{meta.label}</Text><Text style={styles.demoTag}>DEMONSTRAÇÃO</Text></View>
                <Text style={styles.assetTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.assetSummary}>{item.summary}</Text>
                <Text style={styles.assetDate}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(item.occurredAt)} · {item.source.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={23} color="#526070" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          loading || assetsQuery.isLoading ? <View style={styles.loadingCard}><ActivityIndicator color="#075985" /><Text style={styles.loadingText}>Consultando o acervo protegido...</Text></View> :
          !isAuthenticated ? <EmptyState icon="lock-outline" eyebrow="Acesso protegido" title="Entre para consultar o acervo" description="Somente a conta titular pode acessar seus ativos demonstrativos protegidos." /> :
          assetsQuery.isError ? <EmptyState icon="error-outline" eyebrow="Acervo indisponível" title="Não foi possível consultar os dados agora" description="Nenhuma informação foi alterada. Tente novamente em alguns instantes." /> :
          <View style={styles.emptyWrap}><EmptyState icon="collections-bookmark" eyebrow="Demonstração opcional" title="Prepare o acervo demonstrativo" description="Crie três registros fictícios, cifrados e rotulados: resultado, imagem radiológica abstrata e documento de exame." actionLabel={seedMutation.isPending ? "Preparando dados..." : "Preparar dados demonstrativos"} onAction={() => seedMutation.mutate()} /><Text style={styles.seedError}>{seedMutation.isError ? "Não foi possível preparar os dados agora. Nenhum registro clínico foi criado." : ""}</Text></View>
        }
        ListFooterComponent={<Text style={styles.footer}>A visualização de cada item é registrada no histórico de acessos sem registrar conteúdo clínico.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  assetCard: { alignItems: "center", alignSelf: "center", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, maxWidth: 720, padding: 12, width: "100%" },
  assetCardPressed: { backgroundColor: "#F6FAFC", opacity: 0.84 },
  assetCopy: { flex: 1, gap: 4 },
  assetDate: { color: "#526070", fontSize: 12, lineHeight: 17 },
  assetSummary: { color: "#526070", fontSize: 13, lineHeight: 18 },
  assetTitle: { color: "#172033", fontSize: 15, fontWeight: "800", lineHeight: 20 },
  assetTopline: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7 },
  assetType: { color: "#075985", fontSize: 11, fontWeight: "800", letterSpacing: 0.35, textTransform: "uppercase" },
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 32, paddingTop: 18 },
  demoTag: { backgroundColor: "#E0F2FE", borderRadius: 6, color: "#075985", fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 },
  emptyWrap: { alignSelf: "center", marginTop: 26, maxWidth: 560, width: "100%" },
  footer: { alignSelf: "center", color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 20, maxWidth: 680, textAlign: "center" },
  loadingCard: { alignItems: "center", alignSelf: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 24, maxWidth: 560, padding: 24, width: "100%" },
  loadingText: { color: "#526070", fontSize: 14, lineHeight: 20, textAlign: "center" },
  noticeCard: { alignItems: "flex-start", alignSelf: "center", backgroundColor: "#FFF8E7", borderColor: "#F4C76B", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, maxWidth: 720, padding: 14, width: "100%" },
  noticeText: { color: "#7C4A03", flex: 1, fontSize: 13, lineHeight: 19 },
  preview: { backgroundColor: "#E0F2FE", borderRadius: 12, height: 76, width: 76 },
  previewFallback: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 12, height: 76, justifyContent: "center", width: 76 },
  seedError: { color: "#B42318", fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: "center" },
});
