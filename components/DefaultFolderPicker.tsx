import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { flattenFolderTree } from '../lib/folderTree';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';

export function DefaultFolderPicker() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const folders = useStore((state) => state.folders);
  const defaultFolderId = useStore((state) => state.defaultFolderId);
  const setDefaultFolderId = useStore((state) => state.setDefaultFolderId);
  const [expanded, setExpanded] = useState(false);

  const flatFolders = flattenFolderTree(folders.filter((f) => !f.deletedAt));
  const selectedFolder = defaultFolderId !== 'all' ? folders.find((f) => f.id === defaultFolderId) : null;
  const currentLabel = defaultFolderId === 'all' || !selectedFolder
    ? t('folders.allTodos')
    : `${selectedFolder.emoji} ${selectedFolder.name}`;

  return (
    <View>
      <Pressable style={[styles.current, { borderColor: colors.border }]} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={{ color: colors.text, fontSize: 15 }} numberOfLines={1}>
          {currentLabel}
        </Text>
        <Text style={{ color: colors.textMuted }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          <Pressable
            style={[styles.option, defaultFolderId === 'all' && { backgroundColor: colors.surfaceAlt }]}
            onPress={() => {
              setDefaultFolderId('all');
              setExpanded(false);
            }}
          >
            <Text style={{ color: colors.text }}>📋 {t('folders.allTodos')}</Text>
          </Pressable>
          {flatFolders.map(({ folder, depth }) => (
            <Pressable
              key={folder.id}
              style={[
                styles.option,
                { paddingLeft: 14 + depth * 16 },
                defaultFolderId === folder.id && { backgroundColor: colors.surfaceAlt },
              ]}
              onPress={() => {
                setDefaultFolderId(folder.id);
                setExpanded(false);
              }}
            >
              <Text style={{ color: colors.text }} numberOfLines={1}>
                {folder.emoji} {folder.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  list: { borderWidth: 1, borderRadius: 9, marginTop: 6, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 10 },
});
