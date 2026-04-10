# Phase 5 — UX & Contenu enrichi

> Statut : TERMINÉE

---

## Ce qui a été fait

### 1. Suppression de projet

- **Card HomeScreen** : icône poubelle discrète en haut à droite du titre de chaque carte → Alert de confirmation → supprime et recharge
- **ProjectDetailScreen** : icône poubelle rouge à côté du titre → Alert de confirmation → supprime et retourne à l'accueil
- `deleteProject()` existait déjà dans `projectsDao.js`, branché dans les deux écrans

---

### 2. Refonte de la grille HomeScreen

- Grille **2 colonnes** (`numColumns={2}` sur FlatList)
- Largeur fixe par carte : `(screenWidth - 32 - 8) / 2` → pas d'étirement sur les lignes impaires
- Cover image en **format carré** (`aspectRatio: 1`) avec `resizeMode: 'contain'` → photo entière visible, pas coupée
- Conteneur sombre derrière si l'image ne remplit pas tout

---

### 3. Patrons — nouvelle section dans PartDetailScreen

**DB :** nouvelle table `patrons` (id, part_id, uri, name, created_at)
**DAO :** `src/database/patronsDao.js`

**Fonctionnalités :**
- Scroll horizontal de thumbnails 110×110
- Bouton `+` → ouvre la galerie photo (`expo-image-picker`)
- Tap sur un patron → lightbox plein écran + bouton supprimer avec confirmation

---

### 4. Tutoriels — nouvelle section dans PartDetailScreen

**DB :** nouvelle table `tutos` (id, part_id, title, content, created_at)
**DAO :** `src/database/tutosDao.js`

**Fonctionnalités :**
- Liste de cartes avec titre + aperçu du contenu (2 lignes)
- Bouton `+` → modal bottom sheet (titre + zone texte multiline)
- Tap sur un tutoriel → modal lecture complète
- Poubelle pour supprimer avec confirmation

---

### 5. Planche de référence — nouvel écran

**DB :** 2 nouvelles tables
```sql
reference_images (id, project_id, uri, label, created_at)
reference_board  (id, project_id, bg_color, bg_image_uri)  ← unique par projet
```
**DAO :** `src/database/referenceBoardDao.js`
**Écran :** `src/screens/ReferenceBoardScreen.js`

**Fonctionnalités :**
- Canvas plein écran avec images positionnées automatiquement selon leur **label de partie du corps**
- 16 labels disponibles : Corps complet, Tête, Casque, Visage, Yeux, Torse, Dos, Bras droit/gauche, Main droite/gauche, Jambe droite/gauche, Pied, Accessoire, Autre
- Chaque label a une position et taille **prédéfinies** sur le canvas :
  - Corps complet → grand (50% canvas), à gauche
  - Tête / Casque / Visage → moyen (28%), en haut à droite
  - Yeux → petit (15%), sous la tête
  - Torse / Dos → moyen (26%), centre droit
  - Bras / Jambes → moyens (20-22%), bas
  - Mains / Pieds / Accessoires → petits (14-16%), bas
- **Fond** : 12 couleurs prédéfinies + image depuis galerie → changement en **temps réel**
- Tap sur une image → lightbox + suppression

**Navigation :**
```
HomeStack :
  Home
  CreateProject
  ProjectDetail
  PartDetail
  Gallery
  ReferenceBoard   ← NOUVEAU
```

**Accès :** bouton "Planche de référence" (violet) en haut des actions dans ProjectDetailScreen

---

## Flux complet Phase 5

```
ProjectDetailScreen
 ├─ [Planche de référence] → ReferenceBoardScreen
 │                             ├─ [Fond] → couleur ou image galerie
 │                             └─ [+ Ajouter] → sélection label → galerie → canvas
 └─ [Supprimer projet] → Alert → supprime + retour Home

HomeScreen
 └─ CardProject → poubelle → Alert → supprime

PartDetailScreen
 ├─ Section Patrons
 │   └─ [+] → galerie → scroll horizontal + lightbox
 └─ Section Tutoriels
     └─ [+] → modal (titre + texte) → card lisible
```

---

## Ce qui reste pour la Phase 6

- ☐ IAP réel via `expo-in-app-purchases` (remplacement du flag `FORCE_PREMIUM`)
- ☐ Restauration des achats (obligatoire Apple)
- ☐ Édition d'un projet existant (modifier cover, nom, deadline, budget)
- ✅ Onboarding (écran de bienvenue au premier lancement)
- ☐ Soumission stores (EAS Build + TestFlight + Google Play internal)
