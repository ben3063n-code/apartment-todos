import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '../lib/formatDuration';
import { DURATION_OPTIONS } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function DurationPicker({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const currentLabel = value !== null ? formatDuration(value, t) : t('todo.estimatedTimeNone');

  return (
    <View>
      <Pressable style={[styles.current, { borderColor: colors.border }]} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={{ color: value !== null ? colors.text : colors.textMuted, fontSize: 16 }}>{currentLabel}</Text>
        <Text style={{ color: colors.textMuted }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          <Pressable
            style={[styles.option, value === null && { backgroundColor: colors.surfaceAlt }]}
            onPress={() => {
              onChange(null);
              setExpanded(false);
            }}
          >
            <Text style={{ color: colors.text }}>{t('todo.estimatedTimeNone')}</Text>
          </Pressable>
          {DURATION_OPTIONS.map((option) => (
            <Pressable
              key={option}
              style={[styles.option, value === option && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => {
                onChange(option);
                setExpanded(false);
              }}
            >
              <Text style={{ color: colors.text }}>{formatDuration(option, t)}</Text>
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
  list: { borderWidth: 1, borderRadius: 9, marginTop: 6, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 10 },
});
