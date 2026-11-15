# docs/spec/DESIGN.md - Pont entre le prototype Figma Make et le code

Statut: **SPEC V1.0 VALIDÉE**. Référence visuelle pour tous les agents.
Precedence absolue:
- **Look & Ambiance**: ce fichier, `design/screens/` et les tokens de `src/app/globals.css`.
- **Structure & Comportement**: `docs/spec/PRESENTATION.md` et `SPEC.md` (3 choix max, scène 3D persistante >= 60%, icône + 3 mots, accessibilité 7-12 ans).
- **Principe directeur**: **"On ne réplique pas, on guide"**. Le prototype `design/figma-make/` est une maquette d'exploration (Tailwind, Lucide, fonts Google, Three.js impératif, MP3 lourds) ; notre application réimplémente le concept dans notre pile propre, légère et accessible.

---

## 1. Décisions d'architecture UI & Design

| Sujet | Décision ferme | Conséquence & Justification |
|---|---|---|
| **Librairies UI externes** (Tailwind, shadcn, radix, lucide, motion) | **NON (Interdit)** | Réimplémentation native avec les variables CSS de `src/app/globals.css` et composants React standard. Aucune dépendance inutile (règle AGENTS.md section 4). SVG purs codés pour les icônes. |
| **Typographie & Polices** | **Pile système moderne** | `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;` pour le texte et `ui-monospace, monospace;` pour les données chiffrées. Zéro police Google externe (RGPD / hors-ligne / 0 latence réseau). |
| **Architecture 3D** | **React Three Fiber (R3F) déclaratif** | Un seul `<Canvas>` persistant dans `GameShell` (`src/three/stage/`). Le prototype utilisait un Canvas Three.js impératif distinct. Nous conservons la scène 3D fluide avec transitions caméra diégétiques. |
| **Audio (SFX)** | **Synthèse WebAudio intégrale** | Tous les bruits de console, alarmes, bips et carillons sont synthétisés à chaud dans `src/audio/sfx.ts` via des oscillateurs WebAudio. Poids bundle : **0 Ko**. |
| **Audio (Musique de fond)** | **Synthèse d'ambiance ou streaming différé** | Le prototype embarquait 3 MP3 pesant plus de 7 Mo (`design/audio/`). En production cible : boucle d'ambiance cosmique synthétisée en WebAudio, ou MP3 compressés sous licence CC0 activables sur demande. Respect strict de `muted`. |
| **Images & Visuels** | **SVG/Canvas procédural + Avatars NASA locaux** | Aucun asset externe ou URL CDN au runtime. Les avatars d'astronautes sont des images NASA optimisées dans `public/avatars/`. Le portrait du compagnon est un composant SVG paramétré. |

---

## 2. Tokens de Design (Source de vérité: `src/app/globals.css`)

### 2.1 Couleurs & Surfaces

| Token fonctionnel | Valeur Figma / Prototype | Variable CSS (`globals.css`) | Usage & Rôle |
|---|---|---|---|
| **Fond cosmique principal** | `#070c18` | `--bg` | Fond d'écran général, ciel spatial profond |
| **Fond abyssal (contraste)** | `#05070d` | `--bg-deep` | Fond des barres de progression et zones d'ombre |
| **Surface panneau principal** | `rgba(12, 20, 39, 0.88)` | `--surface-panel` | Cartes principales, docks de commande, modales |
| **Bordure panneau** | `rgba(148, 163, 184, 0.20)` | `--border-panel` | Filet 1px de contour de vitre de console |
| **Surface sous-panneau** | `rgba(15, 23, 42, 0.72)` | `--surface-subpanel` | Éléments secondaires, items de liste, badges d'état |
| **Bordure sous-panneau** | `rgba(148, 163, 184, 0.14)` | `--border-subpanel` | Séparateurs et contours discrets |
| **Dégradé de panneau (console)** | `linear-gradient(180deg, rgba(19,30,56,0.92) 0%, rgba(12,20,39,0.95) 100%)` | `--panel-gradient` | Fond biseauté simulant une console physique |
| **Ombre de panneau** | `0 14px 34px -14px rgba(2,6,23,0.75), inset 0 1px 0 rgba(255,255,255,0.06)` | `--shadow-panel` | Élévation avec réfraction lumineuse intérieure |

