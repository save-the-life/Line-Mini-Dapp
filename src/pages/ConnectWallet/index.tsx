import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Images from "@/shared/assets/images";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from "@/shared/store/useWalletStore";
import i18n from "@/shared/lib/il8n";
import { connectWallet } from "@/shared/services/walletService";

// 간단한 모바일 체크 함수
const checkIsMobile = (): boolean =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { fetchUserData } = useUserStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    console.log("웹 버전 초기화");
    setIsMobile(checkIsMobile());

    // 브라우저 언어 기반 언어 설정
    console.log("[ConnectWalletPage] 브라우저 언어 기반 언어 설정 시작");
    const browserLanguage = navigator.language; // 예: "ko-KR", "en-US" 등
    const lang = browserLanguage.slice(0, 2); // 앞 두 글자 추출 (예: "ko")
    const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
    const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
    console.log(`[ConnectWalletPage] 브라우저 언어 설정: ${browserLanguage} -> ${i18nLanguage}`);
    i18n.changeLanguage(i18nLanguage);
  }, []);

  const handleConnectWallet = async (retry = false) => {
    try {
      // 외부 모듈에서 지갑 연결 및 전역 상태 업데이트 수행
      await connectWallet();

      // 연결된 지갑 주소를 상태에서 가져옴
      const { walletAddress } = useWalletStore.getState();

      console.log("연결된 지갑 주소 다시 확인: ", walletAddress);
      // 주소 기반 Web 로그인 및 사용자 데이터 확인
      const webLogin = await webLoginWithAddress(walletAddress);
      if (!webLogin) {
        throw new Error("Web login failed.");
      }

      await fetchUserData();
      console.log("지갑 로그인 완료 및 데이터 확인");
      navigate("/dice-event");
    } catch (error: any) {
      console.error("getUserInfo() 중 에러:", error.message);

      // 토큰 관련 에러라면 한 번만 재시도
      if (
        !retry &&
        (error.response?.data === "Token not found in Redis or expired" ||
          error.message === "Web login failed.")
      ) {
        console.warn("토큰 문제 발생: 재시도합니다.");
        // 토큰 초기화 (필요 시)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return handleConnectWallet(true);
      }

      if (error.message === "Please choose your character first.") {
        console.error("오류: 캐릭터가 선택되지 않음 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }
      console.error("에러 발생:", error.message);
      console.error("에러 응답:", error.response?.data || "응답 없음");
    }
  };

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
