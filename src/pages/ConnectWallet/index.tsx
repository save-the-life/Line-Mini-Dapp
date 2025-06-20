import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Images from "@/shared/assets/images";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from "@/shared/store/useWalletStore";
import i18n from "@/shared/lib/il8n";
import { connectWallet as connectWalletService } from "@/shared/services/walletService";
import requestWallet from "@/entities/User/api/addWallet";
import getPromotion from "@/entities/User/api/getPromotion";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import MaintenanceScreen from "@/app/components/Maintenance";
import { useSDK } from '@/shared/hooks/useSDK';

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
  const { sdk, isInitialized } = useSDK();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // 모바일 체크는 한 번만 실행
  useEffect(() => {
    setIsMobile(checkIsMobile());
  }, []);

  const handleConnectWallet = async () => {
    if (!sdk || !isInitialized) {
      console.warn("[ConnectWallet] SDK가 아직 준비되지 않았음. handleConnectWallet 실행 중단");
      return;
    }
  
    try {
      const provider = sdk.getWalletProvider();
      const { walletAddress, walletType } = await connectWalletService({ sdk, provider });
  
      if (!walletAddress || !walletType) {
        throw new Error("지갑 연결에 실패했습니다.");
      }
  
      // 로컬스토리지에서 레퍼럴 코드 확인
      const referralCode = localStorage.getItem("referralCode");
      console.log("[ConnectWallet] 레퍼럴 코드:", referralCode);
  
      // 주소 기반 Web 로그인
      console.log("[ConnectWallet] webLoginWithAddress 호출");
      const webLogin = await webLoginWithAddress(walletAddress, referralCode);
      console.log("[ConnectWallet] webLogin 결과:", webLogin);
  
      if (!webLogin) {
        throw new Error("Web login failed.");
      }
  
      // webLoginWithAddress 성공 시, requestWallet 실행
      console.log("[ConnectWallet] requestWallet 호출");
      await requestWallet(walletAddress, walletType.toUpperCase());
      
      await fetchUserData();
  
      const userTimeZone = useUserStore.getState().timeZone;
      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("[ConnectWallet] 타임존 정보:", { userTimeZone, currentTimeZone });
  
      if (userTimeZone === null || userTimeZone !== currentTimeZone) {
        try {
          console.log("[ConnectWallet] 타임존 업데이트 시도");
          await updateTimeZone(currentTimeZone);
          console.log("[ConnectWallet] 타임존 업데이트 성공");
        } catch (error: any) {
          console.error("[ConnectWallet] 타임존 업데이트 실패:", error);
        }
      }
  
      if (referralCode === "dapp-portal-promotions") {
        try {
          console.log("[ConnectWallet] 프로모션 확인");
          const promo = await getPromotion();
          console.log("[ConnectWallet] 프로모션 결과:", promo);
          if (promo === "Success") {
            console.log("[ConnectWallet] 프로모션 페이지로 이동");
            navigate("/promotion");
          } else {
            console.log("[ConnectWallet] 메인 페이지로 이동");
            navigate("/dice-event");
          }
        } catch (error: any) {
          console.error("[ConnectWallet] 프로모션 확인 실패:", error);
          navigate("/dice-event");
        }
      } else {
        console.log("[ConnectWallet] 메인 페이지로 이동");
        navigate("/dice-event");
      }
    } catch (error) {
      console.error("[ConnectWalletPage] 지갑 연결 프로세스 에러:", error);
      // 사용자에게 에러 메시지를 보여주는 UI/UX 처리를 추가할 수 있습니다.
    }
  };

  if (!isInitialized) {
    return (
      <div className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${Images.SplashBackground})` }}>
        <motion.img
          src={Images.SplashTitle}
          alt="Lucky Dice Logo"
          className="w-[272px] mb-[90px]"
          initial={shouldReduceMotion ? {} : { y: 80 }}
          animate={shouldReduceMotion ? {} : { y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <div className="text-white">지갑 SDK를 초기화 중입니다...</div>
      </div>
    );
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
        onClick={handleConnectWallet}
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
