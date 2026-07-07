# Free Draw

A simple kid-friendly drawing and coloring app for tablets. The first build is a zero-dependency PWA so it runs locally now and can later be wrapped as an Android app for Amazon Fire tablets.

## Features

- Touch-first drawing canvas
- Brush, rainbow brush, eraser, fill, and stamp tools
- Mirror drawing toggle
- Blank page, 280+ original non-IP coloring pages, a curated Animal Friends set, and a Classic Sheets pack from public-domain sources
- Undo, redo, clear, and PNG export
- Local autosave
- Offline app shell through a service worker
- No accounts, ads, analytics, network calls, or in-app purchases

## Commands

```sh
npm run dev
npm run check
npm run build
```

The dev server runs at `http://127.0.0.1:5173` by default. `npm run build` writes the static app to `dist/`.

Classic Sheets source metadata is tracked in [assets/public-domain/sources.json](/home/starhound/free-draw/assets/public-domain/sources.json).

For adding more pages safely, use [docs/content-guidelines.md](/home/starhound/free-draw/docs/content-guidelines.md).

## Amazon Fire

Build the web app with `npm run build`, then package `dist/` with the Android wrapper described in [docs/amazon-fire-deploy.md](/home/starhound/free-draw/docs/amazon-fire-deploy.md).

For the full release flow, including signing, screenshots, privacy details, and Amazon Developer Console steps, use [docs/appstore-release-checklist.md](/home/starhound/free-draw/docs/appstore-release-checklist.md).
