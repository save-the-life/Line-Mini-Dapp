// src/pages/DiceEventPage.tsx
import React, { useEffect, useState, useRef } from "react";
import UserLevel from "@/entities/User/components/UserLevel";
import "@/features/DiceEvent/DiceEvent.css";
import Images from "@/shared/assets/images";
import { MonthlyPrize } from "@/entities/MonthlyPrize";
import Attendance from "@/widgets/Attendance";
import MyRankingWidget from "@/widgets/MyRanking/MyRankingWidget";
import MissionWidget from "@/widgets/MissionWidget/MissionWidget";
import { useNavigate } from "react-router-dom";
import useDiceGame from "./useDiceGame";
import GameBoard from "./GameBoard";
import { Board } from "@/features/DiceEvent";
import RPSGame from "../RPSGame";
import SpinGame from "../SpinGame";
import { useUserStore } from "@/entities/User/model/userModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared/components/ui";
import { formatNumber } from "@/shared/utils/formatNumber";
import LevelRewards from "@/widgets/LevelRewards";
import LeaderBoard from "@/widgets/LeaderBoard";
import { HiX } from "react-icons/hi";
import { DialogClose } from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import getRewardPoints from "@/entities/Mission/api/fromRewardPoint";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import useWalletStore from "@/shared/store/useWalletStore";
import getKaiaRedirection from "@/entities/User/api/getKaiaRedirect";
import { InlineRanking } from "@/widgets/MyRanking/InlineRanking";
import { ModalRanking } from "@/widgets/MyRanking/ModalRanking";
import { useSDK } from "@/shared/hooks/useSDK";

const levelRewards = [
  // 2~9 레벨 보상 예시
  { level: 2, dice: 10, points: 1000 },
  { level: 3, dice: 15, points: 2000 },
  { level: 4, dice: 20, points: 3000 },
  { level: 5, dice: 30, points: 5000, tickets: 3 },
  { level: 6, dice: 40, points: 7000, tickets: 3 },
  { level: 7, dice: 50, points: 10000, tickets: 3 },
  { level: 8, dice: 60, points: 15000, tickets: 4 },
  { level: 9, dice: 70, points: 20000, tickets: 5 },

  // 10~14 레벨 보상 예시
  { level: 10, dice: 100, points: 30000, tickets: 7 },
  { level: 11, dice: 100, points: 30000, tickets: 7 },
  { level: 12, dice: 100, points: 30000, tickets: 7 },
  { level: 13, dice: 100, points: 30000, tickets: 7 },
  { level: 14, dice: 100, points: 30000, tickets: 7 },

  // 15~19 레벨 보상 예시
  { level: 15, dice: 200, points: 50000, tickets: 15 },
  { level: 16, dice: 200, points: 50000, tickets: 15 },
  { level: 17, dice: 200, points: 50000, tickets: 15 },
  { level: 18, dice: 200, points: 50000, tickets: 15 },
  { level: 19, dice: 200, points: 50000, tickets: 15 },

  // 20 레벨 보상 예시
  { level: 20, dice: 500, points: 100000, tickets: 100 },
];

