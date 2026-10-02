import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { trackPropertyView } from "@/lib/views.functions";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/rk-constructions-logo.png.asset.json";
import { propertiesQuery } from "@/lib/properties.functions";
import { listPublishedPosts } from "@/lib/blog.functions";
import { requestCallback } from "@/lib/callback.functions";

export const Route = createFileRoute("/developments/$slug")({
  loader: async ({ params, context }) => {
    const [all, posts] = await Promise.all([context.queryClient.ensureQueryData(propertiesQuery), listPublishedPosts()]);
    const property = all.find(item => item.slug === params.slug);
    if (!property) throw notFound();
    return { ...property, updates: posts.filter(p => p.property_slug === property.slug).slice(0, 4) };
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Development"} | RK Constructions and Developers` },
    { name: "description", content: `Explore ${loaderData?.name ?? "our development"} in ${loaderData?.location ?? "India"}: homes, amenities, specifications, progress updates and gallery.` },
    { property: "og:title", content: `${loaderData?.name ?? "Development"} | RK Constructions and Developers` },
    { property: "og:description", content: `Explore ${loaderData?.name ?? "our development"} in ${loaderData?.location ?? "India"} and request a callback.` },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  notFoundComponent: () => <div className="p-10 text-center"><p>This development was not found.</p><Link to="/" className="text-primary">All projects</Link></div>,
  component: Development,
});

function Development() {
  const property = Route.useLoaderData();
  const [photo, setPhoto] = useState(0);
  useEffect(() => { trackPropertyView({ data: { slug: property.slug } }).catch(() => {}); }, [property.slug]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true); setError("");
    try {
      await requestCallback({ data: { slug: property.slug, name: String(fields.get("name") ?? ""), phone: String(fields.get("phone") ?? ""), email: String(fields.get("email") ?? ""), preferredTime: String(fields.get("preferredTime") ?? ""), message: String(fields.get("message") ?? ""), website: String(fields.get("website") ?? "") } });
      setSent(true); form.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not submit your request. Please try again."); }
    finally { setSending(false); }
  }
  const inputClass = "mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-5 py-3 lg:px-9"><Link to="/" aria-label="RK Constructions home"><img src={logo.url} alt="RK Constructions and Developers" className="h-[52px] w-[172px] object-contain object-left" /></Link><Link to="/" className="flex items-center gap-2 text-xs font-bold hover:text-primary"><ArrowLeft className="size-4" /> All projects</Link></div></header>
    <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-9 lg:py-12">
      <div className="mb-8"><p className="eyebrow mb-3 text-primary">{property.badge} · {property.category}</p><h1 className="display-title text-5xl text-ink sm:text-6xl">{property.name}</h1><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 text-primary" />{property.location} <span className="mx-2">·</span> {property.detail}</p></div>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(310px,.6fr)]">
        <section aria-label="Photo gallery"><div className="relative overflow-hidden rounded-lg bg-secondary"><img src={property.gallery[photo]?.src ?? property.image} alt={property.gallery[photo]?.alt ?? property.name} className="aspect-[1.5] w-full object-cover" /><div className="absolute bottom-3 right-3 rounded-md bg-ink px-3 py-1 text-xs text-ink-foreground">{photo + 1} / {property.gallery.length}</div></div><div className="mt-3 grid grid-cols-3 gap-3">{property.gallery.map((image, index) => <Button type="button" variant="ghost" key={image.alt} className={`h-auto overflow-hidden p-0 ${photo === index ? "ring-2 ring-primary" : ""}`} onClick={() => setPhoto(index)} aria-label={`Show photo ${index + 1}`}><img src={image.src} alt={image.alt} className="aspect-[1.6] w-full object-cover" /></Button>)}</div><p className="mt-3 text-xs text-muted-foreground">Images are illustrative, not verified photographs of the finished development.</p></section>
        <aside className="h-fit border-t-2 border-primary bg-card p-5 soft-shadow lg:p-7"><p className="eyebrow text-muted-foreground">Indicative starting price</p><p className="mt-3 text-3xl font-extrabold text-ink">{property.price}</p><p className="mt-2 text-xs text-muted-foreground">Pricing and unit availability must be confirmed with the developer.</p><a href="#callback" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">Request a callback <ArrowRight className="size-4" /></a></aside>
      </div>
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]"><div className="space-y-11">
        <section><p className="eyebrow mb-3 text-primary">The development</p><h2 className="display-title text-4xl text-ink">Location & living</h2><p className="mt-5 max-w-[650px] text-sm leading-7 text-muted-foreground">Explore {property.detail.toLowerCase()} in {property.location}. The information below is an illustrative overview; ask for the latest floor plans, exact address, pricing, and availability when you request a callback.</p></section>
        <section><h2 className="display-title text-4xl text-ink">Available unit types</h2><div className="mt-5 divide-y divide-border border-y border-border">{property.units.map(unit => <div key={unit} className="flex items-center justify-between py-4 text-sm font-semibold"><span>{unit}</span><span className="text-xs font-normal text-muted-foreground">Enquire for availability</span></div>)}</div></section>
        <section><h2 className="display-title text-4xl text-ink">Amenities</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities.map(item => <p key={item} className="flex items-center gap-3 border-b border-border py-3 text-sm"><Check className="size-4 shrink-0 text-primary" />{item}</p>)}</div></section>
        <section><h2 className="display-title text-4xl text-ink">Specifications</h2><div className="mt-5 divide-y divide-border border-y border-border">{property.specifications.map(item => <p key={item} className="py-4 text-sm">{item}</p>)}</div><p className="mt-3 text-xs text-muted-foreground">Concept details are indicative. Request official specifications before making a decision.</p></section>
        <section><div className="flex items-end justify-between gap-3"><h2 className="display-title text-4xl text-ink">Progress updates</h2><Link to="/blog" className="text-xs font-bold text-primary">All updates</Link></div>{property.updates.length ? <div className="mt-5 divide-y divide-border border-y border-border">{property.updates.map(u => <Link key={u.id} to="/blog/$slug" params={{ slug: u.slug }} className="group flex items-center justify-between gap-3 py-4"><span><span className="block text-[11px] font-bold uppercase text-primary">{u.milestone ?? "Update"}{u.published_at && ` · ${new Date(u.published_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}`}</span><span className="mt-1 block font-semibold group-hover:text-primary">{u.title}</span></span><ArrowRight className="size-4 shrink-0 text-primary" /></Link>)}</div> : <p className="mt-5 text-sm text-muted-foreground">No progress updates yet.</p>}</section>
      </div><section id="callback" className="scroll-mt-8"><div className="border-t-2 border-primary bg-card p-5 soft-shadow sm:p-7"><p className="eyebrow mb-3 text-primary">Let's talk</p><h2 className="display-title text-4xl text-ink">Request a callback</h2><p className="mt-3 text-sm text-muted-foreground">Ask about {property.name}. Your details are kept private and used for this request.</p>{sent ? <div role="status" className="mt-6 rounded-md bg-secondary p-5"><p className="font-bold">Request received</p><p className="mt-2 text-sm text-muted-foreground">Thank you. Your callback request for {property.name} has been saved.</p><Button variant="subtle" className="mt-4" onClick={() => setSent(false)}>Send another request</Button></div> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-xs font-bold">Name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} /></label><label className="block text-xs font-bold">Phone number<input name="phone" required type="tel" minLength={7} maxLength={20} autoComplete="tel" className={inputClass} /></label><label className="block text-xs font-bold">Email (optional)<input name="email" type="email" autoComplete="email" className={inputClass} /></label><label className="block text-xs font-bold">Preferred callback time<select name="preferredTime" required className={inputClass}><option value="">Select a time</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select></label><label className="block text-xs font-bold">Message (optional)<textarea name="message" maxLength={1000} rows={3} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={sending} className="h-11 w-full">{sending ? "Sending…" : "Request callback"} <ArrowRight /></Button></form>}</div></section></div>
    </main><footer className="mt-16 bg-ink px-5 py-7 text-center text-xs text-ink-foreground">© {new Date().getFullYear()} RK Constructions and Developers</footer>
  </div>;
}