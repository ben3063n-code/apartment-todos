import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '../lib/formatDuration';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const HOURS = Array.from({ length: 9 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const HIGHLIGHT_HEIGHT = 36;

export function DurationPicker({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const hours = value !== null ? Math.floor(value / 60) : 0;
  const minutes = value !== null ? value % 60 : 0;
  const total = hours * 60 + minutes;

  const currentLabel = value !== null ? formatDuration(value, t) : t('todo.estimatedTimeNone');

  const applyHoursMinutes = (nextHours: number, nextMinutes: number) => {
    const nextTotal = nextHours * 60 + nextMinutes;
    onChange(nextTotal > 0 ? nextTotal : null);
  };

  return (
    <View>
      <Pressable style={[styles.current, { borderColor: colors.border }]} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={{ color: value !== null ? colors.text : colors.textMuted, fontSize: 16 }}>{currentLabel}</Text>
        <Text style={{ color: colors.textMuted }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.livePreview, { color: colors.accent }]}>
            {total > 0 ? formatDuration(total, t) : t('todo.estimatedTimeNone')}
          </Text>

          <Pressable
            style={[styles.noneOption, value === null && { backgroundColor: colors.surface }]}
            onPress={() => onChange(null)}
          >
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('todo.estimatedTimeNone')}</Text>
          </Pressable>

          <View style={styles.wheelWrap}>
            <View pointerEvents="none" style={[styles.highlightBand, { borderColor: colors.border, backgroundColor: colors.surface }]} />
            <View style={styles.wheelRow}>
              <View style={styles.wheelCol}>
                <Picker
                  selectedValue={hours}
                  onValueChange={(next) => applyHoursMinutes(Number(next), minutes)}
                  itemStyle={{ color: colors.text, fontSize: 20 }}
                  style={styles.wheel}
                >
                  {HOURS.map((h) => (
                    <Picker.Item key={h} label={`${h} ${t('duration.hoursUnit')}`} value={h} />
                  ))}
                </Picker>
              </View>
              <View style={styles.wheelCol}>
                <Picker
                  selectedValue={minutes}
                  onValueChange={(next) => applyHoursMinutes(hours, Number(next))}
                  itemStyle={{ color: colors.text, fontSize: 20 }}
                  style={styles.wheel}
                >
                  {MINUTES.map((m) => (
                    <Picker.Item key={m} label={`${m} ${t('duration.minutesUnit')}`} value={m} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Pressable style={[styles.doneButton, { backgroundColor: colors.accent }]} onPress={() => setExpanded(false)}>
            <Text style={{ color: colors.accentText, fontWeight: '700', fontSize: 15 }}>{t('common.done')}</Text>
          </Pressable>
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
  panel: { borderWidth: 1, borderRadius: 12, marginTop: 6, padding: 12, gap: 8 },
  livePreview: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  noneOption: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  wheelWrap: { position: 'relative' },
  highlightBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (140 - HIGHLIGHT_HEIGHT) / 2,
    height: HIGHLIGHT_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
  },
  wheelRow: { flexDirection: 'row', alignItems: 'center' },
  wheelCol: { flex: 1 },
  wheel: { width: '100%', height: 140 },
  doneButton: { borderRadius: 9, paddingVertical: 11, alignItems: 'center', marginTop: 2 },
});
