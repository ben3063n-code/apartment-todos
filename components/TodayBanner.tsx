import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { todayDateOnly } from '../lib/dateOnly';
import type { Todo } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

type Props = {
  todos: Todo[];
};

export function TodayBanner({ todos }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const dueTodayCount = useMemo(() => {
    const today = todayDateOnly();
    return todos.filter((todo) => !todo.done && todo.dueDate === today).length;
  }, [todos]);

  const quotes = t('banner.quotes', { returnObjects: true }) as string[];
  const quote = quotes[dayOfYear(new Date()) % quotes.length];

  if (dueTodayCount === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('banner.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        {t('banner.subtitle')} {dueTodayCount}
      </Text>
      <Text style={[styles.quote, { color: colors.textMuted }]}>{quote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  title: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  subtitle: { fontSize: 14, fontWeight: '600' },
  quote: { fontSize: 13, fontStyle: 'italic' },
});
