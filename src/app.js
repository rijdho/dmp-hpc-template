// The page: it moves values between the fields and the form held in memory. Which fields and
// questions there are, and how the two files are written, is decided in template.js. The page
// makes no network request.

import {
  DATASET_FIELDS, LICENCES, PROJECT_FIELDS, QUESTIONS, completeness, createDataset, createForm, getPath, licenceKey,
  optionLabel, parseForm, setPath, stamp, toJson, toMarkdown, validateForm,
} from './template.js?v=6';
import { LANGS, getLang, resolveLang, setLang, t } from './i18n/index.js?v=26';

const $ = (id) => document.getElementById(id);
const KEY = { draft: 'dmp-hpc-template:draft', theme: 'dmp-hpc-template:theme' };

const VIEWS = ['form', 'about'];
const VIEW_TITLE = { form: 'nav.form', about: 'about.title' };

let view = 'form';
let form = loadDraft() ?? createForm();
let confirmNew = false;
let confirmRemove = null;

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ── storage: a convenience of this browser, never needed for the page to work ──

function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY.draft);
    return raw ? parseForm(raw).form ?? null : null;
  } catch {
    return null;
  }
}

let saveTimer = null;
function saveDraft() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY.draft, JSON.stringify(form)); } catch { /* storage unavailable */ }
  }, 300);
}

// ── views, language and theme ────────────────────────────────────────────────

function showView(next) {
  view = VIEWS.includes(next) ? next : 'form';
  for (const node of document.querySelectorAll('.view')) node.hidden = node.dataset.view !== view;
  for (const b of document.querySelectorAll('.nav-item')) b.setAttribute('aria-pressed', String(b.dataset.view === view));
  $('cmd-title').textContent = t(VIEW_TITLE[view]);
}

function applyI18n() {
  document.documentElement.lang = getLang();
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll('[data-i18n-html]')) node.innerHTML = t(node.dataset.i18nHtml);
  for (const node of document.querySelectorAll('[data-i18n-attr]'))
    for (const pair of node.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      if (attr && key) node.setAttribute(attr.trim(), t(key.trim()));
    }
  $('cmd-title').textContent = t(VIEW_TITLE[view]);
  renderAll();
}

function initLang() {
  // One language needs no switch; the place for it stays in the top-right corner.
  $('lang').hidden = LANGS.length < 2;
  setLang(resolveLang(null, navigator.languages ?? [navigator.language]));
}

function initTheme() {
  $('theme').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY.theme, next); } catch { /* storage unavailable */ }
  });
}

// ── fields ───────────────────────────────────────────────────────────────────

const placeholder = (key) => (t(key) !== key ? ` placeholder="${escapeHtml(t(key))}"` : '');

const options = (fd, current) => fd.options
  .map((v) => `<option value="${v}" ${current === v ? 'selected' : ''}>${escapeHtml(optionLabel(fd, v, t))}</option>`).join('');

/** One labelled control. `label` is a catalogue key, `attrs` what ties the control to its value. */
function control(fd, label, value, attrs) {
  const wide = fd.wide || fd.type === 'textarea' ? ' span2' : '';
  const span = `<span>${escapeHtml(t(label))}</span>`;
  if (fd.type === 'enum')
    return `<label class="field${wide}">${span}<select class="input" ${attrs}>${options(fd, value)}</select></label>`;
  if (fd.type === 'textarea')
    return `<label class="field${wide}">${span}<textarea class="input" rows="2" ${attrs}>${escapeHtml(value)}</textarea></label>`;
  const type = { date: 'date', url: 'url', licence: 'url', email: 'email', number: 'number', integer: 'number' }[fd.type] ?? 'text';
  const range = fd.type === 'number' ? ' min="0" step="any"' : fd.type === 'integer' ? ' min="0" step="1"' : '';
  const shown = fd.type === 'list' ? (value ?? []).join(', ') : value;
  return `<label class="field${wide}">${span}
    <input class="input" type="${type}"${range} ${attrs} value="${escapeHtml(shown)}" autocomplete="off" spellcheck="false"${placeholder(`${label}.ph`)} /></label>`;
}

function changed() {
  stamp(form);
  saveDraft();
  renderValidity();
}

// ── the project ──────────────────────────────────────────────────────────────

function renderProject() {
  $('project').innerHTML = PROJECT_FIELDS
    .map((fd) => control(fd, `field.${fd.key}`, getPath(form, fd.path) ?? '', `id="p-${fd.key}" data-path="${fd.path}"`)).join('');
}

