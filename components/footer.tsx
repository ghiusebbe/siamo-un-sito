import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import Image from "@/components/site-image";

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
        <Link className="footer-brand-link" href="/" aria-label="SIAMO, homepage">
          <Image src="/brand/siamo-symbol-white.png" alt="" width={900} height={730} sizes="112px" />
        </Link>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
