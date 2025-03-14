// Attendance.tsx
import React, { useState } from "react";
import AttendanceDay from "@/features/AttendanceDay/components/AttendanceDay";
import { useUserStore } from "@/entities/User/model/userModel";
import { useTranslation } from "react-i18next";
import DappPortalSDK from "@linenext/dapp-portal-sdk"; // ✅ SDK 가져오기
import { Web3Provider } from "@kaiachain/ethers-ext"; // ✅ Fee Delegation 지원
import { TxType } from "@kaiachain/js-ext-core"; // ✅ Fee Delegation 타입 추가
import { ethers } from "ethers";
import requestAttendance from "@/entities/User/api/requestAttendance";
import Images from "@/shared/assets/images";
import useWalletStore from "@/shared/store/useWalletStore";
import { connectWallet } from "@/shared/services/walletService";
import testingAttendance from "@/entities/User/api/testAttendance";

const contractAddress = "0xa616BED7Db9c4C188c4078778980C2776EEa46ac"; //mainnet  checkin contractaddress
//const contractAddress ="0x53aeFEF6f3C1C9Eb3C8C3b084D647d82aB700aB1"; //testnet checkin contractaddress
//const feePayer = "0x22a4ebd6c88882f7c5907ec5a2ee269fecb5ed7a"; //mainnet feepayer
const feePayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //testnet feepayer
//const feePayerServer = "https://fee-delegation.kaia.io"; // mainnet feepayerserver
const feePayerServer = "https://fee-delegation-kairos.kaia.io";
/*const abi = [
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
]*/
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
     "inputs": [],
     "name": "checkAttendanceWithoutSignature",
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
];

type DayKeys = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

interface AttendanceProps {
  /** Tailwind width 클래스를 지정해 너비를 커스터마이징 */
  customWidth?: string;
};

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


  // 출석 체크 함수 (지갑 연결 후 바로 서명 요청)
  const handleAttendanceClick = async () => {
    // 연결되지 않은 경우 지갑 연결 시도
    if (!provider || !walletAddress) {
      if (isConnecting) return; // 중복 연결 방지
      setIsConnecting(true);
      const connection = await connectWallet();
      setIsConnecting(false);
      if (!connection.provider || !connection.walletAddress) {
        console.error("지갑 연결 상태 업데이트 실패");
        return;
      }
    }

    try {
      console.log("출석 체크 서명 요청 중...");
  
      const ethersProvider = new Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
  
      console.log("⚠️ Fee Delegation + 서명 방식 적용 중...");
  
      // ✅ 1️⃣ 사용자가 출석 체크 서명 생성
      const message = `출석 체크: ${walletAddress}`;
      const messageHash = ethers.utils.hashMessage(message);
  
      // ✅ 2️⃣ 사용자가 메시지 서명 (OKX, LIFF 등 지갑용)
      const signature = await signer.signMessage(message);
      console.log("✅ 서명 완료:", signature);
  
      // ✅ 3️⃣ 서명 데이터(v, r, s) 추출
      const sig = ethers.utils.splitSignature(signature);
      console.log("✅ 서명 데이터 분해:", sig);
  
      const currentWalletType = provider.getWalletType();
      console.log("연결된 지갑 타입:", currentWalletType);
  
      if (currentWalletType === "OKX") {
   
         // ✅ 컨트랙트 함수 실행 (`checkAttendance`)
         const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
         await tx.wait();
         console.log("✅ 출석 체크 트랜잭션 성공! TX Hash:", tx.hash);
         alert("출석 체크 완료!");
   
         // ✅ 출석 처리 후 상태 업데이트
         const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
         setWeekAttendance(updatedAttendance);
         return;
       }

      // ✅ 4️⃣ Fee Delegation 트랜잭션 데이터 생성 (서명 데이터 포함)
      const contractCallData = await contract.interface.encodeFunctionData("checkAttendance", [
        messageHash, sig.v, sig.r, sig.s,
      ]);
  
      // ✅ 5️⃣ 트랜잭션 객체 생성 (Fee Payer가 실행할 수 있도록 준비)
      const tx = {
        typeInt: TxType.FeeDelegatedSmartContractExecution,
        from: walletAddress,
        to: contractAddress,
        input: contractCallData,
        value: "0x0",
        feePayer,
      };
  
      // ✅ 6️⃣ 사용자가 트랜잭션 서명 (백엔드에 보낼 서명)
      const signedTx = await provider.request({
        method: "kaia_signTransaction",
        params: [tx],
      });
  
      console.log("✅ 사용자가 서명한 트랜잭션:", signedTx);

      try{
        console.log("출석 후 서버 확인 진행");
        const testing = await testingAttendance(signedTx.raw);

        if(testing){
          console.log("출석 응답");
          alert("출석 체크를 완료하였습니다.");
          const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
          setWeekAttendance(updatedAttendance);
        }else{
          console.log("출석 응답 - 실패");
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
