import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'chatId';

export function getChatId(): string {
  const existing = sessionStorage.getItem(STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const id = uuidv4();

  sessionStorage.setItem(STORAGE_KEY, id);

  return id;
}
