import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronRight, ChevronLeft, Check, X, Loader2, Lock,
  Landmark, Building2, Layers, ShieldCheck, TrendingUp, Sparkles,
  FileText, Download, AlertCircle, Info, RefreshCw, Wallet
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   소득증명 — 프리랜서 금융기관 심사보조자료
   모바일 퍼스트 · 하단 고정 CTA · 카드 스택
   ════════════════════════════════════════════════════════════════ */

const T = {
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
const FONT = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", system-ui, sans-serif`;

/* ─── 유틸 ─────────────────────────────────────────────────────── */
const won = (n) => Math.round(n).toLocaleString("ko-KR");
const eok = (n) => {
  const m = Math.round(n / 10000);
  return m >= 10000 ? `${Math.floor(m / 10000)}억 ${(m % 10000).toLocaleString()}만` : `${m.toLocaleString()}만`;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lessMotion = () => typeof window !== "undefined" && window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCountUp(target, ms = 900, delay = 0) {
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

function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ─── 대상자 · 문서 ────────────────────────────────────────────── */
const ME = { name: "김도현", rrn: "900314-1******", phone: "010-4●●●-8●●2",
  addr: "서울 마포구 성미산로 △△", job: "프리랜서 · 개발/디자인", months: 51 };

const DOC = {
  no: "FIR-2026-0815-8F3C2971", issued: "2026.08.15 14:32",
  expire: "2026.09.14", hash: "9F2A7C41E8B3D06A5C1948FE72B0AD37C4E85901F6B2D8A473C05E6192FA8B4D",
  tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0x4C7A21E9B38F", tsaTime: "2026-08-15T05:32:09Z",
  verify: "verify.income.kr/8F3C2971",
};

/* ─── 소득 ─────────────────────────────────────────────────────── */
const HIST = [["2025-08",2980000],["2025-09",3410000],["2025-10",3120000],["2025-11",3860000],
  ["2025-12",4210000],["2026-01",2540000],["2026-02",2880000],["2026-03",3350000],
  ["2026-04",3640000],["2026-05",3180000],["2026-06",3720000],["2026-07",3950000]];
const FCST = [["2026-08",3610000],["2026-09",3680000],["2026-10",3540000],["2026-11",3920000],
  ["2026-12",4180000],["2027-01",2980000],["2027-02",3150000],["2027-03",3590000],
  ["2027-04",3760000],["2027-05",3620000],["2027-06",3840000],["2027-07",4020000]];
const HIST_SUM = HIST.reduce((a, b) => a + b[1], 0);
const HIST_AVG = Math.round(HIST_SUM / 12);
const FCST_SUM = FCST.reduce((a, b) => a + b[1], 0);
const FCST_AVG = Math.round(FCST_SUM / 12);
const BAND = FCST.map(([ym, v], i) => ({ ym, p50: v,
  p10: Math.round(v * (1 - 0.09 - i * 0.008)), p90: Math.round(v * (1 + 0.10 + i * 0.010)) }));
const P10_SUM = BAND.reduce((a, b) => a + b.p10, 0);

const PLATFORMS = [
  { name: "위시켓", cat: "개발 외주", amt: 21840000, cnt: 41 },
  { name: "크몽", cat: "디자인·개발", amt: 7460000, cnt: 88 },
  { name: "탈잉·클래스101", cat: "온라인 강의", amt: 4210000, cnt: 132 },
  { name: "Google AdSense", cat: "콘텐츠 수익", amt: 3180000, cnt: 12 },
  { name: "라우드소싱", cat: "공모 디자인", amt: 2470000, cnt: 19 },
  { name: "직거래", cat: "세금계산서", amt: 1680000, cnt: 7 },
];
const HHI = PLATFORMS.reduce((a, p) => a + Math.pow(p.amt / HIST_SUM, 2), 0);

/* ─── 지표 ─────────────────────────────────────────────────────── */
const CWP = { m12: 91.4, m24: 83.7, m36: 76.2, peer: 64.8 };
const CWP_FACTORS = [
  { k: "일한 기간", v: "51개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 18.2, max: 20 },
  { k: "소득이 끊긴 달", v: "0번", note: "51개월 내내 소득 발생", pt: 21.5, max: 22 },
  { k: "소득이 들쭉날쭉한 정도", v: "14.1%", note: "25%보다 낮으면 안정적", pt: 14.8, max: 18 },
  { k: "다시 일감을 준 거래처", v: "68.3%", note: "반복 발주처 12곳", pt: 12.1, max: 16 },
  { k: "수입원 분산", v: HHI.toFixed(3), note: "6개 채널, 가장 큰 곳이 53.5%", pt: 9.6, max: 14 },
  { k: "건강보험·연금 납부", v: "51개월 무체납", note: "한 번도 밀린 적 없어요", pt: 15.2, max: 16 },
];
const WDI_AXES = [
  { k: "꾸준함", s: 92, w: 0.25, d: "한 달 평균 21.4일 일했어요" },
  { k: "납기 지키기", s: 96, w: 0.25, d: "187건 중 180건 제때 납품" },
  { k: "결과물 평가", s: 89, w: 0.15, d: "평점 4.83 / 5.0 · 리뷰 214건" },
  { k: "일하는 리듬", s: 84, w: 0.15, d: "주 5.2일 · 시간대가 일정해요" },
  { k: "연락 응답", s: 81, w: 0.10, d: "제안 응답률 81% · 평균 2.4시간" },
  { k: "분쟁 없음", s: 84, w: 0.10, d: "중도 취소 2건 · 클레임 0건" },
];
const WDI = WDI_AXES.reduce((a, x) => a + x.s * x.w, 0);

const FDS_RULES = [
  { k: "짧은 기간에 큰 현금 인출", st: "정상" },
  { k: "같은 금액이 돌고 도는 거래", st: "정상" },
  { k: "새벽 시간대 이체 몰림", st: "확인", n: 3, memo: "해외 클라이언트 정산 시간과 같아요. 확인 끝났어요." },
  { k: "대포통장 의심 패턴", st: "정상" },
  { k: "소득 대비 과한 카드론", st: "정상" },
  { k: "빚이 갑자기 늘어남", st: "정상" },
  { k: "도박·불법 가맹점 결제", st: "정상" },
  { k: "명의도용 의심 계좌 개설", st: "정상" },
  { k: "소득처럼 꾸민 입금", st: "확인", n: 1, memo: "배우자 생활비 이체예요. 소득에서 빼고 계산했어요." },
  { k: "보험 담보대출 반복", st: "정상" },
  { k: "연체 직전 돌려막기", st: "정상" },
  { k: "고위험국 해외 송금", st: "정상" },
];
const FDS = { scanned: 4182, months: 24, caution: 2, alert: 0, score: 12 };

/* ─── 재무 ─────────────────────────────────────────────────────── */
const ASSETS = [{ k: "수시입출금", v: 6320000 }, { k: "예·적금", v: 14800000 }, { k: "투자", v: 7350000 }];
const DEBTS = [{ k: "전세자금대출", v: 15000000, note: "연 3.90% · 잔여 18개월" },
  { k: "마이너스통장", v: 3200000, note: "연 6.80% · 한도 500만" },
  { k: "카드 결제예정", v: 1400000, note: "36개월 연체 0건" }];
const FIXED = [{ k: "주거·관리비", v: 620000 }, { k: "대출이자", v: 268000 }, { k: "보험", v: 141000 },
  { k: "통신·구독", v: 89000 }, { k: "건강보험료", v: 149000 }, { k: "국민연금", v: 215000 }];
const ASSET_SUM = ASSETS.reduce((a, b) => a + b.v, 0);
const DEBT_SUM = DEBTS.reduce((a, b) => a + b.v, 0);
const FIXED_SUM = FIXED.reduce((a, b) => a + b.v, 0);

const DSR_ITEMS = [
  { k: "전세자금대출 이자", v: 585000, b: "1,500만 × 3.90% · 원금 제외" },
  { k: "마이너스통장", v: 1217600, b: "한도 500만 ÷ 5년 + 이자" },
];
const DSR_BASE = DSR_ITEMS.reduce((a, x) => a + x.v, 0);
const LIMIT = { capacity: 768000, principal: 28000000, months: 60, rate: "6.5%", monthly: 548000 };
LIMIT.dsr = +((DSR_BASE / HIST_SUM) * 100).toFixed(1);
LIMIT.dsrAfter = +(((DSR_BASE + LIMIT.monthly * 12) / HIST_SUM) * 100).toFixed(1);

/* ─── 수집 원천 ────────────────────────────────────────────────── */
const FIN_ORGS = [
  { k: "KB국민은행", n: "입출금 2 · 예적금 3" }, { k: "카카오뱅크", n: "입출금 1 · 적금 1" },
  { k: "토스뱅크", n: "입출금 1" }, { k: "신한카드", n: "신용 1 · 체크 1" },
  { k: "현대카드", n: "신용 1" }, { k: "삼성증권", n: "위탁 1 · CMA 1" },
  { k: "한화손해보험", n: "보장성 2" }, { k: "KCB 올크레딧", n: "신용평점" },
];
const PUB_DOCS = [
  { k: "주민등록표 등본", org: "행정안전부", res: "세대주 · 세대원 2인 · 2023.04 전입" },
  { k: "가족관계증명서", org: "대법원", res: "배우자 1인 · 부양가족 1인" },
  { k: "건강보험 자격득실확인서", org: "건강보험공단", res: "지역가입 · 2022.05 취득 · 유지중" },
  { k: "건강보험료 납부확인서", org: "건강보험공단", res: "24개월 완납 · 체납 0회" },
  { k: "국민연금 가입증명", org: "국민연금공단", res: "지역가입 · 51개월 납부" },
  { k: "소득금액증명 (2025)", org: "국세청", res: "사업소득 38,120,000원" },
  { k: "사업자등록증명", org: "국세청", res: "개업 2022.04.18 · 계속사업자" },
  { k: "지방세 납세증명서", org: "위택스", res: "체납액 없음" },
];

/* ════════════════════════════════════════════════════════════════
   전역 스타일
   ════════════════════════════════════════════════════════════════ */
const GlobalStyle = () => (
  <style>{`
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

.tw *{box-sizing:border-box}

/* arbitrary-value utilities */
.grid-cols-\\[1fr_auto_auto_auto\\]{grid-template-columns:1fr auto auto auto}
.leading-\\[1\\.35\\]{line-height:1.35}
.leading-\\[1\\.6\\]{line-height:1.6}
.leading-\\[1\\.8\\]{line-height:1.8}
.rounded-\\[12px\\]{border-radius:12px}
.rounded-\\[13px\\]{border-radius:13px}
.rounded-\\[14px\\]{border-radius:14px}
.rounded-\\[16px\\]{border-radius:16px}
.rounded-\\[20px\\]{border-radius:20px}
.rounded-\\[24px\\]{border-radius:24px}
.rounded-\\[30px\\]{border-radius:30px}
.rounded-\\[8px\\]{border-radius:8px}
.text-\\[11px\\]{font-size:11px}
.text-\\[12px\\]{font-size:12px}
.text-\\[13\\.5px\\]{font-size:13.5px}
.text-\\[13px\\]{font-size:13px}
.text-\\[14px\\]{font-size:14px}
.text-\\[15px\\]{font-size:15px}
.text-\\[16px\\]{font-size:16px}
.text-\\[17px\\]{font-size:17px}
.text-\\[19px\\]{font-size:19px}
.text-\\[20px\\]{font-size:20px}
.text-\\[21px\\]{font-size:21px}
.text-\\[22px\\]{font-size:22px}
.text-\\[24px\\]{font-size:24px}
.text-\\[26px\\]{font-size:26px}
.text-\\[30px\\]{font-size:30px}
.text-\\[38px\\]{font-size:38px}
.text-\\[40px\\]{font-size:40px}
.text-\\[52px\\]{font-size:52px}
.tracking-\\[-0\\.02em\\]{letter-spacing:-0.02em}
.tracking-\\[-0\\.035em\\]{letter-spacing:-0.035em}
.tracking-\\[-0\\.03em\\]{letter-spacing:-0.03em}
/* end */
.tw{-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.tw button{font-family:inherit}
.tnum{font-variant-numeric:tabular-nums}

.tw :focus-visible{outline:2px solid ${T.blue};outline-offset:2px;border-radius:8px}
.press{transition:transform .1s ease, background-color .15s ease, opacity .15s ease}
.press:active{transform:scale(.975)}
.rowpress{transition:background-color .12s ease}
.rowpress:active{background:${T.g100}}

@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes sheetUp{from{transform:translateY(100%)}to{transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes ring{0%{transform:scale(.9);opacity:.5}70%{transform:scale(1.35);opacity:0}100%{opacity:0}}

.fu{animation:fu .5s cubic-bezier(.2,.7,.3,1) both}
.fade{animation:fade .4s ease both}
.spin{animation:spin 1s linear infinite}
.pop{animation:pop .5s cubic-bezier(.3,1.5,.5,1) both}
.growx{transform-origin:left center;animation:grow .8s cubic-bezier(.2,.8,.3,1) both}
.risey{transform-origin:bottom center;animation:rise .7s cubic-bezier(.2,.8,.3,1) both}

.noscroll::-webkit-scrollbar{display:none}
.noscroll{-ms-overflow-style:none;scrollbar-width:none}

@media (prefers-reduced-motion:reduce){
  .tw *{animation-duration:.001s !important;animation-delay:0s !important;transition-duration:.001s !important}
}

@media print{
  .noprint{display:none !important}
  .tw{background:#fff !important}
  .phone{max-width:none !important;box-shadow:none !important;min-height:0 !important}
  .printdoc{display:block !important}
  .card{break-inside:avoid;page-break-inside:avoid;box-shadow:none !important;border-bottom:1px solid ${T.g200} !important;padding-left:0 !important;padding-right:0 !important}
  .stack{background:#fff !important}
  @page{size:A4;margin:14mm}
}
`}</style>
);

/* ════════════════════════════════════════════════════════════════
   기본 요소
   ════════════════════════════════════════════════════════════════ */
const Phone = ({ children }) => (
  <div className="tw" style={{ background: T.bg, minHeight: "100vh", fontFamily: FONT, color: T.g900 }}>
    <div className="phone mx-auto relative" style={{ maxWidth: 480, background: T.white, minHeight: "100vh" }}>
      {children}
    </div>
  </div>
);

const AppBar = ({ onBack, pct, right }) => (
  <div className="noprint sticky top-0 z-30" style={{ background: T.white }}>
    <div className="flex items-center h-14 px-2">
      {onBack ? (
        <button onClick={onBack} aria-label="뒤로" className="press w-10 h-10 grid place-items-center rounded-full">
          <ChevronLeft size={26} color={T.g800} strokeWidth={2.2} />
        </button>
      ) : <span className="w-10" />}
      <div className="flex-1" />
      {right}
    </div>
    {pct != null && (
      <div style={{ height: 3, background: T.g100 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: T.blue, borderRadius: 3, transition: "width .45s cubic-bezier(.2,.8,.3,1)" }} />
      </div>
    )}
  </div>
);

const Screen = ({ children, className = "" }) => (
  <div className={`px-6 pb-40 ${className}`}>{children}</div>
);

const H1 = ({ children, className = "" }) => (
  <h1 className={`text-[24px] font-bold leading-[1.35] tracking-[-0.02em] ${className}`} style={{ color: T.g900 }}>{children}</h1>
);
const Sub = ({ children, className = "" }) => (
  <p className={`text-[15px] leading-[1.6] mt-3 ${className}`} style={{ color: T.g600 }}>{children}</p>
);
const Label = ({ children, color }) => (
  <div className="text-[13px] font-semibold" style={{ color: color || T.g500 }}>{children}</div>
);

const Btn = ({ children, onClick, disabled, tone = "blue", size = "lg", full = true, icon: Icon }) => {
  const tones = {
    blue: { background: disabled ? T.g200 : T.blue, color: disabled ? T.g400 : "#fff" },
    grey: { background: T.g100, color: T.g800 },
    ghost: { background: "transparent", color: T.g600 },
  };
  const sz = size === "lg" ? { height: 56, fontSize: 17, borderRadius: 14 } : { height: 44, fontSize: 15, borderRadius: 12, paddingLeft: 16, paddingRight: 16 };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`press inline-flex items-center justify-center gap-1.5 font-bold ${full ? "w-full" : ""}`}
      style={{ ...tones[tone], ...sz, cursor: disabled ? "default" : "pointer" }}>
      {Icon && <Icon size={size === "lg" ? 19 : 16} strokeWidth={2.3} />}{children}
    </button>
  );
};

/* 하단 고정 CTA */
const Bottom = ({ children, hint }) => (
  <div className="noprint fixed bottom-0 left-1/2 w-full z-30" style={{ maxWidth: 480, transform: "translateX(-50%)" }}>
    <div style={{ height: 24, background: `linear-gradient(180deg, rgba(255,255,255,0), ${T.white})` }} />
    <div className="px-6 pb-6" style={{ background: T.white }}>
      {hint && <p className="text-[12px] text-center mb-3 leading-relaxed" style={{ color: T.g500 }}>{hint}</p>}
      {children}
    </div>
  </div>
);

/* 카드 */
const Card = ({ children, className = "", pad = "px-6 py-7", bg }) => (
  <div className={`card ${pad} ${className}`} style={{ background: bg || T.white }}>{children}</div>
);

/* 전체화면 오버레이 — 폰 컬럼 폭을 유지 */
const FullScreen = ({ children }) => (
  <div className="noprint fixed inset-0 z-50 overflow-y-auto" style={{ background: T.bg }}>
    <div className="mx-auto flex flex-col" style={{ maxWidth: 480, minHeight: "100vh", background: T.white }}>{children}</div>
  </div>
);

/* 리스트 행 */
const Row = ({ icon: Icon, iconBg, iconColor, title, sub, right, onClick, chevron, className = "" }) => {
  const El = onClick ? "button" : "div";
  return (
    <El onClick={onClick} className={`rowpress w-full flex items-center gap-3.5 py-3.5 text-left ${className}`}>
      {Icon && (
        <span className="grid place-items-center rounded-[13px] shrink-0" style={{ width: 40, height: 40, background: iconBg || T.g100 }}>
          <Icon size={19} color={iconColor || T.g600} strokeWidth={2.1} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug" style={{ color: T.g900 }}>{title}</span>
        {sub && <span className="block text-[13px] mt-0.5 leading-snug" style={{ color: T.g500 }}>{sub}</span>}
      </span>
      {right}
      {chevron && <ChevronRight size={18} color={T.g400} className="shrink-0" />}
    </El>
  );
};

/* 항목 · 값 */
const KV = ({ k, v, sub, strong, color }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="text-[14px] shrink-0" style={{ color: T.g600 }}>{k}</span>
    <span className="text-right min-w-0">
      <span className={`block tnum text-[14px] ${strong ? "font-bold" : "font-semibold"}`} style={{ color: color || T.g900 }}>{v}</span>
      {sub && <span className="block text-[12px] mt-0.5 leading-snug" style={{ color: T.g500 }}>{sub}</span>}
    </span>
  </div>
);

const Chip = ({ children, tone = "grey" }) => {
  const c = { grey: [T.g100, T.g700], blue: [T.blueBg, T.blueD], green: [T.greenBg, "#00875A"], amber: [T.amberBg, "#B36B00"], red: [T.redBg, T.red] }[tone];
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[8px] text-[12px] font-bold"
    style={{ background: c[0], color: c[1] }}>{children}</span>;
};

const Divider = ({ my = 4 }) => <div style={{ height: 1, background: T.g100, marginTop: my, marginBottom: my }} />;

/* 체크박스 */
const Tick = ({ on, size = 24, filled }) => (
  <span className="grid place-items-center rounded-full shrink-0"
    style={{ width: size, height: size, background: on ? (filled ? T.blue : "transparent") : (filled ? T.g200 : "transparent"), transition: "background .15s" }}>
    <Check size={size * 0.66} strokeWidth={3} color={on ? (filled ? "#fff" : T.blue) : T.g300} />
  </span>
);

/* 바텀시트 */
const Sheet = ({ children, onClose, title }) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="noprint fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }}
      onClick={onClose} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="w-full relative"
        style={{ maxWidth: 480, background: T.white, borderRadius: "20px 20px 0 0", maxHeight: "88vh", overflowY: "auto",
                 animation: "sheetUp .34s cubic-bezier(.32,.72,0,1) both" }}>
        <div className="sticky top-0 z-10 px-6 pt-5 pb-3 flex items-start justify-between gap-4" style={{ background: T.white }}>
          <h3 className="text-[19px] font-bold leading-snug tracking-[-0.02em]" style={{ color: T.g900 }}>{title}</h3>
          {onClose && <button onClick={onClose} aria-label="닫기" className="press -mr-1 -mt-1 p-1.5 rounded-full"><X size={20} color={T.g500} /></button>}
        </div>
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   그래프
   ════════════════════════════════════════════════════════════════ */
const IncomeBars = () => {
  const all = [...HIST.map(([ym, v]) => ({ ym, v, f: false })), ...BAND.map((b) => ({ ym: b.ym, v: b.p50, f: true }))];
  const max = 4400000, W = 336, H = 118, bw = 9, gap = (W - all.length * bw) / (all.length - 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label="월별 소득과 예측">
      {all.map((d, i) => {
        const h = Math.max(4, (d.v / max) * H), x = i * (bw + gap);
        return <rect key={d.ym} x={x} y={H - h} width={bw} height={h} rx={bw / 2}
          fill={d.f ? "#B7D5FB" : T.blue} className="risey" style={{ animationDelay: `${i * 0.022}s` }} />;
      })}
      <line x1={11 * (bw + gap) + bw + gap / 2} x2={11 * (bw + gap) + bw + gap / 2} y1={0} y2={H}
        stroke={T.g300} strokeWidth="1" strokeDasharray="3 3" />
      <text x="0" y={H + 14} style={{ fontSize: 10.5, fill: T.g400, fontWeight: 600 }}>25.08</text>
      <text x={11 * (bw + gap)} y={H + 14} textAnchor="middle" style={{ fontSize: 10.5, fill: T.g400, fontWeight: 600 }}>26.07</text>
      <text x={W} y={H + 14} textAnchor="end" style={{ fontSize: 10.5, fill: "#7FB2F5", fontWeight: 600 }}>27.07</text>
    </svg>
  );
};

const Meter = ({ pct, color, delay = 0, h = 8, track }) => (
  <div className="rounded-full overflow-hidden" style={{ height: h, background: track || T.g100 }}>
    <div className="h-full rounded-full growx" style={{ width: `${pct}%`, background: color || T.blue, animationDelay: `${delay}s` }} />
  </div>
);

/* 성공 체크 */
const BigCheck = ({ size = 84, color }) => (
  <div className="relative grid place-items-center" style={{ width: size, height: size }}>
    <span className="absolute rounded-full" style={{ width: size, height: size, background: color || T.blue, animation: "ring .9s ease-out .25s both" }} />
    <span className="pop grid place-items-center rounded-full" style={{ width: size, height: size, background: color || T.blue }}>
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none">
        <path d="M4 12.5 L9.5 18 L20 6.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: "draw .4s cubic-bezier(.2,.8,.3,1) .3s both" }} />
      </svg>
    </span>
  </div>
);

/* 진본 확인 코드 */
const QRBlock = ({ value, size = 92 }) => {
  const N = 25;
  const g = useMemo(() => {
    const rnd = seeded(value);
    const m = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) m[r][c] = rnd() > 0.52 ? 1 : 0;
    const fin = (r, c) => { for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) { const y = r + i, x = c + j;
      if (y < 0 || x < 0 || y >= N || x >= N) continue;
      m[y][x] = (i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))) ? 1 : 0; } };
    fin(0, 0); fin(0, N - 7); fin(N - 7, 0);
    for (let i = 8; i < N - 8; i++) { m[6][i] = i % 2 === 0 ? 1 : 0; m[i][6] = i % 2 === 0 ? 1 : 0; }
    return m;
  }, [value]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" aria-label="진본 확인 QR">
      <rect width={N} height={N} fill="#fff" />
      {g.map((row, r) => row.map((v, c) => v ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={T.g900} /> : null))}
    </svg>
  );
};

