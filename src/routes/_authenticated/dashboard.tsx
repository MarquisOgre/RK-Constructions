import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, fieldClass } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { properties } from "@/lib/properties";
import { claimOwner, getDashboard, getOwnerStatus, updateInquiryStatus } from "@/lib/admin.functions";
import { deletePost, listAllPosts, savePost } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Owner Dashboard | RK Constructions" },
    { name: "description", content: "Inquiries, recommendations, page views and construction updates." },
    { property: "og:title", content: "Owner Dashboard | RK Constructions" },
    { property: "og:description", content: "Private owner dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Dashboard,
});

const nameOf = (slug: string | null) => properties.find(p => p.slug === slug)?.name ?? slug ?? "—";
const when = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const statusFn = useServerFn(getOwnerStatus);
  const claimFn = useServerFn(claimOwner);
  const status = useQuery({ queryKey: ["owner-status"], queryFn: () => statusFn() });
  const signOut = async () => { await supabase.auth.signOut(); qc.clear(); navigate({ to: "/auth" }); };
  if (status.isPending) return <SiteShell><p>Loading…</p></SiteShell>;
  if (status.isError) return <SiteShell><p className="text-destructive">Could not load your account.</p></SiteShell>;
  if (!status.data.isAdmin) return <SiteShell><div className="max-w-[520px]">
    <h1 className="display-title text-4xl text-ink">Owner access</h1>
    {status.data.canClaim ? <><p className="mt-3 text-sm text-muted-foreground">No owner is set up yet. Make this account the owner to see inquiries and write updates.</p><Button className="mt-5" onClick={async () => { await claimFn(); qc.invalidateQueries({ queryKey: ["owner-status"] }); }}>Make me the owner</Button></>
      : <p className="mt-3 text-sm text-muted-foreground">This account doesn't have owner access.</p>}
    <Button variant="subtle" className="ml-3 mt-5" onClick={signOut}>Sign out</Button>
  </div></SiteShell>;
  return <SiteShell><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><h1 className="display-title text-5xl text-ink">Dashboard</h1><Button variant="subtle" onClick={signOut}>Sign out</Button></div><Overview /><Posts /></SiteShell>;
}

function Overview() {
  const qc = useQueryClient();
  const fn = useServerFn(getDashboard);
  const upd = useServerFn(updateInquiryStatus);
  const [tab, setTab] = useState<"callbacks" | "messages" | "recs" | "views">("messages");
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  if (q.isPending) return <p>Loading data…</p>;
  if (q.isError) return <p className="text-destructive">Could not load dashboard data.</p>;
  const d = q.data;
  const setStatus = async (kind: "callback" | "message", id: string, status: string) => { await upd({ data: { kind, id, status: status as "new" }}); qc.invalidateQueries({ queryKey: ["dashboard"] }); };
  const sel = (kind: "callback" | "message", id: string, v: string) => <select value={v} onChange={e => setStatus(kind, id, e.target.value)} className="rounded-md border border-input bg-card px-2 py-1 text-xs"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>;
  const stats = [["Website messages", d.messages.length, "messages"], ["Callback requests", d.callbacks.length, "callbacks"], ["Recommendations", d.recommendations.length, "recs"], ["Property page views", d.totalViews, "views"]] as const;
  const th = "px-3 py-2 text-left text-[11px] font-bold uppercase text-muted-foreground";
  const td = "px-3 py-3 align-top text-sm";
  return <section>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="display-title text-3xl text-ink">Inbox</h2><Button variant="subtle" size="icon" aria-label="Refresh inbox" title="Refresh inbox" onClick={() => qc.invalidateQueries({ queryKey: ["dashboard"] })}><RefreshCw className="size-4" /></Button></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, n, key]) => <Button key={key} variant="subtle" onClick={() => setTab(key)} className={`h-auto min-h-24 flex-col items-start justify-center rounded-sm border-t-2 p-5 text-left soft-shadow ${tab === key ? "border-primary" : "border-border"}`}><span className="w-full text-xs text-muted-foreground">{label}</span><span className="mt-1 w-full text-3xl font-extrabold">{n}</span></Button>)}</div>
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
      {tab === "callbacks" && <table className="w-full"><thead><tr><th className={th}>Received</th><th className={th}>Property</th><th className={th}>Buyer</th><th className={th}>Preferred time</th><th className={th}>Message</th><th className={th}>Status</th></tr></thead><tbody className="divide-y divide-border">{d.callbacks.map(r => <tr key={r.id}><td className={td}>{when(r.created_at)}</td><td className={td}>{nameOf(r.property_slug)}</td><td className={td}><b>{r.name}</b><br /><a href={`tel:${r.phone}`} className="text-primary">{r.phone}</a>{r.email && <><br /><a href={`mailto:${r.email}`} className="text-primary">{r.email}</a></>}</td><td className={td}>{r.preferred_time}</td><td className={td}>{r.message ?? "—"}</td><td className={td}>{sel("callback", r.id, r.status)}</td></tr>)}</tbody></table>}
      {tab === "messages" && (d.messages.length ? <table className="w-full"><thead><tr><th className={th}>Received</th><th className={th}>From</th><th className={th}>Message</th><th className={th}>Status</th></tr></thead><tbody className="divide-y divide-border">{d.messages.map(r => <tr key={r.id}><td className={td}>{when(r.created_at)}</td><td className={td}><b>{r.name}</b><br /><a href={`mailto:${r.email}`} className="text-primary">{r.email}</a>{r.phone && <><br /><a href={`tel:${r.phone}`} className="text-primary">{r.phone}</a></>}</td><td className={td}>{r.message}</td><td className={td}>{sel("message", r.id, r.status)}</td></tr>)}</tbody></table> : <p className="p-6 text-sm text-muted-foreground">No website messages yet.</p>)}
      {tab === "recs" && <table className="w-full"><thead><tr><th className={th}>When</th><th className={th}>Budget</th><th className={th}>Location</th><th className={th}>Lifestyle</th><th className={th}>Recommended</th></tr></thead><tbody className="divide-y divide-border">{d.recommendations.map(r => <tr key={r.id}><td className={td}>{when(r.created_at)}</td><td className={td}>{r.budget}</td><td className={td}>{r.location}</td><td className={td}>{r.lifestyle}</td><td className={td}>{r.recommended_slugs.map(nameOf).join(", ") || "No match"}</td></tr>)}</tbody></table>}
      {tab === "views" && <table className="w-full"><thead><tr><th className={th}>Development</th><th className={th}>Page views</th></tr></thead><tbody className="divide-y divide-border">{properties.map(p => <tr key={p.slug}><td className={td}>{p.name}</td><td className={td}>{d.viewCounts[p.slug] ?? 0}</td></tr>)}</tbody></table>}
    </div>
  </section>;
}

