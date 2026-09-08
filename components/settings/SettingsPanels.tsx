"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountPanel from "@/components/auth/AccountPanel";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useT } from "@/components/i18n/LocaleProvider";
import { clearStore, readStore, saveProfile, type Store } from "@/lib/storage";

/**
 * Settings.
 *
 * Everything here changes what the student sees rather than what they have
 * done — which is the line that decides what belongs on this page and what
 * belongs on the dashboard. Their record lives there; the switches that shape
 * it live here.
 *
 * Four blocks, in the order they matter: the profile that decides which papers
 * the library offers, the language, the account that carries all of it between
 * devices, and last the destructive one.
 */
export default function SettingsPanels() {
  const t = useT();
  const [store, setStore] = useState<Store>({
    profile: null,
    attempts: [],
    activeDays: [],
  });
  const [hydrated, setHydrated] = useState(false);

  // localStorage does not exist on the server, so the first paint has to be a
  // placeholder or React will complain about a mismatched tree.
  useEffect(() => {
    setStore(readStore());
    setHydrated(true);
    const onChange = () => setStore(readStore());
    window.addEventListener("talap:store", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("talap:store", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (!hydrated) {
    return <span className="mono muted">{t("dash.loading")}</span>;
  }

  return (
    <div className="settings">
      <section className="settings__block">
        <div className="settings__head">
          <h2 className="sub">{t("settings.profile")}</h2>
          <p className="body-sm muted">{t("settings.profileSub")}</p>
        </div>
        <ProfileForm
          showIntro={false}
          initial={store.profile}
          submitLabel={store.profile ? t("settings.save") : undefined}
          onDone={(profile) => setStore(saveProfile(profile))}
        />
      </section>

      <section className="settings__block">
        <div className="settings__head">
          <h2 className="sub">{t("settings.language")}</h2>
          <p className="body-sm muted">{t("settings.languageSub")}</p>
        </div>
        <LocaleSwitcher variant="segmented" />
      </section>

      <section className="settings__block">
        <div className="settings__head">
          <h2 className="sub">{t("settings.account")}</h2>
        </div>
        {/* Renders nothing when Supabase is unconfigured, which is why the
            heading above it is the only thing that would be left — so the
            guest prompt lives inside the panel rather than here. */}
        <AccountPanel onCleared={setStore} />
      </section>

      <section className="settings__block">
        <div className="settings__head">
          <h2 className="sub">{t("settings.device")}</h2>
          <p className="body-sm muted">{t("settings.deviceSub")}</p>
        </div>
        <div className="settings__actions">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              if (window.confirm(t("dash.resetConfirm"))) {
                setStore(clearStore());
              }
            }}
          >
            {t("dash.reset")}
          </button>
          <Link href="/dashboard" className="btn btn--quiet btn--sm">
            {t("nav.progress")}
          </Link>
        </div>
      </section>
    </div>
  );
}
