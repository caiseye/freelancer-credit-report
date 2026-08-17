/* ════════════════════════════════════════════════════════════════
   제출 가능 금융기관

   여신을 취급하는 기관을 업권별로 담았습니다. 목록이 길어지면
   고르기가 더 어려워지니, 화면에서는 업권 필터 + 격자 타일로 묶고
   스크롤 영역 높이를 고정해서 시트가 늘어나지 않게 했어요.
   ════════════════════════════════════════════════════════════════ */

export const BANK_CATS = [
  { id: "main", k: "시중은행" },
  { id: "net", k: "인터넷은행" },
  { id: "local", k: "지방은행" },
  { id: "savings", k: "저축은행" },
  { id: "card", k: "카드·캐피탈" },
  { id: "policy", k: "정책금융" },
];

/* feat: 첫 화면에 먼저 보여주는 주요 제출처 */
export const BANKS = [
  /* ── 시중은행 ── */
  { id: "hana", k: "하나은행", t: "개인여신", cat: "main", feat: true, bg: "#008C82", fg: "#FFFFFF", m: "하나" },
  { id: "shinhan", k: "신한은행", t: "개인여신센터", cat: "main", feat: true, bg: "#0046FF", fg: "#FFFFFF", m: "신한" },
  { id: "kb", k: "KB국민은행", t: "여신심사부", cat: "main", bg: "#FFCC00", fg: "#4A3B00", m: "KB" },
  { id: "woori", k: "우리은행", t: "개인여신", cat: "main", bg: "#0067AC", fg: "#FFFFFF", m: "우리" },
  { id: "nh", k: "NH농협은행", t: "개인여신", cat: "main", bg: "#00A650", fg: "#FFFFFF", m: "NH" },
  { id: "ibk", k: "IBK기업은행", t: "개인·소호여신", cat: "main", bg: "#004C97", fg: "#FFFFFF", m: "IBK" },
  { id: "sc", k: "SC제일은행", t: "개인여신", cat: "main", bg: "#0B7A5C", fg: "#FFFFFF", m: "SC" },
  { id: "citi", k: "한국씨티은행", t: "개인여신", cat: "main", bg: "#003B70", fg: "#FFFFFF", m: "Citi" },

  /* ── 인터넷전문은행 ── */
  { id: "kakaobank", k: "카카오뱅크", t: "비대면 심사", cat: "net", feat: true, bg: "#FFE300", fg: "#3C1E1E", m: "카뱅" },
  { id: "kbank", k: "케이뱅크", t: "비대면 신용대출", cat: "net", bg: "#1B3A8C", fg: "#FFFFFF", m: "케뱅" },
  { id: "tossbank", k: "토스뱅크", t: "비대면 심사", cat: "net", bg: "#3182F6", fg: "#FFFFFF", m: "toss" },

  /* ── 지방은행 ── */
  { id: "busan", k: "부산은행", t: "개인여신", cat: "local", bg: "#C8102E", fg: "#FFFFFF", m: "부산" },
  { id: "kyongnam", k: "경남은행", t: "개인여신", cat: "local", bg: "#0072BC", fg: "#FFFFFF", m: "경남" },
  { id: "im", k: "iM뱅크", t: "개인여신", cat: "local", bg: "#005BAC", fg: "#FFFFFF", m: "iM" },
  { id: "kwangju", k: "광주은행", t: "개인여신", cat: "local", bg: "#005BAB", fg: "#FFFFFF", m: "광주" },
  { id: "jeonbuk", k: "전북은행", t: "개인여신", cat: "local", bg: "#00857C", fg: "#FFFFFF", m: "전북" },
  { id: "jeju", k: "제주은행", t: "개인여신", cat: "local", bg: "#0067B1", fg: "#FFFFFF", m: "제주" },

  /* ── 저축은행 ── */
  { id: "sbi", k: "SBI저축은행", t: "개인신용대출", cat: "savings", bg: "#003E7E", fg: "#FFFFFF", m: "SBI" },
  { id: "ok", k: "OK저축은행", t: "개인신용대출", cat: "savings", bg: "#FF6600", fg: "#FFFFFF", m: "OK" },
  { id: "welcome", k: "웰컴저축은행", t: "개인신용대출", cat: "savings", bg: "#E8590C", fg: "#FFFFFF", m: "웰컴" },
  { id: "pepper", k: "페퍼저축은행", t: "개인신용대출", cat: "savings", bg: "#E03131", fg: "#FFFFFF", m: "페퍼" },
  { id: "koreainv", k: "한국투자저축은행", t: "개인신용대출", cat: "savings", bg: "#C8102E", fg: "#FFFFFF", m: "한투" },

  /* ── 카드·캐피탈 ── */
  { id: "shinhancard", k: "신한카드", t: "장기카드대출", cat: "card", bg: "#1B4FD8", fg: "#FFFFFF", m: "신한" },
  { id: "samsungcard", k: "삼성카드", t: "장기카드대출", cat: "card", bg: "#1428A0", fg: "#FFFFFF", m: "삼성" },
  { id: "lottecard", k: "롯데카드", t: "장기카드대출", cat: "card", bg: "#DA291C", fg: "#FFFFFF", m: "롯데" },
  { id: "hyundaicap", k: "현대캐피탈", t: "개인금융", cat: "card", bg: "#26282B", fg: "#FFFFFF", m: "HC" },
  { id: "kbcap", k: "KB캐피탈", t: "개인금융", cat: "card", bg: "#E8B400", fg: "#3A2E00", m: "KB캐" },

  /* ── 정책금융 ── */
  { id: "kinfa", k: "서민금융진흥원", t: "햇살론뱅크", cat: "policy", bg: "#0B7A5C", fg: "#FFFFFF", m: "햇살" },
  { id: "hf", k: "한국주택금융공사", t: "보금자리·전세보증", cat: "policy", bg: "#00558F", fg: "#FFFFFF", m: "HF" },
  { id: "semas", k: "소상공인시장진흥공단", t: "정책자금", cat: "policy", bg: "#2B6CB0", fg: "#FFFFFF", m: "소진공" },
  { id: "koreg", k: "지역신용보증재단", t: "보증부 대출", cat: "policy", bg: "#1F5FA9", fg: "#FFFFFF", m: "신보" },
];

export const FEATURED = BANKS.filter((b) => b.feat);
export const BANK_COUNT = BANKS.length;
export const findBank = (id) => BANKS.find((b) => b.id === id);
export const catName = (id) => (BANK_CATS.find((c) => c.id === id) || {}).k || "";
