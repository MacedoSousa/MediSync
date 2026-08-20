import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge, useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const missingIosTopInset = Platform.OS === "ios" && insets.top < 24 ? 56 : 0;

  return (
    <View
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={[styles.safeArea, { paddingTop: missingIosTopInset }, style]}
      >
        <View className={cn("flex-1", className)} style={styles.content}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Mantém alvos e textos confortáveis no celular e evita linhas excessivamente longas no Web/tablet. */
  content: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 920,
    minWidth: 0,
    width: "100%",
  },
  safeArea: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
});
