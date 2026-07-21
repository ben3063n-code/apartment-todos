import type { GestureResponderEvent, ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  label: string;
  iconOnly?: boolean;
  imageSource?: ImageSourcePropType;
  indicatorColor?: string;
  onPress?: ((e: GestureResponderEvent) => void) | null;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  'aria-selected'?: boolean;
  testID?: string;
};

export function TabBarButton({ label, iconOnly, imageSource, indicatorColor, onPress, onLongPress, testID, ...rest }: Props) {
  const { colors, scheme } = useAppTheme();
  const selected = rest['aria-selected'] ?? false;

  if (imageSource) {
    const tintColor = selected && indicatorColor ? indicatorColor : scheme === 'dark' ? '#ffffff' : undefined;
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} testID={testID} style={styles.wrapper}>
        <Image
          source={imageSource}
          style={[styles.logo, { opacity: selected ? 1 : 0.5 }, tintColor && { tintColor }]}
          resizeMode="contain"
        />
      </Pressable>
    );
  }

  if (iconOnly) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} testID={testID} style={styles.wrapper}>
        <Text
          style={[
            styles.icon,
            styles.iconPad,
            selected && { backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
            { opacity: selected ? 1 : 0.55 },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      style={styles.wrapper}
    >
      <Text
        style={[
          styles.pill,
          { color: selected ? colors.accentText : colors.textMuted },
          selected && { backgroundColor: colors.accent, overflow: 'hidden' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  icon: { fontSize: 20 },
  iconPad: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14 },
  logo: { width: 26, height: 26 },
});
