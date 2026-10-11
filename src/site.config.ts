// Everything personal about the site lives here. Edit this file, not the components.

export const site = {
  name: 'Marco Verón',
  initials: 'MV',
  title: 'Marco Verón',
  description:
    'Security engineer building AI-assisted tooling for SOC teams. Projects, write-ups and notes.',
  intro:
    'Security engineer in Asunción, Paraguay. I build AI-assisted tooling for SOC teams: agents that triage alerts, enrich indicators and propose responses, with a human approving anything that touches the network.',
  location: 'Asunción, Paraguay',
  email: 'mv.marcoveron@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/marcoveron' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/marcoveron' },
  ],
};

// Each section is a folder in src/content/ with the same name.
// To add a section: create the folder, register it in content.config.ts, add it here.
// layout: 'grid' (image plates), 'thumbs' (list with small images) or 'list' (text only).
export const sections = {
  projects: { title: 'Projects', intro: 'Things I have built and published.', layout: 'grid' },
  writeups: { title: 'Write-ups', intro: 'Labs, CTFs and assessments, step by step.', layout: 'thumbs' },
  blog: { title: 'Blog', intro: 'Longer pieces on security engineering and applied AI.', layout: 'list' },
  notes: { title: 'Notes', intro: 'Short notes I keep while learning. Rougher than the blog.', layout: 'list' },
} as const;

export type SectionKey = keyof typeof sections;

// Order of the main navigation. Page entries point to files in src/content/pages/.
export const nav = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Write-ups', href: '/writeups/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'About', href: '/about/' },
];