### 2.2 Typographie & Niveaux d'encre

| Token | Valeur | Variable CSS | Rôle |
|---|---|---|---|
| **Texte clair (encre)** | `#f1f5f9` (Slate 100) | `--ink` | Titres, valeurs de jauges, textes principaux (contraste AA) |
| **Texte secondaire** | `#94a3b8` (Slate 400) | `--ink-dim` | Descriptions d'étapes, sous-titres, étiquettes |
| **Texte tertiaire / hints** | `#64748b` (Slate 500) | `--ink-muted` | Raccourcis clavier `[1]`, légendes de bas de page |
| **Texte inversé** | `#020617` (Slate 950) | `--ink-inverse` | Texte sur boutons vifs (CTA décollage, validation) |

### 2.3 Les 4 Jauges de Survie (Meters)
*Note de priorité: Conforme au contrat `PRESENTATION.md` section 5.*

| Jauge | Teinte canonique | Variable CSS | Fond de jauge (18%) | Rôle diégétique |
|---|---|---|---|---|
| **Power (Énergie)** | Jaune solaire (`#ffd24a`) | `--power` | `--power-bg: rgba(255, 210, 74, 0.16)` | Batteries, panneaux solaires, moteurs |
| **Air (Oxygène)** | Cyan respirable (`#4fd8ff`) | `--air` | `--air-bg: rgba(79, 216, 255, 0.16)` | Pression cabine, combinaisons EVA |
| **Health (Santé/Blindage)** | Rose vital (`#ff6b8b`) | `--health` | `--health-bg: rgba(255, 107, 139, 0.16)` | Dose de radiation, intégrité équipage |
| **Food (Vivres/Serre)** | Vert biosphère (`#8be28b`) | `--food` | `--food-bg: rgba(139, 226, 139, 0.16)` | Rations, dôme hydroponique |
| **Jauge critique (< 25%)** | Rouge-orange clignotant | `--meter-critical: #ff5b3a` | `--meter-critical-bg` | Pulsation d'alerte et clignotement |

### 2.4 Alertes & États

| Token | Valeur | Variable CSS | Rôle |
|---|---|---|---|
| **Alerte urgente** | `#ff5b3a` / `#f59e0b` | `--alert` | Bordures et bannières de flare solaire ou tempête |
| **Fond d'alerte** | `rgba(255, 91, 58, 0.15)` | `--alert-bg` | Voile d'ambiance d'alerte chronométrée |
| **Succès / Victoire** | `#8be28b` (`#34d399`) | `--success` | Validation d'étape réussie, debriefing gagnant |
| **Avertissement** | `#ffd24a` (`#fbbf24`) | `--warning` | Risque de panne, nuit lunaire, surcoût budgétaire |

### 2.5 Accents Corps Célestes & Données NASA

| Token | Valeur | Variable CSS | Rôle |
|---|---|---|---|
| **Lune (Moon)** | `#4fd8ff` | `--accent-moon` | Thème Shackleton / Tranquillitatis, délai radio court |
| **Mars (Mars)** | `#ff8a4c` | `--accent-mars` | Thème Jezero / Gale, délai radio long (3–22 min) |
| **Puce REAL (NASA)** | Encre `#4fd8ff`, bordure `rgba(79,216,255,0.40)` | `--chip-real-ink`, `--chip-real-border`, `--chip-real-bg` | Donnée vérifiée provenant d'un snapshot NASA |
| **Puce GAME RULE** | Encre `#ffd24a`, bordure `rgba(255,210,74,0.35)` | `--chip-game-ink`, `--chip-game-border`, `--chip-game-bg` | Règle de jeu calibrée pour la simulation |
| **Focus Clavier Visible** | `#4fd8ff` (contour 2px décalé 2px) | `--focus-ring` | Navigation au clavier accessible pour tous les boutons |

### 2.6 Géométrie, Échelle Typographique & Ergonomie Enfant

