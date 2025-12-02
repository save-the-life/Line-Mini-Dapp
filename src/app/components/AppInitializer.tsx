import React, { useEffect, useRef, useState, useCallback } from "react";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/User/model/userModel";
import userAuthenticationWithServer, {
  AuthenticationError,
} from "@/entities/User/api/userAuthentication";
import { tokenManager } from "@/shared/api/tokenManager";
import i18n from "@/shared/lib/il8n";
import SplashScreen from "./SplashScreen";
import MaintenanceScreen from "./Maintenance";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import SDKService from "@/shared/services/sdkServices";

// 상수 정의
const TIMEOUT_MS = 5000;
const MAX_RETRY_COUNT = 3;
const SUPPORTED_LANGUAGES = ["en", "ko", "ja", "zh", "th"];
const KNOWN_ROUTES = [
  "",
  "dice-event",
  "choose-character",
  "AI-menu",
  "mission",
  "reward",
  "invite-friends",
  "my-assets",
  "wallet",
  "wallet-list",
  "test",
  "previous-rewards",
  "select-pet",
  "regist-pet",
  "edit-pet",
  "diagnosis-list",
  "diagnosis-detail",
  "ai-xray-analysis",
  "ai-dental-analysis",
  "my-nfts",
  "reward-history",
  "first-reward",
  "settings",
  "policy-detail",
  "referral-rewards",
  "claim-history",
  "sdk-test",
  "choose-language",
  "sound-setting",
  "connect-wallet",
  "invite-friends-list",
  "edit-nickname",
  "previous-ranking",
  "item-store",
];
const REFERRAL_PATTERN = /^[A-Za-z0-9]{4,16}$/;

// 특수 레퍼럴 코드
const SPECIAL_REFERRAL_CODES = {
  FROM_DAPP_PORTAL: "from-dapp-portal",
  DAPP_PORTAL_PROMOTIONS: "dapp-portal-promotions",
  KAIA_REWARD: "kaia-reward",
} as const;

// 타임아웃 헬퍼 함수
const withTimeout = <T,>(
  promise: Promise<T>,
  ms: number,
  errorMessage = "Timeout"
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
};

// 502 에러 판별 함수
const isServerError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;

  // Axios 에러 코드 체크
  if (err.code === "ERR_BAD_RESPONSE") return true;

  // 타임아웃 에러 체크
  if (err.message === "fetchUserData Timeout") return true;

  // 응답 상태 코드 체크
  const response = err.response as Record<string, unknown> | undefined;
  if (response?.status === 502) return true;

  // 에러 메시지 체크
  if (typeof err.message === "string" && err.message.includes("502")) return true;

  // HTML 응답 체크 (서버 에러 페이지)
  if (typeof response?.data === "string" && response.data.includes("<html>")) return true;

  return false;
};

// 레퍼럴 코드 추출 및 저장
const extractAndSaveReferralCode = (): void => {
  localStorage.removeItem("referralCode");
  let referralCode = "";

  // 1. 해시에서 추출
  if (window.location.hash?.startsWith("#/")) {
    referralCode = window.location.hash.slice(2);
  }

  // 2. liff.state에서 추출
  if (!referralCode) {
    const url = new URL(window.location.href);
    const liffState = url.searchParams.get("liff.state");
    if (liffState?.startsWith("#/")) {
      referralCode = liffState.slice(2);
    }
  }

  // 3. liff.referrer 체크 (프로모션)
  if (!referralCode) {
    const url = new URL(window.location.href);
    if (url.searchParams.get("liff.referrer")) {
      referralCode = SPECIAL_REFERRAL_CODES.DAPP_PORTAL_PROMOTIONS;
      localStorage.removeItem("KaiaMission");
    }
  }

  // 4. URL 경로에서 추출
  if (!referralCode) {
    const parts = window.location.pathname.split("/");
    referralCode = parts[parts.length - 1];
  }

  // 특수 레퍼럴 코드 처리
  if (
    referralCode === SPECIAL_REFERRAL_CODES.FROM_DAPP_PORTAL ||
    referralCode === SPECIAL_REFERRAL_CODES.DAPP_PORTAL_PROMOTIONS
  ) {
    localStorage.setItem("referralCode", referralCode);
    localStorage.removeItem("KaiaMission");
    return;
  }

  if (referralCode === SPECIAL_REFERRAL_CODES.KAIA_REWARD) {
    localStorage.setItem("KaiaMission", referralCode);
    return;
  }

  // 알려진 라우트는 레퍼럴 코드가 아님
  if (KNOWN_ROUTES.includes(referralCode)) {
    localStorage.removeItem("referralCode");
    localStorage.removeItem("KaiaMission");
    return;
  }

  // 패턴 매칭으로 유효한 레퍼럴 코드인지 확인
  if (REFERRAL_PATTERN.test(referralCode)) {
    localStorage.setItem("referralCode", referralCode);
    localStorage.removeItem("KaiaMission");
  } else {
    localStorage.removeItem("referralCode");
    localStorage.removeItem("KaiaMission");
  }
};

