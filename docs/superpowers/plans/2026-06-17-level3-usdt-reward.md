# 레벨3 USDT 보상 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 미션 페이지의 "레벨10 달성 시 0.1 KAIA(온체인 트랜잭션)" 이벤트를 "레벨3 달성 시 0.1 USDT(지갑 주소만 전송)"로 변경한다.

**Architecture:** 백엔드가 레벨 게이팅(`hasEventAccess`/`isAvailable`)과 실제 지급을 담당하므로, 프론트는 (1) 수령 API에서 온체인 서명 로직을 제거하고 지갑 주소만 전송, (2) 중복된 KAIA 카드 JSX를 단일 컴포넌트로 추출, (3) 표시 에셋/텍스트를 USDT·레벨3로 교체한다. `type: "KAIA"` 탐색과 응답 문자열 매칭은 유지한다.

**Tech Stack:** React + TypeScript, Vite, react-i18next, zustand. 테스트 프레임워크 없음 → 검증은 `npm run build`(tsc 타입체크) + 수동 확인.

**참고 문서:** `docs/superpowers/specs/2026-06-17-level3-usdt-reward-design.md`

---

## File Structure

- `src/entities/Mission/api/kaiaMission.ts` — 수령 API. `userSignedTx` 제거, `{ walletAddress }`만 전송.
- `src/pages/MissionPage/index.tsx` — `handleKaiaMission` 단순화, `KaiaMissionCard` inline 컴포넌트 추출, 두 렌더 블록 교체, 죽은 코드/import 제거.
- `src/shared/locales/{en,ja,ko,th,zh}.json` — 4개 키(`level2`/`receiving`/`success`/`already`) 값을 USDT·레벨3로 교체.

---

## Task 1: 수령 API에서 온체인 서명 제거

**Files:**
- Modify: `src/entities/Mission/api/kaiaMission.ts`

- [ ] **Step 1: `requestKaiaMission` 시그니처/페이로드 변경**

파일 전체를 아래로 교체한다:

```ts
import api from '@/shared/api/axiosInstance';

// Level 3 USDT 보상 api (지갑 주소만 전송)
export const requestKaiaMission = async (walletAddress: string): Promise<any> => {
    const info = {
        walletAddress: walletAddress
    }

    const response = await api.post("/mission/kaia", info);

    if (response.data.code === "OK") {
        console.log("kaia mission response: ", response);
        return response.data;
    } else {
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch get Kaia Mission');
    }
};

export default requestKaiaMission;
```

- [ ] **Step 2: 타입체크**

Run: `npm run build`
Expected: 이 시점에는 `MissionPage/index.tsx`의 호출부(`requestKaiaMission(signedTx.raw, walletAddress)`)가 인자 2개라 **타입 에러가 날 수 있음** → Task 3에서 해소. 이 Task만 단독 검증하려면 에러 메시지가 "Expected 1 arguments, but got 2" 형태인지 확인(다른 에러는 없어야 함).

- [ ] **Step 3: 커밋**

```bash
git add src/entities/Mission/api/kaiaMission.ts
git commit -m "refactor(mission): kaia reward api sends walletAddress only"
```

---

## Task 2: i18n 값 교체 (5개 언어, 키 이름 유지)

**Files:**
- Modify: `src/shared/locales/en.json`
- Modify: `src/shared/locales/ja.json`
- Modify: `src/shared/locales/ko.json`
- Modify: `src/shared/locales/th.json`
- Modify: `src/shared/locales/zh.json`

각 파일에서 아래 문자열을 정확히 찾아 교체한다(문자열이 고유하므로 줄 번호 무관).

- [ ] **Step 1: en.json**

| old | new |
|-----|-----|
| `"Earn 0.1 KAIA upon reaching Level 10!"` | `"Earn 0.1 USDT upon reaching Level 3!"` |
| `"Receiving KAIA rewards."` | `"Receiving USDT rewards."` |
| `"0.1 KAIA Rewards have been received successfully."` | `"0.1 USDT Rewards have been received successfully."` |
| `"You've already claimed your Level 10 KAIA reward."` | `"You've already claimed your Level 3 USDT reward."` |

- [ ] **Step 2: ja.json**

