import { SOPStep, SavedSOP } from '@/types';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }
  
  return Notification.permission as NotificationPermission;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

export function sendStepReminder(sop: SavedSOP, step: SOPStep): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  
  if (Notification.permission !== 'granted') {
    return;
  }
  
  const notification = new Notification(`SOP Reminder: ${sop.name}`, {
    body: `Step ${step.stepNumber}: ${step.title}\n${step.description}`,
    icon: '/favicon.ico',
    tag: `sop-${sop.id}-step-${step.id}`,
    requireInteraction: true
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

export interface ReminderCallback {
  onReminder: (sop: SavedSOP, step: SOPStep) => void;
}

let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderChecker(
  getSOPs: () => SavedSOP[],
  callback: ReminderCallback,
  markReminderTriggered?: (sopId: string, stepId: string) => void
): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  
  reminderInterval = setInterval(() => {
    const now = new Date();
    const sops = getSOPs();
    
    for (const sop of sops) {
      if (sop.status === 'completed' || sop.status === 'archived') continue;
      
      for (const reminder of sop.reminders) {
        if (reminder.triggered) continue;
        
        const scheduledTime = reminder.snoozedUntil 
          ? new Date(reminder.snoozedUntil)
          : new Date(reminder.scheduledTime);
        
        if (now >= scheduledTime) {
          const step = sop.steps.find(s => s.id === reminder.stepId);
          if (step && !step.completed) {
            callback.onReminder(sop, step);
            sendStepReminder(sop, step);
            // Mark reminder as triggered to prevent repeated notifications
            if (markReminderTriggered) {
              markReminderTriggered(sop.id, reminder.stepId);
            }
          }
        }
      }
    }
  }, 30000); // Check every 30 seconds
}

export function stopReminderChecker(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getNextReminderTime(sop: SavedSOP): Date | null {
  const now = new Date();
  
  for (const reminder of sop.reminders) {
    if (reminder.triggered) continue;
    
    const step = sop.steps.find(s => s.id === reminder.stepId);
    if (step?.completed) continue;
    
    const scheduledTime = reminder.snoozedUntil 
      ? new Date(reminder.snoozedUntil)
      : new Date(reminder.scheduledTime);
    
    if (scheduledTime > now) {
      return scheduledTime;
    }
  }
  
  return null;
}
