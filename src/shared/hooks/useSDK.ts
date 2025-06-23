import { useEffect, useState } from 'react';
import useWalletStore from '@/shared/store/useWalletStore';
import SDKService from '@/shared/services/sdkServices';

export const useSDK = () => {
  const { sdk, setSdk, setInitialized } = useWalletStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      if (sdk) return;

      const sdkService = SDKService.getInstance();
      if (sdkService.isInitializing() || isInitializing) return;
      
      setIsInitializing(true);
      setError(null);
      
      try {
        const sdkInstance = await sdkService.initialize();
        if (sdkInstance) {
          setSdk(sdkInstance);
          setInitialized(true);
          console.log('[useSDK] SDK 초기화 완료 및 Store 업데이트');
        }
      } catch (error) {
        console.error('[useSDK] SDK 초기화 실패:', error);
        setError(error as Error);
        setInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [sdk, setSdk, setInitialized, isInitializing]);

  return {
    sdk,
    isInitializing: isInitializing || SDKService.getInstance().isInitializing(),
    isInitialized: !!sdk,
    error,
    hasError: SDKService.getInstance().hasError(),
    reset: () => {
      SDKService.getInstance().reset();
      setSdk(null);
      setInitialized(false);
      setError(null);
    }
  };
}; 