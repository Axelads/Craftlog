import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getProjectById } from '../database/projectsDao';
import { getPartsByProject } from '../database/partsDao';
import { getMaterialsByPart } from '../database/materialsDao';
import { getGalleryByProject } from '../database/galleryDao';

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
}

async function toBase64(uri) {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

function buildHTML({ project, partsWithMaterials, photos, coverSrc, totalCost, totalTime, doneCount }) {
  const statusLabel = project.status === 'finished' ? 'Terminé' : 'En cours';
  const statusColor = project.status === 'finished' ? '#0d9488' : '#9333ea';
  const statusBg = project.status === 'finished' ? '#ccfbf1' : '#f3e8ff';

  const coverHTML = coverSrc
    ? `<img src="${coverSrc}" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;margin-bottom:28px;" />`
    : `<div style="width:100%;height:120px;background:#1e293b;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:28px;font-size:48px;">🎭</div>`;

  const partsRows = partsWithMaterials.map((part) => {
    const done = part.status === 'finished';
    const partCost = part.materials.reduce((a, m) => a + (m.price || 0), 0);
    const matRows = part.materials.map((m) => `
      <tr>
        <td style="padding:8px 12px 8px 32px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;">
          ${m.is_bought ? '✓' : '○'} ${m.name}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:${m.is_bought ? '#0d9488' : '#94a3b8'};">
          ${m.is_bought ? 'Acheté' : 'À acheter'}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#a855f7;font-weight:600;">
          ${m.price > 0 ? m.price.toFixed(2) + ' €' : '—'}
        </td>
      </tr>
    `).join('');

    return `
      <tr style="background:#f8fafc;">
        <td style="padding:12px;font-weight:700;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">
          ${part.name}
        </td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
          <span style="background:${done ? '#ccfbf1' : '#f3e8ff'};color:${done ? '#0d9488' : '#9333ea'};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;">
            ${done ? 'Terminé' : 'En cours'}
          </span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#475569;">
          ${formatTime(part.time_spent)}
        </td>
      </tr>
      ${matRows}
    `;
  }).join('');

  const photosHTML = photos.length > 0 ? `
    <div style="margin:40px;">
      <h2 style="font-size:20px;font-weight:700;color:#0f172a;border-bottom:2px solid #a855f7;padding-bottom:8px;margin-bottom:20px;">
        Galerie de progression (${photos.length} photo${photos.length > 1 ? 's' : ''})
      </h2>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        ${photos.map((p) => p.src ? `
          <div style="width:calc(33% - 8px);">
            <img src="${p.src}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;" />
            ${p.note ? `<p style="font-size:11px;color:#64748b;margin-top:4px;">${p.note}</p>` : ''}
            ${p.date ? `<p style="font-size:10px;color:#94a3b8;margin-top:2px;">${p.date?.split('T')[0] ?? ''}</p>` : ''}
          </div>
        ` : '').join('')}
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#ffffff;">

  <!-- Cover -->
  <div style="background:#0f172a;padding:48px 40px;text-align:center;page-break-after:always;">
    ${coverHTML}
    <h1 style="font-size:32px;font-weight:700;color:#f8fafc;margin:0 0 8px 0;">
      ${project.character_name || project.name}
    </h1>
    ${project.series ? `<p style="font-size:16px;color:#94a3b8;margin:0 0 16px 0;">${project.series}</p>` : ''}
    ${project.deadline ? `<p style="font-size:13px;color:#94a3b8;margin:0 0 12px 0;">Deadline : ${project.deadline}</p>` : ''}
    <span style="background:${statusBg};color:${statusColor};padding:6px 18px;border-radius:999px;font-size:13px;font-weight:600;">
      ${statusLabel}
    </span>
    <p style="font-size:11px;color:#475569;margin-top:32px;">
      Généré par CraftLog
    </p>
  </div>

  <!-- Stats -->
  <div style="margin:40px;">
    <h2 style="font-size:20px;font-weight:700;color:#0f172a;border-bottom:2px solid #a855f7;padding-bottom:8px;margin-bottom:20px;">
      Résumé du projet
    </h2>
    <div style="display:flex;gap:16px;">
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
        <div style="font-size:28px;font-weight:700;color:#0f172a;">${doneCount}/${partsWithMaterials.length}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Pièces terminées</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
        <div style="font-size:28px;font-weight:700;color:#a855f7;">${totalCost.toFixed(2)} €</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Budget total</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
        <div style="font-size:28px;font-weight:700;color:#0d9488;">${formatTime(totalTime)}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Temps total</div>
      </div>
    </div>
  </div>

  <!-- Pièces & matériaux -->
  <div style="margin:40px;">
    <h2 style="font-size:20px;font-weight:700;color:#0f172a;border-bottom:2px solid #a855f7;padding-bottom:8px;margin-bottom:20px;">
      Pièces &amp; Matériaux
    </h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Pièce / Matériau</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Statut</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Temps / Prix</th>
        </tr>
      </thead>
      <tbody>
        ${partsRows}
      </tbody>
    </table>
  </div>

  ${photosHTML}

  <!-- Footer -->
  <div style="text-align:center;padding:24px;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;margin-top:16px;">
    CraftLog — ${project.character_name || project.name} — Exporté le ${new Date().toLocaleDateString('fr-FR')}
  </div>

</body>
</html>`;
}

export async function exportProjectPDF(projectId) {
  const [project, parts, photos] = await Promise.all([
    getProjectById(projectId),
    getPartsByProject(projectId),
    getGalleryByProject(projectId),
  ]);

  const partsWithMaterials = await Promise.all(
    parts.map(async (part) => ({
      ...part,
      materials: await getMaterialsByPart(part.id),
    }))
  );

  const coverSrc = project.cover_image ? await toBase64(project.cover_image) : null;

  const photosWithBase64 = await Promise.all(
    photos.map(async (p) => ({ ...p, src: await toBase64(p.image_uri) }))
  );

  const totalCost = partsWithMaterials.reduce(
    (acc, part) => acc + part.materials.reduce((a, m) => a + (m.price || 0), 0), 0
  );
  const totalTime = parts.reduce((acc, p) => acc + (p.time_spent || 0), 0);
  const doneCount = parts.filter((p) => p.status === 'finished').length;

  const html = buildHTML({ project, partsWithMaterials, photos: photosWithBase64, coverSrc, totalCost, totalTime, doneCount });

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Exporter ${project.character_name || project.name}`,
    UTI: 'com.adobe.pdf',
  });
}
