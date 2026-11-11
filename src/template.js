// The form and its file. This module says which fields and questions the form has, and turns a
// filled form into hpc-template.json and into a Markdown document. It touches no page and makes
// no request, so the tests run it directly.
//
// hpc-template.json is this form's own format, described by schema/hpc-template.schema.json. It
// is not a plan in the RDA DMP Common Standard.

export const FORMAT = 'hpc-template';
export const VERSION = '0.1.0';

/** Recorded in every new form. */
export const INSTITUTION = Object.freeze({
  name: 'IT:U Interdisciplinary Transformation University Austria',
  ror: 'https://ror.org/03jzk4720',
});

const YES_NO = Object.freeze(['yes', 'no', 'unknown']);
const SIZE_UNITS = Object.freeze(['GB', 'TB', 'PB']);

/**
 * The fields of the project box, in the order shown. `path` is where the value sits in the
 * file. Types: text, email, orcid, date, and enum (a value from `options`).
 */
export const PROJECT_FIELDS = Object.freeze([
  { key: 'project_title', path: 'project.title', type: 'text', wide: true, required: true },
  { key: 'contact_name', path: 'contact.name', type: 'text', required: true },
  { key: 'contact_mbox', path: 'contact.mbox', type: 'email', required: true },
  { key: 'contact_orcid', path: 'contact.orcid', type: 'orcid' },
  { key: 'ethical_issues', path: 'project.ethical_issues', type: 'enum', options: YES_NO },
  { key: 'start', path: 'project.start', type: 'date' },
  { key: 'end', path: 'project.end', type: 'date' },
  { key: 'steward_after_end', path: 'project.data_steward_after_end', type: 'text', wide: true },
  { key: 'funder_name', path: 'project.funder_name', type: 'text', wide: true },
].map((f) => Object.freeze(f)));

/**
 * The fields of one dataset, in the order shown; `key` is also the property in the file.
 * Types as above, plus textarea, doi, url, licence (a URL, with a list to pick from), list (an
 * array of strings, typed comma-separated), number (zero or more) and integer (a whole number).
 * A number may name the field that holds its `unit`, and that field names it back in `unitOf`.
 * Fields with `optional: true` are about publication; the page shows them folded.
 */
export const DATASET_FIELDS = Object.freeze([
  { key: 'title', type: 'text', wide: true, required: true },
  { key: 'type', type: 'text' },
  { key: 'origin', type: 'enum', options: Object.freeze(['', 'new', 'existing', 'both']) },
  { key: 'description', type: 'textarea' },
  { key: 'file_count', type: 'integer', wide: true },
  { key: 'typical_file_size', type: 'number', unit: 'typical_file_size_unit' },
  { key: 'typical_file_size_unit', type: 'enum', options: Object.freeze(['KB', 'MB', 'GB', 'TB']), unitOf: 'typical_file_size' },
  { key: 'size', type: 'number', unit: 'size_unit' },
  { key: 'size_unit', type: 'enum', options: SIZE_UNITS, unitOf: 'size' },
  { key: 'growth', type: 'enum', options: Object.freeze(['', 'fixed', 'growing']), wide: true },
  { key: 'growth_per_year', type: 'number', unit: 'growth_per_year_unit' },
  { key: 'growth_per_year_unit', type: 'enum', options: SIZE_UNITS, unitOf: 'growth_per_year' },
  { key: 'storage_interface', type: 'enum', options: Object.freeze(['', 's3', 'smb', 'nfs', 'parallel_fs', 'block', 'other']), wide: true },
  { key: 'personal_data', type: 'enum', options: YES_NO },
  { key: 'sensitive_data', type: 'enum', options: YES_NO },
  { key: 'data_access', type: 'enum', options: Object.freeze(['open', 'shared', 'closed']) },
  { key: 'formats', type: 'list' },
  { key: 'doi', type: 'doi', optional: true },
  { key: 'issued', type: 'date', optional: true },
  { key: 'repository', type: 'text', optional: true },
  { key: 'repository_url', type: 'url', optional: true },
  { key: 'licence_url', type: 'licence', optional: true },
].map((f) => Object.freeze(f)));

/**
 * The five questions. `guide` is the number of guidance lines the catalogue holds for the
 * question (`q.<id>.guide`), all of them Science Europe's; 0 means the form shows none.
 * `hint: true` means the catalogue holds examples for the question (`q.<id>.hint`).
 */
