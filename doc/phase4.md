# Phase 4 — Export PDF & Freemium

> Statut : TERMINÉE

---

## Ce qui est prévu

### 1. Générateur de PDF

- **Librairies** : `expo-print` + `expo-sharing` (déjà installées)
- Génération d'un PDF HTML via `expo-print` → converti en fichier `.pdf`
- Partage natif via `expo-sharing` (AirDrop, email, Drive, etc.)

**Mise en page du PDF :**
- Page de couverture : image cover + nom du projet + personnage + série
- Résumé projet : statut, deadline, budget total vs limite, temps total
- Détail par pièce : nom, statut, temps passé, liste des matériaux
- Galerie de progression : grille de photos avec leurs notes
- Récapitulatif budget : total par pièce + total global

---

### 2. Restriction Freemium

- Max **2 projets** en version gratuite
- Au-delà de 2 projets : affichage d'un bloc "upgrade" à la place du FAB
- Vérification du nombre de projets existants avant la création
- Flag `isPremium` à stocker (local pour l'instant, préparation pour IAP)

---

### 3. Écran Settings — Section "À propos / Upgrade"

- Ajout d'une section dans `SettingsScreen.js` :
  - Version de l'app
  - Lien vers les mentions légales / politique de confidentialité
  - Bouton "Passer en version Pro" (placeholder IAP)
  - Badge "PRO" si premium actif

---

### 4. Navigation mise à jour

```
HomeStack :
  Home
  CreateProject
  ProjectDetail
  PartDetail
  Gallery
  (pas de nouvel écran — le PDF est une action, pas un écran)
```

---

## Flux complet Phase 4

```
ProjectDetailScreen
 └─ [Exporter en PDF] → expo-print génère le PDF
                          └─ expo-sharing → partage natif

HomeScreen
 └─ FAB + bloqué si ≥ 2 projets (version gratuite)
     └─ Bloc upgrade → SettingsScreen (section Pro)

SettingsScreen
 └─ Section À propos
     └─ Bouton "Passer Pro" → (placeholder IAP)
```

---

## Ce qui reste pour la Phase 4

- ✅ Générateur de PDF avec `expo-print` + `expo-sharing`
- ✅ Mise en page HTML du PDF (cover, résumé, photos, budget)
- ✅ Restriction freemium : max 2 projets en version gratuite
- ✅ Bloc upgrade sur HomeScreen si limite atteinte
- ✅ Section "À propos / Upgrade" dans SettingsScreen
