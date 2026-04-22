# Zepular

> Design system et bibliothèque de composants Angular pour les applications du **Groupe ISM / DSI**.

Zepular est un monorepo Angular qui fournit un ensemble de **10 librairies npm indépendantes**, toutes scopées sous `@zepular/*`, conçues pour être installées à la carte selon les besoins de chaque application consommatrice.

---

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation-côté-application-consommatrice)
- [Utilisation des styles partagés](#utilisation-des-styles-partagés)
- [Développement](#développement)
- [Build](#build)
- [Tests](#tests)
- [Publication](#publication)
- [Conventions](#conventions)
- [Contribuer](#contribuer)
- [Contributeurs](#contributeurs)
- [Licence](#licence)

---

## Architecture

Zepular est structuré autour de 10 libs publiables indépendamment :

| Package              | Rôle                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| `@zepular/styles`    | Tokens SCSS partagés : variables, mixins, theme (light/dark)         |
| `@zepular/control`   | Primitives d'interaction bas niveau (focus, keyboard, a11y helpers)  |
| `@zepular/overlay`   | Système d'overlays (backdrop, positionnement, z-index)               |
| `@zepular/message`   | Toasts, alerts, notifications                                        |
| `@zepular/menu`      | Menus contextuels, dropdowns                                         |
| `@zepular/panel`     | Panels latéraux, accordions, drawers                                 |
| `@zepular/form`      | Input, select, checkbox, radio, textarea, validation                 |
| `@zepular/button`    | Boutons (primary, secondary, icon, toggle…)                          |
| `@zepular/file`      | Upload, file picker, preview                                         |
| `@zepular/data`      | Table, liste, pagination, tri, filtres                               |

### Graphe de dépendances

```
styles        (tokens, aucune dépendance)
  │
  ├── control    ──────────┬── form   ──── file
  │                        ├── button ────┘
  │                        └── data
  │
  └── overlay    ──────────┬── message
                           ├── menu
                           └── panel
```

Chaque lib déclare ses dépendances inter-libs via ses **`peerDependencies`** dans `projects/zepular/<lib>/package.json`.

### Structure du repo

```
zepular/
├── angular.json                 Config workspace (10 projets libs)
├── tsconfig.json                Path mappings @zepular/* → dist/zepular/*
├── package.json                 Scripts build/publish
├── projects/
│   └── zepular/
│       ├── styles/              @zepular/styles
│       │   ├── ng-package.json    (assets: scss/**/*.scss)
│       │   ├── package.json
│       │   ├── scss/              ← tokens, mixins, theme
│       │   └── src/public-api.ts
│       ├── control/             @zepular/control
│       ├── overlay/             @zepular/overlay
│       ├── message/             @zepular/message
│       ├── menu/                @zepular/menu
│       ├── panel/               @zepular/panel
│       ├── form/                @zepular/form
│       ├── button/              @zepular/button
│       ├── file/                @zepular/file
│       └── data/                @zepular/data
└── dist/
    └── zepular/                 ← sortie des builds, prête à publier
```

---

## Prérequis

- **Node.js** `>=22.0.0`
- **npm** `>=10.9.0`
- **Angular CLI** `^21.2.8` (fourni via `devDependencies`)

---

## Installation (côté application consommatrice)

Les apps consomment chaque lib comme un package npm standard :

```bash
npm install @zepular/styles @zepular/form @zepular/button
```

Puis dans le code :

```ts
import { InputText } from '@zepular/form';
import { Button }    from '@zepular/button';

@Component({
  imports: [InputText, Button],
  template: `
    <zep-input-text [(value)]="email" label="Email" type="email" />
    <zep-button>Valider</zep-button>
  `,
})
export class LoginForm { email = ''; }
```

---

## Utilisation des styles partagés

`@zepular/styles` expose :

1. **Des variables SCSS** (`$zep-color-primary`, `$zep-spacing-4`, etc.) — à `@use` dans vos SCSS
2. **Des mixins** (`focus-ring`, `flex-center`, `elevation`, etc.)
3. **Un theme en CSS custom properties** (`--zep-color-primary`, `--zep-color-bg`, etc.) — pour le runtime theming (light/dark)

### Dans une app consommatrice

```scss
// styles.scss
@use '@zepular/styles/scss/theme';       // injecte les :root { --zep-* }
@use '@zepular/styles/scss/variables' as v;
@use '@zepular/styles/scss/mixins' as m;

.my-card {
  background: var(--zep-color-surface);
  padding: v.$zep-spacing-4;
  @include m.elevation(2);
}
```

### Dans une lib Zepular

Les 9 autres libs ont `styleIncludePaths: ["../styles/scss"]` dans leur `ng-package.json`, donc depuis leurs composants :

```scss
@use 'variables' as v;
@use 'mixins' as m;
```

### Dark mode

Ajoutez `data-theme="dark"` sur un ancêtre (`<html>` ou `<body>`) pour basculer automatiquement sur les couleurs sombres.

```html
<html data-theme="dark">
```

---

## Développement

### Installation du workspace

```bash
git clone <url-du-repo> zepular
cd zepular
npm install
```

### Travailler sur une lib en mode watch

```bash
ng build @zepular/form --watch --configuration development
```

Le path mapping TypeScript (`tsconfig.json`) pointe automatiquement vers `dist/zepular/<lib>`, donc les autres libs et les apps consommatrices (en workspace) voient les changements immédiatement.

### Générer un nouveau composant

```bash
ng generate component mon-composant --project=@zepular/form
```

SCSS est configuré par défaut (voir `angular.json` → `schematics`).

### Ajouter une lib

```bash
ng generate library @zepular/nouvelle-lib --prefix=zep
```

Puis :

1. Ajouter `styleIncludePaths: ["../styles/scss"]` dans son `ng-package.json`
2. Ajouter le script `build:<nom>` dans le `package.json` racine
3. Insérer le nom dans `build:all` dans le bon ordre topologique

---

## Build

### Une lib

```bash
npm run build:form        # build @zepular/form
```

### Toutes les libs (ordre topologique)

```bash
npm run build:all
```

L'ordre respecte le graphe de dépendances : `styles → control → overlay → message/menu/panel → form/button → file → data`.

### Clean

```bash
npm run clean             # rm -rf dist/
```

---

## Tests

```bash
ng test @zepular/form     # tests d'une lib
ng test                   # tous les tests
```

Le test runner est **Vitest** (jsdom).

---

## Publication

### Authentification

```bash
npm login                 # compte npmjs.com avec accès au scope @zepular
```

### Publier une version

1. **Bump de version** dans le `projects/zepular/<lib>/package.json` concerné (ou via changesets)
2. **Build**
3. **Publish** depuis le dossier `dist/`

```bash
npm run build:all
npm run publish:dry       # dry-run pour vérifier ce qui partira
npm run publish:all       # publication réelle
```

> **Note** : le premier publish d'un package scopé nécessite `--access public` (déjà intégré dans les scripts).

### Outils recommandés

- **[Changesets](https://github.com/changesets/changesets)** pour gérer le versioning sémantique et les changelogs de chacune des 10 libs :
  ```bash
  npm install -D @changesets/cli
  npx changeset init
  ```

---

## Conventions

### Nommage

- **Sélecteurs** : préfixe `zep-` (ex. `zep-input-text`, `zep-button`)
- **Classes CSS** : BEM-like, préfixe `zep-` (ex. `.zep-input-text__label`, `.zep-input-text--invalid`)
- **Fichiers composants** : kebab-case (ex. `input-text.ts`)
- **Noms de classes TS** : PascalCase sans suffixe `Component` (ex. `InputText`)

### API des composants

- **Standalone only** — pas de NgModules
- **Signals** : préférer `input()`, `model()`, `output()`, `computed()` à `@Input`/`@Output`
- **ChangeDetection.OnPush** par défaut
- **ViewEncapsulation.None** pour les composants dont les styles doivent être surchargeables par les apps
- **A11y first** — tous les composants doivent respecter WAI-ARIA

### Commits

Format [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat(form): ajouter le composant select
fix(button): corriger le focus-ring en dark mode
docs(readme): mettre à jour l'architecture
chore(deps): bump ng-packagr to 21.3.0
```

---

## Contribuer

1. **Fork** et clone du repo
2. Créer une branche : `git checkout -b feat/ma-feature`
3. Développer, tester, linter
4. Commit selon la convention ci-dessus
5. Ouvrir une **Pull Request** vers `main`
6. Au moins un review approuvé avant merge

### Checklist avant PR

- [ ] Le code builde : `npm run build:all`
- [ ] Les tests passent : `ng test`
- [ ] Les nouveaux composants ont des tests
- [ ] La doc est à jour (README de la lib si applicable)
- [ ] Pas de `console.log` oublié
- [ ] Respect des conventions de nommage

---

## Contributeurs

Merci aux personnes qui ont contribué à Zepular :

| Nom           | Rôle                       | Contact                            |
| ------------- | -------------------------- | ---------------------------------- |
| **Zack**      | Mainteneur principal       | [zackabess@gmail.com](mailto:zackabess@gmail.com) |
| *À compléter* | *À compléter*              | *À compléter*                      |

> Pour rejoindre la liste, contacte le mainteneur ou ouvre une PR qui modifie ce tableau.

### Remerciements

- [Angular](https://angular.dev/) — le framework
- [ng-packagr](https://github.com/ng-packagr/ng-packagr) — le builder de librairies
- L'équipe **Groupe ISM / DSI** pour le cadrage et les retours

---

## Licence

Copyright © 2026 Groupe ISM / DSI — Tous droits réservés.

*(À adapter selon la politique de publication : propriétaire interne, MIT, Apache-2.0, etc.)*
# zepular
