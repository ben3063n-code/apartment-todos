import { formatDateOnly, parseDateOnly } from './dateOnly';
import type { Recurrence } from './models';

export function advanceDueDate(dueDate: string, recurrence: Recurrence): string {
  const date = parseDateOnly(dueDate);
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return formatDateOnly(date);
}
