// walletService.ts
import liff from "@line/liff";
import useWalletStore from "../store/useWalletStore";
import SDKService from "./sdkServices";

// 디버그 로그 helper — 에러 객체를 가능한 모든 형태로 풀어서 출력한다.
// (LIFF/모바일 환경은 Eruda 로 콘솔을 봐야 하므로 한눈에 들어오게 prefix 통일)
const logError = (tag: string, error: any) => {
  console.error(`[지갑 연결][${tag}] 에러 발생`);
  try {
    console.error(`[지갑 연결][${tag}] message:`, error?.message);
    console.error(`[지갑 연결][${tag}] code:`, error?.code);
    console.error(`[지갑 연결][${tag}] data:`, error?.data);
    console.error(`[지갑 연결][${tag}] name:`, error?.name);
    console.error(`[지갑 연결][${tag}] stack:`, error?.stack);
    // 일부 SDK 에러는 enumerable 하지 않은 프로퍼티를 가진다.
    const ownKeys = error ? Object.getOwnPropertyNames(error) : [];
    const dump: Record<string, unknown> = {};
    ownKeys.forEach((k) => {
      try { dump[k] = (error as any)[k]; } catch { /* noop */ }
    });
    console.error(`[지갑 연결][${tag}] ownProps:`, dump);
    console.error(`[지갑 연결][${tag}] raw:`, error);
  } catch (e) {
    console.error(`[지갑 연결][${tag}] 에러 직렬화 실패:`, e);
  }
};

const logEnv = () => {
  let isInClient: unknown = "unknown";
  try { isInClient = liff?.isInClient ? liff.isInClient() : "liff-not-ready"; } catch (e) { isInClient = `err:${(e as Error).message}`; }
  console.log("[지갑 연결] 환경 정보:", {
    origin: window.location.origin,
    host: window.location.host,
    href: window.location.href,
    protocol: window.location.protocol,
    isInClient,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });
};

// kaia_connectAndSign 이 응답 없이 영원히 hang 되는 케이스 방지용 타임아웃 헬퍼.
// SDK 1.6.0 의 reown 호출이 실패하면 응답이 안 오므로, 일정 시간 후 명시적으로 에러를 발생시킨다.
const KAIA_CONNECT_TIMEOUT_MS = 60_000;

class ConnectTimeoutError extends Error {
  code = -32099;
  constructor(elapsedMs: number) {
    super(`kaia_connectAndSign 응답 대기 ${elapsedMs}ms 초과 (timeout)`);
    this.name = "ConnectTimeoutError";
  }
}

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ConnectTimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  }) as Promise<T>;
};

// "Already processing request to wallet" 같은 SDK 내부 락 에러 식별용.
// 한 번 락이 걸리면 SDK 인스턴스를 reset 해야 다음 클릭이 동작한다.
const isStuckLockError = (error: any): boolean => {
  if (!error) return false;
  if (error?.code === -32603) return true;
  if (typeof error?.message === "string" && /already processing/i.test(error.message)) return true;
  return false;
};

/**
 * 지갑 연결 해제 함수 (Unifi Apps SDK 가이드 준수)
 *
 * - walletProvider.disconnectWallet() 를 호출해 SDK 측 연결을 해제한다.
 *   이렇게 해야 다음 연결 시도에서 사용자가 다시 wallet 선택 화면을 통해
 *   다른 wallet 타입(Web/Liff/Extension/Mobile/OKX/BITGET 등)을 고를 수 있다.
 * - Zustand store 와 localStorage 의 연결 정보도 함께 초기화한다.
 * - SDK 인스턴스를 reset 해서, 새 연결 시 wallet 선택 플로우가 정상 동작하도록 한다.
 * - reload=true 면 docs 예시와 동일하게 페이지를 새로고침한다.
 *   (지갑/SDK 이상으로 앱 진입이 막힌 사용자를 복구하기 위한 용도)
 */
export const disconnectWallet = async (
  options: { reload?: boolean } = {}
): Promise<void> => {
  const { reload = false } = options;
  const { provider, clearWallet } = useWalletStore.getState();

  try {
    if (provider && typeof provider.disconnectWallet === "function") {
      await provider.disconnectWallet();
      console.log("[지갑 해제] walletProvider.disconnectWallet() 완료");
    } else {
      console.log("[지갑 해제] provider 가 없거나 disconnectWallet 미지원, store 정리만 진행");
    }
  } catch (error: any) {
    // 사용자가 disconnect 확인 팝업을 닫은 경우(-32001) 등은 throw 해서 호출자가 처리하도록 한다.
    console.error("[지갑 해제] disconnectWallet 호출 중 오류:", error);
    throw error;
  } finally {
    clearWallet();
    SDKService.getInstance().reset();
  }

  if (reload) {
    window.location.reload();
  }
};

