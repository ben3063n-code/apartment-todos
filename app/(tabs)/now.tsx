import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PriorityBadge } from '../../components/PriorityBadge';
import { TodoRow } from '../../components/TodoRow';
import { formatDuration } from '../../lib/formatDuration';
import type { Priority, Todo } from '../../lib/models';
import { editTodoHref } from '../../lib/routes';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';

export default function NowScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const todos = useStore((state) => state.todos);
  const folders = useStore((state) => state.folders);
  const toggleInNow = useStore((state) => state.toggleInNow);
  const toggleDone = useStore((state) => state.toggleDone);
  const endFocusSession = useStore((state) => state.endFocusSession);

  const folderLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) map.set(f.id, `${f.emoji} ${f.name}`);
    return map;
  }, [folders]);

  const queue = useMemo(() => {
    return todos
      .filter((todo) => todo.inNowList && !todo.deletedAt)
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [todos]);

  const activeQueue = useMemo(() => queue.filter((item) => !item.done), [queue]);
  const focus = activeQueue[0];
  const rest = queue.filter((item) => item.id !== focus?.id);

  if (queue.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t('now.emptyState')}</Text>
      </View>
    );
  }

  const accentColor = focus?.priority ? colors.priority[focus.priority] : colors.textMuted;
  const totalMinutes = activeQueue.reduce((sum, item) => sum + (item.estimatedMinutes ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.endSessionRow}>
        <Pressable style={[styles.endSessionButton, { borderColor: colors.border }]} onPress={endFocusSession}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{t('now.endSessionButton')}</Text>
        </Pressable>
      </View>

      {totalMinutes > 0 && <TimeBudgetBar queue={activeQueue} totalMinutes={totalMinutes} />}
      {focus && (
        <FocusCard
          title={focus.title}
          priority={focus.priority}
          estimatedMinutes={focus.estimatedMinutes}
          accentColor={accentColor}
          onPress={() => router.push(editTodoHref(focus.id))}
          onToggleNow={() => toggleInNow(focus.id)}
          onToggleDone={() => toggleDone(focus.id)}
        />
      )}

      {activeQueue.length > 5 && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('now.focusHint')}</Text>
      )}

      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TodoRow
            todo={item}
            onToggle={() => toggleDone(item.id)}
            onToggleNow={() => toggleInNow(item.id)}
            onPress={() => router.push(editTodoHref(item.id))}
            folderLabel={item.folderId ? folderLabelById.get(item.folderId) : undefined}
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
        {segments.map((todo, index) => {
          const noPriorityShade = index % 2 === 0 ? colors.textMuted : colors.border;
          return (
            <View
              key={todo.id}
              style={[
                {
                  flex: todo.estimatedMinutes ?? 1,
                  backgroundColor: todo.priority ? colors.priority[todo.priority] : noPriorityShade,
                },
                index < segments.length - 1 && styles.budgetSegmentDivider,
              ]}
            />
          );
        })}
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
  estimatedMinutes: number | null;
  accentColor: string;
  onPress: () => void;
  onToggleNow: () => void;
  onToggleDone: () => void;
};

function FocusCard({ title, priority, estimatedMinutes, accentColor, onPress, onToggleNow, onToggleDone }: FocusCardProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      style={[styles.focusCard, { backgroundColor: colors.surfaceAlt, borderLeftColor: accentColor }]}
      onPress={onPress}
    >
      <View style={styles.focusKickerRow}>
        <Text style={[styles.focusKicker, { color: accentColor }]}>🎯 {t('now.focusLabel')}</Text>
        <Pressable hitSlop={8} onPress={onToggleNow}>
          <Text style={{ color: '#f2b400', fontSize: 15 }}>★</Text>
        </Pressable>
      </View>
      <Text style={[styles.focusTitle, { color: colors.text }]} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.focusMetaRow}>
        <PriorityBadge priority={priority} />
        {estimatedMinutes !== null && (
          <Text style={[styles.focusDuration, { color: colors.textMuted }]}>⏱ {formatDuration(estimatedMinutes, t)}</Text>
        )}
        <Pressable style={[styles.focusDoneButton, { backgroundColor: colors.accent }]} onPress={onToggleDone}>
          <Text style={{ color: colors.accentText, fontWeight: '700', fontSize: 12 }}>✓</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  endSessionRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 10 },
  endSessionButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  focusCard: { marginHorizontal: 16, marginTop: 8, marginBottom: 4, padding: 10, borderRadius: 6, borderLeftWidth: 3, gap: 4 },
  focusKickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  focusTitle: { fontSize: 15, fontWeight: '700' },
  focusMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 },
  focusDuration: { fontSize: 11 },
  focusDoneButton: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  hint: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
  list: { paddingHorizontal: 16 },
  budgetWrap: { marginHorizontal: 16, marginTop: 12 },
  budgetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  budgetTotal: { fontSize: 16, fontWeight: '700' },
  budgetSubtitle: { fontSize: 12 },
  budgetBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' },
  budgetSegmentDivider: { marginRight: 3 },
  budgetHint: { fontSize: 11, marginTop: 4, textAlign: 'right' },
});
