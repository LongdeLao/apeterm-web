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
      <Screen>
        <p className="text-[#f87171]">! Supabase is not configured</p>
      </Screen>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080908] font-mono text-[13px] text-[#e8e8e8]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:42px_42px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#34d399]/[0.06] blur-[120px]"
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1180px] items-center gap-16 px-5 py-10 md:grid-cols-[1.08fr_0.92fr] md:px-10">
        <section className="hidden md:block">
          <div className="mb-12 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[#7d827f]">
            <span className="h-2 w-2 rounded-full bg-[#34d399] shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
            markets online
          </div>
          <div className="flex items-end gap-7">
            <Logo />
            <div className="mb-1 border-l border-[#343735] pl-6">
              <h1 className="text-3xl font-bold tracking-[-0.05em] text-white">
                Your market command line.
              </h1>
              <p className="mt-3 max-w-[460px] leading-6 text-[#8e9490]">
                Live markets, filings, news and an AI research agent—built into one focused
                terminal.
              </p>
            </div>
          </div>

          <div className="mt-12 border border-[#2f3330] bg-[#0b0d0c]/90 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#272a28] px-4 py-2 text-[10px] text-[#686e6a]">
              <span>APTERM / MARKET PULSE</span>
              <span>LIVE · 1S</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-3 px-4 py-4 text-[12px]">
              <span className="text-[#a7aca9]">SPY</span>
              <span>738.93</span>
              <span className="text-[#34d399]">▲ +0.10%</span>
              <span className="text-[#a7aca9]">NVDA</span>
              <span>206.84</span>
              <span className="text-[#f87171]">▼ -0.92%</span>
              <span className="text-[#a7aca9]">BTC</span>
              <span>64,383</span>
              <span className="text-[#34d399]">▲ +0.32%</span>
            </div>
            <div className="border-t border-[#272a28] px-4 py-3 text-[11px] text-[#737975]">
              <span className="text-[#34d399]">›</span> ask ape&nbsp;{" "}
              <span className="text-[#aeb3b0]">what is moving the market today?</span>
              <span className="ml-1 animate-pulse text-[#34d399]">▋</span>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[440px]">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <div className="border border-[#343835] bg-[#0d0f0e]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-[#292c2a] px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-[#747a76]">
              <span>identity / secure access</span>
              <span className="text-[#34d399]">● encrypted</span>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6f7571]">
                Welcome to ApeTerm
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {mode === "signin" ? "Sign in to your terminal" : "Create your terminal"}
              </h2>

              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={busy !== null}
                className="mt-7 flex w-full items-center justify-center gap-3 border border-[#4b504c] bg-[#171a18] px-4 py-3 font-bold text-white transition hover:border-[#7b827d] hover:bg-[#1c201d] disabled:cursor-wait disabled:opacity-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-sans text-[12px] font-bold text-[#252525]">
                  G
                </span>
                {busy === "google" ? "connecting to Google..." : "Continue with Google"}
              </button>

              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-[#606561]">
                <span className="h-px flex-1 bg-[#292c2a]" />
                or use email
                <span className="h-px flex-1 bg-[#292c2a]" />
              </div>

              <div className="mb-6 grid grid-cols-2 border border-[#2f3330] p-1">
                {(["signin", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setError("");
                      setMessage("");
                    }}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition ${mode === item ? "bg-[#e8e8e8] text-[#0c0c0c]" : "text-[#747a76] hover:text-[#d7d9d8]"}`}
                  >
                    {item === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[11px] text-[#858b87]">email_address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    placeholder="you@example.com"
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border border-[#343835] bg-[#090a09] px-3 py-3 text-white outline-none placeholder:text-[#414542] focus:border-[#34d399] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] text-[#858b87]">password</span>
                  <input
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={8}
                    value={password}
                    placeholder="minimum 8 characters"
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border border-[#343835] bg-[#090a09] px-3 py-3 text-white outline-none placeholder:text-[#414542] focus:border-[#34d399] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
                  />
                </label>
                <div aria-live="polite">
                  {error && (
                    <p className="border-l-2 border-[#f87171] pl-3 text-[#f87171]">! {error}</p>
                  )}
                  {message && (
                    <p className="border-l-2 border-[#34d399] pl-3 text-[#34d399]">● {message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="w-full bg-[#34d399] px-3 py-3 font-bold text-[#07110d] transition hover:bg-[#6ee7b7] disabled:cursor-wait disabled:opacity-50"
                >
                  {busy === "email"
                    ? "○ establishing session..."
                    : mode === "signin"
                      ? "↵ enter apeterm"
                      : "↵ create account"}
                </button>
              </form>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.1em] text-[#555b57]">
            session secured by supabase · no brokerage connection required
          </p>
        </section>
      </div>
    </main>
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
