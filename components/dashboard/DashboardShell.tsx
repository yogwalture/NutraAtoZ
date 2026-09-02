"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Wallet,
  BarChart3,
  Upload,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const NAV = [
  { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Insights", href: "/vendor/dashboard/insights", icon: BarChart3 },
  { label: "Products", href: "/vendor/dashboard/products", icon: Package },
  { label: "Bulk import", href: "/vendor/dashboard/bulk", icon: Upload },
  { label: "Orders", href: "/vendor/dashboard/orders", icon: ReceiptText },
  { label: "Payouts", href: "/vendor/dashboard/payouts", icon: Wallet },
];

interface ShellProps {
  vendorName: string;
  approved: boolean;
  children: React.ReactNode;
}

export default function DashboardShell({
  vendorName,
  approved,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/vendor/login");
    router.refresh();
  }

  const NavList = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/vendor/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/75 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-[hsl(28_100%_96%)] to-[hsl(340_65%_96%)]">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/40 bg-white/60 shadow-float backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <a href="/" className="flex flex-col gap-1" aria-label="Nutraatoz home">
            <img src="/nutraatoz-wordmark.png" alt="Nutraatoz" className="h-7 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Vendor Portal
            </span>
          </a>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{NavList}</div>
        <div className="space-y-1 border-t border-border p-3">
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            View storefront
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-emerald-800/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <img src="/nutraatoz-wordmark.png" alt="Nutraatoz" className="h-7 w-auto" />
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{NavList}</div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/40 bg-white/60 px-4 shadow-float backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg text-primary hover:bg-primary/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {vendorName}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Vendor dashboard
              </p>
            </div>
          </div>
          {approved ? (
            <Badge variant="success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Approved vendor
            </Badge>
          ) : (
            <Badge variant="warning">
              <ShieldAlert className="h-3.5 w-3.5" />
              Pending approval
            </Badge>
          )}
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
