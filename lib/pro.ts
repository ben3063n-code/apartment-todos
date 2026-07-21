export const FREE_FOLDER_LIMIT = 5;
export const FREE_FOCUS_TASK_LIMIT = 5;

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