// 지갑 연결 상태 검증 함수
export const verifyWalletConnection = async (): Promise<boolean> => {
  try {
    const savedAddress = localStorage.getItem('walletAddress');
    const isConnected = localStorage.getItem('isWalletConnected') === 'true';
    
    if (!savedAddress || !isConnected) {
      return false;
    }
    
    const sdkService = SDKService.getInstance();
    const sdk = await sdkService.initialize();
    const provider = sdk.getWalletProvider();
    
    const accounts = await provider.request({ method: 'kaia_accounts' });
    const isActuallyConnected = Array.isArray(accounts) && 
                               accounts.length > 0 && 
                               accounts[0].toLowerCase() === savedAddress.toLowerCase();
    
    if (!isActuallyConnected) {
      // 실제 연결이 끊어진 경우 localStorage 정리
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('isWalletConnected');
      console.log("[지갑 검증] 실제 연결이 끊어져 localStorage 정리");
    }
    
    return isActuallyConnected;
  } catch (error) {
    console.error("[지갑 검증] 검증 중 오류:", error);
    return false;
  }
};

export async function connectWallet(): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  const { setWalletAddress, setProvider, setWalletType, setSdk, setInitialized } =
    useWalletStore.getState();

  console.log("[지갑 연결] connectWallet 호출 시작");
  logEnv();

  // 1) SDK 초기화
  let sdk: any;
  try {
    const sdkService = SDKService.getInstance();
    sdk = await sdkService.initialize();
    console.log("[지갑 연결] SDK 초기화 성공:", sdk);
    setInitialized(true);
  } catch (error) {
    logError("SDK init", error);
    throw error;
  }

  // 2) walletProvider 획득
  let walletProvider: any;
  try {
    walletProvider = sdk.getWalletProvider();
    let preWalletType: unknown = "unknown";
    try { preWalletType = walletProvider?.getWalletType?.(); } catch (e) { preWalletType = `err:${(e as Error).message}`; }
    console.log("[지갑 연결] walletProvider 획득:", {
      hasProvider: !!walletProvider,
      preWalletType,
    });
  } catch (error) {
    logError("getWalletProvider", error);
    throw error;
  }

  // 3) kaia_connectAndSign 요청 (연결 + 서명 동시) — 60초 타임아웃 + 락 자동 복구
  const message = "Welcome to Unifi";
  let account: string | undefined;
  let signature: string | undefined;
  try {
    console.log("[지갑 연결] kaia_connectAndSign 요청 시작:", { message, timeoutMs: KAIA_CONNECT_TIMEOUT_MS });
    const startedAt = Date.now();
    const result = (await withTimeout(
      walletProvider.request({
        method: "kaia_connectAndSign",
        params: [message],
      }) as Promise<string[]>,
      KAIA_CONNECT_TIMEOUT_MS
    )) as string[];
    const elapsedMs = Date.now() - startedAt;
    console.log("[지갑 연결] kaia_connectAndSign 응답 수신:", {
      elapsedMs,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : null,
      raw: result,
    });
    [account, signature] = result || [];
    console.log("[지갑 연결] 응답 분해:", {
      account,
      signaturePreview: signature ? `${signature.slice(0, 10)}...${signature.slice(-6)}` : signature,
    });
  } catch (error) {
    logError("kaia_connectAndSign", error);
    // 타임아웃이거나 SDK 내부 락 에러("Already processing")인 경우, SDK 인스턴스를 reset 해
    // 다음 사용자 시도가 곧바로 락 에러를 또 만나는 상황을 방지한다.
    const isTimeout = error instanceof ConnectTimeoutError;
    if (isTimeout || isStuckLockError(error)) {
      try {
        console.warn("[지갑 연결] SDK 락/타임아웃 감지 → SDKService reset & store 정리");
        useWalletStore.getState().clearWallet();
        SDKService.getInstance().reset();
      } catch (resetErr) {
        console.error("[지갑 연결] SDK reset 중 추가 오류:", resetErr);
      }
    }
    throw error;
  }

  // 4) walletType 확인
  let walletType: any = null;
  try {
    walletType = walletProvider.getWalletType() || null;
    console.log("[지갑 연결] walletType:", walletType);
  } catch (error) {
    logError("getWalletType", error);
  }

  if (!account) {
    console.error("[지갑 연결] account 가 비어 있음. 연결 실패로 간주.");
    throw new Error("지갑 연결 실패");
  }

  const walletAddress = account;

  if (account && walletType) {
    // Zustand Store 업데이트
    setWalletAddress(account);
    setWalletType(walletType);
    setSdk(sdk);
    setProvider(walletProvider);

    // localStorage에 지갑 연결 정보 저장 (메인 브랜치와 동일한 방식)
    localStorage.setItem('walletAddress', account);
    localStorage.setItem('isWalletConnected', 'true');
    console.log("[지갑 연결] localStorage에 연결 정보 저장 완료:", account);
  } else {
    console.warn("[지갑 연결] walletType 누락 - store 갱신 생략", { account, walletType });
  }

  return { walletAddress, provider: walletProvider, walletType, sdk };
}
