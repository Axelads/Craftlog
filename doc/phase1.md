# Phase 1 — Initialisation & Architecture

> Statut : TERMINÉE
> Stack : React Native (Expo SDK 55) · JavaScript ES6+ · SCSS · SQLite · Zustand

---

## 1. Initialisation du projet

- Création via `npx create-expo-app@latest` (template blank JS)
- Mise à jour Node.js : v20.16.0 → **v24.14.0** via nvm-windows
- Correction du nom : `CraftlogTemp` → **`CraftLog`** (`package.json` + `app.json`)
- `app.json` configuré :
  - `userInterfaceStyle: "dark"`
  - `slug: "craftlog"`, `bundleIdentifier: "com.craftlog.app"`
  - Splash screen : `logo_nom.png` sur fond `#0F172A`
  - Icône iOS : `logo.png` (fond transparent)
  - Icône Android adaptive : `logo.png` + fond `#0F172A`
  - Favicon web : `logo.png`

---

## 2. Dépendances installées

> Toutes les installations npm nécessitent le flag `--legacy-peer-deps` (conflits peer deps react-native-fast-image / React 19)

### Expo managed
```
expo-sqlite
expo-image-picker
expo-print
expo-sharing
```

### Navigation
```
@react-navigation/native
@react-navigation/stack
@react-navigation/bottom-tabs
react-native-screens@4.23.0
react-native-safe-area-context@5.6.2
react-native-gesture-handler
@react-native-masked-view/masked-view
```

### UI & Animations
```
react-native-paper
react-native-reanimated@4.2.1
react-native-worklets          ← requis par reanimated v4
react-native-svg               ← requis par lucide-react-native
lucide-react-native
```

### Images
```
expo-image-picker
react-native-fast-image
```

### SCSS
```
react-native-sass-transformer
sass
babel-preset-expo              ← installé à la racine (requis par sass-transformer)
metro-react-native-babel-transformer  ← requis par sass-transformer
```

### Divers
```
date-fns
zustand
```

### Tunnel dev
```
@expo/ngrok@^4.1.0 (global)
```

---

## 3. Configuration Metro & Babel

### `babel.config.js`
- Preset : `babel-preset-expo`
- Plugin : `react-native-reanimated/plugin` (obligatoire, doit être en dernier)

### `metro.config.js`
- `babelTransformerPath` → `react-native-sass-transformer`
- `sourceExts` enrichi avec `scss` et `sass`
- `assetExts` : `scss`/`sass` exclus

---

## 4. Architecture des dossiers

```
src/
├── components/
│   ├── common/
│   │   ├── FloatingActionButton.js   ← FAB animé (Reanimated spring)
│   │   ├── ProgressBarCustom.js      ← Barre animée withTiming
│   │   └── StatBadge.js              ← Affichage budget / stats
│   └── project/
│       └── CardProject.js            ← Carte projet (cover + badge + progress)
├── database/
│   ├── db.js                         ← openDatabaseSync + initDatabase()
│   ├── schema.js                     ← CREATE TABLE (4 tables)
│   ├── projectsDao.js                ← CRUD projets
│   ├── partsDao.js                   ← CRUD pièces
│   ├── materialsDao.js               ← CRUD matériaux + getTotalCostByProject()
│   └── galleryDao.js                 ← CRUD galerie photos
├── navigation/
│   └── AppNavigator.js               ← Stack + Bottom Tabs
├── screens/
│   ├── HomeScreen.js                 ← Dashboard filtrable (tous / en cours / terminés)
│   ├── CreateProjectScreen.js        ← Formulaire création projet
│   ├── ProjectDetailScreen.js        ← Détail + pièces + stats budget
│   ├── InventoryScreen.js            ← Placeholder (Phase 3)
│   └── SettingsScreen.js             ← Réglages + infos app
├── store/                            ← Prêt pour Zustand (Phase 2+)
├── styles/
│   ├── _variables.scss               ← Palette Deep Workshop
│   ├── _mixins.scss                  ← Glassmorphism, card, badge
│   └── global.scss                   ← Classes utilitaires
├── hooks/                            ← Prêt pour les custom hooks
└── utils/                            ← Prêt pour les utilitaires
```

---

## 5. Base de données SQLite

4 tables avec cascade delete :

```sql
projects   (id, name, character_name, series, deadline, budget_limit, status, cover_image, created_at)
parts      (id, project_id, name, status, time_spent)
materials  (id, part_id, name, price, store_link, is_bought)
gallery    (id, part_id, image_uri, note, date)
```

- Init async au démarrage dans `App.js` avant le rendu de la navigation
- DAO pattern : chaque table a son fichier dédié avec fonctions async/await

---

## 6. Navigation

- **Bottom Tabs** : Projets / Inventaire / Réglages
- **Stack (HomeTab)** :
  - `Home` → Dashboard
  - `CreateProject` → Formulaire nouveau projet
  - `ProjectDetail` → Détail d'un projet existant
- Thème dark : fond `#1E293B`, accent `#A855F7`, inactif `#94A3B8`

---

## 7. Design System (da.md — "Deep Workshop")

| Token | Valeur | Usage |
|---|---|---|
| `$color-bg-primary` | `#0F172A` | Fond écrans |
| `$color-bg-surface` | `#1E293B` | Cartes, inputs |
| `$color-accent` | `#A855F7` | Actions, branding |
| `$color-accent-teal` | `#2DD4BF` | Succès, validé |
| `$color-text-primary` | `#F8FAFC` | Texte principal |
| `$color-text-secondary` | `#94A3B8` | Infos secondaires |
| `$color-border` | `#334155` | Bordures 1px |

**Effets** : glassmorphism (`rgba` + blur), gradients Violet→Turquoise sur progress bars, ombres colorées sur FAB et boutons.

---

## 8. Bugs résolus durant la phase 1

| Erreur | Cause | Fix |
|---|---|---|
| `Cannot find module 'metro-react-native-babel-transformer'` | Dépendance manquante de sass-transformer | `npm install metro-react-native-babel-transformer` |
| `Cannot find module 'react-native-worklets/plugin'` | Reanimated v4 a séparé les worklets | `npm install react-native-worklets` |
| `Cannot find module 'babel-preset-expo'` | sass-transformer cherche le preset à la racine | `npm install babel-preset-expo` |
| `Unable to resolve "react-native-svg"` | Peer dep manquante de lucide-react-native | `npm install react-native-svg` |
| FAB `+` → "Chargement..." infini | Pas d'écran de création, ProjectDetail attendait un ID | Création de `CreateProjectScreen.js` |
| Incompatible with Expo Go | SDK 55 nécessite Expo Go Beta | Mise à jour Expo Go vers version Beta |

---

## Ce qui reste pour la Phase 2

- ✅ Formulaire de création avec DatePicker natif pour la deadline
- ✅ Photo de couverture du projet (expo-image-picker)
- ✅ Ajout / édition / suppression de pièces depuis ProjectDetail
- ✅ Ajout de matériaux par pièce
- ✅ Calcul budget en temps réel
- ✅ Chronomètre temps passé par pièce
