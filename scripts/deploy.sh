#!/usr/bin/env bash
# GitHub Pages 배포 — 빌드 결과를 gh-pages 브랜치로 올립니다.
#
# Actions 워크플로를 쓰지 않는 이유: .github/workflows/ 를 push하려면
# 토큰에 workflow 스코프가 필요해요. 이 방식은 repo 스코프만으로 됩니다.
# 나중에 자동 배포로 바꾸고 싶으면 README의 '자동 배포로 전환' 참고.
set -e
cd "$(dirname "$0")/.."

echo "▸ 빌드"
npm run build

echo "▸ gh-pages 워크트리 준비"
rm -rf .deploy
git worktree prune
if git show-ref --quiet refs/heads/gh-pages; then
  git worktree add -f .deploy gh-pages
else
  git worktree add -f -b gh-pages .deploy
fi

echo "▸ 산출물 복사"
find .deploy -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R dist/. .deploy/
touch .deploy/.nojekyll   # _로 시작하는 파일이 무시되지 않게

echo "▸ 커밋 · 푸시"
cd .deploy
git add -A
if git diff --cached --quiet; then
  echo "  변경 없음 — 건너뜀"
else
  git commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
fi
git push -q origin gh-pages
cd ..

git worktree remove .deploy --force
echo "▸ 완료"
