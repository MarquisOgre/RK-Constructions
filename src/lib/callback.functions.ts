import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const formSchema = z.object({
  slug: z.string(), name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/),
  email: z.union([z.string().email().max(254), z.literal("")]),
  preferredTime: z.string().trim().min(1).max(100),
  message: z.string().trim().max(1000),
  website: z.string().max(100),
});

export const requestCallback = createServerFn({ method: "POST" })
  .inputValidator((data) => formSchema.parse(data))
  .handler(async ({ data }) => {
    const { fetchPublishedRows } = await import("./properties.server");
    if (!(await fetchPublishedRows()).some(property => property.slug === data.slug) || data.website) throw new Error("Could not submit your request.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: recent, error: checkError } = await supabaseAdmin.from("property_callback_requests")
      .select("id").eq("phone", data.phone).gte("created_at", new Date(Date.now() - 5 * 60_000).toISOString()).limit(1);
    if (checkError) throw new Error("Could not submit your request. Please try again.");
    if (recent?.length) throw new Error("A callback request was recently received for this number. Please try again later.");
    const { error } = await supabaseAdmin.from("property_callback_requests").insert({
      property_slug: data.slug, name: data.name, phone: data.phone,
      email: data.email || null, preferred_time: data.preferredTime, message: data.message || null,
    });
    if (error) throw new Error("Could not submit your request. Please try again.");
    return { received: true };
  });