import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="footer shell">
      <div>
        <span className="eyebrow">Email</span>
        <a href={`mailto:${settings.email}`}>{settings.email}</a>
      </div>
      <div>
        <span className="eyebrow">Instagram</span>
        <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
          {settings.instagramHandle} ↗
        </a>
      </div>
      <div className="footer-mark">
        <Link href="/">SIAMO</Link>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
