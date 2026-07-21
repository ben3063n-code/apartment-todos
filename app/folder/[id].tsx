import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { confirmDestructive } from '../../lib/confirm';
import { suggestFolderEmoji } from '../../lib/folderEmoji';
import { paramToFolderId } from '../../lib/routes';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';
import { useUndoToast } from '../../lib/undoToast';

export default function FolderModal() {
  const params = useLocalSearchParams<{ id: string; parentId?: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const folders = useStore((state) => state.folders);
  const todos = useStore((state) => state.todos);
  const addFolder = useStore((state) => state.addFolder);
  const updateFolder = useStore((state) => state.updateFolder);
  const deleteFolder = useStore((state) => state.deleteFolder);
  const restoreFolder = useStore((state) => state.restoreFolder);
  const getDescendantFolderIds = useStore((state) => state.getDescendantFolderIds);
  const { showUndo } = useUndoToast();

  const isNew = params.id === 'new';
  const existing = isNew ? undefined : folders.find((f) => f.id === params.id);
  const parentId = isNew ? paramToFolderId(params.parentId) : existing?.parentId ?? null;
  const parentName = parentId ? folders.find((f) => f.id === parentId)?.name : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? suggestFolderEmoji(''));
  const [emojiTouched, setEmojiTouched] = useState(false);

  useEffect(() => {
    if (isNew && !emojiTouched) {
      setEmoji(suggestFolderEmoji(name));
    }
  }, [name, isNew, emojiTouched]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  const handleSave = () => {
    if (!canSave) return;
    const finalEmoji = emoji.trim() || suggestFolderEmoji(name);
    if (isNew) {
      addFolder(name.trim(), parentId, finalEmoji);
    } else if (existing) {
      updateFolder(existing.id, { name: name.trim(), emoji: finalEmoji });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    const descendantIds = new Set(getDescendantFolderIds(existing.id));
    const affectedTodos = todos.filter((todo) => descendantIds.has(todo.folderId)).length;
    const subfolderCount = descendantIds.size - 1;

    confirmDestructive(
      t('folderModal.deleteConfirmTitle', { name: existing.name }),
      t('folderModal.deleteConfirmMessage', {
        subfolders: t('folderModal.subfolderCount', { count: subfolderCount }),
        todos: t('folderModal.todoCount', { count: affectedTodos }),
      }),
      t('common.delete'),
      () => {
        deleteFolder(existing.id);
        router.back();
        showUndo(t('folderModal.deletedToast', { name: existing.name }), () => restoreFolder(existing.id));
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('folderModal.parentLabel')}</Text>
      <Text style={[styles.readonlyValue, { color: colors.text }]}>
        {parentName ?? t('todo.folderTopLevelOption')}
      </Text>

      <View style={styles.row}>
        <View style={styles.emojiField}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('folderModal.emojiLabel')}</Text>
          <TextInput
            style={[styles.input, styles.emojiInput, { borderColor: colors.border, color: colors.text }]}
            value={emoji}
            onChangeText={(text) => {
              setEmoji(text);
              setEmojiTouched(true);
            }}
            maxLength={4}
          />
        </View>
        <View style={styles.nameField}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('folderModal.nameLabel')}</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t('folderModal.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: canSave ? colors.accent : colors.surfaceAlt }]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={{ color: canSave ? colors.accentText : colors.textMuted, fontWeight: '700', fontSize: 15 }}>
          {t('folderModal.save')}
        </Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>{t('folderModal.delete')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 6, flex: 1 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9, fontSize: 16 },
  readonlyValue: { fontSize: 16, paddingVertical: 4 },
  row: { flexDirection: 'row', gap: 10 },
  emojiField: { width: 70 },
  emojiInput: { textAlign: 'center', fontSize: 20, paddingVertical: 6 },
  nameField: { flex: 1 },
  saveButton: { marginTop: 28, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  deleteButton: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
});
