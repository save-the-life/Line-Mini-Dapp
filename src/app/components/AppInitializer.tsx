import React, { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/User/model/userModel";
import userAuthenticationWithServer from "@/entities/User/api/userAuthentication";
import i18n from "@/shared/lib/il8n";
import SplashScreen from "./SplashScreen";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";

// [수정] - API 호출 타임아웃 헬퍼
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage = "Timeout") => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
};

// [추가] 토큰 클리어 헬퍼
const clearTokens = () => {
  localStorage.removeItem("accessToken");
  // refresh token은 쿠키에 없으므로 별도 처리가 필요없음
};

// [추가] 안전한 navigate 호출 헬퍼
const safeNavigate = (navigate: (path: string) => void, path: string, isMounted: React.MutableRefObject<boolean>) => {
  if (isMounted.current) {
    navigate(path);
  }
};

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const initializedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const MAX_RETRY_COUNT = 3;

  // [수정] - 컴포넌트 언마운트 방지 플래그
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // 미리 정의된 라우트 및 정규표현식
  const knownRoutes = [
    "", "dice-event", "choose-character", "AI-menu", "mission", "reward",
    "invite-friends", "my-assets", "wallet", "wallet-list", "test", "previous-rewards",
    "select-pet", "regist-pet", "edit-pet", "diagnosis-list", "diagnosis-detail",
    "ai-xray-analysis", "ai-dental-analysis", "my-nfts", "reward-history", "first-reward",
    "settings", "policy-detail", "referral-rewards", "claim-history", "sdk-test",
    "choose-language", "sound-setting", "connect-wallet", "invite-friends-list",
    "edit-nickname", "previous-ranking", "item-store",
  ];
  const referralPattern = /^[A-Za-z0-9]{4,16}$/;

  // (0) 레퍼럴 코드 설정
  const setReferralCode = () => {
    console.log("[Step 0] 시작 - 현재 URL:", window.location.href);
    localStorage.removeItem("referralCode");
    let referralCode = "";

    // (0-1) window.location.hash 검사
    if (window.location.hash && window.location.hash.startsWith("#/")) {
      referralCode = window.location.hash.slice(2);
      console.log("[Step 0-1] 해시에서 추출:", referralCode);
    }

    // (0-2) 쿼리 파라미터 'liff.state'
    if (!referralCode) {
      const url = new URL(window.location.href);
      const liffState = url.searchParams.get("liff.state");
      if (liffState && liffState.startsWith("#/")) {
        referralCode = liffState.slice(2);
        console.log("[Step 0-2] liff.state에서 추출:", referralCode);
      }
    }

    // (0-3) 쿼리 파라미터 'liff.referrer'
    if (!referralCode) {
      const url = new URL(window.location.href);
      const liffReferrer = url.searchParams.get("liff.referrer");
      if (liffReferrer) {
        referralCode = "dapp-portal-promotions";
        console.log("[Step 0-3] liff.referrer 감지, 프로모션 코드 설정:", referralCode);
      }
    }

    // (0-4) URL 마지막 세그먼트 사용
    if (!referralCode) {
      const parts = window.location.pathname.split("/");
      referralCode = parts[parts.length - 1];
      console.log("[Step 0-4] URL 마지막 세그먼트 추출:", referralCode);
    }

    // 특정 문자열 및 knownRoutes 체크
    if (referralCode === "from-dapp-portal" || referralCode === "dapp-portal-promotions") {
      console.log(`[Step 0] "${referralCode}" 감지 -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
    } else if (knownRoutes.includes(referralCode)) {
      console.log(`[Step 0] "${referralCode}"는 knownRoutes에 있음 -> 레퍼럴 코드 아님`);
      localStorage.removeItem("referralCode");
    } else if (referralPattern.test(referralCode)) {
      console.log(`[Step 0] "${referralCode}" 패턴 일치 -> 레퍼럴 코드로 설정`);
      localStorage.setItem("referralCode", referralCode);
    } else {
      console.log(`[Step 0] "${referralCode}" 패턴 불일치 -> 레퍼럴 코드 아님`);
    }
  };

  // [추가] 인증 실패 공통 처리 함수
  const handleAuthFailure = async (error: any, retryCount: number) => {
    clearTokens();
    if (retryCount < MAX_RETRY_COUNT) {
      await handleTokenFlow();
      return true;
    }
    if (isMountedRef.current) setErrorMessage("사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
    return false;
  };

  // (6) 사용자 정보 가져오기
  const getUserInfo = async (retryCount = 0) => {
    console.log("[Step 6] getUserInfo() 호출, 재시도 횟수:", retryCount);
    try {
      await withTimeout(fetchUserData(), 5000, "fetchUserData Timeout");
      console.log("[Step 6] 사용자 데이터 fetch 성공");

      // 타임존 업데이트
      const userTimeZone = useUserStore.getState().timeZone;
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("[Step 6] 서버 타임존:", userTimeZone, "| 사용자 타임존:", currentTimeZone);
      if (userTimeZone === null || userTimeZone !== currentTimeZone) {
        try {
          await withTimeout(updateTimeZone(currentTimeZone), 5000, "updateTimeZone Timeout");
          console.log("[Step 6] 타임존 업데이트 성공");
        } catch (error: any) {
          console.log("[Step 6] 타임존 업데이트 에러:", error);
        }
      }

      // 프로모션 분기 처리
      const referralCode = localStorage.getItem("referralCode");
      if (referralCode === "dapp-portal-promotions") {
        console.log("[Step 6] 프로모션 레퍼럴 코드 감지, getPromotion() 호출");
        try {
          const promo = await withTimeout(getPromotion(), 5000, "getPromotion Timeout");
          console.log("[Step 6] getPromotion 결과:", promo);
          if (promo === "Success") {
            console.log("[Step 6] 프로모션 첫 수령 -> /promotion 이동");
            safeNavigate(navigate, "/promotion", isMountedRef);
          } else {
            console.log("[Step 6] 프로모션 이미 수령됨 -> /dice-event 이동");
            safeNavigate(navigate, "/dice-event", isMountedRef);
          }
        } catch (error: any) {
          console.error("[Step 6] 프로모션 확인 중 에러:", error);
          safeNavigate(navigate, "/dice-event", isMountedRef);
        }
      } else {
        console.log("[Step 6] 일반 사용자 -> /dice-event 이동");
        safeNavigate(navigate, "/dice-event", isMountedRef);
      }
    } catch (error: any) {
      console.error("[Step 6] getUserInfo() 에러 발생:", error);
      if (
        error.message === "Please choose your character first." &&
        error.response?.status === 200
      ) {
        console.log("[Step 6] 캐릭터 선택 필요(정상 케이스) -> /choose-character 이동");
        safeNavigate(navigate, "/choose-character", isMountedRef);
        return;
      }
      if (error.message === "Please choose your character first." || error.response?.status === 403) {
        console.log("[Step 6] 인증 오류 감지 -> 재인증 필요");
        const handled = await handleAuthFailure(error, retryCount);
        if (handled) return;
      }
      if (retryCount < 1) {
        console.log("[Step 6] 그 외 에러 발생, accessToken 삭제 후 재시도");
        clearTokens();
        await getUserInfo(retryCount + 1);
        return;
      }
      if (isMountedRef.current) setErrorMessage("사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  // (3~5) 토큰 처리 및 사용자 검증
  const handleTokenFlow = async () => {
    console.log("[Step 3~5] handleTokenFlow() 시작");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("[Step 3] accessToken 없음, 라인 토큰 발급 시도");
      const lineToken = liff.getAccessToken();
      console.log("[Step 3] liff.getAccessToken() 결과:", lineToken);
      if (!lineToken) {
        console.error("[Step 3] LINE 토큰 발급 실패");
        throw new Error("LINE앱으로 로그인 후 사용바랍니다.");
      }
      try {
        console.log("[Step 4~5] userAuthenticationWithServer 호출, referralCode:", localStorage.getItem("referralCode"));
        const isInitial = await withTimeout(
          userAuthenticationWithServer(lineToken, localStorage.getItem("referralCode")),
          5000,
          "userAuthentication Timeout"
        );
        console.log("[Step 4~5] userAuthenticationWithServer 결과:", isInitial);
        if (isInitial === undefined) {
          console.error("[Step 4~5] 사용자 인증 실패 (isInitial undefined)");
          throw new Error("사용자 인증 실패");
        } else if (isInitial) {
          console.log("[Step 4~5] 신규 사용자 감지 -> /choose-character 이동");
          safeNavigate(navigate, "/choose-character", isMountedRef);
        } else {
          console.log("[Step 4~5] 기존 사용자 -> getUserInfo() 호출");
          await getUserInfo();
        }
      } catch (error) {
        console.error("[Step 4~5] userAuthenticationWithServer 에러:", error);
        throw error;
      }
    } else {
      console.log("[Step 3] accessToken 존재 -> 바로 getUserInfo() 호출");
      await getUserInfo();
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      console.log("[InitializeApp] 초기화 시작");
      if (initializedRef.current) {
        console.log("[InitializeApp] 이미 초기화됨, 종료");
        return;
      }
      initializedRef.current = true;
      try {
        setReferralCode();

        const browserLanguage = navigator.language;
        const lang = browserLanguage.slice(0, 2);
        const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
        const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
        console.log("[Step 1] 브라우저 언어:", browserLanguage, "-> 설정 언어:", i18nLanguage);
        i18n.changeLanguage(i18nLanguage);

        console.log("[Step 2] 라인브라우저 여부 확인:", liff.isInClient());
        if (!liff.isInClient()) {
          console.log("[Step 2-2] 외부 브라우저 감지 -> /connect-wallet 이동");
          safeNavigate(navigate, "/connect-wallet", isMountedRef);
          setShowSplash(false);
          onInitialized();
          return;
        }

        console.log("[InitializeApp] LIFF 초기화 시작");
        await withTimeout(
          liff.init({
            liffId: import.meta.env.VITE_LIFF_ID,
            withLoginOnExternalBrowser: true,
          }),
          5000,
          "LIFF init Timeout"
        );
        console.log("[InitializeApp] LIFF 초기화 완료");

        await handleTokenFlow();
      } catch (error: any) {
        console.error("[InitializeApp] 초기화 중 에러 발생:", error);
        if (error.message === "Please choose your character first.") {
          console.log("[InitializeApp] 캐릭터 선택 필요 -> /choose-character 이동");
          safeNavigate(navigate, "/choose-character", isMountedRef);
          return;
        }
        localStorage.clear();
        if (isMountedRef.current) setErrorMessage("초기화에 실패했습니다. 다시 시도해주세요.");
        await handleTokenFlow();
      } finally {
        console.log("[InitializeApp] 초기화 완료, 스플래시 제거 및 onInitialized() 호출");
        if (isMountedRef.current) {
          setShowSplash(false);
          onInitialized();
        }
      }
    };

    initializeApp();
  }, [fetchUserData, navigate, onInitialized]);

  if (errorMessage) {
    return <div style={{ padding: "20px", textAlign: "center" }}>{errorMessage}</div>;
  }

  if (showSplash) {
    return <SplashScreen />;
  }
  return null;
};

export default AppInitializer;
