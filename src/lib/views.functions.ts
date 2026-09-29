import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { properties } from "./properties";

export const trackPropertyView = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ slug: z.string().max(100) }).parse(data))
  .handler(async ({ data }) => {
    if (!properties.some((p) => p.slug === data.slug)) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("property_page_views").insert({ property_slug: data.slug });
    return { ok: true };
  });
