// walletService.ts
import useWalletStore from '@/shared/store/useWalletStore';

export async function connectWallet({ sdk, provider }: { sdk: any; provider: any }): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  // SDK와 provider 유효성 검사
  if (!sdk) {
    throw new Error("SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
  }

  if (!provider) {
    throw new Error("Provider가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
  }

  try {
    const message = "Welcome to Mini Dapp";
    const [account, signature] = (await provider.request({
      method: "kaia_connectAndSign",
      params: [message],
    })) as string[];

    const walletType = provider.getWalletType() || null;
    
    if (!account) {
      throw new Error("지갑 연결 실패: 계정 정보를 받을 수 없습니다.");
    }
    
    const walletAddress = account;
    
    // 지갑 연결 성공 시 store 업데이트
    const { setWalletAddress, setProvider, setWalletType } = useWalletStore.getState();
    setWalletAddress(walletAddress);
    setProvider(provider);
    setWalletType(walletType);
    
    // 로컬 스토리지에 연결 상태 저장
    localStorage.setItem('walletAddress', walletAddress);
    localStorage.setItem('isWalletConnected', 'true');
    
    console.log('[walletService] 지갑 연결 성공:', walletAddress, walletType);
    
    return { walletAddress, provider, walletType, sdk };
  } catch (error: any) {
    console.error('[walletService] 지갑 연결 실패:', error);
    
    // 연결 실패 시 저장된 상태 삭제
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isWalletConnected');
    
    throw error;
  }
}
