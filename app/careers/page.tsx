import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Careers — Nutraatoz" };

export default function CareersPage() {
  return (
    <PageShell
      title="Careers"
      tagline="Help us build the most trusted wellness marketplace in India."
    >
      <p>
        We&apos;re a small, fast-moving team obsessed with quality and
        transparency. If you care about health, honest products, and great
        craft, we&apos;d love to hear from you.
      </p>

      <h2>Open roles</h2>
      <p>
        We don&apos;t have any public openings right now — but we&apos;re always
        happy to meet talented people in engineering, design, vendor operations,
        and quality/compliance.
      </p>

      <h2>Get in touch</h2>
      <p>
        Send your résumé and a short note to{" "}
        <a href="mailto:nutraatoz@gmail.com">nutraatoz@gmail.com</a> and tell
        us what you&apos;d like to work on. We read every application.
      </p>
    </PageShell>
  );
}
