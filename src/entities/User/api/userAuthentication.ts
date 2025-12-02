// src/entities/User/api/userAuthentication.ts
import api from '@/shared/api/axiosInstance';
import { tokenManager } from '@/shared/api/tokenManager';
import { AxiosError } from 'axios';

// 에러 타입 정의
interface AuthErrorResponse {
  code?: string;
  message?: string;
}

// LINE 로그인 응답 타입
interface LineLoginResponse {
  code: string;
  data: {
    isInitial: boolean;
    userId?: number;
  };
  message?: string;
}

// 커스텀 에러 클래스
export class AuthenticationError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * LINE 토큰을 사용한 서버 인증
 * @param lineIdToken LINE에서 발급받은 ID 토큰
 * @param referrerCode 추천인 코드 (선택)
 * @returns 신규 사용자 여부 (isInitial)
 * @throws AuthenticationError 인증 실패 시
 */
export const userAuthenticationWithServer = async (
  lineIdToken: string,
  referrerCode: string | null
): Promise<boolean> => {
  const lineData = {
    lineToken: lineIdToken,
    channelId: '2006791189',
    referrerCode,
  };

  try {
    const response = await api.post<LineLoginResponse>('/auth/login/line', lineData);
    const { code, data } = response.data;
    const authorizationHeader = response.headers['authorization'];

    if (code === 'OK' && authorizationHeader) {
      const accessToken = tokenManager.extractTokenFromHeader(authorizationHeader);
      if (accessToken) {
        tokenManager.setAccessToken(accessToken);
        return data.isInitial;
      }
      throw new AuthenticationError(
        'Authorization token not found in response',
        'TOKEN_MISSING'
      );
    }

    // 서버에서 OK가 아닌 응답 코드를 반환한 경우
    throw new AuthenticationError(
      response.data.message || 'Authentication failed',
      code || 'AUTH_FAILED'
    );
  } catch (error) {
    // 이미 AuthenticationError인 경우 그대로 throw
    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Axios 에러 처리
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data as AuthErrorResponse | undefined;

      // 네트워크 에러
      if (!error.response) {
        throw new AuthenticationError(
          'Network error. Please check your connection.',
          'NETWORK_ERROR'
        );
      }

      // 서버 에러 응답
      throw new AuthenticationError(
        errorData?.message || 'Authentication failed',
        errorData?.code || 'AUTH_FAILED',
        statusCode
      );
    }

    // 기타 에러
    throw new AuthenticationError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
};

export default userAuthenticationWithServer;
