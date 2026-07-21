import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { editTodoHref } from '../lib/routes';
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
  const folders = useStore((state) => state.folders);
  const todos = useStore((state) => state.todos);
  const toggleInNow = useStore((state) => state.toggleInNow);
  const showTodayBanner = useStore((state) => state.showTodayBanner);
  const sortField = useStore((state) => state.allTodosSortField);
  const setSortField = useStore((state) => state.setAllTodosSortField);
  const { recentlyCompletedIds, handleToggleDone } = useRecentlyCompleted();

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

  const visibleTodos = useMemo(() => {
    const isVisible = (todo: (typeof todos)[number]) =>
      (!todo.done || recentlyCompletedIds.has(todo.id)) && !todo.deletedAt;
    let filtered =
      folderId === 'all'
        ? todos.filter((todo) => isVisible(todo) && !listKindFolderIds.has(todo.folderId))
        : todos.filter((todo) => todo.folderId === folderId && isVisible(todo));

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
        const aName = folderNameById.get(a.folderId) ?? '';
        const bName = folderNameById.get(b.folderId) ?? '';
        return aName.localeCompare(bName);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [todos, folderId, sortField, folderNameById, recentlyCompletedIds, searchQuery, listKindFolderIds]);

  if (folderId !== 'all' && !folder) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>{t('folders.deletedNotice')}</Text>
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
            contentContainerStyle={styles.scrollContent}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.textMuted }]}>{t('folders.emptyFolderState')}</Text>
            }
            renderItem={({ item }) => (
              <DraggableTodoRow
                todo={item}
                onToggle={() => handleToggleDone(item.id, item.done)}
                onToggleNow={() => toggleInNow(item.id)}
                onPress={() => router.push(editTodoHref(item.id))}
                folderLabel={folderLabelById.get(item.folderId)}
                justCompleted={recentlyCompletedIds.has(item.id)}
                onDragStart={onDragStart}
                onDrop={(absoluteY) => onDrop(item.id, absoluteY)}
              />
            )}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {visibleTodos.length === 0 && (
            <Text style={[styles.empty, { color: colors.textMuted }]}>{t('folders.emptyFolderState')}</Text>
          )}
          {visibleTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onToggle={() => handleToggleDone(todo.id, todo.done)}
              onToggleNow={() => toggleInNow(todo.id)}
              onPress={() => router.push(editTodoHref(todo.id))}
              justCompleted={recentlyCompletedIds.has(todo.id)}
            />
          ))}
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
});
