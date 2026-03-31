// LandingPage.jsx (Responsive)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Activity, BarChart3, FileText } from "lucide-react";
import { Mail, Phone, MapPin, Linkedin, Instagram } from "lucide-react";

const BG = "#e9eef3";

// Make sure these files exist in /public folder:
// - public/dashboard_photo.jpg
// - public/dashboard_photo_2.jpg
const ABOUT_PHOTOS = ["/dashboard_photo.jpg", "/dashboard_photo_2.jpg"];

const neoLightShadow = `
  -6px -6px 6px rgba(255,255,255,0.5),
  6px 6px 6px rgba(209,214,230,1)
`;

const neoInsetShadow = `
  inset -6px -6px 10px rgba(255,255,255,0.9),
  inset 6px 6px 10px rgba(209,214,230,0.9)
`;

function PcbSideFX({ src = "/pcb_left_tile_v3.png" }) {
    const BG_RGB = "233,238,243";

    return (
        <>
            <style>{`
        .pcbfx {
          --pcb-side-w: clamp(200px, 22vw, 360px);
          --pcb-bleed: 18px;
          --pcb-opacity: 0.85;
          --pcb-fade: clamp(90px, 12vw, 180px);
          --pcb-size: 512px 512px;
          --pcb-solid: 60%;
          z-index: 0; /* di atas konten */
        }

        /* MOBILE: kecilin sisi supaya tidak overlap */
        @media (max-width: 640px) {
          .pcbfx {
            --pcb-side-w: clamp(90px, 26vw, 140px);
            --pcb-bleed: 10px;
            --pcb-opacity: 0.42;          /* lebih halus di mobile */
            --pcb-fade: clamp(90px, 26vw, 160px); /* fade lebih lebar biar gak patah */
            --pcb-size: 680px 680px;      /* bikin pattern lebih jarang */
            --pcb-solid: 42%;
          }
        }
      `}</style>

            <div
                aria-hidden
                className="pcbfx pointer-events-none absolute inset-0 overflow-hidden"
            >
                {/* LEFT */}
                <div
                    className="absolute top-0 bottom-0"
                    style={{
                        left: "calc(0px - var(--pcb-bleed))",
                        width: "calc(var(--pcb-side-w) + var(--pcb-bleed))",
                        opacity: "var(--pcb-opacity)",
                        WebkitMaskImage: `linear-gradient(to right,
                                          rgba(0,0,0,1) 0%,
                                          rgba(0,0,0,1) var(--pcb-solid),
                                          rgba(0,0,0,0) 100%)`,
                        maskImage: `linear-gradient(to right,
                                    rgba(0,0,0,1) 0%,
                                    rgba(0,0,0,1) var(--pcb-solid),
                                    rgba(0,0,0,0) 100%)`,
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url("${src}")`,
                            backgroundRepeat: "repeat-y",
                            backgroundSize: "var(--pcb-size)",
                            backgroundPosition: "left top",
                            filter: "contrast(1.2) saturate(1.02)",
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            right: 0,
                            width: "var(--pcb-fade)",
                            background: `linear-gradient(to right,
                rgba(${BG_RGB}, 0) 0%,
                rgba(${BG_RGB}, 1) 100%)`,
                        }}
                    />
                </div>

                {/* RIGHT */}
                <div
                    className="absolute top-0 bottom-0"
                    style={{
                        right: "calc(0px - var(--pcb-bleed))",
                        width: "calc(var(--pcb-side-w) + var(--pcb-bleed))",
                        opacity: "var(--pcb-opacity)",
                        WebkitMaskImage: `linear-gradient(to left,
                                            rgba(0,0,0,1) 0%,
                                            rgba(0,0,0,1) var(--pcb-solid),
                                            rgba(0,0,0,0) 100%)`,
                        maskImage: `linear-gradient(to left,
                                    rgba(0,0,0,1) 0%,
                                    rgba(0,0,0,1) var(--pcb-solid),
                                    rgba(0,0,0,0) 100%)`,
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url("${src}")`,
                            backgroundRepeat: "repeat-y",
                            backgroundSize: "var(--pcb-size)",
                            backgroundPosition: "left top",
                            transform: "scaleX(-1)",
                            transformOrigin: "center",
                            filter: "contrast(1.2) saturate(1.02)",
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: "var(--pcb-fade)",
                            background: `linear-gradient(to right,
                rgba(${BG_RGB}, 1) 0%,
                rgba(${BG_RGB}, 0) 100%)`,
                        }}
                    />
                </div>
            </div>
        </>
    );
}





function Frame1440({ children }) {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-[1440px]">
                {children}
            </div>
        </div>
    );
}


