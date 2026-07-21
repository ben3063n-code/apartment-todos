import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { parseDateOnly } from '../lib/dateOnly';
import type { Todo } from '../lib/models';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';
import { PriorityBadge } from './PriorityBadge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  todo: Todo;
  onToggle: () => void;
  onPress: () => void;
  onToggleNow?: () => void;
  folderLabel?: string;
  justCompleted?: boolean;
};

export function TodoRow({ todo, onToggle, onPress, onToggleNow, folderLabel, justCompleted }: Props) {
  const { colors } = useAppTheme();
  const completionMark = useStore((state) => state.completionMark);
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
    <AnimatedPressable style={[styles.row, { borderBottomColor: colors.border }, animatedStyle]} onPress={onPress}>
      <Pressable hitSlop={8} onPress={onToggle} style={styles.checkboxWrap}>
        <View
          style={[
            styles.checkbox,
            { borderColor: titleColor },
            todo.done && { backgroundColor: titleColor },
          ]}
        >
          {todo.done && (
            <Text style={[styles.checkboxMark, { color: colors.background }]}>
              {completionMark === 'cross' ? '✕' : '✓'}
            </Text>
          )}
        </View>
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>{todo.title}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={todo.priority} />
          {todo.dueDate && (
            <Text style={[styles.dueDate, { color: colors.textMuted }]}>
              {todo.recurrence ? '🔁 ' : ''}
              {parseDateOnly(todo.dueDate).toLocaleDateString()}
              {todo.dueTime ? `, ${todo.dueTime}` : ''}
            </Text>
          )}
          {folderLabel && (
            <Text style={[styles.folderLabel, { color: colors.textMuted }]}>{folderLabel}</Text>
          )}
        </View>
      </View>
      {onToggleNow && (
        <Pressable hitSlop={8} onPress={onToggleNow} style={styles.starWrap}>
          <Text style={{ fontSize: 16, color: todo.inNowList ? '#f2b400' : colors.textMuted }}>
            {todo.inNowList ? '★' : '☆'}
          </Text>
        </Pressable>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  checkboxWrap: { paddingTop: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxMark: { fontSize: 13, fontWeight: '700', lineHeight: 14 },
  content: { flex: 1, gap: 6 },
  title: { fontSize: 16 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  dueDate: { fontSize: 12 },
  folderLabel: { fontSize: 11, fontStyle: 'italic' },
  starWrap: { paddingTop: 2, paddingHorizontal: 2 },
});
