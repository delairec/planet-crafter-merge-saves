# Plan de mise en conformité — planet-crafter-save-tools

## Contexte

Audit complet du projet contre les règles `~/.ai` (STD-1/2/3, TEST-1, ARCH-1..5). Le projet fonctionne mais viole massivement la matrice de dépendances entre packages et plusieurs invariants de Clean Architecture. Objectif : rendre le projet conforme, maintenable et évolutif, via des tâches exécutables par des agents IA.

**Étape 0 de l'implémentation** : matérialiser chaque tâche T0–T10 de ce plan dans `docs/tasks/T{NN}-{slug}.md` (un fichier par tâche, contenu = section correspondante + section « Questions » pertinente), pour distribution aux agents.

---

## Synthèse de l'audit

| Gravité | Constats principaux |
|---|---|
| **Critique** | `core-mapping/src/infrastructure/SaveFilesMergerService.ts:1` importe `cli-merge/merge.js` ; `SaveValidatorService.ts:1` importe `cli-validate/validate.js` (core → cli interdit). `util-platforms` fait des I/O fichiers + `process.exit` + effet de bord au chargement (`platform.js:8`). `util-types/gameDefinitions` = le modèle du domaine dans un package util. `util-parsing/resolveIdConflicts.js` = l'algorithme métier de merge (223 lignes, cite `docs/game-rules.md`). Cycle `util-parsing` ⇄ `shared-mapping` (via specs). |
| **Haute** | Toute la logique merge (~437 LOC dans `cli-merge`) et validation (125 LOC dans `cli-validate`) vit dans les CLI (règle « thin CLI »). Domaine anémique : 14 entités/VOs = interfaces mutables sans invariants. `domain/worldObjectLabels.ts` = 828 lignes de libellés UI dans le domaine. Règles métier exécutées en infrastructure (`SaveSectionsReaderService.ts:183`) et en présentation (`TerraformationLevelsPresenter.ts:71`). 5 use cases sans input (l'input passe par une factory d'infra dans les contrôleurs). UI appelle `parseSaveSections` directement (`ui-save-manager/src/routes/index.tsx:72`), contourne les contrôleurs. `util-messages` = copy produit (UI) en package util. |
| **Moyenne** | 5 packages fantômes (pas de `package.json`, hors workspaces) → imports relatifs profonds, matrice non applicable. `cli-validate` importe `docs/schemas/*.json` (hors packages/). Composition root non typé sur les ports. Erreurs ajv brutes traversant tout le stack jusqu'à l'écran. Fixtures partagées mutables (`shared-mapping/testing/createFakeSaveContent.js`). |
| **Basse** | ~60 violations de conventions de tests (titres describe/when, it/should, commentaires AAA, tests multi-comportements, spies non restaurés, test dupliqué `mergeWorldObjects.spec.js:28-64`), duplication `formatDecimalNumber` ×6, bug seuils formatters, bug UI `<Show when={sections}>` (accessor toujours truthy), CI déclenchée sur `main` mais fallow basé sur `master`. |

Points déjà conformes (à préserver) : nommage des méthodes de presenters (aucun `presentSuccess/presentError`), use cases retournant `void`, injection par ports, ViewModels purs, domaine sans I/O, `exports` de `core-mapping` limité aux contrôleurs + ViewModels.

---

## Architecture cible (recommandée — voir Questions)

```
packages/
  shared-save-format/     # NOUVEAU : types du format de save (ex util-types/gameDefinitions
                          #   sans RuntimePlatform), sectionIndexes, parseSaveSections,
                          #   serializeSave, stringifyEntry, normalizeSaveSections,
                          #   schemas JSON (ex docs/schemas), testing/ (ex shared-mapping)
  shared-platforms/       # NOUVEAU (ex util-platforms) : adaptateurs fs/process bun+node,
                          #   sans effet de bord d'import
  core-mapping/           # absorbe le moteur de merge (ex cli-merge/merge.js + sections/
                          #   + helpers/ + resolveIdConflicts) et le moteur de validation
                          #   (ex cli-validate/validate.js, ajv en infrastructure)
  cli-merge/              # thin : parsing args → contrôleur core → rendu
  cli-validate/           # thin : idem
  ui-save-manager/        # consomme uniquement les contrôleurs core
  (supprimés : util-types, util-parsing, util-messages, util-platforms, shared-mapping)
```

