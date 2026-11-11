// Checks on the form and its page: every text the page asks for exists, a filled form gives a
// file that agrees with the schema and opens again unchanged, wrong values are reported, the
// quoted texts are the ones of the IT:U data management plan page, and the page's policy and
// links stay on its own origin. Run with: node --test tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(root + p, 'utf8');

const { en } = await import('../src/i18n/en.js?v=21');
const { t } = await import('../src/i18n/index.js?v=21');
const T = await import('../src/template.js?v=1');
const { validate } = await import('./lib/jsonschema.js');

const html = read('index.html');
const app = read('src/app.js');
const schema = JSON.parse(read('schema/hpc-template.schema.json'));

function keysUsed() {
  const used = new Set();
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g))
    for (const pair of m[1].split(';')) used.add(pair.split(':')[1].trim());
  for (const src of [app, read('src/template.js')])
    // A field's `path` is a place in the file, not a key of the catalogue.
    for (const m of src.matchAll(/(?<!path: )'((?:form|md|val|valid|complete|parse|about|nav|ui|ds|opt|q|field|foot|meta|dl|project|datasets|questions|brand)\.[A-Za-z0-9_.]*[A-Za-z0-9_])'/g)) used.add(m[1]);
  for (const q of T.QUESTIONS) { used.add(`q.${q.id}`); if (q.guide) used.add(`q.${q.id}.guide`); }
  for (const f of T.PROJECT_FIELDS) {
    used.add(`field.${f.key}`);
    for (const o of f.options ?? []) used.add(T.optionKey(f.key, o));
  }
  for (const f of T.DATASET_FIELDS) {
    used.add(`ds.${f.key}`);
    if (!f.unitOf) for (const o of f.options ?? []) used.add(T.optionKey(f.key, o));
  }
  return used;
}

test('every text the page asks for is in the catalogue, and the catalogue holds no other', () => {
  const used = keysUsed();
  assert.deepEqual([...used].filter((k) => !(k in en)), []);
  const placeholders = (k) => k.endsWith('.ph') && used.has(k.slice(0, -3));
  assert.deepEqual(Object.keys(en).filter((k) => !used.has(k) && !placeholders(k)), []);
});

test('no text carries an em dash', () => {
  const dash = String.fromCharCode(0x2014);
  for (const [k, v] of Object.entries(en)) assert.ok(!v.includes(dash), k);
  for (const f of ['index.html', 'src/app.js', 'src/template.js', 'src/theme-boot.js', 'style.css', 'README.md', 'NOTICE', 'CHANGELOG.md', 'NEXT.md', 'schema/hpc-template.schema.json'])
    assert.ok(!read(f).includes(dash), f);
});

function filledForm() {
  const form = T.createForm();
  Object.assign(form.project, {
    title: 'A test project', ethical_issues: 'no', start: '2027-01-01', end: '2028-12-31',
    data_steward_after_end: 'The research group', funder_name: 'A funder',
  });
  Object.assign(form.contact, { name: 'Test Person', mbox: 'test@example.org', orcid: '0000-0002-1825-0097' });
  Object.assign(form.datasets[0], {
    title: 'Simulation output', type: 'dataset', origin: 'new', description: 'Runs of a model.',
    file_count: '120000', typical_file_size: '2.5', typical_file_size_unit: 'GB', size: '300', size_unit: 'TB',
    growth: 'growing', growth_per_year: '40', growth_per_year_unit: 'TB', storage_interface: 'parallel_fs',
    doi: 'https://doi.org/10.5281/ZENODO.1234567', issued: '2028-06-30', repository: 'Zenodo',
    repository_url: 'https://zenodo.org', licence_url: 'https://creativecommons.org/licenses/by/4.0/', formats: ['text/csv'],
  });
  for (const id of T.QUESTION_IDS) form.answers[id] = `Answer to ${id}.`;
  return form;
}

test('the form has the nine project fields, the twenty-two dataset fields and the three questions', () => {
  assert.deepEqual(T.PROJECT_FIELDS.map((f) => f.key),
    ['project_title', 'contact_name', 'contact_mbox', 'contact_orcid', 'ethical_issues', 'start', 'end', 'steward_after_end', 'funder_name']);
  assert.deepEqual(T.DATASET_FIELDS.filter((f) => !f.optional).map((f) => f.key), [
    'title', 'type', 'origin', 'description', 'file_count', 'typical_file_size', 'typical_file_size_unit', 'size', 'size_unit',
    'growth', 'growth_per_year', 'growth_per_year_unit', 'storage_interface', 'personal_data', 'sensitive_data', 'data_access', 'formats']);
  assert.deepEqual(T.DATASET_FIELDS.filter((f) => f.optional).map((f) => f.key), ['doi', 'issued', 'repository', 'repository_url', 'licence_url']);
  for (const f of T.DATASET_FIELDS.filter((x) => x.unit)) assert.equal(T.DATASET_FIELDS.find((x) => x.key === f.unit).unitOf, f.key);
  assert.deepEqual(T.QUESTION_IDS, ['retention', 'access', 'tools']);
});

