// src/shared/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';

// 커스텀 config 타입 (재시도 플래그 포함)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://luckydice.savethelife.io/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송 (refreshToken)
  timeout: 30000, // 30초 타임아웃
});

// Authorization 헤더 제외 엔드포인트
const AUTH_EXCLUDE_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/login/line',
  '/auth/login/web',
  '/auth/signup',
];

// 토큰 갱신 관련 상태 (동시성 처리)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// 대기 중인 요청들에게 새 토큰 전달
const onTokenRefreshed = (newToken: string): void => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// 토큰 갱신 대기 큐에 추가
const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

// 토큰 갱신 실패 시 처리
const onRefreshFailed = (): void => {
  refreshSubscribers = [];
  tokenManager.clearAllTokens();

  // 현재 페이지가 이미 로그인 페이지가 아닌 경우에만 리다이렉트
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

// 엔드포인트가 인증 제외 대상인지 확인
const isAuthExcludedEndpoint = (url: string | undefined, baseURL: string | undefined): boolean => {
  if (!url) return false;

  try {
    const fullUrl = new URL(url, baseURL);
    return AUTH_EXCLUDE_ENDPOINTS.some((endpoint) => fullUrl.pathname.endsWith(endpoint));
  } catch {
    return AUTH_EXCLUDE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }
};

// 토큰 만료 관련 에러인지 확인
const isTokenExpiredError = (error: AxiosError): boolean => {
  if (!error.response) return false;

  const { status, data } = error.response;
  const errorMessage = typeof data === 'string' ? data : '';

  return (
    status === 401 ||
    errorMessage.includes('Token not found in Redis or expired') ||
    errorMessage.includes('token expired') ||
    errorMessage.includes('invalid token')
  );
};

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    const isExcluded = isAuthExcludedEndpoint(config.url, config.baseURL);

    // 인증 제외 엔드포인트가 아니고 토큰이 있으면 헤더에 추가
    if (!isExcluded && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData 요청 시 Content-Type 자동 설정
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // config가 없는 경우 (네트워크 에러 등)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 리프레시 엔드포인트 자체의 에러는 재시도하지 않음
    if (originalRequest.url?.includes('/auth/refresh')) {
      onRefreshFailed();
      return Promise.reject(error);
    }

    // 인증 제외 엔드포인트는 토큰 갱신 시도하지 않음
    if (isAuthExcludedEndpoint(originalRequest.url, originalRequest.baseURL)) {
      return Promise.reject(error);
    }

    // 토큰 만료 에러이고 아직 재시도하지 않은 경우
    if (isTokenExpiredError(error) && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 토큰 갱신 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // 동적 import로 순환 참조 방지
        const { useUserStore } = await import('@/entities/User/model/userModel');
        const refreshSuccessful = await useUserStore.getState().refreshToken();

        if (refreshSuccessful) {
          const newToken = tokenManager.getAccessToken();
          if (newToken) {
            onTokenRefreshed(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }

        onRefreshFailed();
        return Promise.reject(error);
      } catch (refreshError) {
        onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
