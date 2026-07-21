import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { authenticateForFolder } from '../lib/folderAuth';
import { flattenVisibleFolderTree } from '../lib/folderTree';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';
import { FolderRow } from './FolderRow';

type Props = {
  selectedFolderId: string | 'all';
  onSelectFolder: (id: string | 'all') => void;
  onCollapse: () => void;
  registerFolderRowRef: (folderId: string, node: View | null) => void;
  onMeasureZones: () => void;
  findZoneAt: (absoluteY: number) => { folderId: string } | null;
};

export function FolderSidebar({
  selectedFolderId,
  onSelectFolder,
  onCollapse,
  registerFolderRowRef,
  onMeasureZones,
  findZoneAt,
}: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const folders = useStore((state) => state.folders);
  const onboardingFolderId = useStore((state) => state.onboardingFolderId);
  const reorderSiblings = useStore((state) => state.reorderSiblings);
  const isFolderUnlocked = useStore((state) => state.isFolderUnlocked);
  const unlockFolder = useStore((state) => state.unlockFolder);
  const [actionsForFolderId, setActionsForFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  const activeFolders = useMemo(() => {
    const filtered = folders.filter((f) => !f.deletedAt);
    if (!onboardingFolderId) return filtered;
    const index = filtered.findIndex((f) => f.id === onboardingFolderId);
    if (index <= 0) return filtered;
    const onboarding = filtered[index];
    return [onboarding, ...filtered.slice(0, index), ...filtered.slice(index + 1)];
  }, [folders, onboardingFolderId]);

  const visibleFolders = useMemo(
    () => flattenVisibleFolderTree(activeFolders, expandedFolderIds),
    [activeFolders, expandedFolderIds]
  );

  useEffect(() => {
    if (selectedFolderId !== 'all' && !activeFolders.some((f) => f.id === selectedFolderId)) {
      onSelectFolder('all');
    }
  }, [activeFolders, selectedFolderId, onSelectFolder]);

  const toggleExpanded = (folderId: string) => {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleReorderDrop = (folderId: string, absoluteY: number) => {
    const dragged = activeFolders.find((f) => f.id === folderId);
    if (!dragged) return;
    const hit = findZoneAt(absoluteY);
    if (!hit || hit.folderId === folderId) return;
    const target = activeFolders.find((f) => f.id === hit.folderId);
    if (!target || target.parentId !== dragged.parentId) return;

    const siblingIds = activeFolders.filter((f) => f.parentId === dragged.parentId).map((f) => f.id);
    const withoutDragged = siblingIds.filter((id) => id !== folderId);
    const targetIndex = withoutDragged.indexOf(hit.folderId);
    const newOrder = [...withoutDragged.slice(0, targetIndex), folderId, ...withoutDragged.slice(targetIndex)];
    reorderSiblings(dragged.parentId, newOrder);
  };

  const handleSelectFolder = async (folder: { id: string; name: string; locked: boolean }) => {
    setActionsForFolderId(null);
    if (folder.locked && !isFolderUnlocked(folder.id)) {
      const success = await authenticateForFolder(folder.name);
      if (!success) return;
      unlockFolder(folder.id);
    }
    onSelectFolder(folder.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          style={[styles.allRow, selectedFolderId === 'all' && { backgroundColor: colors.surfaceAlt }]}
          onPress={() => {
            setActionsForFolderId(null);
            if (selectedFolderId === 'all') {
              onCollapse();
            } else {
              onSelectFolder('all');
            }
          }}
        >
          <Text style={styles.allIcon}>📋</Text>
          <Text style={[styles.allText, { color: colors.text }]} numberOfLines={1}>
            {t('folders.allTodos')}
          </Text>
        </Pressable>

        {visibleFolders.map(({ folder, depth, hasChildren }) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            depth={depth}
            selected={selectedFolderId === folder.id}
            showActions={actionsForFolderId === folder.id}
            hasChildren={hasChildren}
            expanded={expandedFolderIds.has(folder.id)}
            onPress={() => handleSelectFolder(folder)}
            onLongPress={() => setActionsForFolderId((current) => (current === folder.id ? null : folder.id))}
            onToggleExpand={() => toggleExpanded(folder.id)}
            onEdit={() => {
              setActionsForFolderId(null);
              router.push({ pathname: '/folder/[id]', params: { id: folder.id } });
            }}
            onReorderDragStart={onMeasureZones}
            onReorderDrop={(absoluteY) => handleReorderDrop(folder.id, absoluteY)}
            registerRef={(node) => registerFolderRowRef(folder.id, node)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 140, borderRightWidth: 1 },
  scrollContent: { paddingVertical: 8, paddingHorizontal: 4 },
  allRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4 },
  allIcon: { fontSize: 13 },
  allText: { fontSize: 13, fontWeight: '700' },
});
