import { useEffect, useState } from 'react';
import DappPortalSDK from '@linenext/dapp-portal-sdk';
import useWalletStore from '@/shared/store/useWalletStore';
import { useNavigate } from 'react-router-dom';

let sdkInstance: any = null;

// 지갑 계정 배열 타입 정의
type WalletAccounts = string[];

export const useSDK = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const navigate = useNavigate();
  const { sdk, setSdk, setInitialized, setWalletAddress, setProvider, setWalletType } = useWalletStore();

  const initializeSDK = async () => {
    if (sdk) {
      console.log('[useSDK] SDK가 이미 초기화되어 있습니다.');
      return sdk;
    }

    if (isInitializing) {
      console.log('[useSDK] SDK 초기화가 이미 진행 중입니다.');
      return null;
    }

    setIsInitializing(true);
    try {
      console.log('[useSDK] SDK 초기화를 시작합니다...');
      const sdkInstance = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "1001",
      });

      setSdk(sdkInstance);
      setInitialized(true);
      console.log('[useSDK] SDK 초기화가 완료되었습니다.');

      // 지갑 연결 상태 복원 시도
      await restoreWalletState(sdkInstance);

      return sdkInstance;
    } catch (error) {
      console.error('[useSDK] SDK 초기화 중 오류 발생:', error);
      setInitialized(false);
      navigate('/connect-wallet');
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  // 지갑 상태 복원 함수
  const restoreWalletState = async (sdkInstance: any) => {
    try {
      const savedWalletAddress = localStorage.getItem('walletAddress');
      const isWalletConnected = localStorage.getItem('isWalletConnected') === 'true';

      if (savedWalletAddress && isWalletConnected) {
        console.log('[useSDK] 저장된 지갑 상태 복원 시도:', savedWalletAddress);
        
        const provider = sdkInstance.getWalletProvider();
        
        // 먼저 현재 연결된 계정 확인
        const accounts = await provider.request({ method: 'kaia_accounts' }) as WalletAccounts;
        
        if (accounts && accounts.length > 0) {
          const currentAddress = accounts[0];
          if (currentAddress.toLowerCase() === savedWalletAddress.toLowerCase()) {
            // 지갑이 이미 연결되어 있고 주소가 일치
            setWalletAddress(currentAddress);
            setProvider(provider);
            setWalletType(provider.getWalletType() || '');
            console.log('[useSDK] 저장된 지갑 연결 상태 복원 완료');
            return;
          }
        }

        // 저장된 주소와 현재 연결된 주소가 다르거나 연결이 안된 경우
        // 새로운 연결 시도
        try {
          const newAccounts = await provider.request({ method: 'kaia_requestAccounts' }) as WalletAccounts;
          if (newAccounts && newAccounts.length > 0) {
            const newAddress = newAccounts[0];
            setWalletAddress(newAddress);
            setProvider(provider);
            setWalletType(provider.getWalletType() || '');
            localStorage.setItem('walletAddress', newAddress);
            localStorage.setItem('isWalletConnected', 'true');
            console.log('[useSDK] 새로운 지갑 연결 완료:', newAddress);
          }
        } catch (error) {
          console.log('[useSDK] 지갑 재연결 실패, 저장된 상태 삭제');
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('isWalletConnected');
        }
      } else {
        console.log('[useSDK] 저장된 지갑 상태가 없습니다.');
      }
    } catch (error) {
      console.error('[useSDK] 지갑 상태 복원 중 오류:', error);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('isWalletConnected');
    }
  };

  // SDK가 초기화된 후 지갑 상태 복원
  useEffect(() => {
    if (sdk && !isInitializing) {
      restoreWalletState(sdk);
    }
  }, [sdk, isInitializing]);

  // 컴포넌트 마운트 시 SDK 초기화
  useEffect(() => {
    if (!sdk && !isInitializing) {
      initializeSDK();
    }
  }, []);

  return {
    sdk,
    initializeSDK,
    isInitializing
  };
}; 