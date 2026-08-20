import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

interface SettingRowProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

function SettingRow({ icon, title, description, onPress, disabled = false }: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, disabled && styles.rowDisabled, pressed && !disabled && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={21} color={disabled ? "#94A3B8" : "#075985"} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, disabled && styles.textDisabled]}>{title}</Text>
        <Text style={[styles.rowDescription, disabled && styles.textDisabled]}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={disabled ? "#CBD5E1" : "#718096"} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isStartingSignIn, setIsStartingSignIn] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const legalLinksQuery = trpc.legalRepresentative.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleSignIn = useCallback(async () => {
    try {
      setAccountError(null);
      setIsStartingSignIn(true);
      await startOAuthLogin();
    } catch {
      setAccountError("Não foi possível iniciar o acesso seguro. Tente novamente.");
      setIsStartingSignIn(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    Alert.alert("Sessão encerrada", "O acesso desta conta foi removido deste dispositivo.");
  }, [logout]);

  const unavailableFeature = useCallback(() => {
    Alert.alert(
      "Em preparação",
      "Este controle será habilitado somente após consentimento verificável e auditoria persistente.",
    );
  }, []);

  const handleLegalRepresentative = useCallback(() => {
    Alert.alert(
      "Responsável legal",
      "O vínculo exige uma conta MedSync ativa, comprovação formal e validação administrativa. Nenhum acesso ao histórico é liberado enquanto a verificação estiver pendente.",
    );
  }, []);

  const handleAuditHistory = useCallback(() => {
    router.push("../audit");
  }, []);

  const handleCareContacts = useCallback(() => {
    router.push("../care-contacts");
  }, []);

  const handleCaregiverRoutine = useCallback(() => {
    router.push("../caregiver-routine");
  }, []);

  const displayName = user?.name?.trim() || "Sua conta";
  const verifiedLegalLink = legalLinksQuery.data?.find(
    (link) => link.status === "verified" && !link.revokedAt && link.expiresAt > new Date(),
  );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Conta e proteção"
          title="Privacidade"
          description="Você controlará quem acessa seus dados, por qual motivo e até quando."
        />

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <MaterialIcons name={isAuthenticated ? "verified-user" : "lock-outline"} size={24} color="#075985" />
          </View>
          <View style={styles.accountCopy}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#075985" size="small" />
                <Text style={styles.accountTitle}>Verificando acesso seguro</Text>
              </View>
            ) : isAuthenticated ? (
              <>
                <Text style={styles.accountEyebrow}>Conta conectada</Text>
                <Text style={styles.accountTitle}>{displayName}</Text>
                <Text style={styles.accountText}>
                  Sua sessão está vinculada a esta conta. Dados de saúde só serão exibidos após autorização.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.accountEyebrow}>Acesso protegido</Text>
                <Text style={styles.accountTitle}>Entre na sua conta individual</Text>
                <Text style={styles.accountText}>
                  Nenhum dado de saúde é exibido neste aparelho antes da autenticação segura.
                </Text>
              </>
            )}
          </View>
        </View>

        {!loading && !isAuthenticated && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar na sua conta com acesso seguro"
            disabled={isStartingSignIn}
            onPress={handleSignIn}
            style={({ pressed }) => [styles.primaryButton, (pressed || isStartingSignIn) && styles.primaryButtonPressed]}
          >
            {isStartingSignIn ? <ActivityIndicator color="#FFFFFF" /> : <MaterialIcons name="login" size={20} color="#FFFFFF" />}
            <Text style={styles.primaryButtonText}>{isStartingSignIn ? "Abrindo acesso seguro" : "Entrar na minha conta"}</Text>
          </Pressable>
        )}

        {!loading && isAuthenticated && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta neste dispositivo"
            onPress={handleLogout}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          >
            <MaterialIcons name="logout" size={20} color="#075985" />
            <Text style={styles.secondaryButtonText}>Sair desta conta</Text>
          </Pressable>
        )}

        {accountError && <Text style={styles.accountError}>{accountError}</Text>}

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <MaterialIcons name="verified-user" size={24} color="#0F766E" />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Acesso com propósito</Text>
            <Text style={styles.securityText}>
              O MedSync registra acessos autorizados e não concede permissão genérica para leitura do histórico.
            </Text>
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.legalCard}>
            <View style={styles.legalIcon}>
              <MaterialIcons name="family-restroom" size={24} color="#075985" />
            </View>
            <View style={styles.securityCopy}>
              <Text style={styles.legalTitle}>Vínculo de responsável legal</Text>
              {legalLinksQuery.isLoading ? (
                <Text style={styles.legalText}>Verificando vínculos formais...</Text>
              ) : verifiedLegalLink ? (
                <Text style={styles.legalText}>
                  Há um vínculo verificado e vigente. O acesso continua limitado aos escopos autorizados.
                </Text>
              ) : (
                <Text style={styles.legalText}>
                  Não há vínculo formal verificado. Solicitações pendentes não liberam dados de saúde.
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controles disponíveis</Text>
          <View style={styles.list}>
            <SettingRow
              icon="contact-phone"
              title="Contatos de cuidado"
              description="Registre contatos importantes com proteção de dados."
              disabled={!isAuthenticated}
              onPress={handleCareContacts}
            />
            <SettingRow
              icon="group"
              title="Pessoas autorizadas"
              description="Defina escopo e prazo para responsáveis e cuidadores."
              disabled={!isAuthenticated}
              onPress={handleLegalRepresentative}
            />
            <SettingRow
              icon="volunteer-activism"
              title="Rotina como cuidador"
              description="Consulte apenas os medicamentos que uma pessoa autorizou para você."
              disabled={!isAuthenticated}
              onPress={handleCaregiverRoutine}
            />
            <SettingRow
              icon="manage-search"
              title="Histórico de acessos"
              description="Consulte quem visualizou dados autorizados e quando."
              disabled={!isAuthenticated}
              onPress={handleAuditHistory}
            />
            <SettingRow
              icon="description"
              title="Consentimentos"
              description="Revogue compartilhamentos e consulte suas finalidades."
              disabled={!isAuthenticated}
              onPress={unavailableFeature}
            />
          </View>
        </View>
        <Text style={styles.footer}>
          Ambiente inicial de demonstração. Nenhum dado clínico real está conectado nesta versão.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    alignItems: "flex-start",
    backgroundColor: "#EAF6FB",
    borderColor: "#BFDBE8",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 24,
    padding: 18,
  },
  accountCopy: { flex: 1, gap: 4 },
  accountError: { color: "#B42318", fontSize: 14, lineHeight: 20, marginTop: 12, textAlign: "center" },
  accountEyebrow: { color: "#075985", fontSize: 12, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  accountIcon: { alignItems: "center", backgroundColor: "#D8EDF7", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  accountText: { color: "#31546A", fontSize: 14, lineHeight: 20 },
  accountTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  content: { flexGrow: 1, paddingBottom: 32, paddingTop: 20 },
  footer: { color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 22, textAlign: "center" },
  legalCard: { alignItems: "flex-start", backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 14, marginTop: 16, padding: 18 },
  legalIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  legalText: { color: "#31546A", fontSize: 14, lineHeight: 20 },
  legalTitle: { color: "#075985", fontSize: 16, fontWeight: "800" },
  list: { backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  loadingRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  primaryButton: { alignItems: "center", backgroundColor: "#075985", borderRadius: 14, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 14, minHeight: 52, paddingHorizontal: 18 },
  primaryButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  row: { alignItems: "center", borderBottomColor: "#E9EFF2", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 82, paddingHorizontal: 15, paddingVertical: 14 },
  rowCopy: { flex: 1, gap: 2 },
  rowDescription: { color: "#526070", fontSize: 13, lineHeight: 18 },
  rowDisabled: { backgroundColor: "#FAFCFD" },
  rowIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 34, justifyContent: "center", width: 34 },
  rowPressed: { backgroundColor: "#F6FAFC" },
  rowTitle: { color: "#172033", fontSize: 16, fontWeight: "700" },
  secondaryButton: { alignItems: "center", borderColor: "#A8CADC", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 14, minHeight: 52, paddingHorizontal: 18 },
  secondaryButtonPressed: { backgroundColor: "#F0F9FD", transform: [{ scale: 0.98 }] },
  secondaryButtonText: { color: "#075985", fontSize: 16, fontWeight: "800" },
  section: { marginTop: 30 },
  sectionTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginBottom: 10 },
  securityCard: { alignItems: "flex-start", backgroundColor: "#ECFDF5", borderColor: "#A7F3D0", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 14, marginTop: 22, padding: 18 },
  securityCopy: { flex: 1, gap: 4 },
  securityIcon: { alignItems: "center", backgroundColor: "#D1FAE5", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  securityText: { color: "#166534", fontSize: 14, lineHeight: 20 },
  securityTitle: { color: "#065F46", fontSize: 16, fontWeight: "800" },
  textDisabled: { color: "#94A3B8" },
});
