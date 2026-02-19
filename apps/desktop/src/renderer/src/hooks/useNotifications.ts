import { useCallback, useRef } from 'react';

const PREF_KEY = 'streakbeast_pref_notifications';
const REMINDER_KEY = 'streakbeast_last_reminder';
const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;

function isEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== 'false';
  } catch {
    return true;
  }
}

function alreadyRemindedToday(): boolean {
  try {
    const last = localStorage.getItem(REMINDER_KEY);
    if (!last) return false;
    const lastDate = new Date(parseInt(last, 10)).toDateString();
    return lastDate === new Date().toDateString();
  } catch {
    return false;
  }
}

/**
 * Hook that provides notification functions respecting the user's
 * Desktop Notifications preference in Settings.
 */
export function useNotifications() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((title: string, body: string) => {
    if (!isEnabled()) return;
    window.api?.notify?.(title, body);
  }, []);

  /**
   * Schedule a daily streak reminder based on the latest check-in timestamp.
   * Fires once per day, 20h after the last check-in (giving a 4h warning before streak expires).
   */
  const scheduleStreakReminder = useCallback((lastCheckInSec: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isEnabled() || lastCheckInSec === 0) return;
    if (alreadyRemindedToday()) return;

    const lastCheckInMs = lastCheckInSec * 1000;
    const reminderAt = lastCheckInMs + TWENTY_HOURS_MS;
    const delay = reminderAt - Date.now();

    if (delay <= 0) {
      // Already past 20h — remind now
      notify('Streak Reminder', "Don't forget to check in today! Your streak is at risk.");
      localStorage.setItem(REMINDER_KEY, Date.now().toString());
    } else {
      timerRef.current = setTimeout(() => {
        if (alreadyRemindedToday()) return;
        notify('Streak Reminder', "Don't forget to check in today! Your streak is at risk.");
        localStorage.setItem(REMINDER_KEY, Date.now().toString());
      }, delay);
    }
  }, [notify]);

  return { notify, scheduleStreakReminder };
}
