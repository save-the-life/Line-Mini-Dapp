// Attendance.tsx
import React, { useState } from "react";
import AttendanceDay from "@/features/AttendanceDay/components/AttendanceDay";
import { useUserStore } from "@/entities/User/model/userModel";
import { useTranslation } from "react-i18next";
import DappPortalSDK from "@linenext/dapp-portal-sdk"; // Default export로 SDK 가져오기
import { ethers } from "ethers";
import requestAttendance from "@/entities/User/api/requestAttendance";
import Images from "@/shared/assets/images";
import useWalletStore from "@/shared/store/useWalletStore";

const contractAddress = "0x335d003eB18dC29AB8290f674Fb2E0d5B2f97Ae4";

const abi = [
  {
     "anonymous": false,
     "inputs": [
        {
           "indexed": true,
           "internalType": "address",
           "name": "user",
           "type": "address"
        },
        {
           "indexed": false,
           "internalType": "uint256",
           "name": "lastAttendance",
           "type": "uint256"
        },
        {
           "indexed": false,
           "internalType": "uint256",
           "name": "consecutiveDays",
           "type": "uint256"
        }
     ],
     "name": "AttendanceChecked",
     "type": "event"
  },
  {
     "inputs": [
        {
           "internalType": "bytes32",
           "name": "messageHash",
           "type": "bytes32"
        },
        {
           "internalType": "uint8",
           "name": "v",
           "type": "uint8"
        },
        {
           "internalType": "bytes32",
           "name": "r",
           "type": "bytes32"
        },
        {
           "internalType": "bytes32",
           "name": "s",
           "type": "bytes32"
        }
     ],
     "name": "checkAttendance",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
  },
  {
     "inputs": [
        {
           "internalType": "address",
           "name": "",
           "type": "address"
        }
     ],
     "name": "users",
     "outputs": [
        {
           "internalType": "uint256",
           "name": "lastAttendance",
           "type": "uint256"
        },
        {
           "internalType": "uint256",
           "name": "consecutiveDays",
           "type": "uint256"
        }
     ],
     "stateMutability": "view",
     "type": "function"
  }
]

type DayKeys = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

interface AttendanceProps {
  /** Tailwind width 클래스를 지정해 너비를 커스터마이징 */
  customWidth?: string;
}

