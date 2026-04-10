import { getDatabase } from './db';

export const getTutosByPart = async (partId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM tutos WHERE part_id = ? ORDER BY created_at DESC', [partId]);
};

export const addTuto = async ({ part_id, title, content }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO tutos (part_id, title, content) VALUES (?, ?, ?)',
    [part_id, title, content ?? null]
  );
  return result.lastInsertRowId;
};

export const updateTuto = async (id, { title, content }) => {
  const db = getDatabase();
  await db.runAsync('UPDATE tutos SET title = ?, content = ? WHERE id = ?', [title, content ?? null, id]);
};

export const deleteTuto = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM tutos WHERE id = ?', [id]);
};
