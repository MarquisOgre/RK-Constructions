import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, fieldClass } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { claimOwner, getDashboard, getOwnerStatus, listReplies, replyToInquiry, updateInquiryStatus } from "@/lib/admin.functions";
import { deletePost, listAllPosts, savePost } from "@/lib/blog.functions";
import { deleteProperty, listAllPropertyRows, saveProperty } from "@/lib/properties.functions";
import type { PropertyRow } from "@/lib/properties";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Owner Dashboard | RK Constructions" },
    { name: "description", content: "Inquiries, recommendations, page views, developments and construction updates." },
    { property: "og:title", content: "Owner Dashboard | RK Constructions" },
    { property: "og:description", content: "Private owner dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Dashboard,
});

const when = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function useProps() {
  const fn = useServerFn(listAllPropertyRows);
  const q = useQuery({ queryKey: ["properties-admin"], queryFn: () => fn() });
  const rows = q.data ?? [];
  const nameOf = (slug: string | null) => rows.find(p => p.slug === slug)?.name ?? slug ?? "General";
  return { q, rows, nameOf };
}

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
  return <SiteShell><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><h1 className="display-title text-5xl text-ink">Dashboard</h1><Button variant="subtle" onClick={signOut}>Sign out</Button></div><Overview /><Developments /><Posts /></SiteShell>;
}

type Inquiry = { kind: "callback" | "message"; id: string; created_at: string; name: string; phone: string | null; email: string | null; message: string | null; status: string; property_slug: string | null; preferred_time: string | null };

function Overview() {
  const qc = useQueryClient();
  const fn = useServerFn(getDashboard);
  const repliesFn = useServerFn(listReplies);
  const { nameOf, rows } = useProps();
  const [tab, setTab] = useState<"inbox" | "recs" | "views">("inbox");
  const [filter, setFilter] = useState("open");
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  const replies = useQuery({ queryKey: ["replies"], queryFn: () => repliesFn() });
  if (q.isPending) return <p>Loading data…</p>;
  if (q.isError) return <p className="text-destructive">Could not load dashboard data.</p>;
  const d = q.data;
  const inbox: Inquiry[] = [
    ...d.callbacks.map(r => ({ kind: "callback" as const, id: r.id, created_at: r.created_at, name: r.name, phone: r.phone, email: r.email, message: r.message, status: r.status, property_slug: r.property_slug, preferred_time: r.preferred_time })),
    ...d.messages.map(r => ({ kind: "message" as const, id: r.id, created_at: r.created_at, name: r.name, phone: r.phone, email: r.email, message: r.message, status: r.status, property_slug: null, preferred_time: null })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at)).filter(i => filter === "all" || (filter === "open" ? i.status !== "closed" : i.status === filter));
  const stats = [["Inquiries", d.callbacks.length + d.messages.length, "inbox"], ["Recommendations", d.recommendations.length, "recs"], ["Property page views", d.totalViews, "views"]] as const;
  const th = "px-3 py-2 text-left text-[11px] font-bold uppercase text-muted-foreground";
  const td = "px-3 py-3 align-top text-sm";
  return <section>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="display-title text-3xl text-ink">Inbox</h2><Button variant="subtle" size="icon" aria-label="Refresh inbox" title="Refresh inbox" onClick={() => { qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["replies"] }); }}><RefreshCw className="size-4" /></Button></div>
    <div className="grid gap-3 sm:grid-cols-3">{stats.map(([label, n, key]) => <Button key={key} variant="subtle" onClick={() => setTab(key)} className={`h-auto min-h-24 flex-col items-start justify-center rounded-sm border-t-2 p-5 text-left soft-shadow ${tab === key ? "border-primary" : "border-border"}`}><span className="w-full text-xs text-muted-foreground">{label}</span><span className="mt-1 w-full text-3xl font-extrabold">{n}</span></Button>)}</div>
    {tab === "inbox" && <div className="mt-6">
      <div className="mb-3 flex flex-wrap gap-2">{([["open", "Open"], ["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"], ["all", "All"]] as const).map(([v, l]) => <Button key={v} size="sm" variant={filter === v ? "default" : "subtle"} onClick={() => setFilter(v)}>{l}</Button>)}</div>
      {inbox.length === 0 ? <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">No inquiries here yet.</p>
        : <div className="space-y-4">{inbox.map(i => <InquiryCard key={i.id} item={i} propertyName={i.kind === "callback" ? nameOf(i.property_slug) : "General enquiry (contact page)"} replies={(replies.data ?? []).filter(r => r.inquiry_id === i.id)} />)}</div>}
    </div>}
    {tab !== "inbox" && <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
      {tab === "recs" && <table className="w-full"><thead><tr><th className={th}>When</th><th className={th}>Budget</th><th className={th}>Location</th><th className={th}>Lifestyle</th><th className={th}>Recommended</th></tr></thead><tbody className="divide-y divide-border">{d.recommendations.map(r => <tr key={r.id}><td className={td}>{when(r.created_at)}</td><td className={td}>{r.budget}</td><td className={td}>{r.location}</td><td className={td}>{r.lifestyle}</td><td className={td}>{r.recommended_slugs.map(nameOf).join(", ") || "No match"}</td></tr>)}</tbody></table>}
      {tab === "views" && <table className="w-full"><thead><tr><th className={th}>Development</th><th className={th}>Page views</th></tr></thead><tbody className="divide-y divide-border">{rows.map(p => <tr key={p.slug}><td className={td}>{p.name}</td><td className={td}>{d.viewCounts[p.slug] ?? 0}</td></tr>)}</tbody></table>}
    </div>}
  </section>;
}

