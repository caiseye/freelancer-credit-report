import React, { useState, useEffect } from "react";
import {
  Download, Wallet, Check, AlertTriangle, RefreshCw, Loader2, Ban, Info,
} from "lucide-react";
import { T, TONE, won, eok } from "./core.js";
import { useD, Chip, Meter, Btn, QRBlock, Barcode, IncomeBars } from "./ui.jsx";
import { CashWaterfall, CreditTable, CreditStats, SpendBars, SpendFlags,
         ReviewPositions, Perspectives, ReviewLimits } from "./blocks.jsx";

/* ════════════════════════════════════════════════════════════════
   웹 전용 문서형 리포트

   모바일이 '카드 스택'이라면 웹은 '심사역이 읽는 문서'예요.
   목차 · 번호 매긴 절 · 표 중심으로 짜고, 모바일에서 시트로 감췄던
   근거 데이터를 전부 펼쳐 놓습니다.
   ════════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: "sum", n: "1", k: "요약" },
  { id: "review", n: "2", k: "참고 지표와 한계" },
  { id: "income", n: "3", k: "소득 분석" },
  { id: "cwp", n: "4", k: "계속근무가능성" },
  { id: "wdi", n: "5", k: "근로 성실도" },
  { id: "credit", n: "6", k: "타행 여신 현황" },
  { id: "cash", n: "7", k: "소비패턴 · 가처분소득" },
  { id: "fds", n: "8", k: "이상거래 검사" },
  { id: "dsr", n: "9", k: "상환여력 (DSR)" },
  { id: "src", n: "10", k: "자료 출처" },
  { id: "verify", n: "11", k: "진본 확인" },
];

const Section = ({ id, n, k, sub, children }) => (
  <section id={id} style={{ scrollMarginTop: 80, marginBottom: 44, breakInside: "avoid" }}>
    <div style={{ borderBottom: `2px solid ${T.g900}`, paddingBottom: 8, marginBottom: 18 }}>
      <div className="flex items-baseline gap-2.5">
        <span className="tnum text-[13px] font-bold" style={{ color: T.g400 }}>{n}</span>
        <h2 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: T.g900 }}>{k}</h2>
      </div>
      {sub && <p className="text-[13px] mt-1.5" style={{ color: T.g500 }}>{sub}</p>}
    </div>
    {children}
  </section>
);

const Panel = ({ children, tone, className = "" }) => (
  <div className={className} style={{
    background: tone ? TONE[tone].bg : T.g50,
    borderRadius: 14, padding: 18, breakInside: "avoid",
  }}>{children}</div>
);

/* 라벨 · 값 행 */
const Line = ({ k, v, sub, color, strong, border = true }) => (
  <div className="flex items-start justify-between gap-6 py-2.5"
    style={{ borderBottom: border ? `1px solid ${T.g100}` : "none" }}>
    <span className="text-[13.5px] shrink-0" style={{ color: T.g600 }}>{k}</span>
    <span className="text-right min-w-0">
      <span className={`block tnum text-[14px] ${strong ? "font-bold" : "font-semibold"}`} style={{ color: color || T.g900 }}>{v}</span>
      {sub && <span className="block text-[12px] mt-0.5" style={{ color: T.g500 }}>{sub}</span>}
    </span>
  </div>
);

/* 2단 그리드 */
const Cols = ({ children, min = 300, gap = 24 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap }}>{children}</div>
);

const Th = ({ children, right }) => (
  <th className="text-[11.5px] font-bold py-2" style={{ color: T.g500, textAlign: right ? "right" : "left", paddingRight: 12, whiteSpace: "nowrap" }}>{children}</th>
);
const Td = ({ children, right, bold, color }) => (
  <td className={`text-[13px] py-2.5 ${bold ? "font-bold" : ""}`}
    style={{ color: color || T.g800, textAlign: right ? "right" : "left", paddingRight: 12, whiteSpace: "nowrap" }}>{children}</td>
);

