// walletService.ts
import DappPortalSDK from "@linenext/dapp-portal-sdk";
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

    // 지갑 연결 요청
    const message = 'Welcome to Mini Dapp';
    const [account, signature] = (await walletProvider.request({
        method: "kaia_connectAndSign",
        params: [message],
    })) as string[];
    
    // const message = 'Welcome to Mini Dapp';
    // console.log("[지갑 연결] 서명 확인 진행");
    // const signature = await walletProvider.request({method: 'personal_sign', params: [message, accounts[0]]});
    // console.log("[지갑 연결] 서명 확인: ", signature);

    const walletType = walletProvider.getWalletType() || null;
    console.log("사용자가 선택한 지갑 타입:", walletType);
    
    if (!account || !account[0]) {
        throw new Error("지갑 연결 실패");
    }
  
    console.log("[지갑 연결] 연결된 지갑 주소 확인: ", account[0]);
    const walletAddress = account[0];

    if (account[0] && walletType) {
        // 전역 상태 업데이트
        console.log("[지갑 전역 관리] 연결된 지갑 주소 확인: ", walletAddress);
        console.log("[지갑 전역 관리] 연결된 지갑 타입 확인: ", walletType);
        console.log("[지갑 전역 관리] 연결된 지갑 sdk 확인: ", sdk);
        console.log("[지갑 전역 관리] 연결된 지갑 provider 확인: ", walletProvider);

        setWalletAddress(walletAddress);
        setWalletType(walletType);
        setSdk(sdk);
        setProvider(walletProvider);
    }
}