test('a new dataset has no type, sizes in GB and no personal data', () => {
  const ds = T.createDataset();
  assert.deepEqual([ds.type, ds.size_unit, ds.growth_per_year_unit, ds.personal_data], ['', 'GB', 'GB', 'no']);
});

test('a new form records IT:U with its ROR ID, and is not yet complete', () => {
  const form = T.createForm();
  assert.equal(form.institution.ror, 'https://ror.org/03jzk4720');
  assert.equal(T.completeness(form).answered, 0);
  const open = T.validateForm(form).filter((p) => p.severity === 'open').map((p) => p.field);
  assert.deepEqual(open, ['project_title', 'contact_name', 'contact_mbox', 'title']);
  assert.deepEqual(T.validateForm(form).filter((p) => p.severity === 'error'), []);
});

test('the file of a filled form and the file of an empty one both agree with the schema', () => {
  assert.deepEqual(validate(schema, T.toFile(filledForm())), []);
  assert.deepEqual(validate(schema, T.toFile(T.createForm())), []);
});

test('the schema names every property the file can carry, and no other', () => {
  const file = T.toFile(filledForm());
  for (const part of ['project', 'contact', 'answers'])
    assert.deepEqual(Object.keys(file[part]).sort(), Object.keys(schema.properties[part].properties).sort(), part);
  assert.deepEqual(Object.keys(file.datasets[0]).sort(), Object.keys(schema.properties.datasets.items.properties).sort());
  assert.deepEqual(Object.keys(file).sort(), Object.keys(schema.properties).sort());
  for (const f of [...T.PROJECT_FIELDS, ...T.DATASET_FIELDS].filter((x) => x.type === 'enum')) {
    const node = f.path ? f.path.split('.').reduce((n, k) => n.properties[k], schema) : schema.properties.datasets.items.properties[f.key];
    assert.deepEqual(node.enum, f.options.filter(Boolean), f.key);
  }
});

test('a filled form has no problem, is complete, and opens again unchanged', () => {
  const form = filledForm();
  assert.deepEqual(T.validateForm(form), []);
  assert.ok(T.completeness(form).complete);
  const json = T.toJson(form);
  const again = T.parseForm(json);
  assert.equal(again.error, undefined);
  assert.equal(T.toJson(again.form), json);
});

test('the file carries the ORCID iD as its URL and the DOI in lower case without the resolver', () => {
  const file = T.toFile(filledForm());
  assert.equal(file.contact.orcid, 'https://orcid.org/0000-0002-1825-0097');
  assert.equal(file.datasets[0].doi, '10.5281/zenodo.1234567');
});

test('the file carries numbers as numbers, and a unit only next to its number', () => {
  const ds = T.toFile(filledForm()).datasets[0];
  assert.deepEqual([ds.file_count, ds.typical_file_size, ds.typical_file_size_unit, ds.size, ds.size_unit, ds.growth_per_year, ds.growth_per_year_unit],
    [120000, 2.5, 'GB', 300, 'TB', 40, 'TB']);
  const empty = T.toFile(T.createForm()).datasets[0];
  for (const k of ['file_count', 'typical_file_size', 'typical_file_size_unit', 'size', 'size_unit', 'growth', 'growth_per_year', 'growth_per_year_unit', 'storage_interface'])
    assert.ok(!(k in empty), k);
  const zero = T.createForm();
  zero.datasets[0].growth_per_year = '0';
  assert.equal(T.toFile(zero).datasets[0].growth_per_year, 0);
});

test('wrong values are reported, each under its field', () => {
  const form = filledForm();
  form.contact.mbox = 'not an address';
  form.contact.orcid = '0000-0002-1825-0098';
  form.project.end = '2026-01-01';
  form.datasets[0].doi = 'zenodo.1234567';
  form.datasets[0].repository_url = 'zenodo.org';
  form.datasets[0].issued = '2028-02-30';
  form.datasets[0].file_count = '1.5';
  form.datasets[0].size = '-3';
  const found = T.validateForm(form).map((p) => `${p.severity} ${p.code} ${p.field}`);
  assert.deepEqual(found, [
    'error val.email contact_mbox', 'error val.orcid contact_orcid', 'error val.endBeforeStart end',
    'error val.integer file_count', 'error val.number size', 'error val.doi doi', 'error val.date issued', 'error val.url repository_url',
  ]);
  const file = T.toFile(form).datasets[0];
  assert.ok(!('file_count' in file) && !('size' in file) && !('size_unit' in file));
});

