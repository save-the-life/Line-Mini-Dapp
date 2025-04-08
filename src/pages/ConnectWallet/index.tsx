import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Images from "@/shared/assets/images";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from "@/shared/store/useWalletStore";
import i18n from "@/shared/lib/il8n";
import { connectWallet } from "@/shared/services/walletService";
import requestWallet from "@/entities/User/api/addWallet";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import MaintenanceScreen from "@/app/components/Maintenance";

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

// 테스터 지갑 주소를 미리 소문자로 정의 (테스터 그룹에 해당하는 지갑 주소)
const testerWallets = ["0xe7173731309e07da77da0452179212b9ea7dbfd7"];

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { fetchUserData } = useUserStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMaintenance, setShowMaintenance] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(checkIsMobile());

    // 브라우저 언어 기반 언어 설정
    const browserLanguage = navigator.language;
    const lang = browserLanguage.slice(0, 2);
    const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
    const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
    i18n.changeLanguage(i18nLanguage);
  }, []);

  const handleConnectWallet = async (retry = false) => {
    try {
      // 외부 모듈에서 지갑 연결 및 전역 상태 업데이트 수행
      await connectWallet();

      // 연결된 지갑 주소와 지갑 타입을 상태에서 가져옴
      const { walletAddress, walletType, clearWallet } = useWalletStore.getState();

      // 로컬스토리지에서 레퍼럴 코드 확인
      const referralCode = localStorage.getItem("referralCode");

      // 주소 기반 Web 로그인 (502 에러 발생 시 에러를 throw하도록 webLoginWithAddress 수정 필요)
      const webLogin = await webLoginWithAddress(walletAddress, referralCode);
      if (!webLogin) {
        throw new Error("Web login failed.");
      }

      // 테스터 지갑 주소 검사 (대소문자 문제를 피하기 위해 모두 소문자로 비교)
      const normalizedAddress = walletAddress.toLowerCase();
      if (!testerWallets.includes(normalizedAddress)) {
        console.log("현재 지갑 주소:", walletAddress);
        console.log("테스터 지갑 주소가 아님 -> MaintenanceScreen 표시");
        setShowMaintenance(true);
        return;
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
      console.log("서버로부터 받은 타임존:", userTimeZone);
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("사용자의 타임존:", currentTimeZone);

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

  if (showMaintenance) {
    return <MaintenanceScreen />;
  }

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
      >
        <img src={Images.ConnectButton} alt="Wallet Icon" />
      </motion.button>
    </div>
  );
};

export default ConnectWalletPage;
