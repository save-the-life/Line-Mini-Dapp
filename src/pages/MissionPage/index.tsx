// src/pages/MissionPage.tsx
import React, { useEffect, useState } from "react";

import { Dialog, DialogTitle, DialogContent } from "@/shared/components/ui";
import { TopTitle } from "@/shared/components/ui";
import "./MissionPage.css";
import Images from "@/shared/assets/images";
import missionImageMap from "@/shared/assets/images/missionImageMap";
import { missionNamesMap } from "./missionNameMap";
import { Link } from "react-router-dom";
import {
  useMissionStore,
  Mission,
} from "@/entities/Mission/model/missionModel";
import { formatNumber } from "@/shared/utils/formatNumber";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import { preloadImages } from "@/shared/utils/preloadImages";
import { useTranslation, Trans } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import Attendance from "@/widgets/Attendance";
import useWalletStore from "@/shared/store/useWalletStore";
import { connectWallet } from "@/shared/services/walletService";
import requestKaiaMission from "@/entities/Mission/api/kaiaMission";
import { Web3Provider } from "@kaiachain/ethers-ext"; 
import { TxType } from "@kaiachain/js-ext-core"; // ✅ Fee Delegation 타입 추가
import { ethers } from "ethers";
import testingKaia from "@/entities/User/api/kaiaTX";

//test-net
const contractAddress = "0xe68302943974E7f63d466918516DbaFA196c0F7a";
const feePayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
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
            "name": "userClaimCount",
            "type": "uint256"
         },
         {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalClaimCount",
            "type": "uint256"
         }
      ],
      "name": "Claimed",
      "type": "event"
   },
   {
      "inputs": [
         {
            "internalType": "address",
            "name": "",
            "type": "address"
         }
      ],
      "name": "claimCount",
      "outputs": [
         {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
         }
      ],
      "stateMutability": "view",
      "type": "function"
   },
   {
      "inputs": [
         {
            "internalType": "address",
            "name": "user",
            "type": "address"
         }
      ],
      "name": "getClaimCount",
      "outputs": [
         {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
         }
      ],
      "stateMutability": "view",
      "type": "function"
   },
   {
      "inputs": [],
      "name": "markClaimed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "inputs": [],
      "name": "totalClaims",
      "outputs": [
         {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
         }
      ],
      "stateMutability": "view",
      "type": "function"
   }
]


//main-net
// const contractAddress = "0x53aeFEF6f3C1C9Eb3C8C3b084D647d82aB700aB1";
// const feePayer = "0x22a4ebd6c88882f7c5907ec5a2ee269fecb5ed7a";
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
//             "name": "userClaimCount",
//             "type": "uint256"
//          },
//          {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "totalClaimCount",
//             "type": "uint256"
//          }
//       ],
//       "name": "Claimed",
//       "type": "event"
//    },
//    {
//       "inputs": [
//          {
//             "internalType": "address",
//             "name": "",
//             "type": "address"
//          }
//       ],
//       "name": "claimCount",
//       "outputs": [
//          {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//          }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//    },
//    {
//       "inputs": [
//          {
//             "internalType": "address",
//             "name": "user",
//             "type": "address"
//          }
//       ],
//       "name": "getClaimCount",
//       "outputs": [
//          {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//          }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//    },
//    {
//       "inputs": [],
//       "name": "markClaimed",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//    },
//    {
//       "inputs": [],
//       "name": "totalClaims",
//       "outputs": [
//          {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//          }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//    }
// ]

interface OneTimeMissionCardProps {
  mission: Mission;
  onClear: (id: number) => void;
  onMissionCleared: (mission: Mission) => void;
}

