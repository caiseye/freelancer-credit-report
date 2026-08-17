/* 분기 검증 — 시나리오별로 화면 내용이 실제로 달라지는지 확인합니다.
   렌더가 죽지 않는 것과, 케이스가 화면에 반영되는 건 다른 문제라서요. */
import React from "react";
import { renderToString } from "react-dom/server";
import { getData } from "./src/scenarios.js";
import { AppCtx } from "./src/ui.jsx";
import { ScreenReport, SubmitFlow, ScreenAuth } from "./src/screens.jsx";
import { IDPS } from "./src/idps.js";
import { BANKS, BANK_CATS, FEATURED } from "./src/banks.js";
import App from "./src/App.jsx";

const noop = () => {};
const render = (id, mode, El, props = {}) => renderToString(
  <AppCtx.Provider value={{ D: getData(id), mode }}>
    <El onNext={noop} onBack={noop} onSubmit={noop} onRestart={noop} onClose={noop} onDone={noop} {...props} />
  </AppCtx.Provider>
);
const strip = (h) => h.replace(/<!--[\s\S]*?-->/g, "");

const checks = [];
const has = (label, html, needle, want = true) => {
  const got = strip(html).includes(needle);
  checks.push({ label, needle, ok: got === want, want });
};

/* 1 · 정상 — 양호 판정, 제출 가능 */
{
  const h = render("normal", "app", ScreenReport);
  has("normal 판정배지", h, "지표 양호");
  has("normal 이름", h, "김도현");
  has("normal 위험없음", h, "위험한 거래는 없어요");
  has("normal 제출버튼", h, "은행에 제출하기");
  has("normal 차단문구 없음", h, "제출 전 확인이 필요해요", false);
}

/* 2 · 이상거래 — 제출 차단, 위험 항목 노출 */
{
  const h = render("fds_alert", "app", ScreenReport);
  has("fds 판정배지", h, "소명 필요");
  has("fds 이름", h, "박선우");
  has("fds 위험헤드라인", h, "위험 거래가 발견됐어요");
  has("fds 제출차단 CTA", h, "제출 전 확인이 필요해요");
  has("fds 소득제외 안내", h, "소득에서 뺀 입금");
  has("fds 한도 미산출", h, "이상거래 소명 전에는");
  const s = render("fds_alert", "app", SubmitFlow);
  has("fds 제출차단 시트", s, "지금은 제출할 수 없어요");
  has("fds 은행선택 안뜸", s, "어디에 제출할까요", false);
}

/* 3 · 소득 하락 — 하락 경고, 평균 미달 */
{
  const h = render("income_down", "app", ScreenReport);
  has("down 판정배지", h, "하락 추세");
  has("down 이름", h, "이하늘");
  has("down 하락문구", h, "% 낮아요.");
  has("down 평균미달", h, "%p 낮아요.");
  has("down 신고액 적음", h, "적어요. 최근 소득이 줄어든 영향이에요.");
}

/* 4 · 이력 부족 — 산출 불가 지표, 자료부족 카드 */
{
  const h = render("thin_file", "app", ScreenReport);
  has("thin 판정배지", h, "자료 부족");
  has("thin 이름", h, "정유진");
  has("thin 산출불가", h, "산출 불가");
  has("thin 자료부족 카드", h, "이건 미리 알아두세요");
  has("thin 8개월 라벨", h, "지난 8개월 소득");
  has("thin 신뢰도 안내", h, "신뢰도가 낮아요");
}

/* 5 · 부채 과다 — DSR 초과, 한도 0 */
{
  const h = render("high_dsr", "app", ScreenReport);
  has("dsr 판정배지", h, "상환부담 과다");
  has("dsr 이름", h, "최민재");
  has("dsr 초과문구", h, "DSR이 규제 상한을 넘어");
  has("dsr 위험없음", h, "위험한 거래는 없어요");
}

