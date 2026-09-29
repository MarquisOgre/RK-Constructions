import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOwnerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin) return { isAdmin: true, canClaim: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    return { isAdmin: false, canClaim: (count ?? 0) === 0 };
  });

// The very first signed-in person can claim the owner role; afterwards it is locked.
export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An owner account already exists.");
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error("Could not set up the owner account.");
    return { ok: true };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [callbacks, messages, recs, views] = await Promise.all([
      sb.from("property_callback_requests").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("recommendation_requests").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("property_page_views").select("property_slug, created_at").order("created_at", { ascending: false }).limit(5000),
    ]);
    const err = callbacks.error || messages.error || recs.error || views.error;
    if (err) throw new Error("Could not load the dashboard.");
    const viewCounts: Record<string, number> = {};
    for (const v of views.data ?? []) viewCounts[v.property_slug] = (viewCounts[v.property_slug] ?? 0) + 1;
    return { callbacks: callbacks.data ?? [], messages: messages.data ?? [], recommendations: recs.data ?? [], viewCounts, totalViews: views.data?.length ?? 0 };
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(["callback", "message"]), id: z.string().uuid(), status: z.enum(["new", "contacted", "closed"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const table = data.kind === "callback" ? "property_callback_requests" : "contact_messages";
    const { error } = await context.supabase.from(table).update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update status.");
    return { ok: true };
  });
