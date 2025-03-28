import axios from 'axios';
import { useUserStore } from '@/entities/User/model/userModel';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://staging.savethelife.io//api/',
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
  withCredentials: true,
});

// 환경 변수 값 확인을 위한 콘솔 로그 추가
// console.log('🔍 [Axios] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    // Authorization 헤더를 제외할 엔드포인트 목록
    const excludeAuthEndpoints = [
      '/auth/login',
      '/auth/refresh',
    ];

    // 현재 요청의 경로(pathname)를 추출
    const url = new URL(config.url || '', config.baseURL);
    const pathname = url.pathname;

    // 제외할 엔드포인트에 포함되는지 확인
    const isExcluded = excludeAuthEndpoints.includes(pathname);

    // 제외할 엔드포인트가 아닌 경우에만 Authorization 헤더 추가
    if (!isExcluded && token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // multipart/form-data 요청 시 Content-Type을 자동 설정하도록 설정
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Axios가 자동으로 Content-Type을 설정하도록 함
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 응답 에러가 존재하는 경우, 데이터가 단순 텍스트 형태인지 확인합니다.
    const errorMessage =
      error.response && typeof error.response.data === "string"
        ? error.response.data
        : "";

    // 토큰 갱신 분기 조건:
    // 1. 응답 상태가 404 (또는 필요한 다른 상태) 인 경우,
    // 2. 또는 에러 메시지가 "Token not found in Redis or expired"를 포함하는 경우,
    // 3. 그리고 아직 재시도 하지 않은 경우 (_retry 플래그 사용)
    if (
      error.response &&
      (!originalRequest._retry) &&
      (
        error.response.status === 404 ||
        errorMessage.includes("Token not found in Redis or expired")
      )
    ) {
      originalRequest._retry = true;
      try {
        const refreshSuccessful = await useUserStore.getState().refreshToken();
        if (refreshSuccessful) {
          const newAccessToken = localStorage.getItem("accessToken");
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
        // 갱신 실패 시 로그아웃
        useUserStore.getState().logout();
        return Promise.reject(error);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