export const QUESTIONS = Object.freeze([
  { id: 'kinds', guide: 1, hint: true },
  { id: 'formats', guide: 3 },
  { id: 'retention', guide: 0 },
  { id: 'access', guide: 0 },
  { id: 'tools', guide: 2 },
].map((q) => Object.freeze(q)));

export const QUESTION_IDS = Object.freeze(QUESTIONS.map((q) => q.id));

/** Licences offered in the form, by URL. Any other URL can be typed. */
export const LICENCES = Object.freeze([
  { spdx: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  { spdx: 'CC0-1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { spdx: 'CC-BY-SA-4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { spdx: 'CC-BY-NC-4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { spdx: 'CC-BY-NC-SA-4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  { spdx: 'CC-BY-ND-4.0', url: 'https://creativecommons.org/licenses/by-nd/4.0/' },
  { spdx: 'CC-BY-NC-ND-4.0', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' },
  { spdx: 'ODbL-1.0', url: 'https://opendatacommons.org/licenses/odbl/1-0/' },
  { spdx: 'ODC-By-1.0', url: 'https://opendatacommons.org/licenses/by/1-0/' },
  { spdx: 'PDDL-1.0', url: 'https://opendatacommons.org/licenses/pddl/1-0/' },
].map((l) => Object.freeze(l)));

/** A licence URL reduced to what identifies it: no scheme, no trailing slash, lower case. */
export const licenceKey = (url) => String(url ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

// ── a form ───────────────────────────────────────────────────────────────────

export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) {
    if (o[k] == null || typeof o[k] !== 'object') o[k] = {};
    o = o[k];
  }
  o[keys.at(-1)] = value;
}

const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

export function createDataset() {
  return {
    title: '', type: 'dataset', origin: '', description: '', file_count: '', typical_file_size: '', typical_file_size_unit: 'MB',
    size: '', size_unit: 'TB', growth: '', growth_per_year: '', growth_per_year_unit: 'TB', storage_interface: '',
    personal_data: 'unknown', sensitive_data: 'unknown', data_access: 'open', formats: [],
    doi: '', issued: '', repository: '', repository_url: '', licence_url: '',
  };
}

/** A new, empty form with one dataset. */
export function createForm() {
  const at = now();
  return {
    format: FORMAT,
    version: VERSION,
    created: at,
    modified: at,
    institution: { ...INSTITUTION },
    project: { title: '', ethical_issues: 'unknown', start: '', end: '', data_steward_after_end: '', funder_name: '' },
    contact: { name: '', mbox: '', orcid: '' },
    datasets: [createDataset()],
    answers: Object.fromEntries(QUESTION_IDS.map((id) => [id, ''])),
  };
}

/** The form with its modification time set to now. */
export function stamp(form) {
  form.modified = now();
  return form;
}

// ── identifiers ──────────────────────────────────────────────────────────────

/** The sixteen characters of an ORCID iD, without hyphens, or null when the text holds none. */
function orcidDigits(text) {
  const m = /^(?:https?:\/\/orcid\.org\/)?(\d{4})-?(\d{4})-?(\d{4})-?(\d{3}[\dX])$/i.exec(String(text ?? '').trim());
  return m ? (m[1] + m[2] + m[3] + m[4]).toUpperCase() : null;
}

/** Whether the text is an ORCID iD whose check character is right (ISO 7064 MOD 11-2). */
export function orcidOk(text) {
  const d = orcidDigits(text);
  if (!d) return false;
  let total = 0;
  for (const c of d.slice(0, 15)) total = (total + Number(c)) * 2;
  const check = (12 - (total % 11)) % 11;
  return (check === 10 ? 'X' : String(check)) === d[15];
}

/** An ORCID iD as its URL; a text that holds no iD comes back trimmed and otherwise unchanged. */
export function normaliseOrcid(text) {
  const d = orcidDigits(text);
  return d ? `https://orcid.org/${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 12)}-${d.slice(12)}` : String(text ?? '').trim();
}

/** A DOI without its resolver address, in lower case. */
export const normaliseDoi = (text) => String(text ?? '').trim().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/i, '').toLowerCase();

const RX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  doi: /^10\.\d{4,9}\/\S+$/,
  url: /^https?:\/\/[^\s/$.?#][^\s]*$/i,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

function realDate(s) {
  if (!RX.date.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const filled = (v) => (Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '');

function formatProblem(type, value) {
  if (!filled(value)) return null;
  const v = String(value).trim();
  if (type === 'email') return RX.email.test(v) ? null : 'val.email';
  if (type === 'orcid') return orcidOk(v) ? null : 'val.orcid';
  if (type === 'doi') return RX.doi.test(normaliseDoi(v)) ? null : 'val.doi';
  if (type === 'url' || type === 'licence') return RX.url.test(v) ? null : 'val.url';
  if (type === 'date') return realDate(v) ? null : 'val.date';
  if (type === 'integer') return /^\d+$/.test(v) ? null : 'val.integer';
  if (type === 'number') return /^\d+(\.\d+)?$/.test(v) ? null : 'val.number';
  return null;
}

/**
 * What is wrong with a form, or still missing from it. Each entry is
 * `{ severity, code, field, dataset? }`: `error` for a value that cannot be right (an e-mail
 * without @, an end before the start), `open` for a required field left empty. `field` is the
 * key of a project or dataset field, and `dataset` the position of the dataset, from 0.
 * Unanswered questions are not listed here; `completeness` counts them.
 */
export function validateForm(form) {
  const out = [];
  for (const f of PROJECT_FIELDS) {
    const value = getPath(form, f.path);
    if (f.required && !filled(value)) out.push({ severity: 'open', code: 'val.missing', field: f.key });
    const code = formatProblem(f.type, value);
    if (code) out.push({ severity: 'error', code, field: f.key });
  }
  const { start, end } = form.project ?? {};
  if (realDate(start) && realDate(end) && end < start) out.push({ severity: 'error', code: 'val.endBeforeStart', field: 'end' });
  const datasets = Array.isArray(form.datasets) ? form.datasets : [];
  if (datasets.length === 0) out.push({ severity: 'open', code: 'val.noDatasets', field: 'datasets' });
  datasets.forEach((ds, i) => {
    for (const f of DATASET_FIELDS) {
      if (f.required && !filled(ds[f.key])) out.push({ severity: 'open', code: 'val.missing', field: f.key, dataset: i });
      const code = formatProblem(f.type, ds[f.key]);
      if (code) out.push({ severity: 'error', code, field: f.key, dataset: i });
    }
  });
  return out;
}

/** How many of the five questions have an answer, and which do not. */
export function completeness(form) {
  const missing = QUESTION_IDS.filter((id) => !filled(form.answers?.[id]));
  return { total: QUESTION_IDS.length, answered: QUESTION_IDS.length - missing.length, missing, complete: missing.length === 0 };
}

// ── the file ─────────────────────────────────────────────────────────────────

const text = (v) => String(v ?? '').trim();

/** One dataset value as the file carries it; an empty string means the file leaves it out. */
function fileValue(ds, f) {
  if (f.type === 'list') return (ds[f.key] ?? []).map(text).filter(Boolean);
  if (f.type === 'number' || f.type === 'integer') return formatProblem(f.type, ds[f.key]) || !filled(ds[f.key]) ? '' : Number(text(ds[f.key]));
  if (f.unitOf) return fileValue(ds, DATASET_FIELDS.find((x) => x.key === f.unitOf)) === '' ? '' : ds[f.key];
  return text(ds[f.key]);
}

/**
 * The form as it is written to hpc-template.json: text trimmed, empty values left out, the
 * ORCID iD as its URL, a DOI in lower case without the resolver address, and a number as a
 * number, with its unit only when the number is there. A number that is not one is left out.
 * Answers are all kept, an unanswered one as an empty string, so the file shows which questions
 * the form has.
 */
export function toFile(form) {
  const prune = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => filled(v)));
  const p = form.project ?? {};
  const c = form.contact ?? {};
  return {
    format: FORMAT,
    version: VERSION,
    created: form.created,
    modified: form.modified,
    institution: { ...(form.institution ?? INSTITUTION) },
    project: prune({
      title: text(p.title), ethical_issues: p.ethical_issues, start: text(p.start), end: text(p.end),
      data_steward_after_end: text(p.data_steward_after_end), funder_name: text(p.funder_name),
    }),
    contact: prune({ name: text(c.name), mbox: text(c.mbox), orcid: normaliseOrcid(c.orcid) }),
    datasets: (form.datasets ?? []).map((ds) => prune({
      ...Object.fromEntries(DATASET_FIELDS.map((f) => [f.key, fileValue(ds, f)])),
      doi: normaliseDoi(ds.doi),
    })),
    answers: Object.fromEntries(QUESTION_IDS.map((id) => [id, text(form.answers?.[id])])),
  };
}

export const toJson = (form) => `${JSON.stringify(toFile(form), null, 2)}\n`;

/**
 * Read the text of an hpc-template.json. Returns `{ form }`, ready to edit, or `{ error }` with
 * the key of a message. A text field the file leaves out comes back empty, and a choice it leaves
 * out as in a new form; what this form does not know (another property, another question) is
 * dropped.
 */
export function parseForm(source) {
  let data;
  try { data = JSON.parse(source); } catch { return { error: 'parse.notJson' }; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'parse.notObject' };
  if (data.format !== FORMAT) return { error: 'parse.otherFormat' };
  const form = createForm();
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
  form.created = str(data.created, form.created);
  form.modified = str(data.modified, form.modified);
  if (data.institution && typeof data.institution === 'object')
    form.institution = { name: str(data.institution.name), ror: str(data.institution.ror) };
  for (const f of PROJECT_FIELDS) {
    const v = getPath(data, f.path);
    if (f.type === 'enum') { if (f.options.includes(v)) setPath(form, f.path, v); } else setPath(form, f.path, str(v));
  }
  form.datasets = (Array.isArray(data.datasets) ? data.datasets : []).filter((d) => d && typeof d === 'object').map((d) => {
    const ds = createDataset();
    for (const f of DATASET_FIELDS) {
      if (f.type === 'list') ds[f.key] = Array.isArray(d[f.key]) ? d[f.key].filter((x) => typeof x === 'string') : [];
      else if (f.type === 'enum') { if (f.options.includes(d[f.key])) ds[f.key] = d[f.key]; }
      else if (f.type === 'number' || f.type === 'integer') ds[f.key] = typeof d[f.key] === 'number' ? String(d[f.key]) : '';
      else ds[f.key] = str(d[f.key]);
    }
    return ds;
  });
  for (const id of QUESTION_IDS) form.answers[id] = str(data.answers?.[id]);
  return { form };
}

// ── the document ─────────────────────────────────────────────────────────────

const OWN_OPTIONS = ['origin', 'data_access', 'growth', 'storage_interface'];

/** The catalogue key of an enum value: four dataset fields have their own, the rest share yes, no and unknown. */
export const optionKey = (fieldKey, value) =>
  (value === '' ? 'opt.unset' : OWN_OPTIONS.includes(fieldKey) ? `opt.${fieldKey}.${value}` : `opt.${value}`);

/** The label of an enum value. A unit is its own label and has no entry in the catalogue. */
export const optionLabel = (fd, value, t) => (fd.unitOf ? value : t(optionKey(fd.key, value)));

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

/** The form as a Markdown document. `t` gives the text for a key of the catalogue. */
export function toMarkdown(form, t) {
  const file = toFile(form);
  const lines = [`# ${t('md.title')}${file.project.title ? `: ${file.project.title}` : ''}`, ''];
  const row = (label, value) => { if (filled(value)) lines.push(`| ${cell(label)} | ${cell(value)} |`); };

  lines.push(`## ${t('project.title')}`, '', `| ${t('md.field')} | ${t('md.value')} |`, '|---|---|');
  for (const f of PROJECT_FIELDS) {
    const v = getPath(file, f.path);
    row(t(`field.${f.key}`), f.type === 'enum' && v ? optionLabel(f, v, t) : v);
  }
  row(t('md.institution'), `${file.institution.name} (${file.institution.ror})`);
  row(t('md.modified'), file.modified);
  lines.push('');

  lines.push(`## ${t('datasets.title')}`, '');
  if (file.datasets.length === 0) lines.push(t('md.noDatasets'), '');
  file.datasets.forEach((ds, i) => {
    lines.push(`### ${ds.title || t('ds.untitled', { n: i + 1 })}`, '', `| ${t('md.field')} | ${t('md.value')} |`, '|---|---|');
    for (const f of DATASET_FIELDS) {
      if (f.key === 'title' || f.unitOf) continue;
      const v = ds[f.key];
      const unit = f.unit && v !== undefined ? ` ${ds[f.unit]}` : '';
      row(t(`ds.${f.key}`), f.type === 'enum' && v ? optionLabel(f, v, t) : f.type === 'list' ? (v ?? []).join(', ') : v === undefined ? '' : `${v}${unit}`);
    }
    lines.push('');
  });

  lines.push(`## ${t('questions.title')}`, '');
  QUESTION_IDS.forEach((id, i) => {
    lines.push(`### ${i + 1}. ${t(`q.${id}`)}`, '', file.answers[id] || t('md.unanswered'), '');
  });
  lines.push('---', '', t('md.footer'), '');
  return lines.join('\n');
}
