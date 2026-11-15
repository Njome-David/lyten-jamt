# Guide de travail des développeurs et de leurs agents

Équipe LYTEN | NASA Space Apps Challenge 2026 | Version 1.1 | À lire avant d'écrire la moindre ligne

> **Principe.** Ce PDF explique aux **humains** comment travailler. Les règles détaillées et contraignantes pour les **agents** vivent **dans le dépôt** (`AGENTS.md`, `SKILLS.md`, `SPEC.md`, `docs/spec/`). Un agent qui ouvre le dépôt sait donc quoi lire, quoi respecter et comment tenir son `CONTEXT.md`, quel que soit l'outil utilisé (Claude, Codex, Gemini, Cursor, Copilot).

# 1. Vue d'ensemble de la méthode

| Élément | Rôle | Suivi par git ? |
|---|---|---|
| `AGENTS.md` | Règles obligatoires, interdits, ordre de lecture, boucle de travail | Oui |
| `SKILLS.md` | 17 procédures reproductibles (S01 à S17) | Oui |
| `SPEC.md`, `docs/spec/*.md` | Contrats : règles de jeu, présentation, données | Oui |
| `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md` | Renvoient chaque outil vers `AGENTS.md` | Oui |
| `CONTEXT.template.md` | Modèle de mémoire locale | Oui |
| **`CONTEXT.md`** | **Mémoire locale du dev avec son agent** | **Non (`.gitignore`)** |
| `.github/pull_request_template.md`, `.github/workflows/ci.yml` | Gabarit de PR, vérification automatique | Oui |
| `.githooks/` | Refuse un mauvais message de commit et un push sur `main` | Oui (activé par `npm run setup`) |
| `scripts/setup.sh`, `task.sh`, `handoff.sh` | Installation, création de branche, prompt de reprise | Oui |

**Cycle d'une tâche, toujours le même :**

`npm run task -- start tNN slug` → l'agent lit les règles et écrit son plan dans `CONTEXT.md` → il code par petits pas avec les tests → `npm run verify` → commit → `npm run task -- finish` → PR → relecture croisée → merge en squash → tâche suivante.

# 2. Prérequis sur votre machine (Ubuntu)

```
sudo apt update && sudo apt install -y git curl build-essential
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# rouvrir le terminal, puis :
nvm install 22 && nvm use 22
node -v   # doit afficher v22.x
# optionnel mais recommandé : GitHub CLI
sudo apt install -y gh && gh auth login
# optionnel : pour régénérer les PDFs
sudo apt install -y pandoc wkhtmltopdf
```

Une clé API NASA **gratuite** est utile pour le rôle C : https://api.nasa.gov (elle va dans un fichier `.env` local, jamais commité).

# 3. Initialiser le dépôt (tâche T01, rôle A)

L'archive `lyten-jamt-scaffold.zip` contient le dépôt **déjà vérifié** (installation, typecheck, lint, tests, build et hooks testés). Elle remplace la commande `mkdir -p` de votre version initiale.

## 3.1 Pas à pas

```
# 1. Extraire l'archive et entrer dans le dossier
unzip lyten-jamt-scaffold.zip && cd lyten-jamt

# 2. Initialiser git (votre version initiale oubliait git init)
git init -b main

# 3. Installer, activer les hooks, créer CONTEXT.md local, tout vérifier
npm run setup -- "Votre prénom" "Nom de votre agent"

# 4. Premier commit
git add -A
git commit -m "chore(repo): initial scaffold T01"

# 5. Créer le dépôt GitHub et pousser (ou le créer sur github.com puis `git remote add origin ...`)
gh repo create lyten-jamt --private --source=. --remote=origin --push
```

## 3.2 Réglages GitHub à faire une fois (5 minutes, rôle A)

