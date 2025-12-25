import { FormattedNote, SavedNote, FormattedResult, SoftwareRequirementResult, PersonalPlanResult } from '@/types';

const STORAGE_KEY = 'taskclarify_notes';

export function saveNote(note: FormattedResult, rawInput: string): SavedNote {
  // Convert FormattedResult to SavedNote format (which extends FormattedNote)
  // For personal plans, we create a minimal FormattedNote structure but include personal-specific fields
  if (note.detectedType === 'personal') {
    const personalNote = note as PersonalPlanResult;
    const saved: SavedNote = {
      id: crypto.randomUUID(),
      detectedType: 'personal',
      rawInput,
      createdAt: new Date().toISOString(),
      taskName: note.taskName,
      summary: note.summary,
      priority: 'MEDIUM', // Default for personal plans
      estimatedComplexity: 'Moderate', // Default for personal plans
      functionalRequirements: [],
      technicalRequirements: [],
      userStories: [],

      questionsForStakeholder: [],
      assumptions: [],
      outOfScope: [],
      dependencies: [],
      risks: note.risks,
      // Personal plan specific fields
      budget: personalNote.budget,
      executionSteps: personalNote.executionSteps,
      constraints: personalNote.constraints,
      checkpoints: personalNote.checkpoints,
      timeline: personalNote.timeline,
      unclearPoints: personalNote.unclearPoints
    };
    
    const notes = loadNotes();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...notes]));
    return saved;
  }
  
  // For all other types (software, business, marketing, financial), use the same structure
  const saved: SavedNote = {
    ...note,
    id: crypto.randomUUID(),
    detectedType: note.detectedType,
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
