import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../lib/useAppTheme';

const SECTIONS = ['folders', 'allTodos', 'now', 'priority', 'dueDatesReminders', 'recurrence', 'dragDrop'] as const;

export default function HelpScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      {SECTIONS.map((section) => (
        <View key={section} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t(`help.${section}.title`)}</Text>
          <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{t(`help.${section}.body`)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 22 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionBody: { fontSize: 14, lineHeight: 20 },
});
