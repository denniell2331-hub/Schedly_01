import type { Task } from '../types/task';

export type HomeAcademicEvent = {
  id: string | number;
  eventType:
    | 'Quiz'
    | 'Exam'
    | 'PIT'
    | 'Assignment'
    | 'Project'
    | 'Others';
  subject: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
};

export type HomeNotification = {
  key: string;
  title: string;
  message: string;
  details?: string;
  icon:
    | 'alert-circle-outline'
    | 'help-circle-outline'
    | 'document-text-outline'
    | 'school-outline'
    | 'create-outline'
    | 'folder-outline'
    | 'ellipsis-horizontal-circle-outline';
  type: 'task' | 'schedule';
  sortDate: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const UPCOMING_ACTIVITY_DAYS = 7;

export function buildHomeNotifications(
  tasks: Task[],
  scheduleEvents: HomeAcademicEvent[],
  now: Date = new Date()
): HomeNotification[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const notifications: HomeNotification[] = [];

  tasks.forEach((task) => {
    if (task.completed) {
      return;
    }

    const deadlineDate = parseTaskDeadline(task.deadline);

    if (deadlineDate && deadlineDate.getTime() < now.getTime()) {
      notifications.push({
        key: `overdue-task-${task.id}-${task.deadline}`,
        title: 'Overdue task',
        message: `"${task.title}" has passed its deadline.`,
        details: `Deadline: ${task.deadline}`,
        icon: 'alert-circle-outline',
        type: 'task',
        sortDate: deadlineDate.getTime(),
      });
    }
  });

  const seenScheduleKeys = new Set<string>();

  scheduleEvents.forEach((event) => {
    const eventDate = parseDateOnly(event.date);

    if (!eventDate) {
      return;
    }

    const daysUntil = Math.floor(
      (eventDate.getTime() - today.getTime()) / DAY_IN_MS
    );

    if (daysUntil < 0 || daysUntil > UPCOMING_ACTIVITY_DAYS) {
      return;
    }

    const key = `schedule-${event.id}-${event.date}`;

    if (seenScheduleKeys.has(key)) {
      return;
    }

    seenScheduleKeys.add(key);

    const activityName =
      event.eventType === 'Others'
        ? 'activity'
        : event.eventType.toLowerCase();

    let message: string;

    if (daysUntil === 0) {
      message = `"${event.subject}" ${activityName} is scheduled today.`;
    } else if (daysUntil === 1) {
      message = `"${event.subject}" ${activityName} is scheduled tomorrow.`;
    } else {
      message = `"${event.subject}" ${activityName} is scheduled in ${daysUntil} days.`;
    }

    const details = [
      formatDisplayDate(eventDate),
      formatTimeRange(event.startTime, event.endTime),
      event.description?.trim(),
    ]
      .filter(Boolean)
      .join(' · ');

    notifications.push({
      key,
      title: `Upcoming ${activityName}`,
      message,
      details,
      icon: getActivityIcon(event.eventType),
      type: 'schedule',
      sortDate: eventDate.getTime(),
    });
  });

  const uniqueNotifications = Array.from(
    new Map(
      notifications.map((notification) => [
        notification.key,
        notification,
      ])
    ).values()
  );

  return uniqueNotifications.sort((first, second) => {
    if (first.type === 'task' && second.type === 'schedule') {
      return -1;
    }

    if (first.type === 'schedule' && second.type === 'task') {
      return 1;
    }

    return first.sortDate - second.sortDate;
  });
}

export function hasUnreadHomeNotifications(
  notifications: HomeNotification[],
  seenKeys: string[]
): boolean {
  const seen = new Set(seenKeys);
  return notifications.some(
    (notification) => !seen.has(notification.key)
  );
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseTaskDeadline(deadline: string): Date | null {
  const trimmed = deadline.trim();

  if (!trimmed) {
    return null;
  }

  const dateOnly = parseDateOnly(trimmed);

  if (dateOnly) {
    dateOnly.setHours(23, 59, 59, 999);
    return dateOnly;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(
  startTime?: string,
  endTime?: string
): string | undefined {
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || endTime;
}

function getActivityIcon(
  eventType: HomeAcademicEvent['eventType']
): HomeNotification['icon'] {
  switch (eventType) {
    case 'Quiz':
      return 'help-circle-outline';
    case 'Exam':
      return 'document-text-outline';
    case 'PIT':
      return 'school-outline';
    case 'Assignment':
      return 'create-outline';
    case 'Project':
      return 'folder-outline';
    case 'Others':
      return 'ellipsis-horizontal-circle-outline';
  }
}
