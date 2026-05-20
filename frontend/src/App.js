import { useEffect, useRef, useState } from "react";
import "@/App.css";
import axios from "axios";
import {
    ArrowRight,
    Play,
    Zap,
    Shield,
    DollarSign,
    Wind,
    AlertTriangle,
    CheckCircle2,
    Wrench,
    TrendingDown,
    Menu,
    X,
    Send,
    Truck,
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast, Toaster } from "sonner";

const STORE_URL = "https://thefloorlord.com/product/pak-buddy/";
const VIMEO_ID = "1187115103";
const VIMEO_HASH = "5f13bd3cbe";
const TWO_CHAMBER_VIDEO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/01x8i0a9_2ChamberVertical.webm";
const API = process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : "/api";

/* ---------- ASSET URLS (correctly mapped) ---------- */
const PAK_BUDDY_TEXT_LOGO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/nkr842hk_pak_buddy_textonlyv2.png";
const FLOOR_LORD_LOGO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/94ryg16v_Floor%20Lord%20Logo.png";
const PRODUCT_RENDER =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/d1z6kiiu_image.png";
// Man walking with backpack vacuum on construction site
const CONTRACTOR_WALKING =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/mykss7pm_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_23_57%20PM.png";
// Man kneeling next to backpack vacuum (paint splatter site)
const CONTRACTOR_KNEELING =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/ct14px3q_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_29_13%20PM.png";
// Frustrated kneeling on dusty floor
const CONTRACTOR_FRUSTRATED =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/x5fd4whr_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_35_40%20PM.png";
// Pak Buddy bag on floor next to vacuum
const BAG_ON_FLOOR =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/oktsl3xt_1-1.jpg";
// Bag interior top view
const BAG_TOP_VIEW =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/8d6uo9uj_2-1.jpg";
// SMOKING VACUUM on construction site (correct image for cost section)
const SMOKING_VAC =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/myrts1fu_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_59_20%20PM.png";
// Man on dusty floor questioning gesture
const CONTRACTOR_QUESTIONING =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/kts01vet_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2005_15_11%20PM.png";
// Full Pak Buddy logo with green mascot character holding a vacuum
const PAK_BUDDY_FULL_LOGO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/lxr5c9ji_PakBuddy-01.png";
// Angelica smiling, holding Pak Buddy with backpack vacuum on
const ANGELICA_HOLDING_PAK_BUDDY =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/6ribw31r_Angelica%20with%20muk%20budddy.jpg";
// Angelica frustrated, holding floppy disposable bag (cost section)
const ANGELICA_WITH_DISPOSABLE =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/ksjl7u16_Angelica%20with%20disposable.png";
// Angelica holding both bags side-by-side for comparison
const ANGELICA_COMPARISON =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/wolwkzfm_Angelica%20with%20pak%20buddyv2%20copy.png";

