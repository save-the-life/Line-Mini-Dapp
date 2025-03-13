import React, { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from "@/shared/store/useWalletStore";
import userAuthenticationWithServer from "@/entities/User/api/userAuthentication";
import i18n from "@/shared/lib/il8n";
import SplashScreen from "./SplashScreen";

interface AppInitializerProps {
  onInitialized: () => void;
}

const MAX_RETRY = 2; // 재시도 최대 횟수

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);
  const initializedRef = useRef(false);
  const { setWalletAddress, setProvider, setWalletType, setSdk, clearWallet } = useWalletStore();

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
    "item-store"
  ];
  const referralPattern = /^[A-Za-z0-9]{4,16}$/;

  // 사용자 정보 가져오기 (재시도 횟수 제한 적용)
  const getUserInfo = async (retryCount = 0) => {
    console.log("[AppInitializer] getUserInfo() 호출, retryCount:", retryCount);
    try {
      await fetchUserData();
      console.log("[AppInitializer] 사용자 데이터 정상적으로 가져옴");
      navigate("/dice-event");
    } catch (error: any) {
      console.error("[AppInitializer] getUserInfo() 중 에러:", error);

      if (error.message === "Please choose your character first.") {
        console.error("[AppInitializer] 오류: 캐릭터가 선택되지 않음 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }

      // 에러 코드가 500이거나 기타 인증 문제 시 재시도
      if (retryCount < MAX_RETRY) {
        console.error("[AppInitializer] 재시도 중, 현재 retryCount:", retryCount);
        localStorage.clear(); // 재시도 전 전체 초기화
        await getUserInfo(retryCount + 1);
        return;
      }

      // 최대 재시도 후에도 실패하면 페이지 리로드
      console.error("[AppInitializer] 최대 재시도 한도 초과 -> 페이지 리로드 실행");
      localStorage.clear();
      window.location.reload();
    }
  };

  // 레퍼럴 코드 체크 (URL 마지막 Segment 확인)
  useEffect(() => {
    console.log("[AppInitializer] 레퍼럴 코드 체크 시작");
    const url = new URL(window.location.href);
    let referralCode = "";

    // 쿼리 파라미터 'liff.state' 값 추출 및 디코딩
    const liffState = url.searchParams.get("liff.state");
    if (liffState && liffState.startsWith("#/")) {
      referralCode = liffState.slice(2); // "#/" 접두어 제거
    } else {
      // 기존 방식: URL의 마지막 세그먼트 추출
      const parts = url.pathname.split("/");
      referralCode = parts[parts.length - 1];
    }

    // "from-dapp-portal" 체크
    if (referralCode === "from-dapp-portal") {
      console.log(`[AppInitializer] "${referralCode}"는 Dapp Portal 링크 -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
      return;
    }

    // 사전에 정의된 라우트와 비교
    if (knownRoutes.includes(referralCode)) {
      console.log(`[AppInitializer] "${referralCode}"는 knownRoutes에 있음 -> 레퍼럴 코드 아님`);
      return;
    }

    // 정규표현식 패턴 검사
    if (referralPattern.test(referralCode)) {
      console.log(`[AppInitializer] "${referralCode}"는 레퍼럴 코드 패턴에 부합 -> localStorage에 저장`);
      localStorage.setItem("referralCode", referralCode);
    } else {
      console.log(`[AppInitializer] "${referralCode}"는 레퍼럴 코드가 아님`);
    }
  }, []);

  // 토큰(서버용 Access Token) 처리 및 사용자 검증
  const handleTokenFlow = async () => {
    console.log("[AppInitializer] handleTokenFlow() 시작");
    const accessToken = localStorage.getItem("accessToken");
    console.log("[AppInitializer] 현재 localStorage의 accessToken 확인:", accessToken);

    if (!accessToken) {
      console.log("[AppInitializer] 서버용 토큰이 없음 -> LINE 로그인 여부 확인");
      const lineToken = liff.getAccessToken();
      console.log("[AppInitializer] liff.getAccessToken() 결과:", lineToken);

      if (!lineToken) {
        console.error("[AppInitializer] LINE 토큰이 없습니다. dapp 접근이 불가합니다.");
        throw new Error("LINE앱으로 로그인 후 사용바랍니다.");
      }

      try {
        console.log("[AppInitializer] userAuthenticationWithServer() 호출");
        const refCode = localStorage.getItem("referralCode");
        const isInitial = await userAuthenticationWithServer(lineToken, refCode);

        if (isInitial === undefined) {
          console.error("[AppInitializer] 서버 인증 실패 (isInitial이 undefined)");
          throw new Error("사용자 인증 실패");
        } else if (isInitial) {
          console.log("[AppInitializer] 신규 사용자 -> /choose-character 이동");
          navigate("/choose-character");
        } else {
          console.log("[AppInitializer] 기존 사용자 -> getUserInfo() 시도");
          await getUserInfo();
        }
      } catch (error) {
        console.error("[AppInitializer] userAuthenticationWithServer() 중 에러:", error);
        throw error;
      }
    } else {
      console.log("[AppInitializer] 서버용 토큰이 있음 -> getUserInfo() 시도");
      await getUserInfo();
    }
  };

  // 에러 핸들링 (에러 발생 시 로컬스토리지 클리어 후 페이지 리로드)
  const handleError = (error: any, navigate: (path: string) => void) => {
    console.error("[AppInitializer] 앱 초기화 중 오류:", error);
    if (error.message === "Please choose your character first.") {
      console.error("오류: 캐릭터가 선택되지 않음 -> /choose-character 이동");
      navigate("/choose-character");
      return;
    } else {
      console.error("[AppInitializer] 그 외 오류 발생:", error);
      localStorage.clear();
      window.location.reload();
      // throw error; // 페이지 리로드 후 이 코드는 실행되지 않음
    }
  };

  useEffect(() => {
    console.log("[AppInitializer] useEffect() - initializeApp() 진입");

    // 가장 먼저 라인 브라우저 여부를 체크하여, 외부 브라우저이면 즉시 /connect-wallet으로 이동
    console.log("라인브라우저 확인 :", liff.isInClient());
    if (!liff.isInClient()) {
      console.log("[AppInitializer] 외부 브라우저 접근 감지 -> /connect-wallet 이동");
      navigate("/connect-wallet");
      setShowSplash(false);
      onInitialized();
      return;
    }

    const initializeApp = async () => {
      if (initializedRef.current) {
        console.log("[AppInitializer] 이미 초기화됨 -> 중단");
        return;
      }
      initializedRef.current = true;

      try {
        console.log("[AppInitializer] LIFF 초기화 시작");
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID,
          withLoginOnExternalBrowser: true,
        });
        console.log("[AppInitializer] LIFF 초기화 완료");

        // 브라우저 언어 기반 언어 설정
        console.log("[AppInitializer] 브라우저 언어 기반 언어 설정 시작");
        const browserLanguage = navigator.language; // 예: "ko-KR", "en-US" 등
        const lang = browserLanguage.slice(0, 2); // 앞 두 글자 추출
        const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
        const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
        console.log(`[AppInitializer] 브라우저 언어 설정: ${browserLanguage} -> ${i18nLanguage}`);
        i18n.changeLanguage(i18nLanguage);

        // 전역 관리 지갑 초기화 (필요 시 주석 해제)
        // clearWallet();

        console.log("[AppInitializer] handleTokenFlow() 호출");
        await handleTokenFlow();
      } catch (error) {
        console.error("[AppInitializer] initializeApp() try-catch 에러:", error);
        handleError(error, navigate);
      } finally {
        console.log("[AppInitializer] 초기화 최종 처리 -> 스플래시 제거 및 onInitialized() 호출");
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
