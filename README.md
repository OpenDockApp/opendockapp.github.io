# OpenDock website

A responsive Astro landing page for OpenDock, styled with Tailwind CSS 4 and component-specific CSS. No client framework is required.

## Develop

```sh
bun install
bun run dev -- --background
```

Manage the preview with `bun run astro dev status`, `bun run astro dev logs`, and `bun run astro dev stop`.

## Production

```sh
bun run build
bun run preview
```

The static site is generated in `dist/`. The canonical site URL is configured in `astro.config.mjs` for the root GitHub Pages domain.

## Organization

- `src/pages/index.astro` composes the page.
- `src/layouts/Layout.astro` owns metadata and the shared shell.
- `src/components/` contains independent page sections and the dock preview.
- `src/data/site.ts` owns repository links and widget copy.
- `src/styles/` contains global tokens, responsive layout, and dock styles.
- `src/scripts/interactions.ts` handles progressive scroll reveals and accessible preset switching.
- `public/images/` contains the actual app icon and supplied screenshot.

Content stays visible when JavaScript is disabled. Animations respect reduced motion. The download CTA leads to GitHub releases; it does not assume a published binary exists. Scripting and marketplace support are described as roadmap work.
