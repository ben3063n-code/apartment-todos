import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getDefaultData, ONBOARDING_FOLDER_EMOJI } from './defaultData';
import { suggestFolderEmoji } from './folderEmoji';
import { createId } from './id';
import { resolveLanguage } from './i18n/resolveLanguage';
import { cancelReminder, scheduleReminder } from './notifications';
import type { AccentColor, CompletionMark, Folder, Language, Priority, Recurrence, ThemePreference, Todo } from './models';
import { advanceDueDate } from './recurrence';

type NewTodoInput = {
  title: string;
  folderId: string;
  priority: Priority | null;
  dueDate: string | null;
  dueTime: string | null;
  recurrence: Recurrence | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  notificationId: string | null;
};

type TodoPatch = Partial<
  Pick<
    Todo,
    | 'title'
    | 'folderId'
    | 'priority'
    | 'dueDate'
    | 'dueTime'
    | 'recurrence'
    | 'reminderEnabled'
    | 'reminderTime'
    | 'notificationId'
    | 'inNowList'
  >
>;

type Store = {
  folders: Folder[];
  todos: Todo[];
  themePreference: ThemePreference;
  brightness: number;
  accentColor: AccentColor;
  completionMark: CompletionMark;
  language: Language;
  showTodayBanner: boolean;
  hasHydrated: boolean;
  hasSeededDefaults: boolean;
  onboardingFolderId: string | null;
  setHasHydrated: (value: boolean) => void;
  seedDefaultData: () => void;

  addFolder: (name: string, parentId: string | null, emoji: string) => string;
  updateFolder: (id: string, patch: Partial<Pick<Folder, 'name' | 'emoji'>>) => void;
  deleteFolder: (id: string) => void;
  restoreFolder: (id: string) => void;
  permanentlyDeleteFolder: (id: string) => void;
  getChildFolders: (parentId: string | null) => Folder[];
  getDescendantFolderIds: (id: string) => string[];
  getAncestorFolderIds: (id: string) => string[];
  reorderSiblings: (parentId: string | null, orderedIds: string[]) => void;

  addTodo: (input: NewTodoInput) => string;
  updateTodo: (id: string, patch: TodoPatch) => void;
  toggleDone: (id: string) => void;
  toggleInNow: (id: string) => void;
  deleteTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  permanentlyDeleteTodo: (id: string) => void;
  emptyTrash: () => void;

  setThemePreference: (preference: ThemePreference) => void;
  setBrightness: (value: number) => void;
  setAccentColor: (value: AccentColor) => void;
  setCompletionMark: (value: CompletionMark) => void;
  setLanguage: (language: Language) => void;
  setShowTodayBanner: (value: boolean) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      folders: [],
      todos: [],
      themePreference: 'auto',
      brightness: 0.5,
      accentColor: 'monochrome',
      completionMark: 'check',
      language: 'auto',
      showTodayBanner: true,
      hasHydrated: false,
      hasSeededDefaults: false,
      onboardingFolderId: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      seedDefaultData: () => {
        const resolvedLanguage = resolveLanguage(get().language);
        const data = getDefaultData(resolvedLanguage);
        for (const name of data.folderNames) {
          get().addFolder(name, null, suggestFolderEmoji(name));
        }
        const onboardingId = get().addFolder(data.onboardingFolderName, null, ONBOARDING_FOLDER_EMOJI);
        for (const title of data.onboardingTodos) {
          get().addTodo({
            title,
            folderId: onboardingId,
            priority: null,
            dueDate: null,
            dueTime: null,
            recurrence: null,
            reminderEnabled: false,
            reminderTime: null,
            notificationId: null,
          });
        }
        set({ hasSeededDefaults: true, onboardingFolderId: onboardingId });
      },

      addFolder: (name, parentId, emoji) => {
        const id = createId();
        set((state) => ({ folders: [...state.folders, { id, name, parentId, emoji, deletedAt: null }] }));
        return id;
      },

      updateFolder: (id, patch) => {
        set((state) => ({
          folders: state.folders.map((folder) => (folder.id === id ? { ...folder, ...patch } : folder)),
        }));
      },

      deleteFolder: (id) => {
        const idsToDelete = new Set(get().getDescendantFolderIds(id));
        const now = new Date().toISOString();
        const affectedTodos = get().todos.filter((todo) => idsToDelete.has(todo.folderId) && !todo.deletedAt);
        for (const todo of affectedTodos) cancelReminder(todo.notificationId);
        set((state) => ({
          folders: state.folders.map((folder) => (idsToDelete.has(folder.id) ? { ...folder, deletedAt: now } : folder)),
          todos: state.todos.map((todo) =>
            idsToDelete.has(todo.folderId) && !todo.deletedAt
              ? { ...todo, deletedAt: now, notificationId: null }
              : todo
          ),
        }));
      },

      restoreFolder: (id) => {
        const idsToRestore = new Set(get().getDescendantFolderIds(id));
        for (const ancestorId of get().getAncestorFolderIds(id)) idsToRestore.add(ancestorId);
        set((state) => ({
          folders: state.folders.map((folder) => (idsToRestore.has(folder.id) ? { ...folder, deletedAt: null } : folder)),
          todos: state.todos.map((todo) => (idsToRestore.has(todo.folderId) ? { ...todo, deletedAt: null } : todo)),
        }));
      },

      permanentlyDeleteFolder: (id) => {
        const idsToDelete = new Set(get().getDescendantFolderIds(id));
        const removedTodos = get().todos.filter((todo) => idsToDelete.has(todo.folderId));
        for (const todo of removedTodos) cancelReminder(todo.notificationId);
        set((state) => ({
          folders: state.folders.filter((folder) => !idsToDelete.has(folder.id)),
          todos: state.todos.filter((todo) => !idsToDelete.has(todo.folderId)),
        }));
      },

      getChildFolders: (parentId) => {
        return get().folders.filter((folder) => folder.parentId === parentId && !folder.deletedAt);
      },

      getDescendantFolderIds: (id) => {
        const { folders } = get();
        const result: string[] = [id];
        const queue = [id];
        while (queue.length > 0) {
          const current = queue.shift()!;
          for (const folder of folders) {
            if (folder.parentId === current) {
              result.push(folder.id);
              queue.push(folder.id);
            }
          }
        }
        return result;
      },

      getAncestorFolderIds: (id) => {
        const { folders } = get();
        const result: string[] = [];
        let current = folders.find((f) => f.id === id);
        while (current?.parentId) {
          result.push(current.parentId);
          current = folders.find((f) => f.id === current!.parentId);
        }
        return result;
      },

      reorderSiblings: (parentId, orderedIds) => {
        set((state) => {
          const siblings = state.folders.filter((f) => f.parentId === parentId);
          const others = state.folders.filter((f) => f.parentId !== parentId);
          const byId = new Map(siblings.map((f) => [f.id, f]));
          const reordered = orderedIds.map((id) => byId.get(id)).filter((f): f is Folder => !!f);
          return { folders: [...others, ...reordered] };
        });
      },

      addTodo: (input) => {
        const id = createId();
        const todo: Todo = {
          id,
          title: input.title,
          folderId: input.folderId,
          priority: input.priority,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          recurrence: input.recurrence,
          reminderEnabled: input.reminderEnabled,
          reminderTime: input.reminderTime,
          notificationId: input.notificationId,
          inNowList: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          done: false,
          deletedAt: null,
        };
        set((state) => ({ todos: [...state.todos, todo] }));
        return id;
      },

      updateTodo: (id, patch) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)),
        }));
      },

      toggleDone: (id) => {
        const current = get().todos.find((todo) => todo.id === id);
        if (!current) return;
        const done = !current.done;

        if (done && current.notificationId) cancelReminder(current.notificationId);

        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  done,
                  completedAt: done ? new Date().toISOString() : null,
                  notificationId: done ? null : todo.notificationId,
                }
              : todo
          ),
        }));

        if (done && current.recurrence && current.dueDate) {
          const nextDueDate = advanceDueDate(current.dueDate, current.recurrence);
          const nextId = createId();
          const nextTodo: Todo = {
            id: nextId,
            title: current.title,
            folderId: current.folderId,
            priority: current.priority,
            dueDate: nextDueDate,
            dueTime: current.dueTime,
            recurrence: current.recurrence,
            reminderEnabled: current.reminderEnabled,
            reminderTime: current.reminderTime,
            notificationId: null,
            inNowList: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            done: false,
            deletedAt: null,
          };
          set((state) => ({ todos: [...state.todos, nextTodo] }));

          if (current.reminderEnabled) {
            scheduleReminder({
              title: current.title,
              dueDate: nextDueDate,
              reminderTime: current.reminderTime,
            }).then((notificationId) => {
              if (notificationId) get().updateTodo(nextId, { notificationId });
            });
          }
        }
      },

      toggleInNow: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, inNowList: !todo.inNowList } : todo)),
        }));
      },

      deleteTodo: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (todo?.notificationId) cancelReminder(todo.notificationId);
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, deletedAt: new Date().toISOString(), notificationId: null } : t
          ),
        }));
      },

      restoreTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, deletedAt: null } : t)),
        }));
      },

      permanentlyDeleteTodo: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (todo?.notificationId) cancelReminder(todo.notificationId);
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
      },

      emptyTrash: () => {
        const trashedTodos = get().todos.filter((t) => t.deletedAt);
        for (const todo of trashedTodos) cancelReminder(todo.notificationId);
        set((state) => ({
          folders: state.folders.filter((f) => !f.deletedAt),
          todos: state.todos.filter((t) => !t.deletedAt),
        }));
      },

      setThemePreference: (preference) => set({ themePreference: preference }),
      setBrightness: (value) => set({ brightness: value }),
      setAccentColor: (value) => set({ accentColor: value }),
      setCompletionMark: (value) => set({ completionMark: value }),
      setLanguage: (language) => set({ language }),
      setShowTodayBanner: (value) => set({ showTodayBanner: value }),
    }),
    {
      name: 'apartment-todos',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        folders: state.folders,
        todos: state.todos,
        themePreference: state.themePreference,
        brightness: state.brightness,
        accentColor: state.accentColor,
        completionMark: state.completionMark,
        language: state.language,
        showTodayBanner: state.showTodayBanner,
        hasSeededDefaults: state.hasSeededDefaults,
        onboardingFolderId: state.onboardingFolderId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && !state.hasSeededDefaults) {
          state.seedDefaultData();
        }
      },
    }
  )
);
