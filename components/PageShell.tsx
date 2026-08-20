import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

/** Shared shell for simple content pages (About, Contact, policies…). */
export default function PageShell({
  title,
  tagline,
  children,
}: {
  title: string;
  tagline?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-citrus-soft">
          <div className="orb orb-amber right-[-5rem] top-0 h-64 w-64 animate-float opacity-40" />
          <div className="orb orb-berry left-[-5rem] bottom-[-4rem] h-64 w-64 opacity-25" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-3 max-w-2xl text-base text-mist sm:text-lg">
                {tagline}
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="space-y-5 text-[15px] leading-relaxed text-mist [&_a]:font-medium [&_a]:text-coral-600 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_strong]:text-ink">
            {children}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
