import { SOP, SavedSOP, SOPReminder, SOPStatus } from '@/types';

const STORAGE_KEY = 'taskclarify_saved_sops';

export function saveSOP(sop: SOP, startTime: Date): SavedSOP {
  const reminders = calculateReminderTimes(sop, startTime);
  
  const savedSOP: SavedSOP = {
    ...sop,
    startTime: startTime.toISOString(),
    status: 'scheduled',
    currentStepIndex: 0,
    reminders
  };
  
  const existing = loadSOPs();
  const updated = [savedSOP, ...existing];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  
  return savedSOP;
}

export function loadSOPs(): SavedSOP[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteSOP(id: string): void {
  const existing = loadSOPs();
  const updated = existing.filter(sop => sop.id !== id);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function updateSOP(id: string, updates: Partial<SavedSOP>): SavedSOP | null {
  const existing = loadSOPs();
  const index = existing.findIndex(sop => sop.id === id);
  
  if (index === -1) return null;
  
  const updated = { ...existing[index], ...updates };
  existing[index] = updated;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
  
  return updated;
}

export function calculateReminderTimes(sop: SOP, startTime: Date): SOPReminder[] {
  let currentTime = new Date(startTime);
  
  return sop.steps.map(step => {
    const reminder: SOPReminder = {
      stepId: step.id,
      scheduledTime: currentTime.toISOString(),
      triggered: false
    };
    currentTime = new Date(currentTime.getTime() + step.estimatedDuration * 60000);
    return reminder;
  });
}

export function markStepComplete(sopId: string, stepId: string): SavedSOP | null {
  const sops = loadSOPs();
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return null;
  
  const stepIndex = sop.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) return null;
  
  sop.steps[stepIndex].completed = true;
  sop.currentStepIndex = stepIndex + 1;
  
  // Update status
  const allComplete = sop.steps.every(s => s.completed);
  if (allComplete) {
    sop.status = 'completed';
  } else if (sop.currentStepIndex > 0) {
    sop.status = 'in-progress';
  }
  
  // Mark reminder as triggered
  const reminderIndex = sop.reminders.findIndex(r => r.stepId === stepId);
  if (reminderIndex !== -1) {
    sop.reminders[reminderIndex].triggered = true;
  }
  
  return updateSOP(sopId, sop);
}

export function snoozeReminder(sopId: string, stepId: string, minutes: number): SavedSOP | null {
  const sops = loadSOPs();
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return null;
  
  const reminderIndex = sop.reminders.findIndex(r => r.stepId === stepId);
  if (reminderIndex === -1) return null;
  
  const snoozeUntil = new Date(Date.now() + minutes * 60000);
  sop.reminders[reminderIndex].snoozedUntil = snoozeUntil.toISOString();
  
  return updateSOP(sopId, sop);
}

export function rescheduleSOP(sopId: string, newStartTime: Date): SavedSOP | null {
  const sops = loadSOPs();
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return null;
  
  const newReminders = calculateReminderTimes(sop, newStartTime);
  
  return updateSOP(sopId, {
    startTime: newStartTime.toISOString(),
    reminders: newReminders,
    status: 'scheduled',
    currentStepIndex: 0
  });
}

export function getSOPProgress(sop: SavedSOP): number {
  if (sop.steps.length === 0) return 0;
  const completed = sop.steps.filter(s => s.completed).length;
  return completed / sop.steps.length;
}

export function archiveSOP(sopId: string): SavedSOP | null {
  return updateSOP(sopId, { status: 'archived' as SOPStatus });
}
