# AGENTS.md - Regles obligatoires pour tout agent IA

Projet: **Junior Astronaut Mission Trainer** (equipe LYTEN, NASA Space Apps 2026). Jeu web pour enfants de 7 a 12 ans: commander un avant-poste lunaire ou martien, ou chaque decision coute quelque chose, avec de vraies donnees NASA.

Ce fichier s'applique a TOUS les agents (Claude, Codex, Gemini, Cursor, Copilot...). Les fichiers `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md` ne font que te renvoyer ici. Si ce fichier et ton habitude different, ce fichier gagne. Si ce fichier et SPEC.md different, **SPEC.md et docs/spec/*.md gagnent** pour les regles de jeu, de donnees et de presentation.

## 1. Ordre de lecture (a chaque nouvelle session, sans exception)

1. `AGENTS.md` (ce fichier), puis `SKILLS.md` (methodes reproductibles).
2. `SPEC.md` (contrat moteur, anglais), `docs/spec/PRESENTATION.md` (immersion, 3D, animations, compagnon, interface), `docs/spec/DATA-CATALOG.md` (donnees NASA).
3. `docs/TECHNICAL.md` (architecture), puis la feuille de route `docs/fr/02-roadmap.md` pour situer ta tache.
4. `CONTEXT.md` (memoire locale du dev, non suivie par git). S'il n'existe pas: copie `CONTEXT.template.md` en `CONTEXT.md` et remplis la section 1.
5. L'etat reel: `git status`, `git branch --show-current`, `git log --oneline -n 10`. **Le code et git font foi, pas la memoire de la conversation.**

Ne code rien avant d'avoir ecrit ton plan (5 a 10 lignes) dans `CONTEXT.md`, section 4.

## 2. Langues

- **Code, commentaires, noms, commits, titres de PR, textes du jeu: anglais.**
- **Documentation d'equipe, CONTEXT.md, echanges avec le dev: francais.**
- SPEC.md et TECHNICAL.md restent en anglais (contrat et vitrine pour les juges).

## 3. Methode de travail (boucle fixe)

`Lire -> Planifier (CONTEXT.md) -> Implementer petit -> Tester -> npm run verify -> Mettre a jour CONTEXT.md -> Commit -> Resumer au dev`

- Une tache = une branche `tNN-slug` creee avec `npm run task -- start tNN slug`. Jamais de travail sur `main`.
- Avance par petits increments testables. Commit a chaque increment qui passe `verify`.
- Messages de commit: `type(scope): message` (feat, fix, docs, test, refactor, chore, perf, style, build, ci). Exemple: `feat(engine): add dust storm event`.
- Avant de dire "termine": lance `npm run verify` et colle la fin de la sortie dans ton resume. Pas de preuve = pas termine.
- Une PR = une tache, idealement moins de 400 lignes modifiees. Ouvre-la avec le gabarit `.github/pull_request_template.md`. **Le titre de la PR finit par `[tNN]`** (ex: `feat(engine): core rules [t04]`): c'est ainsi que `npm run next` sait qu'une tache est faite.
- Ne modifie pas les fichiers hors de ta zone (section 5) sans l'avoir signale au dev. Les contrats (`src/engine/types.ts`, `docs/spec/*`) ne changent que via `CHANGELOG-CONTRACT.md`.

## 4. Interdits absolus

1. **Inventer une donnee NASA**: classe de flare, region active, identifiant d'etude, sol, temperature, citation, date. Toute donnee reelle vient du script `scripts/fetch-nasa-data.ts` (snapshot avec provenance) ou de `src/data/facts.ts` (fait source et verifie).
2. Afficher un nombre sans tag **REAL** (source) ou **GAME RULE** (valeur de conception).
3. `Math.random`, `Date`, `window`, `document`, `localStorage`, React ou DOM dans `src/engine/`.
4. Ajouter une dependance npm sans la justifier dans la PR (autorisees: next, react, react-dom, three, @react-three/fiber, @react-three/drei, et les outils de dev deja listes).
5. Committer une cle API, `.env`, ou `CONTEXT.md`.
6. Appels reseau au runtime (sauf la fonction optionnelle de donnees en direct, P2).
7. Police, script ou image externes. Pas d'analytics. Pas de cookies.
8. `any` TypeScript, `// @ts-ignore`, desactiver une regle de lint pour "faire passer".
9. Pousser sur `main`, `git push --force`, reecrire l'historique partage.
10. Supprimer ou affaiblir un test pour le faire passer.
11. Utiliser le visage, la voix ou le nom d'un mineur reel.

## 5. Zones et proprietaires

