import React, { createContext, useContext, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { T, FONT, seeded, useWide } from "./core.js";

/* ════════════════════════════════════════════════════════════════
   컨텍스트 — 시나리오 데이터와 화면 모드(app/web)를 함께 흘립니다
   ════════════════════════════════════════════════════════════════ */
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
export const useD = () => useContext(AppCtx).D;
export const useWeb = () => useContext(AppCtx).mode === "web";

/* ════════════════════════════════════════════════════════════════
   전역 스타일
   ════════════════════════════════════════════════════════════════ */
export const GlobalStyle = () => (
  <style>{`
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

.tw *{box-sizing:border-box}
.tw button{font-family:inherit}
.tw{-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
.tnum{font-variant-numeric:tabular-nums}

.tw :focus-visible{outline:2px solid ${T.blue};outline-offset:2px;border-radius:8px}
.press{transition:transform .1s ease, background-color .15s ease, opacity .15s ease}
.press:active{transform:scale(.975)}
.rowpress{transition:background-color .12s ease}
.rowpress:active{background:${T.g100}}

@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes sheetUp{from{transform:translateY(100%)}to{transform:none}}
@keyframes dialogIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
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

/* 웹 문서형 리포트 — 좁아지면 목차를 접고 1단으로 */
@media (max-width: 960px){
  .webgrid{grid-template-columns:minmax(0,1fr) !important;gap:0 !important}
  .webtoc{display:none !important}
}

@media (prefers-reduced-motion:reduce){
  .tw *{animation-duration:.001s !important;animation-delay:0s !important;transition-duration:.001s !important}
}

@media print{
  .noprint{display:none !important}
  .tw{background:#fff !important}
  .phone,.webwrap{max-width:none !important;box-shadow:none !important;min-height:0 !important;border:0 !important;border-radius:0 !important}
  .printdoc{display:block !important}
  .reportgrid{display:block !important}
  .webgrid{grid-template-columns:minmax(0,1fr) !important;gap:0 !important}
  .webtoc{display:none !important}
  table{break-inside:auto}
  tr{break-inside:avoid}
  .card{break-inside:avoid;page-break-inside:avoid;box-shadow:none !important;border:0 !important;
        border-bottom:1px solid ${T.g200} !important;border-radius:0 !important;
        padding-left:0 !important;padding-right:0 !important;margin:0 !important}
  .stack{background:#fff !important}
  @page{size:A4;margin:14mm}
}
`}</style>
);

/* ════════════════════════════════════════════════════════════════
   레이아웃 — 모드에 따라 폰 컬럼 / 넓은 웹 캔버스
   ════════════════════════════════════════════════════════════════ */
export const Shell = ({ children }) => {
  const web = useWeb();
  const wide = useWide(820);
  return (
    <div className="tw" style={{ background: T.bg, minHeight: "100vh", fontFamily: FONT, color: T.g900 }}>
      {web ? (
        <div className="webwrap" style={{ minHeight: "100vh" }}>{children}</div>
      ) : (
        <div className="phone mx-auto relative" style={{
          maxWidth: 480, background: T.white, minHeight: "100vh",
          boxShadow: wide ? "0 0 0 1px rgba(0,0,0,.06), 0 24px 60px -24px rgba(0,0,0,.22)" : "none",
        }}>{children}</div>
      )}
    </div>
  );
};

/** 웹 모드에서 본문을 가운데로 모으는 컨테이너 */
export const Wrap = ({ children, w = 760, className = "" }) => {
  const web = useWeb();
  if (!web) return <>{children}</>;
  return <div className={`mx-auto w-full ${className}`} style={{ maxWidth: w, paddingLeft: 24, paddingRight: 24 }}>{children}</div>;
};

export const AppBar = ({ onBack, pct, right, title }) => {
  const web = useWeb();
  return (
    <div className="noprint sticky z-30" style={{
      top: "var(--testbar, 0px)",
      background: T.white, borderBottom: web ? `1px solid ${T.g200}` : "none",
    }}>
      <Wrap w={1160}>
        <div className="flex items-center h-14" style={{ paddingLeft: web ? 0 : 8, paddingRight: web ? 0 : 8 }}>
          {onBack ? (
            <button onClick={onBack} aria-label="뒤로" className="press w-10 h-10 grid place-items-center rounded-full">
              <ChevronLeft size={26} color={T.g800} strokeWidth={2.2} />
            </button>
          ) : <span className="w-10" />}
          {title && <span className="text-[15px] font-bold ml-1" style={{ color: T.g900 }}>{title}</span>}
          <div className="flex-1" />
          {right}
        </div>
      </Wrap>
      {pct != null && (
        <div style={{ height: 3, background: T.g100 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: T.blue, borderRadius: 3, transition: "width .45s cubic-bezier(.2,.8,.3,1)" }} />
        </div>
      )}
    </div>
  );
};

export const Screen = ({ children, className = "", w = 720 }) => {
  const web = useWeb();
  return web
    ? <div className={`mx-auto w-full pb-32 pt-2 ${className}`} style={{ maxWidth: w, paddingLeft: 24, paddingRight: 24 }}>{children}</div>
    : <div className={`px-6 pb-40 ${className}`}>{children}</div>;
};

/* 하단 CTA — 앱은 고정 바, 웹은 화면 하단에 붙는 액션 바 */
export const Bottom = ({ children, hint }) => {
  const web = useWeb();
  if (web) return (
    <div className="noprint sticky bottom-0 z-30" style={{ background: T.white, borderTop: `1px solid ${T.g200}` }}>
      <div className="mx-auto w-full flex items-center gap-4 py-4" style={{ maxWidth: 720, paddingLeft: 24, paddingRight: 24 }}>
        {hint && <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: T.g500 }}>{hint}</p>}
        <div style={{ width: hint ? 300 : "100%" }}>{children}</div>
      </div>
    </div>
  );
  return (
    <div className="noprint fixed bottom-0 left-1/2 w-full z-30" style={{ maxWidth: 480, transform: "translateX(-50%)" }}>
      <div style={{ height: 24, background: `linear-gradient(180deg, rgba(255,255,255,0), ${T.white})` }} />
      <div className="px-6 pb-6" style={{ background: T.white }}>
        {hint && <p className="text-[12px] text-center mb-3 leading-relaxed" style={{ color: T.g500 }}>{hint}</p>}
        {children}
      </div>
    </div>
  );
};

