import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PriorityBadge } from '../../components/PriorityBadge';
import { confirmDestructive } from '../../lib/confirm';
import type { CompletedSortField } from '../../lib/models';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';

type Mode = 'completed' | 'deleted';

const MODES: Mode[] = ['completed', 'deleted'];
const SORT_FIELDS: CompletedSortField[] = ['completedAt', 'createdAt'];

export default function TrashScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('deleted');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.modeRow, { borderColor: colors.border }]}>
        {MODES.map((option, index) => (
          <Pressable
            key={option}
            style={[
              styles.modeSegment,
              index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
              mode === option && { backgroundColor: colors.accent },
            ]}
            onPress={() => setMode(option)}
          >
            <Text style={{ color: mode === option ? colors.accentText : colors.text, fontWeight: '600', fontSize: 13 }}>
              {t(`trash.mode.${option}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'completed' ? <CompletedList /> : <DeletedList />}
    </View>
  );
}

function CompletedList() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const todos = useStore((state) => state.todos);
  const folders = useStore((state) => state.folders);
  const toggleDone = useStore((state) => state.toggleDone);
  const deleteTodo = useStore((state) => state.deleteTodo);
  const completionMark = useStore((state) => state.completionMark);
  const [sortField, setSortField] = useState<CompletedSortField>('completedAt');

  const folderNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const folder of folders) map.set(folder.id, folder.name);
    return map;
  }, [folders]);

  const completedTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.done && !todo.deletedAt)
      .sort((a, b) => {
        const aValue = a[sortField] ?? a.createdAt;
        const bValue = b[sortField] ?? b.createdAt;
        return bValue.localeCompare(aValue);
      });
  }, [todos, sortField]);

  return (
    <>
      <View style={styles.sortRow}>
        {SORT_FIELDS.map((field) => (
          <Pressable
            key={field}
            style={[
              styles.sortChip,
              { borderColor: colors.border },
              sortField === field && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => setSortField(field)}
          >
            <Text style={{ color: sortField === field ? colors.accentText : colors.text, fontSize: 13, fontWeight: '600' }}>
              {t(`completed.sort.${field}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={completedTodos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyState, { color: colors.textMuted }]}>{t('completed.emptyState')}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => toggleDone(item.id)}
            onLongPress={() => deleteTodo(item.id)}
          >
            <View style={[styles.checkbox, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <Text style={[styles.checkboxMark, { color: colors.accentText }]}>
                {completionMark === 'cross' ? '✕' : '✓'}
              </Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                {item.title}
              </Text>
              <View style={styles.badgeRow}>
                <PriorityBadge priority={item.priority} />
                {item.folderId && folderNameById.has(item.folderId) && (
                  <View style={[styles.folderBadge, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.folderBadgeText, { color: colors.textMuted }]}>
                      {folderNameById.get(item.folderId)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}

function DeletedList() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const folders = useStore((state) => state.folders);
  const todos = useStore((state) => state.todos);
  const restoreFolder = useStore((state) => state.restoreFolder);
  const permanentlyDeleteFolder = useStore((state) => state.permanentlyDeleteFolder);
  const restoreTodo = useStore((state) => state.restoreTodo);
  const permanentlyDeleteTodo = useStore((state) => state.permanentlyDeleteTodo);
  const emptyTrash = useStore((state) => state.emptyTrash);

  const isFolderDeleted = (folderId: string | null) =>
    !!folderId && !!folders.find((f) => f.id === folderId)?.deletedAt;

  const trashedFolders = useMemo(
    () => folders.filter((f) => f.deletedAt && !isFolderDeleted(f.parentId)),
    [folders]
  );

  const trashedTodos = useMemo(
    () => todos.filter((t) => t.deletedAt && !isFolderDeleted(t.folderId)),
    [todos, folders]
  );

  const isEmpty = trashedFolders.length === 0 && trashedTodos.length === 0;

  const handleEmptyTrash = () => {
    confirmDestructive(t('trash.emptyConfirmTitle'), t('trash.emptyConfirmMessage'), t('trash.emptyButton'), () =>
      emptyTrash()
    );
  };

  const handlePermanentDeleteFolder = (id: string, name: string) => {
    confirmDestructive(t('trash.deleteForeverConfirmTitle', { name }), undefined, t('common.delete'), () =>
      permanentlyDeleteFolder(id)
    );
  };

  const handlePermanentDeleteTodo = (id: string, title: string) => {
    confirmDestructive(t('trash.deleteForeverConfirmTitle', { name: title }), undefined, t('common.delete'), () =>
      permanentlyDeleteTodo(id)
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {!isEmpty && (
        <Pressable style={[styles.emptyTrashButton, { borderColor: colors.danger }]} onPress={handleEmptyTrash}>
          <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 13 }}>{t('trash.emptyButton')}</Text>
        </Pressable>
      )}

      {isEmpty && <Text style={[styles.emptyState, { color: colors.textMuted }]}>{t('trash.emptyState')}</Text>}

      {trashedFolders.map((folder) => (
        <View key={folder.id} style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {folder.emoji} {folder.name}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => restoreFolder(folder.id)}>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>{t('trash.restore')}</Text>
            </Pressable>
            <Pressable onPress={() => handlePermanentDeleteFolder(folder.id, folder.name)}>
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>{t('trash.deleteForever')}</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {trashedTodos.map((todo) => (
        <View key={todo.id} style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {todo.title}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => restoreTodo(todo.id)}>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>{t('trash.restore')}</Text>
            </Pressable>
            <Pressable onPress={() => handlePermanentDeleteTodo(todo.id, todo.title)}>
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>{t('trash.deleteForever')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  modeRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 9,
    overflow: 'hidden',
    margin: 16,
    marginBottom: 4,
  },
  modeSegment: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  list: { padding: 16, gap: 4 },
  emptyState: { textAlign: 'center', marginTop: 60 },
  emptyTrashButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxMark: { fontSize: 13, fontWeight: '700', lineHeight: 14 },
  rowContent: { flex: 1, gap: 6 },
  rowTitle: { flex: 1, fontSize: 15 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  folderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  folderBadgeText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 14 },
});
