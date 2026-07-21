import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { flattenFolderTree } from '../lib/folderTree';
import { useStore } from '../lib/store';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  allowTopLevel?: boolean;
  excludeIds?: string[];
};

export function FolderPicker({ value, onChange, allowTopLevel, excludeIds }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const folders = useStore((state) => state.folders);
  const [expanded, setExpanded] = useState(false);

  const excluded = new Set(excludeIds ?? []);
  const flatFolders = flattenFolderTree(folders.filter((f) => !f.deletedAt && !excluded.has(f.id)));
  const selected = value ? folders.find((f) => f.id === value) : null;

  return (
    <View>
      <Pressable
        style={[styles.current, { borderColor: colors.border }]}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Text style={{ color: selected ? colors.text : colors.textMuted, fontSize: 16 }} numberOfLines={1}>
          {selected ? `${selected.emoji} ${selected.name}` : allowTopLevel ? t('todo.folderTopLevelOption') : t('todo.folderPlaceholder')}
        </Text>
        <Text style={{ color: colors.textMuted }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.list, { borderColor: colors.border }]}>
          {allowTopLevel && (
            <Pressable
              style={[styles.option, value === null && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => {
                onChange(null);
                setExpanded(false);
              }}
            >
              <Text style={{ color: colors.text }}>{t('todo.folderTopLevelOption')}</Text>
            </Pressable>
          )}
          {flatFolders.map(({ folder, depth }) => (
            <Pressable
              key={folder.id}
              style={[
                styles.option,
                { paddingLeft: 14 + depth * 16 },
                value === folder.id && { backgroundColor: colors.surfaceAlt },
              ]}
              onPress={() => {
                onChange(folder.id);
                setExpanded(false);
              }}
            >
              <Text style={{ color: colors.text }} numberOfLines={1}>
                {folder.emoji} {folder.name}
              </Text>
            </Pressable>
          ))}
          {flatFolders.length === 0 && !allowTopLevel && (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>{t('todo.noFoldersHint')}</Text>
          )}
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
  emptyHint: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
});
