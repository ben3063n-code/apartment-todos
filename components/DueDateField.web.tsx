import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export function DueDateField({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <input
        type="date"
        value={value ?? ''}
        onChange={(e: any) => {
          const raw = e.target.value;
          onChange(raw || null);
        }}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 9,
          padding: 9,
          fontSize: 15,
          color: colors.text,
          backgroundColor: colors.background,
        }}
      />
      {value && (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={{ color: colors.danger }}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
