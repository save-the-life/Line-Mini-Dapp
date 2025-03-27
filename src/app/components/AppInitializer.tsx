import React, { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/User/model/userModel";
import userAuthenticationWithServer from "@/entities/User/api/userAuthentication";
import i18n from "@/shared/lib/il8n";
import SplashScreen from "./SplashScreen";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const initializedRef = useRef(false);

  // 미리 정의된 라우트 (레퍼럴 코드 식별용)
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

  // (0단계) 레퍼럴 코드 설정 함수
  const setReferralCode = () => {
    console.log("[Step 0] 시작 - 현재 URL:", window.location.href);
    localStorage.removeItem("referralCode");
    let referralCode = "";

    // (0-1) window.location.hash 검사
    if (window.location.hash && window.location.hash.startsWith("#/")) {
      referralCode = window.location.hash.slice(2);
      console.log("[Step 0-1] 해시에서 추출:", referralCode);
    }

    // (0-2) 쿼리 파라미터 'liff.state' 검사
    if (!referralCode) {
      const url = new URL(window.location.href);
      const liffState = url.searchParams.get("liff.state");
      if (liffState && liffState.startsWith("#/")) {
        referralCode = liffState.slice(2);
        console.log("[Step 0-2] liff.state에서 추출:", referralCode);
      }
    }

    // (0-3) 쿼리 파라미터 'liff.referrer' 검사
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

    // 특정 문자열 체크
    if (referralCode === "from-dapp-portal") {
      console.log(`[Step 0] "${referralCode}" 감지 -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
      return;
    }
    if (referralCode === "dapp-portal-promotions") {
      console.log(`[Step 0] "${referralCode}" 감지 (프로모션 레퍼럴 코드) -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
      return;
    }
    // 사전에 정의된 라우트와 비교
    if (knownRoutes.includes(referralCode)) {
      console.log(`[Step 0] "${referralCode}"는 knownRoutes에 있음 -> 레퍼럴 코드 아님`);
      localStorage.removeItem("referralCode");
      return;
    }
    // 정규표현식 패턴 검사
    if (referralPattern.test(referralCode)) {
      console.log(`[Step 0] "${referralCode}" 패턴 일치 -> 레퍼럴 코드로 설정`);
      localStorage.setItem("referralCode", referralCode);
    } else {
      console.log(`[Step 0] "${referralCode}" 패턴 불일치 -> 레퍼럴 코드 아님`);
    }
  };

  // (6단계 및 기존 분기) 사용자 정보 가져오기
  const getUserInfo = async (retryCount = 0) => {
    console.log("[Step 6] getUserInfo() 호출, 재시도 횟수:", retryCount);
    try {
      await fetchUserData();
      console.log("[Step 6] 사용자 데이터 fetch 성공");

      // 타임존 업데이트
      const userTimeZone = useUserStore.getState().timeZone;
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("[Step 6] 서버 타임존:", userTimeZone, "| 사용자 타임존:", currentTimeZone);
      if (userTimeZone === null || userTimeZone !== currentTimeZone) {
        try {
          await updateTimeZone(currentTimeZone);
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
          const promo = await getPromotion();
          console.log("[Step 6] getPromotion 결과:", promo);
          if (promo === "Success") {
            console.log("[Step 6] 프로모션 첫 수령 -> /promotion 이동");
            navigate("/promotion");
          } else {
            console.log("[Step 6] 프로모션 이미 수령됨 -> /dice-event 이동");
            navigate("/dice-event");
          }
        } catch (error: any) {
          console.error("[Step 6] 프로모션 확인 중 에러:", error);
          navigate("/dice-event");
        }
      } else {
        console.log("[Step 6] 일반 사용자 -> /dice-event 이동");
        navigate("/dice-event");
      }
    } catch (error: any) {
      console.error("[Step 6] getUserInfo() 에러 발생:", error);
      if (error.message === "Please choose your character first.") {
        console.log("[Step 6] 캐릭터 선택 필요 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }
      if ((error.message === "Request failed with status code 403" || error.response?.status === 403)) {
        console.log("[Step 6] 403 에러 감지 -> 재인증 필요");
        return;
      }
      if ((error.code === 500 || error.response?.status === 500) && retryCount < 1) {
        console.log("[Step 6] 500 에러 감지, accessToken 삭제 후 재시도");
        localStorage.removeItem("accessToken");
        await getUserInfo(retryCount + 1);
        return;
      } else {
        console.log("[Step 6] 그 외 에러 발생, accessToken 삭제 후 재시도");
        localStorage.removeItem("accessToken");
        await getUserInfo();
      }
      throw error;
    }
  };

  // (3~5단계) 토큰 처리 및 사용자 검증
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
        const isInitial = await userAuthenticationWithServer(lineToken, localStorage.getItem("referralCode"));
        console.log("[Step 4~5] userAuthenticationWithServer 결과:", isInitial);
        if (isInitial === undefined) {
          console.error("[Step 4~5] 사용자 인증 실패 (isInitial undefined)");
          throw new Error("사용자 인증 실패");
        } else if (isInitial) {
          console.log("[Step 4~5] 신규 사용자 감지 -> /choose-character 이동");
          navigate("/choose-character");
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
        // 0. 레퍼럴 코드 확인
        setReferralCode();

        // 1. 브라우저 언어 확인
        const browserLanguage = navigator.language;
        const lang = browserLanguage.slice(0, 2);
        const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
        const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
        console.log("[Step 1] 브라우저 언어:", browserLanguage, "-> 설정 언어:", i18nLanguage);
        i18n.changeLanguage(i18nLanguage);

        // 2. 라인브라우저 사용 여부 확인
        console.log("[Step 2] 라인브라우저 여부 확인:", liff.isInClient());
        if (!liff.isInClient()) {
          console.log("[Step 2-2] 외부 브라우저 감지 -> /connect-wallet 이동");
          navigate("/connect-wallet");
          setShowSplash(false);
          onInitialized();
          return;
        }

        // LIFF 초기화
        console.log("[InitializeApp] LIFF 초기화 시작");
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID,
          withLoginOnExternalBrowser: true,
        });
        console.log("[InitializeApp] LIFF 초기화 완료");

        // 3~5. 토큰 처리 및 사용자 검증
        await handleTokenFlow();
      } catch (error: any) {
        console.error("[InitializeApp] 초기화 중 에러 발생:", error);
        if (error.message === "Please choose your character first.") {
          console.log("[InitializeApp] 캐릭터 선택 필요 -> /choose-character 이동");
          navigate("/choose-character");
          return;
        }
        console.log("[InitializeApp] 기타 에러 발생, localStorage 초기화 및 handleTokenFlow 재호출");
        localStorage.clear();
        await handleTokenFlow();
      } finally {
        console.log("[InitializeApp] 초기화 완료, 스플래시 제거 및 onInitialized() 호출");
        setShowSplash(false);
        onInitialized();
      }
    };

    initializeApp();
  }, [fetchUserData, navigate, onInitialized]);

  if (showSplash) {
    return <SplashScreen />;
  }
  return null;
};

export default AppInitializer;
