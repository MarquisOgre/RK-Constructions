import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.union([z.string().trim().regex(/^\+?[0-9\s()-]{7,20}$/), z.literal("")]),
  message: z.string().trim().min(3).max(2000),
  website: z.string().max(100),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) throw new Error("Could not send your message.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: recent } = await supabaseAdmin.from("contact_messages").select("id")
      .eq("email", data.email).gte("created_at", new Date(Date.now() - 2 * 60_000).toISOString()).limit(1);
    if (recent?.length) throw new Error("We just received a message from this email. Please wait a moment.");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name, email: data.email, phone: data.phone || null, message: data.message,
    });
    if (error) throw new Error("Could not send your message. Please try again.");
    return { received: true };
  });
