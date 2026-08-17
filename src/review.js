/* ════════════════════════════════════════════════════════════════
   심사 참고 정보 — 중립 원칙

   이 리포트는 어느 한쪽을 대변하지 않습니다.
     · 이용자를 변호하지 않습니다 — 유리한 수치만 고르지 않아요.
     · 금융기관을 대신해 판정하지 않습니다 — 승인/부결을 결론 내지 않아요.

   대신 세 가지만 합니다.
     ① 사실과 계산 근거를 그대로 보여준다
     ② 같은 수치를 두 관점에서 어떻게 읽는지 나란히 적는다
     ③ 이 자료로 확인되지 않는 것을 먼저 밝힌다

   판단은 읽는 쪽의 몫입니다.
   ════════════════════════════════════════════════════════════════ */

/* 참고 기준선 — 규제·통계에서 온 공개된 값. 합격선이 아니라 좌표예요. */
export const BENCH = {
  dsrCap: 40,        // 총부채원리금상환비율 규제 상한 (%)
  cvCap: 25,         // 소득 변동계수 · 통계청 자영업 소득 안정 구간
  peerMonths: 19,    // 동종 프리랜서 활동기간 중앙값
  debtToIncome: 3,   // 소득 대비 여신잔액 배수 · 통상 관리 구간
  cardUse: 70,       // 카드 한도소진율 · 유동성 관찰 구간
};

const IN = "기준 이내", NEAR = "경계", OVER = "기준 밖";

/* 지표별 위치 — 판정이 아니라 '기준선 대비 어디에 있는지' */
function positions(D) {
  const K = D.CREDIT_SUM, C = D.CASH;
  const pos = (v, good, warn) => (good ? IN : warn ? NEAR : OVER);

  return [
    {
      k: "소득 변동계수",
      got: `${D.CV.toFixed(1)}%`,
      bench: `${BENCH.cvCap}%`,
      st: pos(D.CV, D.CV <= BENCH.cvCap, D.CV <= BENCH.cvCap * 1.6),
      src: "통계청 자영업 가구 소득 변동 통계",
    },
    {
      k: "활동 기간",
      got: `${D.ME.months}개월`,
      bench: `중앙값 ${BENCH.peerMonths}개월`,
      st: pos(0, D.ME.months >= BENCH.peerMonths, D.ME.months >= 12),
      src: "동종 프리랜서 12,400명 표본",
    },
    {
      k: "DSR",
      got: `${D.LIMIT.dsr.toFixed(1)}%`,
      bench: `${BENCH.dsrCap}%`,
      st: pos(0, D.LIMIT.dsr < BENCH.dsrCap * 0.75, D.LIMIT.dsr < BENCH.dsrCap),
      src: "금융위 가계부채 관리방안 규제 상한",
    },
    {
      k: "여신잔액 / 연소득",
      got: `${K.toIncome}배`,
      bench: `${BENCH.debtToIncome}배`,
      st: pos(0, K.toIncome <= BENCH.debtToIncome, K.toIncome <= BENCH.debtToIncome * 1.7),
      src: "통상 여신 관리 구간",
    },
    {
      k: "카드 한도소진율",
      got: `${K.cardUse}%`,
      bench: `${BENCH.cardUse}%`,
      st: pos(0, K.cardUse < BENCH.cardUse * 0.6, K.cardUse < BENCH.cardUse),
      src: "단기 유동성 관찰 지표",
    },
    {
      k: "월 여유자금",
      got: `${C.surplus < 0 ? "−" : ""}${Math.abs(C.surplus).toLocaleString("ko-KR")}원`,
      bench: "0원",
      st: pos(0, !C.deficit, C.surplus > -300000),
      src: "가처분소득 − 고정비 − 원리금 − 소비",
    },
    {
      k: "이상거래",
      got: D.FDS.alert ? `위험 ${D.FDS.alert}건` : D.FDS.caution ? `확인 ${D.FDS.caution}건` : "해당 없음",
      bench: "위험 0건",
      st: pos(0, D.FDS.alert === 0 && D.FDS.caution <= 2, D.FDS.alert === 0),
      src: "금융권 FDS 규칙을 프리랜서 거래에 맞게 조정",
    },
    {
      k: "수입원 집중도",
      got: `최대 채널 ${D.TOP_SHARE}%`,
      bench: "50%",
      st: pos(0, D.TOP_SHARE < 50, D.TOP_SHARE < 70),
      src: `HHI ${D.HHI.toFixed(3)}`,
    },
  ];
}

