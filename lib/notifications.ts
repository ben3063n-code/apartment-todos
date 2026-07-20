import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { parseDateOnly } from './dateOnly';

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

type ReminderInput = { title: string; dueDate: string; reminderTime: string | null };

export async function scheduleReminder(input: ReminderInput): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const [hours, minutes] = (input.reminderTime ?? '09:00').split(':').map(Number);
  const due = parseDateOnly(input.dueDate);
  const fireDate = new Date(due.getFullYear(), due.getMonth(), due.getDate(), hours, minutes);

  if (fireDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title: input.title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
}

export function cancelReminder(notificationId: string | null): void {
  if (Platform.OS === 'web' || !notificationId) return;
  Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}
