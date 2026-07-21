import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { applyBackupJson, backupFileName, buildBackupJson } from '../lib/backup';
import { confirmDestructive, showInfo } from '../lib/confirm';
import { useAppTheme } from '../lib/useAppTheme';

export function BackupControls() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const handleExport = async () => {
    const json = buildBackupJson();
    const uri = FileSystem.cacheDirectory + backupFileName();
    await FileSystem.writeAsStringAsync(uri, json);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || !result.assets?.[0]) return;
    const text = await FileSystem.readAsStringAsync(result.assets[0].uri);
    confirmDestructive(
      t('settings.importConfirmTitle'),
      t('settings.importConfirmMessage'),
      t('settings.importConfirm'),
      () => {
        const ok = applyBackupJson(text);
        if (!ok) showInfo(t('settings.importErrorTitle'), t('settings.importErrorBody'));
      }
    );
  };

  return (
    <>
      <Pressable style={styles.row} onPress={handleExport}>
        <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.exportLabel')}</Text>
      </Pressable>
      <Pressable style={[styles.row, styles.rowBorder, { borderTopColor: colors.border }]} onPress={handleImport}>
        <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.importLabel')}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  rowBorder: { borderTopWidth: 1 },
});
