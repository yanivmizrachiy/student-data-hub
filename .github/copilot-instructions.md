# Copilot Instructions for student-data-hub

## Architecture Overview
- **Static web app** for student management, RTL Hebrew-first, with a single entry (`index.html`) and per-grade pages (`pages/grade7.html`, etc.).
- **Frontend**: Pure HTML/CSS/JS, no framework. Main logic in `assets/app.js` (data loading, UI updates).
- **Data**: Student data in `data/students.json` (array under `"תלמידים"`).
- **Admin/processing**: Node.js scripts in `scripts/` for ingesting grades, syncing placements, and transforming Excel/CSV/YAML to JSON/CSV for the frontend.
- **No backend server**: All data is static, updated by scripts and then served statically.

## Key Workflows
- **Local preview**: Use VS Code Live Preview or any static server (`python -m http.server`).
- **Data update**: Place new source files (Excel, CSV, YAML) in `inbox/` or `data/` and run the relevant script from `scripts/` (see script headers for usage).
- **Script conventions**:
  - Scripts expect specific file names (e.g., `שכבת ח.xlsx`, config YAMLs in `data/config/`).
  - Outputs are written to `data/`, `data-samples/`, or `inbox/grades/`.
  - Scripts exit with code 2 and write a Markdown report if there are ingest/match issues.
- **Data normalization**: All scripts use `norm()` from `scripts/util-xlsx.mjs` to standardize names/fields.

## Project Conventions
- **Hebrew-first**: All UI, data, and most code comments are in Hebrew. Data keys are in Hebrew.
- **Layered structure**: Each grade (ז, ח, ט) has its own data/config, and scripts are grade-specific.
- **Error handling**: Frontend logs info-level errors, never throws. Scripts write review files for manual fix.
- **No test suite**: Validation is manual via script output and UI preview.

## Integration Points
- **Excel/CSV/YAML**: Scripts use `xlsx` and `js-yaml` to ingest and transform data.
- **Static data**: All data is loaded via fetch (frontend) or fs (Node.js scripts).
- **No authentication**: Admin features are UI-only, not secure.

## Examples
- To ingest new grades for ח: place `שכבת ח.xlsx` and a matching text file in `inbox/grades/`, then run `node scripts/ingest-grades.mjs`.
- To apply placements for ז: update `data/config/grade7-placements.yaml`, then run `node scripts/apply-grade7-placements.mjs`.

## Key Files/Dirs
- `index.html`, `assets/app.js`, `data/students.json`, `scripts/`, `data/config/`, `inbox/`, `data-samples/`

---

For any new automation, follow the grade-specific, Hebrew-keyed, static-data conventions. When in doubt, check script headers and data file formats.