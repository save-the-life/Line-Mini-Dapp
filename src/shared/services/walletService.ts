// walletService.ts
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import useWalletStore from "../store/useWalletStore";


export async function connectWallet(): Promise<{
    walletAddress: string;
    provider: any;
    walletType: any;
    sdk: any;
  }> {
    const { setWalletAddress, setProvider, setWalletType, setSdk } = useWalletStore.getState();
    
    const sdk = await DappPortalSDK.init({
      clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
      chainId: "1001",
    });
    // console.log("[지갑 연결] sdk 초기화: ", sdk);
  
    const walletProvider = sdk.getWalletProvider();
    // console.log("[지갑 연결] walletProvider 호출: ", walletProvider);
  
    const message = 'Welcome to Mini Dapp';
    const [account, signature] = (await walletProvider.request({
      method: "kaia_connectAndSign",
      params: [message],
    })) as string[];
  
    const walletType = walletProvider.getWalletType() || null;
    // console.log("사용자가 선택한 지갑 타입:", walletType);
    
    if (!account) {
      throw new Error("지갑 연결 실패");
    }
  
    const walletAddress = account;
    // console.log("[지갑 연결] 연결된 지갑 주소 확인: ", account);
  
    if (account && walletType) {
      // console.log("[지갑 전역 관리] 연결된 지갑 주소 확인: ", account);
      // console.log("[지갑 전역 관리] 연결된 지갑 타입 확인: ", walletType);
      // console.log("[지갑 전역 관리] 연결된 지갑 sdk 확인: ", sdk);
      // console.log("[지갑 전역 관리] 연결된 지갑 provider 확인: ", walletProvider);
  
      setWalletAddress(account);
      setWalletType(walletType);
      setSdk(sdk);
      setProvider(walletProvider);
    }
  
    return { walletAddress, provider: walletProvider, walletType, sdk };
  }
  