import type { Metadata } from "next";
import "../site.css";
import SiteEffects from "@/components/site/SiteEffects";
import SiteHeader from "@/components/site/SiteHeader";
import { getIllustrations, getSettings, mediaUrl } from "@/lib/content";
import { fontVars } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const image = mediaUrl(s.profilePhotoId) ?? undefined;
  return {
    title: { default: s.seoTitle, template: `%s — ${s.name}` },
    description: s.seoDescription,
    openGraph: { title: s.seoTitle, description: s.seoDescription, type: "website", images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title: s.seoTitle, description: s.seoDescription },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, illustrations] = await Promise.all([getSettings(), getIllustrations()]);
  const footer = s.footerText.replace("{year}", String(new Date().getFullYear()));

  return (
    <html lang="en" className={fontVars}>
      <body className="site">
        <SiteHeader name={s.name} ctaLabel={s.navCtaLabel} showIllustration={illustrations.length > 0} />
        <main>{children}</main>
        <footer className="site-footer mono">{footer}</footer>
        <SiteEffects />
      </body>
    </html>
  );
}
