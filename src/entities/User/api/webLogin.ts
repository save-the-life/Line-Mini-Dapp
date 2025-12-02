// src/entities/User/api/webLogin.ts
import api from '@/shared/api/axiosInstance';
import { tokenManager } from '@/shared/api/tokenManager';
import { AxiosError } from 'axios';

// 에러 타입 정의
interface WebLoginErrorResponse {
  code?: string;
  message?: string;
}

// 웹 로그인 응답 타입
interface WebLoginResponse {
  code: string;
  data: {
    userId?: number;
    isInitial?: boolean;
  };
  message?: string;
}

// 커스텀 에러 클래스
export class WebLoginError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'WebLoginError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * 지갑 주소를 사용한 웹 로그인
 * @param walletAddress 연결된 지갑 주소
 * @param referrerCode 추천인 코드 (선택)
 * @returns 로그인 성공 여부
 * @throws WebLoginError 로그인 실패 시
 */
export const webLoginWithAddress = async (
  walletAddress: string,
  referrerCode: string | null
): Promise<boolean> => {
  const userInfo = {
    walletAddress,
    referrerCode,
  };

  try {
    const response = await api.post<WebLoginResponse>('/auth/login/web', userInfo);
    const { code } = response.data;
    const authorizationHeader = response.headers['authorization'];

    if (code === 'OK' && authorizationHeader) {
      const accessToken = tokenManager.extractTokenFromHeader(authorizationHeader);
      if (accessToken) {
        tokenManager.setAccessToken(accessToken);
        return true;
      }
      throw new WebLoginError(
        'Authorization token not found in response',
        'TOKEN_MISSING'
      );
    }

    // 서버에서 OK가 아닌 응답 코드를 반환한 경우
    throw new WebLoginError(
      response.data.message || 'Web login failed',
      code || 'LOGIN_FAILED'
    );
  } catch (error) {
    // 이미 WebLoginError인 경우 그대로 throw
    if (error instanceof WebLoginError) {
      throw error;
    }

    // Axios 에러 처리
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data as WebLoginErrorResponse | undefined;

      // 네트워크 에러
      if (!error.response) {
        throw new WebLoginError(
          'Network error. Please check your connection.',
          'NETWORK_ERROR'
        );
      }

      // 서버 에러 응답
      throw new WebLoginError(
        errorData?.message || 'Web login failed',
        errorData?.code || 'LOGIN_FAILED',
        statusCode
      );
    }

    // 기타 에러
    throw new WebLoginError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
};

export default webLoginWithAddress;
