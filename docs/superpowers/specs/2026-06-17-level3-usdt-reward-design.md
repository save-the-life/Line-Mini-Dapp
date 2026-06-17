# 설계: 레벨10 KAIA → 레벨3 USDT 보상 전환

날짜: 2026-06-17

## 배경

미션 페이지에는 사용자가 카드를 클릭해 보상을 수령하는 "KAIA 미션" 이벤트가 있다.
현재는 **레벨 10 달성 시 0.1 KAIA**를 지급하며, 수령 과정에서 지갑 연결 후
온체인 트랜잭션(`markClaimed`)을 서명하여 백엔드로 전송한다.

이번 업데이트에서 이 이벤트를 **레벨 3 달성 시 0.1 USDT** 지급으로 변경한다.
온체인 트랜잭션 서명은 제거하고, 같은 API에 **지갑 주소만** 전달한다.

## 변경 전 / 후 요약

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 트리거 | 레벨 10 (백엔드 `hasEventAccess`) | 레벨 3 (백엔드 `hasEventAccess`) |
| 보상 | 0.1 KAIA | 0.1 USDT |
| 사용자 동작 | 지갑 연결 → `markClaimed()` 온체인 서명 → raw tx 전송 | 지갑 연결(주소 확보)만 |
| API 페이로드 | `{ userSignedTx, walletAddress }` | `{ walletAddress }` |
| 엔드포인트 | `POST /mission/kaia` | `POST /mission/kaia` (유지) |

## 백엔드 변경 (프론트 영역 밖, 참고)

미션 조회(`GET /missions`)에서 `type: "KAIA"` 항목의 `name`/`description`이 변경된다.
`type` 필드는 **`"KAIA"` 그대로 유지**된다.

```json
{
  "id": 6,
  "name": "Level 3 USDT Reward",
  "description": "Earn 0.1 USDT upon reaching level 3",
  "type": "KAIA",
  "isCleared": false,
  "status": null,
  "isAvailable": false,
  "hasEventAccess": false
}
```

수령 API(`POST /mission/kaia`)의 응답 메시지 문자열은 **변경되지 않는다**(확인됨):
- `"Success"`
- `"You've already claimed your Level 2 KAIA reward."`
- `"You're not eligible for the reward."`

## 범위

대상 파일:
- `src/pages/MissionPage/index.tsx`
- `src/entities/Mission/api/kaiaMission.ts`
- `src/shared/locales/{en,ja,ko,th,zh}.json`

`type: "KAIA"` 탐색 로직(`missions.find(m => m.type === "KAIA")`)과 게이팅 플래그
(`hasEventAccess`/`isAvailable`/`isCleared`)는 변경하지 않는다.

## 상세 설계

### 1. 컴포넌트 추출 — `KaiaMissionCard`

현재 KAIA 카드 JSX가 `hasEventAccess` true(상단, L798-853) / false(하단, L966-1021)
두 곳에 거의 동일하게 중복돼 있다. 카드 본체를 기존 `OneTimeMissionCard`/`DailyMissionCard`와
동일한 패턴으로 **MissionPage 파일 내 inline 컴포넌트**로 추출한다.

- Props: `mission`(`isAvailable`/`isCleared` 사용), `onClick`(=`handleKaiaMission`)
- `hasEventAccess` true/false 분기 **위치는 그대로 유지**, 카드 본체만 공유 컴포넌트로 렌더
- 카드 내부 표시 변경:
  - 로고: `Images.KaiaLogo` → `Images.USDT`
  - 배경 이미지: `Images.KaiaLevel10` → `Images.KaiaLevel3`
  - 텍스트: `t("mission_page.level2")` 유지(값만 교체), `+0.1` 유지
  - `alt` 문구를 USDT/level3에 맞게 갱신

### 2. 트랜잭션 로직 제거 — `handleKaiaMission`

**유지**:
- 지갑 연결 흐름: `provider/walletAddress/sdk/walletType` 체크 → `connectWallet()`
  → 사용자 취소(-32001) 시 `walletCancelDate` 저장 처리
- 결과 모달 상태(`kaiaLoading`/`kaiaModal`/`kaiaMessage`)와 4분기 로직
- 응답 문자열 매칭(위 3개 + catch 실패) — **그대로 유지**

**제거**:
- `Web3Provider`, `ethers` 컨트랙트 생성
- `markClaimed` 호출, OKX 지갑 분기
- Fee Delegation 트랜잭션 빌드, `signMessage`, `kaia_signTransaction`

지갑 연결로 주소 확보 후 곧바로 `requestKaiaMission(walletAddress)` 호출한다.

### 3. API 변경 — `kaiaMission.ts`

```ts
export const requestKaiaMission = async (walletAddress: string): Promise<any> => {
  const response = await api.post("/mission/kaia", { walletAddress });

  if (response.data.code === "OK") {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch get Kaia Mission");
  }
};
```

- `userSignedTx` 파라미터/필드 제거, 엔드포인트 유지

### 4. i18n 값 교체 (키 이름 유지)

5개 언어(en/ja/ko/th/zh) 모두 동일 키의 값만 변경한다.

| 키 | 변경 후 (en 기준) |
|----|------------------|
| `mission_page.level2` | "Earn 0.1 USDT upon reaching Level 3!" |
| `mission_page.receiving` | "Receiving USDT rewards." |
| `mission_page.success` | "0.1 USDT Rewards have been received successfully." |
| `mission_page.already` | "You've already claimed your Level 3 USDT reward." |

ja/ko/th/zh도 동일 의미로 KAIA→USDT, 레벨10→레벨3 치환.

### 5. 죽은 코드 정리

- 미사용 import 제거: `Web3Provider`, `TxType`, `ethers`, `testingKaia`
- 미사용 상수 제거: `contractAddress`, `feePayer`, `abi`
- 상단 주석 처리된 test-net abi 블록, 주석 처리된 구 `requestKaiaMission` 호출부 제거

## 검증

자동 테스트 프레임워크가 없으면 수동 검증:
1. 미션 페이지에서 USDT 카드가 렌더되고 로고/배경/텍스트가 USDT·레벨3로 표시
2. 지갑 미연결 상태에서 카드 클릭 시 지갑 연결 동작
3. 카드 클릭 시 `POST /mission/kaia` 페이로드가 `{ walletAddress }` 단일 필드인지 네트워크 탭 확인
4. 결과 모달 4분기(성공/이미 수령/자격 없음/실패) 동작
5. `hasEventAccess` true/false 각각에서 카드가 올바른 위치(상단/하단)에 렌더
6. `npm run build`(또는 타입체크)로 미사용 import 제거 후 컴파일 오류 없음 확인

## 의도된 불일치 (문서화)

- 백엔드 수령 API의 raw 응답 문자열은 `"...Level 2 KAIA reward."`로 유지된다.
  따라서 프론트의 **응답 매칭 문자열은 손대지 않는다**. 화면에 보이는 문구는 전부
  i18n(레벨3/USDT)으로 처리되므로 사용자 경험에는 영향이 없다.
- `type` 필드가 `"KAIA"`로 유지되므로 컴포넌트/함수 이름(`KaiaMissionCard`,
  `requestKaiaMission`)도 그대로 둔다(최소 변경).