function InquiryCard({ item, propertyName, replies }: { item: Inquiry; propertyName: string; replies: { id: string; body: string; created_at: string; sent_to: string; delivery: string }[] }) {
  const qc = useQueryClient();
  const upd = useServerFn(updateInquiryStatus);
  const reply = useServerFn(replyToInquiry);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const setStatus = async (status: string) => { await upd({ data: { kind: item.kind, id: item.id, status: status as "new" } }); qc.invalidateQueries({ queryKey: ["dashboard"] }); };
  async function send(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNote("");
    try {
      const r = await reply({ data: { kind: item.kind, id: item.id, body } });
      setBody(""); setNote(r.delivery === "sent" ? "Reply emailed to the buyer." : "Reply saved. Emails will send automatically once your email domain is verified.");
      qc.invalidateQueries({ queryKey: ["replies"] }); qc.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (c) { setNote(c instanceof Error ? c.message : "Could not send the reply."); }
    finally { setBusy(false); }
  }
  return <article className="rounded-lg border border-border bg-card p-5 soft-shadow">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-[11px] font-bold uppercase text-primary">{item.kind === "callback" ? "Callback request" : "Website message"} · {propertyName}</p><p className="mt-1 text-lg font-extrabold">{item.name}</p>
        <p className="mt-1 flex flex-wrap gap-x-4 text-sm">{item.phone && <a href={`tel:${item.phone}`} className="text-primary">{item.phone}</a>}{item.email ? <a href={`mailto:${item.email}`} className="text-primary">{item.email}</a> : <span className="text-muted-foreground">No email given</span>}{item.preferred_time && <span className="text-muted-foreground">Prefers: {item.preferred_time}</span>}</p></div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{when(item.created_at)}<select aria-label="Status" value={item.status} onChange={e => setStatus(e.target.value)} className="rounded-md border border-input bg-card px-2 py-1 text-xs"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div>
    </div>
    {item.message && <p className="mt-3 whitespace-pre-line rounded-md bg-secondary p-3 text-sm">{item.message}</p>}
    {replies.length > 0 && <div className="mt-3 space-y-2">{replies.map(r => <div key={r.id} className="border-l-2 border-primary pl-3 text-sm"><p className="text-[11px] text-muted-foreground">You replied · {when(r.created_at)} · {r.delivery === "sent" ? `emailed to ${r.sent_to}` : r.delivery === "failed" ? "email failed" : "saved, not emailed"}</p><p className="whitespace-pre-line">{r.body}</p></div>)}</div>}
    {item.email && <form onSubmit={send} className="mt-4"><label className="text-xs font-bold">Reply to {item.name}<textarea required minLength={2} maxLength={5000} rows={3} value={body} onChange={e => setBody(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Write your reply…" /></label><div className="mt-2 flex flex-wrap items-center gap-3"><Button type="submit" size="sm" disabled={busy}>{busy ? "Sending…" : "Send reply"}</Button>{note && <p role="status" className="text-xs text-muted-foreground">{note}</p>}</div></form>}
  </article>;
}

const emptyProp = { isNew: true, slug: "", name: "", detail: "", location: "", price: "", price_lakhs: 0, category: "Residential" as const, badge: "", status: "", units: "", amenities: "", specifications: "", image_url: "", published: true, sort_order: 100 };
type PropDraft = Omit<typeof emptyProp, "category"> & { category: "Residential" | "Commercial" | "Plots" };
const lines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

function Developments() {
  const qc = useQueryClient();
  const { q, rows } = useProps();
  const saveFn = useServerFn(saveProperty);
  const delFn = useServerFn(deleteProperty);
  const [draft, setDraft] = useState<PropDraft | null>(null);
  const [err, setErr] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["properties-admin"] }); qc.invalidateQueries({ queryKey: ["properties"] }); };
  const edit = (p: PropertyRow) => setDraft({ isNew: false, slug: p.slug, name: p.name, detail: p.detail, location: p.location, price: p.price, price_lakhs: Number(p.price_lakhs), category: (["Residential", "Commercial", "Plots"].includes(p.category) ? p.category : "Residential") as PropDraft["category"], badge: p.badge, status: p.status, units: p.units.join("\n"), amenities: p.amenities.join("\n"), specifications: p.specifications.join("\n"), image_url: p.image_url ?? "", published: p.published, sort_order: p.sort_order });
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!draft) return; setErr("");
    try { await saveFn({ data: { ...draft, units: lines(draft.units), amenities: lines(draft.amenities), specifications: lines(draft.specifications) } }); setDraft(null); refresh(); }
    catch (c) { setErr(c instanceof Error ? c.message : "Could not save."); }
  }
  const f = (k: keyof PropDraft, label: string, extra: Record<string, unknown> = {}) => <label className="text-xs font-bold">{label}<input value={String(draft![k])} onChange={e => setDraft({ ...draft!, [k]: extra["type"] === "number" ? Number(e.target.value) : e.target.value })} className={fieldClass} {...extra} /></label>;
  const ta = (k: "units" | "amenities" | "specifications", label: string) => <label className="text-xs font-bold">{label} (one per line)<textarea rows={4} value={draft![k]} onChange={e => setDraft({ ...draft!, [k]: e.target.value })} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>;
  return <section className="mt-14">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="display-title text-4xl text-ink">Developments</h2><p className="text-sm text-muted-foreground">These listings appear on the website and are what the AI recommends from.</p></div><Button onClick={() => setDraft({ ...emptyProp })}>Add development</Button></div>
    {draft && <form onSubmit={submit} className="mt-5 grid gap-4 border-t-2 border-primary bg-card p-5 soft-shadow sm:grid-cols-2">
      {f("name", "Name", { required: true, minLength: 2, maxLength: 120 })}
      {f("slug", "Web address (e.g. rk-lake-view)", { required: true, pattern: "[a-z0-9\\-]{2,80}", disabled: !draft.isNew })}
      {f("detail", "Short description (e.g. 2 & 3 BHK Apartments)", { maxLength: 200 })}
      {f("location", "City / location", { required: true, maxLength: 100 })}
      {f("price", "Price shown (e.g. ₹75 Lakhs)", { required: true, maxLength: 50 })}
      {f("price_lakhs", "Starting price in lakhs (number)", { type: "number", min: 0, step: "any", required: true })}
      <label className="text-xs font-bold">Category<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as PropDraft["category"] })} className={fieldClass}><option>Residential</option><option>Commercial</option><option>Plots</option></select></label>
      {f("badge", "Badge (e.g. New Launch)", { maxLength: 40 })}
      <label className="text-xs font-bold">Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })} className={fieldClass}><option value="">—</option><option>New Launch</option><option>Ready to Move</option><option>Luxury Homes</option><option>Commercial</option><option>Under Construction</option></select></label>
      {f("image_url", "Photo link (https, optional)", { type: "url", maxLength: 1000 })}
      {ta("units", "Unit types")}{ta("amenities", "Amenities")}{ta("specifications", "Specifications")}
      {f("sort_order", "Display order", { type: "number", min: 0, max: 10000 })}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })} /> Show on the website</label>
      {err && <p role="alert" className="text-sm text-destructive sm:col-span-2">{err}</p>}
      <div className="flex gap-2 sm:col-span-2"><Button type="submit">Save development</Button><Button type="button" variant="subtle" onClick={() => setDraft(null)}>Cancel</Button></div>
    </form>}
    <div className="mt-5 divide-y divide-border border-y border-border">{q.isPending && <p className="py-5 text-sm">Loading…</p>}{rows.map(p => <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div><p className="font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{p.location} · {p.price} · {p.published ? "Live" : "Hidden"}</p></div>
      <div className="flex gap-2">{p.published && <Button asChild variant="subtle" size="sm"><Link to="/developments/$slug" params={{ slug: p.slug }}>View</Link></Button>}<Button variant="subtle" size="sm" onClick={() => edit(p)}>Edit</Button><Button variant="subtle" size="sm" onClick={async () => { if (confirm(`Delete ${p.name}?`)) { await delFn({ data: { slug: p.slug } }); refresh(); } }}>Delete</Button></div>
    </div>)}</div>
  </section>;
}

type Draft = { id: string | null; title: string; excerpt: string; content: string; propertySlug: string | null; milestone: string | null; published: boolean };
const empty: Draft = { id: null, title: "", excerpt: "", content: "", propertySlug: null, milestone: null, published: true };

function Posts() {
  const qc = useQueryClient();
  const { rows, nameOf } = useProps();
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
      <label className="text-xs font-bold">Development<select value={draft.propertySlug ?? ""} onChange={e => setDraft({ ...draft, propertySlug: e.target.value || null })} className={fieldClass}><option value="">General</option>{rows.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
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
