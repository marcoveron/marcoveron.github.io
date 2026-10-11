import { getCollection, type CollectionEntry } from 'astro:content';
import type { SectionKey } from '../site.config';

export type Entry = CollectionEntry<SectionKey>;

// Drafts show up while running `npm run dev`, never in the built site.
export async function getEntries(section: SectionKey): Promise<Entry[]> {
  const entries = (await getCollection(section)) as Entry[];
  return entries
    .filter((e) => import.meta.env.DEV || !e.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, style: 'long' | 'year' = 'long') {
  if (style === 'year') return String(date.getUTCFullYear());
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function readingTime(body = '') {
  const words = body.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}
