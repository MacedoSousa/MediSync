import MaterialIcons from "@/components/ui/material-icon";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import {
  type PrototypePortalRole,
  PROTOTYPE_PORTAL_ROLES,
  getPrototypePortal,
} from "@/shared/testing/prototype-access-portals";

const PORTAL_ICONS: Record<PrototypePortalRole, React.ComponentProps<typeof MaterialIcons>["name"]> = {
  patient: "person",
  caregiver: "volunteer-activism",
  professional: "medical-services",
  organization: "local-hospital",
  pharmacy: "local-pharmacy",
  operator: "verified-user",
  regulation: "monitor-heart",
  administration: "admin-panel-settings",
};

export default function PrototypePortalsScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<PrototypePortalRole>("patient");
  const selectedPortal = useMemo(() => getPrototypePortal(selectedRole), [selectedRole]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={PROTOTYPE_PORTAL_ROLES}
        keyExtractor={(portal) => portal.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="ACESSOS SEGREGADOS"
              title="Portais por função"
              description="Explore a separação de responsabilidades do protótipo. Todos os dados e ações desta tela são sintéticos."
            />
            <View style={styles.notice}>
              <MaterialIcons name="lock-outline" size={20} color="#075985" />
              <Text style={styles.noticeText}>
                O perfil exibido não altera sua sessão, não concede permissão real e não abre contatos ou sistemas externos.
              </Text>
            </View>
            <Text style={styles.sectionLabel}>ESCOLHA UM PORTAL DEMONSTRATIVO</Text>
          </>
        }
        renderItem={({ item: portal }) => {
          const selected = portal.id === selectedRole;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver escopo demonstrativo de ${portal.label}`}
              onPress={() => setSelectedRole(portal.id)}
              style={({ pressed }) => [styles.portalCard, selected && styles.portalCardSelected, pressed && styles.pressed]}
            >
              <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                <MaterialIcons name={PORTAL_ICONS[portal.id]} size={21} color={selected ? "#FFFFFF" : "#075985"} />
              </View>
              <View style={styles.portalCopy}>
                <Text style={styles.portalTitle}>{portal.label}</Text>
                <Text style={styles.portalDescription}>{portal.description}</Text>
              </View>
              <MaterialIcons name={selected ? "check-circle" : "chevron-right"} size={21} color={selected ? "#0F766E" : "#6B7280"} />
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.detailCard}>
            <View style={styles.detailTitleRow}>
              <View style={styles.detailIcon}>
                <MaterialIcons name={PORTAL_ICONS[selectedPortal.id]} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.detailTitleCopy}>
                <Text style={styles.detailEyebrow}>ESCOPO MÍNIMO</Text>
                <Text style={styles.detailTitle}>{selectedPortal.label}</Text>
              </View>
            </View>
            <Text style={styles.detailDescription}>{selectedPortal.description}</Text>
            <View style={styles.scopeList}>
              {selectedPortal.scope.map((scope) => (
                <View key={scope} style={styles.scopeRow}>
                  <MaterialIcons name="check" size={18} color="#0F766E" />
                  <Text style={styles.scopeText}>{scope}</Text>
                </View>
              ))}
            </View>
            <View style={styles.blockedBox}>
              <MaterialIcons name="block" size={18} color="#B54708" />
              <Text style={styles.blockedText}>{selectedPortal.blockedMessage}</Text>
            </View>
            {selectedPortal.id === "organization" || selectedPortal.id === "operator" || selectedPortal.id === "regulation" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver painel institucional demonstrativo"
                onPress={() => router.push("../institutional-demo")}
                style={({ pressed }) => [styles.institutionalButton, pressed && styles.pressed]}
              >
                <MaterialIcons name="dashboard" size={19} color="#FFFFFF" />
                <Text style={styles.institutionalButtonText}>Ver painel institucional</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar para a tela inicial"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back" size={19} color="#075985" />
              <Text style={styles.backButtonText}>Voltar ao início</Text>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingTop: 20 },
  notice: {
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    padding: 15,
  },
  noticeText: { color: "#24506A", flex: 1, fontSize: 13, lineHeight: 19 },
  sectionLabel: { color: "#526070", fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 10, marginTop: 26 },
  portalCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8EE",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    minHeight: 82,
    padding: 14,
  },
  portalCardSelected: { backgroundColor: "#F0FDFA", borderColor: "#0F766E" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  iconBox: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 16, height: 40, justifyContent: "center", width: 40 },
  iconBoxSelected: { backgroundColor: "#0F766E" },
  portalCopy: { flex: 1, gap: 3 },
  portalTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  portalDescription: { color: "#526070", fontSize: 12, lineHeight: 17 },
  detailCard: { backgroundColor: "#075985", borderRadius: 22, marginTop: 14, padding: 19 },
  detailTitleRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  detailIcon: { alignItems: "center", backgroundColor: "#0F766E", borderRadius: 17, height: 42, justifyContent: "center", width: 42 },
  detailTitleCopy: { flex: 1, gap: 2 },
  detailEyebrow: { color: "#BAE6FD", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  detailTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  detailDescription: { color: "#E0F2FE", fontSize: 14, lineHeight: 20, marginTop: 16 },
  scopeList: { gap: 9, marginTop: 17 },
  scopeRow: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
  scopeText: { color: "#FFFFFF", flex: 1, fontSize: 13, lineHeight: 19 },
  blockedBox: { alignItems: "flex-start", backgroundColor: "#FFFBEB", borderRadius: 14, flexDirection: "row", gap: 9, marginTop: 18, padding: 13 },
  blockedText: { color: "#7A3900", flex: 1, fontSize: 12, lineHeight: 18 },
  institutionalButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#0F766E", borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 14, minHeight: 42, paddingHorizontal: 14 },
  institutionalButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  backButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 18, minHeight: 42, paddingHorizontal: 14 },
  backButtonText: { color: "#075985", fontSize: 14, fontWeight: "800" },
});