| Token | Valeur | Variable CSS | Règle d'usage |
|---|---|---|---|
| **Rayon petit** | `8px` | `--radius-sm` | Badges d'étapes, indicateurs de pas |
| **Rayon moyen** | `12px` | `--radius-md` | Boutons de choix secondaires, contrôles du HUD |
| **Rayon carte** | `16px` | `--radius-lg` | Cartes d'options, cartes d'expéditions |
| **Rayon console** | `24px` | `--radius-xl` | Docks principaux, consoles de commandement |
| **Rayon pilule** | `9999px` | `--radius-pill` | Capsule HUD, puces REAL/GAME, boutons ronds |
| **Cible tactile minimale** | `48px` | `--touch-target-min` | Règle absolue : aucun bouton cliquable sous 48 px |
| **Taille de texte de base** | `18px` | `--text-base` | Texte courant pour enfants (lecture aisée 7-12 ans) |
| **Titre de section** | `28px` | `--text-title` | Titres d'écrans et d'alertes |
| **Grand titre display** | `36px` | `--text-display` | Titre du jeu et victoires |
| **Métadonnées compactes** | `14px` | `--text-sm` | Raccourcis, horodatages, télémétrie fine |

---

## 3. Cartographie des Écrans (`design/screens` -> `AppState.screen`)

| Écran du Prototype | Capture de référence | Notre état (`AppState.screen`) | Rôle & Composition guidée |
|---|---|---|---|
| **Title / Command Hub** | `design/screens/home past introductory phase.png` | `'title'` | **Vue orbitale de départ**. Carte console à gauche (Play Expedition, Quick Play, ID astronaute avec avatar/rang/XP). Scène 3D Terre-Lune-Mars ouverte au centre/droite. |
| **Destination & Missions** | `design/screens/moon-mars selection.png` | `'destination'` ou `'select'` | **Choix du monde & expédition**. Sélecteur Lune/Mars en pilule haute. Dock gauche = 5 expéditions (Starter mis en valeur). Dock droit = Landing Zone + Difficulté (Cadet/Specialist/Director) + CTA Décollage. Planète 3D tournante au centre. |
| **Outpost Loadout** | `design/screens/pre-loadout.png` | `'loadout'` | **Préparation de la base**. Jauge budgétaire 10 pts. 4 modules de compromis (Équipage 2/3/4, Énergie Solaire/Batteries, Bouclier Standard/Renforcé, Vivres Rations/Biodôme). Pas d'équipage surchargé (>10 pts). Scène 3D montrant l'avant-poste s'équiper. |
| **Mission (Boucle active)** | `design/screens/game loop.png` | `'mission'` | **Console de mission temps réel**. Haut : Bande des 6 étapes + Barre HUD 4 jauges + Soleil. Centre : Scène 3D visible à >= 60%. Bas : Dock des 3 approches (Rapide, Équilibrée, Prudente) avec prévisualisation des deltas au survol. |
| **Timeline d'exécution** | *(état d'action dans game loop)* | `'mission'` (`playback.active`) | **Cinématique d'action en cours** (2.5 à 5 s). Bandeau d'action décrivant ce qui se passe ("Rover déployant ses capteurs...", etc.) avec bouton "Skip" (avance rapide x3) et deltas flottants. |
| **Alerte d'urgence** | `design/screens/unexpected decision.png` | Overlay sur `'mission'` | **Événement critique chronométré** (Flare DONKI, tempête martienne, panne). Décompte visuel temps réel, télémétrie réelle DONKI affichée, 3 choix A / B / C avec tags de compromis clairs. |
| **Compagnon Astronaute** | `design/screens/comms.png` | Overlay dialogue | **Boîte de dialogue temporaire du tuteur (Nova)**. Centrée en bas, portrait SVG expressif, 14 mots max par bulle, tap-to-continue. S'efface complètement à la fin du dialogue. |
| **Debriefing de mission** | `design/screens/debrief.png` | `'debrief'` | **Bilan de vol**. 3 étoiles, gain d'XP, conseil bienveillant du tuteur selon la cause d'échec ou victoire, graphique sparkline SVG des jauges, accordéon "Science NASA & Journal de vol". Boutons : Rejouer, Reconfigurer, Hub. |
| **Casier d'Astronaute** | `design/screens/badges.png` | Modale `'locker'` | **Profil du joueur**. Modification de l'indicatif (ex: Cmdr. Nova), galerie des 5 badges NASA avec avatars officiels débloquables (Artemis, Apollo, Curiosity, etc.). |
| **Passeport Données (Science)** | `design/screens/science map.png` | Modale `'science'` | **Traçabilité des données NASA**. Tableau complet des snapshots utilisés (DONKI, OSDR, PDS), distinction BUNDLED / LIVE, lien vers la source NASA. Bouton optionnel de vérification LIVE DONKI. |
| **Glossaire Spatial** | `design/screens/technical words.png` | Modale `'glossary'` | **Dictionnaire pour enfants**. Définitions vulgarisées des termes spatiaux (sol, EVA, flare, délai radio, microgravité). Accessible sans quitter sa mission. |
| **Mode Juge (Démo)** | `design/screens/judge-mode.png` | Barre `'judge'` | **Barre d'inspection pour les juges Space Apps**. Permet de tester instantanément une tempête, forcer un flare X12, ajuster les jauges ou déclencher la victoire/défaite. |
| **Crédits & Mentions** | `design/screens/credits.png` | Modale `'credits'` | Mention obligatoire NASA Space Apps Challenge 2026, sources CCMC / DONKI / OSDR / PDS, disclaimer "Not endorsed by NASA". |

