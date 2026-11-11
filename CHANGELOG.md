# Changelog

## 0.2.3 (2026-11-11)

- The units in the form are named in full, for example "GB (gigabytes)". The file and the
  document keep the short form (GB).

## 0.2.2 (2026-11-11)

- The guidance under question 3 keeps only its line on the tools needed; the line on how the
  data will be shared is removed.

## 0.2.1 (2026-11-11)

- Question 3 asks whether proprietary software or tools are needed to access and use the data,
  in place of Science Europe's question on methods and software tools. Its guidance stays.

## 0.2.0 (2026-11-11)

- The README, `CITATION.cff` and `NEXT.md` name the published page.
- The introduction says what the answers are for and asks for both downloads to be sent to
  christoph.arthofer@it-u.at.
- The dataset field "Type" is "Type of data", empty in a new dataset, with examples.
- A new dataset gives its estimated size and its growth per year in GB, and says No to personal
  data.
- The preferred storage format adds "(not all formats are supported yet)".
- The examples under formats include an image and a video type.
- The questions on the kinds and the formats of data are removed, since each dataset already
  asks for its type and formats; three questions remain. An `hpc-template.json` written before
  loses its answers to those two questions when it is opened again.

## 0.1.0 (2026-11-11)

First version, a draft for discussion.

- One page: the project with its contact and funder, the datasets and five questions.
- Each dataset asks for the number of files, the typical file size, the estimated size, whether
  the set is fixed or keeps growing and by how much per year, and the preferred storage format.
  The fields on publication (DOI, date, repository, licence) are folded as optional.
- Downloads: the form as a Markdown document and as `hpc-template.json`, a format of its own
  described by `schema/hpc-template.schema.json`. Sizes are numbers with a unit in the file.
- A new form records IT:U, with its ROR ID, as the institution.
- Derived from the IT:U data management plan page (`dart-dmp-template` 0.1.0).
