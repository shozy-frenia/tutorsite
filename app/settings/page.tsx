import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SettingsPanels from "@/components/settings/SettingsPanels";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: `${t("settings.title")} — Talap`,
    description: t("settings.profileSub"),
    // Nothing here is for a search engine, and it is per-student besides.
    robots: { index: false, follow: false },
  };
}

/**
 * Settings.
 *
 * A page of its own rather than a strip at the foot of the dashboard, which is
 * where the profile form and the account panel used to live. The dashboard is
 * a record of what a student has done; mixing the controls that reshape it into
 * the same scroll made both harder to read, and it meant editing your target
 * grade started with scrolling past your own charts.
 */
export default async function SettingsPage() {
  const { t } = await getT();

  return (
    <main style={{ minHeight: "100vh" }}>
      <Nav />
      <section className="shell section-tight">
        <div className="head head--left">
          <h1 className="h-sm">
            <span className="hl">
              <span>{t("settings.title")}</span>
            </span>
          </h1>
        </div>
        <SettingsPanels />
      </section>
    </main>
  );
}
