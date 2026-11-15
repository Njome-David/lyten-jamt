# TASKS.md - File de taches ordonnee (source pour `npm run next`)

Ne PAS modifier ce fichier dans une PR de feature (conflits). Une tache est **faite** quand un commit de `main` contient `[tNN]` dans son titre (titre de PR squashe).
Pour savoir quoi faire: `npm run next -- A` (ou B, C, D, E). Details et criteres ci-dessous. Roadmap complete: `docs/fr/02-roadmap.md`.

| ID | Role | Depend de | Branche | Echeance | Titre | References design |
|---|---|---|---|---|---|---|
| T01 | A | - | t01-scaffold | T+1 | Scaffold du depot, CI, hooks, regles d'agents | - |
| T02 | A | T01 | t02-engine-contract | T+1 | Contrat moteur gele (`types.ts`) | - |
| T03 | C | T01 | t03-data-core | T+3 | Sonde NASA + fetch DONKI FLR + verify-data strict | - |
| T04 | A | T02 | t04-engine-core | T+5 | Moteur: chargement, jauges, passifs, radiations, options, previewOption | - |
| T05 | B | T01 | t05-ui-shell | T+5 | Shell UI: jetons de design, GameShell, machine a etats d'ecrans, Stage2D | design/screens (tous), DESIGN.md sections 2-4 |
| T06 | E | T01 | t06-stage-foundation | T+5 | Scene 3D: Canvas persistant, OrbitScene, SurfaceScene, qualite | design/screens titre + destination |
| T07 | D | T02 | t07-content-schema | T+6 | Schema de contenu + missions relay Lune et Mars | - |
| T08 | A | T04 | t08-engine-events | T+7 | Moteur: evenements, alertes, delai Mars, score, buildPlayback | - |
| T09 | C | T03 | t09-data-catalog | T+7 | OSDR, avatars Image Library, solar.ts, faits de base | - |
| T10 | B | T05 | t10-dialog-system | T+7 | Dialogues: DialogBox, Nova SVG, scripts, visite guidee, seen | DESIGN.md sections 3-5 (dialogue Nova) |
| T11 | E | T06 | t11-outpost-kit | T+8 | Kit d'avant-poste + cinematiques travel, deploy, GenericAction | design/screens mission (ambiance) |
| T12 | B | T05,T04 | t12-mission-hud | T+8 | HUD mission: jauges animees, cartes avec pastilles, bande de progression, alerte | design/screens mission + alerte |
| T13 | A | T04,T08,T09,T11,T12 | t13-integration-cp1 | T+8 | Integration: relay Lune jouable sur staging (CP1) | - |
| T14 | A | T13 | t14-bots-balance | T+11 | Bots et equilibrage | - |
| T15 | E | T11 | t15-cinematics-core | T+11 | Cinematiques drill, experiment, repair, uplink | design/screens mission |
| T16 | E | T15 | t16-cinematics-events | T+14 | Cinematiques d'evenements, victoire, defaite | design/screens mission |
| T17 | D | T07 | t17-content-moon | T+10 | 5 missions Lune (textes) | - |
| T18 | D | T17 | t18-content-mars | T+13 | 5 missions Mars (textes) | - |
| T19 | D | T07 | t19-progression-save | T+12 | XP, grades, series, badges, sauvegarde | - |
| T20 | C | T09,T12 | t20-data-lens | T+12 | Puces REAL/GAME, Loupe donnees, Passeport donnees | - |
| T21 | B | T13 | t21-judge-mode | T+13 | Mode jury complet | - |
| T22 | D | T10,T17 | t22-nova-scripts | T+14 | Tous les dialogues de Nova | DESIGN.md section 5 |
| T23 | B | T13,T19 | t23-debrief-title | T+15 | Debrief, titre et profil, badges | design/screens debrief + titre |
| T24 | C | T09 | t24-data-extras | T+15 | Sources de donnees supplementaires | - |
| T25 | D | T19 | t25-sound-haptics | T+17 | Sons et haptique | DESIGN.md section 6 (audio) |
| T26 | B | CP2 | t26-a11y-perf | T+17 | Accessibilite et performance | - |
| T27 | C | CP2 | t27-science-review | T+17 | Relecture scientifique | - |
| T28 | A | CP2 | t28-e2e-smoke | T+17 | Test e2e (optionnel) et bots finaux | - |
| T29 | A | GEL | t29-release-docs | T+20 | README final, release, deploiement final | - |
| T30 | D | T29 | t30-video-submission | T+22 | Video et soumission | - |

