import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Images from "@/shared/assets/images";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from "@/shared/store/useWalletStore";
import i18n from "@/shared/lib/il8n";
import { connectWallet, verifyWalletConnection } from "@/shared/services/walletService";
import requestWallet from "@/entities/User/api/addWallet";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import MaintenanceScreen from "@/app/components/Maintenance";
import DappPortalSDK from "@linenext/dapp-portal-sdk";

// 간단한 모바일 체크 함수
const checkIsMobile = (): boolean =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 502 에러 여부를 판단하는 헬퍼 함수
const is502Error = (error: any): boolean => {
  if (error?.code === "ERR_BAD_RESPONSE") {
    console.log("Axios code is ERR_BAD_RESPONSE -> 502로 간주");
    return true;
  }
  if (error?.response?.status === 502) {
    return true;
  }
  if (error?.message && error.message.includes("502")) {
    return true;
  }
  if (
    error?.response?.data &&
    typeof error.response.data === "string" &&
    error.response.data.includes("<html>")
  ) {
    return true;
  }
  return false;
};

// 테스터 지갑 주소를 미리 정의 (여기에 테스터 지갑 주소들을 기입)
// const testerWallets = ["0xbe9ec75c91eff6a958d27de9b9b5faeafb00e5c7", "0xe7173731309e07da77da0452179212b9ea7dbfd7"];

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { fetchUserData } = useUserStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMaintenance, setShowMaintenance] = useState<boolean>(false);
  const [isAutoLoginInProgress, setIsAutoLoginInProgress] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(checkIsMobile());

    // 브라우저 언어 기반 언어 설정
    const browserLanguage = navigator.language;
    const lang = browserLanguage.slice(0, 2);
    const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
    const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
    i18n.changeLanguage(i18nLanguage);
  }, []);

  // 자동 로그인 시도 함수
  const attemptAutoLogin = async () => {
    console.log("[ConnectWallet] 자동 로그인 시도 시작");
    setIsAutoLoginInProgress(true);

    try {
      // 1. localStorage에서 지갑 연결 정보 확인
      const savedAddress = localStorage.getItem('walletAddress');
      const isConnected = localStorage.getItem('isWalletConnected') === 'true';
      const accessToken = localStorage.getItem('accessToken');

      console.log("[ConnectWallet] 저장된 지갑 정보:", { savedAddress, isConnected, hasToken: !!accessToken });

      if (!savedAddress || !isConnected) {
        console.log("[ConnectWallet] 저장된 지갑 연결 정보 없음");
        setIsAutoLoginInProgress(false);
        return;
      }

      // 2. SDK 초기화
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "8217",
      });

      // 3. 실제 지갑 연결 상태 검증
      const isActuallyConnected = await verifyWalletConnection();
      if (!isActuallyConnected) {
        console.log("[ConnectWallet] 실제 지갑 연결 상태 불일치");
        // localStorage 정리
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('isWalletConnected');
        setIsAutoLoginInProgress(false);
        return;
      }

      // 4. 토큰 존재 여부 확인
      if (!accessToken) {
        console.log("[ConnectWallet] 토큰 없음, 웹 로그인 시도");
        // 토큰이 없으면 웹 로그인 시도
        const referralCode = localStorage.getItem("referralCode");
        const webLogin = await webLoginWithAddress(savedAddress, referralCode);
        if (!webLogin) {
          console.log("[ConnectWallet] 웹 로그인 실패");
          setIsAutoLoginInProgress(false);
          return;
        }
      }

      // 5. 사용자 정보 조회
      console.log("[ConnectWallet] 사용자 정보 조회 시도");
      await fetchUserData();

      // 6. 타임존 업데이트
      const userTimeZone = useUserStore.getState().timeZone;
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone === null || userTimeZone !== currentTimeZone) {
        try {
          await updateTimeZone(currentTimeZone);
        } catch (error: any) {
          console.log("timezone error", error);
        }
      }

      // 7. 프로모션 확인 후 메인 페이지 이동
      const referralCode = localStorage.getItem("referralCode");
      if (referralCode === "dapp-portal-promotions") {
        try {
          const promo = await getPromotion();
          if (promo === "Success") {
            console.log("[ConnectWallet] 자동 로그인 성공 -> /promotion 이동");
            navigate("/promotion");
          } else {
            console.log("[ConnectWallet] 자동 로그인 성공 -> /dice-event 이동");
            navigate("/dice-event");
          }
        } catch (error: any) {
          console.log("[ConnectWallet] 자동 로그인 성공 -> /dice-event 이동 (프로모션 에러)");
          navigate("/dice-event");
        }
      } else {
        console.log("[ConnectWallet] 자동 로그인 성공 -> /dice-event 이동");
        navigate("/dice-event");
      }

    } catch (error: any) {
      console.log("[ConnectWallet] 자동 로그인 실패:", error);
      
      if (is502Error(error)) {
        console.log("[ConnectWallet] 502 에러 감지됨 -> MaintenanceScreen 표시");
        setShowMaintenance(true);
        return;
      }

      if (error.message === "Please choose your character first.") {
        console.log("[ConnectWallet] 캐릭터 선택 필요 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }

      // 토큰 관련 에러 시 localStorage 정리
      if (error.response?.data === "Token not found in Redis or expired") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('isWalletConnected');
      }

      setIsAutoLoginInProgress(false);
    }
  };

  // 페이지 로드 시 자동 로그인 시도
  useEffect(() => {
    attemptAutoLogin();
  }, []);

  const handleConnectWallet = async (retry = false) => {
    try {
      // 외부 모듈에서 지갑 연결 및 전역 상태 업데이트 수행
      await connectWallet();

      // 연결된 지갑 주소와 지갑 타입을 상태에서 가져옴
      const { walletAddress, walletType, clearWallet } = useWalletStore.getState();

      // 테스터 지갑 주소 목록에 포함되어 있는지 확인
      // if (!testerWallets.includes(walletAddress)) {
      //   console.log("현재 지갑 주소: ", walletAddress);
      //   console.log("테스터 지갑 주소가 아님 -> MaintenanceScreen 표시");
      //   setShowMaintenance(true);
      //   return;
      // }

      // 로컬스토리지에서 레퍼럴 코드 확인
      const referralCode = localStorage.getItem("referralCode");

      // 주소 기반 Web 로그인 (502 에러 발생 시 에러를 throw하도록 webLoginWithAddress 수정 필요)
      const webLogin = await webLoginWithAddress(walletAddress, referralCode);
      if (!webLogin) {
        throw new Error("Web login failed.");
      }

      // webLoginWithAddress 성공 시, requestWallet 실행
      if (walletAddress && walletType) {
        await requestWallet(walletAddress, walletType.toUpperCase());
      } else {
        clearWallet();
        await connectWallet();
      }

      await fetchUserData();

      const userTimeZone = useUserStore.getState().timeZone;
      console.log("서버로부터 받은 타임존: ", userTimeZone);
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("사용자의 타임존: ", currentTimeZone);

      if (userTimeZone === null || userTimeZone !== currentTimeZone) {
        try {
          await updateTimeZone(currentTimeZone);
        } catch (error: any) {
          console.log("timezone error", error);
        }
      }

      if (referralCode === "dapp-portal-promotions") {
        try {
          const promo = await getPromotion();
          if (promo === "Success") {
            navigate("/promotion");
          } else {
            navigate("/dice-event");
          }
        } catch (error: any) {
          navigate("/dice-event");
        }
      } else {
        navigate("/dice-event");
      }
    } catch (error: any) {
      if (is502Error(error)) {
        console.log("502 에러 감지됨 -> MaintenanceScreen 표시");
        setShowMaintenance(true);
        return;
      }

      // 토큰 관련 에러라면 한 번만 재시도
      if (
        !retry &&
        (error.response?.data === "Token not found in Redis or expired" ||
          error.message === "Web login failed.")
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return handleConnectWallet(true);
      }

      if (error.message === "Please choose your character first.") {
        navigate("/choose-character");
        return;
      }
      console.error("에러 발생 메시지:", error.message);
      console.error("에러 발생 코드:", error.code);
      console.error("에러 응답:", error.response?.data || "응답 없음");
    }
  };

  // if (showMaintenance) {
  //   return <MaintenanceScreen />;
  // }

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${Images.SplashBackground})` }}
    >
      <motion.img
        src={Images.SplashTitle}
        alt="Lucky Dice Logo"
        className="w-[272px] mb-[90px]"
        initial={shouldReduceMotion ? {} : { y: 80 }}
        animate={shouldReduceMotion ? {} : { y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <motion.button
        onClick={() => handleConnectWallet()}
        className="relative w-[342px] h-[56px]"
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
        disabled={isAutoLoginInProgress}
      >
        <img src={Images.ConnectButton} alt="Wallet Icon" />
      </motion.button>
      {isAutoLoginInProgress && (
        <motion.div
          className="mt-4 text-white text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          자동 로그인 중...
        </motion.div>
      )}
    </div>
  );
};

export default ConnectWalletPage;
