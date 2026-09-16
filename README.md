# Web design project

React, TypeScript and Vite. Use Node.js 24 for local development and builds.

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. Contact is at `/contact`; legal information is at `/legal`.

## Design rationale

- **Sensory communication:** photography evokes taste, texture and temperature, inviting an emotional response.
- **Progressive disclosure:** a question introduces the image; interaction completes the thought.
- **Visual restraint:** minimal composition, clear hierarchy and generous space keep attention on the work.
- **Considered motion:** measured transitions and subtle rhythmic cues lend the interactions a tactile quality.
- **Continuity of exploration:** galleries preserve position and image selection, with clear paths between views.
- **Personal voice:** character emerges through the work and the maker’s perspective, with a quiet invitation to connect.

## GitHub Pages

Preview address: `https://letsgoetz-private.github.io/web-design-project/`.
Publishing is manual: **Actions → Deploy preview to GitHub Pages → Run workflow** on `master`.
The workflow checks and builds the app before deployment; pushing alone does not publish it.

`SITE_BASE_PATH` sets the hosting path and defaults to `/` locally. The build writes contact and
legal entry pages so direct links and refreshes work on static hosting.

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
- `src/legal`: legal information and the shared footer notice.
- `src/site`: page selection, route names and hosting-aware URLs.
- `src/components`: shared named UI components.
- `src/styles`: base, header, portfolio, gallery, contact, services, legal and motion styles.

React owns rendered state through `useState` and `useReducer`. Reducers, calculations, mappers and
content are ordinary TypeScript with explicit inputs; they do not import React or read the DOM.
Hooks own imperative browser resources: animation handles, image requests, gesture tracking and
observers. There is no external state store or RxJS. Event handlers only connect these pieces.

Use direct imports, named components with matching filenames, nearby shared `types.ts` contracts,
and module-level utilities and constants. Reuse an existing type when it fits. A function-specific
argument shape is named `functionNameArgs` (or `ComponentNameArgs`) immediately above that function.
Keep repeated UI content in data, keep transformations out of JSX, and use Oxfmt/Oxlint for consistency.

Contact values remain placeholders in `src/contact/contact-details.ts`. On-demand loading is a
basic scraping deterrent; client-side code is public.

## Rights and legal details

Images © Timo Müller, included with permission for the website and public repository.
Source URLs are in `image-sources.json`; see [image rights](ASSET_RIGHTS.md).
Website attribution is recorded in [the credits](CREDITS.md).

Operator and privacy details still contain placeholders.
Complete [the legal handover](docs/legal-handover.md) before publishing.

Changes stay local. Do not push to a remote without explicit instruction.
