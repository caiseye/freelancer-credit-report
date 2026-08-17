/* 렌더 스모크 테스트 — 모든 시나리오 × 모드 × 단계를 문자열로 렌더해
   런타임 오류(undefined 접근, 누락된 import 등)를 잡습니다. */
import React from "react";
import { renderToString } from "react-dom/server";
import { SCENARIOS, getData } from "./src/scenarios.js";
import { AppCtx } from "./src/ui.jsx";
import {
  ScreenIntro, ScreenConsent, ScreenAuth, ScreenCollect,
  ScreenAnalyze, ScreenReport, SubmitFlow,
} from "./src/screens.jsx";

const SCREENS = [
  ["시작", ScreenIntro], ["약관", ScreenConsent], ["인증", ScreenAuth],
  ["수집", ScreenCollect], ["분석", ScreenAnalyze], ["리포트", ScreenReport],
];

const noop = () => {};
let pass = 0;
const fails = [];

for (const s of SCENARIOS) {
  const D = getData(s.id);
  for (const mode of ["app", "web"]) {
    const ctx = { D, mode };
    for (const [name, C] of SCREENS) {
      try {
        const html = renderToString(
          <AppCtx.Provider value={ctx}>
            <C onNext={noop} onBack={noop} onSubmit={noop} onRestart={noop} submitted={false} />
          </AppCtx.Provider>
        );
        if (!html || html.length < 200) throw new Error(`출력이 너무 짧음 (${html.length}자)`);
        pass++;
      } catch (e) {
        fails.push(`${s.id}/${mode}/${name}: ${e.message}`);
      }
    }
    /* 제출 플로우 — 이상거래 케이스는 차단 화면으로 갈라집니다 */
    for (const [label, props] of [["제출-초기", {}], ["제출-완료", { already: true }]]) {
      try {
        const html = renderToString(
          <AppCtx.Provider value={ctx}>
            <SubmitFlow onClose={noop} onDone={noop} {...props} />
          </AppCtx.Provider>
        );
        if (!html) throw new Error("빈 출력");
        pass++;
      } catch (e) {
        fails.push(`${s.id}/${mode}/${label}: ${e.message}`);
      }
    }
  }
}

console.log(`렌더 성공 ${pass}건`);
if (fails.length) {
  console.log(`\n실패 ${fails.length}건:`);
  fails.forEach((f) => console.log("  ✗ " + f));
  process.exit(1);
} else {
  console.log("전부 통과");
}
