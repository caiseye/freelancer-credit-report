import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* GitHub Pages 프로젝트 사이트는 /<레포명>/ 하위에 배포돼요.
   로컬 dev에서는 루트여야 하니 빌드일 때만 base를 붙입니다. */
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/freelancer-credit-report/" : "/",
  server: { host: "127.0.0.1", port: 5173, open: false },
}));
