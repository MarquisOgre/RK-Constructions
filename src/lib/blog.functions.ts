import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const cols = "id, slug, title, excerpt, content, property_slug, milestone, published, published_at, created_at";

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./public-client.server");
  const { data, error } = await createPublicClient().from("blog_posts").select(cols).eq("published", true).order("published_at", { ascending: false });
  if (error) return [];
  return data ?? [];
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./public-client.server");
    const { data: post } = await createPublicClient().from("blog_posts").select(cols).eq("slug", data.slug).eq("published", true).maybeSingle();
    return post ?? null;
  });

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("blog_posts").select(cols).order("created_at", { ascending: false });
    if (error) throw new Error("Could not load articles.");
    return data ?? [];
  });

const postSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(400),
  content: z.string().trim().min(10).max(20000),
  propertySlug: z.string().max(100).nullable(),
  milestone: z.string().trim().max(100).nullable(),
  published: z.boolean(),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => postSchema.parse(d))
  .handler(async ({ data, context }) => {
    const base = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "post";
    const row = {
      title: data.title, excerpt: data.excerpt, content: data.content,
      property_slug: data.propertySlug || null, milestone: data.milestone || null,
      published: data.published, updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { data: existing } = await context.supabase.from("blog_posts").select("published_at").eq("id", data.id).maybeSingle();
      const { error } = await context.supabase.from("blog_posts").update({ ...row, published_at: data.published ? existing?.published_at ?? new Date().toISOString() : null }).eq("id", data.id);
      if (error) throw new Error("Could not save the article.");
    } else {
      const { error } = await context.supabase.from("blog_posts").insert({ ...row, slug: `${base}-${Date.now().toString(36)}`, published_at: data.published ? new Date().toISOString() : null });
      if (error) throw new Error("Could not save the article.");
    }
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the article.");
    return { ok: true };
  });
