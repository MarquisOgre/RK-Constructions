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

export const listReplies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("inquiry_replies").select("*").order("created_at", { ascending: true }).limit(1000);
    if (error) throw new Error("Could not load replies.");
    return data ?? [];
  });

export const replyToInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(["callback", "message"]), id: z.string().uuid(), body: z.string().trim().min(2).max(5000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Owner access required.");
    const table = data.kind === "callback" ? "property_callback_requests" : "contact_messages";
    const { data: row } = await context.supabase.from(table).select("email").eq("id", data.id).maybeSingle();
    if (!row?.email) throw new Error("This buyer didn't leave an email address. Please call them instead.");
    // Email delivery is switched on once the sender domain is set up; until then the reply is saved.
    const delivery: "saved" | "sent" | "failed" = "saved";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("inquiry_replies").insert({ kind: data.kind, inquiry_id: data.id, sent_to: row.email, body: data.body, delivery });
    if (error) throw new Error("Could not save the reply.");
    await context.supabase.from(table).update({ status: "contacted" }).eq("id", data.id);
    return { delivery: delivery as "saved" | "sent" | "failed" };
  });
