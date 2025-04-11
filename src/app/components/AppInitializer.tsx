import React, { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/User/model/userModel";
import userAuthenticationWithServer from "@/entities/User/api/userAuthentication";
import i18n from "@/shared/lib/il8n";
import SplashScreen from "./SplashScreen";
import MaintenanceScreen from "./Maintenance";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";

// API 호출에 타임아웃을 적용하기 위한 헬퍼 함수
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage = "Timeout") => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
};

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const initializedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const is502ErrorRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const knownRoutes = [
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
  const referralPattern = /^[A-Za-z0-9]{4,16}$/;
  const MAX_RETRY_COUNT = 3;

  const setReferralCode = () => {
    console.log("[Step 0] 시작 - 현재 URL:", window.location.href);
    localStorage.removeItem("referralCode");
    let referralCode = "";

    if (window.location.hash && window.location.hash.startsWith("#/")) {
      referralCode = window.location.hash.slice(2);
      console.log("[Step 0-1] 해시에서 추출:", referralCode);
    }
    if (!referralCode) {
      const url = new URL(window.location.href);
      const liffState = url.searchParams.get("liff.state");
      if (liffState && liffState.startsWith("#/")) {
        referralCode = liffState.slice(2);
        console.log("[Step 0-2] liff.state에서 추출:", referralCode);
      }
    }
    if (!referralCode) {
      const url = new URL(window.location.href);
      const liffReferrer = url.searchParams.get("liff.referrer");
      if (liffReferrer) {
        referralCode = "dapp-portal-promotions";
        console.log("[Step 0-3] liff.referrer 감지, 프로모션 코드 설정:", referralCode);
        localStorage.removeItem("KaiaMission");
      }
    }
    if (!referralCode) {
      const parts = window.location.pathname.split("/");
      referralCode = parts[parts.length - 1];
      console.log("[Step 0-4] URL 마지막 세그먼트 추출:", referralCode);
    }
    if (referralCode === "from-dapp-portal") {
      console.log(`[Step 0] "${referralCode}" 감지 -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
      localStorage.removeItem("KaiaMission");
      return;
    }
    if (referralCode === "dapp-portal-promotions") {
      console.log(`[Step 0] "${referralCode}" 감지 (프로모션 레퍼럴 코드) -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
      localStorage.removeItem("KaiaMission");
      return;
    }
    
    if (referralCode === "kaia-reward") {
      console.log(`[Step 0] "${referralCode}" 감지 (Kaia 미션 코드) -> localStorage에 저장`);
      localStorage.setItem("KaiaMission", referralCode);
      return;
    }

    if (knownRoutes.includes(referralCode)) {
      console.log(`[Step 0] "${referralCode}"는 knownRoutes에 있음 -> 레퍼럴 코드 아님`);
      localStorage.removeItem("referralCode");
      localStorage.removeItem("KaiaMission");
      return;
    }
    if (referralPattern.test(referralCode)) {
      console.log(`[Step 0] "${referralCode}" 패턴 일치 -> 레퍼럴 코드로 설정`);
      localStorage.setItem("referralCode", referralCode);
    } else {
      console.log(`[Step 0] "${referralCode}" 패턴 불일치 -> 레퍼럴 코드 아님`);
      localStorage.removeItem("referralCode");
      localStorage.removeItem("KaiaMission");
    }
  };

  // 502 에러 여부 판단 함수 (추가 조건 포함)
  const is502Error = (error: any): boolean => {
    if (error?.code === "ERR_BAD_RESPONSE") {
      console.log("Axios code is ERR_BAD_RESPONSE -> 502로 간주");
      return true;
    }
    // fetchUserData Timeout도 502로 간주 (테스트용)
    if (error?.message === "fetchUserData Timeout") {
      console.log("Error message is 'fetchUserData Timeout' -> 502로 간주");
      return true;
    }
    if (
      error?.response?.status === 502 ||
      (error?.message && error.message.includes("502")) ||
      (error?.response?.data &&
        typeof error.response.data === "string" &&
        error.response.data.includes("<html>"))
    ) {
      return true;
    }
    return false;
  };

  const getUserInfo = async (retryCount = 0) => {
    console.log("[Step 6] getUserInfo() 호출, 재시도 횟수:", retryCount);
    try {
      await withTimeout(fetchUserData(), 5000, "fetchUserData Timeout");
      console.log("[Step 6] 사용자 데이터 fetch 성공");

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

      const referralCode = localStorage.getItem("referralCode");
      if (referralCode === "dapp-portal-promotions") {
        console.log("[Step 6] 프로모션 레퍼럴 코드 감지, getPromotion() 호출");
        try {
          const promo = await withTimeout(getPromotion(), 5000, "getPromotion Timeout");
          console.log("[Step 6] getPromotion 결과:", promo);
          if (promo === "Success") {
            console.log("[Step 6] 프로모션 첫 수령 -> /promotion 이동");
            if (isMountedRef.current) navigate("/promotion");
          } else {
            console.log("[Step 6] 프로모션 이미 수령됨 -> /dice-event 이동");
            if (isMountedRef.current) navigate("/dice-event");
          }
        } catch (error: any) {
          console.error("[Step 6] 프로모션 확인 중 에러:", error);
          if (isMountedRef.current) navigate("/dice-event");
        }
      } else {
        console.log("[Step 6] 일반 사용자 -> /dice-event 이동");
        if (isMountedRef.current) navigate("/dice-event");
      }
    } catch (error: any) {
      if (is502Error(error)) {
        console.log("[Step 6] 502 Bad Gateway 에러 감지 -> 추가 동작 없이 중단");
        is502ErrorRef.current = true;
        return;
      }
      console.error("[Step 6] getUserInfo() 에러 발생:", error);

      if (error.message === "Please choose your character first.") {
        console.log("[Step 6] 캐릭터 선택 필요 -> /choose-character 이동");
        if (isMountedRef.current) navigate("/choose-character");
        return;
      }

      if (error.message === "Request failed with status code 403" || error.response?.status === 403) {
        console.log("[Step 6] 403 에러 감지 -> 재인증 필요");
        localStorage.removeItem("accessToken");
        if (retryCount < MAX_RETRY_COUNT) {
          await handleTokenFlow();
        }
        return;
      }

      if (retryCount < 1) {
        console.log("[Step 6] 기타 에러 -> accessToken 삭제 후 재시도");
        localStorage.removeItem("accessToken");
        await getUserInfo(retryCount + 1);
        return;
      }

      if (isMountedRef.current) {
        setErrorMessage("사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.");
      }
      return;
    }
  };

  const handleTokenFlow = async () => {
    console.log("[Step 3~5] handleTokenFlow() 시작");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("[Step 3] accessToken 없음, 라인 토큰 발급 시도");
      const lineToken = liff.getAccessToken();
      console.log("[Step 3] liff.getAccessToken() 결과:", lineToken);

      if (!lineToken) {
        console.error("[Step 3] LINE 토큰 발급 실패");
        if (isMountedRef.current) {
          setErrorMessage("LINE앱으로 로그인 후 사용 바랍니다.");
        }
        return;
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
          if (isMountedRef.current) {
            setErrorMessage("사용자 인증 실패");
          }
          return;
        } else if (isInitial) {
          console.log("[Step 4~5] 신규 사용자 감지 -> /choose-character 이동");
          if (isMountedRef.current) navigate("/choose-character");
        } else {
          console.log("[Step 4~5] 기존 사용자 -> getUserInfo() 호출");
          await getUserInfo();
        }
      } catch (error: any) {
        if (is502Error(error)) {
          console.log("[Step 4~5] 502 Bad Gateway 에러 감지 -> 추가 동작 없이 중단");
          is502ErrorRef.current = true;
          return;
        }
        console.error("[Step 4~5] userAuthenticationWithServer 에러:", error);
        if (isMountedRef.current) {
          setErrorMessage("인증 과정에서 에러가 발생했습니다. 다시 시도해주세요.");
        }
        return;
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

      // 테스트를 위해 LIFF 브라우저로 들어온 유저들은 바로 MaintenanceScreen 표시
      // if (liff.isInClient()) {
      //   console.log("[InitializeApp] LIFF 브라우저 사용자 감지됨. MaintenanceScreen으로 강제 이동 (테스트 모드)");
      //   setShowMaintenance(true);
      //   setShowSplash(false);
      //   return;
      // }

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
          navigate("/connect-wallet");
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
        if (is502Error(error)) {
          console.log("[InitializeApp] 502 Bad Gateway 에러 감지 -> 추가 동작 없이 중단");
          is502ErrorRef.current = true;
          return;
        }
        console.error("[InitializeApp] 초기화 중 에러 발생:", error);

        if (error.message === "Please choose your character first.") {
          console.log("[InitializeApp] 캐릭터 선택 필요 -> /choose-character 이동");
          navigate("/choose-character");
          return;
        }

        localStorage.clear();
        if (isMountedRef.current) {
          setErrorMessage("초기화에 실패했습니다. 다시 시도해주세요.");
        }
        return;
      } finally {
        if (isMountedRef.current) {
          setShowSplash(false);
          if (is502ErrorRef.current) {
            console.log("[InitializeApp] 502 에러 감지됨, MaintenanceScreen 표시");
            setShowMaintenance(true);
          } else {
            console.log("[InitializeApp] 정상 초기화 완료, onInitialized() 호출");
            onInitialized();
          }
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
  // if (showMaintenance) {
  //   return <MaintenanceScreen />;
  // }
  return null;
};

export default AppInitializer;
