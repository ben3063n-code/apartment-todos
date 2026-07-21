import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { applyBackupJson, backupFileName, buildBackupJson } from '../lib/backup';
import { confirmDestructive, showInfo } from '../lib/confirm';
import { useAppTheme } from '../lib/useAppTheme';

export function BackupControls() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const json = buildBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
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
    reader.readAsText(file);
  };

  return (
    <>
      <Pressable style={styles.row} onPress={handleExport}>
        <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.exportLabel')}</Text>
      </Pressable>
      <Pressable
        style={[styles.row, styles.rowBorder, { borderTopColor: colors.border }]}
        onPress={() => inputRef.current?.click()}
      >
        <Text style={{ color: colors.text, fontSize: 15 }}>{t('settings.importLabel')}</Text>
      </Pressable>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  rowBorder: { borderTopWidth: 1 },
});
