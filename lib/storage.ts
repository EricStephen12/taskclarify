import { FormattedNote, SavedNote } from '@/types';

const STORAGE_KEY = 'taskclarify_notes';

export function saveNote(note: FormattedNote, rawInput: string): SavedNote {
  const saved: SavedNote = {
    ...note,
    id: crypto.randomUUID(),
    rawInput,
    createdAt: new Date().toISOString()
  };
  const notes = loadNotes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...notes]));
  return saved;
}

export function loadNotes(): SavedNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteNote(id: string): void {
  const notes = loadNotes().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNote(id: string): SavedNote | undefined {
  return loadNotes().find(n => n.id === id);
}