| Role | Zone principale |
|---|---|
| A Moteur | `src/engine/**`, `tests/` du moteur, `scripts/run-bots.ts`, integration et release |
| B Interface | `src/ui/**` (ecrans, HUD, dialogues, compagnon, loupe donnees), `src/app/**` |
| C Donnees | `scripts/*`, `src/data/**`, `public/avatars`, `public/sites`, `docs/SCIENCE.md` |
| D Contenu | `src/content/**`, `src/progress/**`, `src/audio/**` |
| E Scene 3D | `src/three/**` (scene, kit d'avant-poste, cinematiques) |

Dependances entre couches: voir `docs/TECHNICAL.md` section 3. Le lint les impose (`npm run lint`). Ne contourne jamais une erreur de couche: deplace le code a la bonne place.

## 6. Qualite de jeu (resume; details dans docs/spec/PRESENTATION.md)

- **Ce doit etre un JEU, pas un formulaire**: un decor 3D persistant, des actions visibles qui se deroulent dans le temps, des retours visuels et sonores, une tension qui monte et redescend.
- **Une mission n'est jamais "clic, clic, clic"**: chaque etape joue une cinematique de 2 a 5 s propre a l'archetype (trajet, deploiement, forage, experience, reparation, liaison) et au style choisi (rapide, equilibre, prudent). Les jauges bougent pendant l'action, pas apres.
- **Interface epuree pour un enfant**: un element focal par ecran, 3 choix maximum, icones plus 3 mots maximum, le decor occupe au moins 60 % de l'ecran, les details sont derriere un bouton "i" ou la "Loupe donnees".
- **Le compagnon** (petite astronaute) apparait seulement dans des boites de dialogue "toucher pour continuer", ton amical d'un enfant de 12 ans, s'efface, revient aux premieres fois. Voir SKILLS S08.
- **Toujours un repli**: sans WebGL ou sur appareil faible, scene 2D en parallaxe. Une cinematique manquante utilise `GenericAction`. Rien ne doit jamais etre casse a l'ecran.
- **Accessibilite**: tout au clavier (1/2/3, Espace, M), cibles tactiles 48 px, jamais la couleur seule, `prefers-reduced-motion` respecte, option temps supplementaire.

## 7. Donnees NASA (Prix "Best Use of Data")

Nous utilisons largement les sources NASA, mais **une source ne compte que si** (a) elle est recuperee et embarquee avec sa provenance, (b) elle change une regle ou un visuel visible, (c) elle apparait dans la Loupe donnees et le Passeport donnees, (d) elle a un test. Sinon on ne l'ajoute pas. Voir SKILLS S09 et `docs/spec/DATA-CATALOG.md`. Un endpoint qui ne repond pas = on le rapporte honnetement, on n'invente jamais de remplacant.

## 8. Protocole CONTEXT.md (changer d'agent sans perdre le fil)

- `CONTEXT.md` est local (liste dans `.gitignore`). Il est ta memoire et celle de l'agent suivant.
- Mets-le a jour: apres le plan, apres chaque etape terminee, apres chaque decision, et **avant de t'arreter** (section Journal en tete de liste).
- Contenu minimal exige: objectif, criteres d'acceptation, plan, fait / en cours / a faire, decisions et raisons, fichiers touches, pieges, questions ouvertes.
- Reprise par un nouvel agent: le dev lance `npm run handoff` et colle le resultat. Le nouvel agent verifie `CONTEXT.md` contre git, ecrit son plan, puis continue. Voir SKILLS S13.

## 9. En cas de doute

Arrete-toi et pose UNE question precise au dev, avec ta recommandation par defaut. N'invente pas une regle de jeu, une donnee ou une exigence du defi. Distingue toujours: **exigence officielle**, **fait NASA source**, **hypothese de conception de l'equipe**.

## 10. Definition de "termine" (checklist finale de chaque tache)

- [ ] Criteres d'acceptation de la tache remplis
- [ ] `npm run verify` vert (sortie collee)
- [ ] Tests ajoutes pour tout comportement nouveau
- [ ] Aucun interdit de la section 4
- [ ] Interface: regles anti-surcharge verifiees, capture ou GIF fourni
- [ ] Repli prevu (WebGL, donnees, stockage)
- [ ] CONTEXT.md a jour
- [ ] Resume au dev: ce qui est fait, ce qui reste, risques, commande pour tester

## 11. Reference design (Figma Make) - `design/` est INERTE

- `design/screens/` (captures) et `docs/spec/DESIGN.md` (tokens, correspondances, decisions) sont la **reference visuelle**. Lis-les AVANT toute tache d'interface, de 3D ou de son (skill S18).
- `design/figma-make/` est le code du prototype: **lecture seule**. Ne l'importe jamais, ne le copie pas tel quel, ne le modifie pas. Il est exclu de tsc, eslint, vitest et du build; un test echoue si `src/` ou `scripts/` l'importe.
- On **reimplemente** dans notre pile (Next, React, CSS variables de `globals.css`, R3F). Pas de Tailwind, shadcn, radix, lucide, motion, police externe, image par URL, sauf decision ecrite dans `DESIGN.md` section 1.
- Look et ambiance: DESIGN.md et les captures. Structure et comportement: PRESENTATION.md et SPEC.md. Si les deux se contredisent, **arrete-toi et demande au dev** (role A tranche).

## 12. Mode autopilote (quand le dev ecrit "autopilote role X")

1. `git switch main && git pull --ff-only`, puis `npm run next -- X`.
2. Si une tache est executable: `npm run task -- start tNN slug`, applique S01, lis les references de la tache (TASKS.md, DESIGN.md, specs), ecris ton plan dans CONTEXT.md, puis **ARRETE-TOI et attends "go"** du dev.
3. Apres "go": implemente par petits pas, `npm run verify` a chaque pas, commit, mets CONTEXT.md a jour.
4. Quand les criteres sont remplis: `npm run task -- finish`, redige la description de PR (gabarit) avec la sortie de `verify` et le titre finissant par `[tNN]`, puis resume au dev et propose la tache suivante (`npm run next -- X`).
5. Si `npm run next` dit "bloquee": ne branche pas depuis une autre branche; dis au dev ce qui manque. Tu peux preparer la tache seulement si tu travailles sur des donnees factices derriere les types de `types.ts`.
6. Conditions d'arret immediat: contrat a modifier, regle ambigue, donnee NASA manquante, conflit Git sur un contrat, `verify` rouge que tu ne comprends pas apres 2 essais.
