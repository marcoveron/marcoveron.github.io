# marcoveron.me

Personal site built with [Astro](https://astro.build). Content is plain Markdown.

## Commands

```bash
npm install       # once
npm run dev       # http://localhost:4321 (drafts visible)
npm run build     # static site in dist/ (drafts excluded)
npm run preview   # serve dist/ locally
```

## Adding content

Drop a `.md` file into the matching folder. The filename becomes the URL.

| Folder | URL | Extra fields |
|---|---|---|
| `src/content/projects/` | `/projects/<file>/` | `repo`, `link`, `stack`, `featured` (shows on home) |
| `src/content/writeups/` | `/writeups/<file>/` | `platform`, `difficulty` |
| `src/content/blog/` | `/blog/<file>/` | none |
| `src/content/notes/` | `/notes/<file>/` | none |
| `src/content/pages/` | `/<file>/` | standalone pages such as About |

Common front matter:

```yaml
---
title: Required
date: 2026-10-11        # required (not for pages)
description: Optional one-line summary
tags: [web, llm]
updated: 2026-11-01     # optional
draft: true             # visible in dev, never published
---
```

### Images

Give each entry with images its own folder:

```
src/content/writeups/htb-box/
├── index.md        ← the write-up (URL: /writeups/htb-box/)
├── cover.png       ← optional cover
└── shell.png
```

- **Cover:** add `cover: ./cover.png` and `coverAlt: …` to the front matter. It appears on the listing, the home page and as a banner on the entry. Without one, an engraved rosette is drawn from the title.
- **Images in the text:** `![alt](./shell.png)`. They are optimized automatically, framed, and open full size on click.
- **Captions:** put a line in *italics* right below the image (no blank line in between).
- Three or more `##` headings generate a table of contents automatically.
- Code blocks get syntax highlighting.

## Publishing from Obsidian

Write in Obsidian as usual (vault: `~/Documents/Obsidian Vault`). The vault is only read, never modified.

1. When a note is ready, add properties to it (Ctrl+; in Obsidian, or front matter):

   ```yaml
   publish: writeups          # or blog, notes, projects
   description: One line shown in listings
   date: 2026-10-11           # optional; falls back to the file's last change
   tags: [llm, web]
   platform: PortSwigger      # write-ups only, optional
   difficulty: Apprentice     # write-ups only, optional
   cover: "[[my image.png]]"  # optional
   draft: true                # optional: preview locally without publishing
   ```

2. Run `npm run sync` (or `npm run sync:check` to see what would change without writing anything).
3. Check it with `npm run dev`, then commit and push.

What the sync does:

- Copies each note to `src/content/<section>/<slug>/index.md`, plus only the images it uses.
- `![[image.png]]` becomes a normal image. `![[image.png|Description]]` sets the alt text. Images are found anywhere in the vault (e.g. `Attachments/`).
- `[[Other note]]` becomes a link if that note is published too, otherwise plain text.
- `==highlight==` becomes highlighted text, `%%comments%%` are removed, and callouts (`> [!warning] Title`) are rendered as boxes.
- Removing `publish` from a note and syncing again removes it from the site. Entries written by hand in `src/content/` are never touched.

The vault path can be changed with `OBSIDIAN_VAULT=/path/to/vault npm run sync`.

## Personal details

Name, intro, email and links live in `src/site.config.ts`. Navigation and sections are configured there too, including each section's layout: `grid` (image cards), `thumbs` (list with thumbnails) or `list` (text only).

Colors (Paraguay's flag plus UPTP's navy and gold) are tokens at the top of `src/styles/global.css`.

**Adding a new section** (e.g. `talks`): create `src/content/talks/`, register it in `src/content.config.ts`, add it to `sections` and `nav` in `src/site.config.ts`. Routes are generated automatically.


## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`) at https://marcoveron.me. `public/CNAME` holds the domain.

Domain: `marcoveron.me` at Namecheap. The apex A records point to GitHub Pages (185.199.108–111.153) and `www` is a CNAME to the apex.

Publishing a write-up from Obsidian end to end:

```bash
npm run sync          # bring notes marked `publish:` into the site
npm run dev           # check it
git add -A && git commit -m "Publish <title>" && git push
```
