import { Pressable, StyleSheet, Text } from 'react-native';

import { showInfo } from '../lib/confirm';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  label: string;
  infoTitle: string;
  infoBody: string;
  fontSize?: number;
};

export function SettingLabelWithInfo({ label, infoTitle, infoBody, fontSize = 15 }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={styles.row} hitSlop={4} onPress={() => showInfo(infoTitle, infoBody)}>
      <Text style={{ color: colors.text, fontSize }}>{label}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>ⓘ</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
