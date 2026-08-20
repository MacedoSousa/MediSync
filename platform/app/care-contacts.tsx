import MaterialIcons from "@/components/ui/material-icon";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenHeader } from "@/components/medsync/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const categories = [
  { value: "family", label: "Família" },
  { value: "healthcare", label: "Profissional de saúde" },
  { value: "emergency_service", label: "Serviço de emergência" },
  { value: "other", label: "Outro" },
] as const;

type CareCategory = (typeof categories)[number]["value"];

export default function CareContactsScreen() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const contactsQuery = trpc.careContact.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const createContact = trpc.careContact.create.useMutation({
    onSuccess: async () => {
      setName("");
      setPhone("");
      setError(null);
      await utils.careContact.listMine.invalidate();
    },
  });
  const removeContact = trpc.careContact.remove.useMutation({
    onSuccess: () => utils.careContact.listMine.invalidate(),
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<CareCategory>("family");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Informe o nome e o telefone do contato.");
      return;
    }
    try {
      await createContact.mutateAsync({ name: name.trim(), phone: phone.trim(), category });
    } catch {
      setError("Não foi possível registrar este contato. Confirme os dados e tente novamente.");
    }
  }, [category, createContact, name, phone]);

  const confirmRemoval = useCallback(
    (contact: { id: string; name: string }) => {
      Alert.alert("Remover contato", `Remover ${contact.name} dos seus contatos de cuidado?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removeContact.mutate({ contactId: contact.id }),
        },
      ]);
    },
    [removeContact],
  );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={contactsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar para privacidade"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <MaterialIcons name="arrow-back" size={20} color="#075985" />
              <Text style={styles.backText}>Privacidade</Text>
            </Pressable>
            <ScreenHeader
              eyebrow="Rede de cuidado"
              title="Contatos de cuidado"
              description="Guarde contatos importantes para sua rotina. Nome e telefone são cifrados antes de serem salvos."
            />
            {!loading && !isAuthenticated ? (
              <View style={styles.notice}>
                <MaterialIcons name="lock-outline" size={22} color="#526070" />
                <Text style={styles.noticeText}>Entre na sua conta para gerenciar contatos de cuidado.</Text>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Adicionar contato</Text>
                <TextInput
                  accessibilityLabel="Nome do contato de cuidado"
                  autoCapitalize="words"
                  maxLength={160}
                  onChangeText={setName}
                  placeholder="Nome do contato"
                  placeholderTextColor="#718096"
                  style={styles.input}
                  value={name}
                />
                <TextInput
                  accessibilityLabel="Telefone do contato de cuidado"
                  keyboardType="phone-pad"
                  maxLength={32}
                  onChangeText={setPhone}
                  placeholder="Telefone com DDD"
                  placeholderTextColor="#718096"
                  returnKeyType="done"
                  style={styles.input}
                  value={phone}
                />
                <View accessibilityLabel="Categoria do contato" style={styles.categoryList}>
                  {categories.map((item) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: category === item.value }}
                      key={item.value}
                      onPress={() => setCategory(item.value)}
                      style={({ pressed }) => [styles.categoryChip, category === item.value && styles.categoryChipSelected, pressed && styles.chipPressed]}
                    >
                      <Text style={[styles.categoryText, category === item.value && styles.categoryTextSelected]}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
                {error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Salvar contato de cuidado de forma cifrada"
                  disabled={createContact.isPending}
                  onPress={handleCreate}
                  style={({ pressed }) => [styles.saveButton, (pressed || createContact.isPending) && styles.saveButtonPressed]}
                >
                  {createContact.isPending ? <ActivityIndicator color="#FFFFFF" /> : <MaterialIcons name="lock" size={18} color="#FFFFFF" />}
                  <Text style={styles.saveButtonText}>{createContact.isPending ? "Protegendo contato" : "Salvar contato"}</Text>
                </Pressable>
              </View>
            )}
            {isAuthenticated && <Text style={styles.listTitle}>Seus contatos</Text>}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <MaterialIcons name={item.category === "healthcare" ? "medical-services" : "person"} size={21} color="#075985" />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remover ${item.name}`}
              disabled={removeContact.isPending}
              onPress={() => confirmRemoval(item)}
              style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
            >
              <MaterialIcons name="delete-outline" size={21} color="#B42318" />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          isAuthenticated && (loading || contactsQuery.isLoading) ? (
            <View style={styles.emptyState}><ActivityIndicator color="#075985" /></View>
          ) : isAuthenticated ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="contact-phone" size={26} color="#526070" />
              <Text style={styles.emptyText}>Você ainda não adicionou contatos de cuidado.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={<Text style={styles.footer}>O MedSync não toma decisões de emergência nem compartilha estes contatos sem sua autorização.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 14, minHeight: 40 },
  backButtonPressed: { opacity: 0.65 },
  backText: { color: "#075985", fontSize: 15, fontWeight: "700" },
  categoryChip: { borderColor: "#B9C9D2", borderRadius: 16, borderWidth: 1, minHeight: 34, paddingHorizontal: 12, paddingVertical: 7 },
  categoryChipSelected: { backgroundColor: "#075985", borderColor: "#075985" },
  categoryList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryText: { color: "#31546A", fontSize: 13, fontWeight: "700" },
  categoryTextSelected: { color: "#FFFFFF" },
  chipPressed: { opacity: 0.75 },
  contactCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DCE8EE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 10, padding: 14 },
  contactCopy: { flex: 1, gap: 3 },
  contactIcon: { alignItems: "center", backgroundColor: "#E0F2FE", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  contactName: { color: "#172033", fontSize: 16, fontWeight: "800" },
  contactPhone: { color: "#526070", fontSize: 14 },
  content: { flexGrow: 1, paddingBottom: 28, paddingTop: 18 },
  emptyState: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 12, padding: 24 },
  emptyText: { color: "#526070", fontSize: 14, textAlign: "center" },
  errorText: { color: "#B42318", fontSize: 13, lineHeight: 18 },
  footer: { color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: "center" },
  formCard: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", borderRadius: 18, borderWidth: 1, gap: 11, marginTop: 20, padding: 16 },
  formTitle: { color: "#075985", fontSize: 16, fontWeight: "800" },
  input: { backgroundColor: "#FFFFFF", borderColor: "#B9C9D2", borderRadius: 12, borderWidth: 1, color: "#172033", fontSize: 16, minHeight: 48, paddingHorizontal: 13 },
  listTitle: { color: "#172033", fontSize: 17, fontWeight: "800", marginTop: 24 },
  notice: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE8EE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 20, padding: 16 },
  noticeText: { color: "#526070", flex: 1, fontSize: 14, lineHeight: 20 },
  removeButton: { alignItems: "center", borderRadius: 18, height: 40, justifyContent: "center", width: 40 },
  removeButtonPressed: { backgroundColor: "#FEE4E2", opacity: 0.85 },
  saveButton: { alignItems: "center", backgroundColor: "#075985", borderRadius: 12, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, paddingHorizontal: 16 },
  saveButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