Seul reste en `util-*` ce qui est réellement générique ; en l'état, `hasJsonExtension` part dans `shared-save-format`, donc plus aucun package `util-*` (en créer un plus tard seulement si un vrai helper générique apparaît — YAGNI).

⚠️ Cette cible suppose la réponse Q1 (autoriser `cli-* → core-*`). Sinon, variante : les moteurs merge/validation vont dans `shared-save-tools` au lieu de `core-mapping`.

---

## Questions à trancher

> Écris tes réponses sous chaque question. Les tâches marquées ⏸ sont bloquées par la question correspondante.

**Q1 — Dépendance `cli-* → core-*` (bloque T2, T3).**
La matrice actuelle interdit aux CLI de dépendre de `core-*`, donc un CLI « thin » qui délègue au métier est impossible : le métier n'a nulle part où vivre qui soit accessible à la fois aux CLI et au core (`shared-*` interdit « l'orchestration spécifique à une feature »).
Recommandation : **autoriser `cli-* → shared-*, util-*, core-*`** (comme `ui-*`) — un CLI est un mécanisme de livraison au même titre que l'UI. Alternative : créer `shared-save-tools` contenant les moteurs (mais cela affaiblit la règle shared).
Réponse : ok pour **autoriser `cli-* → shared-*, util-*, core-*`** (comme `ui-*`)

**Q2 — Devenir de `util-platforms` (bloque T4).**
Il viole frontalement ARCH-2 (I/O, process, état au chargement). Options : (a) le renommer `shared-platforms` (adaptateur consommé par les 2 CLI — recommandé) ; (b) dupliquer un adaptateur par CLI ; (c) créer un préfixe `infra-` dans les règles.
Réponse : ok pour (a) le renommer `shared-platforms`

**Q3 — Ampleur de la protection des invariants du domaine (bloque T7).**
Les règles exigent des entités/VOs protégeant leurs invariants ; aujourd'hui tout est interface mutable. Mise en conformité complète = ~14 classes/factories avec validation + refonte de tous les call sites (gros chantier). Options : (a) complet ; (b) pragmatique : `readonly` partout + fonctions factory avec validation sur les 3-4 types critiques (`WorldObjectEntity`, `PlayerEntity`, `SaveConfigurationValueObject`, position) ; (c) reporter.
Recommandation : (b).
Réponse : (a) complet 

**Q4 — Regroupement `shared-save-format` (bloque T1).**
Dissoudre `util-types`, `util-parsing`, `shared-mapping` dans un unique `shared-save-format` (types wire + parsing + sérialisation + schemas + fixtures) ? Alternative : garder des packages séparés `shared-save-types` / `shared-save-parsing` / `shared-save-fixtures`.
Recommandation : un seul package (cohésion : tout décrit le même format de fichier).
Réponse : ok pour un seul package, mais on va le nommer shared-save-processing

**Q5 — Réintégrer `ui-save-manager` et les messages dans le périmètre fallow ?**
`fallow.toml` exclut `packages/ui-save-manager/**` et `packages/util-messages/**`. Après refactor, lever ces exclusions ?
Recommandation : oui (au moins pour les messages relocalisés).
Réponse : oui pour les messages, pas pour ui-save-manager pour l'instant

