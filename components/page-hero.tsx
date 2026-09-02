import { DynamicTitle } from "@/components/dynamic-title";

export function PageHero({ kicker, title, intro }: { kicker?: string; title: string; intro?: string }) {
  return (
    <section className="page-hero shell">
      {kicker ? <span className="eyebrow">{kicker}</span> : null}
      <DynamicTitle as="h1" lines={[title]} eager />
      {intro ? <p>{intro}</p> : null}
    </section>
  );
}
