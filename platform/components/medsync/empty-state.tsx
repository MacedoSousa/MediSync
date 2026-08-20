import MaterialIcons from "@/components/ui/material-icon";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

interface EmptyStateProps {
  icon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={28} color="#075985" />
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE8EE",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 26,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  eyebrow: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 18,
    textTransform: "uppercase",
  },
  title: {
    color: "#172033",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 29,
    marginTop: 8,
    textAlign: "center",
  },
  description: {
    color: "#526070",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#075985",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
