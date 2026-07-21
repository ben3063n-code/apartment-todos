import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRIORITY_LEVELS, type Priority } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: Priority | null;
  onChange: (value: Priority | null) => void;
  locked?: boolean;
  onLockedPress?: () => void;
};

export function PriorityPicker({ value, onChange, locked, onLockedPress }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const currentColor = value ? colors.priority[value] : colors.textMuted;
  const currentLabel = value ? t(`todo.priority.${value}`) : t('todo.priorityNone');

  return (
    <View>
      <Pressable
        style={[styles.current, { borderColor: colors.border }, locked && styles.lockedField]}
        onPress={() => (locked ? onLockedPress?.() : setExpanded((prev) => !prev))}
      >
        <View style={styles.currentLabel}>
          {value && <View style={[styles.dot, { backgroundColor: currentColor }]} />}
          <Text style={{ color: value ? colors.text : colors.textMuted, fontSize: 16 }}>{currentLabel}</Text>
        </View>
        <Text style={{ color: colors.textMuted }}>{locked ? '🔒' : expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && !locked && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          <Pressable
            style={[styles.option, value === null && { backgroundColor: colors.surfaceAlt }]}
            onPress={() => {
              onChange(null);
              setExpanded(false);
            }}
          >
            <Text style={{ color: colors.text }}>{t('todo.priorityNone')}</Text>
          </Pressable>
          {PRIORITY_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[styles.option, value === level && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => {
                onChange(level);
                setExpanded(false);
              }}
            >
              <View style={styles.optionLabel}>
                <View style={[styles.dot, { backgroundColor: colors.priority[level] }]} />
                <Text style={{ color: colors.text }}>{t(`todo.priority.${level}`)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  currentLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  list: { borderWidth: 1, borderRadius: 9, marginTop: 6, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 10 },
  optionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lockedField: { opacity: 0.6 },
});
