# Food styling portfolio

React, TypeScript and Vite. Use Node.js 24 for local development and builds.

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. Contact is at `/contact/`; legal information is at `/legal/`.

## Design rationale

- **Sensory communication:** photography evokes taste, texture and temperature, inviting an emotional response.
- **Progressive disclosure:** a question introduces the image; interaction completes the thought.
- **Visual restraint:** minimal composition, clear hierarchy and generous space keep attention on the work.
- **Considered motion:** measured transitions and subtle rhythmic cues lend the interactions a tactile quality.
- **Continuity of exploration:** galleries preserve position and image selection, with clear paths between views.
- **Personal voice:** character emerges through the work and the maker’s perspective, with a quiet invitation to connect.

## GitHub Pages

Preview: [Food styling portfolio](https://letsgoetz-private.github.io/web-design-project/).
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
section travel without queued gestures, and navigation and images under a hosting base path.
They assert visitor outcomes rather than helper
implementations. `tests/setup.ts` supplies the browser layout and animation APIs missing in jsdom.
It does not simulate visual rendering; responsive layout, native dialog focus, and motion still
need browser verification. See [the interaction requirements](docs/interaction-requirements.md).

## Code structure

Section travel uses browser-native smooth scrolling; heartbeat cues pause during travel and in
offscreen chapters. Page images use responsive WebP variants, thumbnails use 160px previews, and
the gallery keeps the original photographs. Regenerate previews with
`python scripts/optimize-images.py` (requires Pillow); generated files are checked in.

- `src/portfolio`: page components, chapter/service content, the pure selection reducer and view models.
- `src/gallery`: gallery components and React hooks for browser animations, image loading and gestures;
  reusable geometry, swipe and index calculations are in `utils.ts`.
- `src/navigation`: a React lifecycle hook, a browser event adapter, and pure section-travel calculations.
- `src/contact`: the contact page, React-owned disclosure state, reducer and contact-method mapping.
- `src/legal`: legal information and the shared footer notice.
- `src/site`: page selection, route names and hosting-aware URLs.
- `src/components`: shared named UI components.
- `src/styles`: base, header, portfolio, gallery, contact, services, legal and motion styles.

React owns rendered state through `useState` and `useReducer`. Reducers, calculations and mappers
are pure module-level arrow functions: explicit inputs, returned values, no DOM reads or mutation
of caller-owned state. Hooks own browser resources, image requests, gestures and observers;
side-effect handlers stay in their owning hook or component and use `useCallback`.
There is no external state store or RxJS.

Use arrow functions, direct imports and named components with matching filenames. Colocate
single-consumer constants, types and reducers with their consumer; only shared declarations belong
in shared modules. Reuse an existing type when it fits. A function-specific
argument shape is named `functionNameArgs` (or `ComponentNameArgs`) immediately above that function.
Keep repeated UI content in data, keep transformations out of JSX, and use Oxfmt/Oxlint for consistency.

Contact values remain placeholders in `src/contact/contact-details.ts`. On-demand loading is a
basic scraping deterrent; client-side code is public.

## Rights and legal details

Images © Timo Müller, included with permission for the website and public repository.
Source URLs are in `image-sources.json`; see [image rights](ASSET_RIGHTS.md).
Website attribution is recorded in [the credits](CREDITS.md).

The public preview still contains operator and privacy placeholders; its legal notice is incomplete.
Pending details are listed in [the legal handover](docs/legal-handover.md).

Changes stay local. Do not push to a remote without explicit instruction.
