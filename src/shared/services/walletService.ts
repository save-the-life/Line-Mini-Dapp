// walletService.ts
import useWalletStore from "../store/useWalletStore";
import SDKService from "./sdkServices";

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
  
  // SDKService를 통해 SDK 초기화 (싱글톤)
  const sdkService = SDKService.getInstance();
  const sdk = await sdkService.initialize();
  
  // SDK 초기화 성공 시, 콘솔 로그 출력 및 상태 업데이트
  console.log("[지갑 연결] sdk 초기화 성공: ", sdk);
  setInitialized(true);

  const walletProvider = sdk.getWalletProvider();
  
  const message = "Welcome to Unifi";
  const [account, signature] = (await walletProvider.request({
    method: "kaia_connectAndSign",
    params: [message],
  })) as string[];

  const walletType = walletProvider.getWalletType() || null;
  
  if (!account) {
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
  }
  
  return { walletAddress, provider: walletProvider, walletType, sdk };
}
