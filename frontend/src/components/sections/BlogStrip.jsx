import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * "From the Field" strip — fetches /blog/posts.json (the 3 newest posts
 * manifest emitted by scripts/build-blog.js) and renders them as a branded
 * card strip. Hidden entirely if no posts (no layout shift).
 */
export default function BlogStrip() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch("/blog/posts.json", { credentials: "omit" })
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => Array.isArray(data) ? setPosts(data) : setPosts([]))
            .catch(() => setPosts([]));
    }, []);

    if (!posts.length) return null;

    return (
        <section
            data-testid="blog-strip-section"
            className="relative py-16 sm:py-20 bg-[var(--pb-ink-2)] text-[var(--pb-cream)] border-y border-white/10 overflow-hidden"
        >
            <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
            <div className="max-w-[1440px] mx-auto px-5 lg:px-12 relative">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10 lg:mb-14">
                    <div>
                        <span className="eyebrow">§ — From the field</span>
                        <h2 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] max-w-3xl">
                            Hands-on guides &amp;{" "}
                            <span className="font-display-italic text-[var(--pb-blue-bright)]">
                                field-tested
                            </span>{" "}
                            tips.
                        </h2>
                    </div>
                    <a
                        href="/blog"
                        data-testid="blog-strip-all"
                        className="pb-btn-ghost"
                    >
                        All posts
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
                    {posts.map((p, i) => (
                        <a
                            key={p.slug}
                            href={`/blog/${p.slug}`}
                            data-testid={`blog-strip-card-${i}`}
                            className="group block bg-[var(--pb-ink)] border border-white/10 hover:border-[var(--pb-blue-bright)]/60 transition-colors overflow-hidden"
                        >
                            {p.hero_image ? (
                                <div
                                    className="h-48 bg-center bg-cover border-b border-white/10"
                                    style={{
                                        backgroundImage: `url('${p.hero_image}')`,
                                    }}
                                    aria-hidden="true"
                                />
                            ) : (
                                <div className="h-48 bg-[var(--pb-ink-3)] border-b border-white/10 flex items-center justify-center">
                                    <span className="font-display-italic text-3xl text-[var(--pb-blue-bright)]/40">
                                        Pak Buddy
                                    </span>
                                </div>
                            )}
                            <div className="p-5 lg:p-6">
                                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--pb-blue-bright)]">
                                    {new Date(
                                        p.publish_date + "T00:00:00Z"
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        timeZone: "UTC",
                                    })}
                                </div>
                                <h3 className="mt-3 font-display text-xl lg:text-2xl text-white leading-tight">
                                    {p.title}
                                </h3>
                                <p className="mt-3 text-sm text-[var(--pb-grey)] leading-relaxed line-clamp-3">
                                    {p.excerpt}
                                </p>
                                <div className="mt-5 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--pb-blue-bright)] group-hover:text-white inline-flex items-center gap-2 transition-colors">
                                    Read it
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
