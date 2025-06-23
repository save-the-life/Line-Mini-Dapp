// walletService.ts
import useWalletStore from "../store/useWalletStore";
import SDKService from "./sdkServices";

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
  
  const message = "Welcome to Mini Dapp";
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
