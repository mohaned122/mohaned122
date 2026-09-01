# Copilot instructions for Mohanned Profile

## Commands

- `npm start` — Angular dev server on `http://localhost:4200`
- `npm run build` — production SSR build
- `npm run serve:ssr:Mohanned_profile` — serve the built SSR output
- `npm test` — run the unit test suite
- Single spec: `npm test -- Mohanned_profile --include src/app/app.spec.ts`

## High-level architecture

- Angular 21 standalone application; no NgModules.
- Bootstraps from `src/main.ts` with `bootstrapApplication(App, appConfig)`.
- `src/app/app.ts` is the root shell: animated route transitions, global loading state, and shared layout components (`Header`, `Footer`, `Chatbot`, `AnimatedBg`).
- Routes are lazy-loaded with `loadComponent` in `src/app/app.routes.ts`; pages live under `src/app/pages/`.
- SSR is enabled through `src/app/app.config.server.ts` and `src/app/app.routes.server.ts`; most routes are prerendered, while dynamic/content-heavy routes and the admin route use server rendering.
- Firebase is used directly through the JS SDK, not `@angular/fire`. Realtime collections are wrapped in RxJS `Observable`s in services such as `ProjectService` and `ContactService`.
- SEO, metadata, schema, and canonical URLs are centralized in `SeoService`.

## Key conventions

- Use `inject()` for service dependencies; avoid constructor-based DI in services.
- Guard any DOM, `window`, `document`, `localStorage`, or GSAP code with `isPlatformBrowser(...)` when it can run during SSR/prerender.
- Prefer `gsap.set()` + `gsap.to()` over `gsap.from()` for SSR-safe animations.
- i18n is JSON-based (`src/assets/i18n/{en,ar,fr}.json`) through `TranslationService` and `TranslatePipe`; importing the pipe is required in templates that use translations.
- Theme switching is handled by `ThemeService` via `dark`/`light` classes on `<html>` and CSS variables in `src/styles.css`.
- Asset URLs should omit the `assets/` prefix in templates (`logos/...`, `avatar/...`).
- Tailwind v4 is configured via `@import "tailwindcss"` in `src/styles.css`; do not use `@tailwind` directives.
- Keep code TypeScript-strict friendly; this repo uses `noPropertyAccessFromIndexSignature`, so dynamic keys need bracket notation.
- Prettier is configured for `printWidth: 100`, `singleQuote: true`, and Angular HTML formatting.
