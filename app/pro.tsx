import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';

const BENEFITS = ['folders', 'focus', 'priorities', 'reminders', 'colors'] as const;

export default function ProScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const isPro = useStore((state) => state.isPro);
  const setIsPro = useStore((state) => state.setIsPro);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('pro.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('pro.subtitle')}</Text>

      <View style={[styles.list, { borderColor: colors.border }]}>
        {BENEFITS.map((key, index) => (
          <View
            key={key}
            style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
          >
            <Text style={{ color: colors.accent, fontSize: 15 }}>✓</Text>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{t(`pro.benefit.${key}`)}</Text>
          </View>
        ))}
      </View>

      {isPro ? (
        <View style={[styles.unlockedBadge, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('pro.unlockedLabel')}</Text>
        </View>
      ) : (
        <>
          <Pressable style={[styles.unlockButton, { backgroundColor: colors.accent }]} onPress={() => setIsPro(true)}>
            <Text style={{ color: colors.accentText, fontWeight: '700', fontSize: 15 }}>{t('pro.unlockButton')}</Text>
          </Pressable>
          <Text style={[styles.placeholderNote, { color: colors.textMuted }]}>{t('pro.placeholderNote')}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  list: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  unlockButton: { marginTop: 12, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  unlockedBadge: { marginTop: 12, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  placeholderNote: { fontSize: 12, marginTop: 8, textAlign: 'center' },
});
