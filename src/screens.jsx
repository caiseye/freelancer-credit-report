import React, { useState, useEffect } from "react";
import {
  ChevronRight, Check, X, Loader2, Lock, Landmark, Building2, Layers,
  ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Sparkles, FileText,
  Download, AlertCircle, AlertTriangle, Info, RefreshCw, Wallet, Ban,
  Landmark as Bank, CreditCard, PiggyBank, Receipt,
} from "lucide-react";
import { IDP_GROUPS, IDP_COUNT, findIdp } from "./idps.js";
import { CashWaterfall, CreditTable, CreditStats, SpendBars, SpendFlags,
         ReviewPositions, Perspectives, ReviewLimits } from "./blocks.jsx";
import { WebReport } from "./webreport.jsx";
import { T, TONE, won, eok, sleep, useCountUp } from "./core.js";
import {
  useD, useWeb, AppBar, Screen, Bottom, Card, FullScreen, Sheet, Wrap,
  H1, Sub, Label, Btn, Row, KV, Chip, Divider, Tick, Meter, BigCheck,
  CardTitle, QRBlock, Barcode, IncomeBars,
} from "./ui.jsx";

/* FDS 판정 → 색 */
const stTone = (st) => (st === "위험" ? "red" : st === "확인" ? "amber" : "green");

/* 수집 그룹 — 시나리오 데이터에서 만들어집니다 */
const groupsOf = (D) => [
  { id: "fin", icon: Landmark, bg: T.blueBg, fg: T.blue, k: "금융 마이데이터", via: "신용정보원",
    items: D.FIN_ORGS.map((o) => ({ k: o.k, res: o.n })) },
  { id: "pub", icon: Building2, bg: T.greenBg, fg: T.green, k: "공공 마이데이터", via: "정부24",
    items: D.PUB_DOCS.map((d) => ({ k: d.k, res: d.org })) },
  { id: "api", icon: Layers, bg: "#F3EEFF", fg: "#6E45CF", k: "플랫폼 소득", via: "정산 API",
    items: D.PLATFORMS.map((p) => ({ k: p.name, res: `${p.cnt}건 · ${eok(p.amt)}원` })) },
];

/* ════════════════════════════════════════════════════════════════
   1 · 시작
   ════════════════════════════════════════════════════════════════ */
