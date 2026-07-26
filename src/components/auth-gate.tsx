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

/* Paper surface shared by the auth screen and the pre-session boot state, so the
   first paint matches apeterm.com rather than flashing the dark app shell. */
function PaperScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f2efe7] px-5 text-[#171714] sm:px-8">
      <header className="flex min-h-16 items-center">
        <a
          href="https://apeterm.com"
          className="font-mono text-sm font-semibold tracking-[0.02em] transition-opacity hover:opacity-70"
        >
          APETERM
        </a>
      </header>
      <div className="flex flex-1 items-center justify-center pb-16">{children}</div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.14-2.79-.44-4.02H24v7.3h12.1c-.24 1.98-1.56 4.96-4.48 6.96l-.04.27 6.5 5.04.45.04c4.14-3.82 6.57-9.45 6.57-15.59"
      />
      <path
        fill="#34A853"
        d="M24 46c5.91 0 10.87-1.95 14.5-5.3l-6.91-5.35c-1.85 1.29-4.33 2.19-7.59 2.19-5.79 0-10.71-3.82-12.46-9.1l-.26.02-6.76 5.23-.9.25C7.13 41.06 14.97 46 24 46"
      />
      <path
        fill="#FBBC05"
        d="M11.54 28.44A13.6 13.6 0 0 1 10.79 24c0-1.55.28-3.05.72-4.44l-.01-.3-6.85-5.31-.22.1A22 22 0 0 0 2 24c0 3.55.86 6.9 2.43 9.95z"
      />
      <path
        fill="#EA4335"
        d="M24 9.46c4.11 0 6.88 1.78 8.46 3.26l6.18-6.03C34.85 3.14 29.91 1 24 1 14.97 1 7.13 5.94 3.43 13.12l7.68 5.96C12.89 13.28 17.81 9.46 24 9.46"
      />
    </svg>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy("email");
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
    setBusy(null);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.data.session) onAuthenticated(result.data.session);
    else setMessage("check your email to confirm the account, then sign in");
  }

  async function signInWithGoogle() {
    setBusy("google");
    setError("");
    setMessage("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) {
      setError(oauthError.message);
      setBusy(null);
    }
  }

  if (!supabaseConfigured) {
    return (
      <PaperScreen>
        <p className="font-mono text-[13px] text-[#9a2f22]">Supabase is not configured.</p>
      </PaperScreen>
    );
  }

  const inputClass =
    "h-11 w-full border border-[#171714]/25 bg-transparent px-3.5 text-[15px] text-[#171714] outline-none transition-colors placeholder:text-[#9a9488] focus:border-[#171714]";
  const labelClass = "mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-[#69645b]";

  return (
    <PaperScreen>
      <div className="w-full max-w-[380px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#69645b]">
          Web workspace
        </p>
        <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-[-0.045em]">
          {mode === "signin" ? "Open workspace" : "Create account"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5d5850]">
          {mode === "signin"
            ? "Prices, filings, news and your notes on one screen."
            : "Free, and it stays free. No card, no seat licence."}
        </p>

        <form onSubmit={submit} className="mt-9 space-y-5">
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              placeholder={mode === "signin" ? "Enter your password" : "Minimum 8 characters"}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </label>

          <div aria-live="polite" className="empty:hidden">
            {error && <p className="text-[13px] leading-5 text-[#9a2f22]">{error}</p>}
            {message && <p className="text-[13px] leading-5 text-[#2f6b4f]">{message}</p>}
          </div>

          <button
            type="submit"
            disabled={busy !== null}
            className="h-11 w-full border border-[#171714] bg-[#171714] text-sm font-medium text-[#f2efe7] transition-colors hover:bg-transparent hover:text-[#171714] disabled:cursor-wait disabled:opacity-50 disabled:hover:bg-[#171714] disabled:hover:text-[#f2efe7]"
          >
            {busy === "email"
              ? "Connecting..."
              : mode === "signin"
                ? "Open workspace"
                : "Create account"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b867c]">
          <span className="h-px flex-1 bg-[#171714]/20" />
          or
          <span className="h-px flex-1 bg-[#171714]/20" />
        </div>

        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          disabled={busy !== null}
          className="flex h-11 w-full items-center justify-center gap-2.5 border border-[#171714]/25 bg-transparent text-sm font-medium text-[#171714] transition-colors hover:border-[#171714] disabled:cursor-wait disabled:opacity-50"
        >
          <GoogleMark />
          {busy === "google" ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-9 border-t border-[#171714]/20 pt-5 text-sm text-[#5d5850]">
          {mode === "signin" ? "New to ApeTerm?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setMessage("");
            }}
            className="font-medium text-[#171714] underline decoration-[#171714]/35 underline-offset-4 transition-colors hover:decoration-[#171714]"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </PaperScreen>
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
            userId: session.user.id,
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

  // Signed-in users are heading into the dark workspace, so keep the dark shell.
  // Signed-out users are heading to the paper auth screen — match that instead.
  if (booting)
    return session ? (
      <Screen>
        <p className="text-[#909090]">○ opening secure session...</p>
      </Screen>
    ) : (
      <PaperScreen>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8b867c]">
          Opening secure session…
        </p>
      </PaperScreen>
    );
  if (!session) return <AuthScreen onAuthenticated={setSession} />;
  if (!onboarded) return <Onboarding session={session} onDone={() => setOnboarded(true)} />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