export const Card = ({ children, className = "", pad, bg }) => {
  const web = useWeb();
  const p = pad || (web ? "px-7 py-7" : "px-6 py-7");
  return (
    <div className={`card ${p} ${className}`} style={{
      background: bg || T.white,
      borderRadius: web ? 20 : 0,
      border: web ? `1px solid ${T.g200}` : "none",
      breakInside: "avoid",
    }}>{children}</div>
  );
};

/* 전체화면 오버레이 */
export const FullScreen = ({ children }) => {
  const web = useWeb();
  if (web) return (
    <div className="noprint fixed inset-0 z-50 overflow-y-auto grid place-items-center px-6 py-10" style={{ background: T.bg }}>
      <div className="w-full" style={{ maxWidth: 560, background: T.white, borderRadius: 24, border: `1px solid ${T.g200}` }}>{children}</div>
    </div>
  );
  return (
    <div className="noprint fixed inset-0 z-50 overflow-y-auto" style={{ background: T.bg }}>
      <div className="mx-auto flex flex-col" style={{ maxWidth: 480, minHeight: "100vh", background: T.white }}>{children}</div>
    </div>
  );
};

/* 바텀시트(앱) / 다이얼로그(웹) */
export const Sheet = ({ children, onClose, title }) => {
  const web = useWeb();
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className={`noprint fixed inset-0 z-50 flex justify-center ${web ? "items-center p-6" : "items-end"}`}
      style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="w-full relative"
        style={{
          maxWidth: web ? 620 : 480, background: T.white,
          borderRadius: web ? 24 : "20px 20px 0 0",
          maxHeight: web ? "84vh" : "88vh", overflowY: "auto",
          animation: web ? "dialogIn .26s cubic-bezier(.2,.8,.3,1) both" : "sheetUp .34s cubic-bezier(.32,.72,0,1) both",
        }}>
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
   기본 요소
   ════════════════════════════════════════════════════════════════ */
export const H1 = ({ children, className = "" }) => {
  const web = useWeb();
  return <h1 className={`${web ? "text-[30px]" : "text-[24px]"} font-bold leading-[1.35] tracking-[-0.02em] ${className}`}
    style={{ color: T.g900 }}>{children}</h1>;
};

export const Sub = ({ children, className = "" }) => (
  <p className={`text-[15px] leading-[1.6] mt-3 ${className}`} style={{ color: T.g600 }}>{children}</p>
);

export const Label = ({ children, color }) => (
  <div className="text-[13px] font-semibold" style={{ color: color || T.g500 }}>{children}</div>
);

export const Btn = ({ children, onClick, disabled, tone = "blue", size = "lg", full = true, icon: Icon }) => {
  const tones = {
    blue: { background: disabled ? T.g200 : T.blue, color: disabled ? T.g400 : "#fff" },
    grey: { background: T.g100, color: T.g800 },
    red: { background: disabled ? T.g200 : T.red, color: disabled ? T.g400 : "#fff" },
    ghost: { background: "transparent", color: T.g600 },
  };
  const sz = size === "lg"
    ? { height: 56, fontSize: 17, borderRadius: 14 }
    : { height: 44, fontSize: 15, borderRadius: 12, paddingLeft: 16, paddingRight: 16 };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`press inline-flex items-center justify-center gap-1.5 font-bold ${full ? "w-full" : ""}`}
      style={{ ...tones[tone], ...sz, cursor: disabled ? "default" : "pointer" }}>
      {Icon && <Icon size={size === "lg" ? 19 : 16} strokeWidth={2.3} />}{children}
    </button>
  );
};