const getTodayDay = (): DayKeys => {
  const days: DayKeys[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();
  return days[today.getDay()];
};

const Attendance: React.FC<AttendanceProps> = ({ customWidth }) => {
  const { weekAttendance, setWeekAttendance } = useUserStore();
  const [today] = useState<DayKeys>(getTodayDay());
  const { t } = useTranslation();
  const { walletAddress, provider, setWalletAddress, setProvider, setWalletType } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // 출석 상태 결정 로직
  const getStatus = (day: DayKeys) => {
    const attendanceData: { [key in DayKeys]: boolean | null } = {
      SUN: weekAttendance.sun,
      MON: weekAttendance.mon,
      TUE: weekAttendance.tue,
      WED: weekAttendance.wed,
      THU: weekAttendance.thu,
      FRI: weekAttendance.fri,
      SAT: weekAttendance.sat
    };

    if (attendanceData[day]) return "checked";
    if (day === today) return "today";

    const daysOfWeek: DayKeys[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const todayIndex = daysOfWeek.indexOf(today);
    const dayIndex = daysOfWeek.indexOf(day);

    return dayIndex < todayIndex ? "missed" : "default";
  };

  const days: DayKeys[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const isTodayUnattended = days.some((day) => getStatus(day) === "today");

  // 지갑 연결 함수
  const handleWalletConnection = async () => {
    try {
      console.log("초기화 시작");
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        chainId: "8217",
      });
      const walletProvider = sdk.getWalletProvider();
      // 전역 상태에 provider 업데이트
      setProvider(walletProvider);
      const checkWalletType = walletProvider.getWalletType() || null;
      
      const accounts = (await walletProvider.request({
        method: "kaia_requestAccounts",
      })) as string[];
      
      if (accounts && accounts[0]) {
        // 전역 상태에 지갑 주소 저장
        setWalletAddress(accounts[0]);
        // 전역 상태에 dappPortal의 provider 저장 (이미 설정된 상태)
        setProvider(walletProvider);
        // 전역 상태에 지갑 타입 저장
        if (checkWalletType) {
          setWalletType(checkWalletType);
        }
      }
      console.log("지갑 연결 성공:", accounts[0]);
    } catch (error: any) {
      console.error("지갑 연결 에러:", error.message);
    }
  };

  // 출석 체크 함수 (지갑 연결 후 바로 서명 요청)
  const handleAttendanceClick = async () => {
    // 연결되지 않은 경우 지갑 연결 시도
    if (!provider || !walletAddress) {
      if (isConnecting) return; // 이미 연결 중이면 중복 시도 방지
      setIsConnecting(true);
      await handleWalletConnection();
      setIsConnecting(false);
      // 연결 후 최신 상태 가져오기 (Zustand getState 사용)
      const { walletAddress: updatedAddress, provider: updatedProvider } = useWalletStore.getState();
      if (!updatedProvider || !updatedAddress) {
        console.error("지갑 연결 상태 업데이트 실패");
        return;
      }
    }

    try {
      console.log("출석 체크 서명 요청 중...");
      // 최신 provider를 사용
      const currentProvider = useWalletStore.getState().provider;
      const currentWalletAddress = useWalletStore.getState().walletAddress;
      const currentWalletType = currentProvider.getWalletType();
      console.log("연결된 지갑 타입 by 전역 관리:", currentWalletType);
      
      const walletType = provider.getWalletType();
      console.log("연결된 지갑 타입  by provider:", walletType);

      const ethersProvider = new ethers.providers.Web3Provider(currentProvider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      let txHash;

      
      // if (walletType === "Web" || walletType === "Extension" || walletType === "Mobile") {
      //   console.log("✅ Kaia Wallet 감지 - 트랜잭션 직접 실행");
      //   const message = `출석 체크: ${currentWalletAddress}`;
      //   const messageHash = ethers.utils.hashMessage(message);
      //   const signature = await signer.signMessage(message);
      //   console.log("✅ 서명 완료:", signature);
      //   const sig = ethers.utils.splitSignature(signature);
      //   console.log("sig 확인: ", sig);
      //   const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
      //   await tx.wait();
      //   txHash = tx.hash;
      // } else {
      //   console.log("⚠️ 소셜 로그인 또는 OKX Wallet 감지 - 서명 방식 적용");
      //   const message = `출석 체크: ${currentWalletAddress}`;
      //   const messageHash = ethers.utils.hashMessage(message);
      //   const signature = await signer.signMessage(message);
      //   console.log("✅ 서명 완료:", signature);
      //   const sig = ethers.utils.splitSignature(signature);
      
      //   console.log("sig 확인: ", sig);
      //   const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
      //   await tx.wait();
      //   txHash = tx.hash;
      // }
      
      if (
        currentWalletType === "Web" ||
        currentWalletType === "Extension" ||
        currentWalletType === "Mobile" ||
        currentWalletType === "Liff"
      ) {
        console.log("✅ Kaia Wallet 감지 - 트랜잭션 직접 실행");
  
        // ✅ 트랜잭션 객체 생성 (Kaia Wallet에서는 `kaia_sendTransaction` 사용)
        const txData = {
          from: currentWalletAddress,
          to: contractAddress,
          data: contract.interface.encodeFunctionData("checkAttendance", []), // ✅ 인자 없이 실행
          value: "0x0",
        };
  
        txHash = await currentProvider.request({
          method: "kaia_sendTransaction",
          params: [txData],
        });
  
        console.log("✅ Kaia Wallet 트랜잭션 실행 완료! TX Hash:", txHash);
      
      } else {
        console.log("⚠️ 소셜 로그인 또는 OKX Wallet 감지 - 서명 방식 적용");
        const message = `출석 체크: ${currentWalletAddress}`;
        const messageHash = ethers.utils.hashMessage(message);
        const signature = await signer.signMessage(message);
        console.log("✅ 서명 완료:", signature);
        const sig = ethers.utils.splitSignature(signature);
      
        console.log("sig 확인: ", sig);
        const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
        await tx.wait();
        txHash = tx.hash;
      }

      console.log("✅ 출석 체크 트랜잭션 성공! TX Hash:", txHash);

      try {
        const checkIn = await requestAttendance(txHash);
        if (checkIn) {
          const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
          setWeekAttendance(updatedAttendance);
          alert("출석 체크 완료!");
        } else {
          alert("출석 체크 중 오류 발생!");
        }
      } catch (error: any) {
        console.error("❌ 출석 체크 실패:", error);
        alert("출석 체크 중 오류 발생!");
      }
    } catch (error) {
      console.error("❌ 출석 체크 실패:", error);
      alert("출석 체크 중 오류 발생!");
    }
  };

  return (
    <div className="mt-4">
      <div
        id="attendance"
        onClick={isTodayUnattended ? handleAttendanceClick : undefined}
        className={`relative grid grid-cols-7 gap-2 bg-box min-h-24 md:h-32 text-white text-xs ${
          customWidth ? customWidth : "w-full md:w-[552px]"
        } ${isTodayUnattended ? "border-2 border-yellow-400 animate-pulse rounded-lg" : ""}`}
      >
        {days.map((day) => {
          const status = getStatus(day);
          const displayDay = t(`dice_event.day.${day}`);
          return (
            <AttendanceDay
              key={day}
              day={day}
              displayDay={displayDay}
              status={status}
            />
          );
        })}
        {isTodayUnattended && (
          <img
            src={Images.attendanceNote}
            alt="Attendance Note"
            className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px]"
          />
        )}
      </div>
      <p className="flex items-start justify-start w-full font-medium text-xs md:text-sm mt-2 text-white">
        * {t("dice_event.star_rewards")}
      </p>
    </div>
  );
};

export default Attendance;
