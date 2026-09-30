import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { contact } from "@/lib/site";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Calculator, Check, ChevronDown, Heart, Home, Landmark, MapPin, Menu, Play, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-residences.jpg";
import interior from "@/assets/tour-interior.jpg";
import lifestyle from "@/assets/lifestyle.jpg";
import indiaMap from "@/assets/india-map.svg";
import { properties } from "@/lib/properties";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "RK Constructions and Developers | Homes & Investments" },
    { name: "description", content: "Discover residential and commercial spaces with RK Constructions and Developers. Explore properties, locations and a better tomorrow." },
    { property: "og:title", content: "RK Constructions and Developers | Homes & Investments" },
    { property: "og:description", content: "Discover residential and commercial spaces with RK Constructions and Developers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

const locations = [{ name: "Hyderabad", count: 12, x: 37, y: 61 }, { name: "Bengaluru", count: 8, x: 34, y: 75 }, { name: "Chennai", count: 6, x: 42, y: 75 }, { name: "Pune", count: 5, x: 23, y: 58 }, { name: "Mumbai", count: 4, x: 20, y: 56 }, { name: "Delhi NCR", count: 4, x: 33, y: 26 }];
const nav = [{ label: "Buy", href: "#buy" }, { label: "Projects", href: "#projects" }, { label: "New Launches", href: "#projects" }, { label: "Commercial", href: "#projects" }, { label: "About", href: "#about" }, { label: "Updates", href: "/blog" }, { label: "Contact", href: "/contact" }];

function Index() {
  const [mode, setMode] = useState("Buy");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");
  const [budget, setBudget] = useState("Any budget");
  const [searched, setSearched] = useState(false);
  const [activeLocation, setActiveLocation] = useState("Hyderabad");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [aiBudget, setAiBudget] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiLifestyle, setAiLifestyle] = useState("");
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loan, setLoan] = useState(5000000);
  const [years, setYears] = useState(20);

  const filtered = useMemo(() => properties.filter(p => {
    if (mode === "Rent" || mode === "Plots") return false;
    if (mode === "Commercial" && p.category !== "Commercial") return false;
    if (showFavorites && !favorites.includes(p.name)) return false;
    if (category === "Residential" && p.category !== "Residential") return false;
    if (category === "Commercial" && p.category !== "Commercial") return false;
    if (category === "Plots & Land" || category === "Plots") return false;
    if (category === "New Launches" && p.status !== "New Launch") return false;
    if (category === "Ready to Move" && p.status !== "Ready to Move") return false;
    if (category === "Luxury Homes" && p.status !== "Luxury Homes") return false;
    if (searched && location.trim() && !p.location.toLowerCase().includes(location.trim().toLowerCase()) && !p.name.toLowerCase().includes(location.trim().toLowerCase())) return false;
    if (searched && type !== "All" && p.category !== type) return false;
    if (searched && budget !== "Any budget") {
      const price = p.price.includes("Crores") ? parseFloat(p.price.slice(1)) * 100 : parseFloat(p.price.slice(1));
      if (budget === "Under ₹75L" && price > 75) return false;
      if (budget === "₹75L – ₹1Cr" && (price < 75 || price > 100)) return false;
      if (budget === "Above ₹1Cr" && price <= 100) return false;
    }
    return true;
  }), [mode, category, location, type, budget, searched, favorites, showFavorites]);
  const visible = [...filtered.slice(slide), ...filtered.slice(0, slide)];
  const monthlyRate = 0.085 / 12;
  const payments = years * 12;
  const emi = Math.round(loan * monthlyRate * Math.pow(1 + monthlyRate, payments) / (Math.pow(1 + monthlyRate, payments) - 1));

  function goTo(id: string, chosen?: string) {
    if (chosen) { setCategory(chosen); setMode("Buy"); setType("All"); setShowFavorites(false); setSearched(false); setSlide(0); }
    if (id === "calculator") { setShowCalculator(true); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  }
  function toggleFavorite(name: string) { setFavorites(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]); }

  return <div className="min-h-screen bg-background text-foreground">
    <header className="h-[76px] border-b border-border bg-card lg:h-[86px]">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between gap-5 px-5 lg:px-9">
        <a href="#buy" aria-label="RK Constructions and Developers home" className="shrink-0"><img src="/logo.png" alt="RK Constructions and Developers" className="h-[50px] w-[175px] object-contain object-left lg:h-[62px] lg:w-[216px]" /></a>
        <nav className="hidden items-center gap-8 xl:flex" aria-label="Main navigation">{nav.map((item, i) => <a key={item.label} href={item.href} onClick={item.label === "Commercial" ? e => { e.preventDefault(); goTo("projects", "Commercial"); } : undefined} className={`text-[13px] font-semibold transition-colors hover:text-primary ${i === 0 ? "border-b-2 border-primary pb-2 pt-2" : ""}`}>{item.label}</a>)}</nav>
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="subtle" size="icon" className="rounded-full" aria-label="Saved properties" title="Saved properties" onClick={() => { setShowFavorites(!showFavorites); goTo("projects"); }}><Heart className={showFavorites ? "fill-primary text-primary" : ""} /></Button>
          <Button variant="subtle" size="icon" className="hidden rounded-full sm:inline-flex" aria-label="Contact RK Constructions" title="Contact" onClick={() => goTo("contact")}><MapPin /></Button>
          <Button className="hidden h-10 px-5 sm:inline-flex" onClick={() => navigate({ to: "/contact" })}>Enquire Now <ArrowRight /></Button>
          <Button variant="subtle" size="icon" className="xl:hidden" aria-label={mobileMenu ? "Close menu" : "Open menu"} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {mobileMenu && <nav className="absolute left-0 right-0 z-30 grid gap-1 border-b border-border bg-card p-5 shadow-lg xl:hidden" aria-label="Mobile navigation">{nav.map(item => <a href={item.href} key={item.label} onClick={() => setMobileMenu(false)} className="px-3 py-3 text-sm font-semibold hover:text-primary">{item.label}</a>)}</nav>}
    </header>

    <main>
      <section id="buy" className="mx-auto grid max-w-[1500px] gap-4 px-4 pt-4 lg:grid-cols-[190px_minmax(0,1fr)] lg:px-6">
        <aside className="hidden h-fit rounded-lg border border-border bg-card p-3 lg:block soft-shadow">
          <div className="space-y-1">{([
            [Home, "Buy Property", "buy"], [Home, "Residential", "projects"], [Building2, "Commercial", "projects"], [Landmark, "Plots & Land", "projects"], [Sparkles, "New Launches", "projects"], [Home, "Ready to Move", "projects"], [Home, "Luxury Homes", "projects"]
          ] as const).map(([Icon, label, id]) => <Button key={label} variant={category === label || (category === "All" && label === "Buy Property") ? "default" : "ghost"} className="h-10 w-full justify-start px-3 text-xs" onClick={() => goTo(id, label)}><Icon />{label}</Button>)}</div>
          <div className="my-3 border-t border-border" />
          <div className="space-y-1">{([[MapPin, "Projects Map", "locations"], [SlidersHorizontal, "Price List", "projects"], [Play, "Virtual Tour", "tour"], [Calculator, "EMI Calculator", "calculator"]] as const).map(([Icon, label, id]) => <Button key={label} variant="ghost" className="h-10 w-full justify-start px-3 text-xs" onClick={() => goTo(id)}><Icon />{label}</Button>)}</div>
        </aside>
        <div className="hero-image relative flex min-h-[560px] flex-col justify-between overflow-hidden rounded-lg p-5 sm:min-h-[500px] sm:p-8 lg:min-h-[485px] lg:p-9 xl:p-12">
          <img src={hero} alt="RK-inspired luxury residences beside a landscaped pool" width={1920} height={960} className="absolute inset-0 h-full w-full object-cover object-[63%_center]" />
          <div className="relative z-10 max-w-[670px]">
            <p className="eyebrow mb-3 text-foreground">Find your perfect space</p>
            <h1 className="display-title text-[47px] text-ink sm:text-[60px] lg:text-[55px] xl:text-[64px]">Homes. Investments.<br />A Better Tomorrow.</h1>
            <p className="mt-5 max-w-[390px] text-sm font-medium leading-relaxed sm:text-base">Explore premium residential, commercial and mixed-use properties by RK Constructions and Developers.</p>
          </div>
          <div className="absolute right-5 top-6 hidden w-[204px] rounded-md bg-ink/95 p-5 text-ink-foreground xl:block"><p className="display-title text-[27px] leading-[.98]">Premium<br />Living Spaces</p><div className="my-4 h-[2px] w-8 bg-primary" /><div className="space-y-3 text-[11px]">{["Modern Design", "Prime Locations", "World-Class Amenities", "Trusted by Thousands"].map(t => <p className="flex items-center gap-2" key={t}><Check className="size-3.5 text-primary" />{t}</p>)}</div></div>
          <div className="relative z-10 mt-10 rounded-lg bg-card p-2 soft-shadow">
            <div className="mb-2 flex gap-1">{["Buy", "Rent", "Commercial", "Plots"].map(t => <Button key={t} size="sm" variant={mode === t ? "default" : "ghost"} onClick={() => { setMode(t); setType(t === "Commercial" ? "Commercial" : t === "Plots" ? "Plots" : "All"); setSearched(false); }} className="h-8 px-3 text-xs sm:px-5">{t}</Button>)}</div>
            <form className="grid gap-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(135px,.8fr)_minmax(140px,.8fr)_110px]" onSubmit={e => { e.preventDefault(); setSearched(true); setCategory("All"); goTo("projects"); }}>
              <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Search by location or project" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location (e.g. Hyderabad)" className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground" /></label>
              <label className="relative flex h-11 items-center rounded-md border border-border px-3"><span className="sr-only">Property type</span><select value={type} onChange={e => setType(e.target.value)} className="w-full appearance-none bg-transparent pr-4 text-xs outline-none"><option value="All">Property Type</option><option value="Residential">Residential</option><option value="Commercial">Commercial</option><option value="Plots">Plots</option></select><ChevronDown className="pointer-events-none absolute right-3 size-3.5" /></label>
              <label className="relative flex h-11 items-center rounded-md border border-border px-3"><span className="sr-only">Budget range</span><select value={budget} onChange={e => setBudget(e.target.value)} className="w-full appearance-none bg-transparent pr-4 text-xs outline-none"><option value="Any budget">Budget Range</option><option>Under ₹75L</option><option>₹75L – ₹1Cr</option><option>Above ₹1Cr</option></select><ChevronDown className="pointer-events-none absolute right-3 size-3.5" /></label>
              <Button type="submit" className="h-11"><Search /> Search</Button>
            </form>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-[1500px] px-5 pb-8 pt-10 lg:px-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2 text-muted-foreground">Featured properties</p><h2 className="display-title text-[42px] text-ink sm:text-[53px]">{showFavorites ? "Your Saved Properties" : "Discover Our"}<br className="hidden sm:block" />{showFavorites ? "" : " Signature Projects"}</h2></div><div className="flex items-center gap-3"><Button variant="link" className="text-sky" onClick={() => { setCategory("All"); setMode("Buy"); setType("All"); setShowFavorites(false); setSearched(false); setSlide(0); }}>View All Projects <ArrowRight /></Button><Button size="icon" variant="subtle" className="rounded-full" aria-label="Previous projects" onClick={() => setSlide(v => (v - 1 + filtered.length) % (filtered.length || 1))}><ArrowLeft /></Button><Button size="icon" variant="subtle" className="rounded-full" aria-label="Next projects" onClick={() => setSlide(v => (v + 1) % (filtered.length || 1))}><ArrowRight /></Button></div></div>
        <div className="mb-5 flex gap-2 overflow-x-auto lg:hidden">{["All", "Residential", "Commercial", "New Launches", "Ready to Move"].map(t => <Button key={t} variant={category === t ? "default" : "subtle"} size="sm" onClick={() => { setCategory(t); setShowFavorites(false); setSearched(false); }}>{t}</Button>)}</div>
        {visible.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visible.map(p => <article className="overflow-hidden rounded-lg border border-border bg-card soft-shadow" key={p.name}><div className="relative aspect-[1.52] overflow-hidden"><img src={p.image} alt={p.name + " property exterior"} loading="lazy" width={912} height={736} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /><span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">{p.badge}</span><Button size="icon" variant="subtle" className="absolute right-3 top-3 size-8 rounded-full bg-card/90" aria-label={favorites.includes(p.name) ? `Remove ${p.name} from saved properties` : `Save ${p.name}`} onClick={() => toggleFavorite(p.name)}><Heart className={favorites.includes(p.name) ? "fill-primary text-primary" : ""} /></Button></div><div className="relative p-4"><h3 className="text-[16px] font-extrabold">{p.name}</h3><p className="text-xs text-muted-foreground">{p.detail}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 text-primary" />{p.location}</p><div className="mt-3 flex items-end justify-between"><div><strong className="text-[17px]">{p.price}</strong><p className="text-[11px] text-muted-foreground">Onwards</p></div><Button asChild size="icon" variant="subtle" className="rounded-full"><Link to="/developments/$slug" params={{ slug: p.slug }} aria-label={`View ${p.name} details`}><ArrowRight /></Link></Button></div></div></article>)}</div> : <div className="rounded-lg border border-border bg-card px-6 py-14 text-center"><p className="text-lg font-semibold">No matching properties found</p><p className="mt-1 text-sm text-muted-foreground">Try another location or adjust your search.</p><Button className="mt-5" onClick={() => { setCategory("All"); setMode("Buy"); setLocation(""); setType("All"); setBudget("Any budget"); setSearched(false); setShowFavorites(false); }}>Clear filters</Button></div>}
      </section>

      <section id="recommend" className="border-y border-border bg-secondary/60"><div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 lg:grid-cols-[.85fr_1.15fr] lg:px-9"><div><p className="eyebrow mb-3 text-primary">Personalised search</p><h2 className="display-title text-5xl text-ink">Find your fit</h2><p className="mt-5 max-w-[390px] text-sm leading-7 text-muted-foreground">Tell us what matters to you and see which of our showcased developments may suit your plans.</p><p className="mt-4 text-xs text-muted-foreground">Suggestions use illustrative listings, not live inventory. Confirm details with the developer.</p></div><div><form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); navigate({ to: "/results", search: { budget: aiBudget, location: aiLocation, lifestyle: aiLifestyle } });}}><label className="text-xs font-bold">Your budget<input required maxLength={100} value={aiBudget} onChange={e => setAiBudget(e.target.value)} placeholder="e.g. up to ₹80 Lakhs" className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="text-xs font-bold">Preferred location<input required maxLength={100} value={aiLocation} onChange={e => setAiLocation(e.target.value)} placeholder="e.g. Hyderabad" className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="text-xs font-bold sm:col-span-2">Lifestyle needs<textarea required minLength={3} maxLength={600} value={aiLifestyle} onChange={e => setAiLifestyle(e.target.value)} placeholder="e.g. A family home near green space, with room to work from home" rows={3} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><Button type="submit" className="h-11 sm:col-span-2"><Sparkles /> Find my matches</Button></form></div></div></section>

      <section id="locations" className="mx-auto grid max-w-[1500px] gap-4 px-5 pb-10 pt-10 lg:grid-cols-[225px_minmax(0,1fr)_minmax(320px,.92fr)] lg:px-9">
        <div className="border-t border-border pt-5"><h2 className="display-title mb-4 text-[35px] leading-none text-ink">Explore Projects<br />by Location</h2><div className="space-y-1">{locations.map(loc => <Button key={loc.name} variant={activeLocation === loc.name ? "default" : "ghost"} className="h-10 w-full justify-between px-3 text-xs" onClick={() => { setActiveLocation(loc.name); setLocation(loc.name); setCategory("All"); setSearched(true); }}><span className="flex items-center gap-2"><MapPin className="size-4" />{loc.name}</span><span className="text-[11px] opacity-70">{loc.count} Projects</span></Button>)}</div></div>
        <div className="relative min-h-[345px] overflow-hidden rounded-lg bg-secondary"><img src={indiaMap} alt="Map of India showing RK project locations" loading="lazy" className="absolute inset-0 h-full w-full object-fill" /><div className="pointer-events-none absolute inset-0 bg-sky/5" />{locations.map(loc => <Button key={loc.name} variant={activeLocation === loc.name ? "default" : "subtle"} className="absolute h-8 rounded-full px-2 text-[10px] shadow-md" style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }} onClick={() => { setActiveLocation(loc.name); setLocation(loc.name); setSearched(true); }}><span className="font-extrabold">{loc.count}</span><span className="hidden sm:inline">{loc.name}</span></Button>)}</div>
        <div className="grid gap-3"><div id="tour" className="relative min-h-[180px] overflow-hidden rounded-lg bg-card soft-shadow"><img src={interior} alt="Modern RK apartment living space" loading="lazy" width={1200} height={688} className="absolute inset-0 h-full w-full object-cover" /><Button asChild className="absolute left-1/2 top-[37%] size-11 -translate-x-1/2 rounded-full" size="icon"><Link to="/developments/$slug" params={{ slug: "rk-heights" }} aria-label="Explore RK Heights gallery"><Play className="fill-current" /></Link></Button><div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-card/95 p-4"><div><h3 className="text-sm font-extrabold">Explore the Gallery</h3><p className="text-[11px] text-muted-foreground">View illustrative property imagery.</p></div><Button asChild variant="subtle" size="icon" className="rounded-full"><Link to="/developments/$slug" params={{ slug: "rk-heights" }} aria-label="View RK Heights gallery"><ArrowRight /></Link></Button></div></div><div className="grid min-h-[150px] grid-cols-[42%_1fr] overflow-hidden rounded-lg bg-card soft-shadow"><img src={lifestyle} alt="Family enjoying their new home" loading="lazy" width={960} height={688} className="h-full w-full object-cover" /><div className="flex flex-col justify-center p-4"><h3 className="display-title mb-2 text-[25px] text-ink">Why Choose RK?</h3>{["Prime Locations", "Quality Construction", "Modern Amenities", "Transparent Pricing"].map(t => <p key={t} className="mb-1 flex items-center gap-2 text-[10px] font-semibold"><span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-2.5" /></span>{t}</p>)}</div></div></div>
      </section>
      <section id="about" className="value-image relative overflow-hidden text-ink-foreground"><img src={lifestyle} alt="Family overlooking their new neighbourhood" loading="lazy" width={960} height={688} className="absolute inset-0 h-full w-full object-cover object-center" /><div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-5 py-12 lg:grid-cols-[290px_1fr_200px] lg:items-center lg:px-9"><div><p className="eyebrow mb-3 text-primary">Why invest with RK</p><h2 className="display-title text-[43px]">Building Value<br />for Generations</h2><div className="mt-5 h-[2px] w-10 bg-primary" /></div><div className="grid grid-cols-2 gap-5 sm:grid-cols-4">{([[MapPin, "Prime Locations", "Strategic locations with high growth potential."], [Landmark, "Quality Construction", "Built with the highest standards and materials."], [Sparkles, "Modern Amenities", "World-class amenities for a better lifestyle."], [Building2, "High Returns", "Strong investment potential and capital appreciation."]] as const).map(([Icon, title, desc]) => <div key={title} className="border-l border-ink-foreground/20 pl-4 text-center"><Icon className="mx-auto mb-3 size-7 text-primary" strokeWidth={1.3} /><h3 className="display-title text-[21px]">{title}</h3><p className="mt-2 text-[10px] leading-relaxed opacity-70">{desc}</p></div>)}</div><div className="hidden border-l border-ink-foreground/20 pl-8 lg:block"><p className="text-xs uppercase leading-relaxed">Invest today<br />in a brighter<br />tomorrow</p><Button size="icon" variant="subtle" className="mt-5 rounded-full bg-transparent text-ink-foreground" aria-label="Enquire today" onClick={() => goTo("contact")}><ArrowRight /></Button></div></div></section>
    </main>
    <footer id="contact" className="bg-ink text-ink-foreground"><div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:px-9"><div><img src="/logo.png" alt="RK Constructions and Developers" className="h-[70px] w-[220px] rounded-sm object-contain object-left" /><p className="eyebrow mt-3 text-[8px] text-ink-foreground/70">Building a better tomorrow</p></div><div><h3 className="mb-3 text-xs font-bold">Quick Links</h3>{nav.map(item => <a key={item.label} href={item.href} className="block py-1 text-xs text-ink-foreground/70 hover:text-ink-foreground">{item.label}</a>)}</div><div><h3 className="mb-3 text-xs font-bold">Property Types</h3>{["Residential", "Commercial", "Plots & Land", "New Launches", "Luxury Homes"].map(t => <a key={t} href="#projects" onClick={() => setCategory(t)} className="block py-1 text-xs text-ink-foreground/70 hover:text-ink-foreground">{t}</a>)}</div><div><h3 className="mb-3 text-xs font-bold">Get in Touch</h3><p className="text-xs leading-relaxed text-ink-foreground/70"><a href={`mailto:${contact.email}`} className="block hover:text-ink-foreground">{contact.email}</a><a href={contact.phoneHref} className="block hover:text-ink-foreground">{contact.phone}</a>{contact.office} · {contact.hours}</p><Button className="mt-5" onClick={() => navigate({ to: "/contact" })}>Contact us <ArrowRight /></Button></div></div><div className="mx-auto max-w-[1430px] border-t border-ink-foreground/15 px-5 py-5 text-[11px] text-ink-foreground/60 lg:px-0">© {new Date().getFullYear()} RK Constructions and Developers. All rights reserved.</div></footer>

    {showCalculator && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4" onClick={() => setShowCalculator(false)}><div role="dialog" aria-modal="true" aria-label="EMI calculator" className="w-full max-w-[450px] rounded-lg bg-card p-6 text-foreground shadow-xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="display-title text-4xl">EMI Calculator</h2><Button variant="ghost" size="icon" aria-label="Close calculator" onClick={() => setShowCalculator(false)}><X /></Button></div><p className="mt-3 text-xs text-muted-foreground">Estimate your monthly payment at 8.5% annual interest.</p><label className="mt-6 block text-sm font-semibold">Loan amount (₹)<input type="number" min="100000" step="100000" value={loan} onChange={e => setLoan(Math.max(100000, Number(e.target.value)))} className="mt-2 h-11 w-full rounded-md border border-input px-3 outline-none focus:ring-2 focus:ring-ring" /></label><label className="mt-5 block text-sm font-semibold">Loan tenure (years)<input type="range" min="1" max="30" value={years} onChange={e => setYears(Number(e.target.value))} className="mt-4 w-full accent-primary" /><span className="text-xs text-muted-foreground">{years} years</span></label><div className="mt-6 rounded-md bg-secondary p-5"><p className="text-xs">Estimated monthly EMI</p><p className="mt-1 text-3xl font-extrabold">₹{emi.toLocaleString("en-IN")}</p></div></div></div>}
  </div>;
}
