// src/shared/api/tokenManager.ts
import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 토큰 관리 유틸리티
 * - accessToken: localStorage에 저장
 * - refreshToken: 서버에서 Set-Cookie로 관리 (httpOnly)
 */
export const tokenManager = {
  // Access Token
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // Refresh Token (쿠키 기반)
  removeRefreshToken: (): void => {
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  // 모든 토큰 제거
  clearAllTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  // 토큰 존재 여부 확인
  hasAccessToken: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Authorization 헤더에서 토큰 추출
  extractTokenFromHeader: (authHeader: string | undefined): string | null => {
    if (!authHeader) return null;
    return authHeader.replace('Bearer ', '');
  },
};

export default tokenManager;