Jalons (tags poses par le role A): `cp1` (T+8), `cp2` (T+14), `v1-freeze` (T+18), `v1-release` (T+20).

Criteres communs a toute PR: `npm run verify` vert, aucun import interdit, aucune donnee NASA inventee, CONTEXT.md a jour, titre de PR finissant par `[tNN]`.

### T01
- Branche: `t01-scaffold` | Role: A | Depend de: - | Echeance: T+1
- Scaffold du depot, CI, hooks, regles d'agents
- Criteres: Archive extraite, `npm run setup` passe, main protegee, CI verte sur la premiere PR, hooks refusent un mauvais message de commit

### T02
- Branche: `t02-engine-contract` | Role: A | Depend de: T01 | Echeance: T+1
- Contrat moteur gele (`types.ts`)
- Criteres: `types.ts` compile; tous les roles l'importent; CHANGELOG-CONTRACT renseigne; signatures `previewOption` et `buildPlayback` declarees

### T03
- Branche: `t03-data-core` | Role: C | Depend de: T01 | Echeance: T+3
- Sonde NASA + fetch DONKI FLR + verify-data strict
- Criteres: `data:probe` documente le statut reel de chaque endpoint dans docs/DATA-CATALOG.generated.md; snapshots DONKI (recent + mai 2024 en 2 fenetres) avec provenance; verify-data strict detecte un snapshot vide

### T04
- Branche: `t04-engine-core` | Role: A | Depend de: T02 | Echeance: T+5
- Moteur: chargement, jauges, passifs, radiations, options, previewOption
- Criteres: Tests verts: determinisme, bornes 0-100, budget 10 refuse au-dessus, passifs et radiations conformes a docs/fr/01 section 6; previewOption teste

### T05
- Branche: `t05-ui-shell` | Role: B | Depend de: T01 | Echeance: T+5
- Shell UI: jetons de design, GameShell, machine a etats d'ecrans, Stage2D
- Criteres: Parcours titre -> debrief avec donnees factices au clavier et au tactile; jetons en variables CSS (voir DESIGN.md); Stage2D sans WebGL

### T06
- Branche: `t06-stage-foundation` | Role: E | Depend de: T01 | Echeance: T+5
- Scene 3D: Canvas persistant, OrbitScene, SurfaceScene, qualite
- Criteres: Un seul Canvas persistant; camera Titre -> Destination -> surface sans rechargement; quality detectee; pas de fuite memoire apres 20 changements de scene

### T07
- Branche: `t07-content-schema` | Role: D | Depend de: T02 | Echeance: T+6
- Schema de contenu + missions relay Lune et Mars
- Criteres: Schema valide par test; relay Lune et Mars complets; drapeaux enabled (missions et sites)

### T08
- Branche: `t08-engine-events` | Role: A | Depend de: T04 | Echeance: T+7
- Moteur: evenements, alertes, delai Mars, score, buildPlayback
- Criteres: Evenements seedes testes (flare A/B/C, M, X, poussiere, panne, blackout); expiration du chrono; delai Mars; buildPlayback pur; pool de flares vide sans plantage

### T09
- Branche: `t09-data-catalog` | Role: C | Depend de: T03 | Echeance: T+7
- OSDR, avatars Image Library, solar.ts, faits de base
- Criteres: osdr-studies.json avec vraies etudes; avatars telecharges avec credit et nasa_id; solar.ts renvoie le bon niveau; faits en needs-review

### T10
- Branche: `t10-dialog-system` | Role: B | Depend de: T05 | Echeance: T+7
- Dialogues: DialogBox, Nova SVG, scripts, visite guidee, seen
- Criteres: Dialogue complet (machine a ecrire, toucher pour continuer, saut); visite avec projecteurs; seen enregistre; AUCUN dialogue pendant un chrono actif; reduced-motion

### T11
- Branche: `t11-outpost-kit` | Role: E | Depend de: T06 | Echeance: T+8
- Kit d'avant-poste + cinematiques travel, deploy, GenericAction
- Criteres: Rover traverse la scene en 3 durees de style; deploy fonctionnel; GenericAction utilise quand une cinematique manque

### T12
- Branche: `t12-mission-hud` | Role: B | Depend de: T05,T04 | Echeance: T+8
- HUD mission: jauges animees, cartes avec pastilles, bande de progression, alerte
- Criteres: Jauges animees pendant l'action; pastilles de cout sur les 3 cartes; bande de progression; alerte avec compte a rebours accessible

