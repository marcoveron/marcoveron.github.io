import rss from '@astrojs/rss';
import { getEntries } from '../lib/content';
import { site } from '../site.config';

export async function GET(context) {
  const sections = ['writeups', 'blog', 'notes'];
  const entries = (await Promise.all(sections.map(getEntries)))
    .flat()
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: site.name,
    description: site.description,
    site: context.site,
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.date,
      link: `/${e.collection}/${e.id}/`,
    })),
  });
}
