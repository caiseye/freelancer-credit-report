import { useState, useEffect } from "react";

/* ── 팔레트 ─────────────────────────────────────────────────────── */
export const T = {
  bg: "#F2F4F6", white: "#FFFFFF",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB", g300: "#D1D6DB",
  g400: "#B0B8C1", g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968",
  g800: "#333D4B", g900: "#191F28",
  blue: "#3182F6", blueD: "#1B64DA", blueBg: "#E8F3FF",
  green: "#00C471", greenBg: "#E5F8F0",
  red: "#F04452", redBg: "#FDECEE",
  amber: "#FF9500", amberBg: "#FFF4E0",
  navy: "#1B2430",
};

export const FONT = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", system-ui, sans-serif`;

/* 진단 등급별 색 — 시나리오 톤에 그대로 물립니다 */
export const TONE = {
  green: { fg: T.green, bg: T.greenBg, deep: "#00875A" },
  blue: { fg: T.blue, bg: T.blueBg, deep: T.blueD },
  amber: { fg: T.amber, bg: T.amberBg, deep: "#8A5200" },
  red: { fg: T.red, bg: T.redBg, deep: "#B3202C" },
  grey: { fg: T.g600, bg: T.g100, deep: T.g800 },
};

/* ── 숫자 ───────────────────────────────────────────────────────── */
export const won = (n) => Math.round(n).toLocaleString("ko-KR");

export const eok = (n) => {
  const m = Math.round(n / 10000);
  return m >= 10000 ? `${Math.floor(m / 10000)}억 ${(m % 10000).toLocaleString()}만` : `${m.toLocaleString()}만`;
};

export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

/** 변동계수(%) — 표준편차 ÷ 평균. 소득이 들쭉날쭉한 정도 */
export const cv = (vals) => {
  if (!vals.length) return 0;
  const m = sum(vals) / vals.length;
  if (!m) return 0;
  const varc = sum(vals.map((v) => (v - m) ** 2)) / vals.length;
  return +((Math.sqrt(varc) / m) * 100).toFixed(1);
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const lessMotion = () =>
  typeof window !== "undefined" && window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 훅 ─────────────────────────────────────────────────────────── */
export function useCountUp(target, ms = 900, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (lessMotion()) { setV(target); return; }
    let raf, t0, timer;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    timer = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, ms, delay]);
  return v;
}

/** 뷰포트 폭 감시 — 웹 모드에서 1단/2단 전환에 씁니다 */
export function useWide(px = 900) {
  const [wide, setWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= px : false
  );
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= px);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [px]);
  return wide;
}

/* 문자열 시드 난수 — QR·바코드 패턴을 문서마다 다르게, 그러나 고정되게 */
export function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
