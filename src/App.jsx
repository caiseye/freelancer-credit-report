import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Smartphone, Monitor, ChevronRight, FlaskConical, ArrowLeft,
  ShieldCheck, ShieldAlert, TrendingDown, Clock, Scale, AlertTriangle,
  Bike, Car, PieChart, TriangleAlert,
} from "lucide-react";
import { T, TONE, FONT, eok, useWide } from "./core.js";
import { SCENARIOS, SCENARIO_GROUPS, getData, DEFAULT_SCENARIO } from "./scenarios.js";
import { AppCtx, GlobalStyle, Shell } from "./ui.jsx";
import {
  ScreenIntro, ScreenConsent, ScreenAuth, ScreenCollect,
  ScreenAnalyze, ScreenReport, SubmitFlow,
} from "./screens.jsx";

/* ════════════════════════════════════════════════════════════════
   라우팅 — 주소에 상태를 담아 새로고침·공유해도 같은 화면이 열립니다
     #/                             선택 화면
     #/<시나리오>/<app|web>/<단계>   프로토타입
   ════════════════════════════════════════════════════════════════ */
const STEPS = [
  { i: 0, k: "시작" }, { i: 1, k: "약관" }, { i: 2, k: "인증" },
  { i: 3, k: "수집" }, { i: 4, k: "분석" }, { i: 5, k: "리포트" },
];

const ICONS = {
  normal: ShieldCheck, fds_alert: ShieldAlert, income_down: TrendingDown,
  thin_file: Clock, high_dsr: Scale,
  rider_good: Bike, rider_bad: TriangleAlert, rider_dual: Car, rider_single: PieChart,
};

