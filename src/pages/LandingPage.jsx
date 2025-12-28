import { Link } from "react-router-dom";
import { User, Shield, Activity, BarChart3, FileText } from "lucide-react";

const BG = "#F1F1F1";

// Neo Light (dari screenshot kamu)
const neoLightShadow = `
  -15px -15px 15px rgba(255,255,255,0.5),
  15px 15px 15px rgba(209,214,230,1)
`;

// inset look (untuk box deskripsi / input-like)
const neoInsetShadow = `
  inset -10px -10px 20px rgba(255,255,255,0.9),
  inset 10px 10px 20px rgba(209,214,230,0.9)
`;

function Frame1440({ children }) {
    // tetap 1440 (sesuai figma), tapi aman kalau layar kecil (jadi scroll horizontal minim)
    return (
        <div className="w-full flex justify-center" style={{ backgroundColor: BG }}>
            <div style={{ width: 1440, backgroundColor: BG }}>{children}</div>
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
            style={{
                height: 44,
                padding: "0 22px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                background: BG,
                boxShadow: neoLightShadow,
                color: "#6B7280",
                fontWeight: 600,
                fontSize: 14,
            }}
        >
            {children}
        </a>
    );
}

function FeatureCard({ Icon, title, desc }) {
    return (
        <NeoSurface style={{ borderRadius: 22, padding: 28 }}>
            <div className="flex flex-col items-center text-center">
                <div
                    style={{
                        width: 62,
                        height: 62,
                        borderRadius: 16,
                        background: BG,
                        boxShadow: neoLightShadow,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={26} className="text-emerald-600" />
                </div>

                <div className="mt-5" style={{ fontWeight: 700, color: "#4B5563", fontSize: 18 }}>
                    {title}
                </div>

                <p className="mt-3" style={{ color: "#94A3B8", fontSize: 12, lineHeight: "18px", maxWidth: 260 }}>
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
                    style={{
                        height: 88,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 80px",
                        background: BG,
                        boxShadow: "0px 18px 30px rgba(15,23,42,0.10)",
                    }}
                >
                    <div className="flex items-center justify-between w-full">
                        {/* logo kiri */}
                        <img
                            src="/public/logo stas rg baru besar.png"
                            alt="STAS RG"
                            style={{ height: 34, width: "auto" }}
                            draggable={false}
                        />

                        {/* menu kanan */}
                        <div className="flex items-center gap-5">
                            <NavPill href="#about">About</NavPill>
                            <NavPill href="#contact">Contact</NavPill>
                        </div>
                    </div>
                </header>

                {/* HERO */}
                <section
                    style={{
                        padding: "42px 80px 0 80px",
                        background: BG,
                    }}
                >
                    {/* wrapper hero image area (1291x726) */}
                    <div
                        style={{
                            width: 1291,
                            height: 726,
                            margin: "0 auto",
                            position: "relative",
                        }}
                    >
                        {/* text SMART SKIN (Nunito Sans Bold 210 + gradient + shadow) */}
                        <div
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -52%)",
                                fontFamily: "Nunito Sans, sans-serif",
                                fontWeight: 700,
                                fontSize: 210,
                                letterSpacing: "0%",
                                background: "linear-gradient(180deg, #F8F8FC 0%, #E1E2EB 100%)",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                filter:
                                    "drop-shadow(-15px -15px 15px rgba(255,255,255,0.5)) drop-shadow(15px 15px 15px rgba(209,214,230,1))",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                zIndex: 4,
                            }}
                        >
                            SMART&nbsp;SKIN
                        </div>

                        {/* mannequin */}
                        {/* mannequin */}
                        <img
                            src="/manequin.png"
                            alt="Mannequin Smart Skin"
                            draggable={false}
                            style={{
                                position: "absolute",
                                inset: 0,
                                margin: "auto",
                                height: "100%",
                                width: "auto",
                                opacity: 0.45,
                                filter: "blur(0px)",
                                zIndex: 2,
                            }}
                        />

                        {/* === BOTTOM FADE (seperti foto ke-2) === */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: 260,                 // tinggi area fade (boleh 220–320)
                                zIndex: 3,                   // di atas gambar
                                pointerEvents: "none",
                                background: "linear-gradient(to bottom, rgba(241,241,241,0) 0%, rgba(241,241,241,1) 78%)",
                            }}
                        />

                        {/* optional: glow lembut biar lebih “kabut” seperti figma */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: 180,
                                zIndex: 3,
                                pointerEvents: "none",
                                background:
                                    "radial-gradient(ellipse at center, rgba(241,241,241,0) 0%, rgba(241,241,241,0.85) 70%, rgba(241,241,241,1) 100%)",
                                filter: "blur(10px)",
                                opacity: 0.9,
                            }}
                        />


                        {/* caption + button */}
                        <div
                            style={{
                                position: "absolute",
                                left: "50%",
                                bottom: 110,
                                transform: "translateX(-50%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                zIndex: 3,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 16,
                                    color: "#6B7280",
                                    textAlign: "center",
                                    marginBottom: 22,
                                }}
                            >
                                Analisis dampak lingkungan medan <br />
                                tempur terhadap prajurit
                            </p>

                            <Link
                                to="/dashboard"
                                style={{
                                    width: 257,
                                    height: 70,
                                    borderRadius: 24,
                                    background: "#1CD400",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#FFFFFF",
                                    fontWeight: 700,
                                    fontSize: 16,
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
                    style={{
                        padding: "64px 80px 0 80px",
                        background: BG,
                    }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        {/* kiri */}
                        <div>
                            <div className="flex items-center gap-3" style={{ color: "#94A3B8", fontSize: 14 }}>
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 12,
                                        background: BG,
                                        boxShadow: neoLightShadow,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <User size={16} className="text-slate-500" />
                                </div>
                                <div style={{ fontWeight: 700, color: "#94A3B8" }}>About Page</div>
                            </div>

                            <h2
                                style={{
                                    marginTop: 18,
                                    fontSize: 40,
                                    fontWeight: 800,
                                    lineHeight: "48px",
                                    color: "#4B5563",
                                }}
                            >
                                Mannequin With{" "}
                                <span style={{ color: "#1CD400" }}>Smart Skin</span>
                                <br />
                                for Battlefield Simulation
                            </h2>

                            <div
                                style={{
                                    marginTop: 16,
                                    height: 2,
                                    width: 320,
                                    borderRadius: 999,
                                    background: "rgba(148,163,184,0.35)",
                                }}
                            />

                            <NeoInset style={{ marginTop: 22, padding: 18, width: 520 }}>
                                <p style={{ fontSize: 13, lineHeight: "18px", color: "#94A3B8" }}>
                                    Smart Skin mengubah permukaan tubuh mannequin menjadi jaringan sensor.
                                    Setiap benturan, tekanan, dan getaran terekam sebagai data digital,
                                    sehingga pelatih dapat menilai risiko cedera prajurit secara aman dan terukur.
                                </p>
                            </NeoInset>
                        </div>

                        {/* kanan: frame gambar */}
                        <div className="flex justify-end">
                            <NeoSurface style={{ width: 560, height: 260, overflow: "hidden" }}>
                                <img
                                    src="/about-image.png"
                                    alt="About Illustration"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    draggable={false}
                                    onError={(e) => {
                                        // kalau about-image.png belum ada, tampilkan placeholder halus
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                                {/* fallback placeholder kalau gambar belum ada */}
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#CBD5E1",
                                        fontSize: 14,
                                    }}
                                >
                                    About Image Frame
                                </div>
                            </NeoSurface>
                        </div>
                    </div>
                </section>

                {/* FEATURE */}
                <section
                    style={{
                        padding: "70px 80px 0 80px",
                        background: BG,
                    }}
                >
                    <div style={{ textAlign: "center", fontWeight: 800, color: "#6B7280", fontSize: 22 }}>
                        FEATURE
                    </div>

                    <div
                        style={{
                            marginTop: 28,
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 28,
                            justifyItems: "center",
                        }}
                    >
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
                    style={{
                        padding: "80px 80px 40px 80px",
                        background: BG,
                    }}
                >
                    <img
                        src="/public/logo stas rg baru besar.png"
                        alt="STAS RG"
                        style={{ height: 34, width: "auto" }}
                        draggable={false}
                    />
                </footer>
            </Frame1440>
        </div>
    );
}
