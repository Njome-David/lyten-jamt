# SKILLS.md - Manieres de faire reproductibles

Chaque skill est une procedure fixe. Quand une tache correspond a un skill, **suis-le tel quel**. Tous les agents doivent produire le meme genre de resultat. Si un skill est incomplet, termine la tache puis propose une correction du skill dans ta PR (section "Ameliorations de skill").

Index: S01 Demarrer une session | S02 Creer une tache | S03 Regle moteur | S04 Evenement | S05 Mission ou site | S06 Cinematique | S07 Composant UI | S08 Dialogue du compagnon | S09 Source de donnees NASA | S10 Fait scientifique | S11 Tests | S12 Ouvrir une PR | S13 Passer le relais | S14 Conflit Git | S15 Performance 3D | S16 Debogage | S17 Relecture de PR | S18 Porter un ecran depuis la reference design

---

## S01 - Demarrer une session
**Quand**: debut de toute session, ou apres un changement d'agent.
1. Lis AGENTS.md, SKILLS.md, SPEC.md, docs/spec/*.md, docs/TECHNICAL.md.
2. Cree ou ouvre `CONTEXT.md` (depuis `CONTEXT.template.md`).
3. `git status`, `git branch --show-current`, `git log --oneline -n 10`. Compare avec CONTEXT.md; corrige CONTEXT.md si l'etat reel differe.
4. Lance `npm run verify` pour connaitre l'etat de depart (note les echecs existants).
5. Ecris ton plan (5 a 10 lignes) en section 4 de CONTEXT.md. Demande validation au dev si le plan s'ecarte de la tache.
**Verif**: CONTEXT.md a jour, plan ecrit, etat de depart connu.

## S02 - Creer une tache (branche)
1. `npm run task -- start tNN slug` (tNN = numero du plan de PR, slug en kebab-case).
2. Remplis CONTEXT.md sections 1 a 3 (objectif, criteres d'acceptation tires de la roadmap).
3. Premier commit vide ou de squelette: `chore(scope): start tNN slug`.
**Pieges**: ne pas brancher depuis une autre branche de feature sauf accord; main doit etre a jour.

## S03 - Ajouter ou modifier une regle moteur
**Fichiers**: `src/engine/config/balance.ts`, `difficulty.ts`, `reducer.ts`, tests.
1. Lis SPEC.md section 4. La valeur numerique va dans `config/`, jamais en dur dans le code.
2. Ecris le test d'abord (cas nominal, bornes 0 et 100, determinisme avec seed fixe).
3. Implemente dans le reducer, sans `Date`, `Math.random`, DOM, React.
4. Mets a jour `docs/TECHNICAL.md` ou SPEC.md si la regle change; note dans `CHANGELOG-CONTRACT.md` si un type change.
5. Lance `npm run bots` (apres T16) et verifie les cibles de victoire.
**Verif**: tests verts, determinisme (meme seed = meme resultat), chaque valeur de jeu etiquetee GAME RULE cote UI.
**Pieges**: oublier le clamp 0..100; muter l'etat (toujours retourner un nouvel objet).

## S04 - Ajouter un evenement
1. Definis le type dans `engine/types.ts` (via contrat) et le poids dans `config/balance.ts`.
2. Logique dans le reducer: tirage seede, choix A/B/C, effets, delai Mars si applicable.
3. Contenu dans `content/events.ts` (titre, texte 25 mots max, icones).
4. Cinematique d'evenement (S06) avec repli `GenericAction`.
5. Dialogue de premiere fois du compagnon (S08).
6. Si l'evenement vient d'une donnee NASA: la donnee vient du snapshot (S09) et le chip REAL s'affiche.
**Verif**: test de tirage seede, test des 3 choix, expiration du chrono, affichage sans NASA data (pool vide) sans plantage.

## S05 - Ajouter une mission ou un site (donnees seulement)
**Fichiers**: `src/content/missions.ts`, `sites.ts`.
1. Utilise un gabarit existant (relay, core, seismic, mapper, garden) et l'ordre d'archetypes de SPEC.md section 5.1.
2. Textes: titre, objectif (20 mots max), 6 textes d'etape (25 mots max), ligne "pourquoi c'est important". Niveau lecture classe 3-6. Anglais.
3. Faits de site: chacun cite dans `data/facts.ts` (status `needs-review` jusqu'a verification humaine) ou tagge GAME.
4. `enabled: true` seulement quand la mission est jouable de bout en bout.
**Verif**: test de schema (longueurs, archetypes valides), mission jouable par le bot sans plantage.

## S06 - Ajouter une cinematique (animation d'une etape ou d'un evenement)
**Fichiers**: `src/three/cinematics/<Nom>.tsx`, enregistrement dans `src/three/cinematics/index.ts`.
1. Signature fixe: composant recevant `{ style: 'fast'|'balanced'|'careful', progress: number /*0..1*/, outdoor: boolean, site: SiteId }`. Aucune logique de jeu dedans.
2. Dure la duree donnee par le style (rapide 2.5 s, equilibre 3.5 s, prudent 5 s). La difference de duree est visible: c'est le compromis.
3. Montre la cause: ce qui est consomme (poussiere et roues du rover, etincelles de forage, serre qui s'allume, faisceau radio vers la Terre).
4. Les trois phases: anticipation (0.4 s), action (duree du style), consequence (0.8 s, deltas flottants).
5. Repli: si la cinematique n'existe pas ou WebGL est absent, `GenericAction` (icone + anneau de progression + mouvement de camera).
6. `prefers-reduced-motion`: version statique de 1 s.
**Verif**: rendu a progress 0, 0.5, 1 sans erreur; 60 fps cible sur machine moyenne; aucun objet non dispose (fuite memoire).

## S07 - Ajouter un composant ou un ecran d'interface
**Fichiers**: `src/ui/**`.
1. Relis `docs/spec/PRESENTATION.md` section "Regles d'interface".
2. Un seul element focal; 3 choix maximum; icone + 3 mots maximum; texte long derriere "i".
3. Accessibilite: focus visible, cibles 48 px, `aria-live`, jamais la couleur seule, clavier complet.
4. Les nombres passent par `RealGameChip`.
5. Styles: variables CSS de `globals.css`, aucune police externe.
6. Fournis une capture ou un GIF dans la PR.
**Verif**: navigation clavier, mobile 360 px de large, reduced-motion.

## S08 - Ajouter un dialogue du compagnon
**Fichiers**: `src/content/dialogues.ts`, `src/content/guide.ts`.
1. Format: `{ id, trigger, once: boolean, pause: boolean, lines: [{ expr, text }] }`. `expr` parmi neutral, happy, worried, alert, thinking, proud.
2. Ton: ami de 12 ans, direct, drole sans en faire trop, jamais condescendant, jamais de reproche. 14 mots maximum par boite, 1 a 4 boites par moment.
3. Une explication de jargon max par dialogue (sol, latence, dose de radiation, microgravite).
4. Premiere fois seulement (`once`), memorise dans `save.seen`.
5. Avant un chrono: dialogue AVANT que le compte a rebours demarre.
6. En cas de defaite: nomme la cause physique, jamais le joueur.
**Verif**: test de longueur, ids uniques, triggers connus, aucun dialogue pendant un chrono actif.

## S09 - Ajouter une source de donnees NASA (contrat d'integration)
**Fichiers**: `scripts/fetch-nasa-data.ts`, `src/data/snapshots/`, `src/data/*.ts`, `docs/spec/DATA-CATALOG.md`.
1. Sonde: `npm run data:probe`. Note le statut reel (code HTTP, extrait). Un endpoint mort est rapporte tel quel.
2. Recupere dans `fetch-nasa-data.ts` avec 2 reessais; ecris un `Snapshot<T>` avec `meta` complet (source, url, fetchedAt, isLive, credit, note). Garde seulement les champs utiles (taille).
3. Ne remplace jamais un bon snapshot par un vide; ne mets jamais de donnee de remplacement.
4. **Crochet de jeu**: decris dans DATA-CATALOG.md ce que la donnee change (regle ou visuel).
5. **Surface**: ou le joueur la voit (chip REAL, Loupe donnees, Passeport donnees).
6. **Test**: schema + un test du crochet.
7. `npm run data:verify` doit passer.
**Pieges**: CORS (le runtime n'appelle pas les API), cle API dans le client (interdit), snapshot trop gros (>300 Ko cumules).

## S10 - Ajouter un fait scientifique
1. Ajoute l'entree dans `src/data/facts.ts` avec `status: 'needs-review'`, texte court, `sourceUrl` d'une page NASA que tu as ouverte.
2. Un humain (role C) lit la page et passe `status: 'verified'`.
3. L'UI n'affiche que des faits `verified` en release (`npm run verify:release`).
**Pieges**: paraphrase fidele; aucun chiffre non present dans la source.

## S11 - Ecrire des tests (Vitest)
1. Emplacement: `tests/<zone>/<nom>.test.ts` ou a cote du fichier en `.test.ts`.
2. Moteur: seed fixe, entrees explicites, assertions sur l'etat complet.
3. Un test par regle et par borne; pas de test qui depend de l'heure ou du reseau.
4. Stockage: simuler `localStorage` avec un objet Map; tester donnees corrompues et ancien schema.
5. Un bug corrige = un test qui echouait avant.
**Verif**: `npm test` vert et rapide (moins de 10 s).

## S12 - Preparer et ouvrir une PR
1. `git fetch origin && git rebase origin/main`.
2. `npm run verify` vert.
3. Relis ton diff (`git diff main...HEAD`): pas de fichier parasite, pas de debug, pas de secret.
4. `npm run task -- finish` pousse la branche.
5. PR avec le gabarit: titre `type(scope): message` (anglais), checklist, preuves, capture/GIF.
6. Indique "Depend de" et "Debloque" (ordre de merge). Demande une relecture croisee (autre role).
7. Merge en **squash** uniquement apres CI verte et 1 approbation.

## S13 - Passer le relais a un autre agent
**Quand**: limite de quota, agent peu efficace, changement d'outil.
1. Ancien agent (ou dev): demande de mettre CONTEXT.md a jour completement (sections 4 a 11) et de committer le travail qui passe `verify` (WIP isole en commit `chore(wip): ...` sinon).
2. Dev: `npm run handoff` et colle le resultat dans le nouvel agent, plus une phrase sur ce qui change.
3. Nouvel agent: applique S01 (verifier CONTEXT.md contre git), ecrit son plan, continue sans refaire le "fait".
**Pieges**: un CONTEXT.md perime est pire que pas de CONTEXT.md; git fait foi.

## S14 - Resoudre un conflit Git
1. `git fetch origin && git rebase origin/main`. Resous fichier par fichier, ne prends jamais "tout le mien" a l'aveugle.
2. Si le conflit touche un contrat (`types.ts`, SPEC, docs/spec): arrete-toi, prevenir le dev et le proprietaire (role A).
3. Relance `npm run verify`. Note la resolution dans CONTEXT.md.
4. Jamais de `--force` sur une branche partagee; `--force-with-lease` seulement sur ta propre branche.

## S15 - Performance de la scene 3D
1. Un seul `<Canvas>` persistant. `dpr={[1, 1.5]}`. Pas de post-traitement lourd.
2. Instancier (`InstancedMesh`) rochers, cratères, particules. Geometries et materiaux partages et reutilises.
3. Ombres seulement si `quality === 'high'`. `PerformanceMonitor` (drei) degrade automatiquement vers `low`.
4. `dispose()` des ressources au demontage. Aucune allocation dans `useFrame`.
5. Budget: cible 60 fps sur machine moyenne, 30 fps minimum sur telephone; JS initial hors chunk Three <= 250 Ko gzip.
6. Mesure avec l'onglet Performance de Chrome avant et apres; note les chiffres dans la PR.

## S16 - Deboguer
1. Reproduis avec une seed fixe (moteur) ou un parcours judge mode.
2. Ecris le test qui echoue. 3. Trouve la cause (pas le symptome). 4. Corrige au bon endroit (couche). 5. Le test passe, `verify` vert.
6. Note la cause dans CONTEXT.md section 9 (pieges).

## S17 - Relire une PR (relecteur humain ou agent)
Ordre: 1) criteres d'acceptation remplis? 2) couches respectees? 3) donnees NASA tracees (REAL/GAME)? 4) tests utiles? 5) interface epuree et accessible? 6) repli present? 7) perf (3D)? 8) lisibilite. Un commentaire = un probleme precis + une proposition.

## S18 - Porter un ecran ou un composant depuis la reference design (Figma Make)
**Quand**: toute tache d'interface, de 3D (ambiance) ou de son.
1. Ouvre `docs/spec/DESIGN.md` (decisions, tokens, correspondances) et la capture `design/screens/NN-*.png` de l'ecran concerne. Regarde TOUS les etats (normal, focus, bas, alerte, vide).
2. Lis le code de reference dans `design/figma-make/` seulement pour comprendre la structure, les espacements, l'ordre des elements et les animations. Ne le copie pas.
3. Reimplemente avec nos composants et les variables CSS de `src/app/globals.css`. Aucun nombre magique de couleur: utilise les tokens. Si un token manque, propose-le (PR `chore(design)`), ne l'invente pas en local.
4. Respecte les regles d'interface de PRESENTATION.md (3 choix max, scene >= 60 %, icone + 3 mots). Si la reference les viole, arrete-toi et demande au dev.
5. Compare ton resultat a la capture (meme viewport, 1280x720 et 390x844). Joins une capture ou un GIF de ton resultat dans la PR, a cote de la reference.
6. Son: reutilise le nom de declencheur de la table "Audio" de DESIGN.md; synthese WebAudio sauf decision contraire ecrite.
**Verif**: `npm run verify` vert (le test d'isolation echoue si tu importes design/), comparaison visuelle jointe, aucun asset externe.
**Pieges**: copier des classes Tailwind; importer une icone d'une librairie; garder une URL d'image; oublier l'etat focus clavier.
