import { T, sum, cv } from "./core.js";
import { FINANCE } from "./finance.js";
import { buildReview } from "./review.js";

/* ════════════════════════════════════════════════════════════════
   테스트 시나리오 데이터

   각 시나리오는 raw 스펙만 선언하고, 합계·변동계수·HHI·DSR·FDS 집계
   같은 파생값은 assemble()이 계산합니다. 그래서 소득 배열만 바꿔도
   리포트 전체 수치가 자동으로 따라 움직입니다.
   ════════════════════════════════════════════════════════════════ */

const FIN_ORGS_FULL = [
  { k: "KB국민은행", n: "입출금 2 · 예적금 3" }, { k: "카카오뱅크", n: "입출금 1 · 적금 1" },
  { k: "토스뱅크", n: "입출금 1" }, { k: "신한카드", n: "신용 1 · 체크 1" },
  { k: "현대카드", n: "신용 1" }, { k: "삼성증권", n: "위탁 1 · CMA 1" },
  { k: "한화손해보험", n: "보장성 2" }, { k: "KCB 올크레딧", n: "신용평점" },
];

const PUB_OK = (income2025, openDate, months) => [
  { k: "주민등록표 등본", org: "행정안전부", res: "세대주 · 세대원 2인 · 2023.04 전입" },
  { k: "가족관계증명서", org: "대법원", res: "배우자 1인 · 부양가족 1인" },
  { k: "건강보험 자격득실확인서", org: "건강보험공단", res: "지역가입 · 유지중" },
  { k: "건강보험료 납부확인서", org: "건강보험공단", res: "24개월 완납 · 체납 0회" },
  { k: "국민연금 가입증명", org: "국민연금공단", res: `지역가입 · ${months}개월 납부` },
  { k: "소득금액증명 (2025)", org: "국세청", res: `사업소득 ${income2025.toLocaleString()}원` },
  { k: "사업자등록증명", org: "국세청", res: `개업 ${openDate} · 계속사업자` },
  { k: "지방세 납세증명서", org: "위택스", res: "체납액 없음" },
];