function onProjectInput(e) {
  const node = e.target.closest('[data-path]');
  if (!node) return;
  setPath(form, node.dataset.path, node.value);
  changed();
}

// ── datasets ─────────────────────────────────────────────────────────────────

function dsControl(i, ds, fd) {
  const id = `ds-${i}-${fd.key}`;
  const attrs = `id="${id}" data-ds="${i}" data-key="${fd.key}"`;
  if (fd.type !== 'licence') return control(fd, `ds.${fd.key}`, ds[fd.key], attrs);
  // A licence is a list to pick from and, next to it, the URL the choice stands for.
  const value = ds[fd.key];
  const known = LICENCES.find((l) => licenceKey(l.url) === licenceKey(value));
  const opts = [`<option value="">${escapeHtml(t('opt.unset'))}</option>`,
    ...LICENCES.map((l) => `<option value="${escapeHtml(l.url)}" ${known === l ? 'selected' : ''}>${escapeHtml(l.spdx)}</option>`),
    `<option value="other" ${value && !known ? 'selected' : ''}>${escapeHtml(t('opt.licence.other'))}</option>`];
  return `<label class="field"><span>${escapeHtml(t('ds.licence'))}</span><select class="input" id="${id}-pick" data-ds="${i}" data-licence-pick>${opts.join('')}</select></label>
    ${control(fd, 'ds.licence_url', value, attrs)}`;
}

function datasetCard(ds, i) {
  return `<article class="req dataset" id="ds-${i}">
    <header class="ds-h">
      <p class="eyebrow">${escapeHtml(t('ds.untitled', { n: i + 1 }))}</p>
      <button class="btn small danger-quiet" type="button" data-remove="${i}">${escapeHtml(t('datasets.remove'))}</button>
    </header>
    <div class="grid2">${DATASET_FIELDS.filter((fd) => !fd.optional).map((fd) => dsControl(i, ds, fd)).join('')}</div>
    <details class="commit"><summary>${escapeHtml(t('datasets.optional'))}</summary>
      <div class="grid2">${DATASET_FIELDS.filter((fd) => fd.optional).map((fd) => dsControl(i, ds, fd)).join('')}</div>
    </details>
  </article>`;
}

function renderDatasets() {
  confirmRemove = null;
  $('datasets').innerHTML = form.datasets.map(datasetCard).join('');
  $('ds-count').textContent = t('datasets.count', { n: form.datasets.length });
}

function onDatasetInput(e) {
  const pick = e.target.closest('[data-licence-pick]');
  if (pick) {
    const i = Number(pick.dataset.ds);
    const urlInput = $(`ds-${i}-licence_url`);
    if (pick.value !== 'other') {
      urlInput.value = pick.value;
      form.datasets[i].licence_url = pick.value;
      changed();
    } else urlInput.focus();
    return;
  }
  const node = e.target.closest('[data-ds][data-key]');
  if (!node) return;
  const i = Number(node.dataset.ds);
  const fd = DATASET_FIELDS.find((f) => f.key === node.dataset.key);
  form.datasets[i][fd.key] = fd.type === 'list' ? node.value.split(',').map((s) => s.trim()).filter(Boolean) : node.value;
  if (fd.type === 'licence') {
    const known = LICENCES.find((l) => licenceKey(l.url) === licenceKey(node.value));
    $(`ds-${i}-licence_url-pick`).value = known ? known.url : node.value.trim() ? 'other' : '';
  }
  changed();
}

function onDatasetClick(e) {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  const i = Number(btn.dataset.remove);
  // Two clicks instead of a dialog, as for Start over.
  if (confirmRemove !== i) {
    confirmRemove = i;
    btn.textContent = t('datasets.remove.confirm');
    setTimeout(() => { if (confirmRemove === i) { confirmRemove = null; btn.textContent = t('datasets.remove'); } }, 4000);
    return;
  }
  form.datasets.splice(i, 1);
  renderDatasets();
  changed();
}

function onAddDataset() {
  form.datasets.push(createDataset());
  renderDatasets();
  changed();
  $(`ds-${form.datasets.length - 1}-title`)?.focus();
}

// ── the three questions ───────────────────────────────────────────────────────

