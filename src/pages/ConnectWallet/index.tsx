import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Images from "@/shared/assets/images";
import DappPortalSDK from "@linenext/dapp-portal-sdk";

// 간단한 모바일 체크 함수 (정교함은 상황에 따라 보완 필요)
const checkIsMobile = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();

  // 0. 페이지 접근 시 모바일 / 웹 체크
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showConnectButton, setShowConnectButton] = useState<boolean>(true); 
  // 기존 코드에서 showConnectButton을 서버 응답에 따라 제어했지만 
  // 예시에서는 간단히 true로 두겠습니다.

  useEffect(() => {
    // 페이지 진입 시 1회만 체크
    setIsMobile(checkIsMobile());
  }, []);

  const handleConnectWallet = async () => {
    try {
      console.log("초기화 시작");

      // 1) SDK 초기화
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
      });

      // 2) 지갑 타입 확인
      const walletProvider = sdk.getWalletProvider();
      const walletType = await walletProvider.getWalletType();
      console.log("현재 지갑 타입:", walletType);

      // 3) 웹에서 접근(isMobile=false)했는데 모바일 지갑 타입이라면
      //    안내문 표시, localStorage key 제거, 연결 로직 중단
    //   if (!isMobile && walletType === "mobile") {
    //     alert("현재 PC 웹 브라우저 환경에서는 모바일용 지갑(Kaia)을 연결할 수 없습니다.\n모바일 환경에서 다시 시도해주세요.");
    //     // 필요시 로컬 스토리지 key 제거
    //     localStorage.removeItem("sdk.dappportal.io:1001:walletType");
    //     return;
    //   }

      // 4) 여기까지 통과했다면 정상적으로 지갑 연결 요청
      const accounts = (await walletProvider.request({
        method: "kaia_requestAccounts",
      })) as string[];

      console.log("지갑 연결 성공:", accounts[0]);
      // 여기서 account를 상태에 저장
      // setAccount(accounts[0]);  // 예시: 필요 시 사용

      // 연결 성공 후 페이지 이동
      navigate("/dice-event");
    } catch (error: any) {
      console.error("에러 발생:", error.message);
      console.error("에러 응답:", error.response?.data || "응답 없음");
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${Images.SplashBackground})`,
      }}
    >
      {showConnectButton ? (
        <>
          {/* 애니메이션 로고 */}
          <motion.img
            src={Images.SplashTitle}
            alt="Lucky Dice Logo"
            className="w-[272px] mb-[90px]"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* 애니메이션 버튼 */}
          <motion.button
            onClick={handleConnectWallet}
            className="relative w-[340px] h-[150px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
          >
            <img src={Images.ConnectButton} alt="Wallet Icon" />
          </motion.button>
        </>
      ) : (
        // 기본 UI
        <img
          src={Images.SplashTitle}
          alt="Lucky Dice Logo"
          className="w-[272px] mb-[90px]"
        />
      )}
    </div>
  );
};

export default ConnectWalletPage;