1. **Collaborateurs** : ajouter les 4 autres développeurs avec le droit d'écriture.
2. **Protection de `main`** (Settings, Branches, Add rule) : exiger une pull request, **1 approbation**, la vérification de statut `verify` (workflow `ci`), interdire les pushs forcés.
3. **Merge** (Settings, General) : n'autoriser que **Squash merge** ; cocher « Automatically delete head branches ».
4. **Vercel** : importer le dépôt (preset Next.js). Chaque push sur `main` = déploiement de staging. Aucune variable d'environnement.
5. Garder le dépôt **privé** jusqu'à la soumission, puis le rendre **public** (le jury doit pouvoir l'ouvrir) : à ajouter à la liste de contrôle de la version finale.

## 3.3 Ce qui a été corrigé par rapport à votre `package.json`

| Votre version | Problème | Corrigé |
|---|---|---|
| `@react-three/drei ^9.114.0` | drei 9 va avec fiber 8 ; avec fiber 9 et React 19, il faut **drei 10** | `10.7.9` |
| `@types/three ^0.17x` | pas une version valide | `0.170.0` (alignée sur `three 0.170.0`) |
| `next "15.x"`, `react "19.x"`, etc. | les « x » ne sont pas résolus de façon reproductible | versions **exactes** épinglées et `package-lock.json` |
| `eslint` seul | `eslint .` ne marche pas sans configuration | `eslint.config.mjs` (flat config) avec les **règles de couches** |
| `"bots": "tsx src/engine/bots.ts"` | un module de moteur ne doit pas s'exécuter à l'import | `scripts/run-bots.ts` qui importe `src/engine/bots.ts` |
| `verify` sans lint séparé | difficile à diagnostiquer | scripts `typecheck`, `lint`, `test`, `data:verify` |
| pas de `verify:release` | pas de mode strict pour la release | `verify:release` (fichiers P0 et faits vérifiés) |
| pas de `.nvmrc`, `.editorconfig`, `tsconfig`, `next.config`, `vitest.config` | configs manquantes | tous fournis |
| `SPECS.md` dans votre liste | le nom utilisé partout est `SPEC.md` | `SPEC.md` (gardez ce nom) |

# 4. Contenu du scaffold

