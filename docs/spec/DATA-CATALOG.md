# docs/spec/DATA-CATALOG.md - Catalogue des donnees NASA (objectif Prix "Best Use of Data")

Statut: contrat v1.1. **Remplace SPEC.md section 7 (table des fichiers)**; les regles du script (reessais, jamais de donnee de remplacement) de SPEC.md section 7 restent valables.

## 1. Strategie

Nous ne limitons pas les sources: on embarque toutes celles qui sont **utiles et verifiables**. Les donnees sont recuperees par script au moment du build, committees dans le repo avec leur provenance, et le jeu fonctionne sans reseau. Un petit nombre de sources **pilote les regles** (profondeur), les autres **nourrissent le visuel et l'apprentissage** (largeur).

### Contrat d'integration (une source ne compte que si les 4 points sont remplis)
1. **Recuperee et embarquee** avec `Provenance` complete (`source`, `url`, `fetchedAt`, `isLive`, `credit`, `note`).
2. **Crochet de jeu**: elle change une regle ou un visuel visible (decrit dans ce fichier).
3. **Surface**: visible dans la Loupe donnees et le Passeport donnees, avec chip REAL.
4. **Test**: schema du snapshot + test du crochet.

Une source sans crochet visible n'est pas ajoutee. Un endpoint indisponible est **rapporte tel quel** (jamais remplace par une donnee inventee).

## 2. Sonder avant de coder (role C, des T+0)
`NASA_API_KEY=... npm run data:probe` affiche le statut reel de chaque endpoint. Copiez le resultat dans `docs/DATA-CATALOG.generated.md` (statut, date, extrait). Les URL du tableau ci-dessous sont des **points de depart a verifier**.

