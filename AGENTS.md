# figma-make-app

React + Vite + Tailwind CSS v4 project running inside Figma Make.

## Development Server

A Vite dev server is **already running** on port 8443 (default). You do not need to start it manually.

- Preview: Access the app via the preview panel
- Hot reload: Changes to source files are reflected immediately
- To restart: `pnpm dev`

## Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm format` | Format with oxfmt |

## Project Structure

Key entrypoints:

- `src/main.tsx` — React root; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` — Main component (~700 lines); handles lists, items, categories, editing, and filtering
- `src/index.css` — Global styles + Tailwind v4 `@import`; put base element styles inside `@layer base { ... }`
- `vite.config.ts` — Vite config with React, Tailwind v4, and Figma Make plugins; `@` alias resolves to `src/`
- `index.html` — HTML shell with Figma Make comment slots (`<!-- figma:lang -->`, etc.)
- `.mise.toml` — Node 22 + pnpm 10.34.3 toolchain versions

**Note:** The `@` alias maps to `src/` (via `vite.config.ts` resolve.alias). Import as `import X from '@/components/Y'`.

## Dependencies

- **Runtime**: React 19, React DOM 19
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Build**: Vite 8, TypeScript 5.7, `@vitejs/plugin-react`
- **Formatting**: oxfmt `^0.2.0`

**TypeScript**: `tsconfig.json` enables `strict: true`, `noEmit: true`, `jsx: react-jsx`, and `@/*` paths mapping to `src/*`. No `tsconfig.json` needed beyond `src/` — Vite handles resolution.

## Styling

- Tailwind CSS v4 — **no `tailwind.config.js` or PostCSS config** is needed.
- `src/index.css` imports Tailwind with `@import 'tailwindcss';`.
- Global element styles (body, headings, button, input) belong inside `@layer base { ... }` so Tailwind utility classes still cascade correctly.
- Preflight already sets `box-sizing: border-box`, removes default margins, and sets `font: inherit` on form controls — do not repeat those rules.
- Color theme: purple/lavender (`#4c2365`, `#7f5d99`, `#c4a4da`).
- Fonts: DM Sans (UI) + DM Serif Display (headings).

## Figma Make Integration

The Vite config includes Figma-specific plugins (all defined in `vite.config.ts`):

- `figmaSiteConfiguration` — injects meta tags, title, favicon, analytics, bypass links
- `figmaErrorOverlayReplay` — preserves the last build error for reconnecting clients
- `figmaReactRefreshBoundaryFallback` — HMR boundary management for React Refresh
- `figmaMakeKitPlugin` — renders story entries into a grid at `/.figma/make/kit.html`
- `figmaLinkedPackageSourcemaps` — preserves dependency sourcemaps under `node_modules/`

**Do not remove these plugins** — they are required for Figma Make preview/deploy functionality.

## Interaction Quirks (important for agents)

The app uses several pointer-event patterns you should respect:

- **Long-press**: 550ms timer (`startLongPress` / `cancelLongPress` in `App.tsx`). Tapping quickly then clicking should not trigger the long-press action. The `consumeLongPressClick()` guard prevents double-fire.
- **Filter drag**: The `.filters` nav supports swipe/scroll dragging on touch. `onPointerDown/PointerMove/PointerUp` handle drag state in `filterDrag` ref.
- **Context menu** on filter chips opens the category editor (`openClassEditor`).
- **onContextMenu** on list items also opens the item editor (`openItemEditor`).
- `ignoreNextClick` ref is used to suppress a click after a long-press action fires.

**Pattern**: Always check `consumeLongPressClick()` or `ignoreNextClick.current` before acting on a click following a long-press start, to avoid double-execution.

## Responsive Breakpoints

Media queries in `src/index.css`:

- `(max-width: 520px)` — single-column layout; side menu becomes `display: phone`; no border/radius/box-shadow on phone container.
- `(max-height: 760px) and (min-width: 521px)` — reduces app-shell padding and phone height.

If adding new components, test at these breakpoints or add appropriate media queries.

## Common Agent Mistakes to Avoid

1. **Forgetting `consumeLongPressClick()` guard** — clicking after a long-press start will double-fire without the guard.
2. **Adding a `tailwind.config.js`** — not needed; all customization goes in `src/index.css` via `@layer base` and utility classes.
3. **Importing from `src/` without `@` alias** — use `import X from '@/...'` since the alias is defined in `vite.config.ts`.
4. **Removing Figma Make plugins from `vite.config.ts`** — they are required for the Figma preview to work.
5. **Placing global CSS outside `@layer base`** — Tailwind v4 layers override in order; base layer ensures utility classes win.
