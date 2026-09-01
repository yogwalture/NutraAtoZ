import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShoppingBag, Store, LayoutDashboard, FlaskConical, ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SignOutButton from "@/components/account/SignOutButton";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = { title: "My Account — Nutraatoz" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role ?? "customer";
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";

  const links = [
    { href: "/products", icon: FlaskConical, title: "Shop supplements", sub: "Browse the verified catalog" },
    { href: "/cart", icon: ShoppingBag, title: "My cart", sub: "Review items and check out" },
    { href: "/vendor/onboarding", icon: Store, title: "Sell on Nutraatoz", sub: "Register your brand as a vendor" },
  ];
  if (role === "admin") {
    links.push({ href: "/admin", icon: LayoutDashboard, title: "Admin console", sub: "Manage vendors, products, commissions" });
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />
      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-citrus-soft">
          <div className="orb orb-amber right-[-5rem] top-0 h-64 w-64 animate-float opacity-40" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-berry">
              My account
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Hi, {name} 👋
            </h1>
            <p className="mt-2 text-sm text-mist">
              Signed in as <span className="font-medium text-ink">{user.email}</span>
              {role !== "customer" && (
                <span className="ml-2 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-bold text-coral-600">
                  {role}
                </span>
              )}
            </p>
            <div className="mt-5">
              <SignOutButton />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-4 rounded-2xl border border-coral/15 bg-white p-5 shadow-card transition-transform hover:-translate-y-1"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-citrus-gradient text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{l.title}</p>
                    <p className="text-xs text-mist">{l.sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-mist transition-transform group-hover:translate-x-1" />
                </a>
              );
            })}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
