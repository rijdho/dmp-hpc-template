# dmp-hpc-template

A short form about the data of a project that uses high-performance computing at IT:U, as a page
that runs in the browser. It is a draft prepared by DART and has not been adopted as IT:U policy.

It is separate from the IT:U data management plan page (`dart-dmp-template`), from which it is
derived: it asks less, and its file, `hpc-template.json`, is a format of its own and not a plan
in the RDA DMP Common Standard.

Live: <https://rijdho.github.io/dmp-hpc-template/>

Repository: <https://github.com/rijdho/dmp-hpc-template>.

Language: English.

## What the page asks for

- The project: title, contact person (name, e-mail, ORCID iD), whether there are ethical issues,
  start and end, who will take care of the data after the project ends, and the name of the
  funder.
- The datasets, one entry each: title, type, description, whether the project collects new data
  or uses existing data from repositories, the number of files and their typical size, the
  estimated size, whether the set is fixed or keeps growing and by how much per year, the
  preferred storage format (S3, SMB, NFS, a parallel file system, block storage within a VM),
  personal and sensitive data, access and file formats. The fields on publication (DOI, date,
  repository, licence) are optional and shown folded.
- Three questions: how long the data need to be retained, who needs access to them, and whether
  proprietary software or tools are needed to access and use them.

A new form records IT:U, with its ROR ID, as the institution.

## What it gives back

- `hpc-template.md`, the form as a Markdown document.
- `hpc-template.json`, the same content as a file, described by
  `schema/hpc-template.schema.json`. The page opens such a file again to continue it.

The page sends the form nowhere. A draft is kept in the browser's local storage, and the page's
Content-Security-Policy names no host the page may connect to.

## Where the questions come from

The type of data, the formats and the size asked for each dataset take up one question of
Science Europe's Practical Guide to the International Alignment of Research Data Management
(Extended Edition, 2021, <https://doi.org/10.5281/zenodo.4915862>): "What data (for example the
kinds, formats, and volumes) will be collected or produced?". The guidance shown under question 3 is
the guide's, word for word. The three questions and the dataset fields on files,
growth and storage were written for this form.

## How it is built

`src/template.js` holds the fields, the questions, the checks and the two writers; `src/app.js`
is the page; the texts are in `src/i18n/en.js`. `index.html`, `style.css` and `src/app.js` are
adapted from the data management plan page, which is built on
[Actionable DMP](https://doi.org/10.5281/zenodo.23498569). Of that page's modules, the page uses
only `src/i18n/index.js`; the tests use its JSON Schema checker (`tests/lib/jsonschema.js`).

There is no build step. To run it locally:

```sh
python3 -m http.server 8000
```

and open `http://localhost:8000/`. To run the tests (written and run with Node 24):

```sh
node --test tests/*.test.mjs
```

## License

The code is under the MIT License (`LICENSE`); the texts are under CC BY 4.0. `NOTICE` lists
what comes from the data management plan page, from Actionable DMP and from Science Europe, and
under which terms.

## Citation

If you use this template, please cite it: see `CITATION.cff`. Author: Ricardo Hartley Belmar
(DART, IT:U), <https://orcid.org/0000-0001-5058-9309>.
