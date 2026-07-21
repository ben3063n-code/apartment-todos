import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FolderDetailPane } from '../../components/FolderDetailPane';
import { FolderFabRow } from '../../components/FolderFabRow';
import { FolderSidebar } from '../../components/FolderSidebar';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';
import { useFolderDropZones } from '../../lib/useFolderDropZones';

export default function FoldersScreen() {
  const { colors } = useAppTheme();
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>(
    () => useStore.getState().defaultFolderId
  );
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { registerFolderRowRef, measureDropZones, handleDrop, findZoneAt } = useFolderDropZones();

  return (
    <View style={[styles.row, { backgroundColor: colors.background }]}>
      {sidebarVisible && (
        <FolderSidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCollapse={() => setSidebarVisible(false)}
          registerFolderRowRef={registerFolderRowRef}
          onMeasureZones={measureDropZones}
          findZoneAt={findZoneAt}
        />
      )}
      <FolderDetailPane
        folderId={selectedFolderId}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={() => setSidebarVisible((prev) => !prev)}
        onDragStart={measureDropZones}
        onDrop={handleDrop}
        searchQuery={searchQuery}
      />
      <FolderFabRow folderId={selectedFolderId} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
});
