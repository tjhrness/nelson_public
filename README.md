# Nelson Patterns — IMR Explorer

A single-file browser app for exploring eight Nelson patterns in time-ordered measurements. Choose a CSV, inspect Individuals and Moving Range charts, and download your results. No Python, installation, account, build step or external libraries are needed.

## Start here

**Online:** open the repository's GitHub Pages website and click **Try the example**. The repository owner can add the published website link to this paragraph after enabling Pages.

**On your computer:** download this repository using **Code → Download ZIP**, extract it, and open `index.html` in a modern desktop browser. The example dataset, styles, calculations and charts are all inside that file. It is designed to work offline; keep JavaScript enabled. Do not use GitHub's source-file preview as the application.

The app processes selected files inside the browser. It does not upload your data, use analytics, save history or call external services. If you use GitHub Pages, your browser contacts GitHub to load the app; the app's analysis stays local. Exported reports and CSVs contain your measurements, so share those intentionally.

## Try your own measurements

1. Create a CSV with a header such as `IMR_Field_WaitTime` or `IMR_Field`. Every column beginning with the exact prefix `IMR_Field` is analysed.
2. Put measurements in time order, one row per observation. Use finite numbers without units, thousands separators or blank cells in selected columns. Additional columns such as `Date` and `Notes` are ignored.
3. Save as **CSV UTF-8 (comma-delimited)**. Choose it in the app and click **Analyse my CSV**.
4. Review both charts and the written pattern descriptions. Red triangles mark points involved in at least one pattern. Wide charts scroll horizontally.
5. Download an HTML report, the observations CSV or individual chart PNGs. The HTML report includes its images and can be read offline; it is a report rather than another copy of the app.

At least 3 observations are required; fewer than 20 produces a warning. The browser edition allows files up to 10 MB and charts up to 1,638 rows, to stay within a conservative canvas dimension limit for full-width PNG exports. Browser/device memory can impose lower practical limits on very wide or numerous charts. Split a larger dataset deliberately; limits are recalculated separately for each file.

## Understand the method before interpreting results

This edition preserves the original application's intentional **sample-SD method**, rather than substituting conventional IMR sigma estimates:

- The I chart uses the measurements' arithmetic mean and sample standard deviation, with denominator N−1.
- MR values are absolute differences between adjacent measurements. Their point numbers are 2 through N. The MR chart uses its own mean and sample standard deviation, with denominator N−2.
- Each chart's lines are mean ±1, ±2 and ±3 of its own sample SD. Calculations are unrounded; display values have 3 decimal places.
- All eight Nelson rules run independently on both charts. Applying all rules to overlapping moving ranges differs from conventional SPC practice; adjacent ranges share a measurement. Do not assume conventional false-alarm behavior for this method.
- Negative MR lines remain in calculations and statistics, but are omitted from the drawing.
- Zero I SD or zero MR SD rejects the entire column; other valid columns still appear.

Rules: 1 point beyond 3 SD; 9 on one side of the mean; 6 steadily rising/falling; 14 alternating; 2 of 3 beyond same-side 2 SD; 4 of 5 beyond same-side 1 SD; 15 within 1 SD; 8 outside 1 SD on either side. Rule 8 can be entirely on one side.

Boundary comparisons exclude values within `1e-9 × max(1, abs(line))` of a line. Trend ties use `1e-9 × max(1, abs(previous), abs(current))`. Run rules report maximal runs. Rules 5 and 6 merge overlapping windows that share a point and mark only the qualifying points. A point may be listed under multiple rules but has one red triangle.

Pattern flags are prompts to investigate; they do not identify a cause or establish that an operational process is safe or capable. Describe this as a **Nelson-pattern explorer using sample-SD limits**, rather than a conventional IMR implementation, when sharing it.

## Files to upload to GitHub

Upload the contents of this folder into the root of a new public repository:

| File | Purpose |
| --- | --- |
| `index.html` | The complete application. This is the only runtime file required. |
| `README.md` | User instructions, methodology and publishing steps. |
| `sample_imr.csv` | 40 example observations across nine selected columns. Also embedded in the app. |
| `sample_answer_key.csv` | Independently verified expected observations, including incidental patterns. |
| `test.cjs` | Optional developer regression tests; users do not run these. |
| `VALIDATION.md` | Verification evidence, limitations and manual release checks. |
| `.nojekyll` | Tells GitHub Pages to serve the static files without Jekyll processing. |

Add a `LICENSE` file if you want to specify reuse permissions; the owner has not yet selected a license for this package. Do not upload your private datasets, `.venv`, caches, local artifacts, previous acceptance screenshots or internal prompt/development documents. The Python implementation and `requirements.txt` are unnecessary for this browser edition.

## Publish a one-click link for your readers

1. Create a public GitHub repository and upload the files listed above at its root. Ensure `index.html` is at the top level, rather than inside another folder.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose the branch containing your files (usually **main**) and **/ (root)**, then save.
5. Wait for GitHub to show the deployed website URL. Open it and run the checks in `VALIDATION.md` before sharing it.
6. Put that **website URL** in your LinkedIn post for immediate use, and optionally link the repository separately for the source code.

Official instructions: [Configure a GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Developer checks

With Node.js installed, run `node --test test.cjs` in this folder. No npm packages are needed. Tests execute the actual inline JavaScript from `index.html` and compare the sample CSV export against the independently verified answer key. The browser app itself does not require Node.js.
