import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { listPublishedPosts } from "@/lib/blog.functions";
import { properties } from "@/lib/properties";

const postsQuery = queryOptions({ queryKey: ["blog", "published"], queryFn: () => listPublishedPosts() });

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [
    { title: "Construction Updates | RK Constructions and Developers" },
    { name: "description", content: "Progress reports, updates and construction milestones from every RK development." },
    { property: "og:title", content: "Construction Updates | RK Constructions" },
    { property: "og:description", content: "Follow progress and milestones across RK developments." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  errorComponent: () => <SiteShell><p>Updates could not load. Please refresh.</p></SiteShell>,
  notFoundComponent: () => <SiteShell><p>Not found.</p></SiteShell>,
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  return <SiteShell>
    <p className="eyebrow mb-3 text-primary">Progress & milestones</p>
    <h1 className="display-title text-5xl text-ink sm:text-6xl">Construction updates</h1>
    {posts.length === 0 ? <p className="mt-10 rounded-md border border-border bg-card p-8 text-sm text-muted-foreground">No updates published yet. Check back soon.</p> :
    <div className="mt-10 divide-y divide-border border-y border-border">{posts.map(post => {
      const property = properties.find(p => p.slug === post.property_slug);
      return <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="group grid gap-2 py-6 sm:grid-cols-[160px_1fr_auto] sm:items-center">
        <span className="text-xs text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}</span>
        <span><span className="flex flex-wrap gap-2 text-[11px] font-bold uppercase text-primary">{property && <span>{property.name}</span>}{post.milestone && <span>· {post.milestone}</span>}</span><span className="display-title mt-1 block text-3xl text-ink group-hover:text-primary">{post.title}</span>{post.excerpt && <span className="mt-1 block text-sm text-muted-foreground">{post.excerpt}</span>}</span>
        <ArrowRight className="size-5 text-primary" />
      </Link>;
    })}</div>}
  </SiteShell>;
}
