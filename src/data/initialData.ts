import type { Task } from '../types/task';

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Math Assignment',
    description: 'Complete the assigned mathematics problems.',
    priority: 'High',
    deadline: 'Today',
    completed: false,
  },
  {
    id: 2,
    title: 'Science Project',
    description: 'Work on the science project.',
    priority: 'Medium',
    deadline: 'Tomorrow',
    completed: false,
  },
  {
    id: 3,
    title: 'English Quiz',
    description: 'Review the English quiz materials.',
    priority: 'Low',
    deadline: 'Friday',
    completed: false,
  },
];