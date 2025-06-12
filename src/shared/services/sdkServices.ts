import DappPortalSDK from "@linenext/dapp-portal-sdk";

class SDKService {
  private static instance: SDKService;
  private sdk: any = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): SDKService {
    if (!SDKService.instance) {
      SDKService.instance = new SDKService();
    }
    return SDKService.instance;
  }

  public async initialize(): Promise<any> {
    if (!this.initialized) {
      try {
        this.sdk = await DappPortalSDK.init({
          clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
          chainId: "8217",
        });
        this.initialized = true;
        console.log("[SDK Service] SDK 초기화 성공:", this.sdk);
        return this.sdk;
      } catch (error) {
        console.error("[SDK Service] SDK 초기화 실패:", error);
        throw error;
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
}

export default SDKService; 