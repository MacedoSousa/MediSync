import { Text, View, StyleSheet } from "react-native";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function ScreenHeader({ eyebrow, title, description }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  eyebrow: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#172033",
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    color: "#526070",
    fontSize: 16,
    lineHeight: 23,
  },
});
