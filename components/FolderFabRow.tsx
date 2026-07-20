import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { newFolderHref, newTodoHref } from '../lib/routes';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  folderId: string | 'all';
};

export function FolderFabRow({ folderId }: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const parentOrFolderId = folderId === 'all' ? null : folderId;

  return (
    <>
      <Pressable
        style={[styles.fabCircle, styles.fabLeft, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => router.push(newFolderHref(parentOrFolderId))}
      >
        <Text style={[styles.fabPlus, { color: colors.text }]}>+</Text>
      </Pressable>
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
  fabPlus: { fontSize: 26, fontWeight: '400', lineHeight: 28 },
});
