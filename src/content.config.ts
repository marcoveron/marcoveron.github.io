import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Fields every Markdown entry can use. Only `title` and `date` are required.
// `cover` is a path relative to the .md file, e.g. `cover: ./cover.png`.
const base = ({ image }: SchemaContext) => z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: image().optional(),
  coverAlt: z.string().default(''),
});

const md = (folder: string) => glob({ pattern: '**/*.md', base: `./src/content/${folder}` });

const projects = defineCollection({
  loader: md('projects'),
  schema: (ctx) => base(ctx).extend({
    repo: z.string().url().optional(),
    link: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const writeups = defineCollection({
  loader: md('writeups'),
  schema: (ctx) => base(ctx).extend({
    platform: z.string().optional(), // HTB, PortSwigger, TryHackMe, CTF name…
    difficulty: z.string().optional(),
  }),
});

const blog = defineCollection({ loader: md('blog'), schema: base });
const notes = defineCollection({ loader: md('notes'), schema: base });

// Standalone pages (about, uses…). Served at /<filename>.
const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, writeups, blog, notes, pages };