export const Row = ({ icon: Icon, iconBg, iconColor, title, sub, right, onClick, chevron, className = "" }) => {
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

export const KV = ({ k, v, sub, strong, color }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="text-[14px] shrink-0" style={{ color: T.g600 }}>{k}</span>
    <span className="text-right min-w-0">
      <span className={`block tnum text-[14px] ${strong ? "font-bold" : "font-semibold"}`} style={{ color: color || T.g900 }}>{v}</span>
      {sub && <span className="block text-[12px] mt-0.5 leading-snug" style={{ color: T.g500 }}>{sub}</span>}
    </span>
  </div>
);

export const Chip = ({ children, tone = "grey" }) => {
  const c = {
    grey: [T.g100, T.g700], blue: [T.blueBg, T.blueD], green: [T.greenBg, "#00875A"],
    amber: [T.amberBg, "#B36B00"], red: [T.redBg, "#B3202C"],
  }[tone];
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[8px] text-[12px] font-bold"
    style={{ background: c[0], color: c[1] }}>{children}</span>;
};

export const Divider = ({ my = 4 }) => <div style={{ height: 1, background: T.g100, marginTop: my, marginBottom: my }} />;

export const Tick = ({ on, size = 24, filled }) => (
  <span className="grid place-items-center rounded-full shrink-0"
    style={{
      width: size, height: size,
      background: on ? (filled ? T.blue : "transparent") : (filled ? T.g200 : "transparent"),
      transition: "background .15s",
    }}>
    <Check size={size * 0.66} strokeWidth={3} color={on ? (filled ? "#fff" : T.blue) : T.g300} />
  </span>
);

export const Meter = ({ pct, color, delay = 0, h = 8, track }) => (
  <div className="rounded-full overflow-hidden" style={{ height: h, background: track || T.g100 }}>
    <div className="h-full rounded-full growx"
      style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color || T.blue, animationDelay: `${delay}s` }} />
  </div>
);

