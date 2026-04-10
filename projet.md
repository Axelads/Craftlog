📄 Fichier d'Instruction pour Claude : Projet "CraftLog"
🎯 Vision du Produit
Nom de code : CraftLog
Concept : Un compagnon de bord "offline-first" pour les Cosplayeurs et créateurs (Props, Modélisme). L'objectif est de remplacer les carnets de notes et les dossiers photos en désordre par une interface structurée, visuelle et rapide.
Cible : Créateurs exigeants, cherchant à suivre l'évolution de leurs costumes pour les concours ou les réseaux sociaux.

🛠 Stack Technique Imposée
Framework : React Native (Expo recommandé pour la gestion des assets/images).

Langage : JavaScript (ES6+).

Stylisation : SCSS / SASS (via react-native-sass-transformer).

Base de données : SQLite (via expo-sqlite) pour le stockage local asynchrone.

Gestion d'état : Context API ou Zustand (léger et performant).

📦 Bibliothèques & Dépendances (Tendances 2026)
Claude, tu devras initialiser le projet avec les éléments suivants :

Navigation : @react-navigation/native + stack & bottom-tabs.

UI/Composants : react-native-paper (pour les bases) couplé à react-native-reanimated pour des animations fluides.

Images : expo-image-picker (capture) et react-native-fast-image (performance d'affichage).

Export : expo-print & expo-sharing (pour la génération du PDF "Livre de bord").

Icônes : lucide-react-native (look moderne et épuré).

Date : date-fns.

🏗 Structure de la Base de Données (SQLite)
Le schéma doit être robuste pour permettre les relations :

Projects : id, name, character_name, series, deadline, budget_limit, status (in_progress, finished), cover_image.

Parts (Pièces du costume) : id, project_id, name (ex: Casque), status, time_spent.

Materials : id, part_id, name, price, store_link, is_bought.

Gallery : id, part_id, image_uri, note, date.

🎨 Design & UX (Vibe "Cosplay/Craft")
Thème : Mode sombre par défaut (esthétique "Atelier/Cyberpunk" ou "Fantasy").

Composants réutilisables à créer :

CardProject : Affichage visuel avec barre de progression.

ProgressBarCustom : Style néon ou dégradé SCSS.

FloatingActionButton : Pour l'ajout rapide de photos.

StatBadge : Pour le coût total et le temps passé.

🚀 Roadmap de Développement (Tes étapes)
Étape 1 : Initialisation & Architecture
Setup du projet avec le transformer SCSS.

Configuration du Provider SQLite et création des tables.

Mise en place de la navigation (Home / ProjectDetail / Inventory / Settings).

Étape 2 : Gestion des Projets (Le cœur)
Écran de création de projet (Formulaire avec DatePicker pour la deadline).

Dashboard avec liste de cartes filtrables.

Étape 3 : Module "Pièces & Matériaux"
Système de sous-tâches (Parts).

Calculateur automatique du budget (Somme des matériaux vs Budget limite).

Chronomètre simple pour tracker le temps passé par pièce.

Étape 4 : Galerie de Progression (Visual Journey)
Grille d'images par projet.

Possibilité d'ajouter des notes sur chaque photo de l'avancement.

Étape 5 : Fonctionnalités Pro & Export
Logique de restriction (max 2 projets en version gratuite).

Générateur de PDF : Mise en page élégante regroupant les photos de progression et le récapitulatif des coûts.

📝 Instructions spécifiques pour Claude
"Claude, je veux que tu commences par générer l'architecture des dossiers (src/components, src/styles, src/database, etc.). Utilise SCSS pour chaque composant. Assure-toi que tout le code est optimisé pour le local-first (async/await sur SQLite). Ne me demande pas de valider chaque ligne, propose-moi directement les structures de fichiers les plus propres selon les standards de 2026."
