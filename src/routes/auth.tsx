import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SiteShell, fieldClass } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Owner Sign In | RK Constructions" },
    { name: "description", content: "Sign in to manage inquiries and construction updates." },
    { property: "og:title", content: "Owner Sign In | RK Constructions" },
    { property: "og:description", content: "Owner access for RK Constructions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/dashboard" }); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/dashboard" }); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const res = mode === "in" ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
    setBusy(false);
    if (res.error) setMsg(res.error.message);
    else if (mode === "up" && !res.data.session) setMsg("Check your email to confirm your account, then sign in.");
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r?.error) setMsg(r.error instanceof Error ? r.error.message : "Google sign-in failed.");
  }
  return <SiteShell><div className="mx-auto max-w-[420px] border-t-2 border-primary bg-card p-7 soft-shadow">
    <h1 className="display-title text-4xl text-ink">{mode === "in" ? "Owner sign in" : "Create owner account"}</h1>
    <Button variant="subtle" className="mt-6 h-11 w-full" onClick={google}>Continue with Google</Button>
    <p className="my-4 text-center text-xs text-muted-foreground">or</p>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-bold">Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} /></label>
      <label className="block text-xs font-bold">Password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className={fieldClass} /></label>
      {msg && <p role="alert" className="text-sm text-muted-foreground">{msg}</p>}
      <Button type="submit" disabled={busy} className="h-11 w-full">{mode === "in" ? "Sign in" : "Sign up"}</Button>
    </form>
    <button className="mt-4 text-xs font-bold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</button>
  </div></SiteShell>;
}
