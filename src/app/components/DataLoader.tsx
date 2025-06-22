import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/entities/User/model/userModel';
import LoadingSpinner from '@/shared/components/ui/loadingSpinner';

interface DataLoaderProps {
  children: React.ReactNode;
}

const DataLoader: React.FC<DataLoaderProps> = ({ children }) => {
  const { fetchUserData, isLoading } = useUserStore();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadUserData = async () => {
      console.log("[DataLoader] Loading user data...");
      try {
        await fetchUserData();
        console.log("[DataLoader] User data loaded successfully");
        setDataLoaded(true);
      } catch (error: any) {
        console.error("[DataLoader] Failed to load user data:", error);
        
        // 401 에러인 경우 토큰 갱신 시도
        if (error.response?.status === 401) {
          console.log("[DataLoader] 401 error detected, attempting token refresh...");
          try {
            const refreshSuccessful = await useUserStore.getState().refreshToken();
            if (refreshSuccessful) {
              console.log("[DataLoader] Token refresh successful, retrying fetchUserData...");
              await fetchUserData();
              console.log("[DataLoader] User data loaded successfully after token refresh");
              setDataLoaded(true);
              return;
            }
          } catch (refreshError: any) {
            console.error("[DataLoader] Token refresh failed:", refreshError);
          }
        }
        
        // 에러가 발생해도 데이터 로드 완료로 간주 (기본값 사용)
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [fetchUserData]);

  if (!dataLoaded || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D1226]">
        <LoadingSpinner />
        <p className="text-white mt-4">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataLoader; 