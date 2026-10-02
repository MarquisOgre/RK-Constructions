import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { toProperty, type PropertyRow } from "./properties";

export const listPropertyRows = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPublishedRows } = await import("./properties.server");
  return fetchPublishedRows();
});

export const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: async () => (await listPropertyRows()).map(toProperty),
  staleTime: 60_000,
});

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Owner access required.");
}

export const listAllPropertyRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("properties").select("*").order("sort_order").order("name");
    if (error) throw new Error("Could not load developments.");
    return (data ?? []) as PropertyRow[];
  });

const list = z.array(z.string().trim().min(1).max(200)).max(30);
const schema = z.object({
  isNew: z.boolean(),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Use lowercase letters, numbers and dashes"),
  name: z.string().trim().min(2).max(120), detail: z.string().trim().max(200), location: z.string().trim().min(2).max(100),
  price: z.string().trim().min(1).max(50), price_lakhs: z.number().min(0).max(1_000_000),
  category: z.enum(["Residential", "Commercial", "Plots"]), badge: z.string().trim().max(40), status: z.string().trim().max(40),
  units: list, amenities: list, specifications: list,
  image_url: z.union([z.string().trim().url().max(1000).refine(u => u.startsWith("https://"), "Use an https link"), z.literal("")]),
  published: z.boolean(), sort_order: z.number().int().min(0).max(10000),
});

export const saveProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { isNew, ...row } = data;
    const payload = { ...row, image_url: row.image_url || null, updated_at: new Date().toISOString() };
    const { error } = isNew
      ? await context.supabase.from("properties").insert(payload)
      : await context.supabase.from("properties").update(payload).eq("slug", row.slug);
    if (error) throw new Error(error.code === "23505" ? "That web address is already used." : "Could not save the development.");
    return { ok: true };
  });

export const deleteProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ slug: z.string().max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("properties").delete().eq("slug", data.slug);
    if (error) throw new Error("Could not delete the development.");
    return { ok: true };
  });
