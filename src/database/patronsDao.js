import { getDatabase } from './db';

export const getPatronsByPart = async (partId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM patrons WHERE part_id = ? ORDER BY created_at DESC', [partId]);
};

export const addPatron = async ({ part_id, uri, name }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO patrons (part_id, uri, name) VALUES (?, ?, ?)',
    [part_id, uri, name ?? null]
  );
  return result.lastInsertRowId;
};

export const deletePatron = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM patrons WHERE id = ?', [id]);
};
