# Browser edition validation

Date: 2026-10-17. This is a separate browser implementation of the previously validated Python application. The original application's acceptance results do not automatically certify this edition's UI.

## Completed

- [x] All runtime code, CSS and the sample dataset are embedded in `index.html`.
- [x] No CDN, external scripts/styles, fetch, XMLHttpRequest or WebSocket dependency in the app.
- [x] Node.js v24.19.0: `node --test test.cjs` — 16 tests passed, 0 failed.
- [x] All 48 sample observations match the independent CSV answer key, including exact descriptions, ordering, values, spans and rule membership represented in that schema.
- [x] Sample produces nine accepted columns and 18 chart data series.
- [x] Rule thresholds and below-threshold negatives, opposite sides, tolerance, maximal runs, trend turning points and overlapping-window membership checked.
- [x] CSV quoting, multiline fields, BOM, duplicate headers, ragged rows, bad numeric cells, minimum count and zero-SD column rejection checked.
- [x] MR numbering and sample-SD arithmetic checked, including a small spread around a large numeric offset. A failing regression exposed loss of precision from scaling before centering; the corrected algorithm passes.
- [x] Original independent sample and answer-key files copied unchanged.

## Browser checks still required before public launch

The local preview server was started successfully, but the available browser automation timed out when connecting to it. Consequently, no successful visual inspection, browser file upload, download or offline execution is claimed for this edition. No GitHub repository or Pages deployment has been created.

- [ ] Open `index.html` in a desktop browser and click **Try the example**. Expect 9 of 9 columns charted, 48 patterns, nine column sections and 18 charts.
- [ ] Confirm point labels, red pattern triangles, black ordinary markers, line labels, horizontal scrolling and readable statistics/descriptions.
- [ ] Download the sample CSV, select it using the file chooser and analyse it. Expect the same result.
- [ ] Download the observations CSV and compare it with `sample_answer_key.csv` (CSV records should match).
- [ ] Download an I PNG and an MR PNG; open them and confirm that they contain complete charts.
- [ ] Download the HTML report and open it offline. Expect all nine sections and 18 embedded images, with text intact and no upload/download controls.
- [ ] Open `index.html` with the network disconnected and run the sample, select a CSV and export results.
- [ ] After a successful analysis, select an invalid CSV and submit it. Confirm old results and downloads disappear and the error is visible.
- [ ] Test a narrow window; verify controls remain usable and chart containers scroll.
- [ ] Repeat the sample/upload/export smoke checks on the published GitHub Pages URL before sharing it on LinkedIn.

Known limits: 10 MB input size; 1,638 rows for full-width canvas exports; practical memory use depends on the number and size of charts. Cross-browser/mobile behavior is not yet certified. Ordinary JavaScript binary floating-point arithmetic is used; near numerical extremes, rescale measurements to practical units.
