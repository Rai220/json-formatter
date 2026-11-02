# Architecture
- Keep prose cleanup in a separate browser-only formatter with conservative auto-detection and an explicit text mode, so broken JSON retains validation and all text exports share the same result.
- Serve the formatter as a single static browser-only page with relative asset URLs; GitHub Pages must not require server-side route fallback.
- Keep share documents in the URL fragment at the current page path; this preserves repository subpaths without any remote storage.
- Normalize JSON, JSONL and embedded JSON through the shared parser using source tokens; preserve numeric lexemes and report invalid JSONL records instead of silently dropping them.- Repair broken JSON in the shared parser (jsonrepair) and keep every fix as a positioned issue from a char diff against the input; the result stays valid so all outputs render, while the editor and Problems tab show where the errors were.
