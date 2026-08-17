import { T } from "./core.js";

/* ════════════════════════════════════════════════════════════════
   본인확인 수단 — 전자서명인증사업자 전체

   정부24·마이데이터에서 쓰이는 간편인증 사업자와 금융기관 자체 인증서,
   범용 인증서를 모두 담았습니다. 심사자료를 만들려면 마이데이터 전송요구가
   필요하고, 그건 본인 인증을 거쳐야만 되니까요.
   ════════════════════════════════════════════════════════════════ */

export const IDP_GROUPS = [
  {
    id: "simple",
    k: "간편인증",
    sub: "앱에서 바로 확인해요. 별도 발급이 필요 없어요.",
    items: [
      { id: "kakao", k: "카카오톡", org: "카카오", bg: "#FEE500", fg: "#3C1E1E", mark: "K" },
      { id: "naver", k: "네이버", org: "네이버", bg: "#03C75A", fg: "#FFFFFF", mark: "N" },
      { id: "pass", k: "PASS", org: "SKT·KT·LG U+", bg: "#5C3EBC", fg: "#FFFFFF", mark: "PASS" },
      { id: "toss", k: "토스", org: "비바리퍼블리카", bg: "#3182F6", fg: "#FFFFFF", mark: "toss" },
      { id: "payco", k: "페이코", org: "NHN페이코", bg: "#FF1E1E", fg: "#FFFFFF", mark: "PAYCO" },
      { id: "samsung", k: "삼성패스", org: "삼성전자", bg: "#1428A0", fg: "#FFFFFF", mark: "S" },
    ],
  },
  {
    id: "bank",
    k: "금융기관 인증서",
    sub: "은행 앱에서 발급받은 인증서로 확인해요.",
    items: [
      { id: "kb", k: "KB모바일인증서", org: "KB국민은행", bg: "#FFCC00", fg: "#4A3B00", mark: "KB" },
      { id: "nh", k: "NH인증서", org: "NH농협은행", bg: "#00A650", fg: "#FFFFFF", mark: "NH" },
      { id: "shinhan", k: "신한 SOL인증서", org: "신한은행", bg: "#0046FF", fg: "#FFFFFF", mark: "신한" },
      { id: "hana", k: "하나인증서", org: "하나은행", bg: "#008C82", fg: "#FFFFFF", mark: "하나" },
      { id: "woori", k: "우리WON인증서", org: "우리은행", bg: "#0067AC", fg: "#FFFFFF", mark: "우리" },
      { id: "ibk", k: "i-ONE인증서", org: "IBK기업은행", bg: "#004C97", fg: "#FFFFFF", mark: "IBK" },
      { id: "kakaobank", k: "카카오뱅크 인증서", org: "카카오뱅크", bg: "#FFE300", fg: "#3C1E1E", mark: "카뱅" },
    ],
  },
  {
    id: "general",
    k: "범용 인증서",
    sub: "금융거래 전반에 쓰는 인증서예요.",
    items: [
      { id: "finance", k: "금융인증서", org: "금융결제원", bg: "#1B2430", fg: "#FFFFFF", mark: "금융", lock: true },
      { id: "joint", k: "공동인증서", org: "구 공인인증서", bg: T.g600, fg: "#FFFFFF", mark: "공동", lock: true },
      { id: "kica", k: "signGATE", org: "한국정보인증", bg: "#1F5FA9", fg: "#FFFFFF", mark: "KICA" },
      { id: "crosscert", k: "CrossCert", org: "한국전자인증", bg: "#2B6CB0", fg: "#FFFFFF", mark: "CC" },
      { id: "dream", k: "Magic인증서", org: "드림시큐리티", bg: "#6E45CF", fg: "#FFFFFF", mark: "DS" },
      { id: "signkorea", k: "SignKorea", org: "코스콤", bg: "#0F4C81", fg: "#FFFFFF", mark: "KSC" },
      { id: "tradesign", k: "TradeSign", org: "한국무역정보통신", bg: "#0B7A5C", fg: "#FFFFFF", mark: "TS" },
    ],
  },
];

export const IDPS = IDP_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.id })));
export const findIdp = (id) => IDPS.find((i) => i.id === id) || IDPS[0];
export const IDP_COUNT = IDPS.length;
