import { useEffect, useState } from 'react';
import DappPortalSDK from '@linenext/dapp-portal-sdk';
import useWalletStore from '@/shared/store/useWalletStore';
import { useNavigate } from 'react-router-dom';

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
        chainId: "8217",
      });
      
      setSdk(sdkInstance);
      setInitialized(true);
      console.log('[useSDK] SDK 초기화가 완료되었습니다.');
      return sdkInstance;
    } catch (error) {
      console.error('[useSDK] SDK 초기화 중 오류 발생:', error);
      navigate('/connect-wallet');
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

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