import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { propertiesQuery } from "@/lib/properties.functions";
import { recommendProperties } from "@/lib/recommendations.functions";

const search = z.object({ budget: z.string().catch(""), location: z.string().catch(""), lifestyle: z.string().catch("") });

export const Route = createFileRoute("/results")({
  validateSearch: search,
  head: () => ({ meta: [
    { title: "Your Property Matches | RK Constructions" },
    { name: "description", content: "Developments suggested for your budget, location and lifestyle." },
    { property: "og:title", content: "Your Property Matches | RK Constructions" },
    { property: "og:description", content: "Personalised development suggestions from RK Constructions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQuery),
  component: Results,
});

function Results() {
  const prefs = Route.useSearch();
  const { data: properties } = useSuspenseQuery(propertiesQuery);
  const valid = prefs.budget.trim() && prefs.location.trim() && prefs.lifestyle.trim().length >= 3;
  const q = useQuery({
    queryKey: ["recommend", prefs], enabled: !!valid, staleTime: Infinity, retry: false,
    queryFn: () => recommendProperties({ data: prefs }),
  });
  return <SiteShell>
    <p className="eyebrow mb-3 text-primary">Your matches</p>
    <h1 className="display-title text-5xl text-ink sm:text-6xl">Recommended for you</h1>
    {valid && <p className="mt-4 text-sm text-muted-foreground">Budget: <b>{prefs.budget}</b> · Location: <b>{prefs.location}</b> · Needs: {prefs.lifestyle}</p>}
    <p className="mt-2 text-xs text-muted-foreground">Matched by AI against our current listings. Confirm pricing and availability with our team.</p>
    <div className="mt-10">
      {!valid ? <p className="text-sm">Tell us your budget, location and lifestyle first. <Link to="/" hash="recommend" className="font-bold text-primary">Start here</Link></p>
      : q.isPending ? <p className="flex items-center gap-2 text-sm" role="status"><Sparkles className="size-4 animate-pulse text-primary" /> Finding your best matches…</p>
      : q.isError ? <p role="alert" className="text-sm text-destructive">{q.error instanceof Error ? q.error.message : "Recommendations are unavailable right now."}</p>
      : q.data.length === 0 ? <p className="rounded-md border border-border bg-card p-6 text-sm">No close matches in our showcased developments. <Link to="/" hash="recommend" className="font-bold text-primary">Try different preferences</Link></p>
      : <div className="grid gap-5 md:grid-cols-3">{q.data.map(item => { const p = properties.find(x => x.slug === item.slug); return p ? <Link key={p.slug} to="/developments/$slug" params={{ slug: p.slug }} className="overflow-hidden rounded-lg border border-border bg-card soft-shadow hover:border-primary">
          <img src={p.image} alt={p.name} className="aspect-[1.5] w-full object-cover" />
          <div className="p-5"><h2 className="text-lg font-extrabold">{p.name}</h2><p className="text-xs text-muted-foreground">{p.location} · {p.price}</p><p className="mt-3 text-sm leading-6">{item.reason}</p><span className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">View development <ArrowRight className="size-3.5" /></span></div>
        </Link> : null; })}</div>}
    </div>
  </SiteShell>;
}