---

## 4. Composants Clés (Architecture `src/ui/components/`)

| Composant Prototype | Notre Composant | États à couvrir & Spécifications |
|---|---|---|
| `GameHudBar` | `src/ui/components/HudBar.tsx` | - Pilule de contexte (titre de mission / pause).<br>- Groupement central des 4 jauges (`MeterBar`).<br>- État du soleil (flux DONKI, jour/nuit lunaire).<br>- Boutons pause, audio (M), loupe données. |
| resource meters | `src/ui/components/MeterBar.tsx` | - Valeur 0 à 100.<br>- **Normal** : couleur vive respective.<br>- **Bas (< 25%)** : pulsation lumineuse et avertisseur.<br>- **Prévisualisation au survol** : chip `+10` vert ou `-15` ambre sous la barre.<br>- **Delta flottant** : animation lors de la résolution de l'étape. |
| approach cards | `src/ui/components/OptionCard.tsx` | - 3 choix fixes : **Rapide** (jaune/ambre), **Équilibrée** (cyan/bleu), **Prudente** (vert).<br>- Raccourcis clavier `[1]`, `[2]`, `[3]`.<br>- Résumé des gains/pertes nets et du risque de panne.<br>- Focus visible pour navigation au clavier. |
| `AstronautTutor` | `src/ui/components/CompanionDialog.tsx` | - Dialogue centré en bas.<br>- Portrait SVG paramétré par humeur (`neutral`, `happy`, `worried`, `alert`, `thinking`, `proud`).<br>- Affichage machine à écrire (désactivable via reduced-motion).<br>- Raccourci Espace/Entrée pour passer. |
| `AlertOverlay` | `src/ui/components/AlertOverlay.tsx` | - Fenêtre modale assertive bloquante (`role="alertdialog"`).<br>- Barre de décompte animée fluide via `requestAnimationFrame`.<br>- Télémétrie réelle DONKI (classe, région active, pic).<br>- 3 options de secours A, B, C avec touches 1, 2, 3. |
| `RealGameChip` | `src/ui/components/RealGameChip.tsx` | - Capsule compacte **REAL** (cyan) ou **GAME RULE** (jaune).<br>- Clic = modale explicative concise avec source NASA ou règle de conception. |
| `TelemetrySparkline` | `src/ui/components/TelemetrySparkline.tsx` | - Graphique SVG pur multi-lignes retraçant l'évolution des 4 jauges sur les 6 étapes de l'expédition.<br>- Ligne de danger en pointillé rouge à 25%. |