test('an ORCID iD is accepted with or without its address, and only with the right check character', () => {
  for (const ok of ['0000-0002-1825-0097', 'https://orcid.org/0000-0002-1825-0097', '0000-0002-1694-233X', '0000-0002-1694-233x'])
    assert.ok(T.orcidOk(ok), ok);
  for (const bad of ['0000-0002-1825-0098', '0000-0002-1825', 'orcid'])
    assert.ok(!T.orcidOk(bad), bad);
});

test('a file that is not an hpc-template.json is refused, each kind with its message', () => {
  assert.equal(T.parseForm('{').error, 'parse.notJson');
  assert.equal(T.parseForm('[]').error, 'parse.notObject');
  assert.equal(T.parseForm('{"dmp":{"title":"A plan"}}').error, 'parse.otherFormat');
});

test('the document carries every answer and the twelve filled values it is searched for, and no untranslated key', () => {
  const md = T.toMarkdown(filledForm(), t);
  for (const id of T.QUESTION_IDS) assert.ok(md.includes(`Answer to ${id}.`), id);
  for (const s of ['A test project', 'The research group', 'A funder', 'Simulation output', 'Collecting new data in the project', '10.5281/zenodo.1234567', 'text/csv',
    '| 120000 |', '| 2.5 GB |', '| 300 TB |', '| 40 TB |', 'Parallel file system'])
    assert.ok(md.includes(s), s);
  assert.doesNotMatch(md, /\b(?:md|q|field|opt|val|ds|form|project|datasets|questions)\.[a-z0-9_]+(?:\.[a-z0-9_]+)*\b(?!\.\w)/i);
  assert.match(T.toMarkdown(T.createForm(), t), /Not answered yet\./);
});

test('the quoted question and guidance are those of the IT:U data management plan page', (ctx) => {
  // The other page is a separate repository; the comparison runs where both sit side by side.
  const other = new URL('../../dart-dmp-template/src/i18n/en.js', import.meta.url);
  if (!existsSync(fileURLToPath(other))) return ctx.skip('dart-dmp-template is not next to this folder');
  return import(other.href).then(({ en: dmp }) => {
    assert.equal(en['q.tools'], dmp['q.5c']);
    assert.equal(en['q.tools.guide'], dmp['q.5c.guide']);
    assert.ok(en['about.p2'].includes(dmp['q.1b']));
    for (const q of T.QUESTIONS) assert.equal((en[`q.${q.id}.guide`] ?? '').split('\n').filter(Boolean).length, q.guide, q.id);
  });
});

test('the policy allows only the page itself, and nothing in the page points elsewhere', () => {
  const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)[1].replace(/\s+/g, ' ').trim();
  assert.match(csp, /^default-src 'none';/);
  for (const banned of ['connect-src', 'unsafe-inline', 'unsafe-eval', 'http:', 'https:', '*'])
    assert.ok(!csp.includes(banned), banned);
  for (const m of html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]+)"/g))
    assert.match(m[1], /^(?:\.\/|data:)/, m[1]);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)/, 'an inline script');
  assert.doesNotMatch(html, /\sstyle="/, 'an inline style');
  for (const f of ['src/app.js', 'src/template.js', 'src/theme-boot.js'])
    assert.doesNotMatch(read(f), /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|import\(|document\.cookie/, f);
  assert.doesNotMatch(read('style.css'), /url\(|@import/);
});

test('every module the page imports exists', () => {
  // Today each of the four modules is imported from one place only. The second check is for the
  // day one is imported from two: module identity is by URL, so the same file under two addresses
  // would be loaded twice.
  const seen = new Map();
  for (const f of ['src/app.js', 'src/template.js', 'src/i18n/index.js', 'index.html'])
    for (const m of read(f).matchAll(/(?:from '|<script type="module" src=")(\.[^'"]+)['"]/g)) {
      const file = new URL(m[1], `file:///${f}`).pathname.split('?')[0];
      const spec = m[1].split('?')[1] ?? '';
      if (seen.has(file)) assert.equal(spec, seen.get(file), `${file} imported in ${f}`);
      else seen.set(file, spec);
      assert.ok(existsSync(root + file.slice(1)), file);
    }
  assert.deepEqual([...seen.keys()].sort(), ['/src/app.js', '/src/i18n/en.js', '/src/i18n/index.js', '/src/template.js']);
});

test('every element the script looks up is on the page', () => {
  const ids = new Set([...app.matchAll(/\$\('([a-z0-9-]+)'\)/g)].map((m) => m[1]));
  assert.ok(ids.size > 10);
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), id);
});

test('the version on the page is the version of the form and of the release', () => {
  const page = /<span id="version">([^<]+)<\/span>/.exec(html)[1];
  assert.equal(page, T.VERSION);
  assert.equal(page, /^version: "?([^"\n]+)"?$/m.exec(read('CITATION.cff'))[1]);
  assert.ok(read('CHANGELOG.md').includes(`## ${page}`));
});
