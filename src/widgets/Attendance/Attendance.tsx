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
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import okxAttendance from "@/entities/User/api/okxAttendance";

const contractAddress = "0xa616BED7Db9c4C188c4078778980C2776EEa46ac"; //mainnet  checkin contractaddress
// const contractAddress ="0x36c52010a2408DeBee6b197A75E3a37Ee15d6283"; //testnet checkin contractaddress
const feePayer = "0x22a4ebd6c88882f7c5907ec5a2ee269fecb5ed7a"; //mainnet feepayer
// const feePayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //testnet feepayer

// const feePayerServer = "https://fee-delegation.kaia.io"; // mainnet feepayerserver
// const feePayerServer = "https://fee-delegation-kairos.kaia.io";
// const abi = [
//    {
//       "anonymous": false,
//       "inputs": [
//          {
//             "indexed": true,
//             "internalType": "address",
//             "name": "user",
//             "type": "address"
//          },
//          {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "lastAttendance",
//             "type": "uint256"
//          },
//          {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "consecutiveDays",
//             "type": "uint256"
//          }
//       ],
//       "name": "AttendanceChecked",
//       "type": "event"
//    },
//    {
//       "inputs": [
//          {
//             "internalType": "bytes32",
//             "name": "messageHash",
//             "type": "bytes32"
//          },
//          {
//             "internalType": "uint8",
//             "name": "v",
//             "type": "uint8"
//          },
//          {
//             "internalType": "bytes32",
//             "name": "r",
//             "type": "bytes32"
//          },
//          {
//             "internalType": "bytes32",
//             "name": "s",
//             "type": "bytes32"
//          }
//       ],
//       "name": "checkAttendance",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//    },
//    {
//       "inputs": [],
//       "name": "checkAttendanceWithoutSignature",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//    },
//    {
//       "inputs": [
//          {
//             "internalType": "address",
//             "name": "",
//             "type": "address"
//          }
//       ],
//       "name": "users",
//       "outputs": [
//          {
//             "internalType": "uint256",
//             "name": "lastAttendance",
//             "type": "uint256"
//          },
//          {
//             "internalType": "uint256",
//             "name": "consecutiveDays",
//             "type": "uint256"
//          }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//    }
// ]
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
   const { playSfx } = useSound();
   const { walletAddress, provider, sdk, walletType } = useWalletStore();
   const [isConnecting, setIsConnecting] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [message, setMessage] = useState("");

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



   const handleAttendanceClick = async () => {
      let currentProvider = provider;
      let currentWalletAddress = walletAddress;
      let currentSdk = sdk;
      let currentWalletType = walletType;

      if (!currentProvider || !currentWalletAddress || !currentSdk || !currentWalletType) {
         if (isConnecting) return;
         setIsConnecting(true);
         const connection = await connectWallet();
         setIsConnecting(false);
         if (!connection.provider || !connection.walletAddress) {
            setShowModal(true);
            setMessage(t("attendance.wallet_fail"));
            return;
         }
         currentProvider = connection.provider;
         currentWalletAddress = connection.walletAddress;
         currentSdk = connection.sdk;
         currentWalletType = connection.walletType;
      }

      try {
         const ethersProvider = new Web3Provider(currentProvider);
         const signer = ethersProvider.getSigner();
         const contract = new ethers.Contract(contractAddress, abi, signer);

         // 출석 체크 메시지 생성 및 서명
         const message = `출석 체크: ${currentWalletAddress}`;
         const messageHash = ethers.utils.hashMessage(message);
         const signature = await signer.signMessage(message);
         const sig = ethers.utils.splitSignature(signature);

         // OKX 지갑 타입인 경우: 다른 로직으로 컨트랙트 실행
         if (currentProvider.getWalletType() === "OKX") {
            const tx = await contract.checkAttendance(messageHash, sig.v, sig.r, sig.s);
            const receipt = await tx.wait();
            // OKX의 경우 tx.hash를 사용하여 testingAttendance 호출 (백엔드에서 이를 처리할 수 있도록 구성 필요)

            if (receipt.status === 1) {
               await okxAttendance();
               setShowModal(true);
               setMessage(t("attendance.attendance_success"));
               const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
               setWeekAttendance(updatedAttendance);
            } else {
               setShowModal(true);
               setMessage(t("attendance.attendance_failed"));
            }
            return;
         }

         // OKX가 아닌 경우: Fee Delegation 로직 적용
         const contractCallData = contract.interface.encodeFunctionData("checkAttendance", [
            messageHash,
            sig.v,
            sig.r,
            sig.s,
         ]);

         const tx = {
            typeInt: TxType.FeeDelegatedSmartContractExecution,
            from: currentWalletAddress,
            to: contractAddress,
            input: contractCallData,
            value: "0x0",
            feePayer,
         };

         const signedTx = await currentProvider.request({
            method: "kaia_signTransaction",
            params: [tx],
         });

         const testing = await testingAttendance(signedTx.raw);
         if (testing) {
            setShowModal(true);
            setMessage(t("attendance.attendance_success"));
            const updatedAttendance = { ...weekAttendance, [today.toLowerCase()]: true };
            setWeekAttendance(updatedAttendance);
         } else {
            setShowModal(true);
            setMessage(t("attendance.attendance_failed"));
         }
      } catch (error) {
         setShowModal(true);
         setMessage(t("attendance.attendance_err"));
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
      

      {/* 출첵 성공 여부 알림 모달창 */}
      {showModal && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full z-[9999]">
            <div className="bg-white text-black p-6 rounded-lg text-center w-[70%] max-w-[550px]">
                  {/* 문구 설정 */}
                  <p>{message}</p>
                  <button
                     className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
                     onClick={() => {
                        playSfx(Audios.button_click);
                        setShowModal(false);
                     }}>
                     {t("OK")}
                  </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Attendance;