/* ── 1 · 정상 ───────────────────────────────────────────────────── */
const NORMAL = {
  id: "normal",
  name: "정상 승인",
  short: "기준 케이스",
  tone: "green",
  desc: "51개월 무중단 · 이상거래 없음 · DSR 여유. 모든 지표가 양호한 표준 흐름이에요.",
  me: { name: "김도현", rrn: "900314-1******", phone: "010-4●●●-8●●2",
        addr: "서울 마포구 성미산로 △△", job: "프리랜서 · 개발/디자인", months: 51,
        birth: "1990.03.14", openDate: "2022.04.18" },
  doc: { no: "FIR-2026-0815-8F3C2971", issued: "2026.08.15 14:32", expire: "2026.09.14",
         hash: "9F2A7C41E8B3D06A5C1948FE72B0AD37C4E85901F6B2D8A473C05E6192FA8B4D",
         tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0x4C7A21E9B38F",
         tsaTime: "2026-08-15T05:32:09Z", verify: "verify.income.kr/8F3C2971",
         barcode: "FIR20260815-8F3C2971" },
  hist: [["2025-08",2980000],["2025-09",3410000],["2025-10",3120000],["2025-11",3860000],
         ["2025-12",4210000],["2026-01",2540000],["2026-02",2880000],["2026-03",3350000],
         ["2026-04",3640000],["2026-05",3180000],["2026-06",3720000],["2026-07",3950000]],
  fcst: [["2026-08",3610000],["2026-09",3680000],["2026-10",3540000],["2026-11",3920000],
         ["2026-12",4180000],["2027-01",2980000],["2027-02",3150000],["2027-03",3590000],
         ["2027-04",3760000],["2027-05",3620000],["2027-06",3840000],["2027-07",4020000]],
  band: { lo: 0.09, hi: 0.10, loStep: 0.008, hiStep: 0.010 },
  income2025: 38120000,
  platforms: [
    { name: "위시켓", cat: "개발 외주", amt: 21840000, cnt: 41 },
    { name: "크몽", cat: "디자인·개발", amt: 7460000, cnt: 88 },
    { name: "탈잉·클래스101", cat: "온라인 강의", amt: 4210000, cnt: 132 },
    { name: "Google AdSense", cat: "콘텐츠 수익", amt: 3180000, cnt: 12 },
    { name: "라우드소싱", cat: "공모 디자인", amt: 2470000, cnt: 19 },
    { name: "직거래", cat: "세금계산서", amt: 1680000, cnt: 7 },
  ],
  cwp: { m12: 91.4, m24: 83.7, m36: 76.2, peer: 64.8, rank: "상위 7%" },
  cwpFactors: [
    { k: "일한 기간", v: "51개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 18.2, max: 20 },
    { k: "소득이 끊긴 달", v: "0번", note: "51개월 내내 소득 발생", pt: 21.5, max: 22 },
    { k: "소득이 들쭉날쭉한 정도", v: null, note: "", pt: 14.8, max: 18 },
    { k: "다시 일감을 준 거래처", v: "68.3%", note: "반복 발주처 12곳", pt: 12.1, max: 16 },
    { k: "수입원 분산", v: null, note: "", pt: 9.6, max: 14 },
    { k: "건강보험·연금 납부", v: "51개월 무체납", note: "한 번도 밀린 적 없어요", pt: 15.2, max: 16 },
  ],
  wdiAxes: [
    { k: "꾸준함", s: 92, w: 0.25, d: "한 달 평균 21.4일 일했어요" },
    { k: "납기 지키기", s: 96, w: 0.25, d: "187건 중 180건 제때 납품" },
    { k: "결과물 평가", s: 89, w: 0.15, d: "평점 4.83 / 5.0 · 리뷰 214건" },
    { k: "일하는 리듬", s: 84, w: 0.15, d: "주 5.2일 · 시간대가 일정해요" },
    { k: "연락 응답", s: 81, w: 0.10, d: "제안 응답률 81% · 평균 2.4시간" },
    { k: "분쟁 없음", s: 84, w: 0.10, d: "중도 취소 2건 · 클레임 0건" },
  ],
  wdiNote: "187건 중 180건을 제때 납품했어요. 한 달 평균 21.4일 일했고요.",
  wdiRank: "100명 중 9등",
  fdsRules: [
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
  ],
  fds: { scanned: 4182, months: 24, score: 12,
         headline: "위험한 거래는 없어요", tone: "green" },
  assets: [{ k: "수시입출금", v: 6320000 }, { k: "예·적금", v: 14800000 }, { k: "투자", v: 7350000 }],
  debts: [{ k: "전세자금대출", v: 15000000, note: "연 3.90% · 잔여 18개월" },
          { k: "마이너스통장", v: 3200000, note: "연 6.80% · 한도 500만" },
          { k: "카드 결제예정", v: 1400000, note: "36개월 연체 0건" }],
  fixed: [{ k: "주거·관리비", v: 620000 }, { k: "대출이자", v: 268000 }, { k: "보험", v: 141000 },
          { k: "통신·구독", v: 89000 }, { k: "건강보험료", v: 149000 }, { k: "국민연금", v: 215000 }],
  dsrItems: [
    { k: "전세자금대출 이자", v: 585000, b: "1,500만 × 3.90% · 원금 제외" },
    { k: "마이너스통장", v: 1217600, b: "한도 500만 ÷ 5년 + 이자" },
  ],
  limit: { principal: 28000000, months: 60, rate: "6.5%", monthly: 548000 },
  finOrgs: FIN_ORGS_FULL,
  verdict: {
    grade: "지표 양호", tone: "green",
    title: "심사 지표가 모두 양호해요",
    msg: "소득이 끊긴 달이 없고 이상거래도 없어요. DSR도 규제 상한까지 여유가 있어요. 실제 판단은 금융기관이 해요.",
    flags: [
      { tone: "green", k: "소득 연속성", v: "51개월 무중단" },
      { tone: "green", k: "이상거래", v: "위험 0건" },
      { tone: "green", k: "DSR", v: "상한까지 여유" },
    ],
  },
};

/* ── 2 · 이상거래 감지 ──────────────────────────────────────────── */
const FDS_ALERT = {
  id: "fds_alert",
  name: "이상거래 감지",
  short: "FDS 적중",
  tone: "red",
  desc: "고액 현금인출·순환거래·가장입금이 함께 잡힌 케이스. 위험 2건 + 확인 3건으로 제출이 보류돼요.",
  me: { name: "박선우", rrn: "880921-1******", phone: "010-2●●●-4●●7",
        addr: "인천 연수구 컨벤시아대로 △△", job: "프리랜서 · 개발/영상편집", months: 44,
        birth: "1988.09.21", openDate: "2022.11.02" },
  doc: { no: "FIR-2026-0815-D41B77A2", issued: "2026.08.15 15:08", expire: "2026.09.14",
         hash: "3C81E5B90A47F2D6188C7E304BA9512FD760438E1C95A2B7E0D34F6812AC57B9",
         tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0x91D3F0A2C74E",
         tsaTime: "2026-08-15T06:08:44Z", verify: "verify.income.kr/D41B77A2",
         barcode: "FIR20260815-D41B77A2" },
  /* 가장입금 6건(2,555만)을 이미 제외한 뒤의 소득이에요 */
  hist: [["2025-08",2980000],["2025-09",3120000],["2025-10",2450000],["2025-11",3010000],
         ["2025-12",2870000],["2026-01",1920000],["2026-02",2760000],["2026-03",3340000],
         ["2026-04",3180000],["2026-05",2210000],["2026-06",3050000],["2026-07",3290000]],
  excluded: { cnt: 6, amt: 25550000,
              note: "정산 내역과 매칭되지 않는 대형 입금이에요. 소득에 넣지 않았어요." },
  fcst: [["2026-08",3180000],["2026-09",3240000],["2026-10",3090000],["2026-11",3310000],
         ["2026-12",3420000],["2027-01",2870000],["2027-02",2940000],["2027-03",3150000],
         ["2027-04",3220000],["2027-05",3080000],["2027-06",3260000],["2027-07",3340000]],
  band: { lo: 0.18, hi: 0.19, loStep: 0.012, hiStep: 0.015 },
  income2025: 31400000,
  platforms: [
    { name: "위시켓", cat: "개발 외주", amt: 14860000, cnt: 22 },
    { name: "크몽", cat: "영상 편집", amt: 9240000, cnt: 47 },
    { name: "직거래", cat: "세금계산서 미발행", amt: 7900000, cnt: 9 },
    { name: "라우드소싱", cat: "공모 디자인", amt: 2180000, cnt: 6 },
  ],
  cwp: { m12: 74.2, m24: 63.5, m36: 55.1, peer: 64.8, rank: "상위 38%" },
  cwpFactors: [
    { k: "일한 기간", v: "44개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 16.8, max: 20 },
    { k: "소득이 끊긴 달", v: "0번", note: "44개월 내내 소득 발생", pt: 20.1, max: 22 },
    { k: "소득이 들쭉날쭉한 정도", v: null, note: "", pt: 12.4, max: 18 },
    { k: "다시 일감을 준 거래처", v: "41.2%", note: "반복 발주처 5곳", pt: 7.4, max: 16 },
    { k: "수입원 분산", v: null, note: "", pt: 6.7, max: 14 },
    { k: "건강보험·연금 납부", v: "2개월 체납 이력", note: "2025.11 · 2026.01 지연 납부", pt: 10.8, max: 16 },
  ],
  wdiAxes: [
    { k: "꾸준함", s: 78, w: 0.25, d: "한 달 평균 17.2일 일했어요" },
    { k: "납기 지키기", s: 83, w: 0.25, d: "94건 중 78건 제때 납품" },
    { k: "결과물 평가", s: 76, w: 0.15, d: "평점 4.21 / 5.0 · 리뷰 61건" },
    { k: "일하는 리듬", s: 54, w: 0.15, d: "작업 시간대가 자주 바뀌어요" },
    { k: "연락 응답", s: 62, w: 0.10, d: "제안 응답률 62% · 평균 9.1시간" },
    { k: "분쟁 없음", s: 48, w: 0.10, d: "중도 취소 7건 · 클레임 3건" },
  ],
  wdiNote: "94건 중 78건을 제때 납품했어요. 중도 취소가 7건 있어요.",
  wdiRank: "100명 중 54등",
  fdsRules: [
    { k: "짧은 기간에 큰 현금 인출", st: "위험", n: 7, memo: "입금 당일 900만원 이상을 현금으로 뺀 게 7번이에요. 사용처를 소명해야 해요." },
    { k: "같은 금액이 돌고 도는 거래", st: "위험", n: 4, memo: "같은 금액이 3자 계좌를 거쳐 되돌아온 흐름이 4건 잡혔어요." },
    { k: "새벽 시간대 이체 몰림", st: "확인", n: 14, memo: "02~04시 이체가 14건이에요. 해외 정산으로만 보기에는 금액이 커요." },
    { k: "대포통장 의심 패턴", st: "정상" },
    { k: "소득 대비 과한 카드론", st: "확인", n: 2, memo: "월 소득의 1.8배 카드론을 두 번 썼어요." },
    { k: "빚이 갑자기 늘어남", st: "확인", n: 1, memo: "최근 3개월 사이 대출 잔액이 1,900만원 늘었어요." },
    { k: "도박·불법 가맹점 결제", st: "정상" },
    { k: "명의도용 의심 계좌 개설", st: "정상" },
    { k: "소득처럼 꾸민 입금", st: "위험", n: 6, memo: "정산 내역과 매칭되지 않는 대형 입금 6건이에요. 소득에서 제외했어요." },
    { k: "보험 담보대출 반복", st: "정상" },
    { k: "연체 직전 돌려막기", st: "확인", n: 3, memo: "결제일 직전 타 계좌 이체가 3번 반복돼요." },
    { k: "고위험국 해외 송금", st: "정상" },
  ],
  fds: { scanned: 5140, months: 24, score: 78,
         headline: "위험 거래가 발견됐어요", tone: "red" },
  assets: [{ k: "수시입출금", v: 1840000 }, { k: "예·적금", v: 2200000 }, { k: "투자", v: 640000 }],
  debts: [{ k: "신용대출", v: 24000000, note: "연 11.20% · 잔여 41개월" },
          { k: "마이너스통장", v: 9800000, note: "연 9.40% · 한도 1,000만 (98% 소진)" },
          { k: "카드론", v: 6100000, note: "연 15.90% · 최근 3개월 2회 실행" },
          { k: "카드 결제예정", v: 3400000, note: "24개월 중 연체 2건" }],
  fixed: [{ k: "주거·관리비", v: 880000 }, { k: "대출이자", v: 621000 }, { k: "보험", v: 132000 },
          { k: "통신·구독", v: 104000 }, { k: "건강보험료", v: 168000 }, { k: "국민연금", v: 232000 }],
  dsrItems: [
    { k: "신용대출 원리금", v: 7420000, b: "2,400만 · 연 11.20% · 41개월" },
    { k: "마이너스통장", v: 2921200, b: "한도 1,000만 ÷ 5년 + 이자" },
    { k: "카드론 원리금", v: 2640000, b: "610만 · 연 15.90% · 30개월" },
  ],
  limit: { principal: 0, months: 60, rate: "—", monthly: 0, blocked: true,
           blockMsg: "이상거래 소명 전에는 참고 한도를 계산하지 않아요. 실제 한도는 금융기관이 정해요." },
  finOrgs: FIN_ORGS_FULL,
  verdict: {
    grade: "소명 필요", tone: "red",
    title: "이상거래가 발견돼 소명이 필요해요",
    msg: "고액 현금인출·순환거래·가장입금 3가지가 위험으로 잡혔어요. 소명 없이 제출하면 사실관계를 확인하기 어려워요.",
    flags: [
      { tone: "red", k: "이상거래", v: "위험 3건 · 확인 4건" },
      { tone: "red", k: "가장입금", v: "소득에서 6건 제외" },
      { tone: "amber", k: "부채 증가", v: "3개월간 +1,900만" },
    ],
  },
  blockSubmit: true,
};

/* ── 3 · 소득 하락 ─────────────────────────────────────────────── */
const INCOME_DOWN = {
  id: "income_down",
  name: "소득 하락",
  short: "우하향 추세",
  tone: "amber",
  desc: "12개월간 소득이 3분의 1로 줄어든 케이스. 예측도 우하향이라 한도가 크게 깎여요.",
  me: { name: "이하늘", rrn: "930627-2******", phone: "010-7●●●-1●●5",
        addr: "서울 관악구 봉천로 △△", job: "프리랜서 · 그래픽 디자인", months: 39,
        birth: "1993.06.27", openDate: "2023.02.14" },
  doc: { no: "FIR-2026-0815-6A2E90C4", issued: "2026.08.15 16:21", expire: "2026.09.14",
         hash: "B7409FC2E1A85D3607F4C29B18ED5306A94721FC0B3E8D5A62471C09EF385BD1",
         tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0x2F86B1C405D9",
         tsaTime: "2026-08-15T07:21:33Z", verify: "verify.income.kr/6A2E90C4",
         barcode: "FIR20260815-6A2E90C4" },
  hist: [["2025-08",4820000],["2025-09",4610000],["2025-10",4380000],["2025-11",3950000],
         ["2025-12",3720000],["2026-01",3410000],["2026-02",2980000],["2026-03",2640000],
         ["2026-04",2310000],["2026-05",2050000],["2026-06",1880000],["2026-07",1620000]],
  fcst: [["2026-08",1580000],["2026-09",1520000],["2026-10",1470000],["2026-11",1440000],
         ["2026-12",1390000],["2027-01",1350000],["2027-02",1330000],["2027-03",1300000],
         ["2027-04",1280000],["2027-05",1260000],["2027-06",1240000],["2027-07",1220000]],
  band: { lo: 0.14, hi: 0.13, loStep: 0.011, hiStep: 0.009 },
  income2025: 42600000,
  platforms: [
    { name: "크몽", cat: "디자인 외주", amt: 16940000, cnt: 96 },
    { name: "라우드소싱", cat: "공모 디자인", amt: 9120000, cnt: 34 },
    { name: "직거래", cat: "세금계산서", amt: 6480000, cnt: 14 },
    { name: "노트폴리오", cat: "포트폴리오 의뢰", amt: 3210000, cnt: 11 },
    { name: "Google AdSense", cat: "콘텐츠 수익", amt: 2620000, cnt: 12 },
  ],
  cwp: { m12: 58.3, m24: 44.6, m36: 35.2, peer: 64.8, rank: "하위 42%" },
  cwpFactors: [
    { k: "일한 기간", v: "39개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 13.0, max: 20 },
    { k: "소득이 끊긴 달", v: "0번", note: "금액은 줄었지만 끊기진 않았어요", pt: 14.0, max: 22 },
    { k: "소득이 들쭉날쭉한 정도", v: null, note: "", pt: 6.1, max: 18 },
    { k: "다시 일감을 준 거래처", v: "34.7%", note: "반복 발주처가 11곳에서 4곳으로 줄었어요", pt: 5.8, max: 16 },
    { k: "수입원 분산", v: null, note: "", pt: 6.4, max: 14 },
    { k: "건강보험·연금 납부", v: "39개월 무체납", note: "한 번도 밀린 적 없어요", pt: 13.0, max: 16 },
  ],
  wdiAxes: [
    { k: "꾸준함", s: 61, w: 0.25, d: "한 달 평균 12.8일 · 작년 대비 절반" },
    { k: "납기 지키기", s: 94, w: 0.25, d: "167건 중 158건 제때 납품" },
    { k: "결과물 평가", s: 88, w: 0.15, d: "평점 4.76 / 5.0 · 리뷰 143건" },
    { k: "일하는 리듬", s: 58, w: 0.15, d: "최근 3개월 가동일이 크게 줄었어요" },
    { k: "연락 응답", s: 79, w: 0.10, d: "제안 응답률 79% · 평균 3.1시간" },
    { k: "분쟁 없음", s: 91, w: 0.10, d: "중도 취소 1건 · 클레임 0건" },
  ],
  wdiNote: "일 자체는 성실히 했어요. 다만 최근 3개월 가동일이 절반으로 줄었어요.",
  wdiRank: "100명 중 34등",
  fdsRules: [
    { k: "짧은 기간에 큰 현금 인출", st: "정상" },
    { k: "같은 금액이 돌고 도는 거래", st: "정상" },
    { k: "새벽 시간대 이체 몰림", st: "정상" },
    { k: "대포통장 의심 패턴", st: "정상" },
    { k: "소득 대비 과한 카드론", st: "확인", n: 1, memo: "6월에 월 소득의 1.2배 카드론을 썼어요. 생활비 목적으로 확인됐어요." },
    { k: "빚이 갑자기 늘어남", st: "확인", n: 1, memo: "소득이 줄면서 마이너스통장 사용이 늘었어요." },
    { k: "도박·불법 가맹점 결제", st: "정상" },
    { k: "명의도용 의심 계좌 개설", st: "정상" },
    { k: "소득처럼 꾸민 입금", st: "정상" },
    { k: "보험 담보대출 반복", st: "정상" },
    { k: "연체 직전 돌려막기", st: "정상" },
    { k: "고위험국 해외 송금", st: "정상" },
  ],
  fds: { scanned: 3760, months: 24, score: 24,
         headline: "위험한 거래는 없어요", tone: "green" },
  assets: [{ k: "수시입출금", v: 2140000 }, { k: "예·적금", v: 5600000 }, { k: "투자", v: 1830000 }],
  debts: [{ k: "전세자금대출", v: 42000000, note: "연 4.20% · 잔여 26개월" },
          { k: "마이너스통장", v: 7400000, note: "연 7.10% · 한도 800만 (93% 소진)" },
          { k: "카드론", v: 2000000, note: "연 14.20% · 2026.06 실행" },
          { k: "카드 결제예정", v: 1260000, note: "39개월 연체 0건" }],
  fixed: [{ k: "주거·관리비", v: 710000 }, { k: "대출이자", v: 341000 }, { k: "보험", v: 118000 },
          { k: "통신·구독", v: 76000 }, { k: "건강보험료", v: 131000 }, { k: "국민연금", v: 188000 }],
  dsrItems: [
    { k: "전세자금대출 이자", v: 1764000, b: "4,200만 × 4.20% · 원금 제외" },
    { k: "마이너스통장", v: 2125200, b: "한도 800만 ÷ 5년 + 이자" },
    { k: "카드론 원리금", v: 892000, b: "200만 · 연 14.20% · 30개월" },
  ],
  limit: { principal: 4000000, months: 36, rate: "9.8%", monthly: 129000 },
  finOrgs: FIN_ORGS_FULL,
  verdict: {
    grade: "하락 추세", tone: "amber",
    title: "소득이 계속 줄고 있어요",
    msg: "12개월 사이 월 소득이 482만원에서 162만원으로 줄었어요. 예측도 우하향이라 한도가 크게 깎여요.",
    flags: [
      { tone: "red", k: "소득 추세", v: "12개월간 -66%" },
      { tone: "amber", k: "계속근무가능성", v: "동종 평균 미달" },
      { tone: "green", k: "이상거래", v: "위험 0건" },
    ],
  },
};

/* ── 4 · 이력 부족 ─────────────────────────────────────────────── */
const THIN_FILE = {
  id: "thin_file",
  name: "이력 부족",
  short: "신규 · 8개월",
  tone: "amber",
  desc: "개업 8개월차. 표본이 모자라 일부 지표가 산출되지 않고 예측 구간도 아주 넓어요.",
  me: { name: "정유진", rrn: "990112-2******", phone: "010-9●●●-3●●1",
        addr: "부산 해운대구 센텀중앙로 △△", job: "프리랜서 · 일러스트", months: 8,
        birth: "1999.01.12", openDate: "2025.12.03" },
  doc: { no: "FIR-2026-0815-1E77B305", issued: "2026.08.15 17:44", expire: "2026.09.14",
         hash: "5D138AE0C947B62F8105439CEA76BD21F308E5C94A17B6D250F39C8E4A071BF6",
         tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0x7B45C2E018AF",
         tsaTime: "2026-08-15T08:44:12Z", verify: "verify.income.kr/1E77B305",
         barcode: "FIR20260815-1E77B305" },
  hist: [["2025-12",1240000],["2026-01",980000],["2026-02",1560000],["2026-03",2100000],
         ["2026-04",1780000],["2026-05",2340000],["2026-06",1920000],["2026-07",2480000]],
  fcst: [["2026-08",2210000],["2026-09",2280000],["2026-10",2150000],["2026-11",2340000],
         ["2026-12",2420000],["2027-01",1890000],["2027-02",2010000],["2027-03",2260000],
         ["2027-04",2330000],["2027-05",2270000],["2027-06",2390000],["2027-07",2450000]],
  band: { lo: 0.28, hi: 0.34, loStep: 0.021, hiStep: 0.026 },
  income2025: 3180000,
  platforms: [
    { name: "크몽", cat: "일러스트 외주", amt: 8940000, cnt: 52 },
    { name: "그라폴리오", cat: "커미션", amt: 5460000, cnt: 38 },
  ],
  cwp: { m12: 44.0, m24: 33.8, m36: 27.1, peer: 64.8, rank: "산출 표본 부족", lowConfidence: true },
  cwpFactors: [
    { k: "일한 기간", v: "8개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 5.4, max: 20 },
    { k: "소득이 끊긴 달", v: "0번", note: "8개월 내내 소득 발생", pt: 14.2, max: 22 },
    { k: "소득이 들쭉날쭉한 정도", v: null, note: "", pt: 9.8, max: 18 },
    { k: "다시 일감을 준 거래처", v: "22.4%", note: "반복 발주처 3곳", pt: 3.6, max: 16 },
    { k: "수입원 분산", v: null, note: "", pt: 3.1, max: 14 },
    { k: "건강보험·연금 납부", v: "8개월 무체납", note: "가입 기간 자체가 짧아요", pt: 7.9, max: 16 },
  ],
  wdiAxes: [
    { k: "꾸준함", s: 74, w: 0.25, d: "한 달 평균 15.6일 일했어요" },
    { k: "납기 지키기", s: 91, w: 0.25, d: "90건 중 85건 제때 납품" },
    { k: "결과물 평가", s: 86, w: 0.15, d: "평점 4.71 / 5.0 · 리뷰 44건" },
    { k: "일하는 리듬", s: null, w: 0.15, d: "관측 기간이 짧아 산출하지 않았어요" },
    { k: "연락 응답", s: 88, w: 0.10, d: "제안 응답률 88% · 평균 1.6시간" },
    { k: "분쟁 없음", s: null, w: 0.10, d: "계약 건수가 적어 산출하지 않았어요" },
  ],
  wdiNote: "짧은 기간이지만 납기는 잘 지켰어요. 2개 항목은 표본이 모자라 산출하지 않았어요.",
  wdiRank: "표본 부족",
  fdsRules: [
    { k: "짧은 기간에 큰 현금 인출", st: "정상" },
    { k: "같은 금액이 돌고 도는 거래", st: "정상" },
    { k: "새벽 시간대 이체 몰림", st: "정상" },
    { k: "대포통장 의심 패턴", st: "정상" },
    { k: "소득 대비 과한 카드론", st: "정상" },
    { k: "빚이 갑자기 늘어남", st: "정상" },
    { k: "도박·불법 가맹점 결제", st: "정상" },
    { k: "명의도용 의심 계좌 개설", st: "정상" },
    { k: "소득처럼 꾸민 입금", st: "확인", n: 2, memo: "부모님 생활비 이체예요. 소득에서 빼고 계산했어요." },
    { k: "보험 담보대출 반복", st: "정상" },
    { k: "연체 직전 돌려막기", st: "정상" },
    { k: "고위험국 해외 송금", st: "정상" },
  ],
  fds: { scanned: 890, months: 8, score: 9,
         headline: "위험한 거래는 없어요", tone: "green" },
  assets: [{ k: "수시입출금", v: 1980000 }, { k: "예·적금", v: 3200000 }, { k: "투자", v: 0 }],
  debts: [{ k: "학자금대출", v: 8400000, note: "연 1.70% · 거치 중" },
          { k: "카드 결제예정", v: 640000, note: "8개월 연체 0건" }],
  fixed: [{ k: "주거·관리비", v: 540000 }, { k: "대출이자", v: 12000 }, { k: "보험", v: 64000 },
          { k: "통신·구독", v: 71000 }, { k: "건강보험료", v: 82000 }, { k: "국민연금", v: 96000 }],
  dsrItems: [
    { k: "학자금대출", v: 143000, b: "840만 · 연 1.70% · 거치 중 이자만" },
  ],
  limit: { principal: 6000000, months: 36, rate: "8.9%", monthly: 191000 },
  finOrgs: FIN_ORGS_FULL.slice(0, 5),
  pubDocsOverride: [
    { k: "주민등록표 등본", org: "행정안전부", res: "세대주 · 1인 세대 · 2025.11 전입" },
    { k: "가족관계증명서", org: "대법원", res: "부양가족 없음" },
    { k: "건강보험 자격득실확인서", org: "건강보험공단", res: "지역가입 · 2025.12 취득" },
    { k: "건강보험료 납부확인서", org: "건강보험공단", res: "8개월 완납 · 체납 0회" },
    { k: "국민연금 가입증명", org: "국민연금공단", res: "지역가입 · 8개월 납부" },
    { k: "소득금액증명 (2025)", org: "국세청", res: "사업소득 3,180,000원 (개업 1개월분)" },
    { k: "사업자등록증명", org: "국세청", res: "개업 2025.12.03 · 계속사업자" },
    { k: "지방세 납세증명서", org: "위택스", res: "체납액 없음" },
  ],
  dataGaps: [
    "소득 이력이 8개월이라 12개월 기준 지표는 추정값이에요.",
    "'일하는 리듬'과 '분쟁 없음'은 표본이 모자라 산출하지 않았어요.",
    "2025년 소득금액증명이 개업 1개월분이라 연소득 비교가 어려워요.",
    "예측 구간이 ±30% 수준으로 넓어요. 보수적 값으로 보셔야 해요.",
  ],
  verdict: {
    grade: "자료 부족", tone: "amber",
    title: "판단할 자료가 아직 모자라요",
    msg: "개업 8개월차라 12개월 기준 지표 대부분이 추정값이에요. 6개월 뒤 다시 발급하면 정확도가 올라가요.",
    flags: [
      { tone: "amber", k: "소득 이력", v: "8개월 (기준 12개월)" },
      { tone: "amber", k: "산출 불가 지표", v: "2개 항목" },
      { tone: "green", k: "이상거래", v: "위험 0건" },
    ],
  },
};

/* ── 5 · 부채 과다 ─────────────────────────────────────────────── */
const HIGH_DSR = {
  id: "high_dsr",
  name: "부채 과다",
  short: "DSR 초과",
  tone: "red",
  desc: "소득은 안정적인데 기존 대출 원리금이 연소득의 절반을 넘어요. 추가 한도가 0으로 계산돼요.",
  me: { name: "최민재", rrn: "850508-1******", phone: "010-3●●●-6●●9",
        addr: "경기 성남시 분당구 판교로 △△", job: "프리랜서 · 영상/마케팅", months: 63,
        birth: "1985.05.08", openDate: "2021.05.20" },
  doc: { no: "FIR-2026-0815-9C05E4D8", issued: "2026.08.15 18:02", expire: "2026.09.14",
         hash: "A61C0FB74E2D9385107AC6E4B2091FD53C874E0A6B31D9F27508CE1A4B36D2F0",
         tsa: "한국정보인증 TSA · RFC 3161", tsaSerial: "0xE30A97C15B24",
         tsaTime: "2026-08-15T09:02:57Z", verify: "verify.income.kr/9C05E4D8",
         barcode: "FIR20260815-9C05E4D8" },
  hist: [["2025-08",3480000],["2025-09",3620000],["2025-10",3390000],["2025-11",3710000],
         ["2025-12",3940000],["2026-01",3120000],["2026-02",3280000],["2026-03",3550000],
         ["2026-04",3680000],["2026-05",3430000],["2026-06",3760000],["2026-07",3610000]],
  fcst: [["2026-08",3580000],["2026-09",3640000],["2026-10",3510000],["2026-11",3700000],
         ["2026-12",3880000],["2027-01",3180000],["2027-02",3300000],["2027-03",3540000],
         ["2027-04",3660000],["2027-05",3480000],["2027-06",3720000],["2027-07",3630000]],
  band: { lo: 0.08, hi: 0.09, loStep: 0.006, hiStep: 0.008 },
  income2025: 41800000,
  platforms: [
    { name: "위시켓", cat: "영상 제작", amt: 18420000, cnt: 27 },
    { name: "직거래", cat: "세금계산서", amt: 12960000, cnt: 31 },
    { name: "크몽", cat: "마케팅 대행", amt: 6180000, cnt: 44 },
    { name: "Google AdSense", cat: "콘텐츠 수익", amt: 2980000, cnt: 12 },
    { name: "탈잉·클래스101", cat: "온라인 강의", amt: 2030000, cnt: 58 },
  ],
  cwp: { m12: 88.6, m24: 80.1, m36: 72.4, peer: 64.8, rank: "상위 12%" },
  cwpFactors: [
    { k: "일한 기간", v: "63개월", note: "같은 일 하는 사람 중앙값 19개월", pt: 19.1, max: 20 },
    { k: "소득이 끊긴 달", v: "0번", note: "63개월 내내 소득 발생", pt: 21.2, max: 22 },
    { k: "소득이 들쭉날쭉한 정도", v: null, note: "", pt: 13.1, max: 18 },
    { k: "다시 일감을 준 거래처", v: "71.9%", note: "반복 발주처 16곳", pt: 12.2, max: 16 },
    { k: "수입원 분산", v: null, note: "", pt: 7.6, max: 14 },
    { k: "건강보험·연금 납부", v: "63개월 무체납", note: "한 번도 밀린 적 없어요", pt: 15.4, max: 16 },
  ],
  wdiAxes: [
    { k: "꾸준함", s: 90, w: 0.25, d: "한 달 평균 20.8일 일했어요" },
    { k: "납기 지키기", s: 93, w: 0.25, d: "172건 중 163건 제때 납품" },
    { k: "결과물 평가", s: 87, w: 0.15, d: "평점 4.68 / 5.0 · 리뷰 188건" },
    { k: "일하는 리듬", s: 86, w: 0.15, d: "주 5.0일 · 시간대가 일정해요" },
    { k: "연락 응답", s: 84, w: 0.10, d: "제안 응답률 84% · 평균 2.1시간" },
    { k: "분쟁 없음", s: 89, w: 0.10, d: "중도 취소 1건 · 클레임 0건" },
  ],
  wdiNote: "172건 중 163건을 제때 납품했어요. 일하는 태도만 보면 상위권이에요.",
  wdiRank: "100명 중 13등",
  fdsRules: [
    { k: "짧은 기간에 큰 현금 인출", st: "정상" },
    { k: "같은 금액이 돌고 도는 거래", st: "정상" },
    { k: "새벽 시간대 이체 몰림", st: "정상" },
    { k: "대포통장 의심 패턴", st: "정상" },
    { k: "소득 대비 과한 카드론", st: "확인", n: 2, memo: "주택담보대출 이자 납입을 위해 두 번 썼어요." },
    { k: "빚이 갑자기 늘어남", st: "정상" },
    { k: "도박·불법 가맹점 결제", st: "정상" },
    { k: "명의도용 의심 계좌 개설", st: "정상" },
    { k: "소득처럼 꾸민 입금", st: "정상" },
    { k: "보험 담보대출 반복", st: "확인", n: 1, memo: "보장성 보험 담보대출을 1회 실행했어요." },
    { k: "연체 직전 돌려막기", st: "정상" },
    { k: "고위험국 해외 송금", st: "정상" },
  ],
  fds: { scanned: 4610, months: 24, score: 31,
         headline: "위험한 거래는 없어요", tone: "green" },
  assets: [{ k: "수시입출금", v: 3410000 }, { k: "예·적금", v: 8900000 }, { k: "투자", v: 4260000 }],
  debts: [{ k: "주택담보대출", v: 184000000, note: "연 4.60% · 잔여 21년" },
          { k: "신용대출", v: 38000000, note: "연 8.90% · 잔여 33개월" },
          { k: "마이너스통장", v: 4800000, note: "연 7.40% · 한도 600만" },
          { k: "카드 결제예정", v: 2100000, note: "63개월 연체 0건" }],
  fixed: [{ k: "주거·관리비", v: 410000 }, { k: "대출이자", v: 1287000 }, { k: "보험", v: 214000 },
          { k: "통신·구독", v: 98000 }, { k: "건강보험료", v: 176000 }, { k: "국민연금", v: 241000 }],
  dsrItems: [
    { k: "주택담보대출 원리금", v: 13920000, b: "1억 8,400만 · 연 4.60% · 21년 원리금균등" },
    { k: "신용대출 원리금", v: 15240000, b: "3,800만 · 연 8.90% · 33개월" },
    { k: "마이너스통장", v: 1644000, b: "한도 600만 ÷ 5년 + 이자" },
  ],
  limit: { principal: 0, months: 60, rate: "—", monthly: 0, blocked: true,
           blockMsg: "DSR이 규제 상한을 넘어 참고 한도를 산출하지 않아요. 실제 판단은 금융기관이 해요." },
  finOrgs: FIN_ORGS_FULL,
  verdict: {
    grade: "상환부담 과다", tone: "red",
    title: "이미 갚을 돈이 소득보다 많아요",
    msg: "소득과 성실도는 좋지만, 기존 대출 원리금이 연소득의 절반을 넘어요. 규제 기준선 대비 여력이 남지 않은 상태예요.",
    flags: [
      { tone: "green", k: "소득 안정성", v: "63개월 무중단" },
      { tone: "red", k: "DSR", v: "규제 상한 40% 초과" },
      { tone: "red", k: "규제 기준 여력", v: "없음" },
    ],
  },
};

const RAW = [NORMAL, FDS_ALERT, INCOME_DOWN, THIN_FILE, HIGH_DSR];

/* ════════════════════════════════════════════════════════════════
   파생값 계산
   ════════════════════════════════════════════════════════════════ */
function assemble(s) {
  const HIST = s.hist, FCST = s.fcst;
  const HIST_SUM = sum(HIST.map((h) => h[1]));
  const HIST_AVG = Math.round(HIST_SUM / HIST.length);
  const FCST_SUM = sum(FCST.map((f) => f[1]));
  const FCST_AVG = Math.round(FCST_SUM / FCST.length);
  const CV = cv(HIST.map((h) => h[1]));

  const BAND = FCST.map(([ym, v], i) => ({
    ym, p50: v,
    p10: Math.round(v * (1 - s.band.lo - i * s.band.loStep)),
    p90: Math.round(v * (1 + s.band.hi + i * s.band.hiStep)),
  }));
  const P10_SUM = sum(BAND.map((b) => b.p10));
  const P90_SUM = sum(BAND.map((b) => b.p90));

  const PLATFORM_SUM = sum(s.platforms.map((p) => p.amt));
  const HHI = sum(s.platforms.map((p) => (p.amt / PLATFORM_SUM) ** 2));
  const TOP_SHARE = +((Math.max(...s.platforms.map((p) => p.amt)) / PLATFORM_SUM) * 100).toFixed(1);

  /* 계속근무 요인표에서 계산값 자리(null)를 채웁니다.
     변동성·분산은 실제 계산값에서 뽑아야 설명과 수치가 어긋나지 않아요 */
  const CWP_FACTORS = s.cwpFactors.map((f) => {
    if (f.v !== null) return f;
    if (f.k.includes("들쭉날쭉")) {
      return { ...f, v: `${CV.toFixed(1)}%`,
        note: CV < 25 ? "25%보다 낮으면 안정적이에요" : "안정 기준 25%를 넘었어요" };
    }
    if (f.k.includes("분산")) {
      return { ...f, v: HHI.toFixed(3),
        note: `${s.platforms.length}개 채널, 가장 큰 곳이 ${TOP_SHARE}%예요` };
    }
    return { ...f, v: "—" };
  });
  /* 총점은 항목 합계로만 만듭니다 — 상세 시트의 합계와 카드 숫자가 갈라질 수 없게 */
  const CWP = { ...s.cwp, m12: +sum(CWP_FACTORS.map((f) => f.pt)).toFixed(1) };

  /* 성실도 — 산출 불가(null) 축은 빼고 가중치를 다시 정규화 */
  const live = s.wdiAxes.filter((a) => a.s != null);
  const wsum = sum(live.map((a) => a.w));
  const WDI = wsum ? +(sum(live.map((a) => a.s * a.w)) / wsum).toFixed(1) : 0;

  const fdsCounts = {
    ok: s.fdsRules.filter((r) => r.st === "정상").length,
    caution: s.fdsRules.filter((r) => r.st === "확인").length,
    alert: s.fdsRules.filter((r) => r.st === "위험").length,
  };
  const FDS = { ...s.fds, ...fdsCounts, rules: s.fdsRules.length };
  const FDS_HITS = s.fdsRules.filter((r) => r.st !== "정상");

  /* ── 여신 · 소비 · 가처분소득 ─────────────────────────────── */
  const F = FINANCE[s.id] || {};
  const CREDIT = F.credit || null;
  const SPEND = F.spend || null;

  /* 부채는 여신 라인에서 파생 — 잔액이 두 군데에 따로 적히지 않게 */
  const DEBTS = CREDIT
    ? CREDIT.lines.map((l) => ({
        k: l.kind, v: l.bal,
        note: l.rate ? `${l.org} · 연 ${l.rate.toFixed(2)}%` : `${l.org} · 결제예정`,
      }))
    : s.debts;

  const ASSET_SUM = sum(s.assets.map((a) => a.v));
  const DEBT_SUM = sum(DEBTS.map((d) => d.v));
  const FIXED_SUM = sum(s.fixed.map((f) => f.v));
  const DSR_BASE = sum(s.dsrItems.map((d) => d.v));

  /* 여신 요약 — 잔액가중 평균금리, 한도 소진율 */
  let CREDIT_SUM = null;
  if (CREDIT) {
    const interestBearing = CREDIT.lines.filter((l) => l.rate > 0);
    const ibBal = sum(interestBearing.map((l) => l.bal));
    const cardLimit = sum(CREDIT.cards.map((c) => c.limit));
    const cardUsed = sum(CREDIT.cards.map((c) => c.used));
    CREDIT_SUM = {
      lines: CREDIT.lines.length,
      orgs: new Set(CREDIT.lines.map((l) => l.org)).size,
      totalBal: sum(CREDIT.lines.map((l) => l.bal)),
      totalLimit: sum(CREDIT.lines.map((l) => l.limit)),
      wRate: ibBal ? +(sum(interestBearing.map((l) => l.bal * l.rate)) / ibBal).toFixed(2) : 0,
      cardLimit, cardUsed,
      cardUse: cardLimit ? +((cardUsed / cardLimit) * 100).toFixed(1) : 0,
      toIncome: +(sum(CREDIT.lines.map((l) => l.bal)) / HIST_SUM).toFixed(1), // 연소득 대비 배수
      revolving: CREDIT.cards.filter((c) => c.revolving).length,
    };
  }

  /* 가처분소득 폭포 — 겹치는 항목을 걷어냅니다.
     사회보험료는 가처분 위 단계로, 대출이자는 원리금(DSR)에 이미 들어가므로
     생활 고정비에서 뺍니다. 안 그러면 이자가 두 번 차감돼요. */
  const socialSum = sum(s.fixed.filter((f) => /건강보험|국민연금/.test(f.k)).map((f) => f.v));
  const fixedExSocial = sum(s.fixed.filter((f) => !/건강보험|국민연금|대출이자/.test(f.k)).map((f) => f.v));
  const gross = HIST_AVG;
  const bizCost = Math.round(gross * (F.costRatio ?? 0));
  const taxM = F.taxMonthly ?? 0;
  const disposable = gross - bizCost - taxM - socialSum;
  const debtMonthly = Math.round(DSR_BASE / 12);
  const spendAvg = SPEND ? SPEND.monthlyAvg : 0;
  const surplus = disposable - fixedExSocial - debtMonthly - spendAvg;

  const CASH = {
    gross, bizCost, tax: taxM, social: socialSum, disposable,
    fixed: fixedExSocial, debt: debtMonthly, spend: spendAvg, surplus,
    costRatio: F.costRatio ?? 0,
    /* 가처분소득 대비 부담률 — 심사에서 실제로 보는 값 */
    debtRatio: disposable ? +((debtMonthly / disposable) * 100).toFixed(1) : 0,
    spendRatio: disposable ? +((spendAvg / disposable) * 100).toFixed(1) : 0,
    savingRate: disposable ? +((surplus / disposable) * 100).toFixed(1) : 0,
    deficit: surplus < 0,
  };

  const capacity = Math.max(0, Math.round((HIST_AVG - FIXED_SUM) * 0.4));
  const dsr = +((DSR_BASE / HIST_SUM) * 100).toFixed(1);
  const dsrAfter = +(((DSR_BASE + s.limit.monthly * 12) / HIST_SUM) * 100).toFixed(1);
  const LIMIT = { ...s.limit, capacity, dsr, dsrAfter, over: dsr >= 40 };

  const PUB_DOCS = s.pubDocsOverride || PUB_OK(s.income2025, s.me.openDate, s.me.months);
  const SETTLE_CNT = sum(s.platforms.map((p) => p.cnt));
  const ORG_TOTAL = s.finOrgs.length + PUB_DOCS.length + s.platforms.length;

  const out = {
    /* 시나리오 메타 */
    id: s.id, name: s.name, short: s.short, tone: s.tone, desc: s.desc,
    verdict: s.verdict, dataGaps: s.dataGaps || null, blockSubmit: !!s.blockSubmit,
    EXCLUDED: s.excluded || null,

    ME: s.me, DOC: s.doc,
    HIST, FCST, HIST_SUM, HIST_AVG, FCST_SUM, FCST_AVG, CV,
    BAND, P10_SUM, P90_SUM,
    PLATFORMS: s.platforms, PLATFORM_SUM, HHI, TOP_SHARE,
    CWP, CWP_FACTORS,
    WDI_AXES: s.wdiAxes, WDI, WDI_NOTE: s.wdiNote, WDI_RANK: s.wdiRank,
    FDS_RULES: s.fdsRules, FDS, FDS_HITS,
    ASSETS: s.assets, DEBTS, FIXED: s.fixed,
    ASSET_SUM, DEBT_SUM, FIXED_SUM,
    CREDIT, CREDIT_SUM, SPEND, CASH,
    DSR_ITEMS: s.dsrItems, DSR_BASE, LIMIT,
    FIN_ORGS: s.finOrgs, PUB_DOCS,
    INCOME_2025: s.income2025,
    SETTLE_CNT, ORG_TOTAL,
  };

  /* 심사 참고 정보는 완성된 데이터에서 파생시킵니다 */
  out.REVIEW = buildReview(out);
  return out;
}

/* 선택 화면에 뿌릴 요약 카드용 목록 */
export const SCENARIOS = RAW.map((s) => ({
  id: s.id, name: s.name, short: s.short, tone: s.tone, desc: s.desc,
  who: `${s.me.name} · ${s.me.job.replace("프리랜서 · ", "")} · ${s.me.months}개월`,
  grade: s.verdict.grade,
}));

const CACHE = {};
export function getData(id) {
  const found = RAW.find((s) => s.id === id) || RAW[0];
  if (!CACHE[found.id]) CACHE[found.id] = assemble(found);
  return CACHE[found.id];
}

export const DEFAULT_SCENARIO = RAW[0].id;
export const TONE_COLOR = (tone) => ({
  green: T.green, amber: T.amber, red: T.red, blue: T.blue,
}[tone] || T.g600);
