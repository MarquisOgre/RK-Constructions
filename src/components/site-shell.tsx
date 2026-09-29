import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import { contact } from "@/lib/site";

export function SiteShell({ children }: { children: ReactNode }) {
  const link = "text-xs font-bold hover:text-primary";
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-9">
      <Link to="/" aria-label="RK Constructions home"><img src="/logo.png" alt="RK Constructions and Developers" className="h-[52px] w-[172px] object-contain object-left" /></Link>
      <nav className="flex items-center gap-5" aria-label="Site"><Link to="/" className={link}>Projects</Link><Link to="/blog" className={link}>Updates</Link><Link to="/contact" className={link}>Contact</Link></nav>
    </div></header>
    <main className="mx-auto max-w-[1400px] px-5 py-10 lg:px-9 lg:py-14">{children}</main>
    <footer className="mt-10 bg-ink px-5 py-8 text-ink-foreground"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 text-xs lg:px-4">
      <span>© {new Date().getFullYear()} RK Constructions and Developers</span>
      <span className="flex flex-wrap gap-5"><a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-primary"><Mail className="size-3.5" />{contact.email}</a><a href={contact.phoneHref} className="flex items-center gap-2 hover:text-primary"><Phone className="size-3.5" />{contact.phone}</a></span>
    </div></footer>
  </div>;
}

export const fieldClass = "mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