| old | new |
|-----|-----|
| `"レベル10に到達すると0.1 KAIAを獲得できます！"` | `"レベル3に到達すると0.1 USDTを獲得できます！"` |
| `"KAIA報酬を受け取っています。"` | `"USDT報酬を受け取っています。"` |
| `"0.1 KAIA報酬の受け取りに成功しました。"` | `"0.1 USDT報酬の受け取りに成功しました。"` |
| `"すでにレベル10のKAIA報酬を受け取っています。"` | `"すでにレベル3のUSDT報酬を受け取っています。"` |

- [ ] **Step 3: ko.json**

| old | new |
|-----|-----|
| `"레벨 10에 도달하면 0.1 KAIA를 획득합니다!"` | `"레벨 3에 도달하면 0.1 USDT를 획득합니다!"` |
| `"KAIA 보상을 수령 중입니다."` | `"USDT 보상을 수령 중입니다."` |
| `"0.1 KAIA 보상을 성공적으로 수령했습니다."` | `"0.1 USDT 보상을 성공적으로 수령했습니다."` |
| `"이미 레벨 10 KAIA 보상을 받으셨습니다."` | `"이미 레벨 3 USDT 보상을 받으셨습니다."` |

- [ ] **Step 4: th.json**

| old | new |
|-----|-----|
| `"เมื่อถึงระดับ 10 รับ 0.1 KAIA!"` | `"เมื่อถึงระดับ 3 รับ 0.1 USDT!"` |
| `"กำลังรับรางวัล KAIA."` | `"กำลังรับรางวัล USDT."` |
| `"ได้รับรางวัล 0.1 KAIA สำเร็จแล้ว."` | `"ได้รับรางวัล 0.1 USDT สำเร็จแล้ว."` |
| `"คุณได้รับรางวัล KAIA ระดับ 10 แล้ว."` | `"คุณได้รับรางวัล USDT ระดับ 3 แล้ว."` |

- [ ] **Step 5: zh.json**

| old | new |
|-----|-----|
| `"達到等級10即可獲得0.1 KAIA！"` | `"達到等級3即可獲得0.1 USDT！"` |
| `"正在接收 KAIA 獎勵。"` | `"正在接收 USDT 獎勵。"` |
| `"已成功接收 0.1 KAIA 獎勵。"` | `"已成功接收 0.1 USDT 獎勵。"` |
| `"您已領取過等級10的 KAIA 獎勵。"` | `"您已領取過等級3的 USDT 獎勵。"` |

- [ ] **Step 6: JSON 유효성 + 타입체크**

Run: `npm run build`
Expected: JSON 파싱/타입 에러 없음(Task 1의 호출부 인자 에러는 Task 3에서 해소되므로 여기서는 남아 있을 수 있음). 각 json이 깨지지 않았는지 확인.

- [ ] **Step 7: 커밋**

```bash
git add src/shared/locales/en.json src/shared/locales/ja.json src/shared/locales/ko.json src/shared/locales/th.json src/shared/locales/zh.json
git commit -m "i18n(mission): change kaia level10 strings to usdt level3"
```

---

## Task 3: MissionPage — 컴포넌트 추출 + 트랜잭션 제거 + 정리

**Files:**
- Modify: `src/pages/MissionPage/index.tsx`

> 의존 순서상 한 Task로 묶는다(호출부 수정 → import/상수 제거가 함께 가야 빌드 통과).

- [ ] **Step 1: `KaiaMissionCard` inline 컴포넌트 추가**

`DailyMissionCard` 컴포넌트 정의 바로 뒤(현재 L352 `};` 다음), `const MissionPage: React.FC` 선언 앞에 아래를 삽입한다:

```tsx
interface KaiaMissionCardProps {
  mission: Mission;
  onClick: () => void;
}

const KaiaMissionCard: React.FC<KaiaMissionCardProps> = ({ mission, onClick }) => {
  const { t } = useTranslation();
  const disabled = !mission.isAvailable || mission.isCleared;

  return (
    <div
      className={`
        relative
        h-[132px] flex items-center justify-between
        rounded-3xl overflow-hidden
        mx-6 mb-6
        ${disabled ? "pointer-events-none" : ""}
      `}
      style={{ background: "linear-gradient(to bottom, #9DE325 0%, #306E0A 100%)" }}
      onClick={() => {
        if (mission.isAvailable && !mission.isCleared) {
          onClick();
        }
      }}
    >
      {/* 비활성화 시 전체 덮는 오버레이 */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-30" />
      )}

      {/* 텍스트 블록 */}
      <div className="pl-8 relative z-20">
        <p className="text-sm font-medium text-white whitespace-nowrap">
          {t("mission_page.level2")}
        </p>
        <div className="flex items-center">
          <p className="text-base font-semibold text-white">+0.1</p>
          <img
            src={Images.USDT}
            alt="USDT Icon"
            className="ml-2 w-5 h-5 rounded-full object-cover"
          />
        </div>
      </div>

      {/* 배경 이미지 */}
      <img
        src={Images.KaiaLevel3}
        alt="usdt-level3"
        className="
          absolute
          right-0 bottom-0
          w-[142px] h-[142px]
          object-cover
          z-10
        "
      />
    </div>
  );
};
```