/* 6 · 웹/앱 레이아웃이 실제로 다른지 */
{
  const app = render("normal", "app", ScreenReport);
  const web = render("normal", "web", ScreenReport);
  checks.push({ label: "웹/앱 마크업 상이", needle: "-", ok: app !== web, want: true });
  /* 웹 = 문서형(목차 그리드), 앱 = 카드 스택 */
  has("웹 문서 레이아웃", web, "webgrid");
  has("앱은 문서 레이아웃 아님", app, "webgrid", false);
  has("앱 카드 스택", app, "card ");
}

/* 7 · 선택 화면 */
{
  const h = renderToString(<App />);
  has("선택화면 제목", h, "프리랜서 금융심사 리포트");
  has("선택화면 케이스5", h, "이상거래 감지");
  has("선택화면 프로토타입 고지", h, "실제로 발급되거나 효력이 있는 문서가 아니에요");
  has("선택화면 모드선택", h, "모바일 앱");
}

const bad = checks.filter((c) => !c.ok);
console.log(`검증 ${checks.length}건 중 통과 ${checks.length - bad.length}건`);
if (bad.length) {
  console.log("\n실패:");
  bad.forEach((c) => console.log(`  ✗ ${c.label} — "${c.needle}" ${c.want ? "있어야 하는데 없음" : "없어야 하는데 있음"}`));
  process.exit(1);
} else {
  console.log("모든 분기가 화면에 반영됨");
}

/* ── 8 · 보강된 리포트 내용 (타행 여신 · 소비 · 가처분소득) ── */
{
  const results = [];
  for (const id of ["normal", "fds_alert", "income_down", "thin_file", "high_dsr"]) {
    for (const mode of ["app", "web"]) {
      const h = strip(render(id, mode, ScreenReport));
      const D = getData(id);
      const label = `${id}/${mode}`;
      [
        ["타행 여신 섹션", mode === "web" ? "타행 여신 현황" : "다른 금융기관 대출 현황"],
        ["가처분소득", "가처분소득"],
        ["소비 카테고리", "식비·마트"],
        ["여신 기관명", D.CREDIT.lines[0].org],
        ["신용평점", String(D.CREDIT.score.kcb)],
      ].forEach(([what, needle]) => {
        if (!h.includes(needle)) results.push(`${label} — ${what} "${needle}" 없음`);
      });
    }
  }
  /* 웹은 문서형(목차·번호 절), 앱은 카드형이어야 함 */
  const web = strip(render("normal", "web", ScreenReport));
  const app = strip(render("normal", "app", ScreenReport));
  if (!web.includes("목차")) results.push("웹 — 목차 없음");
  if (!web.includes("FINANCIAL INCLUSION REPORT")) results.push("웹 — 문서 표제부 없음");
  if (!web.includes("상환여력 (DSR)")) results.push("웹 — DSR 절 없음");
  if (app.includes("목차")) results.push("앱 — 목차가 나오면 안 됨");
  if (app.includes("webgrid")) results.push("앱 — 문서형 레이아웃이 나오면 안 됨");

  results.forEach((r) => checks.push({ label: r, needle: "-", ok: false, want: true }));
  if (!results.length) checks.push({ label: "보강 리포트 전 케이스", needle: "-", ok: true, want: true });
}

const bad2 = checks.filter((c) => !c.ok);
console.log(`\n[2차] 검증 ${checks.length}건 중 통과 ${checks.length - bad2.length}건`);
if (bad2.length) { bad2.forEach((c) => console.log("  ✗ " + c.label)); process.exit(1); }
console.log("보강 섹션까지 전부 반영됨");