### T13
- Branche: `t13-integration-cp1` | Role: A | Depend de: T04,T08,T09,T11,T12 | Echeance: T+8
- Integration: relay Lune jouable sur staging (CP1)
- Criteres: Parcours complet sur staging: chargement -> 6 etapes animees -> un vrai flare -> debrief; tests moteur verts; donki-flr-recent.json committe

### T14
- Branche: `t14-bots-balance` | Role: A | Depend de: T13 | Echeance: T+11
- Bots et equilibrage
- Criteres: `npm run bots` imprime les taux; cibles de docs/fr/01 section 6.8 atteintes ou ecart documente

### T15
- Branche: `t15-cinematics-core` | Role: E | Depend de: T11 | Echeance: T+11
- Cinematiques drill, experiment, repair, uplink
- Criteres: Rendu a progress 0, 0.5, 1 sans erreur; visuel du delai Mars; 60 fps vises

### T16
- Branche: `t16-cinematics-events` | Role: E | Depend de: T15 | Echeance: T+14
- Cinematiques d'evenements, victoire, defaite
- Criteres: Chaque evenement a sa cinematique ou le repli; victoire et defaite bienveillantes

### T17
- Branche: `t17-content-moon` | Role: D | Depend de: T07 | Echeance: T+10
- 5 missions Lune (textes)
- Criteres: 5 missions jouables par le bot sans plantage; textes conformes (longueur, niveau 3-6)

### T18
- Branche: `t18-content-mars` | Role: D | Depend de: T17 | Echeance: T+13
- 5 missions Mars (textes)
- Criteres: Idem T17 pour Mars

### T19
- Branche: `t19-progression-save` | Role: D | Depend de: T07 | Echeance: T+12
- XP, grades, series, badges, sauvegarde
- Criteres: XP, grades (499/500), serie et joker, chaque badge testes; sauvegarde corrompue sans plantage; seen et speed

### T20
- Branche: `t20-data-lens` | Role: C | Depend de: T09,T12 | Echeance: T+12
- Puces REAL/GAME, Loupe donnees, Passeport donnees
- Criteres: Chaque nombre porte REAL ou GAME; la Loupe affiche les sources; Passeport genere

### T21
- Branche: `t21-judge-mode` | Role: B | Depend de: T13 | Echeance: T+13
- Mode jury complet
- Criteres: Play demo, menu d'evenements, partie courte, profil de demo, rejouer mai 2024, Science map

### T22
- Branche: `t22-nova-scripts` | Role: D | Depend de: T10,T17 | Echeance: T+14
- Tous les dialogues de Nova
- Criteres: Tous les declencheurs (docs/fr/01 section 8.4) ont un dialogue; ton conforme; longueurs respectees

### T23
- Branche: `t23-debrief-title` | Role: B | Depend de: T13,T19 | Echeance: T+15
- Debrief, titre et profil, badges
- Criteres: Debrief avec etoiles, XP, historique des jauges, source; titre avec profil et badges

### T24
- Branche: `t24-data-extras` | Role: C | Depend de: T09 | Echeance: T+15
- Sources de donnees supplementaires
- Criteres: Chaque source ajoutee remplit les 4 points du contrat d'integration, sinon elle n'est pas ajoutee

### T25
- Branche: `t25-sound-haptics` | Role: D | Depend de: T19 | Echeance: T+17
- Sons et haptique
- Criteres: Sons et vibration; muted respecte; aucun son avant le premier geste

### T26
- Branche: `t26-a11y-perf` | Role: B | Depend de: CP2 | Echeance: T+17
- Accessibilite et performance
- Criteres: Liste d'accessibilite passee; mesures de perf notees dans la PR; repli 2D verifie

### T27
- Branche: `t27-science-review` | Role: C | Depend de: CP2 | Echeance: T+17
- Relecture scientifique
- Criteres: `npm run verify:release` vert; docs/SCIENCE.md genere; faits non verifies retires de l'UI

### T28
- Branche: `t28-e2e-smoke` | Role: A | Depend de: CP2 | Echeance: T+17
- Test e2e (optionnel) et bots finaux
- Criteres: Test e2e vert ou abandonne explicitement; bots relances sur la version finale

### T29
- Branche: `t29-release-docs` | Role: A | Depend de: GEL | Echeance: T+20
- README final, release, deploiement final
- Criteres: README sans parametre a remplir; URL de production verifiee; tag v1-release

### T30
- Branche: `t30-video-submission` | Role: D | Depend de: T29 | Echeance: T+22
- Video et soumission
- Criteres: Video publique avec sous-titres anglais; lien teste en fenetre privee; soumission confirmee