---

## 5. Animations et Transitions

| Moment du jeu | Comportement visuel & physique | Implémentation recommandée |
|---|---|---|
| **Cycle d'étape (Action Loop)** | **Anticipation (0.4 s)** -> **Action (2.5 à 5 s)** -> **Conséquence (0.8 s)**.<br>La durée visible traduit le compromis du style choisi (Rapide = 2.5 s, Équilibré = 3.5 s, Prudent = 5 s). | Géré par `useStepPlayback` dans `src/engine/playback.ts` + transitions Three.js / CSS. |
| **Mouvements de caméra 3D** | Glissement fluide entre l'orbite lointaine, l'approche planétaire et la vue surface de l'avant-poste. | Interpolation de position/cible de la caméra R3F (`damp3` de `maath` ou lerp natif). |
| **Animation des jauges** | Les jauges glissent vers leur nouvelle valeur pendant l'action (ease-out 300ms), pas en saut instantané. | `transition: width var(--transition-spring)`. |
| **Décompte d'alerte** | Rétrécissement linéaire de la barre de temps restant, avec pulsation et bips audio sur les 5 dernières secondes. | `requestAnimationFrame` + calcul delta en millisecondes. |
| **Apparition dialogue tuteur** | Glissement doux depuis le bas de l'écran (250ms), salut de départ à la fermeture. | `transform: translateY(0)` avec `transition: transform var(--transition-base)`. |
| **Deltas flottants** | Les pastilles `+Power`, `-Air` flottent vers le haut tout en s'estompant (800ms) à la fin de l'action. | Animation CSS `@keyframes floatUp` (transform Y + opacity). |
| **Accessibilité Reduced Motion** | Si `prefers-reduced-motion` est actif : **zéro secousse**, animations ramenées à 0.01ms ou instantanées, défilement machine à écrire immédiat. | Règle globale `@media (prefers-reduced-motion: reduce)` dans `globals.css`. |

---

## 6. Audio & Retour Sonore

### 6.1 Effets Sonores (SFX synthétisés WebAudio dans `src/audio/sfx.ts`)
*Aucun fichier externe pour les SFX : synthèse oscillateur pure.*

| Nom d'effet | Fréquence / Forme d'onde | Déclencheur dans le jeu | Durée |
|---|---|---|---|
| `click` | 560 Hz (Triangle) | Clic sur bouton standard, sélection d'onglet | 55 ms |
| `confirm` | 480 Hz -> 680 Hz (Bip double Sinus) | Validation de choix d'étape, sélection de module | 110 ms |
| `execute` | Triade 330 Hz, 440 Hz, 587 Hz (Triangle + Sinus) | Lancement d'une action de rover/foreuse/antenne | 220 ms |
| `advice` | 620 Hz -> 830 Hz (Carillon doux Sinus) | Message radio reçu de Houston ou astuce tuteur | 120 ms |
| `tick` | 880 Hz (Sinus court et net) | Tic des 5 dernières secondes d'alerte chronométrée | 40 ms |
| `alert` | 740 Hz -> 540 Hz -> 740 Hz (Dent de scie urgente) | Déclenchement d'un flare solaire ou d'une avarie | 310 ms |
| `win` | Arpège ascendant Do majeur (523 -> 659 -> 784 -> 1046 Hz) | Réussite de la mission au debriefing | 450 ms |
| `lose` | Séquence descendante sombre (440 -> 370 -> 311 Hz) | Épuisement d'une jauge / échec de mission | 500 ms |

### 6.2 Ambiance Musicale
- **Contrainte budgétaire** : Les 3 pistes MP3 présentes dans `design/audio/` totalisent 7.1 Mo. Pour une application web instantanée destinée aux enfants, une ambiance cosmique générée par un synthétiseur WebAudio à basse fréquence (drone spatial en boucle douce) est la recommandation par défaut.
- **Règle absolue** : Respect immédiat de la touche `M` (Mute) et conservation de l'état dans `SaveV1`.

---

## 7. À ne PAS copier (Anti-patterns du prototype)

