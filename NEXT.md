# Next

State on 2026-11-11: version 0.2.3, a draft. The repository is
<https://github.com/rijdho/dmp-hpc-template>; the page is published at
<https://rijdho.github.io/dmp-hpc-template/> (GitHub Pages, branch `main`, root) since 2026-11-11.

## What exists

- The page (`index.html`): the project box, the datasets with their fields on files, size, growth
  and storage, the three questions and two downloads (`hpc-template.md`, `hpc-template.json`).
- `schema/hpc-template.schema.json`, the description of the file.
- Nineteen tests in `tests/page.test.mjs`, all passing on 2026-11-11.
- Tried in a browser on 2026-11-11 from a local server: the fields with their units, the folded
  publication fields, the two downloads, opening the downloaded file again, Start over and
  removing a dataset with two clicks worked, and the policy blocked a request to another host,
  an external stylesheet, an external image and an inline script.
- Looked at on the published page on 2026-11-11 in the dark theme (1280 px wide: the project box,
  a dataset with its folded fields open, the questions) and in a window 390 px wide (dark and
  light: the form, a dataset, About): nothing wider than the window, text inside its boxes.
- Tried on the published page on 2026-11-11: the fields, the two downloads and opening the
  downloaded file again worked, and the policy blocked a request to another host, an external
  stylesheet and an inline script.

## Decided on 2026-11-11

- The fields of the project box, the removal of thirteen of Science Europe's fifteen questions
  and the three added ones follow the list Ricardo gave that day.
- Question 1b of the data management plan page is divided (kinds, formats, volume). The first
  two were questions until later that day (see below); the volume and the growth are fields of
  each dataset.
- From the questions on storage received that day, the form takes the examples of kinds of data, the
  number and typical size of files, the estimated size, the growth per year and the storage
  format, each asked per dataset. Direct access with its monthly traffic and the network speed
  are left out, as Ricardo decided.
- The dataset fields on publication stay, folded as optional.
- The file is `hpc-template.json`, separate from the data management plan and from `dmp.json`.
- The form is described as one for projects that use high-performance computing at IT:U.
- The repository is public on `rijdho`, with the page on GitHub Pages, as for the data management
  plan page.
- From the comments received later that day: the introduction asks for both downloads to be sent
  to christoph.arthofer@it-u.at; the type of a dataset is the type of data, with examples; a new
  dataset gives sizes in GB and says No to personal data; the storage format says not all formats
  are supported yet; the examples under formats include an image and a video type.
- Questions 1 and 2 (kinds and formats of data) are removed, as Ricardo decided that day, because
  the dataset fields on type and formats ask the same; three questions remain. The examples that
  stood under question 1 are now under the type of data. Question 3 asks whether proprietary software or tools are needed, in place of Science Europe's
  question on methods and tools; of its guidance only the line on tools stays. The units are named in full in the form ("GB (gigabytes)"), and kept short in the file and the
  document. The catalogue is loaded as `en.js?v=26`.

## Open decisions

- `src/i18n/index.js` was copied from the data management plan page and differs from it since
  2026-11-11 in one line, the address of the catalogue (`en.js?v=26`). A change to the texts
  reaches a browser that cached them only if that address changes; the same holds for
  `template.js` and `app.js`.
- Whether IT:U guidance (storage on the cluster, retention periods) is added under the
  questions. None is there now: questions 3 and 4 show no guidance.
- Review of the questions by DART and by those responsible for high-performance
  computing at IT:U.