// 브라우저 언어 설정
const initializeLanguage = (): void => {
  const browserLanguage = navigator.language.slice(0, 2);
  const language = SUPPORTED_LANGUAGES.includes(browserLanguage)
    ? browserLanguage
    : "en";
  i18n.changeLanguage(language);
};

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();

  const [showSplash, setShowSplash] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const isServerErrorRef = useRef(false);
  const isMountedRef = useRef(true);

  // 컴포넌트 언마운트 시 플래그 설정
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 안전한 에러 메시지 설정
  const safeSetError = useCallback((message: string) => {
    if (isMountedRef.current) {
      setErrorMessage(message);
    }
  }, []);

  // 안전한 네비게이션
  const safeNavigate = useCallback(
    (path: string) => {
      if (isMountedRef.current) {
        navigate(path);
      }
    },
    [navigate]
  );

  // 사용자 정보 조회
  const getUserInfo = useCallback(
    async (retryCount = 0): Promise<void> => {
      try {
        await withTimeout(fetchUserData(), TIMEOUT_MS, "fetchUserData Timeout");

        // 타임존 업데이트
        const userTimeZone = useUserStore.getState().timeZone;
        const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (userTimeZone === null || userTimeZone !== currentTimeZone) {
          try {
            await withTimeout(
              updateTimeZone(currentTimeZone),
              TIMEOUT_MS,
              "updateTimeZone Timeout"
            );
          } catch {
            // 타임존 업데이트 실패는 무시
          }
        }

        // 프로모션 레퍼럴 코드 처리
        const referralCode = localStorage.getItem("referralCode");
        if (referralCode === SPECIAL_REFERRAL_CODES.DAPP_PORTAL_PROMOTIONS) {
          try {
            const promo = await withTimeout(
              getPromotion(),
              TIMEOUT_MS,
              "getPromotion Timeout"
            );
            safeNavigate(promo === "Success" ? "/promotion" : "/dice-event");
          } catch {
            safeNavigate("/dice-event");
          }
        } else {
          safeNavigate("/dice-event");
        }
      } catch (error) {
        // 서버 에러 처리
        if (isServerError(error)) {
          isServerErrorRef.current = true;
          return;
        }

        const err = error as Error;

        // 캐릭터 선택 필요
        if (err.message === "Please choose your character first.") {
          safeNavigate("/choose-character");
          return;
        }

        // 403 에러 - 재인증 필요
        const axiosError = error as { response?: { status?: number } };
        if (
          err.message === "Request failed with status code 403" ||
          axiosError.response?.status === 403
        ) {
          tokenManager.removeAccessToken();
          if (retryCount < MAX_RETRY_COUNT) {
            await handleTokenFlow();
          }
          return;
        }

        // 기타 에러 - 한 번 재시도
        if (retryCount < 1) {
          tokenManager.removeAccessToken();
          await getUserInfo(retryCount + 1);
          return;
        }

        safeSetError("사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
      }
    },
    [fetchUserData, safeNavigate, safeSetError]
  );

  // 토큰 흐름 처리
  const handleTokenFlow = useCallback(async (): Promise<void> => {
    const accessToken = tokenManager.getAccessToken();

    if (accessToken) {
      // 토큰이 있으면 사용자 정보 조회
      await getUserInfo();
      return;
    }

    // 토큰이 없으면 LINE 인증 시도
    const lineToken = liff.getAccessToken();

    if (!lineToken) {
      safeSetError("LINE앱으로 로그인 후 사용 바랍니다.");
      return;
    }

    try {
      const referralCode = localStorage.getItem("referralCode");
      const isInitial = await withTimeout(
        userAuthenticationWithServer(lineToken, referralCode),
        TIMEOUT_MS,
        "userAuthentication Timeout"
      );

      if (isInitial) {
        // 신규 사용자
        safeNavigate("/choose-character");
      } else {
        // 기존 사용자
        await getUserInfo();
      }
    } catch (error) {
      if (isServerError(error)) {
        isServerErrorRef.current = true;
        return;
      }

      if (error instanceof AuthenticationError) {
        safeSetError(
          error.code === "NETWORK_ERROR"
            ? "네트워크 연결을 확인해주세요."
            : "인증에 실패했습니다. 다시 시도해주세요."
        );
      } else {
        safeSetError("인증 과정에서 에러가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }, [getUserInfo, safeNavigate, safeSetError]);

  // 앱 초기화
  useEffect(() => {
    const initializeApp = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        // 레퍼럴 코드 설정
        extractAndSaveReferralCode();

        // 언어 설정
        initializeLanguage();

        // 외부 브라우저 체크
        if (!liff.isInClient()) {
          navigate("/connect-wallet");
          setShowSplash(false);
          onInitialized();
          return;
        }

        // LIFF 초기화
        await withTimeout(
          liff.init({
            liffId: import.meta.env.VITE_LIFF_ID,
            withLoginOnExternalBrowser: true,
          }),
          TIMEOUT_MS,
          "LIFF init Timeout"
        );

        // SDK 초기화
        const sdkService = SDKService.getInstance();
        await sdkService.initialize();

        // 토큰 흐름 처리
        await handleTokenFlow();
      } catch (error) {
        if (isServerError(error)) {
          isServerErrorRef.current = true;
          return;
        }

        const err = error as Error;
        if (err.message === "Please choose your character first.") {
          navigate("/choose-character");
          return;
        }

        // 초기화 실패 시 로컬 스토리지 정리
        tokenManager.clearAllTokens();
        safeSetError("초기화에 실패했습니다. 다시 시도해주세요.");
      } finally {
        if (isMountedRef.current) {
          setShowSplash(false);

          if (isServerErrorRef.current) {
            setShowMaintenance(true);
          } else {
            onInitialized();
          }
        }
      }
    };

    initializeApp();
  }, [fetchUserData, navigate, onInitialized, handleTokenFlow, safeSetError]);

  // 에러 화면
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5 text-center">
        <div>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 스플래시 화면
  if (showSplash) {
    return <SplashScreen />;
  }

  // 점검 화면
  if (showMaintenance) {
    return <MaintenanceScreen />;
  }

  return null;
};

export default AppInitializer;