function parseHash() {
  const raw = (window.location.hash || "").replace(/^#\/?/, "");
  if (!raw) return null;
  const [sid, mode, step] = raw.split("/");
  if (!SCENARIOS.some((s) => s.id === sid)) return null;
  return {
    scenario: sid,
    mode: mode === "web" ? "web" : "app",
    step: Math.max(0, Math.min(5, parseInt(step, 10) || 0)),
  };
}

const writeHash = (r) => {
  const next = r ? `#/${r.scenario}/${r.mode}/${r.step}` : "#/";
  if (window.location.hash !== next) window.location.hash = next;
};

/* ════════════════════════════════════════════════════════════════
   선택 화면
   ════════════════════════════════════════════════════════════════ */
const Seg = ({ options, value, onChange, size = "md" }) => (
  <div className="inline-flex p-1 rounded-[12px]" style={{ background: T.g100 }}>
    {options.map((o) => {
      const on = o.v === value;
      return (
        <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={on}
          className="press inline-flex items-center gap-1.5 font-bold rounded-[9px]"
          style={{
            padding: size === "sm" ? "5px 10px" : "8px 16px",
            fontSize: size === "sm" ? 12.5 : 14,
            background: on ? T.white : "transparent",
            color: on ? T.g900 : T.g600,
            boxShadow: on ? "0 1px 3px rgba(0,0,0,.1)" : "none",
          }}>
          {o.icon && <o.icon size={size === "sm" ? 13 : 15} strokeWidth={2.3} />}{o.k}
        </button>
      );
    })}
  </div>
);

function Picker({ onOpen }) {
  const [mode, setMode] = useState("app");
  const [step, setStep] = useState(0);
  const wide = useWide(760);

  return (
    <div className="tw" style={{ background: T.bg, minHeight: "100vh", fontFamily: FONT, color: T.g900 }}>
      <div className="mx-auto" style={{ maxWidth: 1080, padding: wide ? "56px 32px 80px" : "32px 20px 60px" }}>

        <div className="fu">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] mb-4"
            style={{ background: T.g900, color: "#fff" }}>
            <FlaskConical size={13} strokeWidth={2.4} />
            <span className="text-[12px] font-bold">테스트 콘솔</span>
          </div>
          <h1 className="font-bold tracking-[-0.025em] leading-[1.25]"
            style={{ fontSize: wide ? 38 : 28, color: T.g900 }}>
            프리랜서 금융심사 리포트
          </h1>
          <p className="text-[15px] mt-3 leading-[1.65]" style={{ color: T.g600 }}>
            심사 결과가 갈리는 상황별로 화면이 어떻게 달라지는지 확인하는 프로토타입이에요.<br />
            케이스와 화면 종류를 고르면 그 조건으로 전체 흐름이 실행돼요.
          </p>
          <div className="flex gap-2.5 mt-5 p-4 rounded-[14px]" style={{ background: T.amberBg }}>
            <AlertTriangle size={16} color={T.amber} className="shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed" style={{ color: "#8A5200" }}>
              디자인 프로토타입이에요. 등장하는 인물·수치·문서번호·검증코드는 전부 지어낸 예시이고,
              실제로 발급되거나 효력이 있는 문서가 아니에요.
            </p>
          </div>
        </div>

        {/* 조건 */}
        <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <div className="text-[13px] font-bold mb-2" style={{ color: T.g500 }}>화면 종류</div>
            <Seg value={mode} onChange={setMode} options={[
              { v: "app", k: "모바일 앱", icon: Smartphone },
              { v: "web", k: "웹", icon: Monitor },
            ]} />
          </div>
          <div>
            <div className="text-[13px] font-bold mb-2" style={{ color: T.g500 }}>시작 지점</div>
            <Seg value={step} onChange={setStep} size="sm" options={[
              { v: 0, k: "처음부터" },
              { v: 3, k: "자료 수집" },
              { v: 5, k: "리포트 바로" },
            ]} />
          </div>
        </div>

        {/* 케이스 */}
        <div className="text-[13px] font-bold mt-9" style={{ color: T.g500 }}>테스트 케이스 {SCENARIOS.length}가지</div>
        {SCENARIO_GROUPS.map((grp) => (
        <div key={grp.k} className="mt-5">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[15px] font-bold" style={{ color: T.g900 }}>{grp.k}</span>
          <span className="text-[12px]" style={{ color: T.g400 }}>{grp.items.length}가지</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", gap: 14 }}>
          {grp.items.map((s, i) => {
            const D = getData(s.id);
            const c = TONE[s.tone];
            const Icon = ICONS[s.id] || ShieldCheck;
            return (
              <button key={s.id} onClick={() => onOpen({ scenario: s.id, mode, step })}
                className="press fu text-left w-full"
                style={{
                  background: T.white, border: `1px solid ${T.g200}`, borderRadius: 20,
                  padding: 22, animationDelay: `${0.05 + i * 0.05}s`,
                }}>
                <div className="flex items-start gap-3.5">
                  <span className="grid place-items-center rounded-[13px] shrink-0"
                    style={{ width: 42, height: 42, background: c.bg }}>
                    <Icon size={21} color={c.fg} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[17px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>{s.name}</span>
                      <span className="px-2 py-0.5 rounded-[7px] text-[11.5px] font-bold"
                        style={{ background: c.bg, color: c.deep }}>{s.grade}</span>
                    </div>
                    <div className="text-[12.5px] mt-1" style={{ color: T.g500 }}>{s.who}</div>
                  </div>
                  <ChevronRight size={18} color={T.g400} className="shrink-0 mt-2.5" />
                </div>

                <p className="text-[13.5px] leading-[1.6] mt-3.5" style={{ color: T.g600 }}>{s.desc}</p>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    ["월 소득", eok(D.HIST_AVG) + "원"],
                    ["DSR", D.LIMIT.dsr.toFixed(1) + "%"],
                    ["이상거래", D.FDS.alert ? `위험 ${D.FDS.alert}` : D.FDS.caution ? `확인 ${D.FDS.caution}` : "없음"],
                  ].map(([k, v], j) => (
                    <div key={k} className="p-2.5 rounded-[11px]" style={{ background: T.g50 }}>
                      <div className="text-[11px]" style={{ color: T.g500 }}>{k}</div>
                      <div className="tnum text-[13px] font-bold mt-0.5"
                        style={{ color: j === 2 && D.FDS.alert ? T.red : j === 1 && D.LIMIT.over ? T.red : T.g800 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        </div>
        ))}

        <p className="text-[12px] mt-8 leading-relaxed" style={{ color: T.g400 }}>
          주소창에 상태가 남아요. <code style={{ background: T.g100, padding: "1px 5px", borderRadius: 4 }}>#/fds_alert/web/5</code> 처럼
          직접 열거나 링크로 공유할 수 있어요.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   테스트 바 — 실행 중에도 케이스·화면·단계를 바로 바꿉니다
   ════════════════════════════════════════════════════════════════ */
function TestBar({ route, setRoute, onExit }) {
  const s = SCENARIOS.find((x) => x.id === route.scenario);
  const c = TONE[s.tone];
  const wide = useWide(880);

  return (
    <div className="noprint sticky top-0" style={{ zIndex: 60, background: T.navy, color: "#fff" }}>
      <div className="mx-auto flex items-center gap-3 px-4" style={{ maxWidth: 1400, height: 44 }}>
        <button onClick={onExit} className="press inline-flex items-center gap-1.5 text-[12.5px] font-bold shrink-0"
          style={{ color: "rgba(255,255,255,.85)" }}>
          <ArrowLeft size={14} strokeWidth={2.4} />{wide && "케이스 목록"}
        </button>

        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,.18)" }} />

        <select value={route.scenario} onChange={(e) => setRoute({ ...route, scenario: e.target.value })}
          aria-label="테스트 케이스"
          className="text-[12.5px] font-bold rounded-[7px] px-2 py-1 min-w-0"
          style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "none", maxWidth: 190 }}>
          {SCENARIOS.map((x) => <option key={x.id} value={x.id} style={{ color: "#000" }}>{x.name}</option>)}
        </select>

        <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold shrink-0"
          style={{ background: c.bg, color: c.deep }}>{s.grade}</span>

        <div className="flex-1" />

        {wide && (
          <div className="flex items-center gap-1 shrink-0">
            {STEPS.map((st) => (
              <button key={st.i} onClick={() => setRoute({ ...route, step: st.i })}
                className="press text-[11.5px] font-bold rounded-[6px] px-2 py-1"
                style={{
                  background: route.step === st.i ? "rgba(255,255,255,.9)" : "transparent",
                  color: route.step === st.i ? T.navy : "rgba(255,255,255,.6)",
                }}>{st.k}</button>
            ))}
          </div>
        )}

        <span style={{ width: 1, height: 18, background: "rgba(255,255,255,.18)" }} />

        <div className="inline-flex rounded-[7px] shrink-0" style={{ background: "rgba(255,255,255,.12)" }}>
          {[{ v: "app", icon: Smartphone, k: "앱" }, { v: "web", icon: Monitor, k: "웹" }].map((m) => (
            <button key={m.v} onClick={() => setRoute({ ...route, mode: m.v })} aria-pressed={route.mode === m.v}
              className="press inline-flex items-center gap-1 text-[11.5px] font-bold rounded-[7px] px-2 py-1"
              style={{
                background: route.mode === m.v ? "rgba(255,255,255,.9)" : "transparent",
                color: route.mode === m.v ? T.navy : "rgba(255,255,255,.6)",
              }}>
              <m.icon size={12} strokeWidth={2.4} />{m.k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   프로토타입 실행
   ════════════════════════════════════════════════════════════════ */
function Runner({ route, setRoute, onExit }) {
  const [modal, setModal] = useState(false);
  const [sent, setSent] = useState(false);
  const D = useMemo(() => getData(route.scenario), [route.scenario]);
  const step = route.step;

  const setStep = useCallback((fn) => {
    setRoute((r) => ({ ...r, step: Math.max(0, Math.min(5, typeof fn === "function" ? fn(r.step) : fn)) }));
  }, [setRoute]);

  const next = useCallback(() => setStep((s) => s + 1), [setStep]);
  const back = useCallback(() => setStep((s) => s - 1), [setStep]);

  useEffect(() => { window.scrollTo(0, 0); }, [step, route.scenario, route.mode]);
  /* 케이스를 바꾸면 제출 상태는 초기화 — 다른 사람의 제출 이력이 남으면 안 되니까 */
  useEffect(() => { setSent(false); setModal(false); }, [route.scenario]);

  const ctx = useMemo(() => ({ D, mode: route.mode }), [D, route.mode]);

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{ "--testbar": "44px" }}>
        <GlobalStyle />
        <TestBar route={route} setRoute={setRoute} onExit={onExit} />
        <Shell>
          {step === 0 && <ScreenIntro onNext={next} />}
          {step === 1 && <ScreenConsent onNext={next} onBack={back} />}
          {step === 2 && <ScreenAuth onNext={next} onBack={back} />}
          {step === 3 && <ScreenCollect onNext={next} />}
          {step === 4 && <ScreenAnalyze onNext={next} />}
          {step === 5 && (
            <ScreenReport onSubmit={() => setModal(true)} submitted={sent}
              onRestart={() => { setStep(0); setSent(false); }} />
          )}
          {modal && <SubmitFlow onClose={() => setModal(false)} onDone={() => setSent(true)} already={sent} />}
        </Shell>
      </div>
    </AppCtx.Provider>
  );
}

/* ════════════════════════════════════════════════════════════════
   진입점
   ════════════════════════════════════════════════════════════════ */
export default function App() {
  const [route, setRouteState] = useState(() => parseHash());

  /* 뒤로가기·주소 직접 입력에 반응.
     경로 형태가 아닌 해시(페이지 내 앵커 등)는 무시합니다. 그대로 받으면
     앵커 한 번에 라우트가 사라져 선택 화면으로 튕겨요. */
  useEffect(() => {
    const on = () => {
      const r = parseHash();
      const h = window.location.hash;
      if (r) setRouteState(r);
      else if (!h || h === "#" || h === "#/") setRouteState(null);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const setRoute = useCallback((next) => {
    setRouteState((prev) => {
      const v = typeof next === "function" ? next(prev) : next;
      writeHash(v);
      return v;
    });
  }, []);

  const open = useCallback((r) => setRoute(r), [setRoute]);
  const exit = useCallback(() => { setRouteState(null); writeHash(null); }, []);

  if (!route) return (<><GlobalStyle /><Picker onOpen={open} /></>);
  return <Runner route={route} setRoute={setRoute} onExit={exit} />;
}
