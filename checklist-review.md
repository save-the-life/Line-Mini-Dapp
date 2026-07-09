# Unifi Apps 심사 체크리스트 점검 리포트

> 대상: `line-mini-dapp` (Lucky Dice) — Vite + React + LIFF + `@linenext/dapp-portal-sdk`
> 기준: Unifi Apps "LINE Login LIFF & Web Version Review Guidelines"
> 점검일: 2026-07-09 / 브랜치: `main`
> 범례: ✅ 통과 · ❌ 미충족·문제 · 🔍 코드로 확인 불가(수동 확인)

---

## 요약 (Executive Summary)

| 분류 | 항목 |
|---|---|
| ✅ 통과 | SDK 통합, LIFF/Web 분기, 지갑주소 표시, disconnect, Crypto+Stripe 결제, 결제상태 UI, openPaymentHistory, 구매 주의사항, ShareTargetPicker, copy invite link, i18n(browser detector), Connect 버튼 |
| ❌ 문제 | **OpenAI API Key 프론트 노출 (심각)**, OpenGraph 태그 미비, Close Confirmation Dialog 부재, Thai 언어 미등록(선택은 되나 번역 없음), 탭 title 구분자 문자 |
| 🔍 수동 | Reown projectId/도메인 검증, dapp-portal-sdk 최신버전 여부, 실시간 환율 소스(백엔드), LINE 콘솔/OA/Rich Menu/GRAC/Compliance |

---

## 1. SDK