const PreviewCard = () => {
  const D = useD();
  const tone = TONE[D.verdict.tone];
  return (
    <div className="relative" style={{ height: 260 }}>
      <div className="absolute inset-x-0 top-0 rounded-[24px]"
        style={{ height: 210, background: `linear-gradient(165deg, ${tone.bg}, #F8FAFF)` }} />
      <div className="absolute left-5 right-5 top-8">
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {D.PLATFORMS.slice(0, 4).map((p, i) => (
            <span key={p.name} className="fu px-2 py-1 rounded-[8px] text-[11px] font-bold"
              style={{ background: "rgba(255,255,255,.9)", color: T.g600, animationDelay: `${0.15 + i * 0.07}s` }}>{p.name}</span>
          ))}
        </div>
        <div className="fu rounded-[20px] p-5"
          style={{ background: T.white, boxShadow: "0 12px 32px -12px rgba(49,130,246,.28)", animationDelay: ".3s" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold" style={{ color: T.g500 }}>계속근무가능성</span>
            <Chip tone={D.verdict.tone}>{D.CWP.rank}</Chip>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="tnum text-[38px] font-bold leading-none tracking-[-0.03em]" style={{ color: tone.fg }}>
              {D.CWP.m12.toFixed(1)}
            </span>
            <span className="text-[20px] font-bold" style={{ color: tone.fg }}>%</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              ["근로 성실도", `${D.WDI.toFixed(1)}점`],
              ["이상거래", D.FDS.alert ? `위험 ${D.FDS.alert}건` : "없어요"],
              ["12개월 예상소득", `${eok(D.FCST_SUM)}원`],
            ].map(([k, v]) => (
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
};

export const ScreenIntro = ({ onNext }) => {
  const D = useD();
  const web = useWeb();
  return (
    <>
      <AppBar right={<span className="text-[13px] font-semibold" style={{ color: T.g500 }}>포용금융</span>} />
      <Screen>
        <div className={web ? "grid gap-10 items-center" : ""} style={web ? { gridTemplateColumns: "1fr 1fr" } : undefined}>
          <div>
            <div className="fu">
              <H1>흩어진 소득,<br />한 장으로 증명해요</H1>
              <Sub>재직증명서를 못 받는 프리랜서를 위해<br />플랫폼 정산 내역과 마이데이터를 모아<br />은행이 심사에 쓰는 리포트를 만들어 드려요.</Sub>
            </div>
            <div className="mt-2">
              {[
                [TrendingUp, T.blueBg, T.blue, "앞으로 얼마나 벌지 예측해요", `${D.ME.months}개월 기록으로 12개월 현금흐름을 계산해요`],
                [Sparkles, T.greenBg, T.green, "얼마나 성실히 일했는지 점수로", "납기 준수율, 가동일수 등 6가지를 봐요"],
                [ShieldCheck, "#FFF0F1", T.red, "이상거래를 미리 걸러내요", `${D.FDS_RULES.length}가지를 검사하고 걸리면 이유까지 설명해요`],
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
          </div>
          <div className={web ? "" : "mt-7"}><PreviewCard /></div>
        </div>
      </Screen>
      <Bottom hint="대출 승인을 보장하진 않아요. 은행이 참고하는 자료예요.">
        <Btn onClick={onNext}>리포트 만들기</Btn>
      </Bottom>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   2 · 약관 동의
   ════════════════════════════════════════════════════════════════ */
const consentsOf = (D) => [
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
    ["어디서", `금융 ${D.FIN_ORGS.length}곳, 공공 ${D.PUB_DOCS.length}곳, 플랫폼 ${D.PLATFORMS.length}곳 (총 ${D.ORG_TOTAL}곳)`],
    ["무엇을", `계좌·카드·투자·보험 거래내역 ${D.FDS.months}개월, 증명서류 ${D.PUB_DOCS.length}종, 정산 내역 ${D.ME.months}개월`],
    ["언제 끝나요?", "딱 한 번만 가져와요. 리포트가 만들어지면 자동으로 끝나요"],
    ["철회", "마이데이터 종합포털이나 설정에서 언제든 취소할 수 있어요"]] },
  { id: "c5", req: false, t: "발급 이력 보관 (선택)", law: "동의하지 않아도 발급에 문제 없어요", rows: [
    ["보관 항목", "발급 일시, 문서번호, 제출 이력 (리포트 내용은 저장 안 해요)"],
    ["쓰는 이유", "다시 발급할 때 절차를 줄여드려요"],
    ["보관 기간", "12개월"]] },
];

export const ScreenConsent = ({ onNext, onBack }) => {
  const D = useD();
  const CONSENTS = consentsOf(D);
  const [on, setOn] = useState({});
  const [detail, setDetail] = useState(null);
  const allReq = CONSENTS.filter((c) => c.req).every((c) => on[c.id]);
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
/* 인증 수단 타일 — 사업자 수가 많아 리스트 대신 격자로 놓습니다 */
const IdpTile = ({ i, on, onClick }) => (
  <button onClick={onClick} aria-pressed={on}
    className="press relative flex flex-col items-center justify-center gap-2 text-center"
    style={{
      padding: "14px 8px", borderRadius: 14, minHeight: 96,
      background: on ? T.blueBg : T.white,
      border: `1.5px solid ${on ? T.blue : T.g200}`,
    }}>
    {on && (
      <span className="absolute grid place-items-center rounded-full"
        style={{ top: 7, right: 7, width: 17, height: 17, background: T.blue }}>
        <Check size={11} strokeWidth={3.5} color="#fff" />
      </span>
    )}
    <span className="grid place-items-center rounded-[11px] shrink-0"
      style={{ width: 34, height: 34, background: i.bg }}>
      {i.lock
        ? <Lock size={16} color={i.fg} strokeWidth={2.3} />
        : <span className="font-bold leading-none"
            style={{ color: i.fg, fontSize: i.mark.length >= 5 ? 8.5 : i.mark.length >= 3 ? 10.5 : 14 }}>{i.mark}</span>}
    </span>
    <span className="min-w-0 w-full">
      <span className="block text-[12px] font-bold leading-tight truncate" style={{ color: T.g900 }}>{i.k}</span>
      <span className="block text-[10.5px] mt-0.5 leading-tight truncate" style={{ color: T.g500 }}>{i.org}</span>
    </span>
  </button>
);

export const ScreenAuth = ({ onNext, onBack }) => {
  const D = useD();
  const web = useWeb();
  const [pick, setPick] = useState("kakao");
  const [phase, setPhase] = useState("pick");
  const [left, setLeft] = useState(180);
  const idp = findIdp(pick);

  useEffect(() => {
    if (phase !== "wait") return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    const a = setTimeout(() => setPhase("ok"), 2400);
    return () => { clearInterval(t); clearTimeout(a); };
  }, [phase]);
  useEffect(() => { if (phase === "ok") { const t = setTimeout(onNext, 1300); return () => clearTimeout(t); } }, [phase, onNext]);

  if (phase === "ok") return (
    <FullScreen>
      <div className="flex-1 grid place-items-center px-6 py-12 text-center">
        <div>
          <div className="flex justify-center"><BigCheck /></div>
          <h2 className="text-[22px] font-bold mt-7 tracking-[-0.02em]" style={{ color: T.g900 }}>본인 확인이 끝났어요</h2>
          <p className="text-[15px] mt-2" style={{ color: T.g600 }}>{D.ME.name}님, 이제 자료를 모을게요</p>
        </div>
      </div>
    </FullScreen>
  );

  if (phase === "wait") return (
    <>
      <AppBar onBack={() => { setPhase("pick"); setLeft(180); }} pct={40} />
      <Screen>
        <div className="pt-10 text-center">
          <div className="relative mx-auto grid place-items-center" style={{ width: 96, height: 96 }}>
            <span className="absolute rounded-full" style={{ width: 96, height: 96, background: idp.bg, opacity: .25, animation: "ring 1.6s ease-out infinite" }} />
            <span className="grid place-items-center rounded-[30px]" style={{ width: 76, height: 76, background: idp.bg }}>
              {idp.lock
                ? <Lock size={30} color={idp.fg} strokeWidth={2.2} />
                : <span className="font-bold leading-none"
                    style={{ color: idp.fg, fontSize: idp.mark.length >= 5 ? 17 : idp.mark.length >= 3 ? 22 : 30 }}>{idp.mark}</span>}
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
      </Screen>
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
          {[["이름", D.ME.name], ["생년월일", D.ME.birth], ["휴대폰", D.ME.phone]].map(([k, v]) => <KV key={k} k={k} v={v} />)}
        </div>

        <div className="mt-6 space-y-6">
          {IDP_GROUPS.map((g) => (
            <div key={g.id}>
              <div className="flex items-baseline justify-between gap-3">
                <Label color={T.g700}>{g.k}</Label>
                <span className="text-[11.5px]" style={{ color: T.g400 }}>{g.items.length}곳</span>
              </div>
              <p className="text-[12.5px] mt-1" style={{ color: T.g500 }}>{g.sub}</p>
              <div className="mt-3" style={{
                display: "grid",
                gridTemplateColumns: `repeat(${web ? 5 : 3}, minmax(0, 1fr))`,
                gap: 8,
              }}>
                {g.items.map((i) => (
                  <IdpTile key={i.id} i={i} on={pick === i.id} onClick={() => setPick(i.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[12px] leading-relaxed mt-6 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
          전자서명인증사업자 {IDP_COUNT}곳을 지원해요. 어떤 수단을 골라도 확인하는 내용과
          가져오는 자료는 같아요. 인증 결과는 본인 확인에만 쓰고 따로 보관하지 않아요.
        </p>
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
export const ScreenCollect = ({ onNext }) => {
  const D = useD();
  const GROUPS = groupsOf(D);
  const FLAT = GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, g: g.id })));
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
          <Sub>{done ? `${D.ORG_TOTAL}곳에서 받은 자료를 리포트 형식으로 정리했어요.` : `${D.ORG_TOTAL}곳에 순서대로 요청하고 있어요. 잠시만요.`}</Sub>
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
              {[
                ["가져온 곳", `${D.ORG_TOTAL}곳`],
                ["금융 거래", `${won(D.FDS.scanned)}건`],
                ["정산 내역", `${won(D.SETTLE_CNT)}건`],
                ["증명 서류", `${D.PUB_DOCS.length}종`],
              ].map(([k, v]) => (
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
export const ScreenAnalyze = ({ onNext }) => {
  const D = useD();
  const STAGES = [
    { k: "정산 내역을 정리하고 있어요", d: `${D.ME.months}개월 소득을 확정했어요`, ms: 1500 },
    { k: "얼마나 계속 일할 수 있는지 보고 있어요", d: "비슷한 일 하는 12,400명과 비교하는 중", ms: 1600 },
    { k: "성실도를 점수로 바꾸고 있어요", d: "계약 이력과 리뷰를 확인했어요", ms: 1500 },
    { k: "이상거래를 검사하고 있어요", d: `거래 ${won(D.FDS.scanned)}건에 ${D.FDS_RULES.length}가지 기준을 적용 중`, ms: 1700 },
    { k: "앞으로 얼마 벌지 계산하고 있어요", d: "1만 번 시뮬레이션을 돌리고 있어요", ms: 1600 },
    { k: "리포트를 봉인하고 있어요", d: "타임스탬프를 찍어 위조를 막고 있어요", ms: 1600 },
  ];
  const [s, setS] = useState(0);
  useEffect(() => {
    if (s >= STAGES.length) { const t = setTimeout(onNext, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setS((v) => v + 1), STAGES[s].ms);
    return () => clearTimeout(t);
  }, [s, onNext]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = STAGES[Math.min(s, STAGES.length - 1)];
  const pct = Math.round((Math.min(s, STAGES.length) / STAGES.length) * 100);

  return (
    <>
      <AppBar pct={80} />
      <Screen>
        <div className="pt-16 text-center">
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
      </Screen>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   6 · 리포트 카드
   ════════════════════════════════════════════════════════════════ */
const Big = ({ v, unit, color, decimals = 0 }) => (
  <div className="flex items-baseline gap-1">
    <span className="tnum text-[40px] font-bold leading-none tracking-[-0.035em]" style={{ color: color || T.g900 }}>
      {decimals ? v.toFixed(decimals) : won(v)}
    </span>
    <span className="text-[20px] font-bold" style={{ color: color || T.g900 }}>{unit}</span>
  </div>
);

/* — 종합 판정 — 시나리오마다 색과 문구가 통째로 바뀝니다 — */
const CardVerdict = () => {
  const D = useD();
  const v = D.verdict;
  const c = TONE[v.tone];
  const Icon = v.tone === "green" ? ShieldCheck : v.tone === "red" ? ShieldAlert : AlertTriangle;
  return (
    <Card bg={c.bg}>
      <div className="flex items-start gap-3.5">
        <span className="grid place-items-center rounded-[14px] shrink-0" style={{ width: 46, height: 46, background: "rgba(255,255,255,.75)" }}>
          <Icon size={24} color={c.fg} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: c.deep }}>{v.title}</span>
          </div>
          <p className="text-[14px] mt-2 leading-relaxed" style={{ color: c.deep }}>{v.msg}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5">
        {v.flags.map((f) => (
          <div key={f.k} className="p-3 rounded-[13px]" style={{ background: "rgba(255,255,255,.75)" }}>
            <div className="text-[11.5px]" style={{ color: T.g500 }}>{f.k}</div>
            <div className="text-[13px] font-bold mt-1 leading-snug" style={{ color: TONE[f.tone].deep }}>{f.v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* — 자료 부족 안내 (이력 부족 케이스) — */
const CardGaps = () => {
  const D = useD();
  if (!D.dataGaps) return null;
  return (
    <Card>
      <CardTitle>이건 미리 알아두세요</CardTitle>
      <div className="space-y-2.5">
        {D.dataGaps.map((g) => (
          <div key={g} className="flex gap-2.5">
            <AlertCircle size={15} color={T.amber} strokeWidth={2.4} className="shrink-0 mt-0.5" />
            <p className="text-[14px] leading-relaxed" style={{ color: T.g700 }}>{g}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CardCWP = ({ onMore }) => {
  const D = useD();
  const v = useCountUp(D.CWP.m12, 1000, 150);
  const below = D.CWP.m12 < D.CWP.peer;
  const c = below ? T.amber : T.blue;
  const gap = Math.abs(D.CWP.m12 - D.CWP.peer).toFixed(1);
  return (
    <Card>
      <CardTitle onMore={onMore}>앞으로도 계속 일할 가능성</CardTitle>
      <Big v={v} unit="%" color={c} decimals={1} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        비슷한 일 하는 사람 평균보다 <b style={{ color: T.g900 }}>{gap}%p {below ? "낮아요." : "높아요."}</b><br />
        {D.CWP.lowConfidence
          ? `이력이 ${D.HIST.length}개월뿐이라 신뢰도가 낮아요.`
          : `소득이 끊긴 달이 ${D.ME.months}개월 동안 한 번도 없었어요.`}
      </p>
      <div className="mt-5 space-y-3">
        {[[`${D.ME.name}님`, D.CWP.m12, c], ["같은 일 평균", D.CWP.peer, T.g300]].map(([k, p, col], i) => (
          <div key={k}>
            <div className="flex items-center justify-between text-[13px] mb-1.5">
              <span className="font-semibold" style={{ color: i ? T.g500 : T.g800 }}>{k}</span>
              <span className="tnum font-bold" style={{ color: i ? T.g500 : c }}>{p.toFixed(1)}%</span>
            </div>
            <Meter pct={p} color={col} delay={0.15 + i * 0.1} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[["24개월 뒤", D.CWP.m24], ["36개월 뒤", D.CWP.m36]].map(([k, val]) => (
          <div key={k} className="p-3.5 rounded-[14px]" style={{ background: T.g50 }}>
            <div className="text-[12px]" style={{ color: T.g500 }}>{k}</div>
            <div className="tnum text-[17px] font-bold mt-0.5" style={{ color: T.g800 }}>{val.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CardFlow = ({ onMore }) => {
  const D = useD();
  const v = useCountUp(D.FCST_SUM, 1100, 200);
  const prevAvg = D.HIST_AVG, nextAvg = D.FCST_AVG;
  const drop = nextAvg < prevAvg * 0.9;
  return (
    <Card>
      <CardTitle onMore={onMore}>앞으로 12개월, 이만큼 벌 것 같아요</CardTitle>
      <Big v={Math.round(v / 10000)} unit="만원" color={T.g900} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        한 달 평균 <b style={{ color: T.g900 }}>{won(nextAvg)}원</b>이에요.
        {drop && <> 지난 {D.HIST.length}개월 평균보다 <b style={{ color: T.red }}>{Math.round((1 - nextAvg / prevAvg) * 100)}% 낮아요.</b></>}<br />
        보수적으로 봐도 {eok(D.P10_SUM)}원은 벌어요.
      </p>
      <div className="mt-6"><IncomeBars /></div>
      <div className="flex items-center gap-4 mt-1 text-[12px]" style={{ color: T.g500 }}>
        <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: T.blue }} />지난 {D.HIST.length}개월</span>
        <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: "#B7D5FB" }} />앞으로 12개월</span>
      </div>
      <div className="mt-5 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k={`지난 ${D.HIST.length}개월 소득`} v={`${won(D.HIST_SUM)}원`} />
        <KV k="앞으로 12개월 예상" v={`${won(D.FCST_SUM)}원`} sub="중앙값 기준" strong color={drop ? T.amber : T.blue} />
        <KV k="들쭉날쭉한 정도" v={`${D.CV.toFixed(1)}%`} sub={D.CV < 25 ? "25%보다 낮으면 안정적이에요" : "안정 기준 25%를 넘었어요"}
          color={D.CV < 25 ? T.g900 : T.amber} />
      </div>
    </Card>
  );
};

const CardWDI = () => {
  const D = useD();
  const v = useCountUp(D.WDI, 1000, 250);
  return (
    <Card>
      <CardTitle>얼마나 성실히 일했나요</CardTitle>
      <div className="flex items-end justify-between gap-3">
        <Big v={v} unit="점" color={T.green} decimals={1} />
        <Chip tone={D.WDI_RANK === "표본 부족" ? "amber" : "green"}>{D.WDI_RANK}</Chip>
      </div>
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>{D.WDI_NOTE}</p>
      <div className="mt-5 space-y-3.5">
        {D.WDI_AXES.map((a, i) => (
          <div key={a.k}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[14px] font-semibold" style={{ color: a.s == null ? T.g400 : T.g800 }}>{a.k}</span>
              {a.s == null
                ? <span className="text-[12px] font-bold" style={{ color: T.g400 }}>산출 불가</span>
                : <span className="tnum text-[14px] font-bold" style={{ color: a.s >= 90 ? T.green : a.s < 65 ? T.amber : T.g700 }}>{a.s}</span>}
            </div>
            {a.s == null
              ? <div className="rounded-full" style={{ height: 6, background: T.g100 }} />
              : <Meter pct={a.s} color={a.s >= 90 ? T.green : a.s < 65 ? T.amber : "#7DDCB0"} delay={0.1 + i * 0.06} h={6} />}
            <p className="text-[12px] mt-1.5" style={{ color: T.g500 }}>{a.d}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CardFDS = ({ onMore }) => {
  const D = useD();
  const c = TONE[D.FDS.tone];
  const Icon = D.FDS.alert ? ShieldAlert : ShieldCheck;
  return (
    <Card>
      <CardTitle onMore={onMore}>이상거래 검사</CardTitle>
      <div className="flex items-center gap-3.5">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 48, height: 48, background: c.bg }}>
          <Icon size={24} color={c.fg} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <div className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>{D.FDS.headline}</div>
          <div className="text-[13px] mt-0.5" style={{ color: T.g500 }}>거래 {won(D.FDS.scanned)}건을 {D.FDS_RULES.length}가지로 검사했어요</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5">
        {[["정상", D.FDS.ok, T.g900], ["확인 필요", D.FDS.caution, D.FDS.caution ? T.amber : T.g300], ["위험", D.FDS.alert, D.FDS.alert ? T.red : T.g300]].map(([k, n, col]) => (
          <div key={k} className="p-3.5 rounded-[14px] text-center" style={{ background: T.g50 }}>
            <div className="tnum text-[22px] font-bold" style={{ color: col }}>{n}</div>
            <div className="text-[12px] mt-0.5" style={{ color: T.g500 }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {D.FDS_HITS.map((r) => {
          const rc = TONE[stTone(r.st)];
          return (
            <div key={r.k} className="p-4 rounded-[14px]" style={{ background: rc.bg }}>
              <div className="flex items-center gap-2">
                {r.st === "위험" ? <AlertTriangle size={15} color={rc.fg} strokeWidth={2.4} /> : <AlertCircle size={15} color={rc.fg} strokeWidth={2.4} />}
                <span className="text-[14px] font-bold" style={{ color: rc.deep }}>{r.k} {r.n}건</span>
                <span className="ml-auto"><Chip tone={stTone(r.st)}>{r.st}</Chip></span>
              </div>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: rc.deep }}>{r.memo}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* — 심사 참고 지표 — 판정하지 않고 위치·양측 관점·한계만 — */
const CardReview = ({ onMore }) => {
  const D = useD();
  const c = D.REVIEW.counts;
  return (
    <Card>
      <CardTitle onMore={onMore}>심사에 참고할 지표</CardTitle>
      <p className="text-[14px] leading-relaxed" style={{ color: T.g600 }}>
        지표 {D.REVIEW.positions.length}개를 공개된 기준선과 나란히 놓았어요.
        합격·불합격을 매기지 않고 어디쯤 있는지만 보여드려요.
      </p>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[["기준 이내", c.in, "green"], ["경계", c.near, c.near ? "amber" : "grey"], ["기준 밖", c.over, c.over ? "red" : "grey"]].map(([k, n, tone]) => (
          <div key={k} className="p-3.5 rounded-[14px] text-center" style={{ background: T.g50 }}>
            <div className="tnum text-[22px] font-bold" style={{ color: TONE[tone].fg }}>{n}</div>
            <div className="text-[12px] mt-0.5" style={{ color: T.g500 }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-5"><ReviewPositions /></div>
      <div className="mt-5"><ReviewLimits /></div>
    </Card>
  );
};

/* — 타행 여신 현황 — */
const CardCredit = ({ onMore }) => {
  const D = useD();
  if (!D.CREDIT) return null;
  const K = D.CREDIT_SUM, c = TONE[D.CREDIT.tone];
  return (
    <Card>
      <CardTitle onMore={onMore}>다른 금융기관 대출 현황</CardTitle>
      <div className="flex items-center gap-3.5">
        <span className="grid place-items-center rounded-full shrink-0" style={{ width: 48, height: 48, background: c.bg }}>
          <Bank size={23} color={c.fg} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <div className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>
            {K.orgs}곳에서 {eok(K.totalBal)}원
          </div>
          <div className="text-[13px] mt-0.5" style={{ color: T.g500 }}>
            연소득의 {K.toIncome}배 · 가중평균 연 {K.wRate}%
          </div>
        </div>
      </div>

      <div className="mt-5"><CreditStats /></div>

      <div className="mt-4 space-y-2">
        {D.CREDIT.lines.map((l, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i ? `1px solid ${T.g100}` : "none" }}>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold truncate" style={{ color: T.g900 }}>{l.org} · {l.kind}</div>
              <div className="text-[12px] mt-0.5" style={{ color: T.g500 }}>
                {l.rate ? `연 ${l.rate.toFixed(2)}% · 만기 ${l.due}` : `결제예정 · ${l.due}`}
                {l.delay !== "없음" && <span style={{ color: T.red }}> · 연체 {l.delay}</span>}
              </div>
            </div>
            <span className="tnum text-[14px] font-bold shrink-0" style={{ color: T.g900 }}>{won(l.bal)}원</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="신용평점" v={`KCB ${D.CREDIT.score.kcb} · NICE ${D.CREDIT.score.nice}`} sub={`${D.CREDIT.score.grade} · ${D.CREDIT.score.trend}`} />
        <KV k="연체 이력" v={D.CREDIT.delayEver} color={/0건|없음/.test(D.CREDIT.delayEver) ? T.g900 : T.red} />
      </div>

      <div className="mt-3 flex gap-2.5 p-4 rounded-[14px]" style={{ background: c.bg }}>
        <Info size={16} color={c.fg} className="shrink-0 mt-0.5" />
        <p className="text-[13px] leading-relaxed" style={{ color: c.deep }}>{D.CREDIT.note}</p>
      </div>
    </Card>
  );
};

/* — 소비패턴 · 가처분소득 — */
const CardSpend = ({ onMore }) => {
  const D = useD();
  if (!D.SPEND) return null;
  const C = D.CASH;
  return (
    <Card>
      <CardTitle onMore={onMore}>쓰고 남는 돈</CardTitle>
      <Big v={Math.abs(C.surplus)} unit={C.deficit ? "원 부족" : "원 남아요"} color={C.deficit ? T.red : T.green} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        가처분소득 <b style={{ color: T.g900 }}>{won(C.disposable)}원</b>에서
        고정비·원리금·소비를 빼면 매달 {C.deficit ? "부족해요." : "이만큼 남아요."}
        {C.deficit && <> 모자란 만큼은 빚으로 메우게 돼요.</>}
      </p>

      <div className="mt-5"><CashWaterfall compact /></div>

      <div className="mt-6">
        <Label color={T.g700}>어디에 썼나요 · 최근 {D.SPEND.months}개월 월평균</Label>
        <div className="mt-3"><SpendBars /></div>
      </div>

      <div className="mt-4"><SpendFlags /></div>

      <div className="mt-3 flex gap-2.5 p-4 rounded-[14px]" style={{ background: TONE[D.SPEND.tone].bg }}>
        <Receipt size={16} color={TONE[D.SPEND.tone].fg} className="shrink-0 mt-0.5" />
        <p className="text-[13px] leading-relaxed" style={{ color: TONE[D.SPEND.tone].deep }}>{D.SPEND.note}</p>
      </div>
    </Card>
  );
};

const CardDSR = ({ onMore }) => {
  const D = useD();
  const L = D.LIMIT;
  return (
    <Card>
      <CardTitle onMore={onMore}>매달 갚을 수 있는 돈</CardTitle>
      <Big v={L.capacity} unit="원" color={L.capacity ? T.g900 : T.g400} />
      <p className="text-[14px] mt-3 leading-relaxed" style={{ color: T.g600 }}>
        월 소득 {won(D.HIST_AVG)}원에서 고정지출 {won(D.FIXED_SUM)}원을 빼고,<br />여유의 40%만 잡았어요.
      </p>
      <div className="mt-5 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="지금 DSR" v={`${L.dsr.toFixed(1)}%`} sub={`연 원리금 ${won(D.DSR_BASE)}원`} color={L.over ? T.red : T.g900} />
        {L.blocked ? (
          <>
            <Divider />
            <div className="flex gap-2.5 py-1">
              <Ban size={16} color={T.red} className="shrink-0 mt-0.5" />
              <p className="text-[13px] leading-relaxed" style={{ color: T.red }}>{L.blockMsg}</p>
            </div>
          </>
        ) : (
          <>
            <KV k={`${eok(L.principal)}원 빌리면`} v={`${L.dsrAfter.toFixed(1)}%`}
              sub={L.dsrAfter < 40 ? "규제 상한 40%까지 여유 있어요" : "규제 상한 40%를 넘어요"}
              strong color={L.dsrAfter < 40 ? T.blue : T.red} />
            <Divider />
            <KV k="참고 한도" v={`${eok(L.principal)}원`} sub={`${L.months}개월 · 연 ${L.rate} 기준 월 ${won(L.monthly)}원`} />
          </>
        )}
      </div>
      <p className="text-[12px] mt-3 leading-relaxed" style={{ color: T.g500 }}>
        실제 한도와 금리는 은행이 정해요. 참고용 계산이에요.
      </p>
    </Card>
  );
};

const CardSource = ({ onMore }) => {
  const D = useD();
  const GROUPS = groupsOf(D);
  const diff = D.HIST_SUM - D.INCOME_2025;
  return (
    <Card>
      <CardTitle onMore={onMore}>이 자료로 만들었어요</CardTitle>
      <div className="space-y-1">
        {GROUPS.map((g) => (
          <Row key={g.id} icon={g.icon} iconBg={g.bg} iconColor={g.fg} title={g.k} sub={g.via}
            right={<span className="text-[14px] font-bold" style={{ color: T.g500 }}>{g.items.length}곳</span>} />
        ))}
      </div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="이름" v={D.ME.name} />
        <KV k="주민등록번호" v={D.ME.rrn} />
        <KV k="직업" v={D.ME.job} sub={`사업자 개업 ${D.ME.openDate} · ${D.ME.months}개월`} />
        <KV k="주소" v={D.ME.addr} />
      </div>

      {D.EXCLUDED && (
        <div className="mt-3 flex gap-2.5 p-4 rounded-[14px]" style={{ background: T.redBg }}>
          <AlertTriangle size={16} color={T.red} className="shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed" style={{ color: "#B3202C" }}>
            소득에서 뺀 입금이 <b>{D.EXCLUDED.cnt}건 · {won(D.EXCLUDED.amt)}원</b> 있어요. {D.EXCLUDED.note}
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2.5 p-4 rounded-[14px]" style={{ background: T.blueBg }}>
        <Info size={16} color={T.blue} className="shrink-0 mt-0.5" />
        <p className="text-[13px] leading-relaxed" style={{ color: T.blueD }}>
          여기 나온 소득은 플랫폼 정산 기준이라 필요경비를 빼기 전 금액이에요.
          2025년 신고액 {won(D.INCOME_2025)}원보다 {won(Math.abs(diff))}원 {diff >= 0 ? "많은데, 신고 뒤에 들어온 정산분이에요." : "적어요. 최근 소득이 줄어든 영향이에요."}
        </p>
      </div>
    </Card>
  );
};

const CardVerify = () => {
  const D = useD();
  return (
    <Card>
      <CardTitle>이 리포트는 위조할 수 없어요</CardTitle>
      <div className="flex gap-4 items-center">
        <div className="p-2 rounded-[12px] shrink-0" style={{ background: T.white, border: `1px solid ${T.g200}` }}>
          <QRBlock value={D.DOC.hash} size={84} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] leading-relaxed" style={{ color: T.g600 }}>
            QR을 찍으면 진짜인지 바로 확인할 수 있어요. 파일을 올리면 위조 여부까지 판정해요.
          </p>
          <p className="tnum text-[12px] font-semibold mt-2 break-all" style={{ color: T.blue }}>{D.DOC.verify}</p>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="문서번호" v={D.DOC.no} />
        <KV k="발급" v={D.DOC.issued} />
        <KV k="유효기간" v={`${D.DOC.expire}까지`} />
        <KV k="타임스탬프" v={D.DOC.tsa} sub={`${D.DOC.tsaSerial} · ${D.DOC.tsaTime}`} />
      </div>
      <div className="mt-3">
        <Label>무결성 해시 (SHA-256)</Label>
        <p className="tnum text-[11px] leading-relaxed break-all mt-1.5 p-3 rounded-[12px]" style={{ background: T.g50, color: T.g600 }}>{D.DOC.hash}</p>
      </div>
      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.g100}` }}>
        <Barcode value={D.DOC.barcode} />
      </div>
    </Card>
  );
};

/* ── 상세 시트 ─────────────────────────────────────────────────── */
const DetailSheet = ({ id, onClose }) => {
  const D = useD();

  if (id === "cwp") return (
    <Sheet title="이렇게 계산했어요" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-5" style={{ color: T.g600 }}>
        비슷한 일 하는 12,400명의 기록과 비교해서, 항목마다 점수를 더했어요.
      </p>
      {D.CWP_FACTORS.map((f, i) => (
        <div key={f.k} className="py-3.5" style={{ borderTop: `1px solid ${T.g100}` }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold" style={{ color: T.g900 }}>{f.k}</span>
            <span className="tnum text-[15px] font-bold shrink-0" style={{ color: T.g900 }}>{f.v}</span>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex-1"><Meter pct={(f.pt / f.max) * 100} color={f.pt / f.max < 0.5 ? T.amber : T.blue} delay={i * 0.05} h={6} /></div>
            <span className="tnum text-[12px] font-bold shrink-0" style={{ color: T.g600 }}>+{f.pt} / {f.max}</span>
          </div>
          {f.note && <p className="text-[13px] mt-2" style={{ color: T.g500 }}>{f.note}</p>}
        </div>
      ))}
      <div className="flex items-center justify-between pt-4 mt-1" style={{ borderTop: `2px solid ${T.g200}` }}>
        <span className="text-[15px] font-bold" style={{ color: T.g900 }}>합계</span>
        <span className="tnum text-[19px] font-bold" style={{ color: T.blue }}>{D.CWP.m12.toFixed(1)}%</span>
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
      {D.BAND.map((b) => (
        <div key={b.ym} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2.5 tnum text-[14px]" style={{ borderBottom: `1px solid ${T.g100}` }}>
          <span style={{ color: T.g600 }}>{b.ym.replace("-", ".")}</span>
          <span className="text-right w-14" style={{ color: T.g500 }}>{Math.round(b.p10 / 10000)}만</span>
          <span className="text-right w-14 font-bold" style={{ color: T.blue }}>{Math.round(b.p50 / 10000)}만</span>
          <span className="text-right w-14" style={{ color: T.g500 }}>{Math.round(b.p90 / 10000)}만</span>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-3 tnum text-[14px] font-bold">
        <span style={{ color: T.g900 }}>합계</span>
        <span className="text-right w-14" style={{ color: T.g600 }}>{Math.round(D.P10_SUM / 10000).toLocaleString()}만</span>
        <span className="text-right w-14" style={{ color: T.blue }}>{Math.round(D.FCST_SUM / 10000).toLocaleString()}만</span>
        <span className="text-right w-14" style={{ color: T.g600 }}>{Math.round(D.P90_SUM / 10000).toLocaleString()}만</span>
      </div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <Label>어디서 벌었나요</Label>
        <div className="mt-3 space-y-3">
          {D.PLATFORMS.map((p, i) => {
            const sh = (p.amt / D.PLATFORM_SUM) * 100;
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
          {D.PLATFORMS.length}곳에 나뉘어 있고 제일 큰 곳이 {D.TOP_SHARE}%예요.
          {D.TOP_SHARE > 50 && " 한 곳에 몰려 있어 끊기면 영향이 커요."} (HHI {D.HHI.toFixed(3)})
        </p>
      </div>
    </Sheet>
  );

  if (id === "fds") return (
    <Sheet title={`${D.FDS_RULES.length}가지 검사 결과`} onClose={onClose}>
      {D.FDS_RULES.map((r) => (
        <div key={r.k} className="py-3.5" style={{ borderTop: `1px solid ${T.g100}` }}>
          <div className="flex items-center gap-3">
            <span className="text-[15px] flex-1 min-w-0" style={{ color: T.g800 }}>{r.k}</span>
            <Chip tone={stTone(r.st)}>{r.st}{r.n ? ` ${r.n}` : ""}</Chip>
          </div>
          {r.memo && <p className="text-[13px] mt-2 leading-relaxed" style={{ color: T.g500 }}>{r.memo}</p>}
        </div>
      ))}
      <p className="text-[13px] leading-relaxed mt-5 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        은행이 쓰는 검사 기준을 프리랜서 거래에 맞게 조정했어요. '확인'은 문제가 있다는 뜻이 아니라,
        은행이 물어볼 만한 걸 미리 설명해둔 거예요. '위험'은 소명 자료가 필요해요.
      </p>
    </Sheet>
  );

  if (id === "dsr") return (
    <Sheet title="DSR 계산 근거" onClose={onClose}>
      {D.DSR_ITEMS.map((d) => <div key={d.k} style={{ borderTop: `1px solid ${T.g100}` }}><KV k={d.k} v={`${won(d.v)}원`} sub={d.b} /></div>)}
      <div style={{ borderTop: `1px solid ${T.g200}` }}><KV k="연간 합계" v={`${won(D.DSR_BASE)}원`} strong /></div>
      <div className="mt-4 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="연 소득" v={`${won(D.HIST_SUM)}원`} />
        <KV k="지금 DSR" v={`${D.LIMIT.dsr.toFixed(1)}%`} color={D.LIMIT.over ? T.red : T.g900}
          sub={D.LIMIT.over ? "규제 상한 40%를 이미 넘었어요" : "규제 상한 40% 이내예요"} />
        {!D.LIMIT.blocked && (
          <KV k={`${eok(D.LIMIT.principal)}원 빌리면`} v={`${D.LIMIT.dsrAfter.toFixed(1)}%`}
            sub={`연 ${won(D.LIMIT.monthly * 12)}원 추가`} strong color={D.LIMIT.dsrAfter < 40 ? T.blue : T.red} />
        )}
      </div>
      <div className="mt-4">
        <Label>가진 것 · 갚을 것</Label>
        <div className="mt-2">
          <KV k="자산" v={`${won(D.ASSET_SUM)}원`} sub={D.ASSETS.map((a) => `${a.k} ${eok(a.v)}`).join(" · ")} />
          <KV k="부채" v={`${won(D.DEBT_SUM)}원`} sub={D.DEBTS.map((d) => `${d.k} ${eok(d.v)}`).join(" · ")} />
          <KV k="순자산" v={`${won(D.ASSET_SUM - D.DEBT_SUM)}원`} strong
            color={D.ASSET_SUM - D.DEBT_SUM < 0 ? T.red : T.g900} />
          <KV k="월 고정지출" v={`${won(D.FIXED_SUM)}원`} sub={D.FIXED.map((f) => f.k).join(" · ")} />
        </div>
      </div>
    </Sheet>
  );

  if (id === "review") return (
    <Sheet title="같은 수치, 두 관점" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-4" style={{ color: T.g600 }}>
        하나의 사실도 서 있는 자리에 따라 다르게 읽혀요. 어느 쪽 문장도 상대를 깎지 않도록 적었어요.
      </p>
      <Perspectives />
      <div className="mt-5"><ReviewLimits /></div>
    </Sheet>
  );

  if (id === "credit") return (
    <Sheet title="타행 여신 상세" onClose={onClose}>
      <p className="text-[13px] mb-4" style={{ color: T.g500 }}>{D.CREDIT.inquiry}</p>
      <CreditTable />
      <div className="mt-6">
        <Label color={T.g700}>보유 카드</Label>
        <div className="mt-2">
          {D.CREDIT.cards.map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: `1px solid ${T.g100}` }}>
              <CreditCard size={16} color={T.g500} className="shrink-0" />
              <span className="text-[14px] flex-1 min-w-0" style={{ color: T.g800 }}>
                {c.org} <span style={{ color: T.g500 }}>· {c.kind}</span>
                {c.revolving && <span style={{ color: T.red }}> · 리볼빙</span>}
              </span>
              <span className="tnum text-[13px] shrink-0" style={{ color: T.g600 }}>
                {c.limit ? `${won(c.used)} / ${won(c.limit)}` : "한도 없음"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 p-4 rounded-[14px]" style={{ background: T.g50 }}>
        <KV k="총 여신잔액" v={`${won(D.CREDIT_SUM.totalBal)}원`} strong />
        <KV k="연소득 대비" v={`${D.CREDIT_SUM.toIncome}배`} sub={`연소득 ${won(D.HIST_SUM)}원 기준`} />
        <KV k="가중평균 금리" v={`${D.CREDIT_SUM.wRate}%`} sub="이자부 여신 잔액 가중" />
        <KV k="카드 한도소진율" v={`${D.CREDIT_SUM.cardUse}%`} sub={`${won(D.CREDIT_SUM.cardUsed)} / ${won(D.CREDIT_SUM.cardLimit)}원`} />
        <KV k="리볼빙 이용" v={`${D.CREDIT_SUM.revolving}장`} color={D.CREDIT_SUM.revolving ? T.red : T.g900} />
      </div>
      <p className="text-[13px] leading-relaxed mt-4 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        신용정보원과 KCB에서 받은 여신 내역이에요. 대출 잔액·금리·만기는 조회 시점 기준이라
        상환이 반영되기까지 며칠 차이가 날 수 있어요.
      </p>
    </Sheet>
  );

  if (id === "spend") return (
    <Sheet title="가처분소득 계산" onClose={onClose}>
      <p className="text-[14px] leading-relaxed mb-4" style={{ color: T.g600 }}>
        정산소득에서 필요경비·세금·4대보험을 빼면 가처분소득이에요.
        거기서 고정비와 대출 원리금, 실제 소비를 빼면 매달 남는 돈이 나와요.
      </p>
      <CashWaterfall />
      <div className="mt-6">
        <Label color={T.g700}>결제수단별</Label>
        <div className="mt-2">
          {D.SPEND.channels.map((c) => (
            <KV key={c.k} k={c.k} v={`${won(c.v)}원`}
              sub={`전체의 ${((c.v / D.SPEND.monthlyAvg) * 100).toFixed(1)}%`} />
          ))}
        </div>
      </div>
      <div className="mt-5">
        <Label color={T.g700}>카테고리별 · 최근 {D.SPEND.months}개월 월평균</Label>
        <div className="mt-3"><SpendBars /></div>
      </div>
      <p className="text-[13px] leading-relaxed mt-5 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        소비지출은 변동비만 담았어요. 주거·보험·통신처럼 고정비에 이미 들어간 항목은
        두 번 세지 않으려고 뺐어요. 대출이자도 원리금에 포함돼 있어 고정비에서 제외했어요.
      </p>
    </Sheet>
  );

  if (id === "src") return (
    <Sheet title="가져온 자료 전부" onClose={onClose}>
      {groupsOf(D).map((g) => (
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
          {D.PUB_DOCS.map((d) => (
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

/* ── 인쇄 표제부 ───────────────────────────────────────────────── */
const PrintHead = () => {
  const D = useD();
  return (
    <div className="printdoc" style={{ display: "none", marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${T.g900}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", color: T.g500, fontWeight: 700 }}>FINANCIAL INCLUSION REPORT</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>금융기관 심사보조자료</div>
          <div style={{ fontSize: 12, color: T.g600, marginTop: 4 }}>{D.ME.name} · {D.ME.rrn} · {D.ME.job}</div>
          <div style={{ fontSize: 11, color: T.red, marginTop: 6, fontWeight: 700 }}>
            프로토타입 화면입니다. 실제 발급 문서가 아니며 모든 수치는 예시 데이터입니다.
          </div>
        </div>
        <div className="tnum" style={{ fontSize: 10.5, color: T.g700, textAlign: "right", lineHeight: 1.7 }}>
          문서번호 {D.DOC.no}<br />발급 {D.DOC.issued}<br />유효 {D.DOC.expire}까지<br />{D.DOC.tsa}
        </div>
        <div style={{ width: 150 }}><Barcode value={D.DOC.barcode} h={38} /></div>
      </div>
    </div>
  );
};

/* ── 리포트 화면 ───────────────────────────────────────────────── */
export const ScreenReport = ({ onSubmit, submitted, onRestart }) => {
  const D = useD();
  const web = useWeb();
  const [sheet, setSheet] = useState(null);
  const [sealing, setSealing] = useState(false);
  const pdf = async () => { setSealing(true); await sleep(1400); setSealing(false); window.print(); };

  /* 웹은 카드 스택이 아니라 문서형 리포트로 갈라집니다 */
  if (web) return (
    <WebReport onSubmit={onSubmit} submitted={submitted} onRestart={onRestart} onPdf={pdf} sealing={sealing} />
  );

  const cards = (
    <>
      <CardVerdict />
      <CardGaps />
      <CardCWP onMore={() => setSheet("cwp")} />
      <CardFlow onMore={() => setSheet("flow")} />
      <CardWDI />
      <CardReview onMore={() => setSheet("review")} />
      <CardCredit onMore={() => setSheet("credit")} />
      <CardSpend onMore={() => setSheet("spend")} />
      <CardFDS onMore={() => setSheet("fds")} />
      <CardDSR onMore={() => setSheet("dsr")} />
      <CardSource onMore={() => setSheet("src")} />
      <CardVerify />
    </>
  );

  return (
    <>
      <AppBar right={
        <button onClick={pdf} className="press w-10 h-10 grid place-items-center rounded-full noprint" aria-label="PDF로 저장">
          <Download size={20} color={T.g700} strokeWidth={2.2} />
        </button>} />

      <Wrap w={1160}>
        <div className={web ? "pt-8 pb-6" : "px-6 pb-6"}>
          <PrintHead />
          <div className="fu">
            <div className="inline-flex items-center gap-1.5 mb-3 flex-wrap">
              <Chip tone={D.verdict.tone}>{D.verdict.grade}</Chip>
              <span className="tnum text-[12px] font-semibold" style={{ color: T.g500 }}>{D.DOC.no}</span>
            </div>
            <H1>{D.ME.name}님의<br />소득 리포트예요</H1>
            <Sub>
              {D.blockSubmit
                ? "지금은 그대로 제출할 수 없어요. 아래 이상거래 항목을 먼저 확인해주세요."
                : `${D.DOC.expire}까지 제출할 수 있어요. 승인 여부와 조건은 금융기관이 판단해요.`}
            </Sub>
          </div>
        </div>
      </Wrap>

      <div style={{ background: web ? T.bg : T.bg }} className={web ? "pb-32" : "pb-40"}>
        <Wrap w={1160}>
          {web ? (
            <div className="reportgrid" style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 16, alignItems: "start", paddingTop: 8,
            }}>{cards}</div>
          ) : (
            <div className="space-y-3 pt-3">{cards}</div>
          )}

          <div className={web ? "mt-4" : ""}>
            <Card>
              <p className="text-[12px] leading-[1.8]" style={{ color: T.g500 }}>
                이 리포트는 은행이 심사할 때 참고하는 자료예요. 대출 승인이나 한도, 금리를 보장하지 않아요.
                계속근무가능성과 성실도는 통계로 추정한 값이라 실제와 다를 수 있어요.
                자료를 만드는 데 쓴 원본 마이데이터는 발급하자마자 지웠고, 리포트 내용은 저장하지 않아요.
                유효기간이 지나면 진본 확인이 안 되니 다시 발급받아야 해요.
              </p>
              <button onClick={onRestart} className="press noprint inline-flex items-center gap-1.5 text-[13px] font-semibold mt-5" style={{ color: T.g500 }}>
                <RefreshCw size={13} /> 처음부터 다시 보기
              </button>
              <p className="text-[11px] mt-3 font-semibold" style={{ color: T.red }}>
                프로토타입 화면이에요. 실제 발급 문서가 아니고, 화면의 수치는 전부 예시 데이터예요.
              </p>
            </Card>
          </div>
        </Wrap>
      </div>

      <Bottom>
        <div className="flex gap-2.5">
          <button onClick={pdf} className="press shrink-0 grid place-items-center rounded-[14px]"
            style={{ width: 56, height: 56, background: T.g100 }} aria-label="PDF로 저장">
            <Download size={21} color={T.g700} strokeWidth={2.2} />
          </button>
          <Btn onClick={onSubmit} tone={D.blockSubmit ? "red" : "blue"}
            icon={D.blockSubmit ? AlertTriangle : submitted ? Check : Wallet}>
            {D.blockSubmit ? "제출 전 확인이 필요해요" : submitted ? "제출 내역 보기" : "은행에 제출하기"}
          </Btn>
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

export const SubmitFlow = ({ onClose, onDone, already }) => {
  const D = useD();
  const [step, setStep] = useState(already ? "done" : D.blockSubmit ? "blocked" : "pick");
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

  /* 이상거래 케이스 — 제출 자체가 막힙니다 */
  if (step === "blocked") return (
    <Sheet title="지금은 제출할 수 없어요" onClose={onClose}>
      <div className="flex gap-3 p-4 rounded-[14px]" style={{ background: T.redBg }}>
        <ShieldAlert size={20} color={T.red} className="shrink-0 mt-0.5" />
        <p className="text-[14px] leading-relaxed" style={{ color: "#B3202C" }}>
          이상거래 검사에서 <b>위험 {D.FDS.alert}건</b>이 나왔어요.
          이 상태로 보내면 은행에서 반려될 가능성이 높아요.
        </p>
      </div>
      <div className="mt-5">
        <Label color={T.g700}>소명이 필요한 항목</Label>
        <div className="mt-2">
          {D.FDS_RULES.filter((r) => r.st === "위험").map((r) => (
            <div key={r.k} className="py-3" style={{ borderTop: `1px solid ${T.g100}` }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} color={T.red} strokeWidth={2.4} />
                <span className="text-[15px] font-semibold" style={{ color: T.g900 }}>{r.k}</span>
                <span className="ml-auto"><Chip tone="red">{r.n}건</Chip></span>
              </div>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: T.g500 }}>{r.memo}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[13px] leading-relaxed mt-5 p-4 rounded-[14px]" style={{ background: T.g50, color: T.g600 }}>
        거래 내역과 계약서 같은 증빙을 올리면 검사를 다시 돌려요. 소명이 끝나면 바로 제출할 수 있어요.
      </p>
      <div className="mt-5 space-y-2.5">
        <Btn icon={FileText} onClick={() => {}}>소명 자료 올리기</Btn>
        <Btn tone="grey" onClick={onClose}>나중에 하기</Btn>
      </div>
    </Sheet>
  );

  if (step === "send") return (
    <FullScreen>
      <div className="flex-1 grid place-items-center px-8 py-14">
        <div className="text-center w-full mx-auto" style={{ maxWidth: 300 }}>
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
          <KV k="접수번호" v={`RCP-${D.DOC.no.slice(4, 14)}-77412`} />
          <KV k="제출 시각" v={D.DOC.issued} />
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
