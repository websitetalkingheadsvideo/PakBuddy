import { useEffect, useRef, useState } from "react";
import "@/App.css";
import {
    ArrowRight,
    Play,
    Zap,
    Shield,
    DollarSign,
    Leaf,
    Wind,
    AlertTriangle,
    CheckCircle2,
    Wrench,
    TrendingDown,
} from "lucide-react";

const STORE_URL = "https://thefloorlord.com/product/pak-buddy/";
const VIMEO_ID = "1187115103";
const VIMEO_HASH = "5f13bd3cbe";
const TWO_CHAMBER_VIDEO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/01x8i0a9_2ChamberVertical.webm";

const PAK_BUDDY_LOGO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/60cur2nl_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2005_26_40%20PM.png";
const FLOOR_LORD_LOGO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/94ryg16v_Floor%20Lord%20Logo.png";
const PAK_BUDDY_HERO =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/lxr5c9ji_PakBuddy-01.png";
const CONTRACTOR_1 =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/mykss7pm_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_23_57%20PM.png";
const CONTRACTOR_2 =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/ct14px3q_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_29_13%20PM.png";
const SMOKING_VAC =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/x5fd4whr_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_35_40%20PM.png";
const WOMAN_HOLDING =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/oktsl3xt_1-1.jpg";
const BAG_TOP_VIEW =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/8d6uo9uj_2-1.jpg";
const BAG_SIDE_BY_SIDE =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/myrts1fu_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2004_59_20%20PM.png";
const CONTRACTOR_FRUSTRATED =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/kts01vet_ChatGPT%20Image%20Apr%2027%2C%202026%2C%2005_15_11%20PM.png";
const PAK_BUDDY_POSTER =
    "https://customer-assets.emergentagent.com/job_vacuum-efficiency/artifacts/nr69g1v5_image.png";

/* ---------- Small helpers ---------- */

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

const CTAButton = ({ children = "Get Pak Buddy", variant = "primary", testId }) => {
    if (variant === "ghost") {
        return (
            <a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-btn-ghost"
                data-testid={testId}
            >
                {children}
                <ArrowRight className="w-4 h-4" />
            </a>
        );
    }
    return (
        <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pb-btn"
            data-testid={testId}
        >
            <span>{children}</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </a>
    );
};

/* ---------- NAV ---------- */

const Nav = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    return (
        <nav
            data-testid="main-nav"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[rgba(7,16,31,0.85)] backdrop-blur-xl border-b border-white/5"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
                <a
                    href="#top"
                    className="flex items-center gap-3"
                    data-testid="nav-logo"
                >
                    <img
                        src={FLOOR_LORD_LOGO}
                        alt="Floor Lord Industries"
                        className="h-11 w-11 object-contain"
                    />
                    <div className="flex flex-col leading-none">
                        <span className="font-block text-lg tracking-tight">
                            PAK BUDDY
                        </span>
                        <span className="font-mono text-[10px] text-[var(--pb-blue-bright)] tracking-widest mt-0.5">
                            BY FLOOR LORD
                        </span>
                    </div>
                </a>
                <div className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pb-grey)]">
                    <a
                        href="#cost"
                        className="hover:text-[var(--pb-blue-bright)] transition"
                        data-testid="nav-cost"
                    >
                        The Cost
                    </a>
                    <a
                        href="#how"
                        className="hover:text-[var(--pb-blue-bright)] transition"
                        data-testid="nav-how"
                    >
                        How It Works
                    </a>
                    <a
                        href="#benefits"
                        className="hover:text-[var(--pb-blue-bright)] transition"
                        data-testid="nav-benefits"
                    >
                        Benefits
                    </a>
                    <a
                        href="#testimonials"
                        className="hover:text-[var(--pb-blue-bright)] transition"
                        data-testid="nav-testimonials"
                    >
                        Reviews
                    </a>
                </div>
                <CTAButton testId="nav-cta">Get Pak Buddy</CTAButton>
            </div>
        </nav>
    );
};

/* ---------- HERO ---------- */

