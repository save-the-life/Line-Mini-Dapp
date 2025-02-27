import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Images from "@/shared/assets/images";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import webLoginWithAddress from "@/entities/User/api/webLogin";
import { useUserStore } from "@/entities/User/model/userModel";

// 간단한 모바일 체크 함수 (필요시 보완 가능)
const checkIsMobile = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUserData } = useUserStore();

  // 페이지 접근 시 모바일/웹 체크
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // 지갑 연결 진행 상태 (버튼 비활성화를 위한 상태)
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(checkIsMobile());
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      console.log("DappPortal SDK 초기화 시작");
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "1001",
      });
      const walletProvider = sdk.getWalletProvider();

      // 1) 계정 요청: 사용자에게 지갑 선택 UI가 표시됨
      const accounts = (await walletProvider.request({
        method: "kaia_requestAccounts",
      })) as string[];

      // 2) 선택 후 walletType 업데이트
      const walletType = walletProvider.getWalletType() || null;
      console.log("사용자가 선택한 지갑 타입:", walletType);

      // 3) PC 환경에서 모바일 지갑을 선택한 경우 오류 처리
      if (!isMobile && walletType === "Mobile") {
        alert(
          "현재 PC 웹 브라우저 환경에서 '모바일 지갑'은 연결할 수 없습니다.\n모바일 환경에서 다시 시도해주세요."
        );
        localStorage.removeItem("sdk.dappportal.io:1001:walletType");
        setIsConnecting(false);
        return;
      }

      console.log("지갑 연결 성공:", accounts[0]);

      // 4) 주소 기반 Web 로그인 시도
      const webLogin = await webLoginWithAddress(accounts[0]);
      if (!webLogin) {
        throw new Error("Web login failed.");
      }

      // 5) 사용자 데이터 확인 후 다음 페이지 이동
      await fetchUserData();
      console.log("지갑 로그인 완료 및 데이터 확인");
      navigate("/dice-event");
    } catch (error: any) {
      console.error("에러 발생:", error.message);
      if (error.response?.message === "Please choose your character first.") {
        console.error("오류: 캐릭터가 선택되지 않음 -> /choose-character 이동");
        navigate("/choose-character");
        return;
      }
      alert("지갑 연결 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsConnecting(false);
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${Images.SplashBackground})` }}
    >
      {/* 애니메이션 로고 */}
      <motion.img
        src={Images.SplashTitle}
        alt="Lucky Dice Logo"
        className="w-[272px] mb-[90px]"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* 애니메이션 버튼 (항상 표시, 연결 중일 경우 비활성화) */}
      <motion.button
        onClick={handleConnectWallet}
        className="relative w-[342px] h-[56px]"
        disabled={isConnecting}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
      >
        <img src={Images.ConnectButton} alt="Wallet Icon" />
      </motion.button>
    </div>
  );
};

export default ConnectWalletPage;
