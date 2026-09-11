export type PortableSpan = { _key?: string; _type?: string; text?: string; marks?: string[] };

/** Annotations Studio attaches to a span; today the block editor only offers links. */
export type PortableMarkDef = { _key: string; _type: string; href?: string };

export type PortableBlock = {
  _key?: string;
  _type: "block";
  style?: string;
  children?: PortableSpan[];
  markDefs?: PortableMarkDef[];
};

export type RichText = Array<string | PortableBlock>;

// Frontend models: lib/content normalizes optional Sanity fields to empty
// strings/arrays so all pages can consistently omit their empty components.

export type Article = {
  id: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  excerpt: string;
  body: RichText;
  cover: string;
  coverAlt?: string;
  author: string;
  publishedAt: string;
  featured?: boolean;
};

export type EventItem = {
  id: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  date: string;
  venue?: string;
  city?: string;
  lineup: string[];
  description: RichText;
  cover: string;
  ticketUrl?: string;
  status: "upcoming" | "archived";
};

export type FaqItem = { question: string; answer: string };

export type Service = {
  id: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  tagline: string;
  intro: string;
  cover?: string;
  gallery?: string[];
  deliverables: Array<{ title: string; description: string }>;
  faq: FaqItem[];
};

export type TimelineItem = {
  id: string;
  _updatedAt?: string;
  year: number;
  title: string;
  description?: string;
  image?: string;
  /** Optional destination: an article, event, volume or external page. */
  link?: string;
};

export type Magazine = {
  id: string;
  _updatedAt?: string;
  volume: number;
  title: string;
  cover: string;
  checkoutUrl?: string;
  /** While set, the card says "Coming soon" and the purchase link stays off the page. */
  comingSoon?: boolean;
  /** Optional release time: shown as a countdown, and it ends coming soon when it passes. */
  releaseAt?: string;
};

export type SiteSettings = {
  title: string;
  description: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  metrics: Array<{ value: string; label: string }>;
};
