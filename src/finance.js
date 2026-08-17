/* ════════════════════════════════════════════════════════════════
   타행 여신 현황 · 카드 소비패턴 · 가처분소득 원천 데이터

   여신 라인(credit.lines)이 부채의 유일한 출처입니다. 기존 DEBTS는
   여기서 파생시켜서, 두 군데에 적힌 잔액이 갈라지는 일이 없게 했어요.

   소비(spend.byCat)는 '변동 소비지출'만 담습니다. 주거·보험·통신처럼
   고정지출(FIXED)에 이미 들어간 항목은 빼서 이중계산을 막았어요.
   ════════════════════════════════════════════════════════════════ */

export const FINANCE = {
  /* ── 1 · 정상 ─────────────────────────────────────────────── */
  normal: {
    costRatio: 0.17,          // 사업 필요경비율 (정산액 대비)
    taxMonthly: 121000,       // 소득세 + 지방소득세 월 환산 추정
    credit: {
      inquiry: "KCB 올크레딧 · 2026.08.15 조회",
      score: { kcb: 842, nice: 828, grade: "2등급", trend: "+14 (6개월)" },
      lines: [
        { org: "KB국민은행", kind: "전세자금대출", type: "담보", exec: "2024.03.12", due: "2028.03.11",
          limit: 15000000, bal: 15000000, rate: 3.90, delay: "없음" },
        { org: "카카오뱅크", kind: "마이너스통장", type: "신용", exec: "2025.06.20", due: "2027.06.19",
          limit: 5000000, bal: 3200000, rate: 6.80, delay: "없음" },
        { org: "신한카드", kind: "카드 결제예정", type: "카드", exec: "—", due: "2026.09.05",
          limit: 8000000, bal: 1400000, rate: 0, delay: "없음" },
      ],
      cards: [
        { org: "신한카드", kind: "신용", limit: 8000000, used: 1400000, revolving: false },
        { org: "현대카드", kind: "신용", limit: 5000000, used: 0, revolving: false },
        { org: "카카오뱅크", kind: "체크", limit: 0, used: 0, revolving: false },
      ],
      newIn6M: 0, inquiries6M: 2, delayEver: "최근 36개월 연체 0건",
      note: "담보대출 1건 외에는 한도 소진율이 낮아요. 신용 하락 신호가 없어요.",
      tone: "green",
    },
    spend: {
      months: 12, monthlyAvg: 880000,
      byCat: [
        { k: "식비·마트", v: 312000, trend: +2.1 },
        { k: "교통·차량", v: 128000, trend: -1.4 },
        { k: "의료·건강", v: 62000, trend: +0.6 },
        { k: "쇼핑·의류", v: 148000, trend: +4.8 },
        { k: "문화·여가", v: 96000, trend: +1.9 },
        { k: "교육·자기계발", v: 88000, trend: +6.2 },
        { k: "기타", v: 46000, trend: -0.8 },
      ],
      channels: [{ k: "신용카드", v: 512000 }, { k: "체크카드", v: 268000 }, { k: "계좌이체", v: 100000 }],
      cashAdvance: 0, revolvingUse: 0,
      flags: [],
      note: "소비가 소득 안에서 안정적으로 유지돼요. 교육비 비중이 늘고 있어요.",
      tone: "green",
    },
  },

  /* ── 2 · 이상거래 감지 ────────────────────────────────────── */
  fds_alert: {
    costRatio: 0.21,
    taxMonthly: 86000,
    credit: {
      inquiry: "KCB 올크레딧 · 2026.08.15 조회",
      score: { kcb: 604, nice: 588, grade: "6등급", trend: "-73 (6개월)" },
      lines: [
        { org: "웰컴저축은행", kind: "신용대출", type: "신용", exec: "2023.03.08", due: "2029.11.07",
          limit: 24000000, bal: 24000000, rate: 11.20, delay: "없음" },
        { org: "토스뱅크", kind: "마이너스통장", type: "신용", exec: "2025.09.14", due: "2026.09.13",
          limit: 10000000, bal: 9800000, rate: 9.40, delay: "없음" },
        { org: "현대캐피탈", kind: "카드론", type: "신용", exec: "2026.06.02", due: "2028.12.01",
          limit: 6100000, bal: 6100000, rate: 15.90, delay: "없음" },
        { org: "신한카드", kind: "카드 결제예정", type: "카드", exec: "—", due: "2026.09.05",
          limit: 5000000, bal: 3400000, rate: 0, delay: "24개월 중 2건" },
      ],
      cards: [
        { org: "신한카드", kind: "신용", limit: 5000000, used: 3400000, revolving: true },
        { org: "롯데카드", kind: "신용", limit: 3000000, used: 2100000, revolving: true },
      ],
      newIn6M: 2, inquiries6M: 9, delayEver: "최근 24개월 연체 2건 (30일 미만)",
      note: "6개월 사이 신규 여신 2건과 조회 9건이 몰렸어요. 한도 소진율이 98%를 넘는 계좌가 있어요.",
      tone: "red",
    },
    spend: {
      months: 24, monthlyAvg: 950000,
      byCat: [
        { k: "식비·마트", v: 248000, trend: -3.2 },
        { k: "교통·차량", v: 104000, trend: +1.1 },
        { k: "의료·건강", v: 38000, trend: 0 },
        { k: "쇼핑·의류", v: 186000, trend: +18.4 },
        { k: "문화·여가", v: 214000, trend: +26.7 },
        { k: "현금서비스·단기카드대출", v: 120000, trend: +41.2 },
        { k: "기타", v: 40000, trend: +5.4 },
      ],
      channels: [{ k: "신용카드", v: 742000 }, { k: "체크카드", v: 88000 }, { k: "계좌이체", v: 120000 }],
      cashAdvance: 120000, revolvingUse: 2,
      flags: [
        "현금서비스·단기카드대출이 월 평균 12만원이에요. 6개월 전보다 41% 늘었어요.",
        "리볼빙을 쓰는 카드가 2장이에요.",
        "소비가 가처분소득을 넘어서 부채로 메우고 있어요.",
      ],
      note: "소비가 가처분소득을 초과해요. 부족분을 카드 단기대출로 메우는 패턴이 반복돼요.",
      tone: "red",
    },
  },

  /* ── 3 · 소득 하락 ───────────────────────────────────────── */
  income_down: {
    costRatio: 0.15,
    taxMonthly: 62000,
    credit: {
      inquiry: "KCB 올크레딧 · 2026.08.15 조회",
      score: { kcb: 731, nice: 719, grade: "4등급", trend: "-38 (6개월)" },
      lines: [
        { org: "신한은행", kind: "전세자금대출", type: "담보", exec: "2024.09.05", due: "2028.09.04",
          limit: 42000000, bal: 42000000, rate: 4.20, delay: "없음" },
        { org: "카카오뱅크", kind: "마이너스통장", type: "신용", exec: "2025.02.11", due: "2027.02.10",
          limit: 8000000, bal: 7400000, rate: 7.10, delay: "없음" },
        { org: "국민카드", kind: "카드론", type: "신용", exec: "2026.06.18", due: "2028.12.17",
          limit: 2000000, bal: 2000000, rate: 14.20, delay: "없음" },
        { org: "국민카드", kind: "카드 결제예정", type: "카드", exec: "—", due: "2026.09.14",
          limit: 4000000, bal: 1260000, rate: 0, delay: "없음" },
      ],
      cards: [
        { org: "국민카드", kind: "신용", limit: 4000000, used: 1260000, revolving: false },
        { org: "토스뱅크", kind: "체크", limit: 0, used: 0, revolving: false },
      ],
      newIn6M: 1, inquiries6M: 4, delayEver: "최근 39개월 연체 0건",
      note: "연체는 없지만 소득이 줄면서 마이너스통장 소진율이 93%까지 올라왔어요.",
      tone: "amber",
    },
    spend: {
      months: 12, monthlyAvg: 1090000,
      byCat: [
        { k: "식비·마트", v: 348000, trend: -8.4 },
        { k: "교통·차량", v: 112000, trend: -12.1 },
        { k: "의료·건강", v: 84000, trend: +2.4 },
        { k: "쇼핑·의류", v: 138000, trend: -31.7 },
        { k: "문화·여가", v: 92000, trend: -28.3 },
        { k: "교육·자기계발", v: 204000, trend: +22.6 },
        { k: "기타", v: 112000, trend: -6.2 },
      ],
      channels: [{ k: "신용카드", v: 574000 }, { k: "체크카드", v: 396000 }, { k: "계좌이체", v: 120000 }],
      cashAdvance: 0, revolvingUse: 0,
      flags: [
        "소득이 줄자 쇼핑·여가를 30% 가까이 줄였어요.",
        "교육·자기계발 지출은 오히려 늘었어요. 직무 전환 준비로 보여요.",
      ],
      note: "소득 감소에 맞춰 소비를 함께 줄였어요. 아직 부채로 메우는 단계는 아니에요.",
      tone: "amber",
    },
  },

  /* ── 4 · 이력 부족 ───────────────────────────────────────── */
  thin_file: {
    costRatio: 0.12,
    taxMonthly: 18000,
    credit: {
      inquiry: "KCB 올크레딧 · 2026.08.15 조회",
      score: { kcb: 668, nice: 651, grade: "5등급", trend: "신용이력 8개월 (평가 유보)" },
      lines: [
        { org: "한국장학재단", kind: "학자금대출", type: "정책", exec: "2019.03.02", due: "2032.02.28",
          limit: 8400000, bal: 8400000, rate: 1.70, delay: "없음" },
        { org: "카카오뱅크", kind: "카드 결제예정", type: "카드", exec: "—", due: "2026.09.10",
          limit: 2000000, bal: 640000, rate: 0, delay: "없음" },
      ],
      cards: [
        { org: "카카오뱅크", kind: "체크", limit: 0, used: 0, revolving: false },
        { org: "카카오뱅크", kind: "신용", limit: 2000000, used: 640000, revolving: false },
      ],
      newIn6M: 1, inquiries6M: 3, delayEver: "연체 이력 없음 (이력 8개월)",
      note: "여신 자체가 적어 평가할 표본이 부족해요. 나쁜 신호가 아니라 '판단 보류'예요.",
      tone: "amber",
    },
    spend: {
      months: 8, monthlyAvg: 640000,
      byCat: [
        { k: "식비·마트", v: 236000, trend: +4.2 },
        { k: "교통·차량", v: 54000, trend: +1.8 },
        { k: "의료·건강", v: 28000, trend: 0 },
        { k: "쇼핑·의류", v: 98000, trend: +7.1 },
        { k: "문화·여가", v: 78000, trend: +3.6 },
        { k: "교육·자기계발", v: 102000, trend: +12.4 },
        { k: "기타", v: 44000, trend: +1.2 },
      ],
      channels: [{ k: "체크카드", v: 448000 }, { k: "신용카드", v: 142000 }, { k: "계좌이체", v: 50000 }],
      cashAdvance: 0, revolvingUse: 0,
      flags: ["관측 기간이 8개월이라 계절성(명절·연말)이 반영되지 않았어요."],
      note: "체크카드 위주로 소비해요. 소득 안에서 쓰고 있지만 관측 기간이 짧아요.",
      tone: "amber",
    },
  },

  /* ── 5 · 부채 과다 ───────────────────────────────────────── */
  high_dsr: {
    costRatio: 0.19,
    taxMonthly: 138000,
    credit: {
      inquiry: "KCB 올크레딧 · 2026.08.15 조회",
      score: { kcb: 776, nice: 764, grade: "3등급", trend: "-9 (6개월)" },
      lines: [
        { org: "KB국민은행", kind: "주택담보대출", type: "담보", exec: "2021.08.30", due: "2047.08.29",
          limit: 184000000, bal: 184000000, rate: 4.60, delay: "없음" },
        { org: "하나은행", kind: "신용대출", type: "신용", exec: "2024.02.19", due: "2029.05.18",
          limit: 38000000, bal: 38000000, rate: 8.90, delay: "없음" },
        { org: "토스뱅크", kind: "마이너스통장", type: "신용", exec: "2025.11.03", due: "2027.11.02",
          limit: 6000000, bal: 4800000, rate: 7.40, delay: "없음" },
        { org: "현대카드", kind: "카드 결제예정", type: "카드", exec: "—", due: "2026.09.12",
          limit: 12000000, bal: 2100000, rate: 0, delay: "없음" },
      ],
      cards: [
        { org: "현대카드", kind: "신용", limit: 12000000, used: 2100000, revolving: false },
        { org: "삼성카드", kind: "신용", limit: 7000000, used: 0, revolving: false },
      ],
      newIn6M: 0, inquiries6M: 1, delayEver: "최근 63개월 연체 0건",
      note: "상환은 한 번도 밀린 적 없어요. 다만 담보·신용 합산 잔액이 연소득의 5.4배예요.",
      tone: "red",
    },
    spend: {
      months: 24, monthlyAvg: 780000,
      byCat: [
        { k: "식비·마트", v: 318000, trend: -1.2 },
        { k: "교통·차량", v: 124000, trend: +0.8 },
        { k: "의료·건강", v: 86000, trend: +3.1 },
        { k: "쇼핑·의류", v: 102000, trend: -4.6 },
        { k: "문화·여가", v: 68000, trend: -7.2 },
        { k: "교육·자기계발", v: 42000, trend: -2.1 },
        { k: "기타", v: 40000, trend: -1.1 },
      ],
      channels: [{ k: "신용카드", v: 512000 }, { k: "체크카드", v: 208000 }, { k: "계좌이체", v: 60000 }],
      cashAdvance: 0, revolvingUse: 0,
      flags: [
        "원리금 부담이 커서 소비를 계속 줄이고 있어요.",
        "여가·교육 지출이 24개월째 감소해요.",
      ],
      note: "소비 자체는 절제돼 있어요. 문제는 소비가 아니라 원리금 부담이에요.",
      tone: "amber",
    },
  },
};
