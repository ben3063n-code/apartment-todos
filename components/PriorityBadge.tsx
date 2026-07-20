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
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{t(`todo.priority.${priority}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: '700' },
});