const Barcode = ({ value, h = 40 }) => {
  const bars = useMemo(() => {
    const rnd = seeded(value); const out = []; let x = 0;
    while (x < 194) { const w = 1 + Math.floor(rnd() * 3.2); const gp = 1 + Math.floor(rnd() * 2.4); out.push([x, w]); x += w + gp; }
    return out;
  }, [value]);
  return (
    <svg viewBox="0 0 200 34" className="w-full" style={{ height: h }} aria-label={`바코드 ${value}`}>
      {bars.map(([x, w], i) => <rect key={i} x={x + 2} y="0" width={w} height="24" fill={T.g900} />)}
      <text x="100" y="32" textAnchor="middle" className="tnum" style={{ fontSize: 5.4, fill: T.g500, fontWeight: 700, letterSpacing: "1.4px" }}>{value}</text>
    </svg>
  );
};

/* ════════════════════════════════════════════════════════════════
   1 · 시작
   ════════════════════════════════════════════════════════════════ */
const PreviewCard = () => (
  <div className="relative" style={{ height: 260 }}>
    <div className="absolute inset-x-0 top-0 rounded-[24px]" style={{ height: 210, background: `linear-gradient(165deg, ${T.blueBg}, #F5F9FF)` }} />
    <div className="absolute left-5 right-5 top-8">
      <div className="flex gap-1.5 mb-3">
        {["위시켓", "크몽", "AdSense", "탈잉"].map((p, i) => (
          <span key={p} className="fu px-2 py-1 rounded-[8px] text-[11px] font-bold"
            style={{ background: "rgba(255,255,255,.9)", color: T.g600, animationDelay: `${0.15 + i * 0.07}s` }}>{p}</span>
        ))}
      </div>
      <div className="fu rounded-[20px] p-5" style={{ background: T.white, boxShadow: "0 12px 32px -12px rgba(49,130,246,.28)", animationDelay: ".3s" }}>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: T.g500 }}>계속근무가능성</span>
          <Chip tone="blue">상위 7%</Chip>
        </div>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="tnum text-[38px] font-bold leading-none tracking-[-0.03em]" style={{ color: T.blue }}>91.4</span>
          <span className="text-[20px] font-bold" style={{ color: T.blue }}>%</span>
        </div>
        <div className="mt-4 space-y-2.5">
          {[["근로 성실도", "89.5점"], ["이상거래", "없어요"], ["12개월 예상소득", "4,389만원"]].map(([k, v], i) => (
            <div key={k} className="flex items-center justify-between text-[13px]">
              <span style={{ color: T.g500 }}>{k}</span>
              <span className="font-bold tnum" style={{ color: T.g800 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ScreenIntro = ({ onNext }) => (
  <>
    <AppBar right={<span className="text-[13px] font-semibold pr-4" style={{ color: T.g500 }}>포용금융</span>} />
    <Screen>
      <div className="fu">
        <H1>흩어진 소득,<br />한 장으로 증명해요</H1>
        <Sub>재직증명서를 못 받는 프리랜서를 위해<br />플랫폼 정산 내역과 마이데이터를 모아<br />은행이 심사에 쓰는 리포트를 만들어 드려요.</Sub>
      </div>

      <div className="mt-7"><PreviewCard /></div>

      <div className="mt-2">
        {[
          [TrendingUp, T.blueBg, T.blue, "앞으로 얼마나 벌지 예측해요", "51개월 기록으로 12개월 현금흐름을 계산해요"],
          [Sparkles, T.greenBg, T.green, "얼마나 성실히 일했는지 점수로", "납기 준수율, 가동일수 등 6가지를 봐요"],
          [ShieldCheck, "#FFF0F1", T.red, "이상거래를 미리 걸러내요", "12가지를 검사하고 걸리면 이유까지 설명해요"],
          [Lock, T.g100, T.g700, "위조할 수 없어요", "바코드와 타임스탬프로 봉인해서 발급해요"],
        ].map(([I, bg, c, t, s], i) => (
          <div key={t} className="fu" style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
            <Row icon={I} iconBg={bg} iconColor={c} title={t} sub={s} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-5 px-1">
        {["3분이면 끝나요", "무료", "30일간 유효"].map((t) => <Chip key={t}>{t}</Chip>)}
      </div>
    </Screen>

    <Bottom hint="대출 승인을 보장하진 않아요. 은행이 참고하는 자료예요.">
      <Btn onClick={onNext}>리포트 만들기</Btn>
    </Bottom>
  </>
);

/* ════════════════════════════════════════════════════════════════
   2 · 약관 동의
   ════════════════════════════════════════════════════════════════ */
const CONSENTS = [
  { id: "c1", req: true, t: "개인·신용정보 수집 이용", law: "신용정보법 제32조·제33조", rows: [
    ["모으는 정보", "이름, 생년월일, 연락처, 주소, 사업자등록번호, 소득·정산 내역, 계약 이력, 금융거래 내역, 4대보험 자격·납부 내역"],
    ["쓰는 이유", "금융기관에 낼 심사보조자료를 만들기 위해서예요"],
    ["보관 기간", "리포트를 만들면 원본 데이터는 바로 지워요. 발급 이력만 30일 남아요"],
    ["동의 안 하면", "리포트를 만들 수 없어요"]] },
  { id: "c2", req: true, t: "제3자 정보제공", law: "신용정보법 제32조·개인정보보호법 제17조", rows: [
    ["누구에게", "제출할 때 직접 고르는 금융기관에만 보내요"],
    ["무엇을", "리포트 전문과 진본 확인 정보"],
    ["왜", "은행이 소득과 상환능력을 확인하는 데 쓰려고요"],
    ["보관 기간", "심사가 끝나면 바로 파기해요. 대출이 실행되면 법에 따라 5년 보관해요"],
    ["지금 보내나요?", "아니요. 제출 단계에서 기관을 고른 뒤에만 전송돼요"]] },
  { id: "c3", req: true, t: "고유식별정보 처리", law: "개인정보보호법 제24조", rows: [
    ["처리 항목", "주민등록번호"],
    ["쓰는 이유", "공공기관에서 증명서류 진본을 조회하려면 필요해요"],
    ["보관 기간", "조회가 끝나면 바로 지워요. 따로 저장하지 않아요"]] },
  { id: "c4", req: true, t: "마이데이터 전송요구", law: "신용정보법 제33조의2", rows: [
    ["어디서", "금융 8곳, 공공기관 5곳, 플랫폼 6곳 (총 19곳)"],
    ["무엇을", "계좌·카드·투자·보험 거래내역 24개월, 증명서류 8종, 정산 내역 51개월"],
    ["언제 끝나요?", "딱 한 번만 가져와요. 리포트가 만들어지면 자동으로 끝나요"],
    ["철회", "마이데이터 종합포털이나 설정에서 언제든 취소할 수 있어요"]] },
  { id: "c5", req: false, t: "발급 이력 보관 (선택)", law: "동의하지 않아도 발급에 문제 없어요", rows: [
    ["보관 항목", "발급 일시, 문서번호, 제출 이력 (리포트 내용은 저장 안 해요)"],
    ["쓰는 이유", "다시 발급할 때 절차를 줄여드려요"],
    ["보관 기간", "12개월"]] },
];

const ScreenConsent = ({ onNext, onBack }) => {
  const [on, setOn] = useState({});
  const [detail, setDetail] = useState(null);
  const reqs = CONSENTS.filter((c) => c.req);
  const allReq = reqs.every((c) => on[c.id]);
  const allOn = CONSENTS.every((c) => on[c.id]);

  return (
    <>
      <AppBar onBack={onBack} pct={20} />
      <Screen>
        <div className="fu">
          <H1>약관에 동의해주세요</H1>
          <Sub>자료를 한 번만 가져오면 리포트가 만들어져요.</Sub>
        </div>

        <button onClick={() => setOn(allOn ? {} : Object.fromEntries(CONSENTS.map((c) => [c.id, true])))}
          className="press w-full flex items-center gap-3.5 mt-7 p-5 rounded-[16px] text-left"
          style={{ background: allOn ? T.blueBg : T.g50 }} aria-pressed={allOn}>
          <Tick on={allOn} filled size={26} />
          <span className="text-[17px] font-bold" style={{ color: allOn ? T.blueD : T.g800 }}>모두 동의하기</span>
        </button>

        <div className="mt-2">
          {CONSENTS.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <button onClick={() => setOn((s) => ({ ...s, [c.id]: !s[c.id] }))} aria-pressed={!!on[c.id]}
                className="flex items-center gap-3 flex-1 min-w-0 py-3.5 text-left">
                <Tick on={!!on[c.id]} />
                <span className="text-[15px] min-w-0" style={{ color: T.g700 }}>
                  <span className="font-semibold" style={{ color: on[c.id] ? T.g900 : T.g500 }}>
                    [{c.req ? "필수" : "선택"}] {c.t}
                  </span>
                </span>
              </button>
              <button onClick={() => setDetail(c)} aria-label={`${c.t} 자세히 보기`} className="press p-2 -mr-2 shrink-0">
                <ChevronRight size={18} color={T.g400} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-6 p-4 rounded-[14px]" style={{ background: T.g50 }}>
          <Info size={16} color={T.g400} className="shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed" style={{ color: T.g600 }}>
            지금 동의해도 은행에 바로 전송되지 않아요. 리포트를 다 만든 뒤 제출할 곳을 직접 고르면 그때 보내져요.
          </p>
        </div>
      </Screen>

      <Bottom>
        <Btn disabled={!allReq} onClick={onNext}>{allReq ? "동의하고 계속하기" : "필수 항목에 동의해주세요"}</Btn>
      </Bottom>

      {detail && (
        <Sheet title={detail.t} onClose={() => setDetail(null)}>
          <p className="text-[13px] mb-4" style={{ color: T.g500 }}>{detail.law}</p>
          {detail.rows.map(([k, v]) => (
            <div key={k} className="py-3" style={{ borderTop: `1px solid ${T.g100}` }}>
              <div className="text-[13px] font-bold" style={{ color: T.g500 }}>{k}</div>
              <div className="text-[15px] mt-1 leading-relaxed" style={{ color: T.g800 }}>{v}</div>
            </div>
          ))}
          <div className="mt-5">
            <Btn onClick={() => { setOn((s) => ({ ...s, [detail.id]: true })); setDetail(null); }}>동의하기</Btn>
          </div>
        </Sheet>
      )}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   3 · 본인 확인
   ════════════════════════════════════════════════════════════════ */
const IDPS = [
  { id: "kakao", k: "카카오톡", bg: "#FEE500", fg: "#3C1E1E", mark: "K" },
  { id: "naver", k: "네이버", bg: "#03C75A", fg: "#fff", mark: "N" },
  { id: "pass", k: "PASS", bg: "#5C3EBC", fg: "#fff", mark: "P" },
  { id: "toss", k: "토스", bg: "#3182F6", fg: "#fff", mark: "T" },
  { id: "fin", k: "금융인증서", bg: T.g100, fg: T.g600, icon: Lock },
  { id: "joint", k: "공동인증서", bg: T.g100, fg: T.g600, icon: Lock },
];

const ScreenAuth = ({ onNext, onBack }) => {
  const [pick, setPick] = useState("kakao");
  const [phase, setPhase] = useState("pick");
  const [left, setLeft] = useState(180);
  const idp = IDPS.find((i) => i.id === pick);

  useEffect(() => {
    if (phase !== "wait") return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    const a = setTimeout(() => setPhase("ok"), 2400);
    return () => { clearInterval(t); clearTimeout(a); };
  }, [phase]);
  useEffect(() => { if (phase === "ok") { const t = setTimeout(onNext, 1300); return () => clearTimeout(t); } }, [phase, onNext]);

  if (phase === "ok") return (
    <FullScreen>
      <div className="flex-1 grid place-items-center px-6 text-center">
      <div>
        <div className="flex justify-center"><BigCheck /></div>
        <h2 className="text-[22px] font-bold mt-7 tracking-[-0.02em]" style={{ color: T.g900 }}>본인 확인이 끝났어요</h2>
        <p className="text-[15px] mt-2" style={{ color: T.g600 }}>{ME.name}님, 이제 자료를 모을게요</p>
      </div>
      </div>
    </FullScreen>
  );

  if (phase === "wait") return (
    <>
      <AppBar onBack={() => { setPhase("pick"); setLeft(180); }} pct={40} />
      <div className="px-6 pt-10 text-center">
        <div className="relative mx-auto grid place-items-center" style={{ width: 96, height: 96 }}>
          <span className="absolute rounded-full" style={{ width: 96, height: 96, background: idp.bg, opacity: .25, animation: "ring 1.6s ease-out infinite" }} />
          <span className="grid place-items-center rounded-[30px]" style={{ width: 76, height: 76, background: idp.bg }}>
            {idp.icon ? <idp.icon size={30} color={idp.fg} strokeWidth={2.2} />
              : <span className="text-[30px] font-bold" style={{ color: idp.fg }}>{idp.mark}</span>}
          </span>
        </div>
        <h2 className="text-[22px] font-bold mt-8 leading-snug tracking-[-0.02em]" style={{ color: T.g900 }}>
          {idp.k}에서<br />인증을 완료해주세요
        </h2>
        <p className="text-[15px] mt-3" style={{ color: T.g600 }}>휴대폰으로 인증 요청을 보냈어요</p>
        <div className="tnum text-[17px] font-bold mt-6" style={{ color: T.blue }}>
          {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
        </div>
      </div>
      <Bottom hint="인증 창이 안 뜨면 앱을 직접 열어주세요">
        <Btn tone="grey" onClick={() => {}}>{idp.k} 열기</Btn>
      </Bottom>
    </>
  );

  return (
    <>
      <AppBar onBack={onBack} pct={40} />
      <Screen>
        <div className="fu">
          <H1>본인 확인이 필요해요</H1>
          <Sub>마이데이터는 본인만 가져올 수 있어요.<br />인증할 방법을 골라주세요.</Sub>
        </div>

        <div className="mt-6 p-5 rounded-[16px]" style={{ background: T.g50 }}>
          {[["이름", ME.name], ["생년월일", "1990.03.14"], ["휴대폰", ME.phone]].map(([k, v]) => <KV key={k} k={k} v={v} />)}
        </div>

        <div className="mt-5">
          <Label>인증 수단</Label>
          <div className="mt-1">
            {IDPS.map((i) => (
              <button key={i.id} onClick={() => setPick(i.id)} aria-pressed={pick === i.id}
                className="rowpress w-full flex items-center gap-3.5 py-3.5 text-left">
                <span className="grid place-items-center rounded-[13px] shrink-0" style={{ width: 40, height: 40, background: i.bg }}>
                  {i.icon ? <i.icon size={18} color={i.fg} strokeWidth={2.2} />
                    : <span className="text-[16px] font-bold" style={{ color: i.fg }}>{i.mark}</span>}
                </span>
                <span className="flex-1 text-[15px] font-semibold" style={{ color: T.g900 }}>{i.k}</span>
                {pick === i.id && <Check size={20} color={T.blue} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </Screen>
      <Bottom>
        <Btn onClick={() => { setLeft(180); setPhase("wait"); }}>{idp.k}으로 인증하기</Btn>
      </Bottom>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   4 · 자료 수집
   ════════════════════════════════════════════════════════════════ */
const GROUPS = [
  { id: "fin", icon: Landmark, bg: T.blueBg, fg: T.blue, k: "금융 마이데이터", via: "신용정보원",
    items: FIN_ORGS.map((o) => ({ k: o.k, res: o.n })) },
  { id: "pub", icon: Building2, bg: T.greenBg, fg: T.green, k: "공공 마이데이터", via: "정부24",
    items: PUB_DOCS.map((d) => ({ k: d.k, res: d.org })) },
  { id: "api", icon: Layers, bg: "#F3EEFF", fg: "#6E45CF", k: "플랫폼 소득", via: "정산 API",
    items: PLATFORMS.map((p) => ({ k: p.name, res: `${p.cnt}건 · ${eok(p.amt)}원` })) },
];
const FLAT = GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, g: g.id })));

const ScreenCollect = ({ onNext }) => {
  const [i, setI] = useState(0);
  const done = i >= FLAT.length;
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setI((v) => v + 1), i === 0 ? 450 : 170);
    return () => clearTimeout(t);
  }, [i, done]);
  const pct = Math.min(100, Math.round((i / FLAT.length) * 100));
  const recent = FLAT.slice(Math.max(0, i - 3), i).reverse();

  return (
    <>
      <AppBar pct={60} />
      <Screen>
        <div className="fu">
          <H1>{done ? "자료를 다 가져왔어요" : "자료를 모으고 있어요"}</H1>
          <Sub>{done ? "19곳에서 받은 자료를 리포트 형식으로 정리했어요." : "19곳에 순서대로 요청하고 있어요. 잠시만요."}</Sub>
        </div>

        <div className="flex items-baseline gap-1 mt-7">
          <span className="tnum text-[52px] font-bold leading-none tracking-[-0.03em]" style={{ color: done ? T.green : T.blue }}>{pct}</span>
          <span className="text-[24px] font-bold" style={{ color: done ? T.green : T.blue }}>%</span>
        </div>
        <div className="mt-3"><Meter pct={pct} color={done ? T.green : T.blue} h={6} /></div>

        <div className="mt-7 space-y-1">
          {GROUPS.map((g) => {
            const st = FLAT.findIndex((f) => f.g === g.id);
            const n = Math.max(0, Math.min(g.items.length, i - st));
            const fin = n === g.items.length;
            return (
              <Row key={g.id} icon={g.icon} iconBg={fin ? T.greenBg : g.bg} iconColor={fin ? T.green : g.fg}
                title={g.k} sub={g.via}
                right={fin ? <Check size={20} color={T.green} strokeWidth={3} />
                  : <span className="tnum text-[14px] font-bold" style={{ color: T.g400 }}>{n}/{g.items.length}</span>} />
            );
          })}
        </div>

        {!done && (
          <div className="mt-6 p-4 rounded-[16px]" style={{ background: T.g50, minHeight: 96 }}>
            {recent.map((r, k) => (
              <div key={r.k + k} className="fade flex items-center gap-2.5 py-1.5" style={{ opacity: 1 - k * 0.3 }}>
                <Check size={14} color={T.green} strokeWidth={3} />
                <span className="text-[13px] font-medium truncate" style={{ color: T.g700 }}>{r.k}</span>
                <span className="text-[12px] ml-auto truncate shrink-0" style={{ color: T.g400 }}>{r.res}</span>
              </div>
            ))}
            {recent.length === 0 && <div className="text-[13px] py-1.5" style={{ color: T.g400, animation: "blink 1.2s infinite" }}>연결하는 중…</div>}
          </div>
        )}

        {done && (
          <div className="fade mt-6 p-5 rounded-[16px]" style={{ background: T.g50 }}>
            <div className="grid grid-cols-2 gap-y-5">
              {[["가져온 곳", "22곳"], ["금융 거래", "4,182건"], ["정산 내역", "299건"], ["증명 서류", "8종"]].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[13px]" style={{ color: T.g500 }}>{k}</div>
                  <div className="tnum text-[19px] font-bold mt-0.5" style={{ color: T.g900 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Screen>
      {done && <Bottom><Btn onClick={onNext}>리포트 만들기</Btn></Bottom>}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   5 · 분석
   ════════════════════════════════════════════════════════════════ */
const STAGES = [
  { k: "정산 내역을 정리하고 있어요", d: "중복 3건을 빼고 51개월 소득을 확정했어요", ms: 1500 },
  { k: "얼마나 계속 일할 수 있는지 보고 있어요", d: "비슷한 일 하는 12,400명과 비교하는 중", ms: 1600 },
  { k: "성실도를 점수로 바꾸고 있어요", d: "계약 187건, 리뷰 214건을 확인했어요", ms: 1500 },
  { k: "이상거래를 검사하고 있어요", d: "거래 4,182건에 12가지 기준을 적용 중", ms: 1700 },
  { k: "앞으로 얼마 벌지 계산하고 있어요", d: "1만 번 시뮬레이션을 돌리고 있어요", ms: 1600 },
  { k: "리포트를 봉인하고 있어요", d: "타임스탬프를 찍어 위조를 막고 있어요", ms: 1600 },
];

const ScreenAnalyze = ({ onNext }) => {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (s >= STAGES.length) { const t = setTimeout(onNext, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setS((v) => v + 1), STAGES[s].ms);
    return () => clearTimeout(t);
  }, [s, onNext]);
  const cur = STAGES[Math.min(s, STAGES.length - 1)];
  const pct = Math.round((Math.min(s, STAGES.length) / STAGES.length) * 100);

  return (
    <>
      <AppBar pct={80} />
      <div className="px-6 pt-16 text-center">
        <div className="relative mx-auto grid place-items-center" style={{ width: 88, height: 88 }}>
          <span className="absolute rounded-full" style={{ width: 88, height: 88, background: T.blue, opacity: .16, animation: "ring 1.8s ease-out infinite" }} />
          <span className="grid place-items-center rounded-full" style={{ width: 68, height: 68, background: T.blueBg }}>
            <Sparkles size={28} color={T.blue} strokeWidth={2.1} />
          </span>
        </div>
        <div key={s} className="fu" style={{ minHeight: 88 }}>
          <h2 className="text-[21px] font-bold mt-8 leading-snug tracking-[-0.02em]" style={{ color: T.g900 }}>{cur.k}</h2>
          <p className="text-[14px] mt-2.5" style={{ color: T.g500 }}>{cur.d}</p>
        </div>
        <div className="mt-8 mx-auto" style={{ maxWidth: 220 }}><Meter pct={pct} h={5} /></div>
        <p className="tnum text-[13px] font-semibold mt-3" style={{ color: T.g400 }}>{Math.min(s + 1, STAGES.length)} / {STAGES.length}</p>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   6 · 리포트
   ════════════════════════════════════════════════════════════════ */
const CardTitle = ({ children, onMore }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h3 className="text-[17px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>{children}</h3>
    {onMore && (
      <button onClick={onMore} className="press shrink-0 inline-flex items-center text-[13px] font-semibold noprint" style={{ color: T.g500 }}>
        자세히 <ChevronRight size={15} />
      </button>
    )}
  </div>
);

const Big = ({ v, unit, color, decimals = 0 }) => (
  <div className="flex items-baseline gap-1">
    <span className="tnum text-[40px] font-bold leading-none tracking-[-0.035em]" style={{ color: color || T.g900 }}>
      {decimals ? v.toFixed(decimals) : won(v)}
    </span>
    <span className="text-[20px] font-bold" style={{ color: color || T.g900 }}>{unit}</span>
  </div>
);

/* — 계속근무가능성 — */
const CardCWP = ({ onMore }) => {
  const v = useCountUp(CWP.m12, 1000, 150);
  return (
    <Card>
      <CardTitle onMore={onMore}>앞으로도 계속 일할 가능성</CardTitle>
      <Big v={v} unit="%" color={T.blue} decimals={1} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        비슷한 일 하는 사람 평균보다 <b style={{ color: T.g900 }}>{(CWP.m12 - CWP.peer).toFixed(1)}%p 높아요.</b><br />
        소득이 끊긴 달이 51개월 동안 한 번도 없었어요.
      </p>
      <div className="mt-5 space-y-3">
        {[["김도현님", CWP.m12, T.blue], ["같은 일 평균", CWP.peer, T.g300]].map(([k, p, c], i) => (
          <div key={k}>
            <div className="flex items-center justify-between text-[13px] mb-1.5">
              <span className="font-semibold" style={{ color: i ? T.g500 : T.g800 }}>{k}</span>
              <span className="tnum font-bold" style={{ color: i ? T.g500 : T.blue }}>{p}%</span>
            </div>
            <Meter pct={p} color={c} delay={0.15 + i * 0.1} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[["24개월 뒤", `${CWP.m24}%`], ["36개월 뒤", `${CWP.m36}%`]].map(([k, val]) => (
          <div key={k} className="p-3.5 rounded-[14px]" style={{ background: T.g50 }}>
            <div className="text-[12px]" style={{ color: T.g500 }}>{k}</div>
            <div className="tnum text-[17px] font-bold mt-0.5" style={{ color: T.g800 }}>{val}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* — 미래현금흐름 — */
const CardFlow = ({ onMore }) => {
  const v = useCountUp(FCST_SUM, 1100, 200);
  return (
    <Card>
      <CardTitle onMore={onMore}>앞으로 12개월, 이만큼 벌 것 같아요</CardTitle>
      <Big v={Math.round(v / 10000)} unit="만원" color={T.g900} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        한 달 평균 <b style={{ color: T.g900 }}>{won(FCST_AVG)}원</b>이에요.<br />
        보수적으로 봐도 {eok(P10_SUM)}원은 벌어요.
      </p>
      <div className="mt-6"><IncomeBars /></div>
      <div className="flex items-center gap-4 mt-1 text-[12px]" style={{ color: T.g500 }}>
        <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: T.blue }} />지난 12개월</span>
        <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: "#B7D5FB" }} />앞으로 12개월</span>
      </div>
      <div className="mt-5 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="지난 12개월 소득" v={`${won(HIST_SUM)}원`} />
        <KV k="앞으로 12개월 예상" v={`${won(FCST_SUM)}원`} sub="중앙값 기준" strong color={T.blue} />
        <KV k="들쭉날쭉한 정도" v="14.1%" sub="25%보다 낮으면 안정적이에요" />
      </div>
    </Card>
  );
};

/* — 근로 성실도 — */
const CardWDI = () => {
  const v = useCountUp(WDI, 1000, 250);
  return (
    <Card>
      <CardTitle>얼마나 성실히 일했나요</CardTitle>
      <div className="flex items-end justify-between">
        <Big v={v} unit="점" color={T.green} decimals={1} />
        <Chip tone="green">100명 중 9등</Chip>
      </div>
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        187건 중 180건을 제때 납품했어요. 한 달 평균 21.4일 일했고요.
      </p>
      <div className="mt-5 space-y-3.5">
        {WDI_AXES.map((a, i) => (
          <div key={a.k}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[14px] font-semibold" style={{ color: T.g800 }}>{a.k}</span>
              <span className="tnum text-[14px] font-bold" style={{ color: a.s >= 90 ? T.green : T.g700 }}>{a.s}</span>
            </div>
            <Meter pct={a.s} color={a.s >= 90 ? T.green : "#7DDCB0"} delay={0.1 + i * 0.06} h={6} />
            <p className="text-[12px] mt-1.5" style={{ color: T.g500 }}>{a.d}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* — 이상거래 — */
const CardFDS = ({ onMore }) => {
  const warns = FDS_RULES.filter((r) => r.st === "확인");
  return (
    <Card>
      <CardTitle onMore={onMore}>이상거래 검사</CardTitle>
      <div className="flex items-center gap-3.5">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 48, height: 48, background: T.greenBg }}>
          <ShieldCheck size={24} color={T.green} strokeWidth={2.2} />
        </span>
        <div>
          <div className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>위험한 거래는 없어요</div>
          <div className="text-[13px] mt-0.5" style={{ color: T.g500 }}>거래 {won(FDS.scanned)}건을 12가지로 검사했어요</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5">
        {[["정상", 10, T.g900], ["확인 필요", FDS.caution, T.amber], ["위험", FDS.alert, T.g300]].map(([k, n, c]) => (
          <div key={k} className="p-3.5 rounded-[14px] text-center" style={{ background: T.g50 }}>
            <div className="tnum text-[22px] font-bold" style={{ color: c }}>{n}</div>
            <div className="text-[12px] mt-0.5" style={{ color: T.g500 }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {warns.map((r) => (
          <div key={r.k} className="p-4 rounded-[14px]" style={{ background: T.amberBg }}>
            <div className="flex items-center gap-2">
              <AlertCircle size={15} color={T.amber} strokeWidth={2.4} />
              <span className="text-[14px] font-bold" style={{ color: "#8A5200" }}>{r.k} {r.n}건</span>
            </div>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "#8A5200" }}>{r.memo}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* — 상환 여력 — */
const CardDSR = ({ onMore }) => (
  <Card>
    <CardTitle onMore={onMore}>매달 갚을 수 있는 돈</CardTitle>
    <Big v={LIMIT.capacity} unit="원" />
    <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
      월 소득 {won(HIST_AVG)}원에서 고정지출 {won(FIXED_SUM)}원을 빼고,<br />여유의 40%만 잡았어요.
    </p>
    <div className="mt-5 p-4 rounded-[14px]" style={{ background: T.g50 }}>
      <KV k="지금 DSR" v={`${LIMIT.dsr}%`} sub={`연 원리금 ${won(DSR_BASE)}원`} />
      <KV k="2,800만원 빌리면" v={`${LIMIT.dsrAfter}%`} sub="규제 상한 40%까지 여유 있어요" strong color={T.blue} />
      <Divider />
      <KV k="참고 한도" v={`${eok(LIMIT.principal)}원`} sub={`${LIMIT.months}개월 · 연 ${LIMIT.rate} 기준 월 ${won(LIMIT.monthly)}원`} />
    </div>
    <p className="text-[12px] mt-3 leading-relaxed" style={{ color: T.g500 }}>
      실제 한도와 금리는 은행이 정해요. 참고용 계산이에요.
    </p>
  </Card>
);

/* — 모은 자료 — */
const CardSource = ({ onMore }) => (
  <Card>
    <CardTitle onMore={onMore}>이 자료로 만들었어요</CardTitle>
    <div className="space-y-1">
      {GROUPS.map((g) => (
        <Row key={g.id} icon={g.icon} iconBg={g.bg} iconColor={g.fg} title={g.k} sub={g.via}
          right={<span className="text-[14px] font-bold" style={{ color: T.g500 }}>{g.items.length}곳</span>} />
      ))}
    </div>
    <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
      <KV k="이름" v={ME.name} />
      <KV k="주민등록번호" v={ME.rrn} />
      <KV k="직업" v={ME.job} sub={`사업자 개업 2022.04.18 · ${ME.months}개월`} />
      <KV k="세대" v="세대주 · 세대원 2인" sub="배우자 1인 · 부양가족 1인" />
    </div>
    <div className="mt-3 flex gap-2.5 p-4 rounded-[14px]" style={{ background: T.blueBg }}>
      <Info size={16} color={T.blue} className="shrink-0 mt-0.5" />
      <p className="text-[13px] leading-relaxed" style={{ color: T.blueD }}>
        여기 나온 소득은 플랫폼 정산 기준이라 필요경비를 빼기 전 금액이에요.
        2025년 신고액 38,120,000원과 {won(HIST_SUM - 38120000)}원 차이가 나는데,
        신고 뒤에 들어온 정산분이에요.
      </p>
    </div>
  </Card>
);

/* — 진본 확인 — */
const CardVerify = () => (
  <Card>
    <CardTitle>이 리포트는 위조할 수 없어요</CardTitle>
    <div className="flex gap-4 items-center">
      <div className="p-2 rounded-[12px] shrink-0" style={{ background: T.white, border: `1px solid ${T.g200}` }}>
        <QRBlock value={DOC.hash} size={84} />
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] leading-relaxed" style={{ color: T.g600 }}>
          QR을 찍으면 진짜인지 바로 확인할 수 있어요. 파일을 올리면 위조 여부까지 판정해요.
        </p>
        <p className="tnum text-[12px] font-semibold mt-2 break-all" style={{ color: T.blue }}>{DOC.verify}</p>
      </div>
    </div>
    <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
      <KV k="문서번호" v={DOC.no} />
      <KV k="발급" v={DOC.issued} />
      <KV k="유효기간" v={`${DOC.expire}까지`} />
      <KV k="타임스탬프" v={DOC.tsa} sub={`${DOC.tsaSerial} · ${DOC.tsaTime}`} />
    </div>
    <div className="mt-3">
      <Label>무결성 해시 (SHA-256)</Label>
      <p className="tnum text-[11px] leading-relaxed break-all mt-1.5 p-3 rounded-[12px]" style={{ background: T.g50, color: T.g600 }}>{DOC.hash}</p>
    </div>
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.g100}` }}>
      <Barcode value="FIR20260815-8F3C2971" />
    </div>
  </Card>
);

/* — 상세 시트 — */
const DetailSheet = ({ id, onClose }) => {
  if (id === "cwp") return (
    <Sheet title="이렇게 계산했어요" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-5" style={{ color: T.g600 }}>
        비슷한 일 하는 12,400명의 기록과 비교해서, 항목마다 점수를 더했어요.
      </p>
      {CWP_FACTORS.map((f, i) => (
        <div key={f.k} className="py-3.5" style={{ borderTop: `1px solid ${T.g100}` }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold" style={{ color: T.g900 }}>{f.k}</span>
            <span className="tnum text-[15px] font-bold shrink-0" style={{ color: T.g900 }}>{f.v}</span>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex-1"><Meter pct={(f.pt / f.max) * 100} color={T.blue} delay={i * 0.05} h={6} /></div>
            <span className="tnum text-[12px] font-bold shrink-0" style={{ color: T.blue }}>+{f.pt}</span>
          </div>
          <p className="text-[13px] mt-2" style={{ color: T.g500 }}>{f.note}</p>
        </div>
      ))}
      <div className="flex items-center justify-between pt-4 mt-1" style={{ borderTop: `2px solid ${T.g200}` }}>
        <span className="text-[15px] font-bold" style={{ color: T.g900 }}>합계</span>
        <span className="tnum text-[19px] font-bold" style={{ color: T.blue }}>{CWP.m12}%</span>
      </div>
    </Sheet>
  );

  if (id === "flow") return (
    <Sheet title="달마다 예상 소득" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-4" style={{ color: T.g600 }}>
        1만 번 시뮬레이션한 결과예요. 보수적(하위 10%)부터 낙관적(상위 10%)까지 범위로 보여드려요.
      </p>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2.5 text-[12px] font-bold" style={{ color: T.g500, borderBottom: `1px solid ${T.g200}` }}>
        <span>월</span><span className="text-right w-14">보수적</span><span className="text-right w-14">보통</span><span className="text-right w-14">낙관적</span>
      </div>
      {BAND.map((b) => (
        <div key={b.ym} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2.5 tnum text-[14px]" style={{ borderBottom: `1px solid ${T.g100}` }}>
          <span style={{ color: T.g600 }}>{b.ym.replace("-", ".")}</span>
          <span className="text-right w-14" style={{ color: T.g500 }}>{Math.round(b.p10 / 10000)}만</span>
          <span className="text-right w-14 font-bold" style={{ color: T.blue }}>{Math.round(b.p50 / 10000)}만</span>
          <span className="text-right w-14" style={{ color: T.g500 }}>{Math.round(b.p90 / 10000)}만</span>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-3 tnum text-[14px] font-bold">
        <span style={{ color: T.g900 }}>합계</span>
        <span className="text-right w-14" style={{ color: T.g600 }}>{Math.round(P10_SUM / 10000).toLocaleString()}만</span>
        <span className="text-right w-14" style={{ color: T.blue }}>{Math.round(FCST_SUM / 10000).toLocaleString()}만</span>
        <span className="text-right w-14" style={{ color: T.g600 }}>{Math.round(BAND.reduce((a, b) => a + b.p90, 0) / 10000).toLocaleString()}만</span>
      </div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <Label>어디서 벌었나요</Label>
        <div className="mt-3 space-y-3">
          {PLATFORMS.map((p, i) => {
            const sh = (p.amt / HIST_SUM) * 100;
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="font-semibold truncate" style={{ color: T.g800 }}>{p.name}</span>
                  <span className="tnum font-bold shrink-0" style={{ color: T.g600 }}>{eok(p.amt)}원 · {sh.toFixed(1)}%</span>
                </div>
                <Meter pct={sh} color={i === 0 ? T.blue : "#9CC7FA"} delay={i * 0.05} h={6} track={T.g200} />
              </div>
            );
          })}
        </div>
        <p className="text-[12px] mt-3.5 leading-relaxed" style={{ color: T.g500 }}>
          6곳에 나뉘어 있지만 제일 큰 곳이 53.5%라, 한 곳이 끊기면 영향이 있어요. (HHI {HHI.toFixed(3)})
        </p>
      </div>
    </Sheet>
  );

  if (id === "fds") return (
    <Sheet title="12가지 검사 결과" onClose={onClose}>
      {FDS_RULES.map((r) => (
        <div key={r.k} className="py-3.5" style={{ borderTop: `1px solid ${T.g100}` }}>
          <div className="flex items-center gap-3">
            <span className="text-[15px] flex-1 min-w-0" style={{ color: T.g800 }}>{r.k}</span>
            <Chip tone={r.st === "확인" ? "amber" : "green"}>{r.st}{r.n ? ` ${r.n}` : ""}</Chip>
          </div>
          {r.memo && <p className="text-[13px] mt-2 leading-relaxed" style={{ color: T.g500 }}>{r.memo}</p>}
        </div>
      ))}
      <p className="text-[13px] leading-relaxed mt-5 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        은행이 쓰는 검사 기준을 프리랜서 거래에 맞게 조정했어요. '확인'은 문제가 있다는 뜻이 아니라,
        은행이 물어볼 만한 걸 미리 설명해둔 거예요.
      </p>
    </Sheet>
  );

  if (id === "dsr") return (
    <Sheet title="DSR 계산 근거" onClose={onClose}>
      {DSR_ITEMS.map((d) => <div key={d.k} style={{ borderTop: `1px solid ${T.g100}` }}><KV k={d.k} v={`${won(d.v)}원`} sub={d.b} /></div>)}
      <div style={{ borderTop: `1px solid ${T.g200}` }}><KV k="연간 합계" v={`${won(DSR_BASE)}원`} strong /></div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="연 소득" v={`${won(HIST_SUM)}원`} />
        <KV k="지금 DSR" v={`${LIMIT.dsr}%`} sub="전세자금대출은 이자만 넣었어요" />
        <KV k="2,800만원 빌리면" v={`${LIMIT.dsrAfter}%`} sub={`연 ${won(LIMIT.monthly * 12)}원 추가`} strong color={T.blue} />
      </div>
      <div className="mt-4">
        <Label>가진 것 · 갚을 것</Label>
        <div className="mt-2">
          <KV k="자산" v={`${won(ASSET_SUM)}원`} sub={ASSETS.map((a) => `${a.k} ${eok(a.v)}`).join(" · ")} />
          <KV k="부채" v={`${won(DEBT_SUM)}원`} sub={DEBTS.map((d) => `${d.k} ${eok(d.v)}`).join(" · ")} />
          <KV k="순자산" v={`${won(ASSET_SUM - DEBT_SUM)}원`} strong />
          <KV k="월 고정지출" v={`${won(FIXED_SUM)}원`} sub={FIXED.map((f) => f.k).join(" · ")} />
        </div>
      </div>
    </Sheet>
  );

  if (id === "src") return (
    <Sheet title="가져온 자료 전부" onClose={onClose}>
      {GROUPS.map((g) => (
        <div key={g.id} className="mb-5">
          <Label color={T.g700}>{g.k} · {g.via}</Label>
          <div className="mt-1">
            {g.items.map((it) => (
              <div key={it.k} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: `1px solid ${T.g100}` }}>
                <Check size={15} color={T.green} strokeWidth={3} className="shrink-0" />
                <span className="text-[14px] flex-1 min-w-0 truncate" style={{ color: T.g800 }}>{it.k}</span>
                <span className="text-[12px] shrink-0" style={{ color: T.g500 }}>{it.res}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-2">
        <Label color={T.g700}>공공 서류 조회 결과</Label>
        <div className="mt-1">
          {PUB_DOCS.map((d) => (
            <div key={d.k} className="py-2.5" style={{ borderBottom: `1px solid ${T.g100}` }}>
              <div className="text-[14px] font-semibold" style={{ color: T.g900 }}>{d.k}</div>
              <div className="text-[13px] mt-0.5" style={{ color: T.g500 }}>{d.res}</div>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
  return null;
};

/* — 인쇄 전용 문서 표제부 — */
const PrintHead = () => (
  <div className="printdoc" style={{ display: "none", marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${T.g900}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
      <div>
        <div className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", color: T.g500, fontWeight: 700 }}>FINANCIAL INCLUSION REPORT</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>금융기관 심사보조자료</div>
        <div style={{ fontSize: 12, color: T.g600, marginTop: 4 }}>
          {ME.name} · {ME.rrn} · {ME.job}
        </div>
      </div>
      <div className="tnum" style={{ fontSize: 10.5, color: T.g700, textAlign: "right", lineHeight: 1.7 }}>
        문서번호 {DOC.no}<br />발급 {DOC.issued}<br />유효 {DOC.expire}까지<br />{DOC.tsa}
      </div>
      <div style={{ width: 150 }}><Barcode value="FIR20260815-8F3C2971" h={38} /></div>
    </div>
  </div>
);

const ScreenReport = ({ onSubmit, submitted, onRestart }) => {
  const [sheet, setSheet] = useState(null);
  const [sealing, setSealing] = useState(false);
  const pdf = async () => { setSealing(true); await sleep(1400); setSealing(false); window.print(); };

  return (
    <>
      <AppBar right={
        <button onClick={pdf} className="press w-10 h-10 grid place-items-center rounded-full noprint" aria-label="PDF로 저장">
          <Download size={20} color={T.g700} strokeWidth={2.2} />
        </button>} />

      <div className="px-6 pb-6">
        <PrintHead />
        <div className="fu">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <Chip tone="blue">발급 완료</Chip>
            <span className="tnum text-[12px] font-semibold" style={{ color: T.g500 }}>{DOC.no}</span>
          </div>
          <H1>{ME.name}님의<br />소득 리포트예요</H1>
          <Sub>은행에 그대로 내면 돼요. {DOC.expire}까지 쓸 수 있어요.</Sub>
        </div>
      </div>

      <div className="pb-40 space-y-3" style={{ background: T.bg }}>
        <div className="pt-3" />
        <CardCWP onMore={() => setSheet("cwp")} />
        <CardFlow onMore={() => setSheet("flow")} />
        <CardWDI />
        <CardFDS onMore={() => setSheet("fds")} />
        <CardDSR onMore={() => setSheet("dsr")} />
        <CardSource onMore={() => setSheet("src")} />
        <CardVerify />

        <div className="px-6 py-7" style={{ background: T.white }}>
          <p className="text-[12px] leading-[1.8]" style={{ color: T.g500 }}>
            이 리포트는 은행이 심사할 때 참고하는 자료예요. 대출 승인이나 한도, 금리를 보장하지 않아요.
            계속근무가능성과 성실도는 통계로 추정한 값이라 실제와 다를 수 있어요.
            자료를 만드는 데 쓴 원본 마이데이터는 발급하자마자 지웠고, 리포트 내용은 저장하지 않아요.
            유효기간이 지나면 진본 확인이 안 되니 다시 발급받아야 해요.
          </p>
          <button onClick={onRestart} className="press noprint inline-flex items-center gap-1.5 text-[13px] font-semibold mt-5" style={{ color: T.g500 }}>
            <RefreshCw size={13} /> 처음부터 다시 보기
          </button>
          <p className="text-[11px] mt-3" style={{ color: T.g400 }}>프로토타입이에요. 화면의 수치는 예시 데이터예요.</p>
        </div>
      </div>

      <Bottom>
        <div className="flex gap-2.5">
          <button onClick={pdf} className="press shrink-0 grid place-items-center rounded-[14px]"
            style={{ width: 56, height: 56, background: T.g100 }} aria-label="PDF로 저장">
            <Download size={21} color={T.g700} strokeWidth={2.2} />
          </button>
          <Btn onClick={onSubmit} icon={submitted ? Check : Wallet}>{submitted ? "제출 내역 보기" : "은행에 제출하기"}</Btn>
        </div>
      </Bottom>

      {sheet && <DetailSheet id={sheet} onClose={() => setSheet(null)} />}

      {sealing && (
        <div className="noprint fixed inset-0 z-50 grid place-items-center px-8" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="fade w-full rounded-[20px] p-7 text-center" style={{ maxWidth: 320, background: T.white }}>
            <Loader2 size={28} className="spin mx-auto" color={T.blue} strokeWidth={2.2} />
            <div className="text-[17px] font-bold mt-5" style={{ color: T.g900 }}>봉인하고 있어요</div>
            <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: T.g600 }}>
              전자서명과 타임스탬프를 찍은 뒤<br />인쇄 창이 열려요
            </p>
          </div>
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   7 · 제출
   ════════════════════════════════════════════════════════════════ */
const BANKS = [
  { id: "kb", k: "KB국민은행", t: "여신심사부", bg: "#FFCC00", fg: "#4A3B00", m: "KB" },
  { id: "sh", k: "신한은행", t: "개인여신센터", bg: "#0046FF", fg: "#fff", m: "신한" },
  { id: "kko", k: "카카오뱅크", t: "비대면 심사", bg: "#FFE300", fg: "#3C1E1E", m: "카뱅" },
  { id: "wel", k: "웰컴저축은행", t: "개인신용대출", bg: "#E8590C", fg: "#fff", m: "웰컴" },
  { id: "kinfa", k: "서민금융진흥원", t: "햇살론뱅크", bg: "#0B7A5C", fg: "#fff", m: "햇살" },
  { id: "hd", k: "현대캐피탈", t: "개인금융", bg: "#26282B", fg: "#fff", m: "HC" },
];
const PURPOSES = ["신용대출 신규", "전세자금대출", "사업자금 대출", "한도 상향"];
const SEND_STEPS = ["문서 암호화", "전자서명 확인", "전자문서 전송", "수신 확인"];

const BankMark = ({ b, size = 40 }) => (
  <span className="grid place-items-center rounded-[13px] shrink-0" style={{ width: size, height: size, background: b.bg }}>
    <span className="font-bold" style={{ color: b.fg, fontSize: b.m.length > 2 ? size * 0.28 : size * 0.34 }}>{b.m}</span>
  </span>
);

const SubmitFlow = ({ onClose, onDone, already }) => {
  const [step, setStep] = useState(already ? "done" : "pick");
  const [picked, setPicked] = useState(["kb", "kinfa"]);
  const [days, setDays] = useState(14);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [si, setSi] = useState(0);
  const chosen = BANKS.filter((b) => picked.includes(b.id));

  useEffect(() => {
    if (step !== "send") return;
    if (si >= SEND_STEPS.length) { const t = setTimeout(() => { setStep("done"); onDone(); }, 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setSi((v) => v + 1), 550);
    return () => clearTimeout(t);
  }, [step, si, onDone]);

  if (step === "send") return (
    <FullScreen>
      <div className="flex-1 grid place-items-center px-8">
      <div className="text-center w-full" style={{ maxWidth: 300 }}>
        <Loader2 size={32} className="spin mx-auto" color={T.blue} strokeWidth={2.2} />
        <h2 className="text-[21px] font-bold mt-6 tracking-[-0.02em]" style={{ color: T.g900 }}>제출하고 있어요</h2>
        <div className="mt-7 space-y-3">
          {SEND_STEPS.map((s, k) => (
            <div key={s} className="flex items-center gap-2.5" style={{ opacity: k > si ? .35 : 1, transition: "opacity .2s" }}>
              {k < si ? <Check size={16} color={T.green} strokeWidth={3} />
                : k === si ? <Loader2 size={16} className="spin" color={T.blue} strokeWidth={2.6} />
                : <span className="rounded-full" style={{ width: 16, height: 16, border: `2px solid ${T.g200}` }} />}
              <span className="text-[14px] font-medium" style={{ color: k <= si ? T.g800 : T.g400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </FullScreen>
  );

  if (step === "done") return (
    <FullScreen>
      <div className="px-6 py-12">
        <div className="flex justify-center"><BigCheck color={T.blue} /></div>
        <h2 className="text-[24px] font-bold text-center mt-7 tracking-[-0.02em]" style={{ color: T.g900 }}>제출했어요</h2>
        <p className="text-[15px] text-center mt-2.5 leading-relaxed" style={{ color: T.g600 }}>
          {chosen.length}곳에 보냈어요.<br />열어보면 알림으로 알려드릴게요.
        </p>

        <div className="mt-8 space-y-1">
          {chosen.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3.5 py-3">
              <BankMark b={b} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold truncate" style={{ color: T.g900 }}>{b.k}</div>
                <div className="text-[13px] mt-0.5" style={{ color: T.g500 }}>{b.t}</div>
              </div>
              <Chip tone={i === 0 ? "blue" : "grey"}>{i === 0 ? "열람함" : "전송됨"}</Chip>
            </div>
          ))}
        </div>

        <div className="mt-4 p-5 rounded-[16px]" style={{ background: T.g50 }}>
          <KV k="접수번호" v="RCP-2026-0815-77412" />
          <KV k="제출 시각" v="2026.08.15 14:36" />
          <KV k="제출 목적" v={purpose} />
          <KV k="열람 기간" v={`${days}일 후 자동 만료`} />
        </div>

        <p className="text-[13px] mt-4 leading-relaxed p-4 rounded-[14px]" style={{ background: T.blueBg, color: T.blueD }}>
          만료 전이라도 <b>제공 철회</b>를 누르면 은행이 바로 못 봐요. 누가 언제 열어봤는지도 남아요.
        </p>

        <div className="mt-7 space-y-2.5">
          <Btn onClick={onClose}>확인</Btn>
          <Btn tone="grey" onClick={() => window.print()} icon={FileText}>접수증 저장</Btn>
        </div>
      </div>
    </FullScreen>
  );

  if (step === "confirm") return (
    <Sheet title="이렇게 보낼게요" onClose={() => setStep("pick")}>
      <div className="py-4 text-center">
        <div className="text-[15px]" style={{ color: T.g600 }}>소득 리포트</div>
        <div className="text-[26px] font-bold mt-1 tracking-[-0.02em]" style={{ color: T.g900 }}>{chosen.length}곳에 제출</div>
      </div>
      <div className="p-4 rounded-[16px] space-y-1" style={{ background: T.g50 }}>
        {chosen.map((b) => (
          <div key={b.id} className="flex items-center gap-3 py-2">
            <BankMark b={b} size={34} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold truncate" style={{ color: T.g900 }}>{b.k}</div>
              <div className="text-[12px]" style={{ color: T.g500 }}>{b.t}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Label>왜 제출하나요</Label>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {PURPOSES.map((p) => (
            <button key={p} onClick={() => setPurpose(p)} aria-pressed={purpose === p}
              className="press px-3.5 py-2.5 rounded-[12px] text-[14px] font-semibold"
              style={{ background: purpose === p ? T.blueBg : T.g100, color: purpose === p ? T.blueD : T.g600 }}>{p}</button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Label>언제까지 볼 수 있게 할까요</Label>
        <div className="flex gap-2 mt-2.5">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setDays(d)} aria-pressed={days === d}
              className="press flex-1 py-3 rounded-[12px] tnum text-[15px] font-bold"
              style={{ background: days === d ? T.blue : T.g100, color: days === d ? "#fff" : T.g600 }}>{d}일</button>
          ))}
        </div>
      </div>

      <p className="text-[13px] leading-relaxed mt-5 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        위 {chosen.length}곳에 <b style={{ color: T.g900 }}>{purpose}</b> 목적으로 리포트 전문과 진본 확인 정보를 보내요.
        {days}일이 지나면 자동으로 못 보게 돼요.
      </p>

      <div className="mt-5"><Btn onClick={() => { setSi(0); setStep("send"); }}>제출하기</Btn></div>
    </Sheet>
  );

  return (
    <Sheet title="어디에 제출할까요?" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-2" style={{ color: T.g600 }}>여러 곳을 한 번에 고를 수 있어요.</p>
      {BANKS.map((b) => {
        const on = picked.includes(b.id);
        return (
          <button key={b.id} onClick={() => setPicked((p) => on ? p.filter((x) => x !== b.id) : [...p, b.id])}
            aria-pressed={on} className="rowpress w-full flex items-center gap-3.5 py-3 text-left">
            <BankMark b={b} />
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold" style={{ color: T.g900 }}>{b.k}</span>
              <span className="block text-[13px] mt-0.5" style={{ color: T.g500 }}>{b.t}</span>
            </span>
            <Tick on={on} filled size={24} />
          </button>
        );
      })}
      <div className="mt-5">
        <Btn disabled={!picked.length} onClick={() => setStep("confirm")}>
          {picked.length ? `${picked.length}곳 선택 완료` : "제출할 곳을 골라주세요"}
        </Btn>
      </div>
    </Sheet>
  );
};

/* ════════════════════════════════════════════════════════════════
   앱
   ════════════════════════════════════════════════════════════════ */
export default function App() {
  const [step, setStep] = useState(0);
  const [modal, setModal] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  const next = useCallback(() => setStep((s) => s + 1), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <Phone>
      <GlobalStyle />
      {step === 0 && <ScreenIntro onNext={next} />}
      {step === 1 && <ScreenConsent onNext={next} onBack={back} />}
      {step === 2 && <ScreenAuth onNext={next} onBack={back} />}
      {step === 3 && <ScreenCollect onNext={next} />}
      {step === 4 && <ScreenAnalyze onNext={next} />}
      {step === 5 && <ScreenReport onSubmit={() => setModal(true)} submitted={sent}
        onRestart={() => { setStep(0); setSent(false); }} />}
      {modal && <SubmitFlow onClose={() => setModal(false)} onDone={() => setSent(true)} already={sent} />}
    </Phone>
  );
}
