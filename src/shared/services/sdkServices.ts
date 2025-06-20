import DappPortalSDK from "@linenext/dapp-portal-sdk";
import useWalletStore from "@/shared/store/useWalletStore";

// 전역 SDK 인스턴스 (진정한 싱글톤)
let globalSDKInstance: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;
let walletRestored = false;

class SDKService {
  private static instance: SDKService;

  private constructor() {}

  public static getInstance(): SDKService {
    if (!SDKService.instance) {
      SDKService.instance = new SDKService();
    }
    return SDKService.instance;
  }

  public async initialize(): Promise<any> {
    // 이미 초기화된 경우 기존 인스턴스 반환
    if (globalSDKInstance) {
      return globalSDKInstance;
    }

    // 초기화 중인 경우 기존 Promise 반환
    if (isInitializing && initializationPromise) {
      console.log("[SDK Service] SDK 초기화가 이미 진행 중입니다.");
      return initializationPromise;
    }

    // 새로운 초기화 시작
    isInitializing = true;
    initializationPromise = this.performInitialization();
    
    try {
      const sdkInstance = await initializationPromise;

      if (sdkInstance && !walletRestored) {
        await this.restoreWalletState(sdkInstance);
        walletRestored = true;
      }

      return sdkInstance;
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<any> {
    try {
      console.log("[SDK Service] SDK 초기화 시작...");
      globalSDKInstance = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "8217",
      });
      console.log("[SDK Service] SDK 초기화 성공:", globalSDKInstance);
      return globalSDKInstance;
    } catch (error) {
      console.error("[SDK Service] SDK 초기화 실패:", error);
      globalSDKInstance = null;
      throw error;
    }
  }

  private async restoreWalletState(sdkInstance: any) {
    const { setWalletAddress, setProvider, setWalletType } = useWalletStore.getState();
    
    try {
      const savedWalletAddress = localStorage.getItem('walletAddress');
      const isWalletConnected = localStorage.getItem('isWalletConnected') === 'true';

      if (savedWalletAddress && isWalletConnected) {
        console.log('[SDKService] 저장된 지갑 상태 복원 시도:', savedWalletAddress);
        
        const provider = sdkInstance.getWalletProvider();
        
        try {
          const accounts = await provider.request({ method: 'kaia_accounts' });
          
          if (Array.isArray(accounts) && accounts.length > 0 && accounts[0].toLowerCase() === savedWalletAddress.toLowerCase()) {
            setWalletAddress(accounts[0]);
            setProvider(provider);
            setWalletType(provider.getWalletType() || '');
            console.log('[SDKService] 저장된 지갑 연결 상태 복원 완료');
          } else {
            console.log('[SDKService] 저장된 지갑 주소와 현재 연결된 계정이 다릅니다. 저장된 정보 삭제.');
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('isWalletConnected');
          }
        } catch (error: any) {
          console.error('[SDKService] 지갑 연결 상태 확인 중 오류. 저장된 정보 삭제:', error);
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('isWalletConnected');
        }
      } else {
        console.log('[SDKService] 저장된 지갑 상태가 없습니다.');
      }
    } catch (error) {
        console.error('[SDKService] 지갑 상태 복원 중 오류:', error);
    }
  }

  public getSDK(): any {
    if (!globalSDKInstance) {
      throw new Error("SDK가 초기화되지 않았습니다. initialize()를 먼저 호출하세요.");
    }
    return globalSDKInstance;
  }

  public isInitialized(): boolean {
    return globalSDKInstance !== null;
  }

  public isInitializing(): boolean {
    return isInitializing;
  }

  // SDK 재설정 (테스트용 또는 오류 복구용)
  public reset(): void {
    globalSDKInstance = null;
    isInitializing = false;
    initializationPromise = null;
    walletRestored = false;
    console.log("[SDK Service] SDK 상태가 재설정되었습니다.");
  }

  // 전역 인스턴스 직접 접근 (비상용)
  public static getGlobalInstance(): any {
    return globalSDKInstance;
  }
}

export default SDKService; 