| Fichier ou dossier | Rôle |
|---|---|
| `package.json`, `package-lock.json` | dépendances épinglées, scripts normalisés |
| `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `eslint.config.mjs` | configurations (export statique, alias `@/`, couches) |
| `src/app/` | layout, page d'accueil de contrôle, styles avec jetons de design |
| `src/engine`, `content`, `progress`, `data`, `ui`, `three`, `audio`, `judge` | dossiers prêts (`.gitkeep`) |
| `tests/repo-contract.test.ts` | vérifie que les fichiers de règles existent et que `CONTEXT.md` est ignoré |
| `tests/architecture.test.ts` | vérifie la pureté de `src/engine` |
| `scripts/probe-apis.ts` | sonde les endpoints NASA (à lancer dès T+0 par le rôle C) |
| `scripts/verify-data.ts` | vérifie les snapshots ; `--strict` pour la release |
| `scripts/fetch-nasa-data.ts`, `run-bots.ts` | **stubs** à remplir (T03/T09 et T14) |
| `scripts/setup.sh`, `task.sh`, `handoff.sh`, `build-docs-pdf.sh` | outillage d'équipe |
| `docs/fr/` | les trois documents d'équipe (sources `.md` et PDFs) |
| `.env.example` | modèle de `.env` (clé NASA, local uniquement) |

**Vérifier que tout est bon après l'extraction :**

```
npm run verify    # typecheck + lint + tests + données : doit finir vert
npm run build     # export statique dans out/
```

# 5. Méthode de travail au quotidien

## 5.1 Brancher, travailler, livrer

1. **Choisir la prochaine PR** dans le plan du document 02 (section 4.2). Respecter l'ordre de merge et les dépendances.
2. `npm run task -- start t04 engine-core` : crée la branche `t04-engine-core` depuis `main` à jour et renseigne `CONTEXT.md`.
3. Ouvrir votre agent à la racine du dépôt et lui donner le **prompt de démarrage** (section 7.1).
4. L'agent lit les règles, écrit son plan dans `CONTEXT.md`. **Vous validez le plan avant qu'il code.**
5. L'agent travaille par petits pas ; il commit à chaque pas qui passe `npm run verify`.
6. `npm run task -- finish` : lance `verify`, pousse la branche, rappelle comment ouvrir la PR.
7. Ouvrir la PR avec le gabarit : titre `type(scope): message` **en anglais**, checklist cochée avec preuves (sortie de `verify`, capture ou GIF pour l'interface).
8. **Relecture croisée** par un autre rôle (section 6.4), puis **merge en squash**, la branche est supprimée.

## 5.2 Conventions

| Sujet | Règle |
|---|---|
| Branches | `tNN-slug`, `NN` = numéro de la PR du plan, `slug` en kebab-case. Exemple : `t12-mission-hud` |
| Commits | `type(scope): message` en anglais. Types : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `style`, `build`, `ci`. Exemple : `feat(engine): add dust storm event`. Le hook refuse les autres formats |
| PR | une tâche, idéalement moins de 400 lignes modifiées ; titre en anglais ; gabarit complet ; « Dépend de » et « Débloque » renseignés |
| Merge | squash seulement, `main` protégée, jamais de push direct |
| Rebase | `git fetch origin && git rebase origin/main` avant d'ouvrir la PR |
| Tags | `cp1`, `cp2`, `v1-freeze`, `v1-release` posés par le rôle A |
| Langues | code, commits, titres de PR, textes du jeu : anglais ; docs d'équipe, `CONTEXT.md`, échanges : français |

## 5.3 Ordre des PR et dépendances

L'ordre complet est dans le document 02 (T01 à T30). Règle pratique : **ne branchez que depuis `main`**. Si votre tâche dépend d'une PR pas encore mergée, deux options : (a) attendre le merge ; (b) travailler sur les parties qui ne dépendent pas d'elle, ou sur des **données factices** derrière une interface déjà définie dans `types.ts` (c'est tout l'intérêt du contrat gelé à T+1). Les branches empilées sont déconseillées.

# 6. Les règles qui garantissent des résultats cohérents entre agents

## 6.1 Ce qui est écrit dans le dépôt (et que vous n'avez pas à répéter)

- `AGENTS.md` : ordre de lecture, langues, boucle de travail, **11 interdits absolus**, zones par rôle, qualité de jeu (jeu et non formulaire, cinématiques, interface épurée, compagnon), règles de données (prix Best Use of Data), protocole `CONTEXT.md`, définition de « terminé ».
- `SKILLS.md` : méthodes pas à pas pour ajouter une règle, un événement, une mission, une cinématique, un composant, un dialogue de Nova, une source NASA, un fait scientifique, écrire des tests, ouvrir une PR, passer le relais, résoudre un conflit, optimiser la 3D, déboguer, relire.
- **Le lint impose les couches** : un agent qui importe React dans le moteur, ou `Math.random`, échoue à `npm run lint`.

## 6.2 Les règles d'or pour vous, les humains

1. **Un agent = une tâche = une branche.** Ne mélangez pas deux tâches dans une conversation.
2. **Validez le plan** écrit dans `CONTEXT.md` avant le code. C'est là qu'on rattrape 80 % des dérives.
3. **Exigez la preuve** : sortie de `npm run verify` collée dans le résumé final. Pas de preuve, pas de merge.
4. **Ne laissez jamais un agent modifier un contrat** (`types.ts`, `SPEC.md`, `docs/spec/`) sans passer par `CHANGELOG-CONTRACT.md` et prévenir le rôle A.
5. **Aucune donnée NASA inventée** : si un agent propose un chiffre « plausible », refusez et demandez la source ou le snapshot.
6. **Regardez le jeu tourner** à chaque PR d'interface ou de 3D (capture ou GIF). Un test vert ne dit pas si c'est beau, lisible et fluide.
7. Si un agent **dérive** (réécrit tout, ajoute des dépendances, ignore une règle) : arrêtez, faites `git status`, annulez la dérive (`git restore`), relancez avec le prompt de démarrage et la phrase « relis AGENTS.md, section 4 ».

## 6.3 Vérifier la qualité « jeu » d'une PR

| Question | Réponse attendue |
|---|---|
| Une étape se joue-t-elle sans animation visible ? | non : cinématique ou `GenericAction` |
| Le choix « prudent » dure-t-il plus longtemps que « rapide » ? | oui |
| Combien de choix à l'écran ? | 3 au maximum |
| La scène occupe-t-elle au moins 60 % de l'écran en mission ? | oui |
| Y a-t-il un repli sans WebGL ? | oui |
| Nova parle-t-elle pendant un chrono ? | jamais |
| Les nombres portent-ils REAL ou GAME ? | oui |

## 6.4 Relecture croisée

| Auteur de la PR | Relecteur conseillé |
|---|---|
| A (moteur) | B ou D |
| B (interface) | A ou E |
| C (données) | A ou D |
| D (contenu) | C (science) ou B |
| E (3D) | B ou A |

Le relecteur suit `SKILLS.md` S17 (ordre : critères d'acceptation, couches, traçabilité des données, tests, interface, repli, performance, lisibilité). Un commentaire = un problème précis + une proposition.

# 7. CONTEXT.md et changement d'agent

## 7.1 Prompt de démarrage (à coller dans votre agent au début de chaque tâche)

```
Tu travailles sur le dépôt lyten-jamt, branche <tNN-slug>, tâche <TNN : nom>.
Avant toute action, applique le skill S01 de SKILLS.md : lis AGENTS.md, SKILLS.md, SPEC.md,
docs/spec/PRESENTATION.md, docs/spec/DATA-CATALOG.md et docs/TECHNICAL.md.
Ouvre CONTEXT.md (crée-le depuis CONTEXT.template.md s'il manque).
Mon rôle : <A|B|C|D|E>. Objectif de la tâche : <3 lignes>.
Critères d'acceptation : <copier ceux du document 02 section 5>.
Écris ton plan en 5 à 10 lignes dans CONTEXT.md section 4 et attends ma validation avant de coder.
```

## 7.2 À quoi sert CONTEXT.md

C'est la **mémoire locale** de votre session : objectif, critères, plan, avancement (fait / en cours / à faire), décisions et raisons, fichiers touchés, pièges, questions ouvertes, journal horodaté. Il est dans `.gitignore` : **il ne part jamais sur GitHub**, mais il suit votre branche sur votre machine. L'agent doit le mettre à jour après le plan, après chaque étape, après chaque décision et **avant de s'arrêter**.

## 7.3 Changer d'agent sans perdre le fil (quota atteint, outil moins efficace)

1. Dites à l'agent actuel : « Mets CONTEXT.md complètement à jour (sections 4 à 11) et committe ce qui passe `npm run verify` ; le reste en commit `chore(wip): ...` isolé ».
2. Lancez `npm run handoff` : le script imprime (et copie dans le presse-papiers si possible) un **prompt de reprise** contenant l'état réel de git (branche, derniers commits, fichiers modifiés, diff) et votre `CONTEXT.md`.
3. Ouvrez le **nouvel agent** à la racine du dépôt, collez le prompt de reprise, **ajoutez une phrase sur ce qui change** (par exemple « le précédent agent bloquait sur les tests de la sauvegarde, reprends à ce point »).
4. Le nouvel agent applique S01, vérifie `CONTEXT.md` **contre git** (git fait foi), écrit son plan et continue sans refaire ce qui est fait.

**Piège :** un `CONTEXT.md` périmé est pire que pas de `CONTEXT.md`. En cas de doute, demandez à l'agent de le reconstruire à partir de `git log` et `git diff`.

## 7.4 Prompt de relecture (pour un agent relecteur)

```
Relis la PR de la branche <tNN-slug> contre main en suivant SKILLS.md S17.
Donne : 1) critères d'acceptation remplis ou non, 2) violations de couches ou d'interdits (AGENTS.md section 4),
3) données NASA non tracées, 4) tests manquants, 5) interface : surcharge, accessibilité, repli,
6) risques de performance 3D. Un point = un problème précis + une proposition. Ne modifie rien.
```

# 8. Rôles : ce que chacun doit savoir en plus

| Rôle | Premières lectures | Points d'attention |
|---|---|---|
| **A Moteur et intégration** | document 01 §5 et §6, SPEC §3 et §4 | contrat `types.ts` gelé à T+1 ; pureté du moteur ; tests de déterminisme ; tags de checkpoint ; déploiement |
| **B Interface** | document 01 §8, `docs/spec/PRESENTATION.md` | un élément focal, 3 choix, 60 % de scène ; dialogues sans chrono actif ; accessibilité ; repli 2D |
| **C Données** | document 01 §9, `docs/spec/DATA-CATALOG.md` | lancer `data:probe` dès T+0 ; contrat d'intégration en 4 points ; jamais de donnée de remplacement ; relecture scientifique ; droits des images |
| **D Contenu** | document 01 §7 et §8.4 | textes courts niveau classe 3-6 ; ton de Nova ; relay Lune et Mars d'abord ; sauvegarde robuste ; vidéo |
| **E Scène 3D** | document 01 §8.2 et §8.3, SKILLS S06 et S15 | un seul Canvas persistant ; tout procédural ; instanciation ; repli `GenericAction` ; mesures de performance |

# 9. Dépannage

| Symptôme | Cause probable | Correction |
|---|---|---|
| `npm run lint` : « import restricted » | l'agent a importé une couche interdite | déplacer le code dans la bonne couche (document 01 §3.2), ne jamais contourner |
| `git commit` refusé | message hors format | `type(scope): message` en anglais |
| `git push` refusé | vous êtes sur `main` ou `verify` échoue | créer une branche `tNN-slug` ; corriger `verify` (`SKILL S16`) |
| Erreur « peer dependency » à l'installation | version de React, fiber ou drei modifiée | revenir aux versions épinglées du scaffold |
| La scène 3D est lente sur téléphone | qualité trop haute | `quality: 'low'` puis `Stage2D` ; SKILLS S15 |
| `data:verify` échoue | snapshot sans `meta` ou vide, image sans crédit | recréer le snapshot via le script ; jamais à la main |
| Un endpoint NASA ne répond pas | API déplacée ou limitée | lancer `data:probe`, noter le statut, utiliser le sous-ensemble vérifié ; ne rien inventer |
| `CONTEXT.md` apparaît dans `git status` | `.gitignore` modifié | restaurer `.gitignore`, `git rm --cached CONTEXT.md` |
| Conflit au rebase | deux PR touchent le même fichier | SKILLS S14 ; contrat touché = prévenir A |
| L'agent « oublie » les règles | contexte saturé | nouvelle session, prompt de démarrage, `npm run handoff` |

# 10. Aide-mémoire des commandes

| Besoin | Commande |
|---|---|
| Installer et tout configurer | `npm run setup -- "Prénom" "Agent"` |
| Lancer le jeu en local | `npm run dev` (http://localhost:3000) |
| Vérification complète | `npm run verify` |
| Vérification de release | `npm run verify:release` |
| Tests en continu | `npm run test:watch` |
| Sonder les API NASA | `NASA_API_KEY=... npm run data:probe` |
| Récupérer les données NASA | `NASA_API_KEY=... npm run data:fetch` |
| Simuler l'équilibrage | `npm run bots` |
| Démarrer une tâche | `npm run task -- start tNN slug` |
| Livrer une tâche | `npm run task -- finish` |
| Prompt de reprise pour un autre agent | `npm run handoff` |
| Construire le site statique | `npm run build` (sortie dans `out/`) |
| Régénérer les PDFs | `npm run docs:pdf` |