/* ── 문서 표제부 ───────────────────────────────────────────────── */
const DocHead = () => {
  const D = useD();
  const c = TONE[D.verdict.tone];
  return (
    <div style={{ borderBottom: `3px solid ${T.g900}`, paddingBottom: 20, marginBottom: 32 }}>
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div style={{ minWidth: 280 }}>
          <div className="tnum text-[10.5px] font-bold" style={{ letterSpacing: "0.16em", color: T.g500 }}>
            FINANCIAL INCLUSION REPORT
          </div>
          <h1 className="font-bold tracking-[-0.025em] mt-1.5" style={{ fontSize: 30, color: T.g900 }}>
            금융기관 심사보조자료
          </h1>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-[8px] text-[12.5px] font-bold" style={{ background: c.bg, color: c.deep }}>
              {D.verdict.grade}
            </span>
            <span className="text-[14px] font-bold" style={{ color: T.g900 }}>{D.ME.name}</span>
            <span className="tnum text-[13px]" style={{ color: T.g600 }}>{D.ME.rrn}</span>
            <span className="text-[13px]" style={{ color: T.g600 }}>· {D.ME.job}</span>
          </div>
          <p className="text-[12px] font-bold mt-3" style={{ color: T.red }}>
            프로토타입 화면입니다. 실제 발급 문서가 아니며 모든 수치는 예시 데이터입니다.
          </p>
        </div>

        <div className="flex items-start gap-6">
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["문서번호", D.DOC.no], ["발급일시", D.DOC.issued],
                ["유효기간", `${D.DOC.expire}까지`], ["타임스탬프", D.DOC.tsa],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="text-[11.5px] py-1" style={{ color: T.g500, paddingRight: 14, whiteSpace: "nowrap" }}>{k}</td>
                  <td className="tnum text-[12px] font-semibold py-1" style={{ color: T.g800, whiteSpace: "nowrap" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ width: 160 }}><Barcode value={D.DOC.barcode} h={40} /></div>
        </div>
      </div>
    </div>
  );
};

/* ── 목차 ──────────────────────────────────────────────────────── */
const Toc = () => {
  const D = useD();
  const [active, setActive] = useState("sum");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav className="webtoc noprint" style={{ position: "sticky", top: 64, alignSelf: "start" }}>
      <div className="text-[11.5px] font-bold mb-3" style={{ color: T.g400, letterSpacing: "0.08em" }}>목차</div>
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          /* 주소의 해시는 라우터가 쓰고 있어요. 앵커로 이동시키면 경로가
             덮여서 선택 화면으로 튕기니, 스크롤만 직접 옮깁니다. */
          <button key={s.id} type="button"
            onClick={() => {
              const el = document.getElementById(s.id);
              if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(s.id); }
            }}
            className="w-full text-left flex items-baseline gap-2 py-1.5 rounded-[7px] px-2 -mx-2"
            style={{
              background: on ? T.blueBg : "transparent",
              color: on ? T.blueD : T.g600,
              fontWeight: on ? 700 : 500,
            }}>
            <span className="tnum text-[11px] shrink-0" style={{ color: on ? T.blueD : T.g400 }}>{s.n}</span>
            <span className="text-[13px]">{s.k}</span>
          </button>
        );
      })}

      <div className="mt-6 p-3.5 rounded-[12px]" style={{ background: T.g50 }}>
        <div className="text-[11.5px]" style={{ color: T.g500 }}>월 평균 소득</div>
        <div className="tnum text-[16px] font-bold mt-0.5" style={{ color: T.g900 }}>{won(D.HIST_AVG)}원</div>
        <div className="text-[11.5px] mt-2.5" style={{ color: T.g500 }}>월 여유자금</div>
        <div className="tnum text-[16px] font-bold mt-0.5" style={{ color: D.CASH.deficit ? T.red : T.green }}>
          {D.CASH.deficit ? "−" : ""}{won(Math.abs(D.CASH.surplus))}원
        </div>
      </div>
    </nav>
  );
};

