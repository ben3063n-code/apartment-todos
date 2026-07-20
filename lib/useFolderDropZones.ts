import { useRef } from 'react';
import type { View } from 'react-native';

import { useStore } from './store';

type DropZone = { folderId: string; y0: number; y1: number };

export function useFolderDropZones() {
  const updateTodo = useStore((state) => state.updateTodo);
  const rowRefs = useRef(new Map<string, View>());
  const dropZonesRef = useRef<DropZone[]>([]);

  const registerFolderRowRef = (folderId: string, node: View | null) => {
    if (node) rowRefs.current.set(folderId, node);
    else rowRefs.current.delete(folderId);
  };

  const measureDropZones = () => {
    const entries = Array.from(rowRefs.current.entries());
    if (entries.length === 0) {
      dropZonesRef.current = [];
      return;
    }
    const zones: DropZone[] = [];
    let remaining = entries.length;
    entries.forEach(([folderId, node]) => {
      node.measure((_x, _y, _w, h, pageX, pageY) => {
        zones.push({ folderId, y0: pageY, y1: pageY + h });
        remaining -= 1;
        if (remaining === 0) dropZonesRef.current = zones;
      });
    });
  };

  const handleDrop = (todoId: string, absoluteY: number) => {
    const hit = dropZonesRef.current.find((zone) => absoluteY >= zone.y0 && absoluteY <= zone.y1);
    if (hit) updateTodo(todoId, { folderId: hit.folderId });
  };

  const findZoneAt = (absoluteY: number): DropZone | null => {
    return dropZonesRef.current.find((zone) => absoluteY >= zone.y0 && absoluteY <= zone.y1) ?? null;
  };

  return { registerFolderRowRef, measureDropZones, handleDrop, findZoneAt };
}
