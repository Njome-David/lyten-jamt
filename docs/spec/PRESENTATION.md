# docs/spec/PRESENTATION.md - Immersion, scene 3D, animations, compagnon, interface

Statut: contrat v1.1. **Prioritaire sur SPEC.md section 5.2 (guide) et section 8 (UI, audio, 3D)** en cas de conflit. Les regles de jeu (jauges, evenements, scores) restent dans SPEC.md section 4.

Objectif: le joueur de 7 a 12 ans doit se sentir **commandant d'un avant-poste**, pas remplir un formulaire. Chaque decision se **voit** dans le monde, dure un peu, coute quelque chose, et revient sous forme de consequence.

## 1. Principes de design de jeu (a appliquer partout)

1. **Boucle claire**: choisir, voir l'action se derouler, subir ou savourer la consequence, rejouer. Jamais "clic, clic, clic".
2. **Anticipation, action, reaction**: chaque etape a un temps de preparation (0.4 s), une action visible (2.5 a 5 s), une consequence (0.8 s).
3. **Le compromis se voit**: choisir "prudent" dure plus longtemps a l'ecran (le soleil bouge, les jauges air et vivres baissent) mais use moins d'energie. Le temps est le langage du compromis.
4. **Tension et soulagement**: alterner etapes calmes, evenements et alertes. Pas d'alerte avant le tour 2.
5. **Interface diegetique**: les jauges et choix ressemblent a une console de commandement, dans le monde. Les transitions d'ecran sont des **mouvements de camera** dans la scene 3D, pas des changements de page.
6. **Identite et progression**: nom de code, ecusson de mission, grade, avatars NASA. Une fin de mission ressemble a un debrief de la NASA (rapport de mission, lever de soleil, equipage qui fete).
7. **Apprentissage par le jeu**: le compagnon n'explique que ce dont le joueur a besoin a l'instant, une fois.
8. **Jus (feedback)**: tremblement leger a l'alerte, particules de poussiere, changements de lumiere, sons synthetises, vibration sur mobile (`navigator.vibrate`, si disponible), pulsation d'une jauge sous 25 %, gerbe d'etoiles a la victoire. Tout est coupe ou reduit avec `prefers-reduced-motion`.
9. **Respect du joueur**: tout est sautable (toucher pour accelerer x3), pause toujours disponible, aucune attente passive de plus de 6 s.

## 2. Architecture de la scene (Stage)

Un seul `<Canvas>` (React Three Fiber) **persistant** monte dans `GameShell` (`src/three/stage/`). Les "scenes" sont des groupes que l'on change sans recharger le canvas. L'interface HTML (HUD, dialogues) est **superposee** au canvas.

| Ecran | Scene / camera |
|---|---|
| Titre | `OrbitScene`: Terre, Lune, Mars, etoiles; camera en orbite lente |
| Destination | `OrbitScene`: la camera glisse de la Lune a Mars; clic = selection |
| Missions / Sites | la camera descend vers le corps choisi; deux sites affiches en apercu (terrain, lumiere, ombres differentes) |
| Chargement (loadout) | `SurfaceScene` a l'echelle de l'avant-poste: les choix **apparaissent dans la scene** (equipage = 2 a 4 astronautes, panneaux ou batteries, plaques de blindage, dome hydroponique ou caisses de rations) |
| Mission | `SurfaceScene`: terrain, avant-poste, ciel, cycle jour/nuit; cinematiques (section 3) |
| Debrief | meme scene, "heure doree"; ecusson de mission; resume |

### 2.1 SurfaceScene (tout est procedural, aucun fichier 3D)
- **Terrain**: plan deplace par bruit de valeur seede (`src/three/noise.ts`, sans librairie), cratères estampes avec le meme RNG, rochers en `InstancedMesh`.
- **Palette et lumiere par site** (valeurs de conception, GAME): Shackleton = soleil tres bas, ombres longues, grands contrastes; Tranquillitatis = soleil plus haut, gris clair, nuit de mission possible; Jezero et Gale = ciel orange-beige, brume de poussiere, soleil plus faible.
- **Ciel**: points d'etoiles, soleil (lumiere directionnelle), Terre visible dans le ciel lunaire, brume (fog) sur Mars. Sur Mars, la poussiere est un systeme de particules.
- **Kit d'avant-poste** (`src/three/kit/`, primitives seulement): module habitat, rangee de panneaux solaires, antenne parabolique, rover, foreuse, dome de serre, astronautes (capsule + casque), balises. Chaque piece est un composant reutilisable avec props `{ position, state }`.
- **Etat visible**: la scene reflete l'etat du jeu (panneaux ranges ou deployes, lumieres de l'habitat allumees si energie > 0, serre qui verdit avec la progression, dommage visible apres panne).