/* ════════════════════════════════════════════════════════════════ */
export const WebReport = ({ onSubmit, submitted, onRestart, onPdf, sealing }) => {
  const D = useD();
  const v = D.verdict, c = TONE[v.tone];
  const L = D.LIMIT, K = D.CREDIT_SUM, C = D.CASH;
  const stTone = (st) => (st === "위험" ? "red" : st === "확인" ? "amber" : "green");

  return (
    <div style={{ background: T.white, minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: 1240, padding: "32px 32px 120px" }}>
        <div className="webgrid" style={{ display: "grid", gridTemplateColumns: "196px minmax(0,1fr)", gap: 44, alignItems: "start" }}>
          <Toc />

          <main style={{ minWidth: 0 }}>
            <DocHead />

            {/* 1 · 심사 요약 */}
            <Section id="sum" n="1" k="요약">
              <Panel tone={v.tone}>
                <div className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: c.deep }}>{v.title}</div>
                <p className="text-[14px] mt-2 leading-relaxed" style={{ color: c.deep }}>{v.msg}</p>
              </Panel>

              <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                {[
                  ["종합 판정", v.grade, v.tone],
                  ["월 평균 소득", `${won(D.HIST_AVG)}원`, "grey"],
                  ["계속근무가능성", `${D.CWP.m12.toFixed(1)}%`, D.CWP.m12 >= D.CWP.peer ? "green" : "amber"],
                  ["근로 성실도", `${D.WDI.toFixed(1)}점`, D.WDI >= 85 ? "green" : "amber"],
                  ["타행 여신", `${eok(K.totalBal)}원`, K.toIncome >= 3 ? "red" : K.toIncome >= 1.5 ? "amber" : "green"],
                  ["DSR", `${L.dsr.toFixed(1)}%`, L.over ? "red" : "green"],
                  ["월 여유자금", `${C.deficit ? "−" : ""}${won(Math.abs(C.surplus))}원`, C.deficit ? "red" : "green"],
                  ["이상거래", D.FDS.alert ? `위험 ${D.FDS.alert}건` : D.FDS.caution ? `확인 ${D.FDS.caution}건` : "없음", D.FDS.alert ? "red" : D.FDS.caution ? "amber" : "green"],
                ].map(([k, val, tone]) => (
                  <div key={k} style={{ border: `1px solid ${T.g200}`, borderRadius: 12, padding: 14 }}>
                    <div className="text-[11.5px]" style={{ color: T.g500 }}>{k}</div>
                    <div className="tnum text-[17px] font-bold mt-1" style={{ color: TONE[tone].fg }}>{val}</div>
                  </div>
                ))}
              </div>

              {D.dataGaps && (
                <Panel tone="amber" className="mt-4">
                  <div className="text-[14px] font-bold mb-2" style={{ color: TONE.amber.deep }}>판단 시 유의사항</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {D.dataGaps.map((g) => (
                      <li key={g} className="text-[13.5px] leading-relaxed" style={{ color: TONE.amber.deep, marginBottom: 4 }}>{g}</li>
                    ))}
                  </ul>
                </Panel>
              )}
            </Section>

            {/* 2 · 참고 지표와 한계 */}
            <Section id="review" n="2" k="참고 지표와 한계"
              sub="공개된 기준선 대비 위치와, 이 자료로 확인되지 않는 것">
              <ReviewPositions />
              <div className="mt-6">
                <div className="text-[13.5px] font-bold mb-3" style={{ color: T.g700 }}>같은 수치, 두 관점</div>
                <Perspectives />
              </div>
              <div className="mt-5"><ReviewLimits /></div>
            </Section>

            {/* 3 · 소득 분석 */}
            <Section id="income" n="3" k="소득 분석"
              sub={`플랫폼 정산 ${D.ME.months}개월 · 최근 ${D.HIST.length}개월 실적과 향후 12개월 예측`}>
              <Cols>
                <div>
                  <IncomeBars />
                  <div className="flex items-center gap-4 mt-1 text-[12px]" style={{ color: T.g500 }}>
                    <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: T.blue }} />실적 {D.HIST.length}개월</span>
                    <span className="inline-flex items-center gap-1.5"><span className="rounded-full" style={{ width: 8, height: 8, background: "#B7D5FB" }} />예측 12개월</span>
                  </div>
                </div>
                <div>
                  <Line k={`지난 ${D.HIST.length}개월 소득`} v={`${won(D.HIST_SUM)}원`} sub={`월 평균 ${won(D.HIST_AVG)}원`} />
                  <Line k="향후 12개월 예측 (중앙값)" v={`${won(D.FCST_SUM)}원`} sub={`월 평균 ${won(D.FCST_AVG)}원`} strong color={T.blue} />
                  <Line k="보수적 시나리오 (하위 10%)" v={`${won(D.P10_SUM)}원`} />
                  <Line k="낙관적 시나리오 (상위 10%)" v={`${won(D.P90_SUM)}원`} />
                  <Line k="소득 변동계수" v={`${D.CV.toFixed(1)}%`}
                    sub={D.CV < 25 ? "안정 기준 25% 이내" : "안정 기준 25% 초과"}
                    color={D.CV < 25 ? T.g900 : T.amber} />
                  <Line k="2025년 신고 소득" v={`${won(D.INCOME_2025)}원`} sub="국세청 소득금액증명" border={false} />
                </div>
              </Cols>

              {D.EXCLUDED && (
                <Panel tone="red" className="mt-5">
                  <div className="flex gap-2.5">
                    <AlertTriangle size={16} color={T.red} className="shrink-0 mt-0.5" />
                    <p className="text-[13.5px] leading-relaxed" style={{ color: TONE.red.deep }}>
                      소득 산정에서 제외한 입금이 <b>{D.EXCLUDED.cnt}건 · {won(D.EXCLUDED.amt)}원</b> 있습니다. {D.EXCLUDED.note}
                    </p>
                  </div>
                </Panel>
              )}

              <div className="mt-6">
                <div className="text-[13.5px] font-bold mb-3" style={{ color: T.g700 }}>수입원 구성 · HHI {D.HHI.toFixed(3)}</div>
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                    <Th>플랫폼</Th><Th>유형</Th><Th right>건수</Th><Th right>정산액</Th><Th right>비중</Th>
                  </tr></thead>
                  <tbody>
                    {D.PLATFORMS.map((p) => {
                      const sh = (p.amt / D.PLATFORM_SUM) * 100;
                      return (
                        <tr key={p.name} style={{ borderBottom: `1px solid ${T.g100}` }}>
                          <Td bold color={T.g900}>{p.name}</Td><Td color={T.g600}>{p.cat}</Td>
                          <Td right>{p.cnt}건</Td><Td right bold>{won(p.amt)}원</Td>
                          <Td right color={sh > 50 ? T.amber : T.g700}>{sh.toFixed(1)}%</Td>
                        </tr>
                      );
                    })}
                    <tr style={{ borderTop: `2px solid ${T.g200}` }}>
                      <Td bold color={T.g900}>합계</Td><Td /><Td right bold>{D.SETTLE_CNT}건</Td>
                      <Td right bold>{won(D.PLATFORM_SUM)}원</Td><Td right bold>100%</Td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[12.5px] mt-2.5" style={{ color: T.g500 }}>
                  최대 채널 비중 {D.TOP_SHARE}%. {D.TOP_SHARE > 50 ? "한 채널 의존도가 높아 중단 시 소득 충격이 큽니다." : "채널이 고르게 분산돼 있습니다."}
                </p>
              </div>

              <div className="mt-6">
                <div className="text-[13.5px] font-bold mb-3" style={{ color: T.g700 }}>월별 예측 구간</div>
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                    <Th>월</Th><Th right>보수적 (P10)</Th><Th right>중앙값 (P50)</Th><Th right>낙관적 (P90)</Th>
                  </tr></thead>
                  <tbody>
                    {D.BAND.map((b) => (
                      <tr key={b.ym} style={{ borderBottom: `1px solid ${T.g100}` }}>
                        <Td color={T.g600}>{b.ym.replace("-", ".")}</Td>
                        <Td right color={T.g500}>{won(b.p10)}</Td>
                        <Td right bold color={T.blue}>{won(b.p50)}</Td>
                        <Td right color={T.g500}>{won(b.p90)}</Td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: `2px solid ${T.g200}` }}>
                      <Td bold color={T.g900}>합계</Td>
                      <Td right bold>{won(D.P10_SUM)}</Td>
                      <Td right bold color={T.blue}>{won(D.FCST_SUM)}</Td>
                      <Td right bold>{won(D.P90_SUM)}</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 3 · 계속근무가능성 */}
            <Section id="cwp" n="4" k="계속근무가능성" sub="동종 프리랜서 12,400명 대비 상대평가">
              <Cols min={260}>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="tnum text-[40px] font-bold leading-none tracking-[-0.035em]"
                      style={{ color: D.CWP.m12 >= D.CWP.peer ? T.blue : T.amber }}>{D.CWP.m12.toFixed(1)}</span>
                    <span className="text-[20px] font-bold" style={{ color: D.CWP.m12 >= D.CWP.peer ? T.blue : T.amber }}>%</span>
                    <span className="ml-2"><Chip tone={D.CWP.m12 >= D.CWP.peer ? "blue" : "amber"}>{D.CWP.rank}</Chip></span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[[`${D.ME.name} (12개월)`, D.CWP.m12, D.CWP.m12 >= D.CWP.peer ? T.blue : T.amber],
                      ["동종 평균", D.CWP.peer, T.g300],
                      ["24개월 시점", D.CWP.m24, "#9CC7FA"],
                      ["36개월 시점", D.CWP.m36, "#C7DDFA"]].map(([k, p, col]) => (
                      <div key={k}>
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                          <span className="font-semibold" style={{ color: T.g700 }}>{k}</span>
                          <span className="tnum font-bold" style={{ color: T.g800 }}>{p.toFixed(1)}%</span>
                        </div>
                        <Meter pct={p} color={col} h={7} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>산출 근거</div>
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                      <Th>평가 항목</Th><Th right>측정값</Th><Th right>배점</Th>
                    </tr></thead>
                    <tbody>
                      {D.CWP_FACTORS.map((f) => (
                        <tr key={f.k} style={{ borderBottom: `1px solid ${T.g100}` }}>
                          <td className="text-[13px] py-2.5" style={{ color: T.g800 }}>
                            {f.k}
                            {f.note && <div className="text-[11.5px] mt-0.5" style={{ color: T.g500 }}>{f.note}</div>}
                          </td>
                          <Td right>{f.v}</Td>
                          <Td right bold color={f.pt / f.max < 0.5 ? T.amber : T.g900}>{f.pt} / {f.max}</Td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: `2px solid ${T.g200}` }}>
                        <Td bold color={T.g900}>합계</Td><Td /><Td right bold color={T.blue}>{D.CWP.m12.toFixed(1)} / 106</Td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Cols>
            </Section>

            {/* 4 · 근로 성실도 */}
            <Section id="wdi" n="5" k="근로 성실도" sub={D.WDI_NOTE}>
              <Cols min={260}>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="tnum text-[40px] font-bold leading-none tracking-[-0.035em]" style={{ color: T.green }}>{D.WDI.toFixed(1)}</span>
                    <span className="text-[20px] font-bold" style={{ color: T.green }}>점</span>
                    <span className="ml-2"><Chip tone={D.WDI_RANK === "표본 부족" ? "amber" : "green"}>{D.WDI_RANK}</Chip></span>
                  </div>
                  <p className="text-[13px] mt-4 leading-relaxed" style={{ color: T.g600 }}>
                    가중평균으로 계산합니다. 표본이 모자라 산출하지 않은 항목은 가중치에서 제외하고 나머지를 재정규화했습니다.
                  </p>
                </div>
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                    <Th>평가 축</Th><Th right>가중치</Th><Th right>점수</Th>
                  </tr></thead>
                  <tbody>
                    {D.WDI_AXES.map((a) => (
                      <tr key={a.k} style={{ borderBottom: `1px solid ${T.g100}` }}>
                        <td className="text-[13px] py-2.5" style={{ color: a.s == null ? T.g400 : T.g800 }}>
                          {a.k}<div className="text-[11.5px] mt-0.5" style={{ color: T.g500 }}>{a.d}</div>
                        </td>
                        <Td right color={T.g500}>{Math.round(a.w * 100)}%</Td>
                        <Td right bold color={a.s == null ? T.g400 : a.s >= 90 ? T.green : a.s < 65 ? T.amber : T.g900}>
                          {a.s == null ? "산출 불가" : a.s}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Cols>
            </Section>

            {/* 5 · 타행 여신 */}
            <Section id="credit" n="6" k="타행 여신 현황" sub={D.CREDIT.inquiry}>
              <CreditStats />
              <div className="mt-5"><CreditTable /></div>

              <Cols min={280} gap={20}>
                <div className="mt-5">
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>보유 카드</div>
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                      <Th>카드사</Th><Th>종류</Th><Th right>이용 / 한도</Th><Th right>리볼빙</Th>
                    </tr></thead>
                    <tbody>
                      {D.CREDIT.cards.map((c2, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.g100}` }}>
                          <Td bold color={T.g900}>{c2.org}</Td><Td color={T.g600}>{c2.kind}</Td>
                          <Td right>{c2.limit ? `${won(c2.used)} / ${won(c2.limit)}` : "—"}</Td>
                          <Td right color={c2.revolving ? T.red : T.g500}>{c2.revolving ? "사용" : "없음"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5">
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>신용 평가</div>
                  <Line k="KCB 올크레딧" v={`${D.CREDIT.score.kcb}점`} />
                  <Line k="NICE 지키미" v={`${D.CREDIT.score.nice}점`} />
                  <Line k="신용등급" v={D.CREDIT.score.grade} sub={D.CREDIT.score.trend} />
                  <Line k="연체 이력" v={D.CREDIT.delayEver}
                    color={/0건|없음/.test(D.CREDIT.delayEver) ? T.g900 : T.red} border={false} />
                </div>
              </Cols>

              <Panel tone={D.CREDIT.tone} className="mt-5">
                <div className="flex gap-2.5">
                  <Info size={16} color={TONE[D.CREDIT.tone].fg} className="shrink-0 mt-0.5" />
                  <p className="text-[13.5px] leading-relaxed" style={{ color: TONE[D.CREDIT.tone].deep }}>{D.CREDIT.note}</p>
                </div>
              </Panel>
            </Section>

            {/* 6 · 소비패턴 · 가처분소득 */}
            <Section id="cash" n="7" k="소비패턴 · 가처분소득"
              sub={`카드·계좌 거래 ${D.SPEND.months}개월 분석 · 변동 소비지출만 집계 (고정비 중복 제외)`}>
              <Cols min={300}>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>가처분소득 산출</div>
                  <CashWaterfall />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold mb-3" style={{ color: T.g700 }}>
                    소비 카테고리 · 월평균 {won(D.SPEND.monthlyAvg)}원
                  </div>
                  <SpendBars />
                  <div className="mt-5">
                    <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>결제수단</div>
                    {D.SPEND.channels.map((ch, i) => (
                      <Line key={ch.k} k={ch.k} v={`${won(ch.v)}원`}
                        sub={`${((ch.v / D.SPEND.monthlyAvg) * 100).toFixed(1)}%`}
                        border={i < D.SPEND.channels.length - 1} />
                    ))}
                  </div>
                </div>
              </Cols>

              <div className="mt-5"><SpendFlags /></div>

              <Panel tone={D.SPEND.tone} className="mt-4">
                <p className="text-[13.5px] leading-relaxed" style={{ color: TONE[D.SPEND.tone].deep }}>{D.SPEND.note}</p>
              </Panel>
            </Section>

            {/* 7 · 이상거래 */}
            <Section id="fds" n="8" k="이상거래 검사"
              sub={`거래 ${won(D.FDS.scanned)}건 · ${D.FDS_RULES.length}개 규칙 적용 · 최근 ${D.FDS.months}개월`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {[["정상", D.FDS.ok, "green"], ["확인 필요", D.FDS.caution, D.FDS.caution ? "amber" : "grey"],
                  ["위험", D.FDS.alert, D.FDS.alert ? "red" : "grey"], ["위험도 점수", D.FDS.score, D.FDS.score >= 60 ? "red" : D.FDS.score >= 30 ? "amber" : "green"]].map(([k, n, tone]) => (
                  <div key={k} style={{ border: `1px solid ${T.g200}`, borderRadius: 12, padding: 14 }}>
                    <div className="text-[11.5px]" style={{ color: T.g500 }}>{k}</div>
                    <div className="tnum text-[22px] font-bold mt-0.5" style={{ color: TONE[tone].fg }}>{n}</div>
                  </div>
                ))}
              </div>

              <table className="w-full mt-5" style={{ borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}>
                  <Th>검사 규칙</Th><Th right>적중</Th><Th right>판정</Th>
                </tr></thead>
                <tbody>
                  {D.FDS_RULES.map((r) => (
                    <tr key={r.k} style={{ borderBottom: `1px solid ${T.g100}` }}>
                      <td className="text-[13px] py-2.5" style={{ color: T.g800 }}>
                        {r.k}
                        {r.memo && <div className="text-[12px] mt-1 leading-relaxed" style={{ color: T.g500 }}>{r.memo}</div>}
                      </td>
                      <Td right>{r.n || "—"}</Td>
                      <td className="py-2.5" style={{ textAlign: "right" }}><Chip tone={stTone(r.st)}>{r.st}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* 8 · DSR */}
            <Section id="dsr" n="9" k="상환여력 (DSR)" sub="총부채원리금상환비율 · 규제 상한 40%">
              <Cols min={280}>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>연간 원리금 상환액</div>
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${T.g200}` }}><Th>항목</Th><Th right>연간</Th></tr></thead>
                    <tbody>
                      {D.DSR_ITEMS.map((d) => (
                        <tr key={d.k} style={{ borderBottom: `1px solid ${T.g100}` }}>
                          <td className="text-[13px] py-2.5" style={{ color: T.g800 }}>
                            {d.k}<div className="text-[11.5px] mt-0.5" style={{ color: T.g500 }}>{d.b}</div>
                          </td>
                          <Td right bold>{won(d.v)}원</Td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: `2px solid ${T.g200}` }}>
                        <Td bold color={T.g900}>합계</Td><Td right bold>{won(D.DSR_BASE)}원</Td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>판정</div>
                  <Line k="연 소득" v={`${won(D.HIST_SUM)}원`} />
                  <Line k="현재 DSR" v={`${L.dsr.toFixed(1)}%`} strong color={L.over ? T.red : T.g900}
                    sub={L.over ? "규제 상한 40% 초과" : "규제 상한 40% 이내"} />
                  <Line k="월 상환 여력" v={`${won(L.capacity)}원`} sub="가처분소득 여유분의 40%" />
                  {L.blocked ? (
                    <Panel tone="red" className="mt-3">
                      <div className="flex gap-2.5">
                        <Ban size={16} color={T.red} className="shrink-0 mt-0.5" />
                        <p className="text-[13.5px] leading-relaxed" style={{ color: TONE.red.deep }}>{L.blockMsg}</p>
                      </div>
                    </Panel>
                  ) : (
                    <>
                      <Line k="참고 한도" v={`${won(L.principal)}원`} sub={`${L.months}개월 · 연 ${L.rate} · 월 ${won(L.monthly)}원`} strong color={T.blue} />
                      <Line k="실행 후 DSR" v={`${L.dsrAfter.toFixed(1)}%`} color={L.dsrAfter < 40 ? T.blue : T.red}
                        sub={L.dsrAfter < 40 ? "상한 이내" : "상한 초과"} border={false} />
                    </>
                  )}
                </div>
              </Cols>

              <div className="mt-6">
                <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>자산 · 부채</div>
                <Cols min={240} gap={20}>
                  <div>
                    {D.ASSETS.map((a) => <Line key={a.k} k={a.k} v={`${won(a.v)}원`} />)}
                    <Line k="자산 합계" v={`${won(D.ASSET_SUM)}원`} strong border={false} />
                  </div>
                  <div>
                    {D.DEBTS.map((d, i) => <Line key={i} k={d.k} v={`${won(d.v)}원`} sub={d.note} />)}
                    <Line k="부채 합계" v={`${won(D.DEBT_SUM)}원`} strong border={false} />
                  </div>
                  <div>
                    <Line k="순자산" v={`${won(D.ASSET_SUM - D.DEBT_SUM)}원`} strong
                      color={D.ASSET_SUM - D.DEBT_SUM < 0 ? T.red : T.g900} />
                    <Line k="월 고정지출" v={`${won(D.FIXED_SUM)}원`} sub={D.FIXED.map((f) => f.k).join(" · ")} border={false} />
                  </div>
                </Cols>
              </div>
            </Section>

            {/* 9 · 자료 출처 */}
            <Section id="src" n="10" k="자료 출처" sub={`${D.ORG_TOTAL}개 기관 · 마이데이터 1회 수집`}>
              <Cols min={280} gap={20}>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>금융 마이데이터 · 신용정보원</div>
                  {D.FIN_ORGS.map((o) => <Line key={o.k} k={o.k} v={o.n} />)}
                </div>
                <div>
                  <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>공공 마이데이터 · 정부24</div>
                  {D.PUB_DOCS.map((d) => <Line key={d.k} k={d.k} v={d.org} sub={d.res} />)}
                </div>
              </Cols>
              <div className="mt-5">
                <div className="text-[13.5px] font-bold mb-2" style={{ color: T.g700 }}>대상자</div>
                <Cols min={240} gap={20}>
                  <div>
                    <Line k="이름" v={D.ME.name} /><Line k="주민등록번호" v={D.ME.rrn} />
                  </div>
                  <div>
                    <Line k="직업" v={D.ME.job} /><Line k="사업자 개업" v={`${D.ME.openDate} · ${D.ME.months}개월`} />
                  </div>
                  <div>
                    <Line k="주소" v={D.ME.addr} /><Line k="연락처" v={D.ME.phone} />
                  </div>
                </Cols>
              </div>
            </Section>

            {/* 10 · 진본 확인 */}
            <Section id="verify" n="11" k="진본 확인">
              <div className="flex gap-6 items-start flex-wrap">
                <div className="p-2.5 rounded-[12px] shrink-0" style={{ background: T.white, border: `1px solid ${T.g200}` }}>
                  <QRBlock value={D.DOC.hash} size={104} />
                </div>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <Line k="검증 주소" v={D.DOC.verify} color={T.blue} />
                  <Line k="타임스탬프" v={D.DOC.tsa} sub={`${D.DOC.tsaSerial} · ${D.DOC.tsaTime}`} />
                  <Line k="유효기간" v={`${D.DOC.expire}까지`} border={false} />
                  <div className="mt-3">
                    <div className="text-[11.5px] font-bold mb-1.5" style={{ color: T.g500 }}>무결성 해시 (SHA-256)</div>
                    <p className="tnum text-[11.5px] leading-relaxed break-all p-3 rounded-[10px]" style={{ background: T.g50, color: T.g600 }}>{D.DOC.hash}</p>
                  </div>
                </div>
              </div>
            </Section>

            <div style={{ borderTop: `1px solid ${T.g200}`, paddingTop: 20 }}>
              <p className="text-[12px] leading-[1.8]" style={{ color: T.g500 }}>
                이 리포트는 금융기관 심사 시 참고하는 보조자료입니다. 대출 승인이나 한도, 금리를 보장하지 않습니다.
                계속근무가능성과 근로 성실도는 통계 추정치로 실제와 다를 수 있습니다.
                작성에 사용한 원본 마이데이터는 발급 즉시 파기했으며 리포트 내용은 저장하지 않습니다.
                유효기간 경과 후에는 진본 확인이 불가하므로 재발급이 필요합니다.
              </p>
              <button onClick={onRestart} className="press noprint inline-flex items-center gap-1.5 text-[13px] font-semibold mt-4" style={{ color: T.g500 }}>
                <RefreshCw size={13} /> 처음부터 다시 보기
              </button>
              <p className="text-[12px] mt-3 font-bold" style={{ color: T.red }}>
                프로토타입 화면입니다. 실제 발급 문서가 아니며, 등장하는 인물·수치·문서번호·검증코드는 전부 예시입니다.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* 액션 바 */}
      <div className="noprint" style={{
        position: "sticky", bottom: 0, background: T.white, borderTop: `1px solid ${T.g200}`, zIndex: 30,
      }}>
        <div className="mx-auto flex items-center gap-3 px-8 py-3.5" style={{ maxWidth: 1240 }}>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px]" style={{ color: T.g500 }}>
              {D.blockSubmit ? "이상거래 소명 후 제출을 권합니다." : `${D.DOC.expire}까지 제출 가능합니다. 승인 여부와 조건은 금융기관이 판단합니다.`}
            </div>
          </div>
          <button onClick={onPdf} className="press inline-flex items-center gap-1.5 font-bold rounded-[11px] px-4"
            style={{ height: 44, background: T.g100, color: T.g800, fontSize: 14 }}>
            <Download size={16} strokeWidth={2.3} />PDF 저장
          </button>
          <div style={{ width: 260 }}>
            <Btn onClick={onSubmit} size="sm" tone={D.blockSubmit ? "red" : "blue"}
              icon={D.blockSubmit ? AlertTriangle : submitted ? Check : Wallet}>
              {D.blockSubmit ? "제출 전 확인 필요" : submitted ? "제출 내역 보기" : "금융기관에 제출"}
            </Btn>
          </div>
        </div>
      </div>

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
    </div>
  );
};