/* ── 9 · 인증사업자 전체 · 중립성 ── */
{
  const r9 = [];
  const auth = strip(renderToString(
    <AppCtx.Provider value={{ D: getData("normal"), mode: "app" }}>
      <ScreenAuth onNext={() => {}} onBack={() => {}} />
    </AppCtx.Provider>
  ));
  IDPS.forEach((i) => { if (!auth.includes(i.k)) r9.push(`인증수단 "${i.k}" 누락`); });
  ["간편인증", "금융기관 인증서", "범용 인증서"].forEach((g) => {
    if (!auth.includes(g)) r9.push(`인증 그룹 "${g}" 누락`);
  });
  if (IDPS.length < 18) r9.push(`인증사업자가 ${IDPS.length}곳뿐`);

  /* 중립성 — 양측 관점과 한계가 두 모드 모두에 있어야 함 */
  for (const mode of ["app", "web"]) {
    for (const id of ["normal", "high_dsr"]) {
      const h = strip(render(id, mode, ScreenReport));
      if (!h.includes("이 자료로 확인되지 않는 것")) r9.push(`${id}/${mode} — 한계 고지 없음`);
      if (!h.includes("판단은 읽는 분이 하세요") && !h.includes("금융기관이 판단")) {
        r9.push(`${id}/${mode} — 판단 주체 명시 없음`);
      }
    }
  }
  const web = strip(render("normal", "web", ScreenReport));
  if (!web.includes("이용자 관점")) r9.push("웹 — 이용자 관점 없음");
  if (!web.includes("금융기관 관점")) r9.push("웹 — 금융기관 관점 없음");
  if (!web.includes("참고 지표와 한계")) r9.push("웹 — 참고 지표 절 없음");

  /* 한쪽으로 기울던 표현이 남아 있지 않은지 */
  ["은행에 그대로 내면 돼요", "승인 가능", "부결", "취급 불가"].forEach((bad) => {
    if (web.includes(bad)) r9.push(`중립성 — 치우친 표현 "${bad}" 잔존`);
  });

  r9.forEach((r) => checks.push({ label: r, needle: "-", ok: false, want: true }));
  if (!r9.length) checks.push({ label: `인증사업자 ${IDPS.length}곳 · 중립 구성`, needle: "-", ok: true, want: true });
}

const bad3 = checks.filter((c) => !c.ok);
console.log(`\n[3차] 검증 ${checks.length}건 중 통과 ${checks.length - bad3.length}건`);
if (bad3.length) { bad3.forEach((c) => console.log("  \u2717 " + c.label)); process.exit(1); }
console.log("인증사업자 전체 + 중립 구성 확인");


/* ── 10 · 제출처 ── */
{
  const r10 = [];
  const pickSheet = strip(render("normal", "app", SubmitFlow));

  /* 후원 기관 3곳은 주요 제출처로 먼저 보여야 함 */
  ["하나은행", "신한은행", "카카오뱅크"].forEach((k) => {
    if (!pickSheet.includes(k)) r10.push(`주요 제출처 "${k}" 누락`);
  });
  if (FEATURED.length !== 3) r10.push(`주요 제출처가 ${FEATURED.length}곳`);
  if (!pickSheet.includes("주요 제출처")) r10.push("주요 제출처 구역 없음");

  /* 전체 기관이 모두 렌더돼야 함 */
  BANKS.forEach((b) => { if (!pickSheet.includes(b.k)) r10.push(`제출처 "${b.k}" 누락`); });
  BANK_CATS.forEach((c) => { if (!pickSheet.includes(c.k)) r10.push(`업권 필터 "${c.k}" 누락`); });

  /* 업권 커버리지 — 은행에만 쏠리지 않게 */
  const cats = new Set(BANKS.map((b) => b.cat));
  if (cats.size < 6) r10.push(`업권이 ${cats.size}종뿐`);
  if (BANKS.length < 25) r10.push(`제출처가 ${BANKS.length}곳뿐`);

  /* 기본 선택은 후원 3곳 */
  ["하나은행", "신한은행", "카카오뱅크"].forEach((k) => {
    if (!pickSheet.includes(k)) r10.push(`기본 선택 "${k}" 없음`);
  });

  /* id 중복 방지 */
  const ids = BANKS.map((b) => b.id);
  if (new Set(ids).size !== ids.length) r10.push("제출처 id 중복");

  r10.forEach((r) => checks.push({ label: r, needle: "-", ok: false, want: true }));
  if (!r10.length) checks.push({ label: `제출처 ${BANKS.length}곳 · ${cats.size}개 업권`, needle: "-", ok: true, want: true });
}

const bad4 = checks.filter((c) => !c.ok);
console.log(`\n[4차] 검증 ${checks.length}건 중 통과 ${checks.length - bad4.length}건`);
if (bad4.length) { bad4.forEach((c) => console.log("  \u2717 " + c.label)); process.exit(1); }
console.log("제출처 구성 확인");