### ✅ `@linenext/dapp-portal-sdk` (Unifi Apps SDK) 통합
- `package.json` 의존성 `"@linenext/dapp-portal-sdk": "^1.6.0"`, 실제 설치본 `node_modules/@linenext/dapp-portal-sdk/package.json` → `"version": "1.6.0"`.
- 초기화: [src/shared/services/sdkServices.ts:85-88](src/shared/services/sdkServices.ts#L85-L88)
  ```ts
  globalSDKInstance = await DappPortalSDK.init({
    clientId,          // import.meta.env.VITE_LINE_CLIENT_ID
    chainId,           // "8217" (Kaia mainnet)
  });
  ```
- 싱글톤 + lazy init + 지갑상태 복원까지 구현됨.

### 🔍 SDK가 "최신" 버전인지
- 설치본은 `1.6.0`. 최근 커밋 `778ca21 chore: update dapp-portal-sdk` 존재.
- npm registry의 최신 published 버전과 대조는 코드만으로 불가 → **수동 확인 필요** (`npm view @linenext/dapp-portal-sdk version`).

### 🔍 Reown(WalletConnect) ProjectId
- `VITE_WALLETCONNECT_PROJECT_ID` / `projectId` / `Reown` 를 **앱 소스에서 직접 설정하는 코드 없음**.
- `@reown/appkit` 은 `package-lock.json` 에만 존재하는 **transitive 의존성**(dapp-portal-sdk 내부). `package.json` 직접 의존성 아님.
- 즉 projectId는 SDK 내부에서 `clientId ↔ projectId` 매핑(Unifi 백엔드)으로 처리됨. 관련 주석: [src/app/components/AppInitializer.tsx:422-424](src/app/components/AppInitializer.tsx#L422-L424).
- **projectId 발급/도메인 검증 완료 여부는 Reown·Unifi 콘솔에서 수동 확인 필요.**

---

## 2. Wallet Connect Flow

### ✅ LIFF vs Web 분기 처리
- 앱 초기화 시 `liff.isInClient()` 로 분기: 외부 브라우저는 `/connect-wallet` 로 라우팅.
  - [src/app/components/AppInitializer.tsx:401-420](src/app/components/AppInitializer.tsx#L401-L420)
  ```ts
  let isInClient = false;
  try { isInClient = liff.isInClient(); } catch (e) { ... }
  ...
  if (!isInClient) {           // 외부 브라우저(PC 웹 등)
    navigate("/connect-wallet");
    ...
  }
  ```
- 초대 공유 플로우도 분기: LIFF → `shareTargetPicker`, Web → `navigator.share`/클립보드. [src/pages/InviteFriends/index.tsx:91-145](src/pages/InviteFriends/index.tsx#L91-L145)

### ✅ 연결된 지갑 주소 표시 UI
- `MyAssets` 에서 지갑주소를 중간생략 형태로 노출: [src/pages/MyAssets/index.tsx:1087](src/pages/MyAssets/index.tsx#L1087), [:1133](src/pages/MyAssets/index.tsx#L1133)
  ```tsx
  <span><TruncateMiddle text={walletAddress} maxLength={20} /></span>
  ```

### ✅ disconnectWallet 구현
- 서비스 함수: [src/shared/services/walletService.ts:85-94](src/shared/services/walletService.ts#L85-L94)
  ```ts
  export const disconnectWallet = async (...) => {
    ...
    if (provider && typeof provider.disconnectWallet === "function") {
      await provider.disconnectWallet();   // Unifi SDK 표준 API
    }
  ```
- 설정 화면 UI + 확인 모달: [src/pages/SettingsPage/index.tsx:50-60](src/pages/SettingsPage/index.tsx#L50-L60), [:152-198](src/pages/SettingsPage/index.tsx#L152-L198). 4개 언어(en/ko/ja/zh) 로컬라이즈 문구 존재.

---

## 3. Payment Features

### ✅ SDK 인앱 결제 — Crypto + Stripe 둘 다
- [src/pages/ItemStore/index.tsx:308-339](src/pages/ItemStore/index.tsx#L308-L339)
  ```ts
  const handleCheckout = async (paymentMethod: "STRIPE" | "CRYPTO") => { ... }
  const paymentProvider = sdk.getPaymentProvider();
  await paymentProvider.startPayment(response.id);
  ```
- USD 버튼 → `handleCheckout("STRIPE")`, KAIA 버튼 → `handleCheckout("CRYPTO")` ([:391-398](src/pages/ItemStore/index.tsx#L391-L398)).

### ✅ 결제 전 주의사항(purchase precautions)
- 환불불가 동의 체크박스 + 공식 정책 링크, 개인정보 제공 동의 체크박스, 아이템 효과 안내: [src/pages/ItemStore/index.tsx:580-635](src/pages/ItemStore/index.tsx#L580-L635)
  - `https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment-provider/policy/refund` (환불정책)
  - `https://www.lycorp.co.jp/en/company/privacypolicy/` (개인정보)

### ✅ 결제 상태 알림 UI/UX
- 성공/실패 모달 + 상태 메시지: [src/pages/ItemStore/index.tsx:716-748](src/pages/ItemStore/index.tsx#L716-L748).
- SDK 에러코드별 안내(`-31001` 취소, `-31002` 실패, `-32000` 잔액부족, `-32001/-32002/-32005` 등) 및 만료 시간 기반 분기 처리: [:342-388](src/pages/ItemStore/index.tsx#L342-L388).

### ✅ `openPaymentHistory()` 사용
- [src/pages/ItemStore/index.tsx:439-443](src/pages/ItemStore/index.tsx#L439-L443), [src/pages/MyAssets/index.tsx:450-459](src/pages/MyAssets/index.tsx#L450-L459)
  ```ts
  const paymentProvider = sdk.getPaymentProvider();
  await paymentProvider.openPaymentHistory();
  ```

### 🔍 실시간 환율 기반 fiat/crypto 가격 표시
- UI에는 KAIA·USD 두 가격 모두 표기됨: [src/pages/ItemStore/index.tsx:655-671](src/pages/ItemStore/index.tsx#L655-L671)
  ```tsx
  ? `${selectedItemInfo.kaiaPrice} KAIA` ...
  ? `USD $${selectedItemInfo.usdPrice}` ...
  ```
- 그러나 `kaiaPrice`/`usdPrice` 는 **백엔드 API 응답값**(`selectedItemInfo`)이며, 프론트엔드에서 CMC/Kaia Open API 같은 실시간 환율을 호출하는 코드는 없음.
- → **환율이 백엔드에서 실시간으로 산정되는지 서버 측 수동 확인 필요.**

---

## 4. Invite Friends

### ✅ LIFF — ShareTargetPicker
- [src/pages/InviteFriends/index.tsx:102-108](src/pages/InviteFriends/index.tsx#L102-L108)
  ```ts
  if (liff.isApiAvailable('shareTargetPicker')) {
    await liff.shareTargetPicker([
      { type: 'text', text: `Join me on this awesome app! Use my referral link: ${referralLink}` }
    ]);
  }
  ```

### ✅ Web — 초대 링크 복사
- 전용 복사 버튼 + `navigator.clipboard.writeText`: [src/pages/InviteFriends/index.tsx:58-68](src/pages/InviteFriends/index.tsx#L58-L68), [:160-171](src/pages/InviteFriends/index.tsx#L160-L171).
- Web Share API 미지원 시 클립보드 복사로 fallback: [:124-144](src/pages/InviteFriends/index.tsx#L124-L144).

> 개선 제안(경미): 초대 메시지 문구 `"Join me on this awesome app!"` 가 플레이스홀더 성격. 심사 전 브랜드명("Lucky Dice") 반영 권장.

---

## 5. UX/UI

### ✅ / ❌ 언어 Localization (브라우저 설정 기반)
- ✅ `i18next-browser-languagedetector` 사용 → 브라우저 설정 기반 감지. [src/shared/lib/il8n.ts:10-23](src/shared/lib/il8n.ts#L10-L23)
  ```ts
  i18n.use(LanguageDetector).use(initReactI18next).init({
    resources: { en, ko, ja, zh },   // ← th 없음
    fallbackLng: 'en',
    load: 'languageOnly',
  });
  ```
- ✅ **영어·일본어 필수 언어 모두 포함**(en, ja) + ko, zh.
- ❌ **문제: Thai(`th`) 불일치.** 언어 선택 화면은 태국어 버튼을 노출([src/pages/ChooseLanguage/index.tsx:94-108](src/pages/ChooseLanguage/index.tsx#L94-L108), `handleChooseLanguage("th")`)하고 `src/shared/locales/th.json` 파일도 존재하지만, `il8n.ts` 의 `resources` 에 `th` 가 **등록되지 않음**. → 태국어 선택 시 번역이 로드되지 않고 영어로 fallback 됨.
  - **수정 제안:** `il8n.ts` 에 `import th from '../locales/th.json'` 추가 후 `resources` 에 `th: { translation: th }` 등록. (태국어를 지원하지 않을 계획이면 반대로 ChooseLanguage에서 버튼 제거하여 UI 일관성 확보.)

### ❌ 브라우저 탭 title 형식
- [index.html:9](index.html#L9) → `<title>Lucky Dice │ Unifi Apps</title>`
- 형식 `{Name} | Unifi Apps` 패턴은 맞으나 **구분자가 표준 파이프 `|`(U+007C)가 아니라 전각 세로줄 `│`(U+2502)** 로 되어 있음. 심사 가이드가 정확한 문자를 요구할 경우 불일치 가능.
  - **수정 제안:** `<title>Lucky Dice | Unifi Apps</title>` (표준 `|`) 로 교체.
- 참고: `document.title` 을 동적으로 세팅하는 코드는 없음(정적 title 단일값). 요건상 문제 없음.

### ❌ OpenGraph 메타태그
- [index.html:8](index.html#L8) 에 `og:image` **하나만** 존재.
  ```html
  <meta property="og:image" content="/openGraph.PNG" />
  ```
- **누락:** `og:title`, `og:description`, `og:url`, `og:type`, (권장) Twitter Card 태그.
  - **수정 제안:** 아래 형태 추가
    ```html
    <meta property="og:title" content="Lucky Dice | Unifi Apps" />
    <meta property="og:description" content="..." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://luckydice.savethelife.io/" />
    ```

### ✅ / 🔍 Connect 버튼 Unifi 디자인 가이드라인
- [src/pages/ConnectWallet/index.tsx:386-402](src/pages/ConnectWallet/index.tsx#L386-L402): 흰색 버튼 + Unifi 로고 SVG(`/Unifi_Logo_Primary_1024_1024.svg`) + "Connect" 텍스트. Unifi 브랜딩을 사용 중.
  ```tsx
  <img src="/Unifi_Logo_Primary_1024_1024.svg" alt="Unifi" className="h-8 w-auto" />
  <span ...>{isConnecting ? "Connecting..." : "Connect"}</span>
  ```
- 🔍 정확한 규격(색/여백/문구/로고 최신본) 준수 여부는 Unifi 디자인 스펙과 픽셀 대조 필요 → 수동 확인.
- 참고: `ItemStore` 의 지갑연결 모달은 이미지 버튼 `Images.ConnectButton`(`connectbutton.png`) 사용([src/pages/ItemStore/index.tsx:763-767](src/pages/ItemStore/index.tsx#L763-L767)) — ConnectWallet 페이지의 SVG 버튼과 **디자인 소스가 이원화**되어 있음. 가이드라인 최신 버튼으로 통일 권장.

### ❌ Close Confirmation Dialog (닫기 확인 다이얼로그)
- `liff.closeWindow`, `beforeunload`, 종료 확인 모달을 구현한 코드가 **전혀 발견되지 않음** (전체 `src` 검색 결과 0건).
  - **수정 제안:** 앱 종료(뒤로가기/닫기) 시 확인 다이얼로그 노출 로직 추가. LIFF에서는 `liff.closeWindow()` 호출 전 확인 모달, Web에서는 `beforeunload` 핸들러 검토. (가이드라인이 필수로 요구하는지 심사 기준 재확인 권장.)

---

## 6. Security ⚠️ (중요)

### ❌ 심각 — OpenAI API Key 프론트엔드 노출
- [src/pages/AIDentalAnalysis/index.tsx:35-38](src/pages/AIDentalAnalysis/index.tsx#L35-L38), [src/pages/AIXrayAnalysis/index.tsx:36-38](src/pages/AIXrayAnalysis/index.tsx#L36-L38)
  ```ts
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
    dangerouslyAllowBrowser: true,   // ← 브라우저에서 직접 호출
  });
  ```
- **문제:** `VITE_` 접두 환경변수는 **빌드 시 클라이언트 번들에 그대로 인라인**됨. 즉 `VITE_OPEN_AI_API_KEY` 는 배포 번들·네트워크·브라우저 콘솔에서 누구나 추출 가능. `dangerouslyAllowBrowser: true` 로 이를 강제 허용하고 있음. OpenAI 키 탈취 → 과금 남용 위험.
  - **수정 제안:** OpenAI 호출을 **백엔드 프록시 엔드포인트로 이전**하고 키는 서버 환경변수(비 `VITE_`)로만 보관. 프론트에서 `new OpenAI({apiKey})` / `dangerouslyAllowBrowser` 제거.
  - 확인: 현재 커밋된 `.env` 에는 `VITE_OPEN_AI_API_KEY` 값이 없어(3개 변수만 존재) 로컬 빌드에는 미포함이지만, CI/배포 환경에 이 변수가 주입되면 **프로덕션 번들에 키가 박힘**. 배포 파이프라인 점검 필수.

### ✅ 하드코딩된 민감정보 없음
- `privateKey` / `mnemonic` / `clientSecret` / `secretKey` 등 지갑·시크릿 하드코딩 **없음**(전체 `src` 검색 0건).
- `dist/` 번들에서 `sk-...` 형태 OpenAI 키 스캔 → **검출 없음**(로컬 `.env` 에 키가 없기 때문. 위 배포 파이프라인 주의사항과 연계).

### ✅ 커밋된 `.env` — 공개 식별자만 존재
- [.env](.env):
  ```
  VITE_API_BASE_URL=https://luckydice.savethelife.io/api
  VITE_LIFF_ID=2006791189-V9zJ23LN
  VITE_LINE_CLIENT_ID=2006791189
  ```
  - LIFF ID / LINE Channel ID(client id)는 **공개 식별자**로 노출돼도 무방. API base URL도 공개 도메인. 시크릿 아님.
  - `.gitignore` 에 `.env` 포함되어 있으나 현재 워킹트리에 파일 존재(추적 여부는 `git ls-files` 로 확인 권장). 어쨌든 내용상 민감정보 없음.

### ⚠️ 경미 — 원격 디버깅 스크립트 상주
- [index.html:10](index.html#L10) 에 `eruda`(모바일 디버깅 콘솔) CDN 스크립트가 로드됨. `eruda.init()` 은 주석 처리되어 실행은 안 되나, **프로덕션에서 외부 CDN 스크립트를 로드**하는 상태.
  - **수정 제안:** 심사/배포 빌드에서 eruda `<script>` 태그 제거.

---

## 7. 🔍 코드로 확인 불가 — 수동 확인 항목

아래는 저장소 코드만으로 검증 불가. LINE Developers / Unifi / Reown 콘솔 및 정책 판단 필요.

| # | 항목 | 확인 위치 |
|---|---|---|
| 1 | LINE Login + Messaging API 채널 생성, **Published** LIFF 존재 | LINE Developers Console (LIFF ID `2006791189-V9zJ23LN`) |
| 2 | OA(공식계정) 연동 + **Add friend option = On (aggressive)** | LINE OA Manager / LIFF 설정 |
| 3 | OA Rich Menu 디자인 가이드 준수 | LINE OA Manager |
| 4 | Reown ProjectId 발급 및 **도메인 검증 완료** | Reown(WalletConnect) Cloud / Unifi 콘솔 |
| 5 | `@linenext/dapp-portal-sdk` npm **최신 published 버전** 대조 | `npm view @linenext/dapp-portal-sdk version` |
| 6 | 결제 가격의 **실시간 환율 산정**(CMC/Kaia Open API) 소스 | 백엔드(`luckydice.savethelife.io/api`) |
| 7 | GRAC 게임물 등급 심사 (룰렛/주사위/RPS/슬롯 등 게임 요소 → 게임 분류 가능성 높음) | GRAC / 기획·법무 |
| 8 | Compliance — 사행성/폭력성/현상광고법 등 (리워드·래플·에어드랍 구조) | 기획·정책·법무 판단 |

> 참고: `src/pages` 에 `SpinGame`, `SlotMachine`, `RPSGame`, `CardFlipGame`, `DiceEvent`, `PreviousRaffle`, `PreviousAirdrop` 등 게임·추첨·보상 요소가 다수 존재 → **7·8 항목(게임등급·사행성 컴플라이언스)** 이 실제 심사에서 쟁점이 될 가능성이 높음.

---

## 8. 조치 우선순위 (권장)

| 우선 | 항목 | 근거 |
|---|---|---|
| 🔴 P0 | OpenAI API Key 백엔드 프록시 이전 (`VITE_OPEN_AI_API_KEY` 제거) | §6 심각 — 키 노출 |
| 🟠 P1 | OpenGraph 태그 보강 (title/description/url/type) | §5 |
| 🟠 P1 | Close Confirmation Dialog 구현 여부 확정·추가 | §5 |
| 🟠 P1 | Thai 언어 등록 정합성(등록 or 버튼 제거) | §5 |
| 🟡 P2 | 탭 title 구분자 `│`→`|` 정규화 | §5 |
| 🟡 P2 | Connect 버튼 디자인 소스 통일 + 규격 대조 | §5 |
| 🟡 P2 | eruda 디버깅 스크립트 프로덕션 제거 | §6 |
| 🟡 P2 | 초대 문구 브랜드명 반영 | §4 |
