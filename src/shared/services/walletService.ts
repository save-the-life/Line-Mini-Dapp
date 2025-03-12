// walletService.ts
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import requestWallet from "@/entities/User/api/addWallet";
import useWalletStore from "../store/useWalletStore";

export async function connectWallet(): Promise<void> {
    const { setWalletAddress, setProvider, setWalletType, setSdk } = useWalletStore.getState();
    
    // SDK 초기화 (clientId와 chainId는 환경변수 또는 파라미터로 전달 가능)
    const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "8217",
    });
    console.log("[지갑 연결] sdk 초기화: ", sdk);

    const walletProvider = sdk.getWalletProvider();
    console.log("[지갑 연결] walletProvider 호출: ", walletProvider);

    const walletType = walletProvider.getWalletType() || null;
    console.log("[지갑 연결] walletType 확인: ", walletType);

    // 지갑 연결 요청
    const accounts = (await walletProvider.request({
        method: "kaia_requestAccounts",
    })) as string[];
    

    if (!accounts || !accounts[0]) {
        throw new Error("지갑 연결 실패");
    }
  
    console.log("[지갑 연결] 연결된 지갑 주소 확인: ", accounts[0]);
    const walletAddress = accounts[0];

    if (walletType) {
        try {
            // 전역 상태 업데이트
            setWalletAddress(walletAddress);
            setWalletType(walletType);
            setSdk(sdk);
            setProvider(walletProvider);

            
            // 서버에 지갑 정보 등록
            console.log("[지갑 연결] 서버에 지갑 정보 등록: ", walletAddress);
            await requestWallet(walletAddress, walletType.toUpperCase());
        } catch (error: any) {
            console.error("지갑 서버 등록 에러:", error.message);
        }
    }
}
