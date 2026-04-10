# Phase 2 — Gestion des Projets (Le cœur)

> Statut : TERMINÉE

---

## Ce qui a été fait

### 1. CreateProjectScreen — Refonte complète

**Nouvelles fonctionnalités :**
- **Photo de couverture** : sélection depuis la galerie via `expo-image-picker`
  - Ratio 16:9 forcé, qualité 0.8
  - Preview immédiat, bouton de suppression (croix)
  - Placeholder visuel avec icône caméra
- **DatePicker natif** (`@react-native-community/datetimepicker`)
  - iOS : mode `spinner` avec thème dark
  - Android : mode `default` (dialog natif)
  - Date minimale = aujourd'hui
  - Affichage formaté en français via `date-fns/locale/fr`
  - Bouton clear pour retirer la date
- Les données sont sauvegardées en SQLite et l'écran redirige vers `ProjectDetailScreen`

**Nouvelle dépendance :**
```
@react-native-community/datetimepicker  (--legacy-peer-deps)
```

---

### 2. ProjectDetailScreen — Refonte complète

**Nouvelles fonctionnalités :**
- **Hero image** : affichage de la cover en haut (200px), fallback emoji si pas de cover
- **Carte Avancement** : barre de progression animée + compteur pièces
- **Carte Budget** : barre de progression budget, alerte rouge si dépassé
- **Stats** : temps total cumulé des pièces + statut du projet
- **Gestion complète des pièces** :
  - Liste interactive avec statut (en cours / terminé)
  - Toggle statut via checkbox (tap) — pièce terminée = ✓ turquoise + texte barré
  - Suppression avec confirmation Alert
  - Affichage du temps passé par pièce
  - Navigation vers `PartDetailScreen` au tap sur une pièce
- **Modal ajout pièce** : overlay sombre, input auto-focus, bouton désactivé si vide
- Rechargement auto via `useFocusEffect` (retour depuis PartDetail)

---

### 3. PartDetailScreen — Nouveau

**Chronomètre :**
- Affichage `HH:MM:SS` style minimal, passe en violet quand actif
- Play / Pause
- Reset (avec confirmation)
- Bouton "Sauver" : additionne le temps de session au `time_spent` en base
- Sauvegarde automatique au unmount si le chrono tourne (via `useFocusEffect` cleanup)

**Matériaux :**
- Liste avec statut acheté/non-acheté (checkbox carré)
  - Ligne achetée = opacité réduite + texte barré
- Coût individuel affiché en violet
- Total calculé dynamiquement
- Lien boutique : icône `ExternalLink` turquoise si renseigné
- Suppression avec confirmation
- Modal d'ajout : nom, prix, lien boutique

---

### 4. Navigation mise à jour

```
HomeStack :
  Home
  CreateProject
  ProjectDetail
  PartDetail         ← NOUVEAU (titre dynamique = nom de la pièce)
```

---

## Flux complet Phase 2

```
Home
 └─ [FAB +] → CreateProjectScreen
                 ├─ Photo cover (galerie)
                 ├─ DatePicker deadline
                 └─ [Créer] → ProjectDetailScreen
                               ├─ Hero cover
                               ├─ Avancement (barre)
                               ├─ Budget (barre + alerte)
                               ├─ [Ajouter pièce] → Modal
                               └─ [Tap pièce] → PartDetailScreen
                                                   ├─ Chronomètre
                                                   └─ Matériaux (CRUD)
```

---

## Ce qui reste pour la Phase 3

- ✅ Module Inventaire global (vue tous matériaux cross-projets)
- ✅ Calculateur budget : affichage détaillé par pièce
- ✅ Filtre matériaux : achetés / à acheter
- ✅ Galerie de progression (photos par pièce avec notes)
- ✅ Écran galerie avec grille d'images
