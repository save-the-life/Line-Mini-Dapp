import DappPortalSDK from "@linenext/dapp-portal-sdk";

class SDKService {
  private static instance: SDKService;
  private sdk: any = null;
  private initialized: boolean = false;
  private initializing: boolean = false;

  private constructor() {}

  public static getInstance(): SDKService {
    if (!SDKService.instance) {
      SDKService.instance = new SDKService();
    }
    return SDKService.instance;
  }

  public async initialize(): Promise<any> {
    // 이미 초기화 중이면 대기
    if (this.initializing) {
      console.log("[SDK Service] SDK 초기화가 이미 진행 중입니다.");
      // 초기화 완료까지 대기
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.sdk;
    }

    if (!this.initialized) {
      this.initializing = true;
      try {
        console.log("[SDK Service] SDK 초기화 시작...");
        this.sdk = await DappPortalSDK.init({
          clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
          chainId: "1001",
        });
        this.initialized = true;
        console.log("[SDK Service] SDK 초기화 성공:", this.sdk);
        return this.sdk;
      } catch (error) {
        console.error("[SDK Service] SDK 초기화 실패:", error);
        this.initialized = false;
        this.sdk = null;
        throw error;
      } finally {
        this.initializing = false;
      }
    }
    return this.sdk;
  }

  public getSDK(): any {
    if (!this.initialized) {
      throw new Error("SDK가 초기화되지 않았습니다.");
    }
    return this.sdk;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public isInitializing(): boolean {
    return this.initializing;
  }

  // SDK 재설정 (테스트용 또는 오류 복구용)
  public reset(): void {
    this.sdk = null;
    this.initialized = false;
    this.initializing = false;
    console.log("[SDK Service] SDK 상태가 재설정되었습니다.");
  }
}

export default SDKService; 