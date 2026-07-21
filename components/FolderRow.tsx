import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { confirmDestructive } from '../lib/confirm';
import type { Folder } from '../lib/models';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';
import { useUndoToast } from '../lib/undoToast';

type Props = {
  folder: Folder;
  depth: number;
  selected: boolean;
  showActions: boolean;
  hasChildren: boolean;
  expanded: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleExpand: () => void;
  onEdit: () => void;
  onReorderDragStart: () => void;
  onReorderDrop: (absoluteY: number) => void;
  registerRef?: (node: View | null) => void;
};

const MOVE_THRESHOLD = 10;

export function FolderRow({
  folder,
  depth,
  selected,
  showActions,
  hasChildren,
  expanded,
  onPress,
  onLongPress,
  onToggleExpand,
  onEdit,
  onReorderDragStart,
  onReorderDrop,
  registerRef,
}: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const getDescendantFolderIds = useStore((state) => state.getDescendantFolderIds);
  const todos = useStore((state) => state.todos);
  const deleteFolder = useStore((state) => state.deleteFolder);
  const restoreFolder = useStore((state) => state.restoreFolder);
  const { showUndo } = useUndoToast();

  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const justHandledRef = useRef(false);

  const handleDragEnd = (absoluteY: number, moved: boolean) => {
    justHandledRef.current = true;
    setTimeout(() => {
      justHandledRef.current = false;
    }, 300);
    if (moved) {
      onReorderDrop(absoluteY);
    } else {
      onLongPress();
    }
  };

  const guardedOnPress = () => {
    if (justHandledRef.current) return;
    onPress();
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(onReorderDragStart)();
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      const moved = Math.abs(e.translationY) > MOVE_THRESHOLD;
      runOnJS(handleDragEnd)(e.absoluteY, moved);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 10 : 0,
    opacity: isDragging.value ? 0.85 : 1,
  }));

  const handleDelete = () => {
    const descendantIds = new Set(getDescendantFolderIds(folder.id));
    const affectedTodos = todos.filter((todo) => !!todo.folderId && descendantIds.has(todo.folderId) && !todo.deletedAt).length;
    const subfolderCount = descendantIds.size - 1;

    confirmDestructive(
      t('folderModal.deleteConfirmTitle', { name: folder.name }),
      t('folderModal.deleteConfirmMessage', {
        subfolders: t('folderModal.subfolderCount', { count: subfolderCount }),
        todos: t('folderModal.todoCount', { count: affectedTodos }),
      }),
      t('common.delete'),
      () => {
        deleteFolder(folder.id);
        showUndo(t('folderModal.deletedToast', { name: folder.name }), () => restoreFolder(folder.id));
      }
    );
  };

  return (
    <Animated.View
      ref={registerRef}
      style={[
        styles.row,
        { paddingLeft: 4 + Math.min(depth, 4) * 16 },
        selected && { backgroundColor: colors.surfaceAlt },
        animatedStyle,
      ]}
    >
      {hasChildren ? (
        <Pressable hitSlop={8} onPress={onToggleExpand} style={styles.chevronWrap}>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{expanded ? '▾' : '▸'}</Text>
        </Pressable>
      ) : (
        <View style={styles.chevronWrap} />
      )}
      <GestureDetector gesture={pan}>
        <Pressable style={styles.main} onPress={guardedOnPress}>
          <Text style={styles.icon}>{folder.emoji}</Text>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {folder.name}
          </Text>
        </Pressable>
      </GestureDetector>
      {showActions && (
        <>
          <Pressable hitSlop={8} onPress={onEdit} style={styles.action}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>✎</Text>
          </Pressable>
          <Pressable hitSlop={8} onPress={handleDelete} style={styles.action}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>✕</Text>
          </Pressable>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingRight: 6, gap: 2, borderRadius: 8, minHeight: 44 },
  chevronWrap: { width: 20, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  icon: { fontSize: 14 },
  title: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  action: { paddingHorizontal: 4, paddingVertical: 8 },
});
