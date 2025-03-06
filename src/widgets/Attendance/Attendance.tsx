// Attendance.tsx
import React, { useState } from "react";
import AttendanceDay from "@/features/AttendanceDay/components/AttendanceDay";
import { useUserStore } from "@/entities/User/model/userModel";
import { useTranslation } from "react-i18next";
import DappPortalSDK from "@linenext/dapp-portal-sdk"; // Default export로 SDK 가져오기
import { ethers } from "ethers";
import requestAttendance from "@/entities/User/api/requestAttendance";
import Images from "@/shared/assets/images";


const contractAddress = "0x01AE259aAc479862eA609D6771AA18fB1b1E097e";

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
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

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

  // 출석하지 않은 "today"가 존재하는지 여부
  const isTodayUnattended = days.some((day) => getStatus(day) === "today");

  const handleAttendanceClick = async () => {
    if (!provider || !account) {
      try {
        console.log("초기화 시작");
  
        // SDK 초기화
        const sdk = await DappPortalSDK.init({
          clientId: import.meta.env.VITE_LINE_CLIENT_ID || "", // 환경 변수에서 clientId 가져오기
          chainId: "8217", // 메인넷 체인 ID
        });
  
        // 지갑 연결 요청
          const walletProvider = sdk.getWalletProvider();
          setProvider(walletProvider);
          const accounts = (await walletProvider.request({
              method: "kaia_requestAccounts",
          })) as string[];
  
        setAccount(accounts[0]);
        console.log("지갑 연결 성공:", accounts[0]);
  
        
      } catch (error: any) {
        console.error("에러 발생:", error.message);
        console.error("에러 응답:", error.response?.data || "응답 없음");
      }
      return;
    }
  
    try {
      console.log("출석 체크 서명 요청 중...");
  
      // 1️⃣ 현재 연결된 지갑 타입 확인
      const walletType = provider.getWalletType();
      console.log("연결된 지갑 타입:", walletType);
  
      // 2️⃣ Kaia SDK의 Provider를 Ethers.js의 Web3Provider로 변환
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
  
      // 3️⃣ 스마트 컨트랙트 인스턴스 생성 (Signer 포함)
      const contract = new ethers.Contract(contractAddress, abi, signer);
  
      let txHash;
  
      // 4️⃣ Kaia Wallet 사용 시 → `kaia_sendTransaction` 실행
      if (walletType === "WalletType.Web" || walletType === "WalletType.Extension" || walletType === "WalletType.Mobile") {
        console.log("✅ Kaia Wallet 감지 - 트랜잭션 직접 실행");
  
        const tx = await contract.checkAttendance(); // ✅ 인자 없이 실행
        await tx.wait();
        txHash = tx.hash;
  
      } else {
        // 5️⃣ 소셜 로그인 또는 OKX Wallet 사용 시 → Ethers.js의 signMessage() 사용하여 서명 요청
        console.log("⚠️ 소셜 로그인 또는 OKX Wallet 감지 - 서명 방식 적용");
  
        const message = `출석 체크: ${account}`;
        const messageHash = ethers.utils.hashMessage(message); // ✅ 메시지 해시 생성
  
        // ✅ `provider.request()` 대신 `signer.signMessage()` 사용
        const signature = await signer.signMessage(message);
  
        console.log("✅ 서명 완료:", signature);
  
        // 6️⃣ 서명 데이터 분해 (v, r, s 값 추출)
        const sig = ethers.utils.splitSignature(signature);
  
        // 7️⃣ 컨트랙트 함수 호출 (서명 데이터 전달)
        const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
        await tx.wait();
        txHash = tx.hash;
      }
  
      console.log("✅ 출석 체크 트랜잭션 성공! TX Hash:", txHash);

      try{
        const checkIn = await requestAttendance(txHash);
        if(checkIn){
          const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
          setWeekAttendance(updatedAttendance);
          alert("출석 체크 완료!");
        } else {
          alert("출석 체크 중 오류 발생!");
        }
      } catch(error:any){
        console.error("❌ 출석 체크 실패:", error);
        alert("출석 체크 중 오류 발생!");
      }
    } catch (error) {
      console.error("❌ 출석 체크 실패:", error);
      alert("출석 체크 중 오류 발생!");
    }
  };



  return (
    // 전체 출석 위젯을 감싸는 컨테이너를 relative로 설정
    // isTodayUnattended === true이면 테두리 + 깜빡임
    <div
      className={`relative mt-4 px-8 ${
        isTodayUnattended ? "border-2 border-yellow-400 animate-pulse rounded-lg" : ""
      }`}
    >
      <div
        id="attendance"
        className={`grid grid-cols-7 gap-2 bg-box mt-4 px-8 min-h-24 md:h-32 text-white text-xs ${
          customWidth ? customWidth : "w-full md:w-[552px]"
        }`}
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
              onClick={status === "today" ? handleAttendanceClick : undefined}
            />
          );
        })}
      </div>

      {/* 출석하지 않은 "today"가 있을 때, 우측 상단에 아이콘 표시 */}
      {isTodayUnattended && (
        <img
          src={Images.attendanceNote}
          alt="Attendance Note"
          className="absolute top-0 right-0 w-[20px] h-[20px]"
        />
      )}

      <p className="flex items-start justify-start w-full font-medium text-xs md:text-sm mt-2 px-2 text-white">
        * {t("dice_event.star_rewards")}
      </p>
    </div>
  );
};

export default Attendance;
