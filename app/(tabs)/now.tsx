import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { PriorityBadge } from '../../components/PriorityBadge';
import { TodoRow } from '../../components/TodoRow';
import { formatDuration } from '../../lib/formatDuration';
import type { Priority, Todo } from '../../lib/models';
import { editTodoHref } from '../../lib/routes';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';
import { useRecentlyCompleted } from '../../lib/useRecentlyCompleted';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NowScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const todos = useStore((state) => state.todos);
  const folders = useStore((state) => state.folders);
  const toggleInNow = useStore((state) => state.toggleInNow);
  const { recentlyCompletedIds, handleToggleDone } = useRecentlyCompleted();

  const folderLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) map.set(f.id, `${f.emoji} ${f.name}`);
    return map;
  }, [folders]);

  const queue = useMemo(() => {
    return todos
      .filter(
        (todo) => todo.inNowList && (!todo.done || recentlyCompletedIds.has(todo.id)) && !todo.deletedAt
      )
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          if (a.priority === null) return 1;
          if (b.priority === null) return -1;
          return a.priority - b.priority;
        }
        if (a.dueDate !== b.dueDate) {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [todos, recentlyCompletedIds]);

  const [focus, ...rest] = queue;

  if (!focus) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t('now.emptyState')}</Text>
      </View>
    );
  }

  const focusJustCompleted = recentlyCompletedIds.has(focus.id);
  const accentColor = focus.priority ? colors.priority[focus.priority] : colors.textMuted;
  const totalMinutes = queue.reduce((sum, item) => sum + (item.estimatedMinutes ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {totalMinutes > 0 && <TimeBudgetBar queue={queue} totalMinutes={totalMinutes} />}
      <FocusCard
        title={focus.title}
        priority={focus.priority}
        accentColor={accentColor}
        justCompleted={focusJustCompleted}
        onPress={() => router.push(editTodoHref(focus.id))}
        onToggleNow={() => toggleInNow(focus.id)}
        onToggleDone={() => handleToggleDone(focus.id, focus.done)}
      />

      {queue.length > 5 && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('now.focusHint')}</Text>
      )}

      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TodoRow
            todo={item}
            onToggle={() => handleToggleDone(item.id, item.done)}
            onToggleNow={() => toggleInNow(item.id)}
            onPress={() => router.push(editTodoHref(item.id))}
            folderLabel={folderLabelById.get(item.folderId)}
            justCompleted={recentlyCompletedIds.has(item.id)}
          />
        )}
      />
    </View>
  );
}

function TimeBudgetBar({ queue, totalMinutes }: { queue: Todo[]; totalMinutes: number }) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const segments = queue.filter((todo) => todo.estimatedMinutes);
  const withoutEstimate = queue.length - segments.length;

  return (
    <View style={styles.budgetWrap}>
      <View style={styles.budgetHeaderRow}>
        <Text style={[styles.budgetTotal, { color: colors.text }]}>⏱️ {formatDuration(totalMinutes, t)}</Text>
        <Text style={[styles.budgetSubtitle, { color: colors.textMuted }]}>
          {t('now.timeBudgetSubtitle', { count: queue.length })}
        </Text>
      </View>
      <View style={[styles.budgetBar, { backgroundColor: colors.surfaceAlt }]}>
        {segments.map((todo) => (
          <View
            key={todo.id}
            style={{
              flex: todo.estimatedMinutes ?? 1,
              backgroundColor: todo.priority ? colors.priority[todo.priority] : colors.textMuted,
            }}
          />
        ))}
      </View>
      {withoutEstimate > 0 && (
        <Text style={[styles.budgetHint, { color: colors.textMuted }]}>
          {t('now.timeBudgetUnestimated', { count: withoutEstimate })}
        </Text>
      )}
    </View>
  );
}

type FocusCardProps = {
  title: string;
  priority: Priority | null;
  accentColor: string;
  justCompleted: boolean;
  onPress: () => void;
  onToggleNow: () => void;
  onToggleDone: () => void;
};

function FocusCard({ title, priority, accentColor, justCompleted, onPress, onToggleNow, onToggleDone }: FocusCardProps) {
  const { colors } = useAppTheme();
  const fadeOutDuration = useStore((state) => state.fadeOutDuration);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (justCompleted) {
      const delay = Math.min(300, fadeOutDuration * 0.25);
      fade.value = withDelay(delay, withTiming(0, { duration: fadeOutDuration - delay }));
    } else {
      fade.value = 1;
    }
  }, [justCompleted, fadeOutDuration]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const titleColor = justCompleted ? colors.accent : colors.text;

  return (
    <AnimatedPressable
      style={[styles.focusCard, { backgroundColor: colors.surfaceAlt, borderLeftColor: accentColor }, animatedStyle]}
      onPress={onPress}
    >
      <View style={styles.focusTopRow}>
        <PriorityBadge priority={priority} />
        <Pressable hitSlop={8} onPress={onToggleNow}>
          <Text style={{ color: '#f2b400', fontSize: 20 }}>★</Text>
        </Pressable>
      </View>
      <Text style={[styles.focusTitle, { color: titleColor }]}>{title}</Text>
      <Pressable style={[styles.focusDoneButton, { backgroundColor: colors.accent }]} onPress={onToggleDone}>
        <Text style={{ color: colors.accentText, fontWeight: '700', fontSize: 14 }}>✓</Text>
      </Pressable>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  focusCard: { margin: 16, padding: 16, borderRadius: 12, borderLeftWidth: 5, gap: 10 },
  focusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusTitle: { fontSize: 20, fontWeight: '700' },
  focusDoneButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9 },
  hint: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
  list: { paddingHorizontal: 16 },
  budgetWrap: { marginHorizontal: 16, marginTop: 16 },
  budgetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  budgetTotal: { fontSize: 16, fontWeight: '700' },
  budgetSubtitle: { fontSize: 12 },
  budgetBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' },
  budgetHint: { fontSize: 11, marginTop: 4, textAlign: 'right' },
});
