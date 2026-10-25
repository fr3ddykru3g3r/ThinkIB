# Study sites

The Archive keeps its original design at https://ibstuff28.vercel.app.
WDC Learn is the separate branded frontend on Firebase Hosting:
https://learn.worlddebatecollective.org (Firebase site: worlddebatecollective-prep).
Do not deploy WDC Learn as a Vercel project.

## Build and verify

```
npm ci
npm test
python3 scripts/validate-amc-deep-dives.py
NEXT_PUBLIC_SITE_BRAND=archive npm run build
python3 scripts/prepare-firebase.py
NEXT_PUBLIC_SITE_BRAND=wdc npm run build --prefix ../firebase-learn-build
python3 scripts/verify-migration.py
```

The Firebase preparation script creates a separate static build and a hosting config
in the parent directory. Deploy that config to project worlddebatecollective-website,
site worlddebatecollective-prep. Do not overwrite the school or main website site.
The PDF.js worker is generated from the installed package by the prebuild step.

Firebase is on Spark. The WDC frontend, paper assets and question images are hosted
there; SAT generation, the subject-library proxy and other public resource APIs
currently use the existing IB site's backend. Known WDC origins are allowed by the
API middleware. Move those services before retiring the original IB backend.
No billing plan, Firebase authentication, database or security rules were changed.

History stays in the browser where it was recorded. Export/import on /history moves
saved sessions between origins; old score-only summaries cannot recover answers
that were never stored.

DNS: retain one CNAME for prep -> worlddebatecollective-prep.web.app. The conflicting
prep -> wdc-prep.pages.dev record was removed. Firebase must finish domain verification
and certificate provisioning before the custom URL can be used safely.

## Vercel storage

Large public assets under `public/vault`, `public/sat/q` and `public/local-vault`
are excluded from Vercel uploads. The IB app redirects their public URLs to the
existing Firebase Hosting copies. Firebase allows public cross-origin PDF reads.
Topical packs keep their existing API/GitHub-release path; they are not redirected
to directories absent from Firebase. Keep at least the current production release
and one verified rollback when pruning obsolete deployment outputs.

## User resource import — 25 October 2026

The 332 May 2026 PDFs, one listening MP3, and three English guides are served from `/vault/imported/` on Firebase. Vercel excludes this directory. Catalogs live in `lib/imported-paper-map.json`, `data/imported-papers-2026.json` and `data/english-guides.json`. Original media copies and SHA-256 receipts are in the sibling `resource-imports/2026-10-25/` directory on T7. Exported HTML/CSS/JS/font bundles were excluded.
