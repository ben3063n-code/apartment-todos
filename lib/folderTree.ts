import type { Folder } from './models';

export type FlatFolderEntry = { folder: Folder; depth: number };

export function flattenFolderTree(folders: Folder[]): FlatFolderEntry[] {
  const byParent = new Map<string | null, Folder[]>();
  for (const folder of folders) {
    const list = byParent.get(folder.parentId) ?? [];
    list.push(folder);
    byParent.set(folder.parentId, list);
  }

  const result: FlatFolderEntry[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const child of byParent.get(parentId) ?? []) {
      result.push({ folder: child, depth });
      walk(child.id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}

export type VisibleFolderEntry = { folder: Folder; depth: number; hasChildren: boolean };

export function flattenVisibleFolderTree(folders: Folder[], expandedIds: Set<string>): VisibleFolderEntry[] {
  const byParent = new Map<string | null, Folder[]>();
  for (const folder of folders) {
    const list = byParent.get(folder.parentId) ?? [];
    list.push(folder);
    byParent.set(folder.parentId, list);
  }

  const result: VisibleFolderEntry[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const child of byParent.get(parentId) ?? []) {
      const hasChildren = (byParent.get(child.id) ?? []).length > 0;
      result.push({ folder: child, depth, hasChildren });
      if (hasChildren && expandedIds.has(child.id)) {
        walk(child.id, depth + 1);
      }
    }
  };
  walk(null, 0);
  return result;
}
