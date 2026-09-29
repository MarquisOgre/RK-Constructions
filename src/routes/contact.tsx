import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, fieldClass } from "@/components/site-shell";
import { contact } from "@/lib/site";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact RK Constructions and Developers" },
    { name: "description", content: "Email, call or visit RK Constructions and Developers in Ravalkole. Open 9 AM to 6 PM." },
    { property: "og:title", content: "Contact RK Constructions and Developers" },
    { property: "og:description", content: "Reach our team directly by email or phone." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; const f = new FormData(form);
    setSending(true); setError("");
    try {
      await sendContactMessage({ data: { name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), phone: String(f.get("phone") ?? ""), message: String(f.get("message") ?? ""), website: String(f.get("website") ?? "") } });
      setSent(true); form.reset();
    } catch (c) { setError(c instanceof Error ? c.message : "Could not send your message."); } finally { setSending(false); }
  }
  const card = "flex items-start gap-4 border-b border-border py-5";
  return <SiteShell>
    <p className="eyebrow mb-3 text-primary">Contact us</p>
    <h1 className="display-title text-5xl text-ink sm:text-6xl">Talk to us directly</h1>
    <p className="mt-4 max-w-[560px] text-sm leading-7 text-muted-foreground">Call, email or visit our office — or send a message below and we'll get back to you.</p>
    <div className="mt-10 grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
      <div className="border-t border-border">
        <a href={`mailto:${contact.email}`} className={card}><Mail className="mt-1 size-5 text-primary" /><span><span className="block text-xs font-bold uppercase text-muted-foreground">Email</span><span className="text-lg font-bold hover:text-primary">{contact.email}</span></span></a>
        <a href={contact.phoneHref} className={card}><Phone className="mt-1 size-5 text-primary" /><span><span className="block text-xs font-bold uppercase text-muted-foreground">Phone</span><span className="text-lg font-bold hover:text-primary">{contact.phone}</span></span></a>
        <div className={card}><MapPin className="mt-1 size-5 text-primary" /><span><span className="block text-xs font-bold uppercase text-muted-foreground">Office</span><span className="text-lg font-bold">{contact.office}</span></span></div>
        <div className={card}><Clock className="mt-1 size-5 text-primary" /><span><span className="block text-xs font-bold uppercase text-muted-foreground">Hours</span><span className="text-lg font-bold">{contact.hours}</span></span></div>
      </div>
      <section className="border-t-2 border-primary bg-card p-6 soft-shadow">
        <h2 className="display-title text-4xl text-ink">Send a message</h2>
        {sent ? <div role="status" className="mt-6 rounded-md bg-secondary p-5"><p className="font-bold">Message received</p><p className="mt-2 text-sm text-muted-foreground">Thank you — our team will reply soon.</p><Button variant="subtle" className="mt-4" onClick={() => setSent(false)}>Send another</Button></div> :
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold">Name<input name="name" required minLength={2} maxLength={100} className={fieldClass} /></label>
          <label className="text-xs font-bold">Email<input name="email" type="email" required maxLength={254} className={fieldClass} /></label>
          <label className="text-xs font-bold sm:col-span-2">Phone (optional)<input name="phone" type="tel" maxLength={20} className={fieldClass} /></label>
          <label className="text-xs font-bold sm:col-span-2">Message<textarea name="message" required minLength={3} maxLength={2000} rows={5} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
          <div className="hidden" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
          {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={sending} className="h-11 sm:col-span-2">{sending ? "Sending…" : "Send message"} <ArrowRight /></Button>
        </form>}
      </section>
    </div>
  </SiteShell>;
}
