import DappPortalSDK from "@linenext/dapp-portal-sdk";

// 전역 SDK 인스턴스 (진정한 싱글톤)
let globalSDKInstance: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

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
      console.log("[SDK Service] SDK가 이미 초기화되어 있습니다.");
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
      const result = await initializationPromise;
      return result;
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
        chainId: "1001",
      });
      console.log("[SDK Service] SDK 초기화 성공:", globalSDKInstance);
      return globalSDKInstance;
    } catch (error) {
      console.error("[SDK Service] SDK 초기화 실패:", error);
      globalSDKInstance = null;
      throw error;
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
    console.log("[SDK Service] SDK 상태가 재설정되었습니다.");
  }

  // 전역 인스턴스 직접 접근 (비상용)
  public static getGlobalInstance(): any {
    return globalSDKInstance;
  }
}

export default SDKService; 