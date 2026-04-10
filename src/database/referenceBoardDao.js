import { getDatabase } from './db';

export const getReferenceImages = async (projectId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM reference_images WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  );
};

export const addReferenceImage = async ({ project_id, uri, label }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO reference_images (project_id, uri, label) VALUES (?, ?, ?)',
    [project_id, uri, label]
  );
  return result.lastInsertRowId;
};

export const deleteReferenceImage = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM reference_images WHERE id = ?', [id]);
};

export const getReferenceBoardSettings = async (projectId) => {
  const db = getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM reference_board WHERE project_id = ?',
    [projectId]
  );
};

export const upsertReferenceBoardSettings = async (projectId, { bg_color, bg_image_uri }) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO reference_board (project_id, bg_color, bg_image_uri)
     VALUES (?, ?, ?)
     ON CONFLICT(project_id) DO UPDATE SET bg_color = excluded.bg_color, bg_image_uri = excluded.bg_image_uri`,
    [projectId, bg_color ?? '#1A1A2E', bg_image_uri ?? null]
  );
};
