import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';

import { SORT_FIELDS, type SortField } from '../lib/models';
import { useAppTheme } from '../lib/useAppTheme';

type Props = {
  sortField: SortField;
  onChange: (field: SortField) => void;
};

export function AllTodosSortBar({ sortField, onChange }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.row}
    >
      {SORT_FIELDS.map((field) => {
        const active = sortField === field;
        return (
          <Pressable
            key={field}
            style={[styles.chip, active && { borderBottomColor: colors.accent }]}
            onPress={() => onChange(field)}
          >
            <Text
              style={{
                color: active ? colors.accent : colors.textMuted,
                fontSize: 11,
                fontWeight: active ? '600' : '400',
              }}
            >
              {t(`allTodos.sort.${field}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, flexShrink: 0, height: 28 },
  row: { paddingHorizontal: 16, gap: 16, paddingBottom: 6, alignItems: 'center' },
  chip: { paddingBottom: 2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
});
