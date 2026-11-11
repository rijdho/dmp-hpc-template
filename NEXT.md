# Next

State on 2026-11-11: version 0.1.0, a first draft. The repository is to be
<https://github.com/rijdho/dmp-hpc-template>, public, as for the data management plan page. It is
not published yet.

## What exists

- The page (`index.html`): the project box, the datasets with their fields on files, size, growth
  and storage, the five questions and two downloads (`hpc-template.md`, `hpc-template.json`).
- `schema/hpc-template.schema.json`, the description of the file.
- Eighteen tests in `tests/page.test.mjs`, all passing on 2026-11-11.
- Tried in a browser on 2026-11-11 from a local server: the fields with their units, the folded
  publication fields, the two downloads, opening the downloaded file again, Start over and
  removing a dataset with two clicks worked, and the policy blocked a request to another host,
  an external stylesheet, an external image and an inline script. The dark theme and a narrow
  window were not looked at.

## Decided on 2026-11-11

- The fields of the project box, the removal of thirteen of Science Europe's fifteen questions
  and the three added ones follow the list Ricardo gave that day.
- Question 1b of the data management plan page is divided (kinds, formats, volume). The first
  two are questions; the volume and the growth are fields of each dataset.
- From the questions on storage received that day, the form takes the examples of kinds of data, the
  number and typical size of files, the estimated size, the growth per year and the storage
  format, each asked per dataset. Direct access with its monthly traffic and the network speed
  are left out, as Ricardo decided.
- The dataset fields on publication stay, folded as optional.
- The file is `hpc-template.json`, separate from the data management plan and from `dmp.json`.
- The form is described as one for projects that use high-performance computing at IT:U.
- The repository is public on `rijdho`, with the page on GitHub Pages, as for the data management
  plan page.

## Open decisions

- `src/i18n/index.js` is copied unchanged and imports the catalogue as `en.js?v=21`. Once the
  page is published, a change to the texts reaches a browser that cached them only if that
  address changes, which means changing the copied file.
- Whether IT:U guidance (storage on the cluster, retention periods) is added under the
  questions. None is there now: questions 3 and 4 show no guidance.
- Review of the questions by DART and by those responsible for high-performance
  computing at IT:U.
