type TFunc = (key: string, options?: Record<string, unknown>) => string;

export function formatDuration(minutes: number, t: TFunc): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return t('duration.minutesOnly', { count: mins });
  if (mins === 0) return t('duration.hoursOnly', { count: hours });
  return t('duration.hoursAndMinutes', { hours, minutes: mins });
}
