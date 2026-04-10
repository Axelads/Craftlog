import { getDatabase } from './db';

export const getPartsByProject = async (projectId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM parts WHERE project_id = ?', [projectId]);
};

export const createPart = async ({ project_id, name }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO parts (project_id, name) VALUES (?, ?)',
    [project_id, name]
  );
  return result.lastInsertRowId;
};

export const updatePart = async (id, fields) => {
  const db = getDatabase();
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(fields), id];
  await db.runAsync(`UPDATE parts SET ${setClause} WHERE id = ?`, values);
};

export const deletePart = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM parts WHERE id = ?', [id]);
};
