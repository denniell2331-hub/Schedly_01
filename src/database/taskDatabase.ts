import { getDatabase } from './database';
import type { Task } from '../types/task';

/**
 * Get all tasks from SQLite.
 */
export async function getTasks(): Promise<Task[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    description: string;
    priority: Task['priority'];
    deadline: string;
    completed: number;
  }>(
    `
      SELECT
        id,
        title,
        description,
        priority,
        deadline,
        completed
      FROM tasks
      ORDER BY id DESC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    deadline: row.deadline,
    completed: row.completed === 1,
  }));
}


/**
 * Insert a new task into SQLite.
 */
export async function insertTask(
  task: Task
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO tasks (
        id,
        title,
        description,
        priority,
        deadline,
        completed,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    task.id,
    task.title,
    task.description,
    task.priority,
    task.deadline,
    task.completed ? 1 : 0,
    new Date().toISOString()
  );
}


/**
 * Insert the initial sample tasks once.
 */
export async function seedInitialTasks(
  initialTasks: Task[]
): Promise<Task[]> {
  const db = await getDatabase();

  const metadata =
    await db.getFirstAsync<{
      value: string;
    }>(
      `
        SELECT value
        FROM app_metadata
        WHERE key = ?
      `,
      'initial_tasks_seeded'
    );

  if (metadata?.value === 'true') {
    return getTasks();
  }

  const existingTasks =
    await db.getFirstAsync<{
      count: number;
    }>(
      `
        SELECT COUNT(*) as count
        FROM tasks
      `
    );

  if ((existingTasks?.count ?? 0) === 0) {
    for (const task of initialTasks) {
      await insertTask(task);
    }
  }

  await db.runAsync(
    `
      INSERT OR REPLACE INTO app_metadata (
        key,
        value
      )
      VALUES (?, ?)
    `,
    'initial_tasks_seeded',
    'true'
  );

  return getTasks();
}


/**
 * Update whether a task is completed.
 */
export async function updateTaskCompletion(
  id: number,
  completed: boolean
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE tasks
      SET completed = ?
      WHERE id = ?
    `,
    completed ? 1 : 0,
    id
  );
}


/**
 * Delete a task from SQLite.
 */
export async function deleteTaskFromDatabase(
  id: number
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
    `,
    id
  );
}