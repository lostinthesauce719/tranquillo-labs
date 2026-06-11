const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV_LINKS = [
  { label: "Home", active: true },
  { label: "Studio" },
  { label: "About" },
  { label: "Journal" },
  { label: "Reach Us" },
];

export default function VelorahHero() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "hsl(201 100% 13%)" }}
    >
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Page content stacked above video */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <span
            className="text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Velorah<sup className="text-xs">®</sup>
          </span>

          {/* Nav links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map(({ label, active }) => (
              <li key={label}>
                <a
                  href="#"
                  className={`text-sm transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform">
            Begin Journey
          </button>
        </nav>

        {/* Hero section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-[90px]">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-7xl font-normal text-foreground animate-fade-rise"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-2.46px",
            }}
          >
            Where{" "}
            <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">
              through the silence.
            </em>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
            We&apos;re designing tools for deep thinkers, bold creators, and
            quiet rebels. Amid the chaos, we build digital spaces for sharp
            focus and inspired work.
          </p>

          <button className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2">
            Begin Journey
          </button>
        </section>
      </div>
    </div>
  );
}
