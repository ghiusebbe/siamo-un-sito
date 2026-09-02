export type PortableBlock = {
  _key?: string;
  _type: "block";
  style?: string;
  children?: Array<{ _key?: string; _type?: string; text?: string; marks?: string[] }>;
};

export type RichText = string[] | PortableBlock[];

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  excerpt: string;
  body: RichText;
  cover: string;
  author: string;
  publishedAt: string;
  featured?: boolean;
};

export type EventItem = {
  id: string;
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
  year: number;
  title: string;
  description?: string;
  image?: string;
};

export type Magazine = {
  id: string;
  volume: number;
  title: string;
  cover: string;
  checkoutUrl: string;
};

export type SiteSettings = {
  title: string;
  description: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  metrics: Array<{ value: string; label: string }>;
};