**Q6 — Setup de tests pour `ui-save-manager` ?**
La règle ARCH-4 dit de ne PAS créer de setup de test sauf demande explicite. T8 modifie l'UI de façon significative ; veux-tu un setup (vitest + solid-testing-library) à cette occasion ?
Recommandation : non (respect de la règle), vérification via build + smoke manuel.
Réponse : non, pour l'instant on reste comme ça

**Q7 — Workflow TDD pour les agents autonomes.**
Le TDD workflow exige une confirmation utilisateur à chaque étape RED/GREEN/BLUE — incompatible avec des agents autonomes exécutant ces tâches. Pour ces tâches de refactor (comportement inchangé), proposition : les agents travaillent en « tests verts en continu » (jamais tests + implémentation modifiés dans le même commit quand le comportement change), sans confirmations interactives.
Réponse : oui ok

**Q8 — Abréviations du format de save (`gId`, `pos`, `liId`, `woIds`…).**
Elles violent « avoid diminutives » mais reflètent le format wire du jeu. Recommandation : les conserver uniquement dans les types wire de `shared-save-format` (documentés comme DTO), et les traduire en langage métier dès l'entrée dans le domaine.
Réponse :oui (à noter que sahred-save-format sera finalement nommé shared-save-processing)

---

## Tâches

Ordre d'exécution : T0 → T1 → (T2, T3) → T4 → T5 → T6 → (T7, T8, T9, T10 parallélisables).
Chaque tâche doit laisser `bun test` et `bun run lint:types` verts.

### T0 — Fondation workspace (aucun blocage)

**Objectif** : transformer les 5 packages fantômes en vrais membres du workspace pour rendre la matrice de dépendances applicable et outillable.

- Créer un `package.json` (name, type module, exports) pour `shared-mapping`, `util-messages`, `util-parsing`, `util-platforms`, `util-types` ; les ajouter à `workspaces` du `package.json` racine (ils seront renommés/dissous en T1/T4/T5 — garder minimal).
- Déclarer les dépendances réelles de chaque package (y compris `core-mapping` qui n'a aucun bloc `dependencies` alors qu'il importe 6 packages).
- Remplacer tous les imports relatifs inter-packages (`../../util-parsing/…`, 26+ sites dans core-mapping, UI, cli) par des spécificateurs de package.
- Racine : ajouter `"private": true` ; supprimer `"main"` (pointe vers le CLI merge) ; supprimer `"dependencies": {"bun": …}` ; retirer `ui-save-manager` des devDependencies racine si la résolution workspace suffit.
- CI : `.github/workflows/quality.yml:5` déclenche sur `main` alors que fallow utilise `--base master` — aligner sur la branche par défaut réelle (`master`).
- **Acceptation** : `bun install` OK ; `bun test` vert ; `bun run lint:types` vert ; plus aucun import inter-package relatif ; `bun run audit:quality` sans nouvelle erreur.

### T1 — Créer `shared-save-format` ⏸ Q4

**Objectif** : donner un foyer légitime à la connaissance du format de save, aujourd'hui éparpillée dans `util-types`, `util-parsing`, `shared-mapping` et `docs/schemas`.