- [ ] **Step 2: `handleKaiaMission` 본문을 트랜잭션 제거 버전으로 교체**

현재 `handleKaiaMission` 함수 전체(`const handleKaiaMission = async() => { ... }`, 주석 처리된 구 호출부 블록 포함)를 아래로 교체한다:

```tsx
  const handleKaiaMission = async () => {
    playSfx(Audios.button_click);

    let address = walletAddress;

    // 지갑 미연결 시 연결 시도 (USDT 수령에는 지갑 주소만 필요)
    if (!provider || !walletAddress || !sdk || !walletType) {
      if (isConnecting) return;
      setIsConnecting(true);
      try {
        const connection = await connectWallet();
        setIsConnecting(false);
        if (!connection.provider || !connection.walletAddress) {
          setShowModal(true);
          setMessage(t("attendance.wallet_fail"));
          return;
        }
        address = connection.walletAddress;
        // 연결 성공 시 취소 플래그 제거
        clearWalletCancelDate();
      } catch (error: any) {
        setIsConnecting(false);
        console.error("Wallet connection failed:", error);

        // 사용자가 취소한 경우 (코드 -32001)
        if (error?.code === -32001 && error?.message === "User canceled") {
          const today = new Date().toDateString();
          setWalletCancelDate(today);
          return;
        }

        setShowModal(true);
        setMessage(t("attendance.wallet_fail"));
        return;
      }
    }

    // USDT 보상 요청 (지갑 주소만 백엔드로 전송)
    setKaiaLoading(true);
    try {
      const kaia = await requestKaiaMission(address);

      if (kaia.message === "Success") {
        setKaiaLoading(false);
        setKaiaModal(true);
        setKaiaMessage(t("mission_page.success"));
      } else if (kaia.message === "You've already claimed your Level 2 KAIA reward.") {
        setKaiaLoading(false);
        setKaiaModal(true);
        setKaiaMessage(t("mission_page.already"));
      } else if (kaia.message === "You're not eligible for the reward.") {
        setKaiaLoading(false);
        setKaiaModal(true);
        setKaiaMessage(t("mission_page.not_eligible"));
      }
    } catch (error: any) {
      console.log("에러 확인: ", error);
      setKaiaLoading(false);
      setKaiaModal(true);
      setKaiaMessage(t("mission_page.failed"));
    }
  };
```

참고: 응답 매칭 문자열(`"You've already claimed your Level 2 KAIA reward."` 등)은 백엔드가 동일하게 내려주므로 **그대로 유지**한다(화면 표시는 i18n으로 레벨3/USDT).

- [ ] **Step 3: 상단(hasEventAccess true) KAIA 카드 블록을 컴포넌트로 교체**

현재 상단 블록(`{kaiaMission && kaiaMission.hasEventAccess && ( ... )}` — KAIA 제목 + 카드 `<div>` 전체)을 아래로 교체한다:

```tsx
      {/* USDT 미션 - 레벨3 달성 시 활성화 */}
      {kaiaMission && kaiaMission.hasEventAccess && (
        <>
          <h1 className="font-semibold text-lg my-4 ml-7">
            KAIA {t("mission_page.Mission")}
          </h1>
          <KaiaMissionCard mission={kaiaMission} onClick={handleKaiaMission} />
        </>
      )}
```

- [ ] **Step 4: 하단(!hasEventAccess) KAIA 카드 블록을 컴포넌트로 교체**

현재 하단 블록(`{kaiaMission && !kaiaMission.hasEventAccess && ( ... )}` 전체)을 아래로 교체한다:

```tsx
      {/* USDT 미션 - 레벨3 미달성(비활성) */}
      {kaiaMission && !kaiaMission.hasEventAccess && (
        <>
          <h1 className="font-semibold text-lg my-4 ml-7">
            KAIA {t("mission_page.Mission")}
          </h1>
          <KaiaMissionCard mission={kaiaMission} onClick={handleKaiaMission} />
        </>
      )}
```

