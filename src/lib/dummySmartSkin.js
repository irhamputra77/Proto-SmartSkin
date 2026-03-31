const SENSORS = ["temp", "vib", "fric", "press", "str"];
const PARTS = ["right-arm", "left-arm", "right-leg", "left-leg"];

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function rnd(a, b) { return a + Math.random() * (b - a); }

export function makeInitialStore(points = 60) {
    const now = Date.now();
    const store = {};
    for (const part of PARTS) {
        store[part] = Array.from({ length: points }).map((_, i) => {
            const t = now - (points - 1 - i) * 60_000; // 1 menit
            return makeReadingAt(t, i);
        });
    }
    return store;
}

function makeReadingAt(ts, i = 0) {
    // Gelombang + noise (terasa realistis untuk demo)
    const temp = 28 + Math.sin(i / 6) * 1.2 + rnd(-0.2, 0.2);
    const vib = 0.4 + Math.abs(Math.cos(i / 8)) * 0.8 + rnd(-0.05, 0.05);
    const fric = 12 + Math.sin(i / 10) * 2.5 + rnd(-0.3, 0.3);
    const press = 40 + Math.sin(i / 5) * 10 + rnd(-1.2, 1.2);
    const str = 2 + Math.sin(i / 7) * 0.6 + rnd(-0.05, 0.05);

    return {
        ts,
        temp: clamp(temp, 24, 34),
        vib: clamp(vib, 0, 3),
        fric: clamp(fric, 0, 30),
        press: clamp(press, 0, 120),
        str: clamp(str, 0, 10),
    };
}

export function tickStore(prevStore) {
    const next = structuredClone(prevStore);
    const now = Date.now();

    for (const part of PARTS) {
        const arr = next[part];
        const i = arr.length;
        const nextPoint = makeReadingAt(now, i);

        // Sesekali spike (agar demo menarik)
        if (Math.random() < 0.06) nextPoint.press = clamp(nextPoint.press + rnd(20, 60), 0, 120);
        if (Math.random() < 0.04) nextPoint.vib = clamp(nextPoint.vib + rnd(0.6, 1.4), 0, 3);

        arr.push(nextPoint);
        if (arr.length > 180) arr.shift(); // simpan max 180 menit
    }

    return next;
}

export function getSeverity(sensorKey, value) {
    // Threshold dummy (silakan sesuaikan)
    const rules = {
        temp: { warn: 31, danger: 33 },
        vib: { warn: 1.6, danger: 2.2 },
        fric: { warn: 18, danger: 24 },
        press: { warn: 70, danger: 95 },
        str: { warn: 3.2, danger: 4.2 },
    }[sensorKey];

    if (!rules) return "ok";
    if (value >= rules.danger) return "danger";
    if (value >= rules.warn) return "warn";
    return "ok";
}

export function toChartData(series) {
    return series.map(r => ({
        time: new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ...SENSORS.reduce((acc, k) => (acc[k] = r[k], acc), {}),
    }));
}

export function summarizePart(series) {
    const last = series[series.length - 1];
    // risk score dummy dari pressure & vib (buat demo)
    const risk = Math.round(
        clamp((last.press / 120) * 70 + (last.vib / 3) * 30, 0, 100)
    );
    return { last, risk };
}