const Hero = () => {
    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative pt-36 pb-20 lg:pt-44 lg:pb-28 overflow-hidden grain blueprint-grid"
        >
            {/* Deco blobs */}
            <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[var(--pb-blue-deep)] opacity-25 blur-[120px] pointer-events-none" />
            <div className="absolute top-40 right-0 w-[380px] h-[380px] rounded-full bg-[var(--pb-blue)] opacity-15 blur-[110px] pointer-events-none" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    {/* LEFT: copy */}
                    <div className="lg:col-span-6 relative z-10">
                        <Reveal>
                            <span className="eyebrow" data-testid="hero-eyebrow">
                                For commercial backpack vacuums
                            </span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h1
                                className="font-display mt-6 text-5xl sm:text-6xl lg:text-7xl xl:text-[92px] text-white"
                                data-testid="hero-headline"
                            >
                                Finally — a{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    reusable
                                </span>{" "}
                                replacement for backpack disposable vacuum bags.
                            </h1>
                        </Reveal>
                        <Reveal delay={240}>
                            <p
                                className="mt-8 text-lg lg:text-xl text-[var(--pb-grey)] max-w-xl leading-relaxed"
                                data-testid="hero-subline"
                            >
                                Save money, increase crew efficiency, and
                                protect your equipment — one bag, endlessly
                                reusable, engineered for real job sites.
                            </p>
                        </Reveal>

                        <Reveal delay={360}>
                            <div className="mt-10 flex flex-wrap gap-4 items-center">
                                <CTAButton testId="hero-primary-cta">
                                    Get Pak Buddy
                                </CTAButton>
                                <a
                                    href="#how"
                                    className="pb-btn-ghost"
                                    data-testid="hero-secondary-cta"
                                >
                                    <Play className="w-4 h-4" />
                                    See how it works
                                </a>
                            </div>
                        </Reveal>

                        <Reveal delay={500}>
                            <div className="mt-12 flex items-center gap-6 flex-wrap">
                                <div className="flex -space-x-3">
                                    {[CONTRACTOR_1, WOMAN_HOLDING, CONTRACTOR_2].map(
                                        (src, i) => (
                                            <div
                                                key={i}
                                                className="w-11 h-11 rounded-full border-2 border-[var(--pb-ink)] overflow-hidden bg-[var(--pb-steel)]"
                                            >
                                                <img
                                                    src={src}
                                                    alt="Contractor"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )
                                    )}
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

                    {/* RIGHT: video */}
                    <div className="lg:col-span-6 relative">
                        <Reveal delay={300}>
                            <div className="relative">
                                {/* Frame */}
                                <div className="absolute -inset-3 border border-[var(--pb-blue-bright)]/30 rounded-sm pointer-events-none" />
                                <div className="absolute -top-6 -left-6 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                    ◢ 01 / Sales film
                                </div>
                                <div className="absolute -bottom-6 -right-6 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                    Pak Buddy™ ◣
                                </div>

                                <div
                                    className="relative aspect-[9/16] lg:aspect-[4/5] w-full overflow-hidden bg-black rounded-sm border border-white/10"
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

                                {/* Corner brackets */}
                                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[var(--pb-blue-bright)]" />
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[var(--pb-blue-bright)]" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------- MARQUEE TESTIMONIALS ---------- */

const MicroProof = () => {
    const quotes = [
        "It feels like a completely different machine.",
        "The suction boost is insane — it sticks to the floor.",
        "Guys are finishing jobs faster because it doesn't lose power.",
        "We are saving hundreds of dollars with Pak Buddy.",
    ];
    const doubled = [...quotes, ...quotes, ...quotes];
    return (
        <section
            className="relative py-10 border-y border-white/10 bg-[var(--pb-ink-2)]"
            data-testid="proof-marquee"
        >
            <div className="overflow-hidden">
                <div className="marquee-track flex gap-16 whitespace-nowrap w-[300%]">
                    {doubled.map((q, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 shrink-0"
                        >
                            <span className="font-display-italic text-2xl lg:text-3xl text-white">
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
            className="relative py-24 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <Reveal>
                            <span className="eyebrow">§ 02 — The Cost</span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h2 className="font-display mt-6 text-5xl lg:text-6xl xl:text-7xl text-white">
                                Still using{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    disposable
                                </span>{" "}
                                vacuum bags?
                            </h2>
                        </Reveal>
                        <Reveal delay={240}>
                            <p className="mt-6 text-xl text-[var(--pb-grey)] max-w-md leading-relaxed">
                                Here's what it's really costing you — every
                                week, every crew, every machine.
                            </p>
                        </Reveal>
                        <Reveal delay={360}>
                            <div className="mt-10 relative w-full max-w-[380px] aspect-square">
                                <div className="absolute inset-0 rounded-full bg-[var(--pb-blue)]/15 blur-3xl" />
                                <img
                                    src={SMOKING_VAC}
                                    alt="Overheating vacuum with smoke rising"
                                    className="relative w-full h-full object-cover rounded-sm border border-white/10"
                                    data-testid="cost-image"
                                />
                                <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.25em] text-red-400 uppercase bg-black/60 px-2 py-1 border border-red-400/50">
                                    ⚠ SYSTEM STRAIN
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="space-y-1">
                            {costs.map((c, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div
                                        className="group flex items-start gap-6 py-7 border-b border-white/10 hover:border-[var(--pb-blue-bright)]/60 transition"
                                        data-testid={`cost-item-${i}`}
                                    >
                                        <div className="shrink-0 mt-1 font-mono text-sm text-[var(--pb-blue-bright)] w-12">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="shrink-0 text-[var(--pb-blue-bright)] group-hover:scale-110 transition-transform">
                                            {c.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-block text-xl lg:text-2xl text-white leading-tight">
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
                            <div className="mt-12 p-8 lg:p-10 bg-gradient-to-br from-[var(--pb-ink-2)] to-[var(--pb-ink-3)] border-l-4 border-[var(--pb-blue-bright)] relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 font-display text-[200px] text-[var(--pb-blue)]/10 leading-none select-none">
                                    $
                                </div>
                                <div className="eyebrow mb-4">
                                    The bottom line
                                </div>
                                <p className="font-display text-3xl lg:text-4xl text-white leading-tight relative">
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
                                    your entire system.
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
            className="relative py-24 lg:py-36 bg-[var(--pb-ink-2)] overflow-hidden"
        >
            <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative">
                <Reveal>
                    <div className="text-center mb-16">
                        <span className="eyebrow">§ 03 — Engineering</span>
                        <h2 className="font-display mt-6 text-5xl lg:text-7xl xl:text-[88px] text-white max-w-5xl mx-auto">
                            Maintains airflow.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Protects
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
                    {/* Video */}
                    <Reveal delay={150} className="lg:col-span-5">
                        <div className="relative">
                            <div className="absolute -inset-2 border border-[var(--pb-blue-bright)]/30 pointer-events-none" />
                            <div className="absolute -top-5 left-0 font-mono text-[10px] tracking-[0.3em] text-[var(--pb-blue-bright)] uppercase">
                                ◢ 2-chamber system · looped
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

                    {/* Copy */}
                    <div className="lg:col-span-7">
                        <Reveal delay={200}>
                            <div className="space-y-8">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="p-6 border border-red-400/20 bg-red-950/20 relative">
                                        <div className="eyebrow text-red-400 before:bg-red-400 mb-3">
                                            Disposable bags
                                        </div>
                                        <p className="font-block text-xl text-white leading-tight">
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
                                        <p className="font-block text-xl text-white leading-tight">
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

                                <p className="text-xl lg:text-2xl text-[var(--pb-cream)] leading-relaxed">
                                    Its patented 2-chamber system separates
                                    debris from the air path — so your vacuum
                                    maintains consistent suction from start to
                                    finish.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
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
                                    <p className="font-display-italic text-3xl lg:text-4xl text-white leading-tight">
                                        It feels like a completely different
                                        machine.
                                    </p>
                                    <footer className="mt-3 font-mono text-xs tracking-[0.25em] text-[var(--pb-blue-bright)] uppercase">
                                        — Working contractor
                                    </footer>
                                </blockquote>

                                <p className="font-display text-2xl text-[var(--pb-grey)] italic">
                                    Your vacuum can finally{" "}
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
            tag: "Save Money",
            headline: "Stop paying for disposable bags",
            points: [
                "$10–$20 per bag adds up fast",
                "Eliminate ongoing bag costs",
                "Reduce filter replacements",
                "Lower long-term equipment expenses",
            ],
            image: BAG_TOP_VIEW,
        },
        {
            icon: <Zap className="w-8 h-8" />,
            num: "02",
            tag: "Work Faster",
            headline: "Keep your crews moving",
            points: [
                "No loss of suction mid-job",
                "Consistent performance start to finish",
                "Less time dealing with clogged bags",
                "Jobs get done faster",
            ],
            image: CONTRACTOR_2,
        },
        {
            icon: <Shield className="w-8 h-8" />,
            num: "03",
            tag: "Protect Equipment",
            headline: "Reduce strain. Extend lifespan.",
            points: [
                "Maintains airflow to reduce motor strain",
                "Prevents overheating from restriction",
                "Helps extend the life of your vacuum",
                "Protects your investment",
            ],
            image: CONTRACTOR_1,
        },
    ];

    return (
        <section
            id="benefits"
            data-testid="benefits-section"
            className="relative py-24 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <Reveal>
                    <div className="max-w-4xl">
                        <span className="eyebrow">§ 04 — Benefits</span>
                        <h2 className="font-display mt-6 text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                            Built for{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                real
                            </span>{" "}
                            job sites.
                        </h2>
                    </div>
                </Reveal>

                <div className="mt-16 grid md:grid-cols-3 gap-1 bg-white/10">
                    {benefits.map((b, i) => (
                        <Reveal key={i} delay={i * 150}>
                            <div
                                className="group relative h-full bg-[var(--pb-ink-2)] p-8 lg:p-10 hover:bg-[var(--pb-ink-3)] transition-colors"
                                data-testid={`benefit-card-${i}`}
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="text-[var(--pb-blue-bright)] p-3 border border-[var(--pb-blue-bright)]/30 bg-[var(--pb-blue)]/10">
                                        {b.icon}
                                    </div>
                                    <span className="font-display text-6xl text-white/10 leading-none">
                                        {b.num}
                                    </span>
                                </div>
                                <div className="eyebrow mb-4">{b.tag}</div>
                                <h3 className="font-display text-3xl lg:text-4xl text-white leading-tight">
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
                                <div className="mt-8 aspect-[4/3] overflow-hidden border border-white/10">
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
                    <div className="mt-20 text-center">
                        <p className="font-display text-3xl lg:text-5xl text-white max-w-4xl mx-auto leading-tight">
                            Better performance.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Lower cost.
                            </span>{" "}
                            Longer-lasting equipment.
                        </p>
                        <div className="mt-10">
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
            q: "Guys are finishing jobs faster because it doesn't lose power.",
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
            className="relative py-24 lg:py-36 bg-[var(--pb-ink-2)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
                    <div className="lg:col-span-7">
                        <Reveal>
                            <span className="eyebrow">§ 05 — Field reports</span>
                        </Reveal>
                        <Reveal delay={120}>
                            <h2 className="font-display mt-6 text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                                Contractors are already{" "}
                                <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                    making
                                </span>{" "}
                                the switch.
                            </h2>
                        </Reveal>
                    </div>
                    <div className="lg:col-span-5">
                        <Reveal delay={240}>
                            <p className="text-xl text-[var(--pb-grey)] leading-relaxed">
                                Once crews try Pak Buddy, they don't go back to
                                disposable bags. Here's what they're saying on
                                the job.
                            </p>
                        </Reveal>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {quotes.map((q, i) => (
                        <Reveal key={i} delay={i * 120}>
                            <div
                                className="relative p-10 lg:p-12 bg-[var(--pb-ink)] border border-white/10 hover:border-[var(--pb-blue-bright)]/60 transition-colors h-full"
                                data-testid={`testimonial-${i}`}
                            >
                                <span className="q-glyph absolute top-4 left-6 text-9xl">
                                    &ldquo;
                                </span>
                                <p className="relative font-display text-2xl lg:text-3xl text-white leading-snug pt-6">
                                    {q.q}
                                </p>
                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="font-mono text-xs tracking-[0.22em] text-[var(--pb-blue-bright)] uppercase">
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
                    <div className="mt-16 text-center">
                        <p className="font-display-italic text-2xl lg:text-3xl text-[var(--pb-grey)] max-w-3xl mx-auto">
                            Once crews switch, they don't go back to disposable
                            bags.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

/* ---------- SUSTAINABILITY ---------- */

const Sustainability = () => {
    return (
        <section
            data-testid="sustainability-section"
            className="relative py-24 lg:py-36 bg-[var(--pb-ink)] overflow-hidden"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    <Reveal className="lg:col-span-6">
                        <span className="eyebrow">
                            § 06 — Sustainability
                        </span>
                        <h2 className="font-display mt-6 text-5xl lg:text-7xl xl:text-[88px] text-white leading-[0.92]">
                            Less waste.{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                Smarter
                            </span>{" "}
                            operation.
                        </h2>
                        <p className="mt-8 text-xl text-[var(--pb-grey)] leading-relaxed max-w-xl">
                            Disposable bags get used once — and thrown away.
                            Multiply that across your crews, every day.
                        </p>
                        <p className="mt-4 text-xl text-[var(--pb-cream)] leading-relaxed max-w-xl">
                            Pak Buddy replaces that with a reusable system that
                            cuts down on daily waste and keeps bags out of the
                            landfill.
                        </p>

                        <div className="mt-10 grid sm:grid-cols-3 gap-6">
                            {[
                                { n: "0", label: "Daily bag disposal" },
                                { n: "∞", label: "Reuses per bag" },
                                { n: "1", label: "Smarter operation" },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="border-t border-[var(--pb-blue-bright)]/40 pt-4"
                                    data-testid={`sustain-stat-${i}`}
                                >
                                    <div className="font-display text-6xl text-[var(--pb-blue-bright)] counter-digit">
                                        {s.n}
                                    </div>
                                    <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-[var(--pb-grey)] uppercase">
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-10 font-display-italic text-2xl text-white">
                            Less waste. Lower cost. Same performance —{" "}
                            <span className="text-[var(--pb-blue-bright)]">
                                actually better.
                            </span>
                        </p>
                    </Reveal>

                    <Reveal delay={200} className="lg:col-span-6">
                        <div className="relative">
                            <div className="absolute -inset-4 border border-[var(--pb-blue-bright)]/20 pointer-events-none" />
                            <img
                                src={BAG_SIDE_BY_SIDE}
                                alt="Pak Buddy reusable bag next to a commercial backpack vacuum"
                                className="relative w-full aspect-[4/5] object-cover border border-white/10"
                                data-testid="sustain-image"
                            />
                            <div className="absolute top-4 left-4 bg-[var(--pb-blue)] text-[var(--pb-ink)] px-3 py-1.5 font-block text-xs tracking-widest">
                                REUSABLE · ENDLESSLY
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

/* ---------- FINAL CTA ---------- */

const FinalCTA = () => {
    return (
        <section
            data-testid="final-cta-section"
            className="relative py-28 lg:py-40 overflow-hidden grain"
            style={{
                background:
                    "radial-gradient(ellipse at center, var(--pb-ink-3) 0%, var(--pb-ink) 70%)",
            }}
        >
            <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[var(--pb-blue)]/20 blur-[140px] pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative text-center">
                <Reveal>
                    <span className="eyebrow justify-center flex">
                        § 07 — Upgrade
                    </span>
                </Reveal>
                <Reveal delay={120}>
                    <h2 className="font-display mt-8 text-6xl lg:text-8xl xl:text-[120px] text-white leading-[0.9]">
                        Stop replacing bags.{" "}
                        <span className="font-display-italic text-[var(--pb-blue-bright)]">
                            Upgrade
                        </span>{" "}
                        your system.
                    </h2>
                </Reveal>
                <Reveal delay={240}>
                    <p className="mt-8 text-xl lg:text-2xl text-[var(--pb-grey)] max-w-2xl mx-auto">
                        Reusable. More efficient. Built for real job sites.
                    </p>
                </Reveal>
                <Reveal delay={360}>
                    <div className="mt-12 flex flex-wrap gap-5 justify-center">
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
                    <div className="mt-20 pt-12 border-t border-white/10 grid md:grid-cols-2 gap-10 text-left max-w-4xl mx-auto">
                        <div>
                            <div className="eyebrow mb-4">
                                For working crews
                            </div>
                            <p className="font-display text-3xl text-white leading-tight">
                                Used by contractors who want better performance
                                and lower operating costs.
                            </p>
                        </div>
                        <div>
                            <div className="eyebrow mb-4">
                                Protect your investment
                            </div>
                            <p className="font-display text-3xl text-white leading-tight">
                                You invested in professional machines. Pak Buddy
                                keeps them running at{" "}
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
            className="relative bg-[var(--pb-ink-2)] border-t border-white/10 py-14"
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-10 items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <img
                                src={FLOOR_LORD_LOGO}
                                alt="Floor Lord"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <div className="font-block text-xl">
                                    PAK BUDDY™
                                </div>
                                <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--pb-grey)] uppercase mt-1">
                                    A Floor Lord Industries product
                                </div>
                            </div>
                        </div>
                        <p className="mt-6 text-[var(--pb-grey)] max-w-md leading-relaxed">
                            The reusable replacement for backpack disposable
                            vacuum bags. Engineered for commercial backpack
                            vacuums and the crews that depend on them.
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
                                    How It Works
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
                                    href="#testimonials"
                                    className="hover:text-[var(--pb-blue-bright)] transition"
                                >
                                    Reviews
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Get yours</div>
                        <p className="text-[var(--pb-cream)] mb-5 leading-relaxed">
                            Ready to upgrade your system?
                        </p>
                        <CTAButton testId="footer-cta">Get Pak Buddy</CTAButton>
                    </div>
                </div>

                <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--pb-grey-2)] uppercase">
                        © {new Date().getFullYear()} Floor Lord Industries ·
                        Patented 2-chamber system
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--pb-grey-2)] uppercase">
                        Tough Jobs. Clean Solutions. That's my buddy.
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
            <Nav />
            <main>
                <Hero />
                <MicroProof />
                <CostSection />
                <HowItWorks />
                <Benefits />
                <Testimonials />
                <Sustainability />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}

export default App;