1. **Classes utilitaires Tailwind CSS** : Ne pas importer Tailwind ni copier de classes brutes (ex: `min-h-screen bg-slate-950/80 backdrop-blur-xl`). Utiliser nos variables CSS sémantiques.
2. **Librairie `lucide-react`** : Ne pas ajouter `lucide-react` au `package.json`. Dessiner les icônes simples en SVG vectoriel direct ou primitives propres.
3. **Google Fonts via CDN** : Pas d'`@import url("https://fonts.googleapis.com/...")`. Notre application fonctionne 100% hors-ligne avec la pile système native.
4. **Code Three.js impératif** : Ne pas copier la gestion de canvas manuel avec `new THREE.WebGLRenderer()` de `OutpostScene3D.tsx`. Notre architecture repose sur le composant déclaratif `<Canvas>` R3F partagé dans `GameShell`.
5. **Fausses données ou textes placeholder** : Les données affichées doivent provenir rigoureusement de `DATA-CATALOG.md` et des snapshots NASA.
6. **Bouton permanent d'avatar tuteur** : Le bouton flottant persistant "Maya Comms" en bas à gauche du prototype encombre la scène 3D et viole la règle de l'élément focal unique.

---

## 8. Écarts et Conflits avec `PRESENTATION.md` (On ne réplique pas, on guide)

| Écart / Conflit identifié | Règle du Prototype Figma Make | Règle formelle `PRESENTATION.md` | **Arbitrage & Ligne de Conduite retenue** |
|---|---|---|---|
| **1. Couleurs des 4 jauges de survie** | Health = Vert Émeraude (`#34d399`), Food = Violet (`#a78bfa`), et Rose réservé aux jauges sous 25%. | **Power jaune, Air cyan, Health rose, Food vert** (Section 5.4). | **Victoire de PRESENTATION.md**. Food DOIT être vert (serre hydroponique, plantes), Health DOIT être rose/rouge (coeur, intégrité physique), Air cyan et Power jaune. Le violet du prototype introduit une confusion pour un enfant de 8 ans. |
| **2. Présence et nom du compagnon** | Nommé **Maya**, avec une icône flottante permanente en bas à gauche pour rouvrir le dialogue. | Nommé **Nova** (Section 4), **apparaît UNIQUEMENT dans des boîtes de dialogue**, puis s'efface complètement. | **Victoire de PRESENTATION.md**. Aucun bouton persistant ne doit polluer la vue surface (la scène 3D doit occuper >= 60% de l'écran). Nova n'intervient qu'aux moments clés et se retire avec un salut. L'accès au glossaire se fait via la Pause ou la Loupe données. |
| **3. Densité d'information à la sélection de mission** | Un écran unique très dense (`PlanetMissionOverlay`) avec 5 missions, 2 sites, 3 difficultés, délai radio et textes en 10-11px. | **Un seul élément focal par écran**, maximum 3 choix visibles, textes >= 18 px (Section 5.1 & 5.5). | **Guidage par simplification**. L'interface finale doit utiliser un guidage séquentiel ou un volet accordéon : l'enfant choisit d'abord son expédition (avec la mission Starter bien visible), puis ajuste son site et sa difficulté, sans être assailli de micro-textes. |
| **4. Poids des fichiers audio** | 3 fichiers MP3 totalisant plus de 7 Mo dans le projet (`design/audio/`). | Tout est synthétisé en **WebAudio** (Section 6) pour garantir un chargement ultra-rapide. | **Victoire de la légèreté**. Les SFX WebAudio synthétisés sont adoptés intégralement. La musique ne doit pas bloquer le démarrage de l'application sur un réseau scolaire ou mobile modeste. |
| **5. Tailles de texte et cibles tactiles** | Présence de textes de taille `text-[10px]` et `text-[11px]` dans les cartes. | Typographie lisible : 18 px de base, cibles tactiles de 48 px minimum (Section 5.5 & 5.7). | **Application stricte des règles enfants**. Les boutons et zones interactives respectent strictement les 48 px. Les textes de lecture critique restent en 16-18 px minimum. |
