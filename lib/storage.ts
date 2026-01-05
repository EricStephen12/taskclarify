import { SavedNote, FormattedResult, PersonalPlanResult } from '@/types';

const LOCAL_STORAGE_KEY = 'taskclarify_notes';

// Save note to Supabase
export async function saveNoteToCloud(note: FormattedResult, rawInput: string): Promise<SavedNote | null> {
  try {
    const noteData = {
      rawInput,
      taskName: note.taskName,
      detectedType: note.detectedType,
      summary: note.summary,
      risks: note.risks,
      ...(note.detectedType === 'personal' ? {
        budget: (note as PersonalPlanResult).budget,
        executionSteps: (note as PersonalPlanResult).executionSteps,
        constraints: (note as PersonalPlanResult).constraints,
        checkpoints: (note as PersonalPlanResult).checkpoints,
        timeline: (note as PersonalPlanResult).timeline,
        unclearPoints: (note as PersonalPlanResult).unclearPoints,
        priority: 'MEDIUM',
        estimatedComplexity: 'Moderate',
        functionalRequirements: [],
        technicalRequirements: [],
        userStories: [],
        questionsForStakeholder: [],
        assumptions: [],
        outOfScope: [],
        dependencies: []
      } : {
        priority: (note as any).priority,
        estimatedComplexity: (note as any).estimatedComplexity,
        functionalRequirements: (note as any).functionalRequirements,
        technicalRequirements: (note as any).technicalRequirements,
        userStories: (note as any).userStories,
        unclearPoints: (note as any).unclearPoints,
        questionsForStakeholder: (note as any).questionsForStakeholder,
        assumptions: (note as any).assumptions,
        outOfScope: (note as any).outOfScope,
        dependencies: (note as any).dependencies
      })
    };

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });

    if (!res.ok) {
      console.error('Failed to save note to cloud');
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error saving note to cloud:', error);
    return null;
  }
}

// Load notes from Supabase
export async function loadNotesFromCloud(): Promise<SavedNote[]> {
  try {
    const res = await fetch('/api/notes');
    if (!res.ok) {
      console.error('Failed to load notes from cloud');
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error loading notes from cloud:', error);
    return [];
  }
}

// Delete note from Supabase
export async function deleteNoteFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error('Error deleting note from cloud:', error);
    return false;
  }
}

// Migrate localStorage notes to cloud (one-time migration)
export async function migrateLocalNotesToCloud(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const migrationKey = 'taskclarify_notes_migrated';
  if (localStorage.getItem(migrationKey)) return;

  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localData) {
      localStorage.setItem(migrationKey, 'true');
      return;
    }

    const localNotes = JSON.parse(localData);
    if (!Array.isArray(localNotes) || localNotes.length === 0) {
      localStorage.setItem(migrationKey, 'true');
      return;
    }

    // Upload each local note to cloud
    for (const note of localNotes) {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: note.rawInput || '',
          taskName: note.taskName,
          detectedType: note.detectedType || 'software',
          summary: note.summary,
          risks: note.risks || [],
          priority: note.priority,
          estimatedComplexity: note.estimatedComplexity,
          functionalRequirements: note.functionalRequirements || [],
          technicalRequirements: note.technicalRequirements || [],
          userStories: note.userStories || [],
          unclearPoints: note.unclearPoints || [],
          questionsForStakeholder: note.questionsForStakeholder || [],
          assumptions: note.assumptions || [],
          outOfScope: note.outOfScope || [],
          dependencies: note.dependencies || [],
          budget: note.budget,
          executionSteps: note.executionSteps,
          constraints: note.constraints,
          checkpoints: note.checkpoints,
          timeline: note.timeline
        })
      });
    }

    // Mark as migrated and clear local storage
    localStorage.setItem(migrationKey, 'true');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log('Successfully migrated local notes to cloud');
  } catch (error) {
    console.error('Error migrating notes to cloud:', error);
  }
}

// Legacy functions for backward compatibility (deprecated)
export function saveNote(note: FormattedResult, rawInput: string): SavedNote {
  const saved: SavedNote = {
    id: crypto.randomUUID(),
    detectedType: note.detectedType,
    rawInput,
    createdAt: new Date().toISOString(),
    taskName: note.taskName,
    summary: note.summary,
    priority: 'MEDIUM',
    estimatedComplexity: 'Moderate',
    functionalRequirements: [],
    technicalRequirements: [],
    userStories: [],
    questionsForStakeholder: [],
    assumptions: [],
    outOfScope: [],
    dependencies: [],
    risks: note.risks,
    unclearPoints: (note as any).unclearPoints || []
  };
  return saved;
}

export function loadNotes(): SavedNote[] {
  return [];
}

export function deleteNote(id: string): void {
  // No-op, use deleteNoteFromCloud instead
}

export function getNote(id: string): SavedNote | undefined {
  return undefined;
}
