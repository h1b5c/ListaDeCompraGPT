# Shopping List App

React + Vite + Tailwind CSS v4 shopping list application running inside **Figma Make**.

A mobile-first app that mimics a phone interface for managing grocery lists with category filtering, progress tracking, and dual-group support (Personal/Family).

---

## 📱 Preview

Access the running app at `http://localhost:8443/` (development server).

![Shopping List App](https://via.placeholder.com/800x1800/fcf9fd/4c2365.png?Text=Shopping+List+App+Phone+Interface)

*Phone-shaped container (414×880px) with purple/lavender color theme.*

---

## 🚀 Development Server

A Vite dev server is **already running** on port 8443 (default). You don't need to start it manually.

- **Preview URL**: http://localhost:8443/
- **Hot reload**: Changes to source files are reflected immediately
- **To restart**: `pnpm dev`

Available scripts (in `package.json`):

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm format` | Format with oxfmt |

---

## 📂 Project Structure

```
src/
├── App.tsx          # Main component (~700 lines)
│   - State: lists, activeGroup, categories, filter, editing
│   - Functions: toggleItem, addItem, openItemEditor, saveClass, etc.
│   - Pointer events: long-press, filter drag, context menus
├── index.css        # Global styles + Tailwind v4 @import
│   - @layer base with custom element styles
│   - Color theme: #4c2365, #7f5d99, #c4a4da
│   - Responsive breakpoints: 520px, 760px
├── main.tsx         # React root entrypoint
└── vite-env.d.ts    # TypeScript environment types

index.html           # HTML shell with Figma Make comment slots
vite.config.ts       # Vite config + Figma Make plugins
package.json         # Dependencies and scripts
.mise.toml           # Node 22 + pnpm 10.34.3 toolchain versions
```

**@ alias**: Import as `import X from '@/components/Y'` (defined in `vite.config.ts` resolve.alias).

---

## 🛠️ Dependencies

| Category | Packages |
|----------|----------|
| **Runtime** | React 19, React DOM 19 |
| **Styling** | Tailwind CSS v4, `@tailwindcss/vite` plugin |
| **Build** | Vite 8, TypeScript 5.7, `@vitejs/plugin-react` |
| **Formatting** | oxfmt `^0.2.0` |

**TypeScript**: `tsconfig.json` enables `strict: true`, `noEmit: true`, `jsx: react-jsx`, and `@/*` paths mapping to `src/*`.

**No `tailwind.config.js` needed** — all customization goes in `src/index.css` via `@layer base` and utility classes.

---

## 🎨 Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin.

- `src/index.css` imports Tailwind with `@import 'tailwindcss';`
- **Global element styles** (body, headings, button, input) belong inside `@layer base { ... }` so Tailwind utility classes still cascade correctly.
- Preflight already sets `box-sizing: border-box`, removes default margins, and sets `font: inherit` — do not repeat those rules.
- **Color theme**: Purple/Lavender (`#4c2365`, `#7f5d99`, `#c4a4da`).
- **Fonts**: DM Sans (UI) + DM Serif Display (headings).

### Responsive Breakpoints (in `src/index.css`):

| Query | Effect |
|-------|--------|
| `(max-width: 520px)` | Single-column layout; side menu becomes `display: phone`; no border/radius/box-shadow on phone container |
| `(max-height: 760px) and (min-width: 521px)` | Reduces app-shell padding and phone height |

---

## 💡 Key Features

| Feature | Description |
|---------|-------------|
| **Dual groups** | Switch between **Personal** and **Family** lists |
| **Item management** | Add, toggle check/uncheck, edit name/detail/categories, remove |
| **Category system** | Built-in: Produce, Dairy, Bakery, Pantry + add custom categories |
| **Progress tracking** | Progress bar: `(completed / total) * 100%`; "You're all done!" when 0 items remain |
| **Filter system** | Scrollable filter chips; long-press to edit category; swipe drag support |
| **Side menu** | Slide-in menu to switch groups; scrim overlay |
| **Figma Make integration** | 5 plugins in `vite.config.ts` required for preview/deploy |

---

## ⚠️ Interaction Quirks (Important)

The app uses several pointer-event patterns you should be aware of:

- **Long-press**: 550ms timer (`startLongPress` / `cancelLongPress`). Tapping quickly then clicking should **not** trigger the long-press action.
- **Guard pattern**: Always check `consumeLongPressClick()` before acting on a click following a long-press start, to avoid double-fire.
- **Filter drag**: The `.filters` nav supports swipe/scroll dragging on touch. `onPointerDown/PointerMove/PointerUp` handle drag state.
- **Context menu**: On filter chips → opens category editor; on list items → opens item editor.
- **Pointer events**: `onPointerDown/PointerMove/PointerUp/PointerCancel` are used throughout for drag and long-press logic.

---

## ⚙️ Figma Make Integration

The Vite config includes **5 Figma-specific plugins** (all in `vite.config.ts`):

| Plugin | Purpose |
|--------|---------|
| `figmaSiteConfiguration` | Injects meta tags, title, favicon, analytics, bypass links |
| `figmaErrorOverlayReplay` | Preserves last build error for reconnecting clients |
| `figmaReactRefreshBoundaryFallback` | HMR boundary management for React Refresh |
| `figmaMakeKitPlugin` | Renders story entries into a grid at `/.figma/make/kit.html` |
| `figmaLinkedPackageSourcemaps` | Preserves dependency sourcemaps under `node_modules/` |

**Do not remove these plugins** — they are required for Figma Make preview/deploy functionality.

---

## 🐛 Common Agent Mistakes (from AGENTS.md)

1. **Forgetting `consumeLongPressClick()` guard** — clicking after a long-press start will double-fire
2. **Adding a `tailwind.config.js`** — not needed; all customization in `src/index.css`
3. **Importing from `src/` without `@` alias** — use `import X from '@/...'` since the alias is defined in `vite.config.ts`
4. **Removing Figma Make plugins from `vite.config.ts`** — they are required for the Figma preview to work
5. **Placing global CSS outside `@layer base`** — Tailwind v4 layers override in order; base layer ensures utility classes win

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
pnpm install   # or: npm install

# 2. Start dev server
pnpm dev       # App opens at http://localhost:8443/

# 3. Build for production
pnpm build     # TypeScript strict mode; noEmit: true

# 4. Preview production build
pnpm preview   # Serves the built output

# 5. Format code
pnpm format    # oxfmt
```

---

## 📦 What's Included

- `src/App.tsx` — Complete shopping list application
- `src/index.css` — Tailwind v4 global styles
- `vite.config.ts` — Vite + Figma Make plugins (5 plugins)
- `AGENTS.md` — Agent guidance document (OpenCode)
- `.opencode/plan` — Implementation plan with 5 phases
- `index.html` — HTML shell with Figma Make comment slots
- `package.json` / `pnpm-lock.yaml` — Dependencies locked

---

## 📄 License

Private — Figma Make project.

---

*Built with React 19, Vite 8, Tailwind CSS v4, and Figma Make.*