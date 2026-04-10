import { getDatabase } from './db';

export const getGalleryByPart = async (partId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM gallery WHERE part_id = ? ORDER BY date DESC', [partId]);
};

export const getGalleryByProject = async (projectId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    `SELECT g.* FROM gallery g
     JOIN parts p ON g.part_id = p.id
     WHERE p.project_id = ?
     ORDER BY g.date DESC`,
    [projectId]
  );
};

export const addPhoto = async ({ part_id, image_uri, note }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO gallery (part_id, image_uri, note) VALUES (?, ?, ?)',
    [part_id, image_uri, note ?? null]
  );
  return result.lastInsertRowId;
};

export const deletePhoto = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM gallery WHERE id = ?', [id]);
};
