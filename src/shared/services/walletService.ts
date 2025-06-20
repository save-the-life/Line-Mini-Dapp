// walletService.ts
import useWalletStore from '@/shared/store/useWalletStore';

// 중복 요청 방지를 위한 플래그
let isConnecting = false;

export async function connectWallet({ sdk, provider }: { sdk: any; provider: any }): Promise<{
  walletAddress: string;
  provider: any;
  walletType: any;
  sdk: any;
}> {
  // 중복 요청 방지
  if (isConnecting) {
    throw new Error("지갑 연결이 이미 진행 중입니다. 잠시 후 다시 시도해 주세요.");
  }

  isConnecting = true;

  try {
    // SDK와 provider 유효성 검사
    if (!sdk) {
      throw new Error("SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
    }

    if (!provider) {
      throw new Error("Provider가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
    }

    const message = "Welcome to Mini Dapp";
    
    // 지갑 연결 및 서명 요청
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
    
    // JSON-RPC 오류인 경우 특별 처리
    if (error.code === -32603) {
      console.log('[walletService] JSON-RPC 내부 오류 발생:', error.message);
      // 저장된 상태는 유지 (일시적인 오류일 수 있음)
    } else if (error.code === -32001) {
      console.log('[walletService] 사용자가 지갑 연결을 취소했습니다.');
      // 사용자 취소는 저장된 상태 삭제하지 않음
    } else {
      // 다른 오류의 경우 저장된 상태 삭제
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('isWalletConnected');
    }
    
    throw error;
  } finally {
    isConnecting = false;
  }
}
