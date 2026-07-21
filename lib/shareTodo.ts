import { Share } from 'react-native';

import { parseDateOnly } from './dateOnly';
import type { Todo } from './models';

export async function shareTodo(todo: Todo, folderName: string | null): Promise<void> {
  const lines = [todo.title];
  if (todo.dueDate) {
    const dateLabel = parseDateOnly(todo.dueDate).toLocaleDateString();
    lines.push(todo.dueTime ? `${dateLabel}, ${todo.dueTime}` : dateLabel);
  }
  if (folderName) lines.push(folderName);

  try {
    await Share.share({ message: lines.join('\n') });
  } catch {
    // user cancelled or platform unsupported (e.g. web without Web Share API) — ignore
  }
}
