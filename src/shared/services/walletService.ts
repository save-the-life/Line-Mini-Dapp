// walletService.ts
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import useWalletStore from "../store/useWalletStore";

export async function connectWallet(): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  const { setWalletAddress, setProvider, setWalletType, setSdk, setInitialized } =
    useWalletStore.getState();
  
  // SDK 초기화
  const sdk = await DappPortalSDK.init({
    clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
    chainId: "1001",
  });
  
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
    setWalletAddress(account);
    setWalletType(walletType);
    setSdk(sdk);
    setProvider(walletProvider);
  }
  
  return { walletAddress, provider: walletProvider, walletType, sdk };
}
