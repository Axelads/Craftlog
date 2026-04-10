# Phase 3 — Galerie & Inventaire

> Statut : TERMINÉE

---

## Ce qui a été fait

### 1. InventoryScreen — Refonte complète

Vue globale cross-projets de tous les matériaux.

**Fonctionnalités :**
- **3 stats en haut** : À acheter / Achetés / Total €
- **Barre de recherche** : filtre par nom de matériau ou nom de projet
- **Filtres** : Tous / À acheter / Achetés (pills)
- **Toggle acheté** directement depuis la liste (checkbox carré)
- **Ligne matériau** : nom, projet + pièce associée, prix
- Rechargement automatique via `useFocusEffect`

**Nouveau DAO** — `getAllMaterialsWithProject()` dans `materialsDao.js` :
```sql
SELECT m.*, p.name as part_name, pr.name as project_name, pr.id as project_id
FROM materials m
JOIN parts p ON m.part_id = p.id
JOIN projects pr ON p.project_id = pr.id
ORDER BY pr.name, p.name, m.name
```

---

### 2. GalleryScreen — Nouveau

Grille d'images avec lightbox intégrée.

**Fonctionnalités :**
- **Grille 3 colonnes** de thumbnails (taille dynamique selon largeur écran)
- **Point violet** sur les photos ayant une note
- **Ajout photo** : depuis la galerie (`expo-image-picker`) ou caméra directe
- **Modal d'ajout** (bottom sheet) :
  - Preview de la photo
  - Sélection de la pièce associée (chips)
  - Note optionnelle (multiline)
- **Lightbox** (modal plein écran) :
  - Image en `contain`
  - Note affichée en overlay si présente
  - Date de prise
  - Bouton suppression avec confirmation

---

### 3. PartDetailScreen — Bouton galerie ajouté

- Nouveau bouton "Galerie de progression" en haut de l'écran
- Badge turquoise avec le nombre de photos
- Navigation vers `GalleryScreen` avec `partId` et `projectId`
- `loadData()` charge maintenant aussi le nombre de photos via `getGalleryByPart()`

---

### 4. ProjectDetailScreen — Bouton galerie ajouté

- Bouton "Voir la galerie de progression" entre les stats et les pièces
- Navigation directe vers `GalleryScreen` du projet

---

### 5. Navigation mise à jour

```
HomeStack :
  Home
  CreateProject
  ProjectDetail
  PartDetail
  Gallery          ← NOUVEAU (titre dynamique = nom du projet)
```

---

## Flux complet Phase 3

```
ProjectDetailScreen
 └─ [Galerie] → GalleryScreen (toutes photos du projet)
                 ├─ [Caméra / Galerie] → Modal ajout (pièce + note)
                 └─ [Tap photo] → Lightbox (zoom + note + supprimer)

PartDetailScreen
 └─ [Galerie de progression] → GalleryScreen (filtre par pièce)
```

---

## Ce qui reste pour la Phase 4 (Export PDF)

- ☐ Générateur de PDF avec `expo-print` + `expo-sharing`
- ☐ Mise en page : cover image, résumé projet, photos de progression, récap budget
- ☐ Restriction freemium : max 2 projets en version gratuite
- ☐ Écran "À propos" / upgrade dans Settings
