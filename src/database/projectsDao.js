import { getDatabase } from './db';

export const getAllProjects = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM projects ORDER BY created_at DESC');
};

export const getProjectById = async (id) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM projects WHERE id = ?', [id]);
};

export const createProject = async ({ name, character_name, series, deadline, budget_limit, cover_image }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO projects (name, character_name, series, deadline, budget_limit, cover_image) VALUES (?, ?, ?, ?, ?, ?)',
    [name, character_name ?? null, series ?? null, deadline ?? null, budget_limit ?? 0, cover_image ?? null]
  );
  return result.lastInsertRowId;
};

export const updateProject = async (id, fields) => {
  const db = getDatabase();
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(fields), id];
  await db.runAsync(`UPDATE projects SET ${setClause} WHERE id = ?`, values);
};

export const deleteProject = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
};