- Déplacer : `util-types/gameDefinitions/*` (sauf `RuntimePlatform.ts` → T4), `util-types/sectionIndexes.js`, `util-parsing/{parseSaveSections,serializeSave,stringifyEntry,normalizeSaveSections,hasJsonExtension}.js` (+ specs), `docs/schemas/*.schema.json`, `shared-mapping/testing/*` (dans `shared-save-format/testing/`).
- `buildMergedFileName.js` → dans `cli-merge` (convention de nommage produit, pas du format).
- `resolveIdConflicts.js` → temporairement dans `cli-merge` (rejoint le moteur de merge en T2 ; ne PAS le laisser en shared).
- Corriger au passage : supprimer `console.log` dans `parseSaveSections.js:55` (remonter l'erreur via le tableau `errors` déjà retourné) ; geler `FLOAT_FIELDS` (`stringifyEntry.js:3`) ; supprimer le message utilisateur hardcodé dans `normalizeSaveSections.js:23` (retourner un code/type de warning, le texte va en présentation) ; scinder `normalizeSaveSections.js` (2 exports sans rapport, nom de fichier ≠ export).
- Tests manquants (règle « every exported helper covered ») : `normalizeRawSections`, `verifySectionCount`, `serializeSave` (branches vides), `createFakeSaveString`/`createLegacyFakeSaveString`.
- Fixtures : convertir les exports mutables de `createFakeSaveContent.js` (`player`, `inventory`, `worldObjects`…) en fonctions factory `create*(overrides)` ; corriger la mutation du paramètre dans `createFakeParsedSave.js:24-26` ; élucider l'id dupliqué `95585246` (`createFakeSaveContent.js:38-39`) — si volontaire, l'isoler dans une fixture dédiée nommée explicitement.
- Supprimer les packages vidés ; mettre à jour tous les imports.
- **Acceptation** : plus de package `util-types`/`util-parsing`/`shared-mapping` ; `bun test` vert ; aucun spec de `shared-save-format` n'importe un autre package hors `util-*` ; chaque export a un test direct.

### T2 — Rapatrier le moteur de merge dans `core-mapping` ⏸ Q1

**Objectif** : inverser la dépendance critique `core-mapping → cli-merge`.

- Déplacer `cli-merge/merge.js`, `cli-merge/sections/*`, `cli-merge/helpers/*`, `resolveIdConflicts` (+ tous les specs) vers `core-mapping` : règles pures (dédup, ordre des saves, sentinelle `-1`, résolution d'ids) → `domain/rules/` ; orchestration → le use case `MergeSaveFiles` existant ; la sérialisation reste dans `shared-save-format`.
- `SaveFilesMergerService` (infrastructure) implémente `SaveMergerPort` en s'appuyant sur le domaine local, plus aucun import `cli-merge`.
- `cli-merge` devient thin : module de parsing d'arguments (`--input=`, `--output=`, défauts `input`/`output`) → appel de `MergeSaveFilesController` → module de rendu. Sortie : diagnostics sur **stderr**, résultat sur stdout ; `exitProcess(0)` explicite en succès ; code distinct si 0 dossier valide ; message d'erreur clair au lieu du dump d'objet (`merge-cli.js:13`) ; gérer >2 fichiers JSON par dossier (aujourd'hui silencieusement tronqué à 2, `merge-cli.js:33`).
- Supprimer l'auto-exécution à l'import au-dessus de la déclaration (`merge-cli.js:10-16`).
- **Acceptation** : `packages/cli-merge` ne contient plus aucune règle métier ; `core-mapping` n'importe plus `cli-merge` ; `bun merge` produit le même output qu'avant sur `input/` (comparaison avant/après) ; tests verts.

### T3 — Rapatrier le moteur de validation dans `core-mapping` ⏸ Q1

**Objectif** : inverser `core-mapping → cli-validate` et isoler ajv en infrastructure.

- `cli-validate/validate.js` → `core-mapping` : ajv + compilation des schémas → adaptateur `infrastructure/` implémentant `SaveValidatorPort` (compilation paresseuse, pas au chargement du module) ; `validateUniqueHost` et `validateFloatSerialization` → `domain/rules/` ; schémas importés depuis `shared-save-format`.
- Traduire les erreurs ajv brutes en messages applicatifs à la frontière (aujourd'hui `e.message` traverse jusqu'à l'écran) — au minimum, un type `{code, detail}` mappé en texte par la présentation.
- `cli-validate` devient thin : parsing `--file=` dans une fonction dédiée (usage string corrigée, `validate-cli.js:4`) ; `return` après `exitProcess(1)` (`validate-cli.js:14-18`, fall-through actuel) ; `exitProcess(0)` explicite.
- Déplacer aussi `save-file.schema.json` et `section3-world-objects.schema.json` (inutilisés) et laisser fallow signaler.
- **Acceptation** : `core-mapping` n'importe plus `cli-validate` ; ajv absent de tout ce qui n'est pas `infrastructure/` ; verdicts de validation identiques avant/après ; tests verts.

### T4 — Plateformes : `shared-platforms` ⏸ Q2

- Renommer `util-platforms` → `shared-platforms` ; `RuntimePlatform.ts` (depuis util-types) y devient le contrat.
- Supprimer la sélection au chargement (`platform.js:8` lit `process.argv` et peut throw à l'import) : exposer `createPlatform(platformName)` appelée par les CLI.
- Factoriser les ~60 % de duplication entre `platform.node.js` et `platform.bun.js`.
- Tests : corriger `extractPlatformParameter.spec.js:20` (`it.each([SUPPORTED_PLATFORMS])` passe le tableau comme un seul cas) et couvrir `isEntryPoint` des deux plateformes (logiques divergentes non testées).
- **Acceptation** : importer le package ne déclenche aucun accès à `process` ; les 2 CLI fonctionnent en bun ET node ; exports testés.

### T5 — Dissoudre `util-messages`

- Messages de sections (`*SectionMessages.js`, `validationMessages.js`, `mergeResultSectionMessages.js`) → `core-mapping/src/presentation/messages/` (exportés vers l'UI via l'`exports` map si besoin).
- Messages de routes/app (`appMessages.js`, `displayRouteMessages.js`, `notFoundRouteMessages.js`) → `ui-save-manager/src/messages/`.
- Supprimer le package et l'exclusion `packages/util-messages/**` de `fallow.toml` (selon Q5).
- **Acceptation** : package supprimé ; UI identique visuellement (build + smoke) ; tests verts.

### T6 — Clean Architecture interne de `core-mapping`

Sous-lots indépendants :
1. **Libellés hors du domaine** : `domain/worldObjectLabels.ts` (828 lignes) → `presentation/` ; les règles du domaine (`computeEnergyBreakdown.ts:27`, `computeOptimizers.ts:42-45`) retournent le `name` (identifiant), le presenter mappe vers le label ; `resolvePlanetLabel` (`SaveSectionsReaderService.ts:209-223`) : résolution d'identité planète → `domain/rules/`, fallback d'affichage → presenter ; `PlanetEnergyLevelsValueObject.planetId` porte un identifiant, plus un libellé (adapter `FakeSaveParserService` et les specs qui encodent les libellés).
2. **Requests applicatifs** : request objects pour `MergeSaveFiles` (4 strings positionnelles) et `ValidateSaveFile` ; pour les 5 use cases `Load*Section` sans input : le contrôleur mappe `ParsedSections` → request applicatif (le mapping d'entrée doit exister dans le contrôleur, pas via une factory d'infra).
3. **Exécution des règles au bon endroit** : `computePlanetEnergyLevels` sort de `SaveSectionsReaderService.ts:183` vers `LoadEnergyLevelsSection` (le port expose les données, pas l'agrégat calculé) ; `computeTerraformationSummary` sort de `TerraformationLevelsPresenter.ts:71` vers le use case ; le calcul de contribution `(x%)` (`EnergyLevelsPresenter.ts:81-87`) devient une donnée du domaine (ratio), le presenter ne fait que formater.
4. **Composition & contrôleurs** : typer les factories de `compositionRoot.ts` sur les ports ; `await useCase.execute(...)` dans les 7 contrôleurs ; supprimer `getWorldObjects` public hors-port (`SaveSectionsReaderService.ts:112`) ; aligner `getStatistics`/`getSaveConfiguration` sur le contrat du port (retours `undefined` possibles) ; retirer `getInventories` du port (appelé par aucun use case, le fake throw dessus).
5. **Presenters** : `viewModel` en accesseur `get` ; reconstruire le ViewModel au lieu de le muter en place (`GlobalProgressionPresenter.ts:33-35` + typo `totalCrafterObjects`, `PlayersPresenter.ts:23`, `TerraformationLevelsPresenter.ts:70`) ; lier ou rendre statique `mapItemNameToItemLabel` (`PlayersPresenter.ts:44`).
6. **Formatters** : factoriser les 6 copies de `formatDecimalNumber` ; corriger l'asymétrie seuil/division (`kelvin/partsPer/pascal.strategy.ts` — bug visible : `100` rend `100 ppq`). ⚠️ corrige un comportement : mettre à jour les specs en le signalant.
- **Acceptation** : aucun import de `presentation/` ou `infrastructure/` par `domain/`/`application/` ; aucun `worldObjectLabels` sous `domain/` ; `computeTerraformationSummary` absent de `presentation/` ; tests verts.

### T7 — Invariants du domaine ⏸ Q3

Version recommandée (b) :
- `readonly` sur tous les champs des 9 VOs et 5 entités.
- Factories avec validation pour les types critiques : position (rejeter `NaN` — corrige `parsePosition`, `SaveSectionsReaderService.ts:33-36`), `WorldObjectEntity`, `PlayerEntity` ; introduire une erreur domaine (`InvalidSaveDataError`).
- Garde de division dans `computeOptimizers.ts:38`.
- Retirer le `@ts-ignore` de `SaveSectionsReaderService.spec.ts:59-60`.
- **Acceptation** : mutation d'un VO = erreur de compilation ; save corrompue → erreur domaine explicite testée.

### T8 — Conformité UI

- `routes/index.tsx` : ne plus appeler `parseSaveSections` directement — passer par un contrôleur core (créer un use case « charger et valider une save » qui orchestre validation → parsing, orchestration aujourd'hui dans l'UI lignes 63-75).
- Ne plus propager `ParsedSections` (type wire) dans les composants (5 composants Section) : chaque section reçoit son ViewModel.
- Corriger le bug `<Show when={sections}>` (accessor jamais falsy) dans `TerraformationLevelsSection.tsx:28` et `PlayersSection.tsx:23`.
- Scinder `routes/index.tsx` (132 lignes, ≥4 responsabilités) ; extraire un helper partagé `readFileAsText` (dupliqué `MergeSection.tsx:19-26` et `routes/index.tsx`).
- Extraire une grille commune dans `EnergyLevelsSection.tsx` (3 blocs quasi identiques).
- Statuts `'success' | 'validationError'` exposés par le ViewModel au lieu de littéraux dupliqués (`MergeResultSection.tsx`).
- **Acceptation** : `grep parseSaveSections packages/ui-save-manager` vide ; `grep ParsedSections packages/ui-save-manager/src/components` vide ; `bun run build:ui` OK ; smoke test manuel identique.

### T9 — Conformité des tests (transverse, après T1–T6)

- **Titres** : premier `describe` = nom de l'entité en langage métier ; describes imbriqués commençant par « When » (14 occurrences dans `cli-validate/validate.spec.js`, `merge.spec.js:23`) ; retirer « when/if/in case » des `it` (24 occurrences).
- **AAA** : ajouter les commentaires manquants ; séparer les phases fusionnées (`validate-cli.spec.js:37,43,52,101`).
- **Un comportement par test** : scinder `merge.spec.js:24-122` (~98 lignes, 2 unités) ; scinder les tests multi-Act de `formatNumber.spec.ts` et `SaveSectionsReaderService.spec.ts` ; supprimer le test dupliqué `mergeWorldObjects.spec.js:28-64`.
- **Hygiène** : `await` sur `expect(...).rejects` (`validate-cli.spec.js:38,101`) ; `mockRestore`/`afterEach` pour les spies console ; fixtures de describe-scope réinitialisées ou en factory.
- **Doubles aux frontières** : recentrer les 7 specs de contrôleurs core (full-stack) sur mapping/orchestration avec doubles ; conserver UN test d'intégration full-stack par flux, explicitement nommé.
- **Couverture manquante** : `domain/rules/compute*` (7 fichiers non testés), `collectEjectedPlayerInventoryIds`, les 8 `formatNumber/*.strategy.ts`, plateformes (T4).
- **Acceptation** : `bun test` vert ; tous les describes imbriqués commencent par When ; 100 % des `it` commencent par should ; aucun `spyOn` sans restauration.

### T10 — Finitions CLI & repo

- `input/`/`output/` hardcodés → arguments avec défauts (fait en T2, vérifier).
- README : mettre à jour commandes et architecture des packages.
- `AGENTS.md` : le remplir (commandes bun, layout des packages, décisions des Questions) — slot « instructions projet » prioritaire, actuellement vide.
- `fallow.toml` : retirer les exclusions obsolètes (selon Q5).
- **Acceptation** : `bun run audit:quality` vert ; README exact.

---

## Vérification globale

1. `bun test` (aucun test affaibli pour passer).
2. `bun run lint:types`.
3. `bun run audit:quality` (fallow).
4. Comportement inchangé : `bun merge` sur `input/Test/` → diff avant/après ; `bun validate -- --file=...` ; `bun run build:ui` + chargement manuel d'une save.
5. Matrice de dépendances : grep des imports inter-packages vérifié contre la matrice.

## Risques

- **Volume** : T2/T3/T6 déplacent l'essentiel du code métier. Mitigation : une tâche = une PR, tests verts à chaque étape, jamais tests + implémentation modifiés ensemble quand le comportement change (Q7).
- **T6.6 et T7 changent des comportements observables** (bug des seuils de formatters, validation des positions NaN) : commits dédiés avec mise à jour explicite des specs.
- Les specs contrôleurs full-stack actuels sont le meilleur filet de sécurité pendant T2/T3/T6 : ne les convertir en tests à doubles (T9) qu'APRÈS les déplacements.

---

## Conseils d'amélioration des règles / instructions

1. **Trou dans la matrice de dépendances** : `cli-*` ne peut pas atteindre `core-*`, ce qui rend la règle « thin CLI » (ARCH-3) inapplicable dès qu'un core existe — cause racine de l'inversion critique constatée. Ajouter `core-*` aux dépendances autorisées de `cli-*`.
2. **Préciser si les imports type-only comptent** comme dépendance dans la matrice (les `@import` JSDoc sont effacés au runtime ; la règle ne tranche pas).
3. **Prévoir un foyer pour les adaptateurs d'infrastructure partagés** (fs/process multi-runtime) : préfixe `infra-`, ou mention explicite dans ARCH-5 que `shared-*` peut contenir des adaptateurs techniques.
4. **ARCH-5** : autoriser/mentionner explicitement les packages 100 % fixtures de test et donner une convention de nommage (`shared-*-fixtures`).
5. **TDD workflow** : ajouter une clause « mode autonome » (agents sans utilisateur dans la boucle) précisant ce qui remplace les confirmations RED/GREEN/BLUE.
6. **TEST-1 / AAA** : préciser si `// Arrange` peut être omis quand il n'y a rien à préparer (source du plus gros volume de violations mineures).
7. **Exception DTO/wire** : formaliser dans STD-1 que les abréviations imposées par un format externe (`gId`, `liId`…) sont tolérées dans les types wire documentés comme tels, interdites au-delà.
8. **Outillage** : la matrice n'est vérifiée par rien. Après T0, ajouter un check automatique (règle fallow si disponible, sinon dependency-cruiser ou script) — sinon les violations reviendront.
9. **AGENTS.md du projet** est vide et gitignoré : y consigner les décisions prises via les Questions, pour que les agents suivants n'aient pas à redécouvrir le contexte.