- [ ] **Step 5: 죽은 import 제거**

파일 상단에서 아래 4개 import 라인을 삭제한다:

```tsx
import { Web3Provider } from "@kaiachain/ethers-ext";
import { TxType } from "@kaiachain/js-ext-core"; // ✅ Fee Delegation 타입 추가
import { ethers } from "ethers";
import testingKaia from "@/entities/User/api/kaiaTX";
```

`import requestKaiaMission from "@/entities/Mission/api/kaiaMission";`는 **유지**한다.

- [ ] **Step 6: 죽은 상수/주석 블록 제거**

아래를 모두 삭제한다:
- 상단 주석 처리된 `//test-net` 블록 전체(주석 처리된 `contractAddress`/`feePayer`/`abi`)
- 실제 사용 중이던 `//main-net` 상수: `const contractAddress = "0x53aeFEF6...";`, `const feePayer = "0x22a4...";`, `const abi = [ ... ]` 전체

(이들은 Step 2에서 트랜잭션 로직을 제거하면서 모두 미참조 상태가 된다.)

- [ ] **Step 7: 타입체크 + 빌드**

Run: `npm run build`
Expected: PASS. 미사용 import/상수 에러 없음, `requestKaiaMission` 인자 에러(Task 1) 해소됨. 에러 0건.

- [ ] **Step 8: 커밋**

```bash
git add src/pages/MissionPage/index.tsx
git commit -m "feat(mission): level3 USDT card, extract KaiaMissionCard, drop on-chain tx"
```

---

## Task 4: 수동 검증

**Files:** (없음 — 실행 검증)

- [ ] **Step 1: 개발 서버 실행**

Run: `npm run dev`

- [ ] **Step 2: 미션 페이지 확인 체크리스트**

- [ ] USDT 카드의 로고가 USDT(청록 코인), 배경이 LEVEL 3 뱃지로 표시
- [ ] 카드 텍스트가 "레벨 3 도달 시 0.1 USDT" 의미로 표시(언어 전환 시 5개 언어 모두 USDT/레벨3)
- [ ] `hasEventAccess` true → 카드 상단 위치 / false → 하단 위치 + 비활성 오버레이
- [ ] 지갑 미연결 상태에서 카드 클릭 → 지갑 연결 플로우 동작
- [ ] 카드 클릭 시 DevTools Network에서 `POST /mission/kaia` 페이로드가 `{ "walletAddress": "0x..." }` 단일 필드인지 확인 (온체인 서명/`userSignedTx` 없음)
- [ ] 결과 모달: 성공/이미 수령/자격 없음/실패 문구가 USDT 기준으로 노출

- [ ] **Step 3: 검증 결과 기록**

체크리스트 결과를 사용자에게 보고. 실패 항목이 있으면 systematic-debugging으로 전환.

---

## Self-Review 결과

- **Spec coverage:** 스펙의 5개 변경 영역(컴포넌트 추출 / 트랜잭션 제거 / API 변경 / i18n / 죽은 코드 정리)이 각각 Task 3·3·1·2·3에 매핑됨. 검증 항목은 Task 4. 누락 없음.
- **Placeholder scan:** TBD/TODO 없음. 모든 코드 단계에 실제 코드 포함.
- **Type consistency:** `KaiaMissionCard` props(`mission: Mission`, `onClick: () => void`)가 Step 1 정의와 Step 3·4 사용처에서 일치. `requestKaiaMission(address: string)` 단일 인자가 Task 1 정의와 Task 3 호출부에서 일치.

## 미해결 결정 사항 (실행 전 확인 권장)

- 섹션 제목 `KAIA {t("mission_page.Mission")}` ("KAIA Mission")을 **그대로 유지**했다(스펙의 최소 변경 원칙 + `type:"KAIA"` 유지와 일관). 사용자에게 보이는 "KAIA Mission" 제목 위에 "0.1 USDT"가 표시되는 형태가 됨. 만약 제목도 "USDT"로 바꿔야 한다면 Step 3·4의 `KAIA ` 리터럴을 교체하면 된다.
- 카드 배경 그라데이션(녹색 `#9DE325→#306E0A`, KAIA 브랜드 색)도 스펙 범위에 없어 **유지**했다.