/* ---------- Helpers ---------- */
const useReveal = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    io.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transition: `opacity .9s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

const CTAButton = ({
    children = "Get Pak Buddy",
    variant = "primary",
    testId,
    href = STORE_URL,
    onClick,
}) => {
    if (variant === "ghost") {
        return (
            <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="pb-btn-ghost"
                data-testid={testId}
                onClick={onClick}
            >
                {children}
                <ArrowRight className="w-4 h-4" />
            </a>
        );
    }
    return (
        <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="pb-btn"
            data-testid={testId}
            onClick={onClick}
        >
            <span>{children}</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </a>
    );
};

/* ---------- NAV ---------- */
const Nav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const navLinks = [
        { href: "#cost", label: "The Cost" },
        { href: "#how", label: "How It Works" },
        { href: "#benefits", label: "Benefits" },
        { href: "#testimonials", label: "Reviews" },
        { href: "#faq", label: "FAQ" },
        { href: "#fleet", label: "Fleet" },
    ];

    return (
        <>
            <nav
                data-testid="main-nav"
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled || open
                        ? "bg-[rgba(7,16,31,0.92)] backdrop-blur-xl border-b border-white/5"
                        : "bg-transparent"
                }`}
            >
                <div className="max-w-[1440px] mx-auto px-5 lg:px-12 py-3 lg:py-4 flex items-center justify-between">
                    <a
                        href="#top"
                        className="flex items-center gap-3 group"
                        data-testid="nav-logo"
                    >
                        <img
                            src={PAK_BUDDY_TEXT_LOGO}
                            alt="Pak Buddy"
                            className="h-9 lg:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="hidden sm:inline-block font-mono text-[10px] text-[var(--pb-blue-bright)] tracking-[0.25em] uppercase border-l border-white/15 pl-3">
                            By Floor Lord
                        </span>
                    </a>

                    <div className="hidden lg:flex items-center gap-7 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pb-grey)]">
                        {navLinks.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="hover:text-[var(--pb-blue-bright)] transition"
                                data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <CTAButton testId="nav-cta">Get Pak Buddy</CTAButton>
                    </div>

                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                        data-testid="mobile-menu-toggle"
                    >
                        {open ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile drawer */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
                    open
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
                data-testid="mobile-drawer"
            >
                <div
                    className="absolute inset-0 bg-[rgba(7,16,31,0.96)] backdrop-blur-xl"
                    onClick={() => setOpen(false)}
                />
                <div className="relative h-full pt-24 px-6 flex flex-col">
                    <div className="space-y-6">
                        {navLinks.map((l, i) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="block font-display text-4xl text-white border-b border-white/10 pb-4 hover:text-[var(--pb-blue-bright)] transition"
                                data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                                style={{
                                    transitionDelay: `${i * 50}ms`,
                                }}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>
                    <div className="mt-10">
                        <CTAButton testId="mobile-nav-cta">
                            Get Pak Buddy
                        </CTAButton>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ---------- STICKY MOBILE CTA ---------- */
const StickyMobileCTA = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const on = () => setShow(window.scrollY > 700);
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    return (
        <div
            className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-[var(--pb-ink)] via-[var(--pb-ink)]/95 to-transparent transition-transform duration-400 ${
                show ? "translate-y-0" : "translate-y-full"
            }`}
            data-testid="sticky-mobile-cta"
        >
            <a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[var(--pb-blue)] text-[var(--pb-ink)] font-block uppercase tracking-wider py-4 text-sm border-2 border-[var(--pb-ink)] shadow-[4px_4px_0_0_var(--pb-blue-bright)]"
                data-testid="sticky-cta-link"
            >
                Get Pak Buddy
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </a>
        </div>
    );
};

/* ---------- HERO ---------- */
const Hero = () => {
    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden grain blueprint-grid"
        >
            <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[var(--pb-blue-deep)] opacity-25 blur-[120px] pointer-events-none" />
            <div className="absolute top-40 right-0 w-[380px] h-[380px] rounded-full bg-[var(--pb-blue)] opacity-15 blur-[110px] pointer-events-none" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <div className="lg:col-span-6 relative z-10">
                        <Reveal>
                            <span
                                className="eyebrow"
                                data-testid="hero-eyebrow"
                            >
                                Introducing Pak Buddy™ · For commercial backpack vacuums
                            </span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h1
                                className="font-display mt-6 text-[44px] sm:text-6xl lg:text-7xl xl:text-[88px] text-white"
                                data-testid="hero-headline"
                            >
                                Finally — a{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    reusable
                                </span>{" "}
                                replacement for backpack disposable vacuum
                                bags.
                            </h1>
                        </Reveal>
                        <Reveal delay={240}>
                            <p
                                className="mt-6 lg:mt-8 text-lg lg:text-xl text-[var(--pb-grey)] max-w-xl leading-relaxed"
                                data-testid="hero-subline"
                            >
                                Pak Buddy saves you money, increases crew
                                efficiency, and protects your equipment — one
                                bag, endlessly reusable, engineered for real
                                job sites.
                            </p>
                        </Reveal>

                        <Reveal delay={360}>
                            <div className="mt-8 lg:mt-10 flex flex-wrap gap-4 items-center">
                                <CTAButton testId="hero-primary-cta">
                                    Get Pak Buddy
                                </CTAButton>
                                <a
                                    href="#how"
                                    className="pb-btn-ghost"
                                    data-testid="hero-secondary-cta"
                                >
                                    <Play className="w-4 h-4" />
                                    See how Pak Buddy works
                                </a>
                            </div>
                        </Reveal>

                        <Reveal delay={500}>
                            <div className="mt-12 flex items-center gap-5 flex-wrap">
                                <div className="flex -space-x-3">
                                    {[
                                        ANGELICA_HOLDING_PAK_BUDDY,
                                        CONTRACTOR_WALKING,
                                        CONTRACTOR_KNEELING,
                                    ].map((src, i) => (
                                        <div
                                            key={i}
                                            className="w-11 h-11 rounded-full border-2 border-[var(--pb-ink)] overflow-hidden bg-[var(--pb-steel)]"
                                        >
                                            <img
                                                src={src}
                                                alt="Pak Buddy user"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="font-block text-sm text-white">
                                        Trusted by working crews
                                    </div>
                                    <div className="font-mono text-[11px] text-[var(--pb-grey)] tracking-wider mt-0.5">
                                        CONTRACTORS · JANITORIAL · RESTORATION
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right: 16:9 Vimeo */}
                    <div className="lg:col-span-6 relative">
                        <Reveal delay={200}>
                            <img
                                src={PAK_BUDDY_TEXT_LOGO}
                                alt="Pak Buddy"
                                className="block w-full h-auto object-contain mb-4 lg:mb-6 drop-shadow-[0_0_30px_rgba(69,164,255,0.35)]"
                                data-testid="hero-mascot-logo"
                            />
                        </Reveal>
                        <Reveal delay={300}>
                            <div className="relative">
                                <div className="absolute -inset-3 border border-[var(--pb-blue-bright)]/30 rounded-sm pointer-events-none" />
                                <div className="absolute -top-6 left-0 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                    ◢ 01 / Pak Buddy sales film
                                </div>
                                <div className="absolute -bottom-6 right-0 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                    Pak Buddy™ ◣
                                </div>

                                <div
                                    className="relative aspect-video w-full overflow-hidden bg-black rounded-sm border border-white/10"
                                    data-testid="hero-video-wrapper"
                                >
                                    <iframe
                                        src={`https://player.vimeo.com/video/${VIMEO_ID}?h=${VIMEO_HASH}&badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`}
                                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                        className="absolute inset-0 w-full h-full"
                                        title="Pak Buddy — Sales"
                                        data-testid="hero-vimeo"
                                    />
                                </div>

                                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[var(--pb-blue-bright)]" />
                            </div>
                        </Reveal>

                        <Reveal delay={500}>
                            <div className="mt-10 grid grid-cols-3 gap-2 lg:gap-3">
                                {[
                                    { k: "Reusable", v: "endlessly" },
                                    { k: "Patented", v: "2-chamber" },
                                    { k: "Saves", v: "$100s" },
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        className="p-3 lg:p-4 border border-white/10 bg-white/[0.02]"
                                    >
                                        <div className="font-display text-2xl lg:text-3xl text-[var(--pb-blue-bright)] leading-none">
                                            {s.v}
                                        </div>
                                        <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[var(--pb-grey)] uppercase">
                                            {s.k}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------- MICRO PROOF ---------- */
const MicroProof = () => {
    const quotes = [
        "It feels like a completely different machine.",
        "The suction boost is insane — it sticks to the floor.",
        "Guys are finishing jobs faster because Pak Buddy doesn't lose power.",
        "We are saving hundreds of dollars with Pak Buddy.",
    ];
    const doubled = [...quotes, ...quotes, ...quotes];
    return (
        <section
            className="relative py-8 lg:py-10 border-y border-white/10 bg-[var(--pb-ink-2)]"
            data-testid="proof-marquee"
        >
            <div className="overflow-hidden">
                <div className="marquee-track flex gap-12 lg:gap-16 whitespace-nowrap w-[300%]">
                    {doubled.map((q, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 shrink-0"
                        >
                            <span className="font-display-italic text-xl lg:text-3xl text-white">
                                &ldquo;{q}&rdquo;
                            </span>
                            <span className="w-2 h-2 bg-[var(--pb-blue-bright)] rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ---------- COST SECTION ---------- */
const CostSection = () => {
    const costs = [
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: "Disposable bags cost $10–$20 each",
            desc: "Every. Single. Bag.",
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: "Crews reuse them to save money",
            desc: "We all know it happens.",
        },
        {
            icon: <Wind className="w-6 h-6" />,
            title: "Reused bags clog and restrict airflow",
            desc: "Less air in = less dirt out.",
        },
        {
            icon: <TrendingDown className="w-6 h-6" />,
            title: "Reduced airflow = slower cleaning",
            desc: "Hours stack up across the week.",
        },
        {
            icon: <Wrench className="w-6 h-6" />,
            title: "More strain = shorter motor life",
            desc: "A silent death for your fleet.",
        },
    ];

    return (
        <section
            id="cost"
            data-testid="cost-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-20 items-start">
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <Reveal>
                            <span className="eyebrow">§ 02 — The Cost</span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h2 className="font-display mt-6 text-[40px] sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[0.95]">
                                Still using{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    disposable
                                </span>{" "}
                                vacuum bags?
                            </h2>
                        </Reveal>
                        <Reveal delay={240}>
                            <p className="mt-6 text-lg lg:text-xl text-[var(--pb-grey)] max-w-md leading-relaxed">
                                Here's what it's really costing you — every
                                week, every crew, every machine. Pak Buddy
                                fixes all of it.
                            </p>
                        </Reveal>
                        <Reveal delay={360}>
                            <div className="mt-10 relative w-full max-w-[480px] aspect-[4/5]">
                                <div className="absolute inset-0 rounded-full bg-red-500/15 blur-3xl" />
                                <img
                                    src={ANGELICA_WITH_DISPOSABLE}
                                    alt="Frustrated crew member holding a floppy, used disposable vacuum bag"
                                    className="relative w-full h-full object-cover rounded-sm border border-white/10 bg-white"
                                    data-testid="cost-image"
                                />
                                <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.25em] text-red-300 uppercase bg-black/70 px-2 py-1 border border-red-400/50">
                                    ⚠ THE OLD WAY
                                </div>
                                <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.25em] text-red-300 uppercase bg-black/70 px-2 py-1 border border-red-400/50">
                                    NOT USING PAK BUDDY
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="space-y-1">
                            {costs.map((c, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div
                                        className="group flex items-start gap-4 lg:gap-6 py-6 lg:py-7 border-b border-white/10 hover:border-[var(--pb-blue-bright)]/60 transition"
                                        data-testid={`cost-item-${i}`}
                                    >
                                        <div className="shrink-0 mt-1 font-mono text-sm text-[var(--pb-blue-bright)] w-10 lg:w-12">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="shrink-0 text-[var(--pb-blue-bright)] group-hover:scale-110 transition-transform">
                                            {c.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-block text-lg lg:text-2xl text-white leading-tight">
                                                {c.title}
                                            </h3>
                                            <p className="mt-2 text-[var(--pb-grey)]">
                                                {c.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal delay={600}>
                            <div className="mt-10 lg:mt-12 p-7 lg:p-10 bg-gradient-to-br from-[var(--pb-ink-2)] to-[var(--pb-ink-3)] border-l-4 border-[var(--pb-blue-bright)] relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 font-display text-[200px] text-[var(--pb-blue)]/10 leading-none select-none">
                                    $
                                </div>
                                <div className="eyebrow mb-4">
                                    The bottom line
                                </div>
                                <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-white leading-tight relative">
                                    You're trying to save{" "}
                                    <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                        $10
                                    </span>
                                    … and risking a machine worth{" "}
                                    <span className="underline decoration-[var(--pb-blue-bright)] decoration-4 underline-offset-8">
                                        hundreds
                                    </span>
                                    .
                                </p>
                                <p className="mt-6 text-lg text-[var(--pb-grey)] relative">
                                    It's not just a bag — it's a bottleneck on
                                    your entire system. Pak Buddy is the fix.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------- HOW IT WORKS ---------- */
const HowItWorks = () => {
    const points = [
        "Separates airflow from debris",
        "Maintains suction as it fills",
        "Reduces motor strain",
        "Built with durable, high-flow material",
    ];
    return (
        <section
            id="how"
            data-testid="how-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink-2)] overflow-hidden"
        >
            <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12 relative">
                <Reveal>
                    <div className="text-center mb-14 lg:mb-16">
                        <span className="eyebrow inline-flex">
                            § 03 — Pak Buddy Engineering
                        </span>
                        <h2 className="font-display mt-6 text-[44px] sm:text-5xl lg:text-7xl xl:text-[88px] text-white max-w-5xl mx-auto leading-[0.92]">
                            Pak Buddy maintains airflow.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Pak Buddy protects
                            </span>{" "}
                            your vacuum.
                        </h2>
                        <p className="mt-6 text-lg lg:text-xl text-[var(--pb-grey)] max-w-2xl mx-auto">
                            Pak Buddy's patented 2-chamber design keeps your
                            system running at full power — from first sweep to
                            last.
                        </p>
                    </div>
                </Reveal>

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <Reveal delay={150} className="lg:col-span-5">
                        <div className="relative">
                            <div className="absolute -inset-2 border border-[var(--pb-blue-bright)]/30 pointer-events-none" />
                            <div className="absolute -top-5 left-0 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                ◢ Pak Buddy 2-chamber · looped
                            </div>
                            <div className="relative aspect-[9/16] max-h-[640px] mx-auto w-full max-w-[420px] bg-black overflow-hidden border border-white/10">
                                <video
                                    src={TWO_CHAMBER_VIDEO}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                    data-testid="two-chamber-video"
                                />
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] tracking-widest text-white/70 uppercase">
                                    <span>PATENTED</span>
                                    <span>◉ LIVE DEMO</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <div className="lg:col-span-7">
                        <Reveal delay={200}>
                            <div className="space-y-8">
                                <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                                    <div className="p-6 border border-red-400/20 bg-red-950/20 relative">
                                        <div className="eyebrow text-red-400 before:bg-red-400 mb-3">
                                            Disposable bags
                                        </div>
                                        <p className="font-block text-lg lg:text-xl text-white leading-tight">
                                            Clog and choke off airflow.
                                        </p>
                                        <div className="mt-4 h-1 bg-white/10 overflow-hidden">
                                            <div className="h-full w-[30%] bg-red-400" />
                                        </div>
                                        <div className="mt-2 font-mono text-[10px] text-red-400/70 tracking-widest">
                                            AIRFLOW —30%
                                        </div>
                                    </div>
                                    <div className="p-6 border border-[var(--pb-blue-bright)]/30 bg-[var(--pb-blue)]/5 relative">
                                        <div className="eyebrow mb-3">
                                            Pak Buddy
                                        </div>
                                        <p className="font-block text-lg lg:text-xl text-white leading-tight">
                                            Keeps air moving freely.
                                        </p>
                                        <div className="mt-4 h-1 bg-white/10 overflow-hidden">
                                            <div className="h-full w-[100%] bg-[var(--pb-blue-bright)]" />
                                        </div>
                                        <div className="mt-2 font-mono text-[10px] text-[var(--pb-blue-bright)] tracking-widest">
                                            AIRFLOW 100%
                                        </div>
                                    </div>
                                </div>

                                <p className="text-lg lg:text-2xl text-[var(--pb-cream)] leading-relaxed">
                                    Pak Buddy's patented 2-chamber system
                                    separates debris from the air path — so
                                    your vacuum maintains consistent suction
                                    from start to finish.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                                    {points.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 p-4 border-l-2 border-[var(--pb-blue-bright)] bg-white/[0.02]"
                                            data-testid={`how-point-${i}`}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-[var(--pb-blue-bright)] shrink-0 mt-0.5" />
                                            <span className="text-white font-medium">
                                                {p}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <blockquote className="relative pl-10 py-4">
                                    <span className="q-glyph absolute -left-2 top-0 text-8xl">
                                        &ldquo;
                                    </span>
                                    <p className="font-display-italic text-2xl lg:text-4xl text-white leading-tight">
                                        With Pak Buddy, it feels like a
                                        completely different machine.
                                    </p>
                                    <footer className="mt-3 font-mono text-xs tracking-[0.25em] text-[var(--pb-blue-bright)] uppercase">
                                        — Working contractor
                                    </footer>
                                </blockquote>

                                <p className="font-display text-xl lg:text-2xl text-[var(--pb-grey)] italic">
                                    With Pak Buddy, your vacuum can finally{" "}
                                    <span className="text-[var(--pb-blue-bright)]">
                                        breathe.
                                    </span>
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------- BENEFITS ---------- */
const Benefits = () => {
    const benefits = [
        {
            icon: <DollarSign className="w-8 h-8" />,
            num: "01",
            tag: "Pak Buddy Saves Money",
            headline: "Stop paying for disposable bags",
            points: [
                "$10–$20 per bag adds up fast",
                "Eliminate ongoing bag costs",
                "Reduce filter replacements",
                "Lower long-term equipment expenses",
            ],
            image: BAG_ON_FLOOR,
        },
        {
            icon: <Zap className="w-8 h-8" />,
            num: "02",
            tag: "Pak Buddy Works Faster",
            headline: "Keep your crews moving",
            points: [
                "No loss of suction mid-job",
                "Consistent performance start to finish",
                "Less time dealing with clogged bags",
                "Jobs get done faster",
            ],
            image: CONTRACTOR_WALKING,
        },
        {
            icon: <Shield className="w-8 h-8" />,
            num: "03",
            tag: "Pak Buddy Protects Equipment",
            headline: "Reduce strain. Extend lifespan.",
            points: [
                "Maintains airflow to reduce motor strain",
                "Prevents overheating from restriction",
                "Helps extend the life of your vacuum",
                "Protects your investment",
            ],
            image: BAG_TOP_VIEW,
        },
    ];

    return (
        <section
            id="benefits"
            data-testid="benefits-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
                <Reveal>
                    <div className="max-w-4xl">
                        <span className="eyebrow">§ 04 — Pak Buddy Benefits</span>
                        <h2 className="font-display mt-6 text-[44px] sm:text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                            Pak Buddy is built for{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                real
                            </span>{" "}
                            job sites.
                        </h2>
                    </div>
                </Reveal>

                <div className="mt-12 lg:mt-16 grid md:grid-cols-3 gap-1 bg-white/10">
                    {benefits.map((b, i) => (
                        <Reveal key={i} delay={i * 150}>
                            <div
                                className="group relative h-full bg-[var(--pb-ink-2)] p-7 lg:p-10 hover:bg-[var(--pb-ink-3)] transition-colors"
                                data-testid={`benefit-card-${i}`}
                            >
                                <div className="flex items-start justify-between mb-7 lg:mb-8">
                                    <div className="text-[var(--pb-blue-bright)] p-3 border border-[var(--pb-blue-bright)]/30 bg-[var(--pb-blue)]/10">
                                        {b.icon}
                                    </div>
                                    <span className="font-display text-6xl text-white/10 leading-none">
                                        {b.num}
                                    </span>
                                </div>
                                <div className="eyebrow mb-4">{b.tag}</div>
                                <h3 className="font-display text-2xl lg:text-4xl text-white leading-tight">
                                    {b.headline}
                                </h3>
                                <ul className="mt-6 space-y-3">
                                    {b.points.map((p, j) => (
                                        <li
                                            key={j}
                                            className="flex items-start gap-3 text-[var(--pb-cream)]"
                                        >
                                            <span className="mt-2 w-1.5 h-1.5 bg-[var(--pb-blue-bright)] shrink-0" />
                                            <span className="text-[15px] leading-relaxed">
                                                {p}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-7 lg:mt-8 aspect-[4/3] overflow-hidden border border-white/10 bg-white">
                                    <img
                                        src={b.image}
                                        alt={b.tag}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={400}>
                    <div className="mt-16 lg:mt-20 text-center">
                        <p className="font-display text-3xl lg:text-5xl text-white max-w-4xl mx-auto leading-tight">
                            Better performance.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Lower cost.
                            </span>{" "}
                            Longer-lasting equipment.
                        </p>
                        <div className="mt-8 lg:mt-10">
                            <CTAButton testId="benefits-cta">
                                Get Pak Buddy
                            </CTAButton>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- BRAND STATEMENT (prominent Pak Buddy logo) ---------- */
const BrandStatement = () => {
    return (
        <section
            data-testid="brand-statement"
            className="relative py-20 lg:py-28 bg-[var(--pb-ink)] border-y border-white/10 overflow-hidden"
        >
            <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--pb-blue)]/20 blur-[140px] pointer-events-none" />
            <div className="max-w-[1200px] mx-auto px-5 lg:px-12 relative text-center">
                <Reveal>
                    <span className="eyebrow inline-flex">
                        ◢ The Pak Buddy promise
                    </span>
                </Reveal>
                <Reveal delay={150}>
                    <img
                        src={PAK_BUDDY_FULL_LOGO}
                        alt="Pak Buddy — full logo with mascot"
                        className="mt-7 lg:mt-10 mx-auto w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[680px] h-auto drop-shadow-[0_0_60px_rgba(69,164,255,0.35)]"
                        data-testid="brand-logo-large"
                    />
                </Reveal>
                <Reveal delay={300}>
                    <p className="mt-6 lg:mt-8 font-display-italic text-2xl sm:text-3xl lg:text-4xl text-white max-w-3xl mx-auto leading-tight">
                        One reusable bag. Endlessly used.{" "}
                        <span className="text-[var(--pb-blue-bright)]">
                            Engineered to outlast disposables — by a lot.
                        </span>
                    </p>
                </Reveal>
                <Reveal delay={450}>
                    <div className="mt-10 flex items-center justify-center gap-3 text-[var(--pb-grey)]">
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
                            Created by
                        </span>
                        <img
                            src={FLOOR_LORD_LOGO}
                            alt="The Floor Lord"
                            className="h-8 lg:h-10 w-auto object-contain"
                        />
                        <span className="font-block text-base lg:text-lg text-white tracking-tight">
                            The Floor Lord
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- TESTIMONIALS ---------- */
const Testimonials = () => {
    const quotes = [
        {
            q: "It feels like a completely different machine.",
            role: "Job-site contractor",
        },
        {
            q: "The suction boost is insane — it sticks to the floor.",
            role: "Cleaning crew lead",
        },
        {
            q: "Guys are finishing jobs faster because Pak Buddy doesn't lose power.",
            role: "Operations manager",
        },
        {
            q: "We are saving hundreds of dollars with Pak Buddy!",
            role: "Small business owner",
        },
    ];
    return (
        <section
            id="testimonials"
            data-testid="testimonials-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink-2)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12 lg:mb-16">
                    <div className="lg:col-span-7">
                        <Reveal>
                            <span className="eyebrow">§ 05 — Field reports</span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h2 className="font-display mt-6 text-[44px] sm:text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                                Contractors are already{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    making
                                </span>{" "}
                                the switch to Pak Buddy.
                            </h2>
                        </Reveal>
                    </div>
                    <div className="lg:col-span-5">
                        <Reveal delay={240}>
                            <p className="text-lg lg:text-xl text-[var(--pb-grey)] leading-relaxed">
                                Once crews try Pak Buddy, they don't go back to
                                disposable bags. Here's what they're saying on
                                the job.
                            </p>
                        </Reveal>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
                    {quotes.map((q, i) => (
                        <Reveal key={i} delay={i * 120}>
                            <div
                                className="relative p-8 lg:p-12 bg-[var(--pb-ink)] border border-white/10 hover:border-[var(--pb-blue-bright)]/60 transition-colors h-full"
                                data-testid={`testimonial-${i}`}
                            >
                                <span className="q-glyph absolute top-4 left-6 text-9xl">
                                    &ldquo;
                                </span>
                                <p className="relative font-display text-2xl lg:text-3xl text-white leading-snug pt-6">
                                    {q.q}
                                </p>
                                <div className="mt-7 lg:mt-8 pt-5 lg:pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="font-mono text-[10px] lg:text-xs tracking-[0.22em] text-[var(--pb-blue-bright)] uppercase">
                                        {q.role}
                                    </span>
                                    <span className="flex gap-0.5">
                                        {[...Array(5)].map((_, s) => (
                                            <svg
                                                key={s}
                                                className="w-4 h-4 text-[var(--pb-blue-bright)]"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={500}>
                    <div className="mt-12 lg:mt-16 text-center">
                        <p className="font-display-italic text-2xl lg:text-3xl text-[var(--pb-grey)] max-w-3xl mx-auto">
                            Once crews switch to Pak Buddy, they don't go back.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- SUSTAINABILITY (with Angelica) ---------- */
const Sustainability = () => {
    return (
        <section
            data-testid="sustainability-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    <Reveal className="lg:col-span-6">
                        <span className="eyebrow">§ 06 — Sustainability</span>
                        <h2 className="font-display mt-6 text-[44px] sm:text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                            Pak Buddy: less waste.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Smarter
                            </span>{" "}
                            operation.
                        </h2>
                        <p className="mt-7 lg:mt-8 text-lg lg:text-xl text-[var(--pb-grey)] leading-relaxed max-w-xl">
                            Disposable bags get used once — and thrown away.
                            Multiply that across your crews, every day.
                        </p>
                        <p className="mt-4 text-lg lg:text-xl text-[var(--pb-cream)] leading-relaxed max-w-xl">
                            Pak Buddy replaces that with a reusable system that
                            cuts down on daily waste and keeps bags out of the
                            landfill.
                        </p>

                        <div className="mt-10 grid sm:grid-cols-3 gap-5 lg:gap-6">
                            {[
                                { n: "0", label: "Daily bag disposal" },
                                { n: "∞", label: "Reuses per Pak Buddy" },
                                { n: "1", label: "Smarter operation" },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="border-t border-[var(--pb-blue-bright)]/40 pt-4"
                                    data-testid={`sustain-stat-${i}`}
                                >
                                    <div className="font-display text-5xl lg:text-6xl text-[var(--pb-blue-bright)] counter-digit">
                                        {s.n}
                                    </div>
                                    <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-[var(--pb-grey)] uppercase">
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-10 font-display-italic text-xl lg:text-2xl text-white">
                            Less waste. Lower cost. Same performance —{" "}
                            <span className="text-[var(--pb-blue-bright)]">
                                actually better with Pak Buddy.
                            </span>
                        </p>
                    </Reveal>

                    <Reveal delay={200} className="lg:col-span-6">
                        <div className="relative">
                            <div className="absolute -inset-4 border border-[var(--pb-blue-bright)]/20 pointer-events-none" />
                            <img
                                src={ANGELICA_HOLDING_PAK_BUDDY}
                                alt="Crew member smiling, holding the Pak Buddy reusable vacuum bag while wearing a backpack vacuum"
                                className="relative w-full aspect-[4/5] object-cover bg-white border border-white/10"
                                data-testid="sustain-image"
                            />
                            <div className="absolute top-4 left-4 bg-[var(--pb-blue)] text-[var(--pb-ink)] px-3 py-1.5 font-block text-xs tracking-widest">
                                REUSABLE · ENDLESSLY
                            </div>
                            <div className="absolute bottom-4 right-4 bg-[var(--pb-ink)] text-[var(--pb-blue-bright)] px-3 py-1.5 font-block text-xs tracking-widest border border-[var(--pb-blue-bright)]/40">
                                ◢ MEET PAK BUDDY
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

/* ---------- FAQ ---------- */
const FAQ = () => {
    const items = [
        {
            q: "What backpack vacuums does Pak Buddy fit?",
            a: "Pak Buddy is engineered to replace 7 1/2 in. to 9 in. disposable bags for commercial backpack vacuums used by professional cleaning, restoration, and contracting crews. If you're outfitting a fleet, drop us a note in the form below and we'll confirm fit for your specific machine.",
        },
        {
            q: "How does Pak Buddy maintain suction better than disposable bags?",
            a: "Pak Buddy's patented 2-chamber design separates debris from the air path. Disposable bags choke off airflow as they fill — Pak Buddy keeps the airway open, so suction stays consistent from start to finish.",
        },
        {
            q: "Is Pak Buddy actually reusable? How do I clean it?",
            a: "Yes — Pak Buddy is fully reusable. Empty the debris into your job-site bin, give it a quick shake, and it's ready for the next run. Built with durable, high-flow material designed for repeated job-site use.",
        },
        {
            q: "How much money does Pak Buddy save?",
            a: "Disposable bags run $10–$20 each. A single crew burning through a few bags per week adds up to hundreds of dollars per machine, per year. Most customers report Pak Buddy paying for itself almost immediately.",
        },
        {
            q: "Will Pak Buddy actually extend the life of my vacuum?",
            a: "Restricted airflow forces the motor to work harder, run hotter, and fail sooner. By keeping airflow open, Pak Buddy reduces motor strain and helps protect the investment you made in your professional equipment.",
        },
        {
            q: "Do you offer fleet pricing?",
            a: "Yes. If you're outfitting multiple crews or running a multi-site operation, use the fleet inquiry form below — we'll get back to you with bulk pricing and rollout details.",
        },
    ];
    return (
        <section
            id="faq"
            data-testid="faq-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink-2)] overflow-hidden"
        >
            <div className="max-w-[1100px] mx-auto px-5 lg:px-12">
                <Reveal>
                    <div className="text-center mb-12 lg:mb-16">
                        <span className="eyebrow inline-flex">
                            § 07 — Pak Buddy FAQ
                        </span>
                        <h2 className="font-display mt-6 text-[44px] sm:text-5xl lg:text-7xl text-white leading-[0.92]">
                            Questions, asked &{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                answered
                            </span>
                            .
                        </h2>
                    </div>
                </Reveal>

                <Reveal delay={150}>
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full divide-y divide-white/10 border-t border-b border-white/10"
                        data-testid="faq-accordion"
                    >
                        {items.map((it, i) => (
                            <AccordionItem
                                key={i}
                                value={`item-${i}`}
                                className="border-b-0"
                                data-testid={`faq-item-${i}`}
                            >
                                <AccordionTrigger className="py-6 text-left font-display text-xl lg:text-2xl text-white hover:text-[var(--pb-blue-bright)] hover:no-underline">
                                    <span className="flex items-baseline gap-4">
                                        <span className="font-mono text-xs text-[var(--pb-blue-bright)] tracking-widest">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span>{it.q}</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 pl-12 text-base lg:text-lg text-[var(--pb-grey)] leading-relaxed">
                                    {it.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- FLEET INQUIRY FORM ---------- */
const FleetInquiry = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        crews: "",
        message: "",
        website: "", // honeypot — must stay empty
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Please add your name and email so we can reply.");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(`${API}/fleet-inquiry`, form);
            setSubmitted(true);
            toast.success("Thanks — we'll be in touch about your fleet.");
            setForm({
                name: "",
                email: "",
                company: "",
                crews: "",
                message: "",
                website: "",
            });
        } catch (err) {
            const msg =
                err?.response?.data?.detail?.[0]?.msg ||
                err?.response?.data?.detail ||
                "Something went wrong. Please try again.";
            toast.error(typeof msg === "string" ? msg : "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            id="fleet"
            data-testid="fleet-section"
            className="relative py-20 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--pb-blue-deep)]/15 blur-[140px] pointer-events-none" />
            <div className="max-w-[1200px] mx-auto px-5 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                    <Reveal className="lg:col-span-5">
                        <span className="eyebrow">
                            § 08 — Fleet & bulk inquiry
                        </span>
                        <h2 className="font-display mt-6 text-[40px] sm:text-5xl lg:text-6xl text-white leading-[0.95]">
                            Outfitting a{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                fleet
                            </span>{" "}
                            with Pak Buddy?
                        </h2>
                        <p className="mt-6 text-lg text-[var(--pb-grey)] leading-relaxed max-w-md">
                            If you're rolling out Pak Buddy across multiple
                            crews or sites, drop us your details and we'll
                            follow up with bulk pricing, fit confirmation, and
                            rollout support.
                        </p>
                        <div className="mt-8 flex items-start gap-4 p-5 border border-[var(--pb-blue-bright)]/30 bg-[var(--pb-blue)]/5">
                            <Truck className="w-6 h-6 text-[var(--pb-blue-bright)] shrink-0 mt-0.5" />
                            <div>
                                <div className="font-block text-sm text-white">
                                    Bulk + fleet pricing
                                </div>
                                <div className="mt-1 font-mono text-[11px] tracking-widest text-[var(--pb-grey)] uppercase">
                                    For 5+ Pak Buddy units
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={200} className="lg:col-span-7 w-full">
                        {submitted ? (
                            <div
                                className="p-10 lg:p-14 border border-[var(--pb-blue-bright)]/40 bg-[var(--pb-ink-2)] text-center"
                                data-testid="fleet-success"
                            >
                                <CheckCircle2 className="w-12 h-12 text-[var(--pb-blue-bright)] mx-auto" />
                                <h3 className="mt-5 font-display text-3xl lg:text-4xl text-white">
                                    Message received.
                                </h3>
                                <p className="mt-3 text-[var(--pb-grey)]">
                                    Thanks — we'll be in touch shortly with
                                    Pak Buddy fleet details.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-7 pb-btn-ghost"
                                    data-testid="fleet-reset"
                                >
                                    Submit another inquiry
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={onSubmit}
                                className="relative p-7 lg:p-10 border border-white/10 bg-[var(--pb-ink-2)] space-y-5"
                                data-testid="fleet-form"
                            >
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field
                                        label="Your name"
                                        name="name"
                                        value={form.name}
                                        onChange={(v) =>
                                            setForm({ ...form, name: v })
                                        }
                                        required
                                        testId="fleet-name"
                                    />
                                    <Field
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(v) =>
                                            setForm({ ...form, email: v })
                                        }
                                        required
                                        testId="fleet-email"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field
                                        label="Company"
                                        name="company"
                                        value={form.company}
                                        onChange={(v) =>
                                            setForm({ ...form, company: v })
                                        }
                                        testId="fleet-company"
                                    />
                                    <Field
                                        label="# of crews / units"
                                        name="crews"
                                        value={form.crews}
                                        onChange={(v) =>
                                            setForm({ ...form, crews: v })
                                        }
                                        placeholder="e.g. 12 crews"
                                        testId="fleet-crews"
                                    />
                                </div>
                                <Field
                                    label="Anything we should know?"
                                    name="message"
                                    value={form.message}
                                    onChange={(v) =>
                                        setForm({ ...form, message: v })
                                    }
                                    multiline
                                    placeholder="Backpack vacuum models, timeline, etc."
                                    testId="fleet-message"
                                />
                                {/* Honeypot — visually hidden, off-screen, aria hidden. Bots fill it; humans don't. */}
                                <div
                                    aria-hidden="true"
                                    style={{
                                        position: "absolute",
                                        left: "-10000px",
                                        top: "auto",
                                        width: "1px",
                                        height: "1px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <label>
                                        Website
                                        <input
                                            type="text"
                                            name="website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.website}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    website: e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                    <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--pb-grey-2)] uppercase">
                                        We reply within 1 business day
                                    </p>
                                    <button
                                        type="submit"
                                        className="pb-btn"
                                        disabled={submitting}
                                        data-testid="fleet-submit"
                                    >
                                        <span>
                                            {submitting
                                                ? "Sending…"
                                                : "Send fleet inquiry"}
                                        </span>
                                        <Send className="w-5 h-5" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

const Field = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    required,
    placeholder,
    multiline,
    testId,
}) => {
    const base =
        "w-full bg-[var(--pb-ink)] border border-white/15 px-4 py-3 text-white placeholder:text-[var(--pb-grey-2)] focus:outline-none focus:border-[var(--pb-blue-bright)] transition";
    return (
        <label className="block">
            <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--pb-blue-bright)] uppercase block mb-2">
                {label}
                {required ? " *" : ""}
            </span>
            {multiline ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    required={required}
                    placeholder={placeholder}
                    className={base}
                    data-testid={testId}
                />
            ) : (
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className={base}
                    data-testid={testId}
                />
            )}
        </label>
    );
};

/* ---------- PAK BUDDY GALLERY (bottom showcase) ---------- */
const PakBuddyGallery = () => {
    return (
        <section
            data-testid="gallery-section"
            className="relative py-20 lg:py-32 bg-[var(--pb-ink-2)] border-y border-white/10 overflow-hidden"
        >
            <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end mb-12 lg:mb-16">
                    <Reveal className="lg:col-span-7">
                        <span className="eyebrow">§ 10 — Pak Buddy in the wild</span>
                        <h2 className="font-display mt-6 text-[40px] sm:text-5xl lg:text-7xl text-white leading-[0.95]">
                            Pak Buddy on the{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                clock
                            </span>
                            .
                        </h2>
                    </Reveal>
                    <Reveal delay={150} className="lg:col-span-5">
                        <p className="text-lg text-[var(--pb-grey)] leading-relaxed">
                            Real bags, real machines, real crews. The disposable
                            chapter is over — Pak Buddy keeps your operation
                            moving with consistent suction, less waste, and a
                            mascot that's not afraid of dirty work.
                        </p>
                    </Reveal>
                </div>

                {/* Editorial image grid */}
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
                    {/* Comparison shot — large */}
                    <Reveal className="col-span-2 lg:col-span-6 lg:row-span-2">
                        <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-white group">
                            <img
                                src={ANGELICA_COMPARISON}
                                alt="Crew member holding a clean black Pak Buddy in one hand and a worn paper disposable bag in the other"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                data-testid="gallery-comparison"
                            />
                            <div className="absolute top-4 left-4 bg-[var(--pb-blue)] text-[var(--pb-ink)] px-3 py-1.5 font-block text-xs tracking-widest">
                                ◢ THE COMPARISON
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] tracking-widest text-white uppercase">
                                <span className="bg-black/70 px-2 py-1 border border-[var(--pb-blue-bright)]/40">
                                    Pak Buddy
                                </span>
                                <span className="bg-black/70 px-2 py-1 border border-red-400/40 text-red-300">
                                    Disposable
                                </span>
                            </div>
                        </div>
                    </Reveal>

                    {/* Product render */}
                    <Reveal delay={120} className="col-span-1 lg:col-span-3">
                        <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-[var(--pb-ink)] group">
                            <img
                                src={PRODUCT_RENDER}
                                alt="Pak Buddy 3D product render — black reusable bag with white collar"
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                data-testid="gallery-product"
                            />
                            <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-[var(--pb-blue-bright)] uppercase bg-black/60 px-2 py-1 border border-[var(--pb-blue-bright)]/40">
                                The product
                            </div>
                        </div>
                    </Reveal>

                    {/* Full logo with mascot */}
                    <Reveal delay={200} className="col-span-1 lg:col-span-3">
                        <div className="relative aspect-[4/5] overflow-hidden border border-[var(--pb-blue-bright)]/40 bg-gradient-to-br from-[var(--pb-ink)] to-[var(--pb-ink-3)] flex items-center justify-center p-6 lg:p-8">
                            <img
                                src={PAK_BUDDY_FULL_LOGO}
                                alt="Pak Buddy full logo with green mascot character"
                                className="w-full h-auto max-h-full object-contain drop-shadow-[0_0_30px_rgba(69,164,255,0.4)] float-slow"
                                data-testid="gallery-logo"
                            />
                            <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-[var(--pb-blue-bright)] uppercase bg-black/60 px-2 py-1 border border-[var(--pb-blue-bright)]/40">
                                The mascot
                            </div>
                        </div>
                    </Reveal>

                    {/* Smoking vac */}
                    <Reveal delay={300} className="col-span-1 lg:col-span-3">
                        <div className="relative aspect-square overflow-hidden border border-white/10 bg-black group">
                            <img
                                src={SMOKING_VAC}
                                alt="Backpack vacuum smoking on a construction job site"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                data-testid="gallery-smoking"
                            />
                            <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-red-300 uppercase bg-black/70 px-2 py-1 border border-red-400/50">
                                ⚠ Without Pak Buddy
                            </div>
                        </div>
                    </Reveal>

                    {/* Contractor questioning */}
                    <Reveal delay={400} className="col-span-1 lg:col-span-3">
                        <div className="relative aspect-square overflow-hidden border border-white/10 bg-white group">
                            <img
                                src={CONTRACTOR_QUESTIONING}
                                alt="Contractor on a dusty floor questioning his disposable bag"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                data-testid="gallery-questioning"
                            />
                            <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-[var(--pb-blue-bright)] uppercase bg-black/60 px-2 py-1 border border-[var(--pb-blue-bright)]/40">
                                "There's a better way"
                            </div>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={500}>
                    <div className="mt-12 lg:mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
                        <p className="font-display-italic text-2xl lg:text-3xl text-white max-w-2xl">
                            Stop guessing. Stop replacing.{" "}
                            <span className="text-[var(--pb-blue-bright)]">
                                Stick with Pak Buddy.
                            </span>
                        </p>
                        <CTAButton testId="gallery-cta">Get Pak Buddy</CTAButton>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- FINAL CTA ---------- */
const FinalCTA = () => {
    return (
        <section
            data-testid="final-cta-section"
            className="relative py-24 lg:py-40 overflow-hidden grain"
            style={{
                background:
                    "radial-gradient(ellipse at center, var(--pb-ink-3) 0%, var(--pb-ink) 70%)",
            }}
        >
            <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[var(--pb-blue)]/20 blur-[140px] pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-5 lg:px-12 relative text-center">
                <Reveal>
                    <span className="eyebrow inline-flex">
                        § 09 — Upgrade
                    </span>
                </Reveal>
                <Reveal delay={120}>
                    <h2 className="font-display mt-7 lg:mt-8 text-[56px] sm:text-7xl lg:text-8xl xl:text-[120px] text-white leading-[0.9]">
                        Stop replacing bags.{" "}
                        <span className="font-display-italic text-[var(--pb-blue-bright)]">
                            Upgrade
                        </span>{" "}
                        to Pak Buddy.
                    </h2>
                </Reveal>
                <Reveal delay={240}>
                    <p className="mt-7 lg:mt-8 text-lg lg:text-2xl text-[var(--pb-grey)] max-w-2xl mx-auto">
                        Reusable. More efficient. Built for real job sites.
                    </p>
                </Reveal>
                <Reveal delay={360}>
                    <div className="mt-10 lg:mt-12 flex flex-wrap gap-5 justify-center">
                        <CTAButton testId="final-cta-primary">
                            Get Pak Buddy
                        </CTAButton>
                        <a
                            href="#top"
                            className="pb-btn-ghost"
                            data-testid="final-cta-secondary"
                        >
                            Watch the film again
                        </a>
                    </div>
                </Reveal>

                <Reveal delay={500}>
                    <div className="mt-16 lg:mt-20 pt-10 lg:pt-12 border-t border-white/10 grid md:grid-cols-2 gap-8 lg:gap-10 text-left max-w-4xl mx-auto">
                        <div>
                            <div className="eyebrow mb-4">
                                For working crews
                            </div>
                            <p className="font-display text-2xl lg:text-3xl text-white leading-tight">
                                Pak Buddy is used by contractors who want
                                better performance and lower operating costs.
                            </p>
                        </div>
                        <div>
                            <div className="eyebrow mb-4">
                                Protect your investment
                            </div>
                            <p className="font-display text-2xl lg:text-3xl text-white leading-tight">
                                You invested in professional machines. Pak
                                Buddy keeps them running at{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    top form
                                </span>{" "}
                                — and saves you money too.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- FOOTER ---------- */
const Footer = () => {
    return (
        <footer
            data-testid="footer"
            className="relative bg-[var(--pb-ink-2)] border-t border-white/10 py-12 lg:py-14 pb-28 md:pb-14"
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
                <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-10 items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <img
                                src={PAK_BUDDY_TEXT_LOGO}
                                alt="Pak Buddy"
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                        <div className="mt-5 inline-flex items-center gap-3 px-4 py-3 border border-white/10 bg-[var(--pb-ink)]">
                            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--pb-grey)]">
                                Created by
                            </span>
                            <img
                                src={FLOOR_LORD_LOGO}
                                alt="The Floor Lord"
                                className="w-9 h-9 object-contain"
                            />
                            <span className="font-block text-base text-white tracking-tight">
                                The Floor Lord
                            </span>
                        </div>
                        <p className="mt-6 text-[var(--pb-grey)] max-w-md leading-relaxed">
                            Pak Buddy is the reusable replacement for backpack
                            disposable vacuum bags. Engineered for commercial
                            backpack vacuums and the crews that depend on them.
                        </p>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Navigate</div>
                        <ul className="space-y-3 text-[var(--pb-cream)]">
                            <li>
                                <a
                                    href="#cost"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    The Cost
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#how"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    How Pak Buddy Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#benefits"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    Benefits
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#fleet"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    Fleet inquiry
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Get yours</div>
                        <p className="text-[var(--pb-cream)] mb-5 leading-relaxed">
                            Ready to upgrade to Pak Buddy?
                        </p>
                        <CTAButton testId="footer-cta">Get Pak Buddy</CTAButton>
                    </div>
                </div>

                <div className="mt-12 lg:mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="font-mono text-[10px] lg:text-[11px] tracking-[0.22em] text-[var(--pb-grey-2)] uppercase">
                        © {new Date().getFullYear()} Pak Buddy™ · Created by The Floor Lord · Patented 2-chamber system
                    </div>
                    <div className="font-mono text-[10px] lg:text-[11px] tracking-[0.22em] text-[var(--pb-grey-2)] uppercase">
                        Tough Jobs. Clean Solutions. That's my Pak Buddy.
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* ---------- APP ---------- */
function App() {
    useEffect(() => {
        document.title =
            "Pak Buddy — Reusable Vacuum Bag for Commercial Backpack Vacuums";
    }, []);

    return (
        <div className="App min-h-screen bg-[var(--pb-ink)] text-[var(--pb-cream)]">
            <Toaster
                theme="dark"
                position="top-center"
                toastOptions={{
                    style: {
                        background: "var(--pb-ink-2)",
                        border: "1px solid rgba(69,164,255,0.4)",
                        color: "var(--pb-cream)",
                    },
                }}
            />
            <Nav />
            <main>
                <Hero />
                <MicroProof />
                <CostSection />
                <HowItWorks />
                <Benefits />
                <BrandStatement />
                <Testimonials />
                <Sustainability />
                <FAQ />
                <FleetInquiry />
                <PakBuddyGallery />
                <FinalCTA />
            </main>
            <Footer />
            <StickyMobileCTA />
        </div>
    );
}

export default App;
