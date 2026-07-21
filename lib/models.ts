export type Priority = 1 | 2 | 3 | 4 | 5;

export const PRIORITY_LEVELS: Priority[] = [1, 2, 3, 4, 5];

export type SortField = 'priority' | 'dueDate' | 'createdAt' | 'folderName';

export const SORT_FIELDS: SortField[] = ['createdAt', 'priority', 'dueDate', 'folderName'];

export type CompletedSortField = 'createdAt' | 'completedAt';

export type ThemePreference = 'light' | 'dark' | 'auto';

export type CompletionMark = 'check' | 'cross';

export type Language = 'auto' | 'de' | 'en' | 'fr' | 'it' | 'zh' | 'ja';

export const SUPPORTED_LANGUAGES: Exclude<Language, 'auto'>[] = ['de', 'en', 'fr', 'it', 'zh', 'ja'];

export type AccentColor = 'monochrome' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'teal';

export const ACCENT_COLORS: AccentColor[] = [
  'monochrome',
  'blue',
  'purple',
  'green',
  'orange',
  'red',
  'pink',
  'teal',
];

export type FolderKind = 'tasks' | 'list';

export const FOLDER_KINDS: FolderKind[] = ['tasks', 'list'];

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  emoji: string;
  kind: FolderKind;
  locked: boolean;
  deletedAt: string | null;
};

export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const RECURRENCE_OPTIONS: Recurrence[] = ['daily', 'weekly', 'monthly', 'yearly'];

export type Todo = {
  id: string;
  title: string;
  folderId: string | null;
  priority: Priority | null;
  dueDate: string | null;
  dueTime: string | null;
  recurrence: Recurrence | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  notificationId: string | null;
  inNowList: boolean;
  estimatedMinutes: number | null;
  createdAt: string;
  completedAt: string | null;
  done: boolean;
  deletedAt: string | null;
};

