# docs/spec/DESIGN.md - Pont entre le prototype Figma Make et le code

Statut: a REMPLIR par Dave (role A) avant le feu vert. Les agents lisent ce fichier AVANT toute tache d'interface, de 3D ou de son.
Precedence: **look et ambiance = ce fichier et design/screens/** ; **structure et comportement = docs/spec/PRESENTATION.md et SPEC.md** (3 choix max, scene >= 60 %, etc.). Un conflit entre les deux est tranche par Dave et note dans CHANGELOG-CONTRACT.md.

## 1. Decisions (a trancher UNE fois, ne pas laisser un agent decider)
| Sujet | Decision | Consequence |
|---|---|---|
| Tailwind / shadcn / radix / lucide / motion | NON (par defaut) | on reimplemente en CSS variables; si OUI: ajouter la dependance dans package.json, AGENTS.md section 4 et CHANGELOG-CONTRACT.md, puis prevenir tout le monde |
| Police du prototype | (nom + licence) | pile systeme par defaut; sinon fichier local sous licence libre (OFL) via `next/font/local` |
| Audio du prototype | (synthese WebAudio ou fichiers?) | synthese: porter dans `src/audio/sfx.ts`; fichiers: `public/audio/` seulement si libres de droits (CC0 ou crees par nous), licence notee ci-dessous |
| Images du prototype | (aucune URL externe au runtime) | tout visuel est du SVG/CSS/3D code, ou une photo NASA telechargee par script |

## 2. Tokens (copies dans src/app/globals.css, source unique)
| Token | Valeur Figma | Variable CSS |
|---|---|---|
| fond | | `--bg` |
| texte | | `--ink` |
| power / air / health / food | | `--power` `--air` `--health` `--food` |
| alerte | | `--alert` |
| rayon, espacements, echelle typo, ombres | | |

## 3. Ecrans (reference -> notre ecran)
| Ecran du prototype | Notre ecran (AppState.screen) | Capture | Fichiers de reference (figma-make/) | Remarques |
|---|---|---|---|---|
| | title | design/screens/01-title.png | | |
| | destination | | | |
| | missions / sites / difficulty | | | |
| | loadout | | | |
| | mission (HUD, cartes, alerte) | | | |
| | debrief | | | |
| | dialogue Nova + visite guidee | | | |

## 4. Composants (reference -> notre composant)
| Composant du prototype | Notre composant (src/ui/components/) | Etats a couvrir |
|---|---|---|
| | MeterBar | normal, bas (<25 %), alerte |
| | StepCard / OptionButton | normal, focus, desactive |
| | DialogBox + GuideRobot | 6 expressions |
| | AlertOverlay | |

## 5. Animations et transitions
| Moment | Description | Implementation chez nous |
|---|---|---|

## 6. Audio
| Son du prototype | Declencheur | Nom dans `sfx.ts` | Source (synthese / fichier + licence) |
|---|---|---|---|

## 7. A ne PAS copier
Classes utilitaires Tailwind, composants shadcn/radix, icones d'une librairie non autorisee, polices Google, images par URL externe, code de routage du prototype, donnees factices.

## 8. Ecarts assumes avec PRESENTATION.md
| Ecart | Decision de Dave | Date |
|---|---|---|
