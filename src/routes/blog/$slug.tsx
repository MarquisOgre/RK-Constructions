import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getPublishedPost } from "@/lib/blog.functions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { propertiesQuery } from "@/lib/properties.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const [post] = await Promise.all([getPublishedPost({ data: { slug: params.slug } }), context.queryClient.ensureQueryData(propertiesQuery)]);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Update"} | RK Constructions` },
    { name: "description", content: loaderData?.excerpt || "Construction update from RK Constructions and Developers." },
    { property: "og:title", content: loaderData?.title ?? "RK Constructions update" },
    { property: "og:description", content: loaderData?.excerpt || "Construction update from RK Constructions." },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ] }),
  errorComponent: () => <SiteShell><p>This update could not load.</p></SiteShell>,
  notFoundComponent: () => <SiteShell><p>This update was not found.</p><Link to="/blog" className="mt-4 inline-block text-primary">All updates</Link></SiteShell>,
  component: Post,
});

function Post() {
  const post = Route.useLoaderData();
  const { data: properties } = useSuspenseQuery(propertiesQuery);
  const property = properties.find(p => p.slug === post.property_slug);
  return <SiteShell><article className="mx-auto max-w-[760px]">
    <Link to="/blog" className="flex items-center gap-2 text-xs font-bold hover:text-primary"><ArrowLeft className="size-4" /> All updates</Link>
    <p className="eyebrow mt-8 text-primary">{[property?.name, post.milestone].filter(Boolean).join(" · ") || "Update"}</p>
    <h1 className="display-title mt-3 text-5xl text-ink">{post.title}</h1>
    <p className="mt-3 text-xs text-muted-foreground">{post.published_at && new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
    <div className="mt-8 whitespace-pre-line text-base leading-8">{post.content}</div>
    {property && <Link to="/developments/$slug" params={{ slug: property.slug }} className="mt-10 inline-block rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">View {property.name}</Link>}
  </article></SiteShell>;
}
