import { getDatabase } from './db';

export const getMaterialsByPart = async (partId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM materials WHERE part_id = ?', [partId]);
};

export const createMaterial = async ({ part_id, name, price, store_link }) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO materials (part_id, name, price, store_link) VALUES (?, ?, ?, ?)',
    [part_id, name, price ?? 0, store_link ?? null]
  );
  return result.lastInsertRowId;
};

export const updateMaterial = async (id, fields) => {
  const db = getDatabase();
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(fields), id];
  await db.runAsync(`UPDATE materials SET ${setClause} WHERE id = ?`, values);
};

export const deleteMaterial = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM materials WHERE id = ?', [id]);
};

export const getAllMaterialsWithProject = async () => {
  const db = getDatabase();
  return await db.getAllAsync(
    `SELECT m.*, p.name as part_name, pr.name as project_name, pr.id as project_id
     FROM materials m
     JOIN parts p ON m.part_id = p.id
     JOIN projects pr ON p.project_id = pr.id
     ORDER BY pr.name, p.name, m.name`
  );
};

export const getTotalCostByProject = async (projectId) => {
  const db = getDatabase();
  const row = await db.getFirstAsync(
    `SELECT SUM(m.price) as total
     FROM materials m
     JOIN parts p ON m.part_id = p.id
     WHERE p.project_id = ?`,
    [projectId]
  );
  return row?.total ?? 0;
};