/* 같은 사실을 두 관점에서 — 어느 쪽 문장도 상대를 깎지 않습니다 */
function perspectives(D) {
  const C = D.CASH, K = D.CREDIT_SUM;
  const out = [];

  out.push({
    topic: "정산 기반 소득",
    user: `재직증명서를 낼 수 없어도 ${D.ME.months}개월치 정산 내역으로 소득의 실재를 보일 수 있어요.`,
    lender: "정산액은 필요경비 차감 전 금액이라, 세무 증빙과는 차이가 납니다. 인정 범위는 기관 내규에 따릅니다.",
  });

  out.push({
    topic: "소득 예측",
    user: `과거 실적을 바탕으로 앞으로 12개월을 범위로 제시해요. 보수적으로 봐도 ${Math.round(D.P10_SUM / 10000).toLocaleString()}만원이에요.`,
    lender: "예측은 과거 추세의 연장이며 계약 종료·발주 감소를 반영하지 못합니다. 확정 소득이 아닙니다.",
  });

  out.push({
    topic: D.CV <= BENCH.cvCap ? "소득 안정성" : "소득 변동성",
    user: D.CV <= BENCH.cvCap
      ? `월 편차가 ${D.CV.toFixed(1)}%로 크지 않아요. 매달 들어오는 금액이 고른 편이에요.`
      : `월 편차가 ${D.CV.toFixed(1)}%예요. 성수기·비수기가 뚜렷한 직군 특성도 함께 봐주세요.`,
    lender: D.CV <= BENCH.cvCap
      ? "변동계수가 안정 구간이지만, 관측 기간 밖의 충격은 포함되지 않았습니다."
      : "변동계수가 안정 구간을 넘어 특정 월의 상환 재원이 부족할 수 있습니다.",
  });

  out.push({
    topic: "타행 여신",
    user: K.toIncome <= BENCH.debtToIncome
      ? "다른 기관 대출까지 모아 보여드려요. 숨긴 부채가 없다는 뜻이기도 해요."
      : "부채 규모를 그대로 공개해요. 상환 이력도 함께 봐주시면 좋겠어요.",
    lender: `조회 시점 기준이라 최근 상환·신규 실행이 반영되기까지 시차가 있습니다. 실제 심사 시 재조회가 필요합니다.`,
  });

  out.push({
    topic: "소비패턴",
    user: C.deficit
      ? "지출 내역을 숨기지 않고 그대로 담았어요. 부족분이 생기는 시기와 이유를 함께 확인할 수 있어요."
      : "고정비와 소비를 빼고도 매달 남는 금액을 보여드려요.",
    lender: "카드·계좌 기반이라 현금 지출은 잡히지 않습니다. 실제 지출은 이보다 클 수 있습니다.",
  });

  out.push({
    topic: "이상거래 검사",
    user: D.FDS.alert
      ? "걸린 항목을 감추지 않고 사유까지 적었어요. 소명할 기회를 먼저 드리려는 거예요."
      : "은행이 물어볼 만한 거래를 미리 확인하고 설명을 붙였어요.",
    lender: "자체 FDS를 대체하지 않습니다. 기관 규칙과 임계값이 다르면 결과가 달라집니다.",
  });

  return out;
}

/* 이 자료로 확인되지 않는 것 — 먼저 밝힙니다 */
function limits(D) {
  const base = [
    "장래 계약이 유지된다는 보장이 아닙니다. 예측은 과거 실적의 통계적 연장입니다.",
    "필요경비·세액은 추정치입니다. 확정 신고 결과와 다를 수 있습니다.",
    "현금 거래와 미신고 소득은 집계되지 않습니다.",
    "여신·신용정보는 조회 시점 기준이며 실시간이 아닙니다.",
    "대출 승인·한도·금리를 결정하거나 보장하지 않습니다. 판단은 금융기관의 고유 권한입니다.",
  ];
  if (D.HIST.length < 12) base.unshift(`소득 관측이 ${D.HIST.length}개월로 12개월 기준 지표는 추정값입니다.`);
  if (D.FDS.alert) base.unshift("이상거래 소명이 완료되지 않아 소득 산정의 신뢰도가 제한됩니다.");
  return base;
}

export function buildReview(D) {
  const p = positions(D);
  return {
    positions: p,
    counts: {
      in: p.filter((x) => x.st === IN).length,
      near: p.filter((x) => x.st === NEAR).length,
      over: p.filter((x) => x.st === OVER).length,
    },
    perspectives: perspectives(D),
    limits: limits(D),
    bench: BENCH,
  };
}

export const POS_TONE = { [IN]: "green", [NEAR]: "amber", [OVER]: "red" };
