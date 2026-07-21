import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showUpsell } from '../lib/confirm';
import { authenticateForFolder } from '../lib/folderAuth';
import { editTodoHref, newTodoHref } from '../lib/routes';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';
import { useRecentlyCompleted } from '../lib/useRecentlyCompleted';
import { AllTodosSortBar } from './AllTodosSortBar';
import { DraggableTodoRow } from './DraggableTodoRow';
import { TodayBanner } from './TodayBanner';
import { TodoRow } from './TodoRow';

type Props = {
  folderId: string | 'all';
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  onDragStart: () => void;
  onDrop: (todoId: string, absoluteY: number) => void;
  searchQuery: string;
};

export function FolderDetailPane({ folderId, sidebarVisible, onToggleSidebar, onDragStart, onDrop, searchQuery }: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const folders = useStore((state) => state.folders);
  const todos = useStore((state) => state.todos);
  const getDescendantFolderIds = useStore((state) => state.getDescendantFolderIds);
  const attemptToggleInNow = useStore((state) => state.attemptToggleInNow);
  const showTodayBanner = useStore((state) => state.showTodayBanner);
  const sortField = useStore((state) => state.allTodosSortField);
  const setSortField = useStore((state) => state.setAllTodosSortField);
  const unlockedFolderIds = useStore((state) => state.unlockedFolderIds);
  const unlockFolder = useStore((state) => state.unlockFolder);
  const { recentlyCompletedIds, handleToggleDone } = useRecentlyCompleted();
  const [unlockDenied, setUnlockDenied] = useState(false);

  const handleToggleInNow = (id: string) => {
    const result = attemptToggleInNow(id);
    if (result === 'limit') {
      showUpsell(t('pro.upsellFocusLimit'), () => router.push('/pro'));
    } else if (result === 'monthly') {
      showUpsell(t('pro.upsellFocusMonthly'), () => router.push('/pro'));
    }
  };

  const folder = folderId !== 'all' ? folders.find((f) => f.id === folderId) : null;

  const folderNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) map.set(f.id, f.name);
    return map;
  }, [folders]);

  const folderLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) map.set(f.id, `${f.emoji} ${f.name}`);
    return map;
  }, [folders]);

  const listKindFolderIds = useMemo(() => {
    return new Set(folders.filter((f) => f.kind === 'list').map((f) => f.id));
  }, [folders]);

  const descendantFolderIds = useMemo(() => {
    if (folderId === 'all') return [];
    return getDescendantFolderIds(folderId).filter((id) => id !== folderId);
  }, [folderId, folders, getDescendantFolderIds]);

  const visibleTodos = useMemo(() => {
    const isVisible = (todo: (typeof todos)[number]) =>
      (!todo.done || recentlyCompletedIds.has(todo.id)) && !todo.deletedAt;
    let filtered: typeof todos;
    if (folderId === 'all') {
      filtered = todos.filter((todo) => isVisible(todo) && (!todo.folderId || !listKindFolderIds.has(todo.folderId)));
    } else {
      const relevantFolderIds = new Set([folderId, ...descendantFolderIds]);
      filtered = todos.filter(
        (todo) => todo.folderId !== null && relevantFolderIds.has(todo.folderId) && isVisible(todo)
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((todo) => todo.title.toLowerCase().includes(query));
    }

    if (folderId !== 'all') {
      return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return [...filtered].sort((a, b) => {
      if (sortField === 'priority') {
        if (a.priority === b.priority) return 0;
        if (a.priority === null) return 1;
        if (b.priority === null) return -1;
        return a.priority - b.priority;
      }
      if (sortField === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortField === 'folderName') {
        const aName = a.folderId ? folderNameById.get(a.folderId) ?? '' : '';
        const bName = b.folderId ? folderNameById.get(b.folderId) ?? '' : '';
        return aName.localeCompare(bName);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [todos, folderId, sortField, folderNameById, recentlyCompletedIds, searchQuery, listKindFolderIds, descendantFolderIds]);

  const directTodos = folderId !== 'all' ? visibleTodos.filter((t) => t.folderId === folderId) : [];
  const subfolderTodos = folderId !== 'all' ? visibleTodos.filter((t) => t.folderId !== folderId) : [];

  if (folderId !== 'all' && !folder) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>{t('folders.deletedNotice')}</Text>
      </View>
    );
  }

  if (folder && folder.locked && folderId !== 'all' && !unlockedFolderIds.includes(folderId)) {
    const handleUnlock = async () => {
      setUnlockDenied(false);
      const success = await authenticateForFolder(folder.name);
      if (success) {
        unlockFolder(folderId);
      } else {
        setUnlockDenied(true);
      }
    };
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 32 }}>🔒</Text>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 12 }}>
          {t('folderModal.lockedTitle', { name: folder.name })}
        </Text>
        {unlockDenied && (
          <Text style={{ color: colors.danger, fontSize: 13, marginTop: 8 }}>{t('folderModal.unlockDenied')}</Text>
        )}
        <Pressable
          onPress={handleUnlock}
          style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 9, backgroundColor: colors.accent }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{t('folderModal.unlockButton')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <Pressable hitSlop={8} onPress={onToggleSidebar} style={styles.sidebarToggle}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>{sidebarVisible ? '‹' : '›'}</Text>
        </Pressable>
        <Text style={[styles.header, { color: colors.text }]} numberOfLines={1}>
          {folderId === 'all' ? `📋 ${t('folders.allTodos')}` : `${folder?.emoji} ${folder?.name}`}
        </Text>
      </View>

      {folderId === 'all' ? (
        <>
          {showTodayBanner && <TodayBanner todos={todos} />}
          <AllTodosSortBar sortField={sortField} onChange={setSortField} />
          <FlatList
            data={visibleTodos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.textMuted }]}>{t('folders.emptyFolderState')}</Text>
            }
            renderItem={({ item }) => (
              <DraggableTodoRow
                todo={item}
                onToggle={() => handleToggleDone(item.id, item.done)}
                onToggleNow={() => handleToggleInNow(item.id)}
                onPress={() => router.push(editTodoHref(item.id))}
                folderLabel={item.folderId ? folderLabelById.get(item.folderId) : undefined}
                justCompleted={recentlyCompletedIds.has(item.id)}
                onDragStart={onDragStart}
                onDrop={(absoluteY) => onDrop(item.id, absoluteY)}
              />
            )}
            ListFooterComponent={
              <Pressable style={styles.addTaskRow} onPress={() => router.push(newTodoHref(null))}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>+ {t('folders.addTaskInline')}</Text>
              </Pressable>
            }
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {visibleTodos.length === 0 && (
            <Text style={[styles.empty, { color: colors.textMuted }]}>{t('folders.emptyFolderState')}</Text>
          )}
          {directTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onToggle={() => handleToggleDone(todo.id, todo.done)}
              onToggleNow={() => handleToggleInNow(todo.id)}
              onPress={() => router.push(editTodoHref(todo.id))}
              justCompleted={recentlyCompletedIds.has(todo.id)}
            />
          ))}
          {subfolderTodos.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('folders.fromSubfolders')}</Text>
              {subfolderTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => handleToggleDone(todo.id, todo.done)}
                  onToggleNow={() => handleToggleInNow(todo.id)}
                  onPress={() => router.push(editTodoHref(todo.id))}
                  folderLabel={todo.folderId ? folderLabelById.get(todo.folderId) : undefined}
                  justCompleted={recentlyCompletedIds.has(todo.id)}
                />
              ))}
            </>
          )}
          <Pressable style={styles.addTaskRow} onPress={() => router.push(newTodoHref(folderId))}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>+ {t('folders.addTaskInline')}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingRight: 16 },
  sidebarToggle: { paddingHorizontal: 12, paddingVertical: 16 },
  header: { fontSize: 20, fontWeight: '700', paddingVertical: 16, flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 90 },
  empty: { textAlign: 'center', marginTop: 40 },
  addTaskRow: { paddingVertical: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 14, marginBottom: 4 },
});
