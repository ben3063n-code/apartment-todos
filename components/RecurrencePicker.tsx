import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RECURRENCE_OPTIONS, type Recurrence } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: Recurrence | null;
  onChange: (value: Recurrence | null) => void;
  disabled?: boolean;
};

export function RecurrencePicker({ value, onChange, disabled }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const currentLabel = value ? t(`todo.recurrence.${value}`) : t('todo.recurrenceNone');

  return (
    <View>
      <Pressable
        style={[styles.current, { borderColor: colors.border }, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setExpanded((prev) => !prev)}
        disabled={disabled}
      >
        <Text style={{ color: value ? colors.text : colors.textMuted, fontSize: 16 }}>{currentLabel}</Text>
        <Text style={{ color: colors.textMuted }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && !disabled && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          <Pressable
            style={[styles.option, value === null && { backgroundColor: colors.surfaceAlt }]}
            onPress={() => {
              onChange(null);
              setExpanded(false);
            }}
          >
            <Text style={{ color: colors.text }}>{t('todo.recurrenceNone')}</Text>
          </Pressable>
          {RECURRENCE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              style={[styles.option, value === option && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => {
                onChange(option);
                setExpanded(false);
              }}
            >
              <Text style={{ color: colors.text }}>{t(`todo.recurrence.${option}`)}</Text>
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
