# Thor Promotion Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time Thor Ambassador promotion modal on first entry to `/dice-event`, with 5-second forced exposure and env-flag operational toggle.

**Architecture:** New React component `ThorPromoModal` using `@radix-ui/react-dialog` primitives directly (bypassing the wrapper's built-in close button to control countdown). Mounted in `DiceEvent` page. Display gated by `VITE_THOR_PROMO_ENABLED` env + `localStorage` flag. Image assets already in `src/shared/assets/images/`.

**Tech Stack:** React 18, TypeScript, Vite 5, `@radix-ui/react-dialog`, `@line/liff` (for openWindow detection), Tailwind CSS.

**Spec:** [docs/superpowers/specs/2026-06-05-thor-promo-modal-design.md](../specs/2026-06-05-thor-promo-modal-design.md)

**Branch:** `feature/thor-promo-modal` (already created)

---

## File Structure

| Path | Status | Responsibility |
|---|---|---|
| `src/vite-env.d.ts` | modify | env 타입 선언 추가 (`VITE_THOR_PROMO_ENABLED`) |
| `.env` | modify | 로컬 빌드용 env 값 (`true`) |
| `src/widgets/ThorPromoModal/ThorPromoModal.tsx` | **new** | 모달 컴포넌트 본체 (~150 lines) |
| `src/widgets/ThorPromoModal/index.ts` | **new** | re-export (1 line) |
| `src/pages/DiceEvent/index.tsx` | modify | import + JSX 한 줄 마운트 |
| `.github/workflows/frontend-deploy.yml` | modify | Build step env 한 줄 추가 |
| `src/shared/assets/images/sl-watch.png` | new (untracked) | git add 필요 |
| `src/shared/assets/images/giftbox-icon.png` | new (untracked) | git add 필요 |
| `src/shared/assets/images/coins-icon.png` | new (untracked) | git add 필요 |

**Verification approach:** 이 프로젝트엔 테스트 프레임워크 미설정. **TypeScript 컴파일 (`tsc`) + `vite build` + 수동 브라우저 검증** 으로 verification.

**Note about sl-logo.png:** untracked 로 있는 `sl-logo.png` 는 이번 spec 에 명시 안 됨. 이번 PR 에 포함 X. 추후 THOR 로고 PNG 받아 ⚡ emoji 교체 시 별도 처리.

---

## Task 1: Add VITE_THOR_PROMO_ENABLED to env type definitions

**Files:**
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: 현재 파일 읽기 확인** (5초)

`src/vite-env.d.ts` 가 다음과 같은지 확인:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: VITE_THOR_PROMO_ENABLED 추가**

`VITE_LIFF_ID` 다음 줄에 추가:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID: string;
  readonly VITE_THOR_PROMO_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 3: 컴파일 검증 (의존 파일 영향 없는지)**

`npx tsc --noEmit 2>&1 | head -20` 실행.
Expected: 변경 없이 컴파일 성공 (또는 기존 에러가 추가되지 않음).

- [ ] **Step 4: 커밋 X (Task 5 까지 묶어서)**

이 단계는 단독 commit 안 함. Task 5 까지 진행 후 컴포넌트와 같이 커밋.

---

## Task 2: Add VITE_THOR_PROMO_ENABLED to .env

**Files:**
- Modify: `.env`

- [ ] **Step 1: 현재 .env 확인**

`cat .env` 또는 Read tool 로 확인:
```
VITE_API_BASE_URL=https://luckydice.savethelife.io/api
VITE_LIFF_ID=2006791189-V9zJ23LN
VITE_LINE_CLIENT_ID=2006791189
```

- [ ] **Step 2: 끝에 한 줄 추가**

```
VITE_API_BASE_URL=https://luckydice.savethelife.io/api
VITE_LIFF_ID=2006791189-V9zJ23LN
VITE_LINE_CLIENT_ID=2006791189
VITE_THOR_PROMO_ENABLED=true
```

- [ ] **Step 3: gitignore 검증**

`git status --short | grep -E "\.env$"` 실행.
Expected: 결과 없음 (이미 [.gitignore:14](.gitignore#L14) 에 의해 무시됨).

`.env` 가 commit 대상에 들어가면 안 됨.

---

## Task 3: Create ThorPromoModal component

**Files:**
- Create: `src/widgets/ThorPromoModal/ThorPromoModal.tsx`

- [ ] **Step 1: 디렉토리 생성 & 파일 작성**

`src/widgets/ThorPromoModal/ThorPromoModal.tsx` 전체 내용:

```typescript
import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import liff from "@line/liff";
import slWatch from "@/shared/assets/images/sl-watch.png";
import giftbox from "@/shared/assets/images/giftbox-icon.png";
import coins from "@/shared/assets/images/coins-icon.png";

const STORAGE_KEY = "thorAmbassadorModalShown";
const THOR_URL = "https://thor.savethelife.io/";
const COUNTDOWN_SECONDS = 5;

const shouldShowInitially = (): boolean => {
  if (import.meta.env.VITE_THOR_PROMO_ENABLED !== "true") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
};

const markAsShown = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // storage quota / private mode — silently ignore
  }
};

export default function ThorPromoModal() {
  const [open, setOpen] = useState<boolean>(() => shouldShowInitially());
  const [secondsLeft, setSecondsLeft] = useState<number>(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) return;
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  const canClose = secondsLeft <= 0;

  const handleClose = () => {
    if (!canClose) return;
    markAsShown();
    setOpen(false);
  };

  const handleJoinThor = () => {
    markAsShown();
    setOpen(false);
    try {
      if (liff.isInClient?.()) {
        liff.openWindow({ url: THOR_URL, external: true });
        return;
      }
    } catch {
      // liff not initialized — fall through to window.open
    }
    window.open(THOR_URL, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={!canClose}
            aria-label={canClose ? "Close" : `Wait ${secondsLeft}s`}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition ${
              canClose
                ? "text-gray-600 hover:bg-gray-100 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {canClose ? "✕" : secondsLeft}
          </button>

          <div className="text-center mb-3 mt-2">
            <div className="inline-flex items-center gap-1.5 text-2xl font-extrabold text-gray-900">
              <span className="text-blue-600 text-3xl leading-none">⚡</span>
              <span>THOR</span>
            </div>
          </div>

          <DialogPrimitive.Title asChild>
            <div className="text-center mb-7">
              <div className="text-2xl font-extrabold text-gray-900 leading-tight">
                JOIN THE FIRST
              </div>
              <div className="text-2xl font-extrabold text-blue-600 leading-tight">
                SL AMBASSADORS
              </div>
            </div>
          </DialogPrimitive.Title>

          <div className="space-y-5 mb-6">
            <Section
              imgSrc={slWatch}
              imgAlt="SL Smart Watch"
              titleBlue="1,000 TOP AMBASSADORS"
              titleBlack="RECEIVE AN SL SMART WATCH"
              body="Top 1,000 outstanding users will receive an SL Smart Watch."
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={giftbox}
              imgAlt="Gift box"
              titleBlue="ONGOING"
              titleBlack="AIRDROP EVENTS"
              body="Join regular campaigns and special airdrop events."
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={coins}
              imgAlt="Coins"
              titleBlue="EARN POINTS,"
              titleBlack="UNLOCK FUTURE BENEFITS"
              body="Earn points by completing missions and growing the community. Points can be used for future SL ecosystem benefits."
            />
          </div>

          <button
            type="button"
            onClick={handleJoinThor}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold flex items-center justify-center gap-2 transition"
          >
            <span>JOIN THOR</span>
            <span aria-hidden="true">→</span>
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Start your ambassador journey today.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface SectionProps {
  imgSrc: string;
  imgAlt: string;
  titleBlue: string;
  titleBlack: string;
  body: string;
}

function Section({ imgSrc, imgAlt, titleBlue, titleBlack, body }: SectionProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
        <img src={imgSrc} alt={imgAlt} className="w-12 h-12 object-contain" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="text-sm font-bold text-blue-600 leading-tight">
          {titleBlue}
        </div>
        <div className="text-base font-extrabold text-gray-900 leading-tight mb-1">
          {titleBlack}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 컴파일 검증**

Run: `npx tsc --noEmit 2>&1 | grep -E "ThorPromoModal|error" | head -20`
Expected: ThorPromoModal 관련 에러 없음.

만약 `liff.isInClient` 타입 에러 나면 `(liff as any).isInClient?.()` 로 임시 우회 가능 — 단 일단 그대로 빌드해보고 결정.

---

## Task 4: Create re-export index file

**Files:**
- Create: `src/widgets/ThorPromoModal/index.ts`

- [ ] **Step 1: index.ts 작성**

전체 내용:
```typescript
export { default } from "./ThorPromoModal";
```

- [ ] **Step 2: 컴파일 검증**

Run: `npx tsc --noEmit 2>&1 | head -5`
Expected: 에러 없음.

---

## Task 5: Mount ThorPromoModal in DiceEvent page

**Files:**
- Modify: `src/pages/DiceEvent/index.tsx`

- [ ] **Step 1: import 추가**

[src/pages/DiceEvent/index.tsx](src/pages/DiceEvent/index.tsx) 의 import 섹션 (현재 line 1-33) 끝부분에 추가:

```typescript
import ThorPromoModal from "@/widgets/ThorPromoModal";
```

위치: line 33 (`import { useSDK } from "@/shared/hooks/useSDK";`) 다음 줄.

- [ ] **Step 2: JSX 에 마운트**

DiceEvent 컴포넌트의 최상위 return 의 JSX 시작 부분 (예: 최상위 `<div>` 의 첫 번째 children) 에 다음 한 줄 추가:

```tsx
<ThorPromoModal />
```

위치 가이드:
- DiceEvent 컴포넌트의 return 문에서, 최상위 wrapper div 의 children 으로 마운트
- 다른 Dialog (예: `showLevelUpDialog` 의 `<Dialog>`) 와 같은 레벨에 두기

구체 위치는 파일 구조를 확인 후 결정. 일반적으로:
```tsx
return (
  <div className="...">
    <ThorPromoModal />
    {/* ... existing content ... */}
  </div>
);
```

- [ ] **Step 3: TypeScript + 빠른 컴파일 확인**

Run: `npx tsc --noEmit 2>&1 | grep -E "DiceEvent|ThorPromo" | head -10`
Expected: 에러 없음.

- [ ] **Step 4: 첫 커밋 — 모달 컴포넌트 + 마운트 + 타입 + 이미지**

Files to add:
- `src/vite-env.d.ts` (modified)
- `src/widgets/ThorPromoModal/ThorPromoModal.tsx` (new)
- `src/widgets/ThorPromoModal/index.ts` (new)
- `src/pages/DiceEvent/index.tsx` (modified)
- `src/shared/assets/images/sl-watch.png` (new)
- `src/shared/assets/images/giftbox-icon.png` (new)
- `src/shared/assets/images/coins-icon.png` (new)

`.env` 는 gitignored 라서 add 안 함.
`sl-logo.png` 는 이번 작업과 무관, **add 하지 않음**.

```bash
git add src/vite-env.d.ts \
        src/widgets/ThorPromoModal/ThorPromoModal.tsx \
        src/widgets/ThorPromoModal/index.ts \
        src/pages/DiceEvent/index.tsx \
        src/shared/assets/images/sl-watch.png \
        src/shared/assets/images/giftbox-icon.png \
        src/shared/assets/images/coins-icon.png

git commit -m "feat(promo): add Thor Ambassador promotion modal

- Mount ThorPromoModal in DiceEvent page (first entry)
- 5-second countdown enforces minimum exposure
- localStorage flag prevents repeat shows per device
- VITE_THOR_PROMO_ENABLED env flag for operational on/off
- JOIN THOR opens https://thor.savethelife.io/ via liff.openWindow or window.open
- 3 image assets (sl-watch, giftbox-icon, coins-icon)"
```

`git status --short` 로 verify: `.claude/settings.local.json`, `package-lock.json`, `.env` 등은 modified 로 남고 우리 변경만 staged.

---

## Task 6: Local build verification

**Files:** (변경 없음, 검증만)

- [ ] **Step 1: Production build 실행**

```powershell
npm run build
```

Expected:
- `tsc && vite build` 통과
- `dist/` 생성됨
- Vite 출력에서 `index.html`, `assets/index-*.css`, `assets/index-*.js` 등 정상

Expected duration: ~90초.

- [ ] **Step 2: 빌드 산출물 확인**

```powershell
ls dist/index.html
(Get-ChildItem dist -Recurse -File | Measure-Object).Count
```

Expected: index.html 존재, 파일 수 327~330 부근 (기존 + 3개 이미지 정도).

이미지가 청크에 인라인됐을 수도 있고 별도 파일로 나왔을 수도 있음. 둘 다 정상.

---

## Task 7: Local dev verification (manual checkpoints)

**Files:** (검증만, 변경 없음)

- [ ] **Step 1: dev 서버 시작 안내**

새 PowerShell 터미널에서:
```powershell
cd C:\Users\dhwan\Desktop\work\line
npm run dev
```

Vite 가 보통 `http://localhost:5173` 에 띄움.

- [ ] **Step 2: 브라우저 (시크릿/Incognito) 에서 검증**

⚠️ **반드시 시크릿 창** — localStorage 가 비어있어야 모달 트리거됨.

테스트 시나리오:
1. http://localhost:5173 접속
2. 지갑 연결 (또는 mock 진입) 거쳐 `/dice-event` 도달
3. **체크**: 모달이 자동으로 뜸 ✓
4. **체크**: 우상단에 숫자 `5` → `4` → `3` → `2` → `1` 카운트다운 표시 ✓
5. **체크**: 카운트다운 중 X 클릭해도 닫히지 않음 ✓
6. **체크**: 카운트다운 중 ESC 키 / 외부 클릭으로도 닫히지 않음 ✓
7. **체크**: 0 도달 시 X 아이콘 (`✕`) 표시되고 클릭 가능 ✓
8. **체크**: X 클릭 시 모달 닫힘 ✓
9. **체크**: 새로고침 (F5) → 모달 다시 안 뜸 (localStorage 마킹됨) ✓
10. **체크**: DevTools → Application → Local Storage 에서 `thorAmbassadorModalShown=true` 확인 ✓

다시 시크릿 창 새로 열고:
11. 모달 뜨면 → JOIN THOR 버튼 클릭
12. **체크**: 새 탭 열리고 `https://thor.savethelife.io/` 로딩됨 ✓
13. **체크**: 모달 닫힘 + localStorage 마킹됨 ✓

env flag 토글 테스트:
14. `.env` 에서 `VITE_THOR_PROMO_ENABLED=false` 로 변경
15. dev 서버 재시작 (`Ctrl+C` 후 `npm run dev`)
16. 새 시크릿 창에서 `/dice-event` 접속
17. **체크**: 모달 안 뜸 ✓
18. `.env` 를 다시 `true` 로 복원

- [ ] **Step 3: 검증 결과 보고**

사용자에게 각 체크리스트 결과 보고. 문제 발견 시 Task 8 진입 전에 수정 PR.

---

## Task 8: Add VITE_THOR_PROMO_ENABLED to GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/frontend-deploy.yml`

- [ ] **Step 1: 현재 Build step env 섹션 확인**

`.github/workflows/frontend-deploy.yml` 의 Build step 은:

```yaml
- name: Build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
    VITE_LIFF_ID: ${{ secrets.VITE_LIFF_ID }}
    VITE_LINE_CLIENT_ID: ${{ secrets.VITE_LINE_CLIENT_ID }}
    VITE_OPEN_AI_API_KEY: ${{ secrets.VITE_OPEN_AI_API_KEY }}
  run: npm run build
```

- [ ] **Step 2: 한 줄 추가**

`VITE_OPEN_AI_API_KEY` 다음 줄에 추가:

```yaml
- name: Build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
    VITE_LIFF_ID: ${{ secrets.VITE_LIFF_ID }}
    VITE_LINE_CLIENT_ID: ${{ secrets.VITE_LINE_CLIENT_ID }}
    VITE_OPEN_AI_API_KEY: ${{ secrets.VITE_OPEN_AI_API_KEY }}
    VITE_THOR_PROMO_ENABLED: ${{ secrets.VITE_THOR_PROMO_ENABLED }}
  run: npm run build
```

- [ ] **Step 3: 커밋**

```bash
git add .github/workflows/frontend-deploy.yml
git commit -m "ci: inject VITE_THOR_PROMO_ENABLED into production build

Allows operational on/off of Thor promo modal via GitHub Secret
without code changes. Set to 'false' and re-run workflow to disable."
```

---

## Task 9: GitHub Secret 추가 + 푸시 + PR

**Files:** (없음 — GitHub UI + git push)

- [ ] **Step 1: GitHub Secret 추가** (사용자가 UI 에서)

URL: https://github.com/save-the-life/Line-Mini-Dapp/settings/secrets/actions

- "New repository secret" 클릭
- Name: `VITE_THOR_PROMO_ENABLED`
- Value: `true`
- Add secret

- [ ] **Step 2: 브랜치 푸시**

```bash
git push -u origin feature/thor-promo-modal
```

Expected: 새 브랜치 origin 등록, 자동 워크플로 발화 X (브랜치 트리거가 `main` 만).

- [ ] **Step 3: PR 생성 안내**

URL: https://github.com/save-the-life/Line-Mini-Dapp/pull/new/feature/thor-promo-modal

PR 양식 제안:

```
Title: feat(promo): add Thor Ambassador promotion modal

Body:
## Why
원민호 분 요청. Thor Ambassador 프로그램 (SL 생태계 1000명 스마트워치 + 에어드랍) 홍보 모달 추가.

## What
- 신규 widget `ThorPromoModal` — 첫 진입 (`/dice-event`) 시 1회 자동 노출
- 5초 강제 노출 (X 카운트다운, ESC/overlay 닫기 disabled)
- "JOIN THOR" 버튼 → `https://thor.savethelife.io/` (LIFF / 일반 브라우저 분기)
- localStorage `thorAmbassadorModalShown` 으로 디바이스별 1회 제한
- env flag `VITE_THOR_PROMO_ENABLED` 로 운영적 on/off

## Out of scope
- 레벨 3 도달 시 0.1 USDT 지급 (백엔드 협업 필요, 별도 PR)
- 레벨 3 난이도 상향 (백엔드)
- 다국어화 (영어 하드코드)
- 이미지 사이즈 최적화 (giftbox/coins 각 2.1 MB — 백로그)

## Verification
- 로컬: 시크릿 창에서 진입 → 모달 노출 + 카운트다운 + JOIN THOR + 재방문 미노출 모두 확인
- env flag false 토글 시 모달 미노출 확인
- 빌드 통과 (`npm run build`)

## Operational off-switch
이벤트 종료 시 GitHub Secrets `VITE_THOR_PROMO_ENABLED` = `false` 로 수정 후 workflow_dispatch 재배포 (~60초).

## Spec & Plan
- Spec: docs/superpowers/specs/2026-06-05-thor-promo-modal-design.md
- Plan: docs/superpowers/plans/2026-06-05-thor-promo-modal.md
```

- [ ] **Step 4: PR 머지 → main 자동 배포**

PR 머지 후:
- main 푸시 트리거 자동 발화
- 셀프호스티드 러너 `digiray-hpe` 가 빌드 + 배포 (~60초)
- 운영 환경에서 사용자 첫 진입 시 모달 노출됨

---

## Task 10: Cleanup (PR 머지 후)

**Files:** 없음

- [ ] **Step 1: 로컬 main 동기화**

```bash
git checkout main
git pull origin main
git branch -d feature/thor-promo-modal
```

- [ ] **Step 2: GitHub UI 의 "Delete branch" 클릭** (머지된 PR 페이지)

remote 의 `feature/thor-promo-modal` 정리.

---

## Self-Review

### Spec coverage check

| Spec 요구사항 | 대응 Task |
|---|---|
| 첫 진입 1회 노출 | Task 3 (`shouldShowInitially`), Task 5 (마운트 위치) |
| 5초 강제 노출 + 카운트다운 | Task 3 (`secondsLeft`, useEffect) |
| ESC / 오버레이 닫기 disabled | Task 3 (`onEscapeKeyDown`, `onPointerDownOutside`) |
| X 버튼 5초 후 활성화 | Task 3 (`canClose` 체크) |
| JOIN THOR → 외부 이동 | Task 3 (`handleJoinThor`, liff/window 분기) |
| localStorage 마킹 | Task 3 (`markAsShown`) |
| env flag on/off | Task 1, 2, 3, 8 |
| 이미지 3종 표시 | Task 3 (`Section` 컴포넌트, 정적 import) |
| 영어 하드코드 문구 | Task 3 (JSX 내 직접) |
| 마운트 위치 `/dice-event` | Task 5 |
| 워크플로 env 주입 | Task 8 |
| 운영 끄기 절차 | Task 9 Step 1 (Secret 추가) + 운영자 메뉴얼 (spec) |

→ Spec 요구사항 모두 커버.

### Placeholder scan
- "TBD"/"TODO": 없음
- "implement later": 없음
- "Add appropriate error handling": 없음 (모든 try/catch 블록 명시)
- "Similar to Task N": 없음 (모든 코드 풀버전)

### Type consistency
- `VITE_THOR_PROMO_ENABLED` — 모든 Task 에서 동일 명명
- `thorAmbassadorModalShown` localStorage 키 — 모든 Task 에서 동일
- `THOR_URL` 상수 — Task 3 에서만 사용
- `liff.openWindow({ url, external: true })` — 단일 사용처
- 컴포넌트 export: `default` (Task 3, 4 일치)
- import path: `@/widgets/ThorPromoModal` (Task 4, 5 일치)

→ 일관성 확인.

### Risk
- `liff.isInClient` 타입이 LIFF SDK 버전에 따라 다를 수 있음 → optional chaining (`?.()`) 로 안전. 만약 컴파일 에러 나면 `(liff as any).isInClient?.()` 로 우회 가능.
- 시크릿 모드 / localStorage 비활성 환경 → try/catch 로 안전.
- `<DialogPrimitive.Title>` 가 React 18 strict mode 에서 hydration warning 낼 가능성 → `asChild` 패턴 사용해서 `<div>` 로 렌더링하므로 OK.

---

## 실행 옵션

Plan 작성 완료. 두 가지 실행 옵션:

**Option 1 — Subagent-Driven (추천)**: Task 별로 fresh subagent 디스패치, 사이사이 사용자 리뷰. 빠른 반복 + 컨텍스트 격리.

**Option 2 — Inline Execution**: 이 세션에서 직접 Task 1~9 진행. 사용자가 체크포인트마다 리뷰. 컨텍스트 연속성.

이번 작업은 파일 수가 적고 (~5 파일) 변경이 컴포넌트 1개에 집중돼 있어 **Option 2 (Inline)** 가 적합. Subagent 분기 오버헤드 대비 이득이 적음.

사용자 선호 따라 결정.
