import { useRef, useState } from 'react';

import { useStore } from './store';

export function useRecentlyCompleted() {
  const toggleDone = useStore((state) => state.toggleDone);
  const fadeOutDuration = useStore((state) => state.fadeOutDuration);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleToggleDone = (id: string, isCurrentlyDone: boolean) => {
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);
    timeoutsRef.current.delete(id);

    if (!isCurrentlyDone) {
      setRecentlyCompletedIds((prev) => new Set(prev).add(id));
      const timeout = setTimeout(() => {
        setRecentlyCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        timeoutsRef.current.delete(id);
      }, fadeOutDuration);
      timeoutsRef.current.set(id, timeout);
    } else {
      setRecentlyCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    toggleDone(id);
  };

  return { recentlyCompletedIds, handleToggleDone };
}
