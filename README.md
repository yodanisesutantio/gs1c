# GTA: San Andreas 100% Checklist

A Next.js App Router checklist with server-side JSON progress storage.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Progress storage

Checkbox state is saved by `app/api/progress/route.ts` to `data/gta-sa-progress.json`. The app needs write access to this file. This is suitable for local development or a persistent Node.js server. Serverless deployments often use ephemeral/read-only filesystems, so use a database or persistent volume there.

## Structure

- `app/page.tsx`: checklist UI, search, category filter, progress display, auto-save
- `app/globals.css`: responsive styling
- `app/api/progress/route.ts`: GET/PUT JSON progress API
- `data/gta-sa-progress.json`: saved progress
- `lib/checklist.ts`: checklist source data and completion-credit rules

## Accuracy note

Checklist categories and task labels are based on the GTA-SanAndreas.com guide: https://www.gta-sanandreas.com/guides/100percent/. The guide says there are 187 completion objectives. Some category totals and displayed mission lists on public guides can be inconsistent, so validate the story mission objective mapping against the target game edition before treating this as a definitive save-state emulator. Grouped children are tracking-only and award no additional completion credit.
