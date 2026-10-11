#!/usr/bin/env node
// Copies Obsidian notes marked for publishing into src/content/.
//
// In Obsidian, add a property to a note:   publish: writeups   (or blog, notes, projects)
// Then run:                                 npm run sync
//
// The vault is only read, never modified. Each published note becomes
// src/content/<section>/<slug>/index.md with the images it uses copied next to it.
// Notes that lose their `publish` property are removed from the site on the next sync.

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const VAULT = process.env.OBSIDIAN_VAULT ?? path.join(process.env.HOME, 'Documents/Obsidian Vault');
const CONTENT = path.resolve('src/content');
const SECTIONS = ['writeups', 'blog', 'notes', 'projects'];
const MARKER = 'obsidian'; // front matter key that records where an entry came from
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
const dryRun = process.argv.includes('--dry-run');

if (!fs.existsSync(VAULT)) {
  console.error(`Vault not found at "${VAULT}". Set OBSIDIAN_VAULT to its path.`);
  process.exit(1);
}

// ---------- read the vault ----------

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'Templates') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(VAULT);
const byName = new Map(); // basename (case-insensitive) -> absolute path, for resolving [[links]]
for (const f of files) {
  byName.set(path.basename(f).toLowerCase(), f);
  if (f.endsWith('.md')) byName.set(path.basename(f, '.md').toLowerCase(), f);
}

function splitFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  try {
    return { data: YAML.parse(m[1]) ?? {}, body: text.slice(m[0].length) };
  } catch {
    return { data: {}, body: text }; // unreadable properties: treat as unpublished
  }
}

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

const notes = [];
for (const file of files.filter((f) => f.endsWith('.md'))) {
  const { data, body } = splitFrontMatter(fs.readFileSync(file, 'utf8'));
  const section = String(data.publish ?? '').trim().toLowerCase();
  if (!section) continue;
  if (!SECTIONS.includes(section)) {
    console.warn(`! ${rel(file)}: "publish: ${section}" is not one of ${SECTIONS.join(', ')}. Skipped.`);
    continue;
  }
  const name = path.basename(file, '.md');
  notes.push({ file, name, data, body, section, slug: slugify(data.slug ?? name) });
}

function rel(f) {
  return path.relative(VAULT, f);
}

// URL of every published note, so [[links]] between published notes keep working.
const urls = new Map(notes.map((n) => [n.name.toLowerCase(), `/${n.section}/${n.slug}/`]));

// ---------- convert Obsidian syntax ----------

function convert(note, copyImage) {
  // Leave fenced code blocks untouched.
  const parts = note.body.split(/(^```[\s\S]*?^```)/m);
  return parts
    .map((part, i) => (i % 2 ? part : convertText(part, note, copyImage)))
    .join('')
    .trim();
}

function convertText(text, note, copyImage) {
  return (
    text
      // %% comments %%
      .replace(/%%[\s\S]*?%%/g, '')
      // ![alt](relative/path.png) pointing into the vault
      .replace(/!\[([^\]]*)\]\((?!https?:)([^)\s]+)\)/g, (m, alt, src) => {
        const local = copyImage(decodeURI(src), note);
        return local ? `![${alt}](./${local})` : m;
      })
      // ![[image.png|alt or width]]
      .replace(/!\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (m, target, opt) => {
        target = target.trim();
        if (IMAGE_EXT.test(target)) {
          const local = copyImage(target, note);
          const alt = opt && !/^\d+(x\d+)?$/.test(opt) ? opt : '';
          return local ? `![${alt}](./${local})` : m;
        }
        // Embedded note: becomes a link.
        return wikilink(target, opt);
      })
      // [[Note]], [[Note|alias]], [[Note#Heading]]
      .replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target, alias) => wikilink(target, alias))
      // ==highlight==
      .replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
  );
}

function wikilink(target, alias) {
  const [name, heading] = target.split('#');
  const text = alias || (heading ? `${name} › ${heading}` : name);
  const url = urls.get(name.trim().toLowerCase());
  if (!url) return text; // not published: keep the words, drop the link
  return `[${text}](${url}${heading ? '#' + slugify(heading) : ''})`;
}

// ---------- write the site content ----------

const written = new Set();
let imageCount = 0;

for (const note of notes) {
  const dir = path.join(CONTENT, note.section, note.slug);
  const images = new Map();
  const copyImage = (target, n) => {
    const src = byName.get(path.basename(target).toLowerCase());
    if (!src) {
      console.warn(`! ${rel(n.file)}: image "${target}" not found in the vault.`);
      return null;
    }
    const out = slugify(path.basename(src));
    images.set(out, src);
    return out;
  };

  const body = convert(note, copyImage);

  // Front matter for the site. Obsidian properties win; sensible fallbacks otherwise.
  const d = note.data;
  const stat = fs.statSync(note.file);
  const fm = {
    title: d.title ?? note.name,
    ...(d.description && { description: d.description }),
    date: toDate(d.date ?? d.created ?? stat.mtime),
    ...(d.updated && { updated: toDate(d.updated) }),
    tags: [].concat(d.tags ?? []).map(String).filter(Boolean),
    ...(d.draft !== undefined && { draft: Boolean(d.draft) }),
    ...pick(d, ['platform', 'difficulty', 'repo', 'link', 'stack', 'featured', 'coverAlt']),
    [MARKER]: rel(note.file),
  };
  if (d.cover) {
    const target = String(d.cover).replace(/^!?\[\[|\]\]$/g, '').split('|')[0];
    const local = copyImage(target, note);
    if (local) fm.cover = `./${local}`;
  }
  if (!d.date && !d.created) {
    console.warn(`· ${rel(note.file)}: no "date" property, using the file's last change (${fm.date}).`);
  }

  const output = `---\n${YAML.stringify(fm).trim()}\n---\n\n${body}\n`;
  written.add(dir);
  imageCount += images.size;
  console.log(`✓ ${rel(note.file)} → src/content/${note.section}/${note.slug}/ (${images.size} images)`);
  if (dryRun) continue;

  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.md'), output);
  for (const [out, src] of images) fs.copyFileSync(src, path.join(dir, out));
}

// Remove entries that came from Obsidian but are no longer marked for publishing.
for (const section of SECTIONS) {
  const base = path.join(CONTENT, section);
  if (!fs.existsSync(base)) continue;
  for (const e of fs.readdirSync(base, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const dir = path.join(base, e.name);
    const index = path.join(dir, 'index.md');
    if (written.has(dir) || !fs.existsSync(index)) continue;
    const { data } = splitFrontMatter(fs.readFileSync(index, 'utf8'));
    if (!data[MARKER]) continue; // written by hand, leave it alone
    console.log(`✗ removed src/content/${section}/${e.name}/ (no longer published in Obsidian)`);
    if (!dryRun) fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\n${notes.length} notes, ${imageCount} images${dryRun ? ' (dry run, nothing written)' : ''}.`);

function toDate(v) {
  const date = v instanceof Date ? v : new Date(v);
  return date.toISOString().slice(0, 10);
}

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((k) => obj[k] != null && obj[k] !== '').map((k) => [k, obj[k]]));
}