const DiceEventPage: React.FC = () => {
  const {
    fetchUserData,
    isLoading,
    error,
    userLv,
    characterType,
    position,
    monthlyPrize,
    isAuto,
    pet,
    suspend,
    setSuspend,
    redirect,
    items,
  } = useUserStore();

  const game = useDiceGame();
  const { playSfx } = useSound();
  const [initialX, setInitialX] = useState<number>(140);
  const [initialY, setInitialY] = useState<number>(474);
  const [delta, setDelta] = useState<number>(56);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isInitialized } = useSDK();
  const { walletAddress } = useWalletStore();

  // AirDrop 팝업 표시를 위한 상태
  const [showAirDrop, setShowAirDrop] = useState<boolean>(false);

  // URL 보상 팝업 표시를 위한 상태
  const [showUrlReward, setShowUrlReward] = useState<boolean>(false);

  // 레벨 업 시 팝업 표시를 위한 상태
  const [showLevelUpDialog, setShowLevelUpDialog] = useState<boolean>(true);
  const [prevLevel, setPrevLevel] = useState<number>(userLv);

  // 레벨별 보상 다이얼로그 표시를 위한 상태
  const [showLevelRewardsDialog, setShowLevelRewardsDialog] =
    useState<boolean>(false);

  // 장착된 아이템 상태 (예시로 몇 개 아이템을 장착한 상태로 설정)
  const [equippedItems, setEquippedItems] = useState<
    Array<"balloon" | "crown" | "muffler" | "ribbon" | "sunglasses" | "wing">
  >([
    "crown",
    "sunglasses", // 예시: 왕관과 선글라스 장착
  ]);

  // 레벨 업 감지: userLv가 이전 레벨보다 커질 때만 팝업 표시
  useEffect(() => {
    if (userLv > prevLevel) {
      playSfx(Audios.level_up);
      setShowLevelUpDialog(true);
    }
    setPrevLevel(userLv);
  }, [userLv, prevLevel]);

  // 보상 링크를 통한 접근 여부 확인 및 보상 API 호출
  useEffect(() => {
    const referralCode = localStorage.getItem("referralCode");
    if (referralCode === "from-dapp-portal") {
      // console.log("[DiceEventPage] Dapp Portal referral detected. Calling reward API...");
      getRewardPoints()
        .then((message) => {
          // console.log("[DiceEventPage] Reward API response:", message);
          // 응답 메시지가 "Success"인 경우에만 다이얼로그 표시
          if (message === "Success") {
            setShowUrlReward(true);
          } else if (message === "Already Rewarded") {
            // console.log("[DiceEventPage] Reward already claimed.");
          }
          // 중복 호출 방지를 위해 referralCode 삭제
          localStorage.removeItem("referralCode");
        })
        .catch((error) => {
          // console.error("[DiceEventPage] Reward API error:", error);
        });
    }
  }, []);

  // 소유한 아이템 갯수에 따른 목록 표시 함수
  const getItemLabel = (label: string, count: number) => {
    if (count === 0) {
      return <span className="text-[#737373]">{label}</span>;
    } else if (count === 1) {
      return <span className="text-white">{label}</span>;
    } else {
      return (
        <span className="text-white">
          {label} x{count}
        </span>
      );
    }
  };

  // 아이템 목록에 적용
  const itemList = [
    {
      label: "GOLD PASS",
      icon: Images.GoldIcon,
      count: items.goldCount,
      gradient: "linear-gradient(180deg, #FDE047 0%, #FFFFFF 100%)",
    },
    {
      label: "SILVER PASS",
      icon: Images.SilverIcon,
      count: items.silverCount,
      gradient: "linear-gradient(180deg, #22C55E 0%, #FFFFFF 100%)",
    },
    {
      label: "BRONZE PASS",
      icon: Images.BronzeIcon,
      count: items.bronzeCount,
      gradient: "linear-gradient(180deg, #F59E0B 0%, #FFFFFF 100%)",
    },
    {
      label: "AUTO ITEM",
      icon: Images.AutoIcon,
      count: items.autoNftCount,
      gradient: "linear-gradient(180deg, #0147E5 0%, #FFFFFF 100%)",
    },
    {
      label: "REWARD BOOSTER",
      icon: Images.RewardIcon,
      count: items.rewardNftCount,
      gradient: "linear-gradient(180deg, #FF4F4F 0%, #FFFFFF 100%)",
    },
  ];

  // 현재 레벨 보상 찾기
  const currentReward = levelRewards.find((r) => r.level === userLv);

  const getCharacterImageSrc = () => {
    const index = Math.floor((userLv - 1) / 4);

    const catImages = [
      Images.Cat1,
      Images.Cat2,
      Images.Cat3,
      Images.Cat4,
      Images.Cat5,
    ];

    const dogImages = [
      Images.Dog1,
      Images.Dog2,
      Images.Dog3,
      Images.Dog4,
      Images.Dog5,
    ];

    if (characterType === "cat") {
      return catImages[index] || catImages[catImages.length - 1];
    } else {
      return dogImages[index] || dogImages[dogImages.length - 1];
    }
  };

  const getLevelEffectImageSrc = () => {
    const level = Math.min(userLv, 20);
    const effectImageKey = `LevelEffect${level}` as keyof typeof Images;
    return Images[effectImageKey] || Images.LevelEffect1;
  };

  const charactorImageSrc = getCharacterImageSrc();

  useEffect(() => {
    return () => {
      game.setIsAuto(false);
    };
  }, []);

  useEffect(() => {
    // SDK가 초기화되고 지갑이 연결된 후에 사용자 데이터를 가져옵니다.
    const initializeUserData = async () => {
      if (isInitialized && walletAddress) {
        console.log(
          "[DiceEvent] SDK is initialized and wallet is connected. Fetching user data."
        );
        await fetchUserData();

        const userTimeZone = useUserStore.getState().timeZone;
        const currentTimeZone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === null || userTimeZone !== currentTimeZone) {
          try {
            await updateTimeZone(currentTimeZone);
          } catch (error: any) {
            console.log("[DiceEvent] timezone error", error);
          }
        }

        const kaiaRedirect = localStorage.getItem("KaiaMission");
        if (kaiaRedirect === "kaia-reward") {
          try {
            await getKaiaRedirection();
          } catch (error: any) {
            console.log("[DiceEvent] kaia redirection error", error);
          }
        }
      } else {
        console.log(
          `[DiceEvent] Waiting for SDK and wallet... SDK Initialized: ${isInitialized}, Wallet Connected: ${!!walletAddress}`
        );
      }
    };

    initializeUserData();
  }, [isInitialized, walletAddress, fetchUserData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setInitialX(250);
        setInitialY(730);
        setDelta(100);
      } else {
        setInitialX(140);
        setInitialY(474);
        setDelta(56);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===============================
  //  모달 스케줄링 로직
  // ===============================
  const scheduledSlots = [16];
  const itemGuideSlots = [0, 9, 18];

  const [abuseModal, setabuseModal] = useState<boolean>(false);
  // 랭킹 보상 팝업 표시를 위한 상태
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [showItemGuideModal, setShowItemGuideModal] = useState(false);

  useEffect(() => {
    const checkAndShowModals = () => {
      const now = new Date();
      const hour = now.getHours();
      const dateKey = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}`;

      // ——————————————
      // 1) abuseModal + 래플권 모달
      // ——————————————
      let currentAbuseSlot: number | null = null;
      for (let slot of scheduledSlots) {
        if (hour >= slot) currentAbuseSlot = slot;
      }
      if (currentAbuseSlot !== null) {
        const slotId = `${dateKey}-${currentAbuseSlot}`;
        const lastShown = localStorage.getItem("abuseModalLastShown");
        const dismissed = localStorage.getItem("abuseModalDismissed");
        if (lastShown !== slotId && dismissed !== slotId) {
          setabuseModal(true);
          setShowRankingModal(true);
        }
      }

      // ——————————————
      // 2) 아이템 가이드 모달
      // ——————————————
      const currentItemSlot = itemGuideSlots
        .filter((slot) => hour >= slot)
        .pop();
      if (currentItemSlot != null) {
        const key = `${dateKey}-${currentItemSlot}-itemGuide`;
        if (!localStorage.getItem(key)) {
          setShowItemGuideModal(true);
        }
      }
    };

    // 최초 5초간 2초마다
    const fastInterval = window.setInterval(checkAndShowModals, 2000);

    // 5초 후 1시간 간격으로 전환
    let slowInterval: number;
    const switchTimeout = window.setTimeout(() => {
      clearInterval(fastInterval);
      slowInterval = window.setInterval(checkAndShowModals, 3600_000);
    }, 5000);

    return () => {
      clearInterval(fastInterval);
      clearTimeout(switchTimeout);
      if (slowInterval) clearInterval(slowInterval);
    };
  }, []);

  // 모달 닫을 때 현재 슬롯 정보를 기록하는 함수
  const handleCloseItemGuideModal = () => {
    const now = new Date();
    const hour = now.getHours();
    const dateKey = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    const slot = itemGuideSlots.filter((s) => hour >= s).pop();
    if (slot != null) {
      localStorage.setItem(`${dateKey}-${slot}-itemGuide`, "shown");
    }
    setShowItemGuideModal(false);
  };

  const handleCloseRankingModal = () => {
    const now = new Date();
    let currentSlot: number | null = null;
    for (let slot of scheduledSlots) {
      if (now.getHours() >= slot) {
        currentSlot = slot;
      }
    }
    if (currentSlot !== null) {
      const slotId = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}-${currentSlot}`;
      localStorage.setItem("abuseModalLastShown", slotId);
      localStorage.setItem("abuseModalDismissed", slotId);
    }
    setShowRankingModal(false);
  };
  // ===============================

  // 1. 상태 추가
  const [showRaffleBoxModal, setShowRaffleBoxModal] = useState(false);

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  const handleRPSGameEnd = (result: "win" | "lose", winnings: number) => {
    // console.log(`RPS Game Ended: ${result}, Winnings: ${winnings}`);
    fetchUserData();
    game.handleRPSGameEnd(result, winnings);
  };

  return (
    <div className="flex flex-col items-center relative w-full h-full overflow-x-hidden min-h-screen">
      {game.isRPSGameActive ? (
        <RPSGame
          onGameEnd={handleRPSGameEnd}
          onCancel={() => handleRPSGameEnd("lose", 0)}
        />
      ) : game.isSpinGameActive ? (
        <SpinGame onSpinEnd={game.handleSpinGameEnd} />
      ) : (
        <>
          <div className="w-full flex justify-center mb-4 mt-8 gap-[10px]">
            {/* 현재 캐릭터 레벨 및 AlertIcon 클릭 시 레벨 별 보상 다이얼로그 표시 */}
            <div
              onClick={(e) => {
                // AlertIcon 영역 클릭인지 확인 (좌측 상단 20x20 영역)
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // AlertIcon은 좌측 상단 15px, 15px 위치에 20x20 크기
                if (
                  clickX >= 15 &&
                  clickX <= 35 &&
                  clickY >= 15 &&
                  clickY <= 35
                ) {
                  // AlertIcon 영역 클릭이면 navigation 방지
                  return;
                }

                // 다른 영역 클릭이면 inventory로 이동
                // navigate("/inventory", { state: { charactorImageSrc } });
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Go to inventory"
              // onKeyDown={(e) => {
              //   if (e.key === "Enter" || e.key === " ") navigate("/inventory");
              // }}
            >
              <UserLevel
                userLv={userLv}
                charactorImageSrc={charactorImageSrc}
                exp={pet.exp}
                characterType={characterType || "cat"}
                equippedItems={equippedItems}
                onAlertClick={() => {
                  playSfx(Audios.button_click);
                  setShowLevelRewardsDialog(true);
                }}
              />
            </div>

            {/* 이번 달 보상 내용 */}
            <MonthlyPrize
              month={monthlyPrize.month}
              prizeType={monthlyPrize.prizeType}
              amount={monthlyPrize.amount}
              eventFinishTime={monthlyPrize.eventFinishTime}
            />
          </div>

          <GameBoard
            position={position}
            selectingTile={game.selectingTile}
            handleTileClick={game.handleTileClick}
            gaugeValue={game.gaugeValue}
            diceCount={game.diceCount}
            showDiceValue={game.showDiceValue}
            rolledValue={game.rolledValue}
            buttonDisabled={game.buttonDisabled}
            diceRef={game.diceRef}
            handleRollComplete={game.handleRollComplete}
            reward={game.reward}
            isHolding={game.isHolding}
            handleMouseDown={game.handleMouseDown}
            handleMouseUp={game.handleMouseUp}
            isLuckyVisible={game.isLuckyVisible}
            rollDice={game.rollDice}
          />
          {/* anywhere 시 표시되는 비행기 */}
          {game.selectingTile && !isAuto && (
            <div className="absolute md:top-0 top-0 left-0 w-full h-full flex justify-center items-center z-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-75 z-10"></div>
              <div className="text-white text-lg z-30 flex flex-col items-center justify-center mb-[200px] md:mb-[220px] font-semibold md:text-xl">
                <img
                  src={Images.Airplane}
                  alt="airplane"
                  className="h-20 md:h-28"
                />
                {t("dice_event.select_tile")}
              </div>
            </div>
          )}
          <Board
            position={position}
            charactorImageSrc={charactorImageSrc}
            initialX={initialX}
            initialY={initialY}
            delta={delta}
            equippedItems={equippedItems}
            characterType={characterType || "cat"}
          />
          <br />

          {/* 랜덤박스스 아이콘 */}
          <div className="w-full max-w-[332px] md:max-w-full flex justify-center">
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 12,
                margin: "0 0 8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setShowRaffleBoxModal(true)}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.65)",
                    boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    marginBottom: 2,
                  }}
                >
                  <img
                    src={Images.RandomBox}
                    alt="Random Box"
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </button>
                <p
                  className="text-center mt-1"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #2A294E",
                  }}
                >
                  랜덤 박스
                </p>
              </div>
            </div>
          </div>

          {/* my-rank 위젯 표시 */}
          <Dialog>
            <DialogTrigger
              className="w-full flex justify-center"
              onClick={() => playSfx(Audios.button_click)}
            >
              <InlineRanking />
            </DialogTrigger>
            <DialogContent className=" flex flex-col bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold  overflow-y-auto  max-h-[80%]">
              <DialogHeader className="flex w-full items-end">
                <DialogClose>
                  <HiX className="w-5 h-5" />
                </DialogClose>
              </DialogHeader>
              <ModalRanking />
              <LeaderBoard />
            </DialogContent>
          </Dialog>

          {/* 레벨별 보상 다이얼로그 */}
          <Dialog
            open={showLevelRewardsDialog}
            onOpenChange={setShowLevelRewardsDialog}
          >
            <DialogContent
              className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              }}
            >
              <DialogTitle className="sr-only">레벨별 보상</DialogTitle>
              <LevelRewards currentLevel={userLv} />
            </DialogContent>
          </Dialog>

                     {/* 레벨 업 시 다이얼로그: 이전보다 레벨이 올라갔을 때만 표시 */}
           <Dialog open={showLevelUpDialog}>
             <DialogContent 
               className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
               style={{
                 background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
               }}
             >
              <div className="flex flex-col items-center justify-around">
                <div className=" flex flex-col items-center gap-2">
                  <h1 
                    className="text-center"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "30px",
                      fontWeight: 400,
                      color: "#FDE047",
                      WebkitTextStroke: "2px #000000",
                    }}>
                    레벨 업
                  </h1>
                  <div className="relative w-36 h-36">
                    <img
                      src={Images.LevelUpBase}
                      alt="levelupEffect"
                      className="w-36 h-36"
                    />
                    <div
                       className="absolute inset-0 flex items-center justify-center"
                       style={{
                         fontFamily: "'ONE Mobile POP', sans-serif",
                         fontSize: "40px",
                         fontWeight: 400,
                         background: "radial-gradient(circle, #FDE047 0%, #F56800 100%)",
                         WebkitBackgroundClip: "text",
                         WebkitTextFillColor: "transparent",
                         backgroundClip: "text",
                         WebkitTextStroke: "2px #000000",
                         textAlign: "center",
                         lineHeight: "1.2",
                       }}
                     >
                       {userLv}
                     </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <p 
                    className="text-center"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}>
                    보상 받기
                  </p>
                  {currentReward && (
                    <div 
                      className="flex flex-row items-center gap-2"
                      style={{
                        width: "70vw",
                        background: "rgba(194, 213, 232, 0.1)",
                        border: "2px solid #B4CADA",
                        borderRadius: "20px",
                        padding: "16px",
                        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(15px)",
                        WebkitBackdropFilter: "blur(15px)",
                      }}
                    >
                      <div 
                        className="rounded-xl w-16 h-16 flex flex-col items-center gap-2 justify-center"
                        style={{
                          background: "rgba(194, 213, 232, 0.5)",
                          border: "2px solid #B4CADA",
                          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <img src={Images.Dice} alt="dice" className="w-6 h-6" />
                        <p className=" font-semibold text-xs">
                          +{currentReward.dice}
                        </p>
                      </div>
                      <div 
                        className="rounded-xl w-16 h-16 flex flex-col items-center gap-2 justify-center"
                        style={{
                          background: "rgba(194, 213, 232, 0.5)",
                          border: "2px solid #B4CADA",
                          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <img src={Images.Star} alt="star" className="w-6 h-6" />
                        <p className=" font-semibold text-xs">
                          +{formatNumber(currentReward.points)}
                        </p>
                      </div>
                      {currentReward.tickets && (
                        <div 
                          className="rounded-xl w-16 h-16 flex flex-col items-center gap-2 justify-center"
                          style={{
                            background: "rgba(194, 213, 232, 0.5)",
                            border: "2px solid #B4CADA",
                            boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                          }}
                        >
                          <img
                            src={Images.LotteryTicket}
                            alt="rapple"
                            className="w-6 h-6"
                          />
                          <p className=" font-semibold text-xs">
                            +{currentReward.tickets}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowLevelUpDialog(false)}
                  className="font-medium rounded-[10px] w-[250px] h-14 text-white"
                  style={{
                    background: "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
                    border: "2px solid #76C1FF",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    WebkitTextStroke: "1px #000000",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  확인
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 사용 중지 다이얼로그 */}
          <Dialog open={suspend}>
            <DialogTitle></DialogTitle>
            <DialogContent className=" bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]">
              <div className="relative">
                <DialogClose className="absolute top-0 right-0 p-2">
                  <HiX
                    className="w-5 h-5"
                    onClick={() => {
                      playSfx(Audios.button_click);
                      setSuspend(false);
                    }}
                  />
                </DialogClose>
              </div>
              <div className="flex flex-col items-center justify-around">
                <div className=" flex flex-col items-center gap-2">
                  <h1 className=" font-bold text-xl  text-center">
                    {t("dice_event.account_suspended")}
                  </h1>
                </div>
                <div className="flex flex-col mt-5">
                  <p className="font-Pretendard text-center text-base font-semibold">
                    {t("dice_event.fair_play")}
                    <br />
                    {t("dice_event.mistake")}
                  </p>
                </div>

                <div className="flex flex-col mt-2">
                  <p className="font-Pretendard text-center text-sm font-semibold text-[#DD2726]">
                    {t("dice_event.reason")}
                  </p>
                </div>

                <div className="flex flex-col mt-2">
                  <p className="font-Pretendard text-center text-sm font-normal text-[#A3A3A3]">
                    {t("dice_event.if_error")}
                    <br />
                    {t("dice_event.contact_team")}
                  </p>
                </div>
                <button
                  onClick={() => setSuspend(false)}
                  className="bg-[#0147E5] text-base font-medium rounded-full w-40 h-14 mt-8 mb-7"
                >
                  {t("agree_page.close")}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Raffle Random Box 모달 */}
          <Dialog
            open={showRaffleBoxModal}
            onOpenChange={setShowRaffleBoxModal}
          >
            <DialogContent className="bg-[#21212F] rounded-3xl text-white max-w-[90%] md:max-w-md p-6 border-none">
              <div className="flex flex-col items-center w-full">
                <h2 className="font-bold text-lg mb-4">Raffle Random Box</h2>
                <div className="flex items-center justify-center bg-[#252932] border-[#35383F] border-2 rounded-full px-6 py-2 mb-6">
                  <img
                    src={Images.LotteryTicket}
                    className="w-6 h-6 mr-2"
                    alt="ticket"
                  />
                  <span className="font-semibold text-lg">1000</span>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  {/* Bronze Lucky Box */}
                  <div className="flex items-center justify-between px-1 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 16,
                          background:
                            "linear-gradient(180deg, #19203C 70%, #304689 100%)",
                        }}
                      >
                        <img
                          src={Images.BronzeRandomBox}
                          style={{ width: 50, height: 50 }}
                          alt="bronze"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          Bronze Lucky Box
                        </div>
                        <div className="flex items-center gap-1 text-sm font-normal">
                          <img
                            src={Images.LotteryTicket}
                            className="w-5 h-5"
                            alt="ticket"
                          />
                          100
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-[55px] h-[25px] bg-[#DBEAFE] text-[#0147E5] font-medium rounded-2xl text-xs flex items-center justify-center"
                      disabled
                    >
                      OPEN
                    </button>
                  </div>
                  {/* Silver Lucky Box */}
                  <div className="flex items-center justify-between px-1 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 16,
                          background:
                            "linear-gradient(180deg, #19203C 70%, #304689 100%)",
                        }}
                      >
                        <img
                          src={Images.SilverRandomBox}
                          style={{ width: 50, height: 50 }}
                          alt="silver"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          Silver Lucky Box
                        </div>
                        <div className="flex items-center gap-1 text-sm font-normal">
                          <img
                            src={Images.LotteryTicket}
                            className="w-5 h-5"
                            alt="ticket"
                          />
                          300
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-[55px] h-[25px] bg-[#DBEAFE] text-[#0147E5] font-medium rounded-2xl text-xs flex items-center justify-center"
                      disabled
                    >
                      OPEN
                    </button>
                  </div>
                  {/* Gold Lucky Box */}
                  <div className="flex items-center justify-between px-1 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 16,
                          background:
                            "linear-gradient(180deg, #19203C 70%, #304689 100%)",
                        }}
                      >
                        <img
                          src={Images.GoldRandomBox}
                          style={{ width: 50, height: 50 }}
                          alt="gold"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          Gold Lucky Box
                        </div>
                        <div className="flex items-center gap-1 text-sm font-normal">
                          <img
                            src={Images.LotteryTicket}
                            className="w-5 h-5"
                            alt="ticket"
                          />
                          1000
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-[55px] h-[25px] bg-[#DBEAFE] text-[#0147E5] font-medium rounded-2xl text-xs flex items-center justify-center"
                      disabled
                    >
                      OPEN
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <br />
          <br />
          <br />
          <br />
          <br />
          <div className="hidden md:block md:mb-40"> &nbsp;</div>
        </>
      )}
    </div>
  );
};

export default DiceEventPage;
