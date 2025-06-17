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
  const { sdk, setSdk, setInitialized } = useWalletStore();

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

      // 지갑 연결 상태 저장
      try {
        const provider = sdkInstance.getWalletProvider();
        const accounts = await provider.request({ method: 'kaia_accounts' }) as WalletAccounts;
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          localStorage.setItem('walletAddress', walletAddress);
          localStorage.setItem('isWalletConnected', 'true');
        }
      } catch (error) {
        console.log('[useSDK] 지갑이 연결되어 있지 않습니다.');
      }

      return sdkInstance;
    } catch (error) {
      console.error('[useSDK] SDK 초기화 중 오류 발생:', error);
      navigate('/connect-wallet');
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  // 앱 시작 시 저장된 지갑 연결 상태 복원
  useEffect(() => {
    const restoreWalletState = async () => {
      const savedWalletAddress = localStorage.getItem('walletAddress');
      const isWalletConnected = localStorage.getItem('isWalletConnected') === 'true';

      if (savedWalletAddress && isWalletConnected && sdk) {
        try {
          // SDK가 이미 초기화되어 있다면 지갑 연결 시도
          const provider = sdk.getWalletProvider();
          const accounts = await provider.request({ method: 'kaia_requestAccounts' }) as WalletAccounts;
          if (accounts && accounts.length > 0) {
            console.log('[useSDK] 저장된 지갑 연결 상태 복원 완료');
          } else {
            throw new Error('No accounts found');
          }
        } catch (error) {
          console.error('[useSDK] 지갑 연결 상태 복원 실패:', error);
          // 연결 실패 시 저장된 상태 삭제
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('isWalletConnected');
        }
      }
    };

    if (sdk) {
      restoreWalletState();
    }
  }, [sdk]);

  useEffect(() => {
    if (!sdk) {
      initializeSDK();
    }
  }, []);

  return {
    sdk,
    initializeSDK,
    isInitializing
  };
}; 