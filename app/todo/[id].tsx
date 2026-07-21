import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { DueDateField } from '../../components/DueDateField';
import { DurationPicker } from '../../components/DurationPicker';
import { FolderPicker } from '../../components/FolderPicker';
import { PriorityPicker } from '../../components/PriorityPicker';
import { RecurrencePicker } from '../../components/RecurrencePicker';
import { confirmDestructive, showUpsell } from '../../lib/confirm';
import type { Priority, Recurrence } from '../../lib/models';
import { cancelReminder, ensureNotificationPermission, scheduleReminder } from '../../lib/notifications';
import { paramToFolderId } from '../../lib/routes';
import { useStore } from '../../lib/store';
import { useAppTheme } from '../../lib/useAppTheme';
import { useUndoToast } from '../../lib/undoToast';

export default function TodoModal() {
  const params = useLocalSearchParams<{ id: string; folderId?: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const todos = useStore((state) => state.todos);
  const addTodo = useStore((state) => state.addTodo);
  const updateTodo = useStore((state) => state.updateTodo);
  const deleteTodo = useStore((state) => state.deleteTodo);
  const restoreTodo = useStore((state) => state.restoreTodo);
  const isPro = useStore((state) => state.isPro);
  const { showUndo } = useUndoToast();

  const isNew = params.id === 'new';
  const existing = isNew ? undefined : todos.find((t) => t.id === params.id);
  const initialFolderId = isNew ? paramToFolderId(params.folderId) : existing?.folderId ?? null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const [priority, setPriority] = useState<Priority | null>(existing?.priority ?? null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(existing?.estimatedMinutes ?? null);
  const [dueDate, setDueDate] = useState<string | null>(existing?.dueDate ?? null);
  const [dueTime, setDueTime] = useState<string | null>(existing?.dueTime ?? null);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(existing?.recurrence ?? null);
  const [reminderEnabled, setReminderEnabled] = useState(existing?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(existing?.reminderTime ?? '09:00');
  const [reminderDenied, setReminderDenied] = useState(false);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const handleToggleReminder = async (next: boolean) => {
    if (!dueDate || !isPro) return;
    if (!next) {
      setReminderEnabled(false);
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      setReminderDenied(true);
      return;
    }
    setReminderDenied(false);
    setReminderEnabled(true);
    if (dueTime) setReminderTime(dueTime);
  };

  const handleSave = async () => {
    if (!canSave) return;

    if (existing?.notificationId) cancelReminder(existing.notificationId);

    const willSchedule = reminderEnabled && !!dueDate;
    const notificationId = willSchedule
      ? await scheduleReminder({ title: title.trim(), dueDate: dueDate!, reminderTime })
      : null;

    const payload = {
      title: title.trim(),
      folderId,
      priority,
      dueDate,
      dueTime: dueDate ? dueTime : null,
      recurrence: dueDate ? recurrence : null,
      reminderEnabled: willSchedule,
      reminderTime: willSchedule ? reminderTime : null,
      notificationId,
      estimatedMinutes,
    };

    if (isNew) {
      addTodo(payload);
    } else if (existing) {
      updateTodo(existing.id, payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    confirmDestructive(t('todo.deleteConfirmTitle'), undefined, t('common.delete'), () => {
      cancelReminder(existing.notificationId);
      deleteTodo(existing.id);
      router.back();
      showUndo(t('todo.deletedToast', { title: existing.title }), () => restoreTodo(existing.id));
    });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.titleLabel')}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder={t('todo.titlePlaceholder')}
        placeholderTextColor={colors.textMuted}
        autoFocus={isNew}
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.folderLabel')}</Text>
      <FolderPicker value={folderId} onChange={setFolderId} allowTopLevel topLevelLabel={t('todo.unassignedOption')} />

      <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.priorityLabel')}</Text>
      <PriorityPicker
        value={priority}
        onChange={setPriority}
        locked={!isPro}
        onLockedPress={() => showUpsell(t('pro.upsellPriority'), () => router.push('/pro'))}
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.estimatedTimeLabel')}</Text>
      <DurationPicker value={estimatedMinutes} onChange={setEstimatedMinutes} />

      <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.dueDateLabel')}</Text>
      <DueDateField
        value={dueDate}
        onChange={(next: string | null) => {
          setDueDate(next);
          if (!next) {
            setDueTime(null);
            setRecurrence(null);
            setReminderEnabled(false);
            setReminderDenied(false);
          }
        }}
      />

      {dueDate && (
        <TextInput
          style={[styles.input, styles.timeInput, { borderColor: colors.border, color: colors.text, marginTop: 8 }]}
          value={dueTime ?? ''}
          onChangeText={(text) => setDueTime(text || null)}
          placeholder={t('todo.dueTimeLabel')}
          placeholderTextColor={colors.textMuted}
        />
      )}

      <View style={styles.recurrenceRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.recurrenceLabel')}</Text>
        {!dueDate && (
          <Text style={[styles.hint, { color: colors.textMuted }]}>{t('todo.recurrenceNeedsDueDate')}</Text>
        )}
      </View>
      <RecurrencePicker value={recurrence} onChange={setRecurrence} disabled={!dueDate} />

      <View style={styles.reminderRow}>
        <View style={styles.reminderLabelCol}>
          <Text style={[styles.label, { color: colors.textMuted, marginTop: 0 }]}>{t('todo.reminderLabel')}</Text>
          {!isPro ? (
            <Text style={[styles.hint, { color: colors.textMuted }]}>{t('pro.reminderProOnly')}</Text>
          ) : (
            !dueDate && <Text style={[styles.hint, { color: colors.textMuted }]}>{t('todo.reminderNeedsDueDate')}</Text>
          )}
          {reminderDenied && (
            <Text style={[styles.hint, { color: colors.danger }]}>{t('todo.reminderDenied')}</Text>
          )}
        </View>
        <Pressable
          onPress={() => !isPro && showUpsell(t('pro.upsellReminder'), () => router.push('/pro'))}
          disabled={isPro}
        >
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            disabled={!dueDate || !isPro}
            pointerEvents={isPro ? 'auto' : 'none'}
          />
        </Pressable>
      </View>

      {reminderEnabled && dueDate && isPro && (
        <>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('todo.reminderTimeLabel')}</Text>
          <TextInput
            style={[styles.input, styles.timeInput, { borderColor: colors.border, color: colors.text }]}
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="09:00"
            placeholderTextColor={colors.textMuted}
          />
        </>
      )}

      <Pressable
        style={[styles.saveButton, { backgroundColor: canSave ? colors.accent : colors.surfaceAlt }]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={{ color: canSave ? colors.accentText : colors.textMuted, fontWeight: '700', fontSize: 15 }}>
          {isNew ? t('todo.add') : t('todo.save')}
        </Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>{t('todo.delete')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9, fontSize: 16 },
  timeInput: { width: 100 },
  recurrenceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 14, marginBottom: 6 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  reminderLabelCol: { flex: 1, paddingRight: 12 },
  hint: { fontSize: 12, marginTop: 2 },
  saveButton: { marginTop: 28, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  deleteButton: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
});
