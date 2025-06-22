import webLoginWithAddress from '@/entities/User/api/webLogin';

/**
 * 액세스 토큰이 없을 때 지갑 주소를 사용하여 토큰을 발급받는 함수
 * @param walletAddress 지갑 주소
 * @returns 토큰 발급 성공 여부
 */
export const ensureAccessToken = async (walletAddress: string): Promise<boolean> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      console.log("[tokenUtils] Access token already exists");
      return true;
    }

    if (!walletAddress) {
      console.error("[tokenUtils] No wallet address provided");
      return false;
    }

    console.log("[tokenUtils] No access token found, attempting to get token...");
    const referralCode = localStorage.getItem("referralCode");
    const webLogin = await webLoginWithAddress(walletAddress, referralCode);
    
    if (webLogin) {
      console.log("[tokenUtils] Token obtained successfully");
      return true;
    } else {
      console.error("[tokenUtils] Failed to obtain token");
      return false;
    }
  } catch (error: any) {
    console.error("[tokenUtils] Error obtaining token:", error);
    return false;
  }
};

/**
 * 토큰이 유효한지 확인하는 함수
 * @returns 토큰 유효성 여부
 */
export const isTokenValid = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  return !!accessToken;
};

/**
 * 토큰을 제거하는 함수
 */
export const clearToken = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}; 