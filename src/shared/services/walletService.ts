// walletService.ts

export async function connectWallet({ sdk, provider }: { sdk: any; provider: any }): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  if (!sdk || !provider) {
    throw new Error("SDK 또는 provider가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
  }

  const message = "Welcome to Mini Dapp";
  const [account, signature] = (await provider.request({
    method: "kaia_connectAndSign",
    params: [message],
  })) as string[];

  const walletType = provider.getWalletType() || null;
  
  if (!account) {
    throw new Error("지갑 연결 실패");
  }
  
  const walletAddress = account;
  
  return { walletAddress, provider, walletType, sdk };
}
