import type { Href } from 'expo-router';

const ROOT_SENTINEL = 'root';

export function folderIdToParam(id: string | null): string {
  return id ?? ROOT_SENTINEL;
}

export function paramToFolderId(param: string | string[] | undefined): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  return !value || value === ROOT_SENTINEL ? null : value;
}

export function newTodoHref(folderId: string | null): Href {
  return {
    pathname: '/todo/[id]',
    params: { id: 'new', folderId: folderIdToParam(folderId) },
  } as Href;
}

export function editTodoHref(id: string): Href {
  return { pathname: '/todo/[id]', params: { id } } as Href;
}

export function newFolderHref(parentId: string | null): Href {
  return {
    pathname: '/folder/[id]',
    params: { id: 'new', parentId: folderIdToParam(parentId) },
  } as Href;
}

export function renameFolderHref(id: string): Href {
  return { pathname: '/folder/[id]', params: { id } } as Href;
}
