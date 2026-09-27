import { getDatabase } from './database';


// ======================================================
// TYPES
// ======================================================

export type AcademicEventColor =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange';

export type AcademicEventIcon =
  | string;

export type AcademicEventType =
  | 'Quiz'
  | 'Exam'
  | 'PIT'
  | 'Assignment'
  | 'Project'
  | 'Others';


export type AcademicEventRecord = {
  id: number;
  eventType: AcademicEventType;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  color: AcademicEventColor;
  icon: AcademicEventIcon;
};


// ======================================================
// GET ALL ACADEMIC EVENTS
// ======================================================

export async function getAcademicEvents(): Promise<
  AcademicEventRecord[]
> {

  const db =
    await getDatabase();


  const rows =
    await db.getAllAsync<{
      id: number;
      event_type: AcademicEventType;
      subject: string;
      date: string;
      start_time: string;
      end_time: string;
      description: string;
      color: AcademicEventColor;
      icon: string;
    }>(
      `
        SELECT
          id,
          event_type,
          subject,
          date,
          start_time,
          end_time,
          description,
          color,
          icon
        FROM academic_events
        ORDER BY date ASC, start_time ASC
      `
    );


  return rows.map(
    (row) => ({
      id: row.id,

      eventType:
        row.event_type,

      subject:
        row.subject,

      date:
        row.date,

      startTime:
        row.start_time,

      endTime:
        row.end_time,

      description:
        row.description,

      color:
        row.color,

      icon:
        row.icon,
    })
  );
}


// ======================================================
// INSERT ACADEMIC EVENT
// ======================================================

export async function insertAcademicEvent(
  event: AcademicEventRecord
): Promise<void> {

  const db =
    await getDatabase();


  await db.runAsync(
    `
      INSERT INTO academic_events (
        id,
        event_type,
        subject,
        date,
        start_time,
        end_time,
        description,
        color,
        icon,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    event.id,

    event.eventType,

    event.subject,

    event.date,

    event.startTime,

    event.endTime,

    event.description,

    event.color,

    event.icon,

    new Date().toISOString()
  );
}


// ======================================================
// DELETE ACADEMIC EVENT
// ======================================================

export async function deleteAcademicEvent(
  id: number
): Promise<void> {

  const db =
    await getDatabase();


  await db.runAsync(
    `
      DELETE FROM academic_events
      WHERE id = ?
    `,
    id
  );
}


// ======================================================
// UPDATE ACADEMIC EVENT
// ======================================================

export async function updateAcademicEvent(
  event: AcademicEventRecord
): Promise<void> {

  const db =
    await getDatabase();


  await db.runAsync(
    `
      UPDATE academic_events
      SET
        event_type = ?,
        subject = ?,
        date = ?,
        start_time = ?,
        end_time = ?,
        description = ?,
        color = ?,
        icon = ?
      WHERE id = ?
    `,

    event.eventType,

    event.subject,

    event.date,

    event.startTime,

    event.endTime,

    event.description,

    event.color,

    event.icon,

    event.id
  );
}