Points signales par des sources tierces (a confirmer par la sonde): DONKI serait passe a `ccmc.gsfc.nasa.gov/DONKI-API/get` le 2026-09-30 (sans cle, 30 jours maximum par requete, l'ancienne adresse `api.nasa.gov/DONKI` redirigerait); l'ancien APOD `api.nasa.gov/planetary/apod` serait coupe le 2026-12-01 (nouvel endpoint `science.nasa.gov/wp-json/wp/v2/apod-basic`); l'API InSight serait figee (sols 675 a 681, octobre 2020); `DEMO_KEY` limite a environ 30 requetes par heure.

## 3. Catalogue

| # | Source | Point de depart (a verifier) | Snapshot | Crochet de jeu | Surface | Prio |
|---|---|---|---|---|---|---|
| 1 | DONKI FLR (eruptions) | CCMC `.../DONKI-API/get/FLR` | `donki-flr-recent.json`, `donki-flr-may2024-a.json`, `donki-flr-may2024-b.json` (mai 2024 coupe en 2: limite de 30 jours) | Chaque evenement flare tire un **vrai enregistrement** (classe, heure de pic, region active). Niveau du jour (`calm`/`active`/`stormy`) = dose de base et probabilite. "Rejouer une vraie tempete" | Carte d'alerte, puce "Today's Sun", Loupe, Passeport | P0 |
| 2 | OSDR (Open Science Data Repository) | `osdr.nasa.gov/geode-py/ws/api/` | `osdr-studies.json` (2 a 3 etudes reelles) | Missions "garden": l'etude reelle fonde l'objectif; facteurs (radiation, microgravite) encadrent le modele de sante | Debrief de la mission garden, Passeport | P0 |
| 3 | Constantes de delai (Lune ~1,2 s; Mars 3 a 22 min) | pages NASA (faits cites) | `facts.ts` (pas un snapshot) | Etiquette et mecanisme du delai Mars | Etiquette "Ask Mission Control", dialogue Nova | P0 |
| 4 | NASA Image and Video Library | `images-api.nasa.gov/search?q=...&media_type=image` | `images-avatars.json` + `public/avatars/*` | 5 avatars debloques par badge, legende officielle | Profil, badges | P0 |
| 5 | DONKI CME | CCMC `.../get/CME` | `donki-cme-recent.json` | "Alerte d'arrivee": un CME rapide previent un tour avant une tempete (lien GAME: vitesse vers delai) | Bandeau d'alerte, Loupe | P1 |
| 6 | DONKI SEP (particules solaires) | CCMC `.../get/SEP` | `donki-sep-recent.json` | Evenement radiation: pic de dose qui depend de la presence d'un SEP recent | Alerte radiation, Loupe | P1 |
| 7 | Images pour les sites (Image Library) | meme API, requetes par site | `images-sites.json` + `public/sites/*` | Photo reelle du lieu (Shackleton, Mer de la Tranquillite, Jezero, Gale) sur la carte de site et dans le debrief | Cartes de site, debrief | P1 |
| 8 | Image du Soleil (SDO) | `sdo.gsfc.nasa.gov/assets/img/latest/...` | `sdo-sun.json` + `public/sites/sun-*.jpg` | Photo du Soleil datee dans "Today's Sun", reliee au niveau du jour | Puce Today's Sun, titre | P1 |
| 9 | InSight (archive) | `api.nasa.gov/insight_weather/` | `insight-archive.json` (si l'endpoint repond) | Reference temperature et vent pour la carte tempete de poussiere (etiquette "archived") | Carte Mars, Loupe | P1 |
| 10 | Moon Trek / Mars Trek (tuiles) | portails Trek (tuiles WMTS) | `trek-tiles.json` + images | Vignette cartographique reelle du site avec coordonnees | Carte de site | P2 |
| 11 | APOD | `science.nasa.gov/wp-json/wp/v2/apod-basic` | `apod-recent.json` | Ciel du titre et "bulletin du jour" | Ecran titre | P2 |
| 12 | EPIC (Terre depuis l'espace) | `epic.gsfc.nasa.gov/api/natural` | `epic-earth.json` + image | Image de la Terre dans l'animation de liaison radio | Cinematique uplink | P2 |
| 13 | DONKI GST/IPS/HSS/RBE | CCMC `.../get/GST` etc. | `donki-*-recent.json` | "Journal meteo spatiale" (cartes pedagogiques, pas de regle) | Passeport, pause | P2 |

Toute autre source passe par le contrat d'integration (section 1) avant d'etre ajoutee.

## 4. Convention des snapshots
```ts
interface Snapshot<T> { meta: Provenance; data: T }
interface Provenance { source: string; url: string; fetchedAt: string; isLive: boolean; credit?: string; note?: string }
```
- Nom: `<source>-<portee>.json` dans `src/data/snapshots/`. Images dans `public/avatars/` et `public/sites/` (`<id>-<nasa_id>.jpg`, 200 Ko maximum chacune, nommees avec le `nasa_id`).
- Ne garder que les champs utilises. Budget: JSON cumule 300 Ko maximum; images chargees a la demande, jamais dans le JS initial.
- `npm run data:verify` (non strict) en dev; `npm run data:verify:strict` en release (fichiers P0 presents, faits `verified`).

## 5. Historiques de demonstration (pour la video et le jury)
1. "Rejouer une vraie tempete" (mai 2024) en judge mode.
2. Une alerte avec un vrai flare du jour (classe, region active) et la photo du Soleil datee.
3. Mission garden avec l'etude OSDR reelle dans le debrief.
4. La carte de site avec une photo reelle du lieu.
5. Le Passeport donnees qui liste tout, avec date et source.

## 6. Qualite et honnetete
- Tout chiffre affiche: REAL (source cliquable, date, BUNDLED ou LIVE) ou GAME RULE.
- Verifier les droits d'usage de chaque image NASA (lignes directrices des medias NASA); les logos et insignes ont parfois des regles supplementaires: remplacer l'image en cas de doute.
- Un humain (role C) relit chaque fait et chaque legende avant la release (`status: 'verified'`).
