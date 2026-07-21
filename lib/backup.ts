import { useStore } from './store';

const BACKUP_SCHEMA_VERSION = 1;

export function buildBackupJson(): string {
  const state = useStore.getState();
  const payload = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    folders: state.folders,
    todos: state.todos,
    themePreference: state.themePreference,
    brightness: state.brightness,
    accentColor: state.accentColor,
    completionMark: state.completionMark,
    fadeOutDuration: state.fadeOutDuration,
    allTodosSortField: state.allTodosSortField,
    language: state.language,
    showTodayBanner: state.showTodayBanner,
    onboardingFolderId: state.onboardingFolderId,
  };
  return JSON.stringify(payload, null, 2);
}

export function backupFileName(): string {
  return `todo-creator-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export function applyBackupJson(json: string): boolean {
  let data: any;
  try {
    data = JSON.parse(json);
  } catch {
    return false;
  }
  if (!data || !Array.isArray(data.folders) || !Array.isArray(data.todos)) {
    return false;
  }

  useStore.setState({
    folders: data.folders,
    todos: data.todos,
    themePreference: data.themePreference ?? 'auto',
    brightness: typeof data.brightness === 'number' ? data.brightness : 0.5,
    accentColor: data.accentColor ?? 'monochrome',
    completionMark: data.completionMark ?? 'check',
    fadeOutDuration: typeof data.fadeOutDuration === 'number' ? data.fadeOutDuration : 1200,
    allTodosSortField: data.allTodosSortField ?? 'createdAt',
    language: data.language ?? 'auto',
    showTodayBanner: typeof data.showTodayBanner === 'boolean' ? data.showTodayBanner : true,
    hasSeededDefaults: true,
    onboardingFolderId: data.onboardingFolderId ?? null,
  });
  return true;
}
