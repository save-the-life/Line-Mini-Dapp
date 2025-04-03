import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';
import { useNavigate } from "react-router-dom";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://staging.savethelife.io/api/',
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 토큰이 없는 경우 처리: 예를 들어, 로그인 페이지로 리다이렉트
    if (!localStorage.getItem('accessToken')) {
      // 토큰이 없으면 로그아웃 처리를 하거나 로그인 페이지로 이동
      // 여기서 useNavigate를 직접 사용하기 어렵다면, 전역 history 객체를 사용하거나 별도의 logout() 함수를 만들어 호출하세요.
      // 예시로 navigate("/")를 호출합니다.
      // (주의: axios 인터셉터는 React 훅 외부에서 동작하므로, useNavigate 사용은 별도의 커스텀 history를 만드는 방식이 좋습니다.)
      window.location.href = "/"; // 또는 navigate("/login") 대신 사용
      return Promise.reject(new Error("Access token not found."));
    }
    
    // 그 외 토큰 갱신 로직은 기존 그대로 진행
    const errorMessage =
      error.response && typeof error.response.data === "string"
        ? error.response.data
        : "";

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
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = "/";
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export default api;
