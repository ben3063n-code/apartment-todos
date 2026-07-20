import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateOnly, parseDateOnly } from '../lib/dateOnly';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export function DueDateField({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const [show, setShow] = useState(false);
  const date = value ? parseDateOnly(value) : new Date();

  return (
    <View style={styles.container}>
      <Pressable style={[styles.button, { borderColor: colors.border }]} onPress={() => setShow(true)}>
        <Text style={{ color: value ? colors.text : colors.textMuted }}>
          {value ? parseDateOnly(value).toLocaleDateString() : '—'}
        </Text>
      </Pressable>
      {value && (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={{ color: colors.danger }}>✕</Text>
        </Pressable>
      )}
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShow(false);
            if (event.type === 'set' && selectedDate) {
              onChange(formatDateOnly(selectedDate));
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9, minWidth: 120 },
});