type Draft = { id: string | null; title: string; excerpt: string; content: string; propertySlug: string | null; milestone: string | null; published: boolean };
const empty: Draft = { id: null, title: "", excerpt: "", content: "", propertySlug: null, milestone: null, published: true };

function Posts() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllPosts);
  const saveFn = useServerFn(savePost);
  const delFn = useServerFn(deletePost);
  const q = useQuery({ queryKey: ["posts-admin"], queryFn: () => listFn() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["posts-admin"] }); qc.invalidateQueries({ queryKey: ["blog"] }); };
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!draft) return; setErr("");
    try { await saveFn({ data: draft }); setDraft(null); refresh(); } catch (c) { setErr(c instanceof Error ? c.message : "Could not save."); }
  }
  return <section className="mt-14">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="display-title text-4xl text-ink">Construction updates</h2><Button onClick={() => setDraft({ ...empty })}>New article</Button></div>
    {draft && <form onSubmit={submit} className="mt-5 grid gap-4 border-t-2 border-primary bg-card p-5 soft-shadow sm:grid-cols-2">
      <label className="text-xs font-bold sm:col-span-2">Title<input required minLength={3} maxLength={200} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className={fieldClass} /></label>
      <label className="text-xs font-bold">Development<select value={draft.propertySlug ?? ""} onChange={e => setDraft({ ...draft, propertySlug: e.target.value || null })} className={fieldClass}><option value="">General</option>{properties.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
      <label className="text-xs font-bold">Milestone (optional)<input maxLength={100} value={draft.milestone ?? ""} onChange={e => setDraft({ ...draft, milestone: e.target.value || null })} placeholder="e.g. Foundation complete" className={fieldClass} /></label>
      <label className="text-xs font-bold sm:col-span-2">Short summary<input maxLength={400} value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} className={fieldClass} /></label>
      <label className="text-xs font-bold sm:col-span-2">Article<textarea required minLength={10} maxLength={20000} rows={8} value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })} /> Publish on the website</label>
      {err && <p role="alert" className="text-sm text-destructive sm:col-span-2">{err}</p>}
      <div className="flex gap-2 sm:col-span-2"><Button type="submit">Save article</Button><Button type="button" variant="subtle" onClick={() => setDraft(null)}>Cancel</Button></div>
    </form>}
    <div className="mt-5 divide-y divide-border border-y border-border">{q.data?.length === 0 && <p className="py-5 text-sm text-muted-foreground">No articles yet.</p>}{q.data?.map(p => <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div><p className="font-bold">{p.title}</p><p className="text-xs text-muted-foreground">{nameOf(p.property_slug)} · {p.published ? "Published" : "Draft"}</p></div>
      <div className="flex gap-2">{p.published && <Button asChild variant="subtle" size="sm"><Link to="/blog/$slug" params={{ slug: p.slug }}>View</Link></Button>}<Button variant="subtle" size="sm" onClick={() => setDraft({ id: p.id, title: p.title, excerpt: p.excerpt, content: p.content, propertySlug: p.property_slug, milestone: p.milestone, published: p.published })}>Edit</Button><Button variant="subtle" size="sm" onClick={async () => { if (confirm("Delete this article?")) { await delFn({ data: { id: p.id } }); refresh(); } }}>Delete</Button></div>
    </div>)}</div>
  </section>;
}