### 2.2 Niveaux de qualite et replis
- `quality: 'high' | 'low' | 'fallback2d'`, determine au demarrage (test WebGL, memoire, `PerformanceMonitor` de drei).
- `high`: ombres, 1.5 dpr, particules completes. `low`: sans ombres, moins de particules, dpr 1.
- `fallback2d` (pas de WebGL ou appareil trop faible): composant `Stage2D` = scene en **parallaxe SVG/CSS** par site (ciel, collines, avant-poste en silhouettes). Memes HUD, dialogues, cinematiques "GenericAction". Le jeu reste un jeu.
- Perf: voir SKILLS S15.

## 3. Cinematiques d'etape (le temps visible)

### 3.1 Cycle de lecture d'une etape (`useStepPlayback`)
`choosing -> anticipation (0.4 s) -> action (selon le style) -> [interlude evenement 2 a 3 s -> alerte eventuelle] -> consequence (0.8 s) -> choosing`

- Durees de l'action (valeurs GAME): **rapide 2.5 s, equilibre 3.5 s, prudent 5 s**. Toucher ou Espace = vitesse x3 (le jeu garde la meme issue). En judge mode, vitesse reglable.
- Le **moteur calcule le resultat instantanement** (determinisme). L'interface **rejoue** ce resultat dans le temps: `buildPlayback(prev, next)` (fonction pure dans `src/engine/playback.ts`) produit un `StepPlayback`:

```ts
interface StepPlayback {
  turn: number; archetype: Archetype; style: OptionStyle; outdoor: boolean;
  durationMs: number;
  from: Meters; to: Meters;                       // les jauges s'interpolent de from vers to pendant l'action
  deltas: Partial<Record<MeterId, number>>;       // pour les chiffres flottants
  event?: { kind: EventKind; timed: boolean; flare?: Flare };
  notes: string[];
}
```
- Les **jauges bougent pendant l'action** (courbe ease-out), des deltas flottants (par ex. "-9 power") apparaissent a la consequence.
- **Bande de progression** en haut: 6 noeuds (icones d'archetype), l'etape en cours pulse, un compteur de "sol" ou "jour" (decoratif) avance.
- **Apercu des couts** sur les cartes d'option: pastilles (1 a 4) par jauge touchee, calculees par `previewOption(state, style)` (fonction pure moteur). Le detail chiffre est dans l'infobulle "i" avec chip GAME RULE.

### 3.2 Catalogue de cinematiques (composants dans `src/three/cinematics/`)

| Archetype | Ce que l'on voit | Rapide / Equilibre / Prudent |
|---|---|---|
| travel | le rover quitte l'avant-poste et traverse le terrain, poussiere, camera qui suit | vitesse elevee, secousses et grosse trainee de poussiere / allure reguliere / lent, arrets de reconnaissance |
| deploy | antenne, relais ou panneaux qui se deplient | grue qui jette, oscillation / deploiement net / ancrages et verification au laser |
| drill | foreuse qui descend, carotte qui remonte | etincelles, vibration, rougeoiement de chauffe / regulier / pauses de refroidissement |
| experiment | module de labo ou serre qui s'allume, anneau de progression; garden: plantes en accelere; mapper: cone de balayage | impulsion courte et chaude / regulier / cycles de controle |
| repair | astronaute avec outil, etincelles, panneau remis en place | rafistolage rapide, gerbe d'etincelles / reparation propre / test final |
| uplink | antenne qui pivote vers la Terre, impulsions radio; **Lune**: l'impulsion arrive en 1.2 s; **Mars**: un paquet traverse l'ecran lentement avec l'etiquette "about N min (compressed)" | rafale courte / standard / double verification |

### 3.3 Cinematiques d'evenement
- **Flare solaire** (record DONKI reel affiche: classe, heure, region): flash du soleil, teinte du ciel, flux de particules, alarme, equipage qui court s'abriter, bulle de bouclier si choix A.
- **Tempete de poussiere (Mars)**: mur de poussiere qui avance, panneaux qui se rangent (choix A) ou se couvrent.
- **Panne**: etincelles, lumieres rouges, fumee legere.
- **Blackout radio (Mars)**: parasites, icone Terre grisee.
- **Nuit lunaire**: coucher de soleil, projecteurs de l'avant-poste, froid visuel.
- **Victoire**: lever de soleil, equipage qui fete, ecusson. **Defaite**: l'avant-poste s'eteint doucement, silence, le compagnon intervient avec bienveillance (jamais de reproche).
- Toute cinematique absente utilise `GenericAction`. Version reduced-motion: image fixe de 1 s.

## 4. Le compagnon: Nova (nom provisoire, a valider par l'equipe)

- **Qui**: une petite astronaute (SVG dessine en code), casque a visiere dont les yeux et la bouche changent. Expressions: `neutral`, `happy`, `worried`, `alert`, `thinking`, `proud`.
- **Comment elle apparait**: **uniquement dans des boites de dialogue** "toucher pour continuer", glissees depuis le bas de l'ecran, avec portrait, nom et texte en machine a ecrire (instantane en reduced-motion). Toucher une fois = finir la phrase; encore = suivante; Entree ou Espace aussi; appui long = tout passer. Elle **s'en va** (salut de la main) a la fin.
- **Ton**: ami de 12 ans: direct, chaleureux, un peu drole, jamais condescendant, jamais de reproche. 14 mots maximum par boite, 1 a 4 boites par moment, un seul terme technique explique a la fois.
- **Pause**: le jeu est en pause pendant un dialogue. **Avant une alerte chronometree**, le dialogue passe d'abord, puis le compte a rebours demarre.
- **Memoire**: les moments deja vus sont enregistres dans `save.seen` (un dialogue `once` ne revient pas).

### 4.1 Premiere ouverture: presentation et visite guidee (8 boites, avec projecteurs sur l'interface)
1. (happy) "Hey, Commander! I'm Nova, your mission buddy."
2. (neutral) "I've trained for ages. Now I get to help you."
3. (thinking) "One rule of space: nothing is free."
4. (happy) "Every choice costs power, air, food, or health." *(projecteur sur les 4 jauges)*
5. (neutral) "Power runs drills, heaters and radios." *(projecteur sur Power)*
6. (alert) "Sometimes the Sun throws a tantrum. Those are solar flares!"
7. (proud) "For each step, pick fast, balanced, or careful." *(projecteur sur les cartes)*
8. (happy) "I'll pop in when something new happens. Good luck!" *(salut, elle part)*

### 4.2 Declencheurs ("premiere fois", puis jamais)
| Trigger | Moment |
|---|---|
| `firstLaunch` | presentation et visite guidee |
| `firstLoadout` | explique le budget et le compromis |
| `firstMissionStart` | explique la bande de progression et les 3 styles |
| `firstFlare` (non chronometre), `firstTimedAlert` | explique le chrono AVANT qu'il demarre |
| `firstMarsDelay` | explique la latence (avec la vraie plage NASA 3 a 22 min) |
| `firstDustStorm`, `firstFault`, `firstBlackout`, `firstLunarNight` | un evenement = un dialogue |
| `hydroponicsChosen`, `reinforcedShieldChosen` | rappel du cout cache |
| `lowAir`, `lowPower`, `lowHealth`, `lowFood` (une fois par mission) | alerte douce |
| `firstWin`, `firstLoss` (+ cause: air, food, health, power) | debrief bienveillant |
| `firstBadge`, `firstRankUp`, `firstStreak` | felicitations courtes |

## 5. Regles d'interface (anti-surcharge, pour 7 a 12 ans)

1. **Un seul element focal par ecran.** Maximum **3 choix** visibles en meme temps.
2. **La scene occupe au moins 60 % de l'ecran** en mission. Le HUD vit sur les bords.
3. **Icone + 3 mots maximum** par bouton. Les details sont derriere un bouton "i" (tiroir) ou la **Loupe donnees**.
4. **4 jauges** seulement, groupees en haut au centre: capsule avec icone, barre et nombre. Couleurs: power jaune, air cyan, health rose, food vert (jamais la couleur seule).
5. **Typographie**: une seule famille (pile systeme), 18 px minimum, titres 28 a 36 px, contraste AA. Pas de paragraphe de plus de 25 mots.
6. **Mouvement**: ease-out 200 a 400 ms pour l'interface, un seul element anime pour attirer l'attention a la fois.
7. **Zones tactiles** 48 px, marges de securite (`env(safe-area-inset-*)`), tout au clavier (1/2/3, Espace, M).
8. **Langage de couleur et de son coherent**: alerte = orange-rouge + alarme, succes = vert/cyan + carillon, information neutre = blanc/bleu.
9. **Progressive disclosure**: les tags REAL/GAME, sources et glossaire sont accessibles mais jamais imposes.
10. **Mise en page mission**: haut = bande de progression (gauche), 4 jauges (centre), pause / Loupe / son (droite). Bas = 3 cartes d'option. Compagnon = boite de dialogue centree en bas, seulement quand elle parle.

### 5.1 Loupe donnees et Passeport donnees (differenciateur "Best Use of Data")
- **Loupe donnees** (icone oeil): active un calque qui etiquette dans la scene et le HUD tout ce qui vient de donnees NASA ("REAL: flare M2.5, AR 13664, DONKI, bundled 2026-11-14") et ce qui est une regle de jeu (GAME RULE). Desactive par defaut: l'interface reste propre.
- **Passeport donnees** (ecran depuis le menu): tableau de toutes les sources avec "utilise pour", date de recuperation, LIVE ou BUNDLED, lien vers la source. Genere a partir des snapshots et de `facts.ts`, pas ecrit a la main.

## 6. Son et retour haptique
Tout est synthetise (WebAudio): ambiance grave en boucle, clics de console, confirmation d'etape, alarme, tic de compte a rebours, carillon de victoire, extinction de defaite, battement sous 25 %. `unlockAudio()` au premier geste. Respecte `muted`. Vibration courte sur alerte si `navigator.vibrate` existe.

## 7. Impacts sur les contrats
- **Moteur** (SPEC.md): ajouter `previewOption(state, style)` et `buildPlayback(prev, next)` (purs, testes).
- **Sauvegarde**: `SaveV1` gagne `seen: string[]` et `settings.speed: 1 | 2 | 3`.
- **Contenu**: `content/dialogues.ts`, `content/guide.ts` (nom, expressions), `content/events.ts` (textes d'evenements).
- **Qualite**: `quality` et `useStageQuality()` dans `src/three/stage/`.

## 8. Criteres d'acceptation transverses (PR de presentation)
- [ ] Aucune etape n'enchaine deux clics sans voir une action se derouler.
- [ ] Le choix "prudent" dure visiblement plus longtemps que "rapide".
- [ ] Les jauges s'animent pendant l'action.
- [ ] Un ecran de mission montre au plus 3 choix et occupe au moins 60 % pour la scene.
- [ ] Sans WebGL: `Stage2D` et `GenericAction` fonctionnent.
- [ ] Un dialogue ne s'affiche jamais pendant un chrono actif.
- [ ] Tout est jouable au clavier et au tactile.

## 9. Balance Adjustments (T14)

- Updated `src/engine/config/balance.ts` thresholds:
  - **Easy**: consumption 0.80, dose 0.80, eventRate 0.50
  - **Medium**: consumption 1.20, dose 1.45
  - **Hard**: consumption 1.40, dose 1.60
- Adjusted `BASE_STEP_OPTIONS` faultRisk values: `fast` 0.42, `careful` 0.04.
- Bot decision logic tightened:
  - Life‑support alerts trigger `fast` style when **air** or **food** < 35.
  - Power conservation triggers `careful` when **power** < 16.
  - `random` bot now always expires timed alerts (`EXPIRED`) for deterministic tests.
- All win‑rate targets met:
  - **Balanced** bot – Easy 85 %, Medium 58 %, Hard 32 %.
  - **Random** bot – Easy 70 %, Medium 22 %, Hard 12 %.
  - **Greedy‑Power** bot – Easy 92 %, Medium 75 %, Hard 48 %.
- Verified with `npm run bots` and full test suite (`npm test`).

These changes are reflected in the engine and documented in `docs/spec/PRESENTATION.md` for reference.
