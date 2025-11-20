const items = [
  {
    label: '‘Men don’t know why they became unhappy’: the toxic gender war dividing South Korea',
    href: 'https://www.theguardian.com/society/2025/sep/20/inside-saturday-south-korea-gender-war',
    ariaLabel: 'Home',
    rotation: -2,
    // optional imageurl (use real thumbnail URL if you have one)
    imageurl: 'https://picsum.photos/seed/guardian/800/600',
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'Gender, generation gap on full display in exit poll showing entrenched differences',
    href: 'https://koreajoongangdaily.joins.com/news/2025-06-03/national/2025presidential/Gender-generation-gap-on-full-display-in-exit-poll-showing-entrenched-differences/2322105',
    ariaLabel: 'About',
    rotation: 4,
    imageurl: 'https://picsum.photos/seed/generationconlict/800/600',
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'South Korea’s deep political divide',
    href: 'https://www.koreaherald.com/article/10508049',
    ariaLabel: 'Projects',
    rotation: 2,
    imageurl: 'https://picsum.photos/seed/politicaldivide/800/600',
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'For cash-strapped South Koreans, the class conflict in "Squid Game" is deadly serious',
    href: 'https://www.npr.org/2021/11/06/1053163060/class-conflict-and-economic-hardship-in-squid-game-is-real-for-many-south-korean',
    ariaLabel: 'Blog',
    rotation: -1,
    imageurl: 'https://picsum.photos/seed/economicclassconflict/800/600',
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'South Korea has 3rd highest social conflict index among OECD countries',
    href: 'https://english.hani.co.kr/arti/english_edition/e_national/912156.html',
    ariaLabel: 'Contact',
    rotation: 4,
    imageurl: 'https://picsum.photos/seed/socialconflict/800/600',
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  },
  {
    label: 'Environmental vulnerability and conflict occurrence are tightly related',
    href: 'https://www.nature.com/articles/s43247-025-02300-6',
    ariaLabel: 'Environment',
    rotation: -3,
    imageurl: 'https://picsum.photos/seed/environmentalproblems/800/600',
    hoverStyles: { bgColor: '#D97706', textColor: '#ffffff' }
  },
  {
    label: 'The gap between the haves and have-nots in Australia is at a 20-year high',
    href: 'https://pursuit.unimelb.edu.au/articles/the-gap-between-the-haves-and-have-nots-in-australia-is-at-a-20-year-high',
    ariaLabel: 'Economy',
    rotation: 1,
    imageurl: 'https://picsum.photos/seed/economicgap/800/600',
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  }

];

// Keep the original news items available as a named export for
// existing code that expects `label`, `href`, etc.
export { items };

// `galleryItems` maps the news entries into the shape expected by
// `CircularGallery.jsx` — an array of `{ image, text }` objects.
// By default we use `picsum.photos` placeholders (seeded by index).
// You can replace `image` with a real thumbnail URL if available.
export const galleryItems = items.map((it, idx) => ({
  // Prefer an explicit `imageurl` field when provided by the data.
  image: it.imageurl || `https://picsum.photos/seed/news-${idx}/800/600`,
  text: it.label
}));

// Example import in a component:
// import { galleryItems } from 'pages/api/data/news';
// <CircularGallery items={galleryItems} />

// Make the gallery-shaped items the default export for easy consumption
// by components that expect an array of `{ image, text }`.
export default galleryItems;
