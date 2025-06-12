// walletService.ts
import useWalletStore from "../store/useWalletStore";

export async function connectWallet(): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  const { setWalletAddress, setProvider, setWalletType, setSdk, setInitialized } =
    useWalletStore.getState();
  
  // zustand에서 sdk 인스턴스 가져오기
  const sdk = useWalletStore.getState().sdk;
  if (!sdk) {
    throw new Error("SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
  }

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
    setProvider(walletProvider);
    setInitialized(true);
  }
  
  return { walletAddress, provider: walletProvider, walletType, sdk };
}
