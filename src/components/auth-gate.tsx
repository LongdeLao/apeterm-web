import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthContext, type AuthContextValue } from "@/lib/auth-context";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const defaultSymbols = [
  "SPY",
  "QQQ",
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "META",
  "GOOGL",
  "TSLA",
  "JPM",
  "NFLX",
];
const languages = ["english", "german"] as const;
const themes = ["dark", "light", "transparent", "bloomberg"] as const;

type Language = (typeof languages)[number];
type Theme = (typeof themes)[number];
function Screen({ children, tone = "dark" }: { children: ReactNode; tone?: Theme }) {
  const colors = {
    dark: "bg-[#0c0c0c] text-[#e8e8e8]",
    light: "bg-[#eceae4] text-[#171717]",
    transparent: "bg-[#151515]/95 text-[#e8e8e8]",
    bloomberg: "bg-[#090909] text-[#ff9d24]",
  }[tone];
  return (
    <main
      className={`flex min-h-screen items-center justify-center px-5 font-mono text-[13px] ${colors}`}
    >
      {children}
    </main>
  );
}

function Logo() {
  return (
    <pre className="select-none text-center text-[15px] leading-[1.25]" aria-label="ApeTerm">
      {"／三ヽ\n(6( ･ ･|)\n|　( ┴)\n\napeterm"}
    </pre>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.data.session) onAuthenticated(result.data.session);
    else setMessage("check your email to confirm the account, then sign in");
  }

  if (!supabaseConfigured) {
    return (
      <Screen>
        <p className="text-[#f87171]">! Supabase is not configured</p>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="w-full max-w-[390px]">
        <Logo />
        <div className="mt-10 border border-[#5b5b5b] bg-[#0c0c0c] p-1 text-[#e8e8e8]">
          <div className="flex border-b border-[#5b5b5b]">
            {(["signin", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                  setMessage("");
                }}
                className={`px-3 py-2 text-[11px] font-bold ${mode === item ? "bg-[#e8e8e8] text-[#0c0c0c]" : "text-[#8f8f8f]"}`}
              >
                {item === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4 px-3 py-5">
            <label className="block">
              <span className="mb-1 block text-[#909090]">email</span>
              <input
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-b border-[#5b5b5b] bg-transparent py-1 outline-none focus:border-[#e8e8e8]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[#909090]">password</span>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-b border-[#5b5b5b] bg-transparent py-1 outline-none focus:border-[#e8e8e8]"
              />
            </label>
            {error && <p className="text-[#f87171]">! {error}</p>}
            {message && <p className="text-[#34d399]">● {message}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#e8e8e8] px-3 py-2 font-bold text-[#0c0c0c] disabled:opacity-50"
            >
              {busy
                ? "○ connecting..."
                : mode === "signin"
                  ? "↵ enter apeterm"
                  : "↵ create account"}
            </button>
          </form>
        </div>
        <p className="mt-3 text-center text-[11px] text-[#777]">
          secure session · powered by supabase
        </p>
      </div>
    </Screen>
  );
}

function Onboarding({ session, onDone }: { session: Session; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>("english");
  const [theme, setTheme] = useState<Theme>("dark");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    const [profile, watchlist] = await Promise.all([
      supabase.from("profiles").upsert({
        id: session.user.id,
        language,
        theme,
        experience: "pro",
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }),
      supabase.from("watchlists").upsert({
        user_id: session.user.id,
        symbols: defaultSymbols,
        updated_at: new Date().toISOString(),
      }),
    ]);
    setSaving(false);
    const failure = profile.error ?? watchlist.error;
    if (failure) setError(failure.message);
    else onDone();
  };

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (step < 2) setStep((value) => value + 1);
        else void finish();
      } else if (step === 1 && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        setLanguage((value) => (value === "english" ? "german" : "english"));
      } else if (step === 2 && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        setTheme(
          (value) =>
            themes[(themes.indexOf(value) + (event.key === "ArrowDown" ? 1 : 3)) % themes.length],
        );
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });

  return (
    <Screen tone={theme}>
      <div className="w-full max-w-[430px] text-center">
        {step === 0 ? (
          <Logo />
        ) : (
          <>
            <p className="mb-8">{step === 1 ? " language" : "◐ theme"}</p>
            <div className="mx-auto w-44 space-y-1 text-left">
              {(step === 1 ? languages : themes).map((item) => {
                const selected = step === 1 ? language === item : theme === item;
                const label =
                  item === "english"
                    ? "English"
                    : item === "german"
                      ? "Deutsch"
                      : item[0].toUpperCase() + item.slice(1);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      step === 1 ? setLanguage(item as Language) : setTheme(item as Theme)
                    }
                    className={`block w-full text-left ${selected ? "font-bold" : "opacity-50"}`}
                  >
                    {selected ? "> " : "  "}
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {error && <p className="mt-8 text-[#f87171]">! {error}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={() => (step < 2 ? setStep(step + 1) : void finish())}
          className="mt-10 opacity-50 hover:opacity-100"
        >
          {saving ? "○ saving..." : "press ↵ to continue"}
        </button>
      </div>
    </Screen>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [symbols, setSymbols] = useState(defaultSymbols);
  const userId = session?.user.id;

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setBooting(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setOnboarded(false);
        setBooting(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let current = true;
    setBooting(true);
    void Promise.all([
      supabase.from("profiles").select("onboarding_completed").eq("id", userId).maybeSingle(),
      supabase.from("watchlists").select("symbols").eq("user_id", userId).maybeSingle(),
    ]).then(([profile, watchlist]) => {
      if (!current) return;
      setOnboarded(profile.data?.onboarding_completed === true);
      if (Array.isArray(watchlist.data?.symbols) && watchlist.data.symbols.length)
        setSymbols(watchlist.data.symbols);
      setBooting(false);
    });
    return () => {
      current = false;
    };
  }, [userId]);

  const value = useMemo<AuthContextValue | null>(
    () =>
      session
        ? {
            accessToken: session.access_token,
            initialSymbols: symbols,
            userEmail: session.user.email ?? "account",
            saveWatchlist: async (nextSymbols) => {
              setSymbols((current) =>
                current.length === nextSymbols.length &&
                current.every((symbol, index) => symbol === nextSymbols[index])
                  ? current
                  : nextSymbols,
              );
              await supabase.from("watchlists").upsert({
                user_id: session.user.id,
                symbols: nextSymbols,
                updated_at: new Date().toISOString(),
              });
            },
            signOut: async () => {
              await supabase.auth.signOut();
            },
          }
        : null,
    [session, symbols],
  );

  if (booting)
    return (
      <Screen>
        <p className="text-[#909090]">○ opening secure session...</p>
      </Screen>
    );
  if (!session) return <AuthScreen onAuthenticated={setSession} />;
  if (!onboarded) return <Onboarding session={session} onDone={() => setOnboarded(true)} />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
