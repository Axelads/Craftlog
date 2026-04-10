# Phase 6 — Polish visuel & Onboarding

> Statut : TERMINÉE

---

## Ce qui a été fait

### 1. Améliorations visuelles rapides (A → D)

| # | Feature | Fichiers |
|---|---------|---------|
| A | **Titre en overlay sur les cards** — LinearGradient transparent→noir en bas de la cover, titre + série dans le gradient, badge statut top-left, poubelle top-right | `CardProject.js` |
| B | **Gradient hero cover** — LinearGradient transparent→`#0F172A` en bas de l'image de couverture dans ProjectDetailScreen | `ProjectDetailScreen.js` |
| C | **Barre de progression dégradée** — LinearGradient violet→teal à l'intérieur de l'Animated.View Reanimated | `ProgressBarCustom.js` |
| D | **Pull-to-refresh** — `RefreshControl` (spinner violet) sur HomeScreen FlatList et InventoryScreen FlatList | `HomeScreen.js`, `InventoryScreen.js` |

---

### 2. Améliorations d'impact moyen (E → F)

| # | Feature | Fichiers |
|---|---------|---------|
| E | **Skeleton loading** — 4 cartes squelettes pulsantes (shimmer via Reanimated `withRepeat`) au premier chargement de HomeScreen | `SkeletonCard.js`, `HomeScreen.js` |
| F | **Célébration pièce terminée** — animation pop élastique (scale 1→1.35→1 via `withSequence` + `withSpring`) sur le bouton check quand une pièce passe à "Terminé" | `ProjectDetailScreen.js` (PartRow) |

> G (progress ring circulaire) non implémenté — décision utilisateur.

---

### 3. Améliorations ambitieuses (H → I)

| # | Feature | Détail | Fichiers |
|---|---------|--------|---------|
| H | **Glassmorphism sur les modals** | `expo-blur` installé. Composant `GlassOverlay` (`BlurView intensity=55, tint=dark`) avec support `position="center"` (dialog) et `position="bottom"` (bottom sheet). Appliqué sur 4 modals : "Nouvelle pièce", "Nouveau matériau", "Nouveau tutoriel", lecture tuto | `GlassOverlay.js`, `ProjectDetailScreen.js`, `PartDetailScreen.js` |
| I | **Shared element transition** | `sharedTransitionTag={"cover-${id}"}` sur `Animated.Image` dans CardProject → hero cover dans ProjectDetailScreen. La cover "vole" fluidement entre les deux écrans (Reanimated v4 natif, sans librairie supplémentaire) | `CardProject.js`, `ProjectDetailScreen.js` |

---

### 4. Onboarding — premier lancement

**Écran :** `src/screens/OnboardingScreen.js`
**Persistance :** `expo-secure-store` (clé `hasSeenOnboarding`)

**Séquence d'animations (toutes Reanimated) :**
1. Halo radial violet→teal scale in (0ms)
2. Logo spring élastique depuis 25% (200ms)
3. Titre "CraftLog" slide up + fade (700ms)
4. Tagline slide up + fade (950ms)
5. 3 features (Scissors, Camera, FileDown) slide up + fade (1250ms)
6. Bouton "Commencer ✦" spring + fade (1700ms) — gradient violet→teal + glow shadow

**Navigation :**
- `AppNavigator` restructuré : `RootStack` (Onboarding + Main)
- Vérifie SecureStore au démarrage → `initialRouteName` = `Onboarding` ou `Main`
- `navigation.replace('Main')` après tap bouton → pas de retour possible

---

### 5. Footer crédit

**Composant :** `src/components/common/FooterCredit.js`

- Texte : *propulsé par* **Axel Grégoire** (lien cliquable → `www.axelgregoire.fr` via `Linking.openURL`)
- Présent sur : **OnboardingScreen** (absolu bas), **HomeScreen** (ListFooterComponent), **SettingsScreen** (bas de page)

---

## Packages installés en Phase 6

```
expo-linear-gradient   ← gradients (A, B, C, bouton onboarding)
expo-blur              ← glassmorphism (H)
expo-secure-store      ← persistance onboarding (remplacement d'AsyncStorage incompatible Expo Go)
@react-native-async-storage/async-storage  ← installé puis abandonné (non dispo Expo Go)
```

---

## Architecture mise à jour

```
src/
├── components/common/
│   ├── FooterCredit.js       ← NOUVEAU
│   ├── GlassOverlay.js       ← NOUVEAU
│   ├── ProgressBarCustom.js  ← MAJ (LinearGradient)
│   └── SkeletonCard.js       ← NOUVEAU
├── components/project/
│   └── CardProject.js        ← MAJ (overlay, shared transition)
├── navigation/
│   └── AppNavigator.js       ← MAJ (RootStack + SecureStore)
└── screens/
    ├── HomeScreen.js          ← MAJ (skeleton, pull-to-refresh, footer)
    ├── InventoryScreen.js     ← MAJ (pull-to-refresh)
    ├── OnboardingScreen.js    ← NOUVEAU
    ├── PartDetailScreen.js    ← MAJ (GlassOverlay)
    ├── ProjectDetailScreen.js ← MAJ (gradient hero, shared transition, GlassOverlay, célébration)
    └── SettingsScreen.js      ← MAJ (FooterCredit)
```

---

## Ce qui reste pour la Phase 7

- ✅ Édition d'un projet existant (modifier cover, nom, deadline, budget)
- ✅ Recherche projets sur HomeScreen
- ☐ Badge inventaire — bulle sur l'onglet Inventaire (nb articles à acheter)
- ☐ Haptic feedback — `expo-haptics` sur les actions clés
- ☐ Rappels deadline — `expo-notifications` quand une deadline approche
- ☐ IAP réel via `expo-in-app-purchases` (remplacement du flag `FORCE_PREMIUM`)
- ☐ Restauration des achats (obligatoire Apple)
- ☐ Soumission stores (EAS Build + TestFlight + Google Play internal)
