# Mobile2027

A progressive web application built with React and Tailwind CSS focused on disaster preparedness and response. It provides offline-first capabilities, typhoon data dashboards, interactive maps, emergency hotline numbers, geotagged incident reporting, and admin tools.

## Features

- Offline-first PWA with service worker and caching
- Supabase authentication with cloud sync
- Typhoon Dashboard and History pages
- Interactive Map with geolocation hook
- Geotag Camera for location-tagged photos
- Emergency hotline numbers and disaster guidelines
- Report Incident with cloud storage
- Emergency Plan with cross-device sync
- Admin setup and dashboard
- Consistent UI built with a component library (shadcn/ui style)
- Toast notifications and offline indicator

## Tech Stack

- React (Create React App with CRACO)
- React Router
- Tailwind CSS + PostCSS
- shadcn/ui style components
- Supabase (Backend as a Service - Database, Auth, API)
- Service Worker and PWA capabilities
- CRACO configuration (craco.config.js) and custom Webpack plugins under /plugins

## PWA Functionality

Mobile2027 is a fully-featured Progressive Web App with the following capabilities:

### 1. Installable App
- Install as a standalone app on mobile and desktop
- Custom app icons for different device sizes
- App name and description configured in manifest.json
- PWA installation prompt handling in App.js

### 2. Offline Support
- Service worker with cache-first strategy
- Critical data caching (hotlines, map locations, guidelines)
- Offline incident reporting queue
- Automatic sync when connection is restored

### 3. Push Notifications
- Push notification handling in service worker
- Notification click handling
- Vibration and badge support
- Integration with typhoon alert system

### 4. Enhanced Mobile Experience
- Mobile-optimized UI with responsive design
- Proper viewport configuration
- Touch-friendly interface components
- Full-screen experience when installed

Implemented in:
- `public/manifest.json` - PWA metadata and configuration
- `public/service-worker.js` - Service worker with caching and background sync
- `public/index.html` - Proper PWA meta tags and links
- `src/App.js` - PWA installation prompt handling
- `src/utils/serviceWorkerRegistration.js` - Service worker registration
- `src/utils/notifications.js` - Notification subscription management

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

- REACT_APP_SUPABASE_URL (required for Supabase)
- REACT_APP_SUPABASE_ANON_KEY (required for Supabase)
- REACT_APP_MAPBOX_TOKEN (if using map services)
- REACT_APP_VAPID_PUBLIC_KEY (for push notifications)
- REACT_APP_SENTRY_DSN (optional)

Variables must be prefixed with REACT_APP_ to be exposed to the client.

## Push Notification Functionality

Mobile2027 implements push notifications with the following features:

### 1. Typhoon Alert Notifications
- Real-time alerts when typhoons approach monitored areas
- Customized notifications with typhoon name, signal level, and expected landfall time
- Different icons based on signal level severity
- Direct navigation to typhoon dashboard when notification is clicked

### 2. Signal Warning Level Updates
- Automatic notifications when signal warning levels change
- Different vibration patterns and icons based on warning severity
- Detailed information about the warning and recommended actions
- Integration with typhoon tracking system

### 3. Implementation Details
- Service worker handles all push notification logic
- Client-side subscription management via NotificationManager utility
- Proper permission handling for notifications
- Different notification types with custom styling and behavior

Implemented in:
- `public/service-worker.js` - Push notification handling and display logic
- `src/utils/notifications.js` - Client-side notification subscription management
- `src/components/TyphoonAlertWatcher.jsx` - Background monitoring for alerts
- `src/pages/TyphoonDashboard.jsx` - Sending notifications for important updates

## Supabase Setup

This app has been migrated to use Supabase as the backend. To set up:

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update your `.env` file with:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
5. Enable authentication in Supabase Dashboard > Authentication

The app will automatically use Supabase for authentication and data storage when these environment variables are set.

## Offline Functionality

Mobile2027 implements comprehensive offline support with the following features:

### 1. Caching Critical Data
- Hotlines and emergency contacts
- Map location data
- Disaster guidelines
- Checklists and resources
- Typhoon data

Implemented in:
- `src/utils/cacheManager.js` - Handles pre-caching of critical API endpoints
- `public/service-worker.js` - Service worker with cache-first strategy for critical endpoints

### 2. Offline Incident Reporting Queue
- Reports are stored in IndexedDB when offline
- Works for both online and offline scenarios
- Automatic synchronization when connection is restored

Implemented in:
- `src/utils/offlineQueue.js` - IndexedDB-based queue manager
- `src/pages/ReportIncident.jsx` - Uses offline queue for submissions
- `public/service-worker.js` - Background sync for queued incidents

### 3. Sync When Back Online
- Automatic synchronization when connection is restored
- Background sync using the Background Sync API
- Manual sync available through UI components

Implemented in:
- `src/utils/offlineQueue.js` - Automatic sync on online event
- `public/service-worker.js` - Background sync handler
- `src/components/OfflineIndicator.jsx` - Manual sync option

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
