import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, User, Landmark } from "lucide-react";
import { T, TONE, won, eok } from "./core.js";
import { useD, Meter, Chip, Label } from "./ui.jsx";
import { POS_TONE } from "./review.js";

/* ════════════════════════════════════════════════════════════════
   앱 카드와 웹 리포트가 함께 쓰는 분석 블록
   ════════════════════════════════════════════════════════════════ */

/* ── 가처분소득 폭포 ───────────────────────────────────────────── */
export const CashWaterfall = ({ compact }) => {
  const D = useD();
  const C = D.CASH;
  const rows = [
    { k: "월 평균 정산소득", v: C.gross, kind: "start" },
    { k: `사업 필요경비 (${Math.round(C.costRatio * 100)}%)`, v: -C.bizCost },
    { k: "소득세·지방소득세 추정", v: -C.tax },
    { k: "건강보험·국민연금", v: -C.social },
    { k: "가처분소득", v: C.disposable, kind: "sub" },
    { k: "생활 고정비 (주거·보험·통신)", v: -C.fixed },
    { k: "대출 원리금", v: -C.debt },
    { k: "평균 소비지출", v: -C.spend },
    { k: "월 여유자금", v: C.surplus, kind: "end" },
  ];
  const peak = Math.max(...rows.map((r) => Math.abs(r.v)));

  return (
    <div>
      {rows.map((r) => {
        const isTotal = r.kind === "sub" || r.kind === "end" || r.kind === "start";
        const neg = r.v < 0;
        const bad = r.kind === "end" && r.v < 0;
        const col = bad ? T.red : r.kind === "sub" ? T.blue : isTotal ? T.g900 : T.g600;
        return (
          <div key={r.k} style={{
            paddingTop: 9, paddingBottom: 9,
            borderTop: r.kind === "sub" || r.kind === "end" ? `1px solid ${T.g200}` : `1px solid ${T.g100}`,
          }}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[13.5px] ${isTotal ? "font-bold" : ""}`}
                style={{ color: isTotal ? T.g900 : T.g600 }}>{r.k}</span>
              <span className={`tnum text-[14px] shrink-0 ${isTotal ? "font-bold" : "font-semibold"}`} style={{ color: col }}>
                {neg ? "−" : ""}{won(Math.abs(r.v))}원
              </span>
            </div>
            {!compact && (
              <div className="mt-1.5">
                <Meter pct={(Math.abs(r.v) / peak) * 100} h={4}
                  color={bad ? T.red : r.kind === "sub" ? T.blue : r.kind === "end" ? T.green : neg ? T.g300 : T.g800}
                  track={T.g50} />
              </div>
            )}
          </div>
        );
      })}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          ["저축 여력", `${C.savingRate}%`, C.savingRate >= 10 ? "green" : C.savingRate >= 0 ? "amber" : "red"],
          ["원리금 / 가처분", `${C.debtRatio}%`, C.debtRatio < 30 ? "green" : C.debtRatio < 60 ? "amber" : "red"],
          ["소비 / 가처분", `${C.spendRatio}%`, C.spendRatio < 60 ? "green" : C.spendRatio < 90 ? "amber" : "red"],
        ].map(([k, v, tone]) => (
          <div key={k} className="p-3 rounded-[12px]" style={{ background: T.g50 }}>
            <div className="text-[11.5px]" style={{ color: T.g500 }}>{k}</div>
            <div className="tnum text-[16px] font-bold mt-0.5" style={{ color: TONE[tone].fg }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 타행 여신 표 ─────────────────────────────────────────────── */
export const CreditTable = ({ dense }) => {
  const D = useD();
  if (!D.CREDIT) return null;
  const typeTone = { 담보: "blue", 신용: "amber", 카드: "grey", 정책: "green" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="w-full" style={{ borderCollapse: "collapse", minWidth: dense ? 0 : 620 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.g200}` }}>
            {["금융기관", "상품", "구분", "실행일", "만기", "한도", "잔액", "금리", "연체"].map((h, i) => (
              <th key={h} className="text-[11.5px] font-bold py-2"
                style={{ color: T.g500, textAlign: i >= 5 && i <= 7 ? "right" : "left", whiteSpace: "nowrap", paddingRight: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.CREDIT.lines.map((l, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.g100}` }}>
              <td className="text-[13px] font-semibold py-2.5" style={{ color: T.g900, whiteSpace: "nowrap", paddingRight: 12 }}>{l.org}</td>
              <td className="text-[13px] py-2.5" style={{ color: T.g700, whiteSpace: "nowrap", paddingRight: 12 }}>{l.kind}</td>
              <td className="py-2.5" style={{ paddingRight: 12 }}><Chip tone={typeTone[l.type] || "grey"}>{l.type}</Chip></td>
              <td className="tnum text-[12.5px] py-2.5" style={{ color: T.g500, whiteSpace: "nowrap", paddingRight: 12 }}>{l.exec}</td>
              <td className="tnum text-[12.5px] py-2.5" style={{ color: T.g500, whiteSpace: "nowrap", paddingRight: 12 }}>{l.due}</td>
              <td className="tnum text-[13px] py-2.5 text-right" style={{ color: T.g600, whiteSpace: "nowrap", paddingRight: 12 }}>{won(l.limit)}</td>
              <td className="tnum text-[13px] font-bold py-2.5 text-right" style={{ color: T.g900, whiteSpace: "nowrap", paddingRight: 12 }}>{won(l.bal)}</td>
              <td className="tnum text-[13px] py-2.5 text-right"
                style={{ color: l.rate >= 10 ? T.red : l.rate >= 7 ? T.amber : T.g700, whiteSpace: "nowrap", paddingRight: 12 }}>
                {l.rate ? `${l.rate.toFixed(2)}%` : "—"}
              </td>
              <td className="text-[12.5px] py-2.5" style={{ color: l.delay === "없음" ? T.g500 : T.red, whiteSpace: "nowrap" }}>{l.delay}</td>
            </tr>
          ))}
          <tr style={{ borderTop: `2px solid ${T.g200}` }}>
            <td className="text-[13px] font-bold py-2.5" style={{ color: T.g900 }} colSpan={5}>합계 · {D.CREDIT_SUM.orgs}개 기관</td>
            <td className="tnum text-[13px] font-bold py-2.5 text-right" style={{ color: T.g600, paddingRight: 12 }}>{won(D.CREDIT_SUM.totalLimit)}</td>
            <td className="tnum text-[13px] font-bold py-2.5 text-right" style={{ color: T.g900, paddingRight: 12 }}>{won(D.CREDIT_SUM.totalBal)}</td>
            <td className="tnum text-[13px] font-bold py-2.5 text-right" style={{ color: T.g700, paddingRight: 12 }}>{D.CREDIT_SUM.wRate}%</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/* ── 여신 요약 타일 ───────────────────────────────────────────── */
export const CreditStats = () => {
  const D = useD();
  const K = D.CREDIT_SUM;
  const tiles = [
    ["총 여신잔액", `${eok(K.totalBal)}원`, K.toIncome >= 3 ? "red" : K.toIncome >= 1.5 ? "amber" : "green"],
    ["연소득 대비", `${K.toIncome}배`, K.toIncome >= 3 ? "red" : K.toIncome >= 1.5 ? "amber" : "green"],
    ["가중평균 금리", `${K.wRate}%`, K.wRate >= 10 ? "red" : K.wRate >= 7 ? "amber" : "green"],
    ["카드 한도소진", `${K.cardUse}%`, K.cardUse >= 70 ? "red" : K.cardUse >= 40 ? "amber" : "green"],
    ["6개월 신규", `${D.CREDIT.newIn6M}건`, D.CREDIT.newIn6M >= 2 ? "red" : D.CREDIT.newIn6M >= 1 ? "amber" : "green"],
    ["6개월 조회", `${D.CREDIT.inquiries6M}회`, D.CREDIT.inquiries6M >= 6 ? "red" : D.CREDIT.inquiries6M >= 3 ? "amber" : "green"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8 }}>
      {tiles.map(([k, v, tone]) => (
        <div key={k} className="p-3 rounded-[12px]" style={{ background: T.g50 }}>
          <div className="text-[11.5px]" style={{ color: T.g500 }}>{k}</div>
          <div className="tnum text-[15px] font-bold mt-0.5" style={{ color: TONE[tone].fg }}>{v}</div>
        </div>
      ))}
    </div>
  );
};

/* ── 소비 카테고리 ────────────────────────────────────────────── */
export const SpendBars = () => {
  const D = useD();
  const P = D.SPEND;
  const max = Math.max(...P.byCat.map((c) => c.v));
  return (
    <div className="space-y-3">
      {[...P.byCat].sort((a, b) => b.v - a.v).map((c, i) => {
        const risky = /현금서비스|카드대출|리볼빙/.test(c.k);
        const Tr = c.trend > 1 ? TrendingUp : c.trend < -1 ? TrendingDown : Minus;
        const trCol = risky && c.trend > 0 ? T.red : c.trend > 1 ? T.g700 : c.trend < -1 ? T.g500 : T.g400;
        return (
          <div key={c.k}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[13.5px] font-semibold truncate" style={{ color: risky ? T.red : T.g800 }}>{c.k}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-0.5 text-[11.5px] font-bold" style={{ color: trCol }}>
                  <Tr size={11} strokeWidth={2.6} />{c.trend > 0 ? "+" : ""}{c.trend}%
                </span>
                <span className="tnum text-[13px] font-bold" style={{ color: T.g900 }}>{won(c.v)}원</span>
              </span>
            </div>
            <Meter pct={(c.v / max) * 100} h={6} delay={i * 0.04}
              color={risky ? T.red : i === 0 ? T.blue : "#9CC7FA"} track={T.g100} />
          </div>
        );
      })}
    </div>
  );
};

/* ── 소비 경고 ────────────────────────────────────────────────── */
export const SpendFlags = () => {
  const D = useD();
  if (!D.SPEND.flags.length) return null;
  const tone = TONE[D.SPEND.tone];
  return (
    <div className="space-y-2">
      {D.SPEND.flags.map((f) => (
        <div key={f} className="flex gap-2.5 p-3.5 rounded-[13px]" style={{ background: tone.bg }}>
          <AlertTriangle size={15} color={tone.fg} strokeWidth={2.4} className="shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed" style={{ color: tone.deep }}>{f}</p>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   중립 블록 — 판정하지 않고, 위치와 양측 관점과 한계만 보여줍니다
   ════════════════════════════════════════════════════════════════ */

/* 기준선 대비 위치 — 합격/불합격이 아니라 좌표 */
export const ReviewPositions = () => {
  const D = useD();
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.g200}` }}>
            {["지표", "측정값", "참고 기준선", "위치"].map((h, i) => (
              <th key={h} className="text-[11.5px] font-bold py-2"
                style={{ color: T.g500, textAlign: i >= 1 ? "right" : "left", paddingRight: 12, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.REVIEW.positions.map((p) => (
            <tr key={p.k} style={{ borderBottom: `1px solid ${T.g100}` }}>
              <td className="text-[13px] py-2.5" style={{ color: T.g800, paddingRight: 12 }}>
                {p.k}<div className="text-[11.5px] mt-0.5" style={{ color: T.g500 }}>{p.src}</div>
              </td>
              <td className="tnum text-[13px] font-bold py-2.5" style={{ color: T.g900, textAlign: "right", paddingRight: 12, whiteSpace: "nowrap" }}>{p.got}</td>
              <td className="tnum text-[12.5px] py-2.5" style={{ color: T.g500, textAlign: "right", paddingRight: 12, whiteSpace: "nowrap" }}>{p.bench}</td>
              <td className="py-2.5" style={{ textAlign: "right" }}><Chip tone={POS_TONE[p.st]}>{p.st}</Chip></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[12px] leading-relaxed mt-3" style={{ color: T.g500 }}>
        기준선은 규제·공개 통계에서 가져온 좌표예요. 통과 여부를 뜻하지 않고,
        어느 위치에 있는지만 보여드려요. 판단은 읽는 분이 하세요.
      </p>
    </div>
  );
};

/* 같은 사실을 두 관점에서 나란히 */
export const Perspectives = () => {
  const D = useD();
  return (
    <div className="space-y-2.5">
      {D.REVIEW.perspectives.map((p) => (
        <div key={p.topic} style={{ border: `1px solid ${T.g200}`, borderRadius: 14, overflow: "hidden" }}>
          <div className="text-[13px] font-bold px-4 py-2.5" style={{ background: T.g50, color: T.g900 }}>{p.topic}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div className="px-4 py-3.5" style={{ borderRight: `1px solid ${T.g100}` }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <User size={12} color={T.blue} strokeWidth={2.6} />
                <span className="text-[11.5px] font-bold" style={{ color: T.blue }}>이용자 관점</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: T.g700 }}>{p.user}</p>
            </div>
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Landmark size={12} color={T.g600} strokeWidth={2.6} />
                <span className="text-[11.5px] font-bold" style={{ color: T.g600 }}>금융기관 관점</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: T.g700 }}>{p.lender}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* 이 자료로 확인되지 않는 것 */
export const ReviewLimits = () => {
  const D = useD();
  return (
    <div className="p-4 rounded-[14px]" style={{ background: T.g50 }}>
      <div className="text-[13px] font-bold mb-2.5" style={{ color: T.g800 }}>이 자료로 확인되지 않는 것</div>
      <ul style={{ margin: 0, paddingLeft: 17 }}>
        {D.REVIEW.limits.map((l) => (
          <li key={l} className="text-[13px] leading-relaxed" style={{ color: T.g600, marginBottom: 5 }}>{l}</li>
        ))}
      </ul>
    </div>
  );
};
