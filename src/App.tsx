import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Profile } from "./types";
import { db, ensureProfile, readProfileRecord, saveProfile } from "./db";
import { EMPTY_PROFILE } from "./profile";
import { Header } from "./components/Header";
import { Welcome } from "./components/Welcome";
import { Questionnaire } from "./components/Questionnaire";
import { Cases } from "./components/Cases";
import { Carnet } from "./components/Carnet";

type Route = "cases" | "carnet";

export default function App() {
  const [route, setRoute] = useState<Route>("cases");
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [started, setStarted] = useState(false); // moved past the welcome splash

  // One-time bootstrap (write outside any live query).
  useEffect(() => {
    let alive = true;
    ensureProfile()
      .then(() => readProfileRecord())
      .then((rec) => {
        if (!alive) return;
        setProfile(rec.profile);
        setOnboardedState(rec.onboarded);
      })
      .catch(() => {
        if (alive) setOnboardedState(false); // fail to the questionnaire
      });
    return () => {
      alive = false;
    };
  }, []);

  // Scroll to top on route change.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  // Live shortlist count for the header badge.
  const savedCount = useLiveQuery(() => db.saved.count(), [], 0);

  // Finish the questionnaire: persist the portrait and enter the app.
  const finish = (p: Profile) => {
    setProfile(p);
    setOnboardedState(true);
    void saveProfile(p, true);
  };

  return (
    <div className="almanac-ground min-h-[100dvh]">
      {/* Pre-onboarding: welcome splash, then the questionnaire. */}
      {onboarded === false &&
        (started ? (
          <main className="relative z-10">
            <Questionnaire initial={profile} mode="first" onComplete={finish} onCancel={() => setStarted(false)} />
          </main>
        ) : (
          <Welcome onBegin={() => setStarted(true)} />
        ))}

      {/* The app proper. */}
      {onboarded === true && (
        <>
          <Header
            route={route}
            onHome={() => setRoute("cases")}
            onCarnet={() => setRoute("carnet")}
            carnetCount={savedCount ?? 0}
          />
          <main className="relative z-10">
            {route === "cases" && <Cases profile={profile} onProfileChange={setProfile} />}
            {route === "carnet" && <Carnet profile={profile} onBrowse={() => setRoute("cases")} />}
          </main>
          <footer className="relative z-10 mx-auto max-w-5xl px-5 pb-10 pt-4 text-center">
            <p className="font-display text-sm italic text-ink-faint">whatsnext — a guide to your next chapter.</p>
          </footer>
        </>
      )}
    </div>
  );
}
