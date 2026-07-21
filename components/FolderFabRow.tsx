import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { newFolderHref, newTodoHref } from '../lib/routes';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  folderId: string | 'all';
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function FolderFabRow({ folderId, searchQuery, onSearchChange }: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const parentOrFolderId = folderId === 'all' ? null : folderId;

  return (
    <>
      <Pressable
        style={[styles.fabCircle, styles.fabLeft, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => router.push(newFolderHref(parentOrFolderId))}
      >
        <Text style={[styles.fabPlus, { color: colors.text }]}>+</Text>
      </Pressable>
      {folderId === 'all' && (
        <TextInput
          style={[styles.searchBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={t('allTodos.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />
      )}
      <Pressable
        style={[styles.fabCircle, styles.fabRight, { backgroundColor: colors.accent, borderColor: colors.accent }]}
        onPress={() => router.push(newTodoHref(parentOrFolderId))}
      >
        <Text style={[styles.fabPlus, { color: colors.accentText }]}>+</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  fabCircle: {
    position: 'absolute',
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  fabLeft: { left: 16 },
  fabRight: { right: 16 },
  fabPlus: { fontSize: 26, fontWeight: '400', lineHeight: 28, marginTop: -6 },
  searchBar: {
    position: 'absolute',
    left: 84,
    right: 84,
    bottom: 22,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    zIndex: 20,
  },
});
