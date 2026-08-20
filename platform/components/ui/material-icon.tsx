import NativeMaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ComponentProps, useEffect, useState } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type MaterialIconProps = ComponentProps<typeof NativeMaterialIcons>;

/**
 * Mantém o primeiro HTML Web idêntico no servidor e no navegador. O pacote de
 * ícones só conhece os glifos depois de carregar a fonte no cliente; sem este
 * espaço reservado, a hidratação estática do Expo Router recria a tela inteira.
 */
export default function MaterialIcons({ size = 24, style, ...props }: MaterialIconProps) {
  const [fontCanRender, setFontCanRender] = useState(Platform.OS !== "web");

  useEffect(() => {
    if (Platform.OS === "web") {
      setFontCanRender(true);
    }
  }, []);

  if (!fontCanRender) {
    return (
      <View
        accessible={false}
        style={[styles.placeholder, { height: size, width: size }, style as unknown as StyleProp<ViewStyle>]}
      />
    );
  }

  return <NativeMaterialIcons {...props} size={size} style={style} />;
}

const styles = StyleSheet.create({
  placeholder: {
    flexShrink: 0,
  },
});
