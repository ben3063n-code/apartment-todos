import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { Priority } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  if (!priority) return null;
  const color = colors.priority[priority];

  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{t(`todo.priority.${priority}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 11, fontWeight: '600' },
});