const OneTimeMissionCard: React.FC<OneTimeMissionCardProps> = ({
  mission,
  onClear,
  onMissionCleared,
}) => {
  const mapping = missionImageMap[mission.name];
  const imageSrc = mapping ? Images[mapping.imageKey] : Images.TokenReward;
  const className = mapping ? mapping.className : "";
  const { t } = useTranslation();
  const { playSfx } = useSound();

  const translatedName = missionNamesMap[mission.name]
    ? t(missionNamesMap[mission.name])
    : mission.name;

  // PENDING 상태 체크 (오버레이 없이 클릭 기능 유지)
  const isPending = mission.status === "PENDING";

  const handleClick = () => {
    playSfx(Audios.button_click);
    if (!mission.isCleared) {
      if (mission.redirectUrl) {
        window.open(mission.redirectUrl, "_blank");
      }
      onClear(mission.id);
      onMissionCleared(mission);
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl h-36 items-center justify-center gap-3 cursor-pointer ${className} ${
        mission.isCleared ? "pointer-events-none" : ""
      }`}
      onClick={handleClick}
      role="button"
      aria-label={`Mission: ${mission.name}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      {/* 미션 완료된 경우에만 어둡게 처리 */}
      {mission.isCleared && (
        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
      )}

      <div className="relative flex flex-col items-center justify-center z-0">
        <img src={imageSrc} alt={mission.name} className="w-9 h-9" />
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium">{translatedName}</p>
          <p className="font-semibold text-sm flex flex-row items-center gap-1">
            +{mission.diceReward}{" "}
            <img src={Images.Dice} alt="dice" className="w-4 h-4" /> +
            {formatNumber(mission.starReward)}{" "}
            <img src={Images.Star} alt="star" className="w-4 h-4" />
          </p>
        </div>
      </div>

      {mission.isCleared && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
          <img
            src={Images.MissionCompleted}
            alt="Mission Completed"
            className="w-5 h-5"
          />
          <p>{t("mission_page.Completed")}</p>
        </div>
      )}
    </div>
  );
};

interface DailyMissionProps {
  title: string;
  image: string;
  alt: string;
}

const DailyMissionCard: React.FC<DailyMissionProps> = ({ title, image, alt }) => {
  const { t } = useTranslation();
  return (
    <div className="basic-mission-card rounded-3xl p-5 text-white flex flex-col items-center gap-4">
       {/* 상단 이미지 */}
       <img
        src={image}
        alt={alt}
        className="w-[100px] h-[100px] object-cover"
      />

      {/* 제목(Invite Friends) + 화살표(>) */}
      <div className="flex items-center text-xl font-semibold space-x-2">
        <p>{title}</p>
        <p>{">"}</p>
      </div>

      {/* 상세 텍스트 영역 */}
      <div className="flex flex-col text-center item-center gap-2">
        {/* 1) +10,000 Star Points 메시지 */}
        <div>
          <span className="font-normal text-sm mr-1">1)</span>
          <Trans i18nKey="mission_page.starpoints_message">
            <span className="font-semibold text-base text-[#FDE047]">
              +10,000 Star Points
            </span>
            <br />
            <span className="font-normal text-sm">
              for both invitees and friends
            </span>
          </Trans>
        </div>

         {/* 2) 10% Payback 메시지 */}
         <div>
          <span className="font-normal text-sm mr-1">2)</span>
          <Trans i18nKey="mission_page.payback_message">
            <span className="font-semibold text-base text-[#FDE047] mr-1">
              10% Payback
            </span>
            <span className="font-normal text-sm">
              on Your Friend's Purchase
            </span>
          </Trans>
        </div>

        {/* NOTE 영역 */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <img src={Images.Note} alt="Note" className="w-5 h-5 object-cover" />
          <p className="text-sm font-semibold text-[#FDE047]">{t("mission_page.note")}</p>
        </div>
        <p className="text-xs font-normal text-center">
          {t("mission_page.only_user")}
        </p>
      </div>
    </div>
  );
};

const MissionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const [eventShow, setEventShow] = useState(false);
  const { missions, fetchMissions, clearMission } = useMissionStore();
  const kaiaMission = missions.find((mission) => mission.type === "KAIA");

  // 지갑 관련 전역 상태
  const { walletAddress, provider, sdk, walletType } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  
  // 보상 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{
    diceReward: number;
    starReward: number;
    amount?: number;
    spinType: string;
  } | null>(null);

  // 카이아 미션 관련 모달창
  const [kaiaLoading, setKaiaLoading] = useState(false);
  const [kaiaModal, setKaiaModal] = useState(false);
  const [kaiaMessage, setKaiaMessage] = useState("");
  const [needWallet, setNeedWallet] = useState(false);

  // 로컬 스토리지에서 보상 표시된 미션 ID를 초기화
  const [rewardShownMissions, setRewardShownMissions] = useState<number[]>(() => {
    const stored = localStorage.getItem("rewardShownMissions");
    return stored ? JSON.parse(stored) : [];
  });

  // 지갑 연결 취소 플래그 관련 유틸리티 함수들
  const getWalletCancelDate = (): string | null => {
    return localStorage.getItem("walletCancelDate");
  };

  const setWalletCancelDate = (date: string) => {
    localStorage.setItem("walletCancelDate", date);
  };

  const isWalletCanceledToday = (): boolean => {
    const cancelDate = getWalletCancelDate();
    if (!cancelDate) return false;
    
    const today = new Date().toDateString();
    return cancelDate === today;
  };

  const clearWalletCancelDate = () => {
    localStorage.removeItem("walletCancelDate");
  };

  const mappedImages = Object.values(missionImageMap).flatMap((item) =>
    Images[item.imageKey] ? [Images[item.imageKey]] : []
  );

  const imagesToLoad = [
    Images.MissionCompleted,
    Images.TokenReward,
    Images.LargeTwitter,
    Images.Star,
    Images.Dice,
    Images.InviteFriend,
    ...mappedImages,
  ];

  useEffect(() => {
    const loadAllImages = async () => {
      try {
        await preloadImages(imagesToLoad);
      } catch (error) {
        // console.error("이미지 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllImages();
  }, [imagesToLoad]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // 여기에 지갑 연결 로직 추가 (잔액 조회 없이)
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!walletAddress && !isWalletCanceledToday()) {
        try {
          // connectWallet 함수는 지갑 연결만 수행합니다.
          await connectWallet();
        } catch (error: any) {
          console.error("Wallet connection failed:", error);
          
          // 사용자가 취소한 경우 (코드 -32001)
          if (error?.code === -32001 && error?.message === "User canceled") {
            const today = new Date().toDateString();
            setWalletCancelDate(today);
          }
        }
      }
    };
    checkWalletConnection();
  }, [walletAddress]);

  // 미션 클리어 시 보상 처리 (이미 보상 모달이 표시된 미션은 건너뜁니다)
  const handleMissionCleared = (mission: Mission) => {
    if (rewardShownMissions.includes(mission.id)) {
      return;
    }
    setRewardData({
      diceReward: mission.diceReward,
      starReward: mission.starReward,
      spinType: "MISSION",
    });
    // setIsDialogOpen(true);
    // 상태와 로컬 스토리지에 미션 ID 추가
    setRewardShownMissions((prev) => {
      const updated = [...prev, mission.id];
      localStorage.setItem("rewardShownMissions", JSON.stringify(updated));
      return updated;
    });
  };

  // const handleCloseDialog = () => {
  //   playSfx(Audios.button_click);
  //   setIsDialogOpen(false);
  //   setRewardData(null);
  // };

  const handleClearMission = async (id: number) => {
    await clearMission(id);
    const clearedMission = missions.find((m) => m.id === id);
    if (clearedMission) {
      handleMissionCleared(clearedMission);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  const incompleteMissions = missions.filter(
    (m) => !m.isCleared && m.type !== "KAIA"
  );
  const completedMissions = missions.filter(
    (m) => m.isCleared && m.type !== "KAIA"
  );
  

  const handleKaiaMission = async() => {
    playSfx(Audios.button_click);
    
    if (!provider || !walletAddress || !sdk || !walletType) {
      if (isConnecting) return;
      setIsConnecting(true);
      try {
        const connection = await connectWallet();
        setIsConnecting(false);
        if (!connection.provider || !connection.walletAddress) {
          setShowModal(true);
          setMessage(t("attendance.wallet_fail"));
          return;
        }
        // 연결 성공 시 취소 플래그 제거
        clearWalletCancelDate();
      } catch (error: any) {
        setIsConnecting(false);
        console.error("Wallet connection failed:", error);
        
        // 사용자가 취소한 경우 (코드 -32001)
        if (error?.code === -32001 && error?.message === "User canceled") {
          const today = new Date().toDateString();
          setWalletCancelDate(today);
          return;
        }
        
        setShowModal(true);
        setMessage(t("attendance.wallet_fail"));
        return;
      }
    }

    // Kaia 미션 트랜젝션 실행
    try{
      const ethersProvider = new Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // 출석 체크 메시지 생성 및 서명
      const message = `Kaia Mission Rewards: ${walletAddress}`;
      const messageHash = ethers.utils.hashMessage(message);
      const signature = await signer.signMessage(message);
      const sig = ethers.utils.splitSignature(signature);

      // OKX 지갑 타입인 경우: 다른 로직으로 컨트랙트 실행
      if (provider.getWalletType() === "OKX") {
        const tx = await contract.markClaimed();
        const receipt = await tx.wait();
        // OKX의 경우 tx.hash를 사용하여 testingAttendance 호출 (백엔드에서 이를 처리할 수 있도록 구성 필요)

        if (receipt.status === 1) {
          // await okxAttendance();
          setShowModal(true);
          setMessage(t("attendance.attendance_success"));
        } else {
          setShowModal(true);
          setMessage(t("attendance.attendance_failed"));
        }
        return;
      }

      // OKX가 아닌 경우: Fee Delegation 로직 적용
      const contractCallData = contract.interface.encodeFunctionData("markClaimed", []);

      const tx = {
        typeInt: TxType.FeeDelegatedSmartContractExecution,
        from: walletAddress,
        to: contractAddress,
        input: contractCallData,
        value: "0x0",
        feePayer,
        gas: "0x186A0",
      };

      const signedTx = await provider.request({
        method: "kaia_signTransaction",
        params: [tx],
      });

      // const test = await testingKaia(signedTx.raw, walletAddress);

      if(signedTx){
        setKaiaLoading(true);
        try{
          const kaia = await requestKaiaMission(signedTx.raw, walletAddress);

          if(kaia.message === "Success"){
            setKaiaLoading(false);
            setKaiaModal(true);
            setKaiaMessage(t("mission_page.success"));
          } else if (kaia.message === "You've already claimed your Level 2 KAIA reward."){
            setKaiaLoading(false);
            setKaiaModal(true);
            setKaiaMessage(t("mission_page.already"));
          } else if( kaia.message === "You're not eligible for the reward."){
            setKaiaLoading(false);
            setKaiaModal(true);
            setKaiaMessage(t("mission_page.not_eligible"));
          }
        } catch(error: any){
          setKaiaLoading(false);
          setKaiaModal(true);
          setKaiaMessage(t("mission_page.failed"));
        }
      }
    } catch(error: any){
      console.log("에러 확인: ", error);
      setKaiaLoading(false);
      setKaiaModal(true);
      setKaiaMessage(t("mission_page.failed"));
    }

    // 지갑 주소가 존재하는 경우에 진행
    // if(walletAddress != null){
    //   // 시간이 걸리므로 로딩창 표시
    //   setKaiaLoading(true);
    //   try{
    //     const kaia = await requestKaiaMission(walletAddress);

    //     if(kaia.message === "Success"){
    //       setKaiaLoading(false);
    //       setKaiaModal(true);
    //       setKaiaMessage(t("mission_page.success"));
    //     } else if (kaia.message === "You've already claimed your Level 2 KAIA reward."){
    //       setKaiaLoading(false);
    //       setKaiaModal(true);
    //       setKaiaMessage(t("mission_page.already"));
    //     } else if( kaia.message === "You're not eligible for the reward."){
    //       setKaiaLoading(false);
    //       setKaiaModal(true);
    //       setKaiaMessage(t("mission_page.not_eligible"));
    //     }
    //   } catch(error: any){
    //     setKaiaLoading(false);
    //     setKaiaModal(true);
    //     setKaiaMessage(t("mission_page.failed"));
    //   }
    // } else {
    //   setNeedWallet(true);
    // }
  }

  const handleConnectWallet = async() => {
    playSfx(Audios.button_click)
    setNeedWallet(false);
    try {
      // connectWallet 함수는 지갑 연결만 수행합니다.
      await connectWallet();
      // 연결 성공 시 취소 플래그 제거
      clearWalletCancelDate();
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      
      // 사용자가 취소한 경우 (코드 -32001)
      if (error?.code === -32001 && error?.message === "User canceled") {
        const today = new Date().toDateString();
        setWalletCancelDate(today);
      }
    }
  }

  return (
    <div className="flex flex-col text-white mb-20 md:mb-96 min-h-screen">
      <TopTitle title={t("mission_page.Mission")} />

      {/* 이벤트 배너 */}
      {eventShow && (
        <div
          className="w-full h-[150px] bg-cover bg-center flex items-center justify-between px-6 mb-4"
          style={{ backgroundImage: `url(${Images.eventBanner})` }}
        >
          <div className="text-white">
            <p className="font-bold text-2xl">{t("mission_page.air_drop")}</p>
            <p className="font-bold text-2xl">{t("mission_page.grab")}</p>
          </div>
          <img
            src={Images.eventBox}
            alt="Event Box"
            className="w-[100px] h-[108px]"
          />
        </div>
      )}

      {/* 출석 위젯 */}
      <h1 className="font-semibold text-lg ml-7">
        {t("dice_event.attendance")}
      </h1>
      <div className="mx-6">
        <Attendance />
      </div>

      {/* 미완료 미션 */}
      {incompleteMissions.length > 0 && (
        <>
          <h1 className="font-semibold text-lg mb-4 ml-7 mt-5">
            {t("mission_page.One_Time_Mission")}
          </h1>
          <div className="grid grid-cols-2 gap-3 mx-6">
            {incompleteMissions.map((mission) => {
              if (mission.name !== "Leave a Supportive Comment on SL X") {
                return (
                  <OneTimeMissionCard
                    key={mission.id}
                    mission={mission}
                    onClear={handleClearMission}
                    onMissionCleared={handleMissionCleared}
                  />
                );
              } else {
                const translatedName = missionNamesMap[mission.name]
                  ? t(missionNamesMap[mission.name])
                  : mission.name;
                return (
                  <div className="col-span-2" key={mission.id}>
                    <div
                      className={`basic-mission-card h-36 rounded-3xl flex flex-row items-center pl-8 pr-5 justify-between relative cursor-pointer ${
                        mission.isCleared ? "pointer-events-none" : ""
                      }`}
                      onClick={() => {
                        playSfx(Audios.button_click);
                        if (!mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                      role="button"
                      aria-label={`Mission: ${mission.name}`}
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                    >
                      {mission.isCleared && (
                        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
                      )}
                      <div className="relative flex flex-row items-center justify-between z-0 w-full">
                        <div className="md:space-y-3">
                          <p className="text-sm font-medium">{translatedName}</p>
                          <p className="font-semibold flex flex-row items-center gap-1 mt-2">
                            +{mission.diceReward}{" "}
                            <img
                              src={Images.Dice}
                              alt="dice"
                              className="w-5 h-5"
                            />
                            &nbsp; +{formatNumber(mission.starReward)}{" "}
                            <img
                              src={Images.Star}
                              alt="star"
                              className="w-5 h-5"
                            />
                          </p>
                        </div>
                        <img
                          src={Images.LargeTwitter}
                          alt="Large Twitter"
                          className="w-20 h-20"
                        />
                      </div>
                      {mission.isCleared && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
                          <img
                            src={Images.MissionCompleted}
                            alt="Mission Completed"
                            className="w-5 h-5"
                          />
                          <p>{t("mission_page.Completed")}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs mb-8 mt-2 text-white whitespace-nowrap">
                      {t(
                        "mission_page.*_If_the_mission_is_not_performed_correctly,_you_may_be_excluded_from_the_final_reward."
                      )}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}

      {/* kaia 미션 - 2레벨 달성 시 활성화 */}
      {kaiaMission && kaiaMission.hasEventAccess && (
        <>
          <h1 className="font-semibold text-lg my-4 ml-7">
            KAIA {t("mission_page.Mission")}
          </h1>
          <div
            className={`
              relative
              h-[132px] flex items-center justify-between
              rounded-3xl overflow-hidden
              mx-6 mb-6
              ${(!kaiaMission?.isAvailable || kaiaMission?.isCleared) ? "pointer-events-none" : ""}
            `}
            style={{ background: "linear-gradient(to bottom, #9DE325 0%, #306E0A 100%)" }}
            onClick={() => {
              if (kaiaMission?.isAvailable && !kaiaMission?.isCleared) {
                handleKaiaMission();
              }
            }}
          >
            {/* 비활성화 시 전체 덮는 오버레이 (z-30으로 상향) */}
            {(!kaiaMission?.isAvailable || kaiaMission?.isCleared) && (
              <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-30" />
            )}

            {/* 텍스트 블록 (z-20) */}
            <div className="pl-8 relative z-20">
              <p className="text-sm font-medium text-white whitespace-nowrap">
                {t("mission_page.level2")}
              </p>
              <div className="flex items-center">
                <p className="text-base font-semibold text-white">+0.1</p>
                <img
                  src={Images.KaiaLogo}
                  alt="Kaia Icon"
                  className="ml-2 w-5 h-5 rounded-full object-cover"
                />
              </div>
            </div>

            {/* 배경 이미지 (z-10) */}
            <img
              src={Images.KaiaLevel5}
              alt="kaia-level2"
              className="
                absolute
                right-0 bottom-0
                w-[142px] h-[142px]
                object-cover
                z-10
              "
            />
          </div>
        </>
      )}




      {/* 일일 미션 */}
      <h1 className="font-semibold text-lg my-4 ml-7">
        {t("mission_page.Daily_Mission")}
      </h1>
      <div className="mx-6 mb-8">
        <Link to="/invite-friends" onClick={() => playSfx(Audios.button_click)}>
          <DailyMissionCard
            title={t("mission_page.Invite_friends")}
            alt="Invite Friend"
            image={Images.InviteFriend}
          />
        </Link>
      </div>

      {/* 완료된 미션 */}
      {completedMissions.length > 0 && (
        <>
          <h1 className="font-semibold text-lg mb-4 ml-7">
            {t("mission_page.Completed_mission")}
          </h1>
          <div className="grid grid-cols-2 gap-3 mx-6">
            {completedMissions.map((mission) => {
              if (mission.name !== "Leave a Supportive Comment on SL X") {
                return (
                  <OneTimeMissionCard
                    key={mission.id}
                    mission={mission}
                    onClear={handleClearMission}
                    onMissionCleared={handleMissionCleared}
                  />
                );
              } else {
                const translatedName = missionNamesMap[mission.name]
                  ? t(missionNamesMap[mission.name])
                  : mission.name;
                return (
                  <div className="col-span-2" key={mission.id}>
                    <div
                      className={`basic-mission-card h-36 rounded-3xl flex flex-row items-center pl-8 pr-5 justify-between relative cursor-pointer ${
                        mission.isCleared ? "pointer-events-none" : ""
                      }`}
                      onClick={() => {
                        playSfx(Audios.button_click);
                        if (!mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                      role="button"
                      aria-label={`Mission: ${mission.name}`}
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                    >
                      {mission.isCleared && (
                        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
                      )}
                      <div className="relative flex flex-row items-center justify-between z-0 w-full">
                        <div className="md:space-y-3">
                          <p className="text-sm font-medium">{translatedName}</p>
                          <p className="font-semibold flex flex-row items-center gap-1 mt-2">
                            +{mission.diceReward}{" "}
                            <img
                              src={Images.Dice}
                              alt="dice"
                              className="w-5 h-5"
                            />
                            &nbsp; +{formatNumber(mission.starReward)}{" "}
                            <img
                              src={Images.Star}
                              alt="star"
                              className="w-5 h-5"
                            />
                          </p>
                        </div>
                        <img
                          src={Images.LargeTwitter}
                          alt="Large Twitter"
                          className="w-20 h-20"
                        />
                      </div>
                      {mission.isCleared && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
                          <img
                            src={Images.MissionCompleted}
                            alt="Mission Completed"
                            className="w-5 h-5"
                          />
                          <p>{t("mission_page.Completed")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}

      {/* kaia 미션 - 2레벨 달성 시 활성화 */}
      {kaiaMission && !kaiaMission.hasEventAccess && (
         <>
          <h1 className="font-semibold text-lg my-4 ml-7">
            KAIA {t("mission_page.Mission")}
          </h1>
          <div
            className={`
              relative
              h-[132px] flex items-center justify-between
              rounded-3xl overflow-hidden
              mx-6 mb-6
              ${(!kaiaMission?.isAvailable || kaiaMission?.isCleared) ? "pointer-events-none" : ""}
            `}
            style={{ background: "linear-gradient(to bottom, #9DE325 0%, #306E0A 100%)" }}
            onClick={() => {
              if (kaiaMission?.isAvailable && !kaiaMission?.isCleared) {
                handleKaiaMission();
              }
            }}
          >
            {/* 비활성화 시 전체 덮는 오버레이 (z-30으로 상향) */}
            {(!kaiaMission?.isAvailable || kaiaMission?.isCleared) && (
              <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-30" />
            )}

            {/* 텍스트 블록 (z-20) */}
            <div className="pl-8 relative z-20">
              <p className="text-sm font-medium text-white whitespace-nowrap">
                {t("mission_page.level2")}
              </p>
              <div className="flex items-center">
                <p className="text-base font-semibold text-white">+0.1</p>
                <img
                  src={Images.KaiaLogo}
                  alt="Kaia Icon"
                  className="ml-2 w-5 h-5 rounded-full object-cover"
                />
              </div>
            </div>

            {/* 배경 이미지 (z-10) */}
            <img
              src={Images.KaiaLevel5}
              alt="kaia-level2"
              className="
                absolute
                right-0 bottom-0
                w-[142px] h-[142px]
                object-cover
                z-10
              "
            />
          </div>
        </>
      )}

      <div className="my-10"></div>

      {/* 지갑 미연결 시 안내창 */}
      <Dialog open={needWallet}>
        <DialogTitle></DialogTitle>
        <DialogContent 
          className=" bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[30%]">
          <div className="flex flex-col items-center justify-around">
            <div className="flex flex-row items-center justify-center">
              <p className="text-xl font-bold">{t("mission_page.wallet")}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-base font-semibold mt-4 mb-2">{t("mission_page.need_wallet")}</p>
            </div>
            <button
              onClick={handleConnectWallet}
              className="bg-[#0147E5] text-base font-medium rounded-full w-40 h-14 mt-5">
              {t("mission_page.connect")}
          </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 카이아 보상 신청 로딩 */}
      <Dialog open={kaiaLoading}>
        <DialogTitle></DialogTitle>
        <DialogContent 
          className=" bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[30%]">
          <div className="flex flex-col items-center justify-around">
            <div className="flex flex-row items-center justify-center">
              <p className="text-xl font-bold">{t("asset_page.claim.process")}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm mt-4 mb-1">{t("mission_page.receiving")}</p>
              <p className="text-xs text-gray-400 mb-4">{t("asset_page.claim.wait")}</p>
              <LoadingSpinner size={16} className="h-[80px]"  />
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* 카이아 미션 완료 안내 */}
      <Dialog open={kaiaModal}>
        <DialogTitle></DialogTitle>
        <DialogContent 
          className=" bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[30%]">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-xl font-bold mt-4 mb-2">{t("mission_page.result")}</p>
            <p className="text-base font-medium">{kaiaMessage}</p>
            <button
              onClick={() => {
                  playSfx(Audios.button_click);
                  setKaiaModal(false);
                  fetchMissions();
              }}
              className="bg-[#0147E5] text-base font-medium rounded-full w-40 h-14 mt-5">
              Check
          </button>
          </div>
        </DialogContent>
      </Dialog>



      {/* 미션 보상 다이얼로그 */}
      {/* <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="rounded-3xl bg-[#21212F] text-white border-none max-w-[90%] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold text-xl">
              <div className="flex flex-row items-center justify-between">
                <div>&nbsp;</div>
                <p>{t("mission_page.mission_reward")}</p>
                <HiX
                  className="w-6 h-6 cursor-pointer"
                  onClick={handleCloseDialog}
                />
              </div>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center w-full h-full gap-10">
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="mt-20 w-28 h-28 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-[24px] flex items-center justify-center">
                <div className="w-[110px] h-[110px] logo-bg rounded-[24px] flex items-center flex-col justify-center gap-2">
                  <img
                    src={Images.Dice}
                    className="w-10 h-10"
                    alt="Dice Reward"
                  />
                  <p className="font-semibold text-lg">
                    +{rewardData && formatNumber(rewardData.diceReward)}
                  </p>
                </div>
              </div>
              <div className="mt-20 w-28 h-28 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-[24px] flex items-center justify-center">
                <div className="w-[110px] h-[110px] logo-bg rounded-[24px] flex items-center flex-col justify-center gap-2">
                  <img
                    src={Images.Star}
                    className="w-10 h-10"
                    alt="Star Reward"
                  />
                  <p className="font-semibold text-lg">
                    +{rewardData && formatNumber(rewardData.starReward)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold">{t("mission_page.congrate")}</p>
              <p className="text-[#a3a3a3]">
                {t("mission_page.reward_added")}
              </p>
            </div>
            <div className="space-y-3 w-full">
              <button
                className="w-full h-14 rounded-full bg-[#0147e5]"
                onClick={handleCloseDialog}
              >
                {t("mission_page.ok")}
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
};

export default MissionPage;