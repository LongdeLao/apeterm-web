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
    <main className="min-h-screen bg-[#080808] px-4 py-6 font-sans text-[#f4f4f4] sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-[#242424] bg-[#101010] p-2 shadow-[0_32px_100px_rgba(0,0,0,0.45)] lg:min-h-[720px] lg:grid-cols-[1.04fr_0.96fr]">
        <section className="flex min-h-[650px] flex-col px-6 py-7 sm:px-12 sm:py-10 lg:px-16">
          <header className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em]">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ededed] font-mono text-[12px] font-bold text-[#111]">
              A
            </span>
            apeterm
          </header>

          <div className="my-auto w-full max-w-[430px] py-14">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-3 max-w-[390px] text-[14px] leading-6 text-[#929292]">
              {mode === "signin"
                ? "Sign in to access your market workspace."
                : "One account for your watchlists, notes and ApeTerm agent."}
            </p>

            <form onSubmit={submit} className="mt-9 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-[#d2d2d2]">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-lg border border-transparent bg-[#202020] px-4 text-[14px] text-white outline-none transition placeholder:text-[#686868] focus:border-[#505050] focus:bg-[#242424]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-[#d2d2d2]">Password</span>
                <input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  placeholder={mode === "signin" ? "Enter your password" : "Minimum 8 characters"}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-lg border border-transparent bg-[#202020] px-4 text-[14px] text-white outline-none transition placeholder:text-[#686868] focus:border-[#505050] focus:bg-[#242424]"
                />
              </label>

              <div aria-live="polite">
                {error && <p className="text-[13px] text-[#f87171]">{error}</p>}
                {message && <p className="text-[13px] text-[#6ee7b7]">{message}</p>}
              </div>

              <button
                type="submit"
                disabled={busy !== null}
                className="h-12 w-full rounded-lg bg-[#ededed] text-[14px] font-semibold text-[#111] transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
              >
                {busy === "email"
                  ? "Connecting..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4 text-[12px] text-[#686868]">
              <span className="h-px flex-1 bg-[#2d2d2d]" />
              or
              <span className="h-px flex-1 bg-[#2d2d2d]" />
            </div>

            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={busy !== null}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#303030] bg-[#181818] text-[14px] font-medium text-[#e5e5e5] transition hover:border-[#484848] hover:bg-[#1d1d1d] disabled:cursor-wait disabled:opacity-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[#222]">
                G
              </span>
              {busy === "google" ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="mt-8 text-center text-[13px] text-[#777]">
              {mode === "signin" ? "New to ApeTerm?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError("");
                  setMessage("");
                }}
                className="font-medium text-[#e8e8e8] hover:text-white"
              >
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-[11px] text-[#555]">Secure authentication by Supabase</p>
        </section>

        <aside className="relative hidden overflow-hidden rounded-xl border border-[#292929] bg-[#151515] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(145deg,#111_8%,#191919_45%,#3d453f_100%)]" />
          <div className="absolute -right-24 -top-20 h-[380px] w-[520px] rotate-[42deg] rounded-[88px] border border-white/[0.06] bg-black/30 shadow-2xl" />
          <div className="absolute -right-20 top-24 h-[340px] w-[440px] rotate-[42deg] rounded-[72px] border border-white/[0.05] bg-white/[0.025]" />
          <div className="absolute -bottom-32 -left-32 h-[520px] w-[680px] rounded-full bg-[#bba07a]/45 blur-[80px]" />
          <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-white/10 bg-black/35 p-6 backdrop-blur-md">
            <p className="text-[12px] font-medium text-[#d0d0d0]">
              MARKET INTELLIGENCE, WITHOUT THE NOISE
            </p>
            <p className="mt-4 text-lg leading-7 text-white">
              News, filings, live prices and your research agent in one focused workspace.
            </p>
            <div className="mt-6 flex items-center justify-between text-[12px] text-[#a8a8a8]">
              <span>ApeTerm</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7b7]" />
                live
              </span>
            </div>
          </div>
        </aside>
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
