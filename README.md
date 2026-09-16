# Web design project

React, TypeScript and Vite. Local development only.

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. The contact page is at `/contact`.

## Checks

```sh
npm run check
```

This runs formatting, lint, visitor-behavior tests, TypeScript checking and a production build.
Use `npm run test:watch` while changing an interaction, and `npm run fmt` to format files.

The tests cover gallery cycling, per-section image memory, swipe/click suppression, dismissal,
interrupted animation, delayed image loading, contact disclosure and retry, reduced motion,
and section travel without queued gestures. They assert visitor outcomes rather than helper
implementations. `tests/setup.ts` supplies the browser layout and animation APIs missing in jsdom.
It does not simulate visual rendering; responsive layout, native dialog focus, and motion still
need browser verification. See [the interaction requirements](docs/interaction-requirements.md).

## Code structure

- `src/portfolio`: page components, chapter/service content, the pure selection reducer and view models.
- `src/gallery`: gallery components and React hooks for browser animations, image loading and gestures;
  reusable geometry, swipe and index calculations are in `utils.ts`.
- `src/navigation`: a React lifecycle hook, a browser event adapter, and pure section-travel calculations.
- `src/contact`: the contact page, React-owned disclosure state, reducer and contact-method mapping.
- `src/components`: shared named UI components.
- `src/styles`: base, header, portfolio, gallery, contact, services and motion styles.

React owns rendered state through `useState` and `useReducer`. Reducers, calculations, mappers and
content are ordinary TypeScript with explicit inputs; they do not import React or read the DOM.
Hooks own imperative browser resources: animation handles, image requests, gesture tracking and
observers. There is no external state store or RxJS. Event handlers only connect these pieces.

Use direct imports, named components with matching filenames, nearby shared `types.ts` contracts,
and module-level utilities and constants. Reuse an existing type when it fits. A function-specific
argument shape is named `functionNameArgs` (or `ComponentNameArgs`) immediately above that function.
Keep repeated UI content in data, keep transformations out of JSX, and use Oxfmt/Oxlint for consistency.

Contact values remain placeholders in `src/contact/contact-details.ts`. On-demand loading is a
basic scraping deterrent; client-side code is public. Photographs are local assets with source
URLs recorded in `image-sources.json`; this repository grants no reuse rights to those assets.

Changes stay local. Do not push to a remote without explicit instruction.