function NeoSurface({ children, style = {}, className = "" }) {
    return (
        <div
            className={className}
            style={{
                background: BG,
                boxShadow: neoLightShadow,
                borderRadius: 24,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function NeoInset({ children, style = {}, className = "" }) {
    return (
        <div
            className={className}
            style={{
                background: BG,
                boxShadow: neoInsetShadow,
                borderRadius: 18,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function NavPill({ children, href }) {
    return (
        <a
            href={href}
            className="inline-flex items-center justify-center rounded-2xl font-semibold text-slate-500 text-sm
                 h-10 px-4 sm:h-11 sm:px-6"
            style={{
                background: BG,
                boxShadow: neoLightShadow,
            }}
        >
            {children}
        </a>
    );
}

function FeatureCard({ Icon, title, desc }) {
    return (
        <NeoSurface className="w-full" style={{ borderRadius: 22, padding: 28 }}>
            <div className="flex flex-col items-center text-center">
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: 62,
                        height: 62,
                        borderRadius: 16,
                        background: BG,
                        boxShadow: neoLightShadow,
                    }}
                >
                    <Icon size={26} className="text-emerald-600" />
                </div>

                <div className="mt-5 font-bold text-slate-600" style={{ fontSize: 18 }}>
                    {title}
                </div>

                <p className="mt-3 text-slate-400 text-xs leading-[18px] max-w-[260px]">
                    {desc}
                </p>
            </div>
        </NeoSurface>
    );
}

export default function LandingPage() {
    const [aboutIdx, setAboutIdx] = useState(0);

    useEffect(() => {
        if (ABOUT_PHOTOS.length <= 1) return;
        const t = setInterval(() => {
            setAboutIdx((i) => (i + 1) % ABOUT_PHOTOS.length);
        }, 4500);
        return () => clearInterval(t);
    }, []);

    const goPrev = () =>
        setAboutIdx((i) => (i - 1 + ABOUT_PHOTOS.length) % ABOUT_PHOTOS.length);
    const goNext = () => setAboutIdx((i) => (i + 1) % ABOUT_PHOTOS.length);

    return (
        <div style={{ backgroundColor: BG, minHeight: "100dvh", position: "relative", overflowX: "hidden" }}>
            {/* NAVBAR */}
            <header
                className="w-full"
                style={{
                    background: BG,
                    boxShadow: "0px 18px 30px rgba(15,23,42,0.10)",
                }}
            >

                <div className="mx-auto w-full max-w-[1440px] h-[72px] sm:h-[88px] px-4 sm:px-8 lg:px-20 flex items-center">
                    <div className="flex items-center justify-between w-full gap-4">
                        <img
                            src="/Logo.png"
                            alt="STAS RG"
                            className="h-7 sm:h-[34px] w-auto shrink-0"
                            draggable={false}
                        />

                        <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
                            <NavPill href="#about">About</NavPill>
                            <NavPill href="#footer">Contact</NavPill>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ position: "relative" }}>
                <PcbSideFX src="/pcb_left_tile_v3.png" />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <Frame1440>
                        {/* HERO */}
                        <section className="px-4 sm:px-8 lg:px-20 pt-10 sm:pt-12 pb-12 md:pb-14 lg:pb-20">
                            <div
                                className="
                                        mx-auto w-full max-w-[1291px]
                                        relative overflow-visible
                                        aspect-1291/726
                                        min-h-[520px] sm:min-h-[560px] md:min-h-[520px]
                                        "
                            >
                                {/* TEXT SMART SKIN */}
                                <div
                                    className="
                                                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                                z-4 pointer-events-none select-none
                                                w-full max-w-[min(96vw,1200px)]
                                                text-center overflow-visible
                                                "
                                >
                                    <span
                                        className="
                                                inline-block overflow-visible whitespace-nowrap leading-[1.02]
                                                px-[22px] py-5
                                                sm:px-14 sm:py-[34px]
                                                md:px-10 md:py-[26px]
                                                text-[clamp(44px,12vw,92px)]
                                                sm:text-[clamp(56px,9.5vw,170px)]
                                                md:text-[clamp(48px,9.2vw,120px)]
                                                tracking-[0.01em] sm:tracking-[0.02em] md:tracking-[0.015em]
                                                "
                                        style={{
                                            fontFamily: "Nunito Sans, sans-serif",
                                            fontWeight: 800,
                                            color: BG,
                                            textShadow: `
                                                -1.5px -1.5px 0 rgba(255,255,255,0.75),
                                                1.5px  1.5px 0 rgba(165,175,195,0.20),
                                                -10px -10px 18px rgba(255,255,255,0.80),
                                                10px  10px 18px rgba(155,165,185,0.35)
                                            `,
                                        }}
                                    >
                                        SMART&nbsp;SKIN
                                    </span>
                                </div>

                                {/* MANNEQUIN */}
                                <img
                                    src="/manequin.png"
                                    alt="Mannequin Smart Skin"
                                    draggable={false}
                                    className="
                                                absolute inset-0 m-auto w-full h-full object-contain z-2
                                                opacity-[0.42] sm:opacity-[0.45]
                                            "
                                />

                                {/* BOTTOM FADES */}
                                <div
                                    className="absolute left-0 right-0 bottom-0 z-3 pointer-events-none"
                                    style={{
                                        height: "clamp(170px, 30vw, 300px)",
                                        background:
                                            "linear-gradient(to bottom, rgba(233,238,243,0) 0%, rgba(233,238,243,0.75) 55%, rgba(233,238,243,1) 92%)",
                                    }}
                                />
                                <div
                                    className="absolute left-0 right-0 bottom-0 z-3 pointer-events-none"
                                    style={{
                                        height: "clamp(130px, 24vw, 240px)",
                                        background:
                                            "radial-gradient(ellipse at center, rgba(233,238,243,0) 0%, rgba(233,238,243,0.85) 70%, rgba(233,238,243,1) 100%)",
                                        filter: "blur(10px)",
                                        opacity: 0.95,
                                    }}
                                />

                                {/* CAPTION + BUTTON */}
                                <div
                                    className="
                                                absolute left-1/2 -translate-x-1/2 z-4
                                                w-full px-4 flex flex-col items-center
                                                bottom-[46px]
                                                sm:bottom-[clamp(40px,7vw,110px)]
                                                md:bottom-[clamp(34px,6.5vw,90px)]
                                            "
                                >
                                    <p
                                        className="
                                                    text-sm sm:text-base text-slate-500 text-center
                                                    mb-5 sm:mb-6
                                                    max-w-[92vw] sm:max-w-[680px] md:max-w-[620px]
                                                    "
                                        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.65)" }}
                                    >
                                        Analyze the impact of battlefield environmental conditions on soldiers
                                    </p>

                                    <Link
                                        to="/dashboard"
                                        className="
                                                    inline-flex items-center justify-center rounded-2xl
                                                    bg-[#1CD400] text-white font-bold
                                                    text-sm sm:text-base
                                                    px-10 py-4 sm:px-12 sm:py-5
                                                    "
                                        style={{
                                            textDecoration: "none",
                                            boxShadow:
                                                "-15px -15px 15px rgba(255,255,255,0.5), 15px 15px 15px rgba(0,0,0,0.15)",
                                        }}
                                    >
                                        Go To Dashboard
                                    </Link>
                                </div>
                            </div>
                        </section>


                        {/* ABOUT */}
                        <section id="about" className="px-4 sm:px-8 lg:px-20 pt-14 sm:pt-16">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start">
                                <div>
                                    <div className="flex items-center gap-3 text-slate-500 text-[22px] font-extrabold">
                                        <div className="font-bold text-xl">About Page</div>
                                    </div>

                                    <h2
                                        className="mt-4 sm:mt-5 font-extrabold text-slate-600 leading-tight"
                                        style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
                                    >
                                        Mannequin With <span style={{ color: "#1CD400" }}>Smart Skin</span>
                                        <br />
                                        for Battlefield Simulation
                                    </h2>

                                    <div
                                        className="mt-4 h-0.5 rounded-full"
                                        style={{
                                            width: "min(320px, 70vw)",
                                            background: "rgba(148,163,184,0.35)",
                                        }}
                                    />

                                    <NeoInset className="mt-5 sm:mt-6 p-4 sm:p-[18px] w-full max-w-[520px]">
                                        <p className="text-xs sm:text-[13px] leading-[18px] text-slate-400">
                                            Smart Skin transforms the mannequin's surface into a sensor network. Every impact,
                                            pressure, and vibration are recorded as digital data, enabling trainers to safely and accurately assess soldier injury risks.
                                        </p>
                                    </NeoInset>
                                </div>

                                <div className="flex justify-start lg:justify-end">
                                    <NeoSurface className="w-full max-w-[560px] h-60 sm:h-[280px] overflow-hidden relative">
                                        {/* ABOUT PHOTOS CAROUSEL */}
                                        {ABOUT_PHOTOS.map((src, i) => (
                                            <img
                                                key={src}
                                                src={src}
                                                alt={`SmartSkin activity ${i + 1}`}
                                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === aboutIdx ? "opacity-100" : "opacity-0"
                                                    }`}
                                                draggable={false}
                                                style={{ objectPosition: src === "/dashboard_photo_2.jpg" ? "center 65%" : "center 55%" }}
                                            />
                                        ))}

                                        {/* soft overlay */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background:
                                                    "linear-gradient(to top, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0) 55%)",
                                            }}
                                        />

                                        {/* controls */}
                                        {ABOUT_PHOTOS.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    aria-label="Previous photo"
                                                    onClick={goPrev}
                                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center select-none"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        background: BG,
                                                        color: "#64748b",
                                                        fontSize: 22,
                                                        lineHeight: "22px",
                                                    }}
                                                >
                                                    ‹
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label="Next photo"
                                                    onClick={goNext}
                                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center select-none"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        background: BG,
                                                        color: "#64748b",
                                                        fontSize: 22,
                                                        lineHeight: "22px",
                                                    }}
                                                >
                                                    ›
                                                </button>

                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                                    {ABOUT_PHOTOS.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            aria-label={`Go to photo ${i + 1}`}
                                                            onClick={() => setAboutIdx(i)}
                                                            className="rounded-full"
                                                            style={{
                                                                width: 9,
                                                                height: 9,
                                                                background:
                                                                    i === aboutIdx
                                                                        ? "#1CD400"
                                                                        : "rgba(100,116,139,0.35)",
                                                                boxShadow:
                                                                    i === aboutIdx
                                                                        ? "0 0 0 4px rgba(28,212,0,0.15)"
                                                                        : "none",
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </NeoSurface>
                                </div>
                            </div>
                        </section>

                        {/* FEATURE */}
                        <section className="px-4 sm:px-8 lg:px-20 pt-16 sm:pt-20">
                            <div className="text-center font-extrabold text-slate-500 text-lg sm:text-[22px]">
                                FEATURE
                            </div>

                            <div className="mt-6 sm:mt-7 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
                                <FeatureCard
                                    Icon={Shield}
                                    title="Safe Simulation"
                                    desc="Test various intensive training scenarios without exposing soldiers to direct risk, from vehicle shocks to controlled explosions."
                                />
                                <FeatureCard
                                    Icon={Activity}
                                    title="Multi-Zone Body Sensor"
                                    desc="Sensor points are placed on the head, neck, chest, and joints to map load distribution and potential injury patterns in detail."
                                />
                                <FeatureCard
                                    Icon={BarChart3}
                                    title="Intuitive Visualization"
                                    desc="Data is sent to the Smart Skin dashboard and visualized as heatmap, time graph, and risk indicators for each body part."
                                />
                                <FeatureCard
                                    Icon={FileText}
                                    title="Data-based decisions"
                                    desc="Simulation results are well-documented so training protocols can be compared, evaluated, and improved continuously."
                                />
                            </div>
                        </section>

                        {/* FOOTER */}
                        <footer id="footer" className="mt-24 border-t border-white/60" style={{ backgroundColor: BG }}>
                            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-20 py-10">
                                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="/Logo.png"
                                                alt="STAS RG"
                                                className="h-14 w-auto"
                                                draggable={false}
                                            />
                                        </div>
                                        <p className="text-sm leading-relaxed text-slate-600">
                                            Smart Skin — Analyze the impact of battlefield environmental conditions on soldiers.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-slate-700">Contact STAS-RG</div>

                                        <ul className="space-y-3 text-sm text-slate-600">
                                            <li className="flex items-start gap-3">
                                                <Mail className="mt-0.5 h-4 w-4 text-slate-500 shrink-0" />
                                                <div className="flex gap-2">
                                                    <span className="w-20 shrink-0 text-slate-500">Email</span>
                                                    <a
                                                        className="hover:text-slate-800 underline-offset-4 hover:underline"
                                                        href="mailto:contact@stasrg.com"
                                                    >
                                                        stasrg@telkomuniversity.ac.id
                                                    </a>
                                                </div>
                                            </li>

                                            <li className="flex items-start gap-3">
                                                <Phone className="mt-0.5 h-4 w-4 text-slate-500 shrink-0" />
                                                <div className="flex gap-2">
                                                    <span className="w-20 shrink-0 text-slate-500">Telp</span>
                                                    <a
                                                        className="hover:text-slate-800 underline-offset-4 hover:underline"
                                                        href="tel:+6281315143774"
                                                    >
                                                        +62 813-1514-3774
                                                    </a>
                                                </div>
                                            </li>

                                            <li className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-4 w-4 text-slate-500 shrink-0" />
                                                <div className="flex gap-2">
                                                    <span className="w-20 shrink-0 text-slate-500">Alamat</span>
                                                    <span className="leading-relaxed">
                                                        Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-slate-700">Social</div>

                                        <div className="flex flex-col gap-3 text-sm">
                                            <a
                                                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 underline-offset-4 hover:underline"
                                                href="https://www.linkedin.com/company/coe-stas-rg/"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Linkedin className="h-4 w-4 text-slate-500" />
                                                Center of Excellence STAS-RG
                                            </a>

                                            <a
                                                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 underline-offset-4 hover:underline"
                                                href="https://www.instagram.com/stas.rg/"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Instagram className="h-4 w-4 text-slate-500" />
                                                @stas.rg
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-xs text-slate-500">
                                        © {new Date().getFullYear()} STAS RG. All rights reserved.
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </Frame1440>
                </div>

            </main>
        </div>
    );
}
