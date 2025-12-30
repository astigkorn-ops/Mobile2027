# Mobile2027

A progressive web application built with React and Tailwind CSS focused on disaster preparedness and response. It provides offline-first capabilities, typhoon data dashboards, interactive maps, emergency hotline numbers, geotagged incident reporting, and admin tools.

## Features

- Offline-first PWA with service worker and caching
- Authentication context (client-side)
- Typhoon Dashboard and History pages
- Interactive Map with geolocation hook
- Geotag Camera for location-tagged photos
- Emergency hotline numbers and disaster guidelines
- Report Incident with offline queueing
- Admin setup and dashboard
- Consistent UI built with a component library (shadcn/ui style)
- Toast notifications and offline indicator

## Tech Stack

- React (Create React App with CRACO)
- React Router
- Tailwind CSS + PostCSS
- shadcn/ui style components
- Service Worker (PWA) in /public/service-worker.js
- CRACO configuration (craco.config.js) and custom Webpack plugins under /plugins

## Project Structure

- public/
  - index.html, manifest.json, service-worker.js, assets
- src/
  - components/ (Header, BottomNavBar, OfflineIndicator, etc.)
  - components/ui/ (reusable UI primitives)
  - contexts/ (AuthContext)
  - hooks/ (useGeolocation, use-toast)
  - lib/ (utils, tests)
  - pages/ (feature pages: Home, TyphoonDashboard, InteractiveMap, GeotagCamera, etc.)
  - utils/ (api, cacheManager, offlineQueue, serviceWorkerRegistration)
  - App.js, index.js, styles
- plugins/ (custom dev server and health-check plugins)

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm if preferred)

## Getting Started

1. Install dependencies

   npm install

2. Start the development server

   npm start

   Runs the app in development mode with CRACO. Open http://localhost:3000.

3. Build for production

   npm run build

   Bundles the app into the build/ directory.

4. Preview the production build (optional)

   npx serve -s build

## Available Scripts

- npm start — Start dev server
- npm run build — Create production build
- npm test — Run tests (if present)
- npm run lint — Lint (if configured)

Check package.json scripts for the authoritative list.

## Environment Configuration

Create a .env file in the project root for runtime config. Common variables:

- REACT_APP_API_BASE_URL
- REACT_APP_MAPBOX_TOKEN (if using map services)
- REACT_APP_SENTRY_DSN (optional)

Variables must be prefixed with REACT_APP_ to be exposed to the client.

## PWA and Offline

- Service worker is located at public/service-worker.js and registered via src/utils/serviceWorkerRegistration.js.
- Offline queueing utilities in src/utils/offlineQueue.js and cache handling in src/utils/cacheManager.js.
- The OfflineIndicator component surfaces connectivity state.

## Geolocation and Geotag Camera

- useGeolocation hook (src/hooks/useGeolocation.js) provides current position.
- GeotagCamera page (src/pages/GeotagCamera.jsx) demonstrates capturing photos with location data. See GeoCam.md for additional notes.

## Typhoon Data

- TyphoonDashboard and TyphoonHistory pages provide current and historical information. Any external API endpoints should be configured in src/utils/api.js and via environment variables.

## Custom Dev Plugins

- plugins/health-check: Webpack health endpoints and plugin.
- plugins/visual-edits: Babel metadata and dev server setup helpers.

These are wired through craco.config.js.

## Testing

- Basic utility tests are colocated in src/lib/utils.test.js.
- Run tests with: npm test

## Coding Standards

- JS/JSX with modern ES syntax.
- Tailwind CSS utilities for styling.
- Prefer components in src/components/ui for UI primitives.
- Keep pages under src/pages and feature logic within utils/hooks.

## Deployment

- Build with npm run build and deploy the contents of build/ to a static host.
- Ensure service worker and manifest.json are served at the site root.
- If using a subpath, configure homepage in package.json and adjust asset paths.

## Troubleshooting

- If Tailwind styles are missing, ensure postcss.config.js and tailwind.config.js are intact and index.css imports Tailwind directives.
- If service worker updates are not applied, clear browser caches and unregister old workers from Application > Service Workers.
- If environment variables aren’t available, confirm they start with REACT_APP_ and restart the dev server after changes.

## License

Proprietary or TBD. Update this section as required.
