import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Images from "@/shared/assets/images";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";

// 간단한 모바일 체크 함수
const checkIsMobile = (): boolean =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { fetchUserData } = useUserStore();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(checkIsMobile());
  }, []);

  const handleConnectWallet = async () => {
    try {
      console.log("DappPortal SDK 초기화 시작");
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "1001",
      });
      const walletProvider = sdk.getWalletProvider();

      // 계정 요청 (사용자에게 지갑 선택 UI 표시)
      const accounts = (await walletProvider.request({
        method: "kaia_requestAccounts",
      })) as string[];

      const walletType = walletProvider.getWalletType() || null;
      console.log("사용자가 선택한 지갑 타입:", walletType);

      // PC 환경에서 모바일 지갑 선택 시 예외 처리
      if (!isMobile && walletType === "Mobile") {
        alert(
          "현재 PC 웹 브라우저 환경에서 '모바일 지갑'은 연결할 수 없습니다.\n모바일 환경에서 다시 시도해주세요."
        );
        localStorage.removeItem("sdk.dappportal.io:1001:walletType");
        return;
      }

      console.log("지갑 연결 성공:", accounts[0]);

      // 주소 기반 Web 로그인 및 사용자 데이터 확인
      const webLogin = await webLoginWithAddress(accounts[0]);
      if (!webLogin) {
        throw new Error("Web login failed.");
      }

      await fetchUserData();
      console.log("지갑 로그인 완료 및 데이터 확인");
      navigate("/dice-event");
    } catch (error: any) {
      console.error("getUserInfo() 중 에러:", error.message);
      if (error.response?.message === "Please choose your character first.") {
        console.error("오류: 캐릭터가 선택되지 않음 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }
      console.error("에러 발생:", error.message);
      console.error("에러 응답:", error.response?.data || "응답 없음");
      alert("지갑 연결 중 오류가 발생했습니다. 다시 시도해주세요.");
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
