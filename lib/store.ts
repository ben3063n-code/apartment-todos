import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getDefaultData, ONBOARDING_FOLDER_EMOJI } from './defaultData';
import { suggestFolderEmoji } from './folderEmoji';
import { createId } from './id';
import { resolveLanguage } from './i18n/resolveLanguage';
import { cancelReminder, scheduleReminder } from './notifications';
import { currentMonthKey, FREE_FOCUS_TASK_LIMIT } from './pro';
import type {
  AccentColor,
  CompletionMark,
  Folder,
  FolderKind,
  Language,
  Priority,
  Recurrence,
  SortField,
  ThemePreference,
  Todo,
} from './models';
import { advanceDueDate } from './recurrence';

type NewTodoInput = {
  title: string;
  folderId: string | null;
  priority: Priority | null;
  dueDate: string | null;
  dueTime: string | null;
  recurrence: Recurrence | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  notificationId: string | null;
  estimatedMinutes: number | null;
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
    | 'estimatedMinutes'
  >
>;

type Store = {
  folders: Folder[];
  todos: Todo[];
  themePreference: ThemePreference;
  brightness: number;
  accentColor: AccentColor;
  completionMark: CompletionMark;
  fadeOutDuration: number;
  allTodosSortField: SortField;
  defaultFolderId: string | 'all';
  language: Language;
  showTodayBanner: boolean;
  starOnLeft: boolean;
  tabBarAccentColor: AccentColor | 'auto';
  hasHydrated: boolean;
  hasSeededDefaults: boolean;
  onboardingFolderId: string | null;
  isPro: boolean;
  focusSessionEndedMonth: string | null;
  unlockedFolderIds: string[];
  unlockFolder: (id: string) => void;
  isFolderUnlocked: (id: string) => boolean;
  setHasHydrated: (value: boolean) => void;
  seedDefaultData: () => void;
  setIsPro: (value: boolean) => void;
  attemptToggleInNow: (id: string) => 'ok' | 'limit' | 'monthly';

  addFolder: (name: string, parentId: string | null, emoji: string, kind?: FolderKind) => string;
  updateFolder: (id: string, patch: Partial<Pick<Folder, 'name' | 'emoji' | 'kind' | 'parentId' | 'locked'>>) => void;
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
  endFocusSession: () => void;

  setThemePreference: (preference: ThemePreference) => void;
  setBrightness: (value: number) => void;
  setAccentColor: (value: AccentColor) => void;
  setCompletionMark: (value: CompletionMark) => void;
  setFadeOutDuration: (value: number) => void;
  setAllTodosSortField: (value: SortField) => void;
  setDefaultFolderId: (value: string | 'all') => void;
  setLanguage: (language: Language) => void;
  setShowTodayBanner: (value: boolean) => void;
  setStarOnLeft: (value: boolean) => void;
  setTabBarAccentColor: (value: AccentColor | 'auto') => void;
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
      fadeOutDuration: 1200,
      allTodosSortField: 'createdAt',
      defaultFolderId: 'all',
      language: 'auto',
      showTodayBanner: true,
      starOnLeft: false,
      tabBarAccentColor: 'auto',
      hasHydrated: false,
      hasSeededDefaults: false,
      onboardingFolderId: null,
      isPro: false,
      focusSessionEndedMonth: null,
      unlockedFolderIds: [],
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setIsPro: (value) => set({ isPro: value }),
      unlockFolder: (id) => set((state) => ({ unlockedFolderIds: [...state.unlockedFolderIds, id] })),
      isFolderUnlocked: (id) => get().unlockedFolderIds.includes(id),

      seedDefaultData: () => {
        const resolvedLanguage = resolveLanguage(get().language);
        const data = getDefaultData(resolvedLanguage);

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
            estimatedMinutes: 1,
          });
        }

        const homeId = get().addFolder(data.homeFolderName, null, suggestFolderEmoji(data.homeFolderName), 'tasks');
        for (const room of data.roomSubfolders) {
          const roomId = get().addFolder(room.name, homeId, suggestFolderEmoji(room.name));
          const todoId = get().addTodo({
            title: room.task,
            folderId: roomId,
            priority: room.priority,
            dueDate: null,
            dueTime: null,
            recurrence: null,
            reminderEnabled: false,
            reminderTime: null,
            notificationId: null,
            estimatedMinutes: room.minutes,
          });
          get().toggleInNow(todoId);
        }

        get().addFolder(data.listFolderName, null, suggestFolderEmoji(data.listFolderName), 'list');
        get().addFolder(data.privateFolderName, null, suggestFolderEmoji(data.privateFolderName), 'tasks');
        get().addFolder(data.workFolderName, null, suggestFolderEmoji(data.workFolderName), 'tasks');

        set({ hasSeededDefaults: true, onboardingFolderId: onboardingId });
      },

      addFolder: (name, parentId, emoji, kind = 'tasks') => {
        const id = createId();
        set((state) => ({
          folders: [...state.folders, { id, name, parentId, emoji, kind, locked: false, deletedAt: null }],
        }));
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
        const inScope = (todo: Todo) => todo.folderId !== null && idsToDelete.has(todo.folderId);
        const affectedTodos = get().todos.filter((todo) => inScope(todo) && !todo.deletedAt);
        for (const todo of affectedTodos) cancelReminder(todo.notificationId);
        set((state) => ({
          folders: state.folders.map((folder) => (idsToDelete.has(folder.id) ? { ...folder, deletedAt: now } : folder)),
          todos: state.todos.map((todo) =>
            inScope(todo) && !todo.deletedAt ? { ...todo, deletedAt: now, notificationId: null } : todo
          ),
        }));
      },

      restoreFolder: (id) => {
        const idsToRestore = new Set(get().getDescendantFolderIds(id));
        for (const ancestorId of get().getAncestorFolderIds(id)) idsToRestore.add(ancestorId);
        set((state) => ({
          folders: state.folders.map((folder) => (idsToRestore.has(folder.id) ? { ...folder, deletedAt: null } : folder)),
          todos: state.todos.map((todo) =>
            todo.folderId !== null && idsToRestore.has(todo.folderId) ? { ...todo, deletedAt: null } : todo
          ),
        }));
      },

      permanentlyDeleteFolder: (id) => {
        const idsToDelete = new Set(get().getDescendantFolderIds(id));
        const inScope = (todo: Todo) => todo.folderId !== null && idsToDelete.has(todo.folderId);
        const removedTodos = get().todos.filter(inScope);
        for (const todo of removedTodos) cancelReminder(todo.notificationId);
        set((state) => ({
          folders: state.folders.filter((folder) => !idsToDelete.has(folder.id)),
          todos: state.todos.filter((todo) => !inScope(todo)),
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
          estimatedMinutes: input.estimatedMinutes,
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
        if (done) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

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
            estimatedMinutes: current.estimatedMinutes,
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

      attemptToggleInNow: (id) => {
        const state = get();
        const todo = state.todos.find((t) => t.id === id);
        if (!todo) return 'ok';

        if (state.isPro || todo.inNowList) {
          state.toggleInNow(id);
          return 'ok';
        }

        const currentFocusCount = state.todos.filter((t) => t.inNowList && !t.deletedAt).length;
        if (currentFocusCount >= FREE_FOCUS_TASK_LIMIT) return 'limit';
        if (currentFocusCount === 0 && state.focusSessionEndedMonth === currentMonthKey()) return 'monthly';

        state.toggleInNow(id);
        return 'ok';
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

      endFocusSession: () => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.inNowList ? { ...todo, inNowList: false } : todo)),
          focusSessionEndedMonth: currentMonthKey(),
        }));
      },

      setThemePreference: (preference) => set({ themePreference: preference }),
      setBrightness: (value) => set({ brightness: value }),
      setAccentColor: (value) => set({ accentColor: value }),
      setCompletionMark: (value) => set({ completionMark: value }),
      setFadeOutDuration: (value) => set({ fadeOutDuration: value }),
      setAllTodosSortField: (value) => set({ allTodosSortField: value }),
      setDefaultFolderId: (value) => set({ defaultFolderId: value }),
      setLanguage: (language) => set({ language }),
      setShowTodayBanner: (value) => set({ showTodayBanner: value }),
      setStarOnLeft: (value) => set({ starOnLeft: value }),
      setTabBarAccentColor: (value) => set({ tabBarAccentColor: value }),
    }),
    {
      name: 'apartment-todos',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => persistedState as Store,
      partialize: (state) => ({
        folders: state.folders,
        todos: state.todos,
        themePreference: state.themePreference,
        brightness: state.brightness,
        accentColor: state.accentColor,
        completionMark: state.completionMark,
        fadeOutDuration: state.fadeOutDuration,
        allTodosSortField: state.allTodosSortField,
        defaultFolderId: state.defaultFolderId,
        language: state.language,
        showTodayBanner: state.showTodayBanner,
        starOnLeft: state.starOnLeft,
        tabBarAccentColor: state.tabBarAccentColor,
        hasSeededDefaults: state.hasSeededDefaults,
        onboardingFolderId: state.onboardingFolderId,
        isPro: state.isPro,
        focusSessionEndedMonth: state.focusSessionEndedMonth,
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
