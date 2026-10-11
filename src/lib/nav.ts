import { getEntries } from './content';
import { nav, sections, type SectionKey } from '../site.config';

// Main navigation, leaving out sections that have nothing published yet.
export async function getNav() {
  const visible = await Promise.all(
    nav.map(async (item) => {
      const key = item.href.replaceAll('/', '') as SectionKey;
      if (!(key in sections)) return true;
      return (await getEntries(key)).length > 0;
    }),
  );
  return nav.filter((_, i) => visible[i]);
}
