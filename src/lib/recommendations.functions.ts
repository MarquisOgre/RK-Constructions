import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const preferences = z.object({ budget: z.string().trim().min(1).max(100), location: z.string().trim().min(1).max(100), lifestyle: z.string().trim().min(3).max(600) });

export const recommendProperties = createServerFn({ method: "POST" })
  .inputValidator((data) => preferences.parse(data))
  .handler(async ({ data }) => {
    const { generateRecommendations } = await import("./recommendations.server");
    const { fetchPublishedRows } = await import("./properties.server");
    const rows = await fetchPublishedRows();
    const result = await generateRecommendations(data, rows.map(r => ({ slug: r.slug, name: r.name, location: r.location, price: r.price, priceLakhs: Number(r.price_lakhs), detail: r.detail, category: r.category, units: r.units, amenities: r.amenities, specifications: r.specifications, status: r.status })));
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("recommendation_requests").insert({ budget: data.budget, location: data.location, lifestyle: data.lifestyle, recommended_slugs: result.map((r) => r.slug) });
    } catch (error) { console.error("Could not log recommendation", error); }
    return result;
  });
