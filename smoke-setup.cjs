// 브라우저 전역 최소 스텁 — useState 초기화 함수가 window를 읽습니다
globalThis.window = {
  innerWidth: 1280,
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  addEventListener(){}, removeEventListener(){},
  location: { hash: "" },
  scrollTo(){}, print(){},
};
globalThis.requestAnimationFrame = (cb) => 0;
globalThis.cancelAnimationFrame = () => {};
