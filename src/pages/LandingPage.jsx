// LandingPage.jsx (Responsive)
import { Link } from "react-router-dom";
import { User, Shield, Activity, BarChart3, FileText } from "lucide-react";

const BG = "#F1F1F1";

const neoLightShadow = `
  -15px -15px 15px rgba(255,255,255,0.5),
  15px 15px 15px rgba(209,214,230,1)
`;

const neoInsetShadow = `
  inset -10px -10px 20px rgba(255,255,255,0.9),
  inset 10px 10px 20px rgba(209,214,230,0.9)
`;

function Frame1440({ children }) {

    return (
        <div className="w-full flex justify-center" style={{ backgroundColor: BG }}>
            <div className="w-full max-w-[1440px]" style={{ backgroundColor: BG }}>
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
    return (
        <div style={{ backgroundColor: BG }}>
            <Frame1440>
                {/* NAVBAR */}
                <header
                    className="w-full"
                    style={{
                        background: BG,
                        boxShadow: "0px 18px 30px rgba(15,23,42,0.10)",
                    }}
                >
                    <div className="h-[72px] sm:h-[88px] px-4 sm:px-8 lg:px-20 flex items-center">
                        <div className="flex items-center justify-between w-full gap-4">
                            {/* logo kiri */}
                            <img
                                src="/public/logo stas rg baru besar.png"
                                alt="STAS RG"
                                className="h-7 sm:h-[34px] w-auto shrink-0"
                                draggable={false}
                            />

                            {/* menu kanan */}
                            <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
                                <NavPill href="#about">About</NavPill>
                                <NavPill href="#contact">Contact</NavPill>
                            </div>
                        </div>
                    </div>
                </header>

                {/* HERO */}
                <section
                    className="px-4 sm:px-8 lg:px-20 pt-10 sm:pt-12 pb-16 sm:pb-20"
                    style={{ background: BG }}
                >
                    <div
                        className="
      mx-auto w-full max-w-[1291px]
      relative overflow-hidden
      aspect-[1291/726]
      min-h-[520px] sm:min-h-0
    "
                    >
                        {/* text SMART SKIN */}
                        <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 z-[4] select-none pointer-events-none text-center whitespace-normal sm:whitespace-nowrap"
                            style={{
                                fontFamily: "Nunito Sans, sans-serif",
                                fontWeight: 700,
                                fontSize: "clamp(56px, 11vw, 210px)",
                                background: "linear-gradient(180deg, #F8F8FC 0%, #E1E2EB 100%)",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                filter:
                                    "drop-shadow(-15px -15px 15px rgba(255,255,255,0.5)) drop-shadow(15px 15px 15px rgba(209,214,230,1))",
                                userSelect: "none",
                            }}
                        >
                            SMART&nbsp;SKIN
                        </div>

                        {/* mannequin */}
                        <img
                            src="/manequin.png"
                            alt="Mannequin Smart Skin"
                            draggable={false}
                            className="absolute inset-0 m-auto w-full h-full object-contain opacity-45 z-[2]"
                        />


                        <div
                            className="absolute left-0 right-0 bottom-0 z-[3] pointer-events-none"
                            style={{
                                height: "clamp(180px, 32vw, 320px)",
                                background:
                                    "linear-gradient(to bottom, rgba(241,241,241,0) 0%, rgba(241,241,241,0.7) 55%, rgba(241,241,241,1) 92%)",
                            }}
                        />

                        <div
                            className="absolute left-0 right-0 bottom-0 z-[3] pointer-events-none"
                            style={{
                                height: "clamp(140px, 26vw, 260px)",
                                background:
                                    "radial-gradient(ellipse at center, rgba(241,241,241,0) 0%, rgba(241,241,241,0.85) 70%, rgba(241,241,241,1) 100%)",
                                filter: "blur(10px)",
                                opacity: 0.95,
                            }}
                        />

                        {/* caption + button */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 z-[4] px-4 w-full flex flex-col items-center"
                            style={{ bottom: "clamp(44px, 10vw, 120px)" }}
                        >
                            <p className="text-sm sm:text-base text-slate-500 text-center mb-5 sm:mb-6">
                                Analisis dampak lingkungan medan tempur terhadap prajurit
                            </p>

                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center rounded-2xl bg-[#1CD400]
                   text-white font-bold text-sm sm:text-base px-10 py-4 sm:px-12 sm:py-5"
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
                <section
                    id="about"
                    className="px-4 sm:px-8 lg:px-20 pt-14 sm:pt-16"
                    style={{ background: BG }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start">
                        {/* kiri */}
                        <div>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 12,
                                        background: BG,
                                        boxShadow: neoLightShadow,
                                    }}
                                >
                                    <User size={16} className="text-slate-500" />
                                </div>
                                <div className="font-bold">About Page</div>
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
                                className="mt-4 h-[2px] rounded-full"
                                style={{
                                    width: "min(320px, 70vw)",
                                    background: "rgba(148,163,184,0.35)",
                                }}
                            />

                            <NeoInset className="mt-5 sm:mt-6 p-4 sm:p-[18px] w-full max-w-[520px]">
                                <p className="text-xs sm:text-[13px] leading-[18px] text-slate-400">
                                    Smart Skin mengubah permukaan tubuh mannequin menjadi jaringan
                                    sensor. Setiap benturan, tekanan, dan getaran terekam sebagai
                                    data digital, sehingga pelatih dapat menilai risiko cedera
                                    prajurit secara aman dan terukur.
                                </p>
                            </NeoInset>
                        </div>

                        {/* kanan: frame gambar */}
                        <div className="flex justify-start lg:justify-end">
                            <NeoSurface className="w-full max-w-[560px] h-[220px] sm:h-[260px] overflow-hidden relative">
                                {/* placeholder (di belakang) */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm">
                                    About Image Frame
                                </div>

                                <img
                                    src="/about-image.png"
                                    alt="About Illustration"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            </NeoSurface>
                        </div>
                    </div>
                </section>

                {/* FEATURE */}
                <section
                    className="px-4 sm:px-8 lg:px-20 pt-16 sm:pt-20"
                    style={{ background: BG }}
                >
                    <div className="text-center font-extrabold text-slate-500 text-lg sm:text-[22px]">
                        FEATURE
                    </div>

                    <div className="mt-6 sm:mt-7 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
                        <FeatureCard
                            Icon={Shield}
                            title="Save Simulation"
                            desc="Uji berbagai skenario latihan intensif tanpa mengekspos prajurit pada risiko langsung, dari guncangan kendaraan hingga ledakan terkendali."
                        />
                        <FeatureCard
                            Icon={Activity}
                            title="Multi-Zone Body Sensor"
                            desc="Titik sensor ditempatkan di kepala, leher, dada, dan persendian untuk memetakan distribusi beban dan potensi cedera secara rinci."
                        />
                        <FeatureCard
                            Icon={BarChart3}
                            title="Intuitive Visualization"
                            desc="Data dikirim ke dashboard Smart Skin dan divisualisasikan sebagai heatmap, grafik waktu, serta indikator risiko di tiap bagian tubuh."
                        />
                        <FeatureCard
                            Icon={FileText}
                            title="Data-based decisions"
                            desc="Hasil simulasi terdokumentasi rapi sehingga protokol pelatihan dapat dibandingkan, dievaluasi, dan disempurnakan secara berkelanjutan."
                        />
                    </div>
                </section>

                {/* FOOTER */}
                <footer
                    id="contact"
                    className="px-4 sm:px-8 lg:px-20 pt-16 sm:pt-20 pb-10"
                    style={{ background: BG }}
                >
                    <img
                        src="/public/logo stas rg baru besar.png"
                        alt="STAS RG"
                        className="h-7 sm:h-[34px] w-auto"
                        draggable={false}
                    />
                </footer>
            </Frame1440>
        </div>
    );
}