export const BigCheck = ({ size = 84, color }) => (
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

export const CardTitle = ({ children, onMore }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h3 className="text-[17px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>{children}</h3>
    {onMore && (
      <button onClick={onMore} className="press shrink-0 inline-flex items-center text-[13px] font-semibold noprint" style={{ color: T.g500 }}>
        자세히 <ChevronRight size={15} />
      </button>
    )}
  </div>
);

/* ════════════════════════════════════════════════════════════════
   진본 표시 그래픽
   ════════════════════════════════════════════════════════════════ */
export const QRBlock = ({ value, size = 92 }) => {
  const N = 25;
  const g = useMemo(() => {
    const rnd = seeded(value);
    const m = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) m[r][c] = rnd() > 0.52 ? 1 : 0;
    const fin = (r, c) => {
      for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
        const y = r + i, x = c + j;
        if (y < 0 || x < 0 || y >= N || x >= N) continue;
        m[y][x] = (i >= 0 && i <= 6 && j >= 0 && j <= 6 &&
          (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))) ? 1 : 0;
      }
    };
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

export const Barcode = ({ value, h = 40 }) => {
  const bars = useMemo(() => {
    const rnd = seeded(value); const out = []; let x = 0;
    while (x < 194) { const w = 1 + Math.floor(rnd() * 3.2); const gp = 1 + Math.floor(rnd() * 2.4); out.push([x, w]); x += w + gp; }
    return out;
  }, [value]);
  return (
    <svg viewBox="0 0 200 34" className="w-full" style={{ height: h }} aria-label={`바코드 ${value}`}>
      {bars.map(([x, w], i) => <rect key={i} x={x + 2} y="0" width={w} height="24" fill={T.g900} />)}
      <text x="100" y="32" textAnchor="middle" className="tnum"
        style={{ fontSize: 5.4, fill: T.g500, fontWeight: 700, letterSpacing: "1.4px" }}>{value}</text>
    </svg>
  );
};

/* 월별 소득 + 예측 — 데이터 길이에 맞춰 폭·눈금이 자동으로 잡힙니다 */
export const IncomeBars = () => {
  const D = useD();
  const all = [
    ...D.HIST.map(([ym, v]) => ({ ym, v, f: false })),
    ...D.BAND.map((b) => ({ ym: b.ym, v: b.p50, f: true })),
  ];
  const max = Math.max(...all.map((d) => d.v)) * 1.08;
  const W = 336, H = 118;
  const bw = Math.max(5, Math.min(11, (W / all.length) * 0.62));
  const gap = all.length > 1 ? (W - all.length * bw) / (all.length - 1) : 0;
  const splitX = (D.HIST.length - 1) * (bw + gap) + bw + gap / 2;
  const fmt = (ym) => ym.slice(2).replace("-", ".");

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label="월별 소득과 예측">
      {all.map((d, i) => {
        const h = Math.max(4, (d.v / max) * H), x = i * (bw + gap);
        return <rect key={d.ym} x={x} y={H - h} width={bw} height={h} rx={bw / 2}
          fill={d.f ? "#B7D5FB" : T.blue} className="risey" style={{ animationDelay: `${i * 0.022}s` }} />;
      })}
      <line x1={splitX} x2={splitX} y1={0} y2={H} stroke={T.g300} strokeWidth="1" strokeDasharray="3 3" />
      <text x="0" y={H + 14} style={{ fontSize: 10.5, fill: T.g400, fontWeight: 600 }}>{fmt(D.HIST[0][0])}</text>
      <text x={splitX - gap / 2 - bw} y={H + 14} textAnchor="middle" style={{ fontSize: 10.5, fill: T.g400, fontWeight: 600 }}>
        {fmt(D.HIST[D.HIST.length - 1][0])}
      </text>
      <text x={W} y={H + 14} textAnchor="end" style={{ fontSize: 10.5, fill: "#7FB2F5", fontWeight: 600 }}>
        {fmt(D.BAND[D.BAND.length - 1].ym)}
      </text>
    </svg>
  );
};
