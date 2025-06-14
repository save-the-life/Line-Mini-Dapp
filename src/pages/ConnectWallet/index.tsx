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
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);

  useEffect(() => {
    console.log("[ConnectWallet] 페이지 마운트");
    setIsMobile(checkIsMobile());

    // 브라우저 언어 기반 언어 설정
    const browserLanguage = navigator.language;
    const lang = browserLanguage.slice(0, 2);
    const supportedLanguages = ["en", "ko", "ja", "zh", "th"];
    const i18nLanguage = supportedLanguages.includes(lang) ? lang : "en";
    i18n.changeLanguage(i18nLanguage);

    // SDK 초기화 및 연결 상태 확인
    const initializeSdk = async () => {
      console.log("[ConnectWallet] SDK 초기화 시작");
      try {
        const { sdk, initialized, setSdk, setInitialized } = useWalletStore.getState();
        console.log("[ConnectWallet] 현재 SDK 상태:", { initialized, hasSdk: !!sdk });

        if (!initialized || !sdk) {
          console.log("[ConnectWallet] SDK 초기화 필요");
          const sdkInstance = await DappPortalSDK.init({
            clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
            chainId: "8217",
          });
          setSdk(sdkInstance);
          setInitialized(true);
          console.log("[ConnectWallet] SDK 초기화 성공");
        } else {
          console.log("[ConnectWallet] SDK가 이미 초기화되어 있음");
        }

        // 액세스 토큰 확인
        const accessToken = localStorage.getItem('accessToken');
        console.log("[ConnectWallet] 액세스 토큰 존재 여부:", !!accessToken);

        if (accessToken) {
          console.log("[ConnectWallet] 액세스 토큰으로 로그인 시도");
          try {
            await fetchUserData();
            console.log("[ConnectWallet] 사용자 데이터 fetch 성공");
            navigate("/dice-event");
            return;
          } catch (error) {
            console.error("[ConnectWallet] 토큰 기반 로그인 실패:", error);
            // 토큰이 만료되었거나 유효하지 않은 경우 지갑 연결 시도
          }
        }

        // 저장된 지갑 주소가 있는 경우 자동 연결 시도
        const savedWalletAddress = localStorage.getItem('walletAddress');
        console.log("[ConnectWallet] 저장된 지갑 주소:", savedWalletAddress);

        if (savedWalletAddress) {
          const { sdk } = useWalletStore.getState();
          if (sdk) {
            try {
              const provider = sdk.getWalletProvider();
              console.log("[ConnectWallet] 지갑 타입:", provider.getWalletType());

              // 먼저 연결 상태 확인 (kaia_accounts는 연결 화면을 표시하지 않음)
              console.log("[ConnectWallet] 지갑 연결 상태 확인 시작");
              const accounts = await provider.request({ method: 'kaia_accounts' });
              const isConnected = accounts && accounts.length > 0;
              console.log("[ConnectWallet] 지갑 연결 상태:", isConnected, "계정:", accounts);

              if (isConnected) {
                console.log("[ConnectWallet] 지갑이 이미 연결되어 있음");
                // 지갑 주소를 store에 설정
                useWalletStore.getState().setWalletAddress(savedWalletAddress);
                console.log("[ConnectWallet] 지갑 주소를 store에 설정:", savedWalletAddress);
                await handleConnectWallet();
                return;
              }

              // 연결이 끊어져 있다면 재연결 시도
              console.log("[ConnectWallet] 지갑 재연결 시도");
              const reconnectedAccounts = await provider.request({ method: 'kaia_requestAccounts' });
              const reconnected = reconnectedAccounts && reconnectedAccounts.length > 0;
              console.log("[ConnectWallet] 지갑 재연결 결과:", reconnected, "계정:", reconnectedAccounts);

              if (reconnected) {
                console.log("[ConnectWallet] 지갑 재연결 성공");
                useWalletStore.getState().setWalletAddress(savedWalletAddress);
                console.log("[ConnectWallet] 재연결된 지갑 주소를 store에 설정:", savedWalletAddress);
                await handleConnectWallet();
                return;
              } else {
                console.log("[ConnectWallet] 지갑 재연결 실패");
              }
            } catch (error: any) {
              console.error("[ConnectWallet] 지갑 연결 상태 확인/재연결 실패:", error);
              console.error("[ConnectWallet] 에러 상세:", {
                message: error.message,
                code: error.code,
                stack: error.stack
              });
            }
          } else {
            console.log("[ConnectWallet] SDK 인스턴스가 없음");
          }
        } else {
          console.log("[ConnectWallet] 저장된 지갑 주소가 없음");
        }
        setIsCheckingConnection(false);
      } catch (error: any) {
        console.error("[ConnectWallet] SDK 초기화 실패:", error);
        console.error("[ConnectWallet] 초기화 실패 상세:", {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setIsCheckingConnection(false);
      }
    };

    initializeSdk();
  }, []);

  const handleConnectWallet = async (retry = false) => {
    console.log("[ConnectWallet] handleConnectWallet 시작", { retry });
    try {
      // SDK 초기화 상태 확인
      const { sdk, initialized } = useWalletStore.getState();
      console.log("[ConnectWallet] 현재 SDK 상태:", { initialized, hasSdk: !!sdk });
      
      // SDK가 초기화되지 않았다면 에러
      if (!initialized || !sdk) {
        throw new Error("SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해 주세요.");
      }

      // 지갑 연결 상태 확인
      const provider = sdk.getWalletProvider();
      const accounts = await provider.request({ method: 'kaia_accounts' });
      const isConnected = accounts && accounts.length > 0;
      console.log("[ConnectWallet] 현재 지갑 연결 상태:", isConnected, "계정:", accounts);

      if (!isConnected) {
        console.log("[ConnectWallet] 지갑 연결 필요");
        // 지갑 연결 요청
        const connectedAccounts = await provider.request({ method: 'kaia_requestAccounts' });
        if (!connectedAccounts || connectedAccounts.length === 0) {
          throw new Error("지갑 연결이 필요합니다.");
        }
        console.log("[ConnectWallet] 지갑 연결 성공:", connectedAccounts);
      }

      // 연결된 지갑 주소와 지갑 타입을 상태에서 가져옴
      const { walletAddress, walletType, clearWallet } = useWalletStore.getState();
      console.log("[ConnectWallet] 연결된 지갑 정보:", { walletAddress, walletType });

      // 지갑 주소를 localStorage에 저장
      if (walletAddress) {
        localStorage.setItem('walletAddress', walletAddress);
        console.log("[ConnectWallet] 지갑 주소를 localStorage에 저장:", walletAddress);
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
      if (walletAddress && walletType) {
        console.log("[ConnectWallet] requestWallet 호출");
        await requestWallet(walletAddress, walletType.toUpperCase());
      } else {
        console.log("[ConnectWallet] 지갑 정보 누락, 재연결 시도");
        clearWallet();
        await connectWallet();
      }

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
    } catch (error: any) {
      console.error("[ConnectWallet] 에러 발생:", error);
      console.error("[ConnectWallet] 에러 상세:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack
      });

      if (is502Error(error)) {
        console.log("[ConnectWallet] 502 에러 감지됨 -> MaintenanceScreen 표시");
        setShowMaintenance(true);
        return;
      }

      // 토큰 관련 에러라면 한 번만 재시도
      if (
        !retry &&
        (error.response?.data === "Token not found in Redis or expired" ||
          error.message === "Web login failed.")
      ) {
        console.log("[ConnectWallet] 토큰 관련 에러, 재시도");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return handleConnectWallet(true);
      }

      if (error.message === "Please choose your character first.") {
        console.log("[ConnectWallet] 캐릭터 선택 필요");
        navigate("/choose-character");
        return;
      }
    }
  };

  if (isCheckingConnection) {
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
        <div className="text-white">Checking wallet connection...</div>
      </div>
    );
  }

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
      >
        <img src={Images.ConnectButton} alt="Wallet Icon" />
      </motion.button>
    </div>
  );
};

export default ConnectWalletPage;