const guideList = (id) =>
  `<ul class="guide">${t(`q.${id}.guide`).split('\n').map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;

function renderQuestions() {
  $('questions').innerHTML = QUESTIONS.map((q, i) => `
    <article class="req" id="q-${q.id}">
      <p class="eyebrow">${i + 1}</p>
      <p class="question">${escapeHtml(t(`q.${q.id}`))}</p>
      ${q.guide ? `<details class="commit"><summary>${escapeHtml(t('form.guide.toggle'))}</summary>${guideList(q.id)}</details>` : ''}
      <label class="field"><span>${escapeHtml(t('form.answer.label'))}</span>
        <textarea class="input" rows="3" data-q="${q.id}"
          placeholder="${escapeHtml(t('form.answer.ph'))}">${escapeHtml(form.answers[q.id] ?? '')}</textarea></label>
    </article>`).join('');
}

function onQuestionInput(e) {
  const node = e.target.closest('[data-q]');
  if (!node) return;
  form.answers[node.dataset.q] = node.value;
  changed();
}

// ── what is wrong or missing ─────────────────────────────────────────────────

/** A problem's field in words: the label the visitor sees next to it. */
function problemLabel(p) {
  if (p.field === 'datasets') return t('datasets.title');
  if (p.dataset === undefined) return t(`field.${p.field}`);
  return `${t('ds.untitled', { n: p.dataset + 1 })}: ${t(`ds.${p.field}`)}`;
}

function renderValidity() {
  const problems = validateForm(form);
  const errors = problems.filter((p) => p.severity === 'error');
  const open = problems.filter((p) => p.severity === 'open');
  const parts = [];
  if (errors.length) parts.push(t('valid.errors', { n: errors.length }));
  if (open.length) parts.push(t('valid.open', { n: open.length }));
  $('validity').textContent = parts.length ? parts.join(' ') : t('valid.ok');
  $('validity').dataset.state = errors.length ? 'error' : open.length ? 'open' : 'ok';
  $('problems').innerHTML = [...errors, ...open]
    .map((p) => `<li class="${p.severity}"><b>${escapeHtml(problemLabel(p))}</b> ${escapeHtml(t(p.code))}</li>`).join('');
  $('problems').hidden = problems.length === 0;
  const c = completeness(form);
  const numbers = c.missing.map((id) => QUESTIONS.findIndex((q) => q.id === id) + 1).join(', ');
  $('q-count').textContent = t('questions.count', { a: c.answered, n: c.total });
  $('completeness').textContent = c.complete
    ? t('complete.ok', { n: c.total })
    : t('complete.missing', { a: c.answered, n: c.total, ids: numbers });
  $('completeness').dataset.state = c.complete ? 'ok' : 'open';
}

// ── files ────────────────────────────────────────────────────────────────────

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderAll() {
  renderProject();
  renderDatasets();
  renderQuestions();
  renderValidity();
}

function loadIntoEditor(next) {
  form = next;
  saveDraft();
  renderAll();
}

async function onImport(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  const parsed = parseForm(await file.text());
  if (parsed.error) {
    $('import-status').textContent = t('form.importFailed', { reason: t(parsed.error) });
    return;
  }
  loadIntoEditor(parsed.form);
  $('import-status').textContent = t('form.imported');
}

function onNew() {
  // Two clicks instead of a dialog: a form that was not downloaded cannot be brought back.
  if (!confirmNew) {
    confirmNew = true;
    $('new-form').textContent = t('form.new.confirm');
    setTimeout(() => { confirmNew = false; $('new-form').textContent = t('form.new'); }, 4000);
    return;
  }
  confirmNew = false;
  $('new-form').textContent = t('form.new');
  loadIntoEditor(createForm());
  $('import-status').textContent = '';
}

// ── start ────────────────────────────────────────────────────────────────────

function init() {
  initLang();
  initTheme();
  document.querySelector('.rail nav').addEventListener('click', (e) => {
    const next = e.target.closest('.nav-item')?.dataset.view;
    if (next) showView(next);
  });
  $('project').addEventListener('input', onProjectInput);
  $('project').addEventListener('change', onProjectInput);
  $('datasets').addEventListener('input', onDatasetInput);
  $('datasets').addEventListener('change', onDatasetInput);
  $('datasets').addEventListener('click', onDatasetClick);
  $('add-dataset').addEventListener('click', onAddDataset);
  $('questions').addEventListener('input', onQuestionInput);
  $('dl-json').addEventListener('click', () => download('hpc-template.json', toJson(form), 'application/json'));
  $('dl-md').addEventListener('click', () => download('hpc-template.md', toMarkdown(form, t), 'text/markdown'));
  $('import-file').addEventListener('change', onImport);
  $('new-form').addEventListener('click', onNew);
  applyI18n();
  showView('form');
}

init();
