# Changelog

## Unreleased

- The README, `CITATION.cff` and `NEXT.md` name the published page.

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
