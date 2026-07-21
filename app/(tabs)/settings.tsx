import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { showInfo } from '../../lib/confirm';
import { LANGUAGE_NAMES } from '../../lib/i18n/languageNames';
import {
  ACCENT_COLORS,
  SUPPORTED_LANGUAGES,
  type CompletionMark,
  type Language,
  type ThemePreference,
} from '../../lib/models';
import { useStore } from '../../lib/store';
import { ACCENT_SWATCH_PREVIEW } from '../../lib/theme';
import { useAppTheme } from '../../lib/useAppTheme';

const THEME_OPTIONS: ThemePreference[] = ['light', 'dark', 'auto'];
const LANGUAGE_OPTIONS: Language[] = ['auto', ...SUPPORTED_LANGUAGES];
const COMPLETION_MARK_OPTIONS: CompletionMark[] = ['check', 'cross'];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const themePreference = useStore((state) => state.themePreference);
  const setThemePreference = useStore((state) => state.setThemePreference);
  const brightness = useStore((state) => state.brightness);
  const setBrightness = useStore((state) => state.setBrightness);
  const accentColor = useStore((state) => state.accentColor);
  const setAccentColor = useStore((state) => state.setAccentColor);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const showTodayBanner = useStore((state) => state.showTodayBanner);
  const setShowTodayBanner = useStore((state) => state.setShowTodayBanner);
  const completionMark = useStore((state) => state.completionMark);
  const setCompletionMark = useStore((state) => state.setCompletionMark);
  const fadeOutDuration = useStore((state) => state.fadeOutDuration);
  const setFadeOutDuration = useStore((state) => state.setFadeOutDuration);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.appearanceLabel')}</Text>
      <View style={[styles.segmented, { borderColor: colors.border }]}>
        {THEME_OPTIONS.map((option, index) => (
          <Pressable
            key={option}
            style={[
              styles.segment,
              index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
              themePreference === option && { backgroundColor: colors.accent },
            ]}
            onPress={() => setThemePreference(option)}
          >
            <Text
              style={[
                styles.segmentText,
                { color: themePreference === option ? colors.accentText : colors.text },
              ]}
            >
              {t(`settings.theme.${option}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.brightnessRow}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>🌙</Text>
        <Slider
          style={styles.slider}
          value={brightness}
          minimumValue={0}
          maximumValue={1}
          onValueChange={setBrightness}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>☀️</Text>
      </View>
      <Text style={[styles.brightnessLabel, { color: colors.textMuted }]}>{t('settings.brightnessLabel')}</Text>

      <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 20 }]}>
        {t('settings.accentColorLabel')}
      </Text>
      <View style={styles.swatchRow}>
        {ACCENT_COLORS.map((key) => {
          const swatch = ACCENT_SWATCH_PREVIEW[key];
          const selected = accentColor === key;
          return (
            <Pressable
              key={key}
              onPress={() => setAccentColor(key)}
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                selected && { borderColor: colors.text, borderWidth: 2 },
              ]}
            >
              {selected && <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>
        {t('settings.languageLabel')}
      </Text>
      <View style={[styles.list, { borderColor: colors.border }]}>
        {LANGUAGE_OPTIONS.map((option, index) => (
          <Pressable
            key={option}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              language === option && { backgroundColor: colors.surfaceAlt },
            ]}
            onPress={() => setLanguage(option)}
          >
            <Text style={{ color: colors.text, fontSize: 15 }}>
              {option === 'auto' ? t('settings.language.auto') : LANGUAGE_NAMES[option]}
            </Text>
            {language === option && <Text style={{ color: colors.text }}>✓</Text>}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>
        {t('settings.generalLabel')}
      </Text>
      <View style={[styles.list, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.labelWithInfo}>
            <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.showBannerLabel')}</Text>
            <Pressable
              hitSlop={8}
              onPress={() => showInfo(t('settings.bannerInfoTitle'), t('settings.bannerInfoBody'))}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>ⓘ</Text>
            </Pressable>
          </View>
          <Switch value={showTodayBanner} onValueChange={setShowTodayBanner} />
        </View>
        <View style={[styles.row, styles.rowBorder, { borderTopColor: colors.border }]}>
          <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.completionMarkLabel')}</Text>
          <View style={[styles.miniSegmented, { borderColor: colors.border }]}>
            {COMPLETION_MARK_OPTIONS.map((option, index) => (
              <Pressable
                key={option}
                style={[
                  styles.miniSegment,
                  index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
                  completionMark === option && { backgroundColor: colors.accent },
                ]}
                onPress={() => setCompletionMark(option)}
              >
                <Text style={{ color: completionMark === option ? colors.accentText : colors.text, fontSize: 15 }}>
                  {option === 'cross' ? '✕' : '✓'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={[styles.row, styles.rowBorder, { borderTopColor: colors.border }]}>
          <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.fadeOutDurationLabel')}</Text>
        </View>
        <View style={[styles.fadeSliderRow, { borderTopColor: colors.border }]}>
          <Slider
            style={styles.fadeSlider}
            value={fadeOutDuration}
            minimumValue={300}
            maximumValue={3000}
            step={100}
            onValueChange={setFadeOutDuration}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
          />
          <Text style={{ color: colors.textMuted, fontSize: 12, width: 34, textAlign: 'right' }}>
            {(fadeOutDuration / 1000).toFixed(1)}s
          </Text>
        </View>
        <Pressable style={[styles.row, styles.rowBorder, { borderTopColor: colors.border }]} onPress={() => router.push('/help')}>
          <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.helpLabel')}</Text>
          <Text style={{ color: colors.textMuted }}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  segmented: { flexDirection: 'row', borderRadius: 9, borderWidth: 1, overflow: 'hidden' },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '600' },
  brightnessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  slider: { flex: 1, height: 32 },
  brightnessLabel: { fontSize: 12, textAlign: 'center', marginTop: -4 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  list: { borderWidth: 1, borderRadius: 9, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  rowBorder: { borderTopWidth: 1 },
  miniSegmented: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  miniSegment: { paddingHorizontal: 12, paddingVertical: 6 },
  fadeSliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 11 },
  fadeSlider: { flex: 1, height: 28 },
  labelWithInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
