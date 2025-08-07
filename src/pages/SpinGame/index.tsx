// src/pages/SpinGame/index.tsx

import React, { useEffect, useState } from "react";
import Images from "@/shared/assets/images";
import { preloadImages } from "@/shared/utils/preloadImages";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner"; // ★ 이 로딩 스피너 사용
import { motion } from "framer-motion";
import { useUserStore } from "@/entities/User/model/userModel";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/utils/formatNumber";
import { IoGameController } from "react-icons/io5";
import { Wheel } from "react-custom-roulette";
import { AlertDialog, AlertDialogContent } from "@/shared/components/ui";
import api from "@/shared/api/axiosInstance";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

const data = [
  {
    option: "2000 Stars",
    image: {
      uri: `${Images.spinStar2000}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "STAR", amount: 2000 },
    style: { backgroundColor: "#FBA629" },
  },
  {
    option: "1 Raffle Ticket",
    image: {
      uri: `${Images.SpinRapple1Black}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "TICKET", amount: 1 },
    style: { backgroundColor: "#F3F3E9" },
  },
  {
    option: "4000 Stars",
    image: {
      uri: `${Images.spinStar4000}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "STAR", amount: 4000 },
    style: { backgroundColor: "#2FAF74" },
  },
  {
    option: "1 Raffle Ticket",
    image: {
      uri: `${Images.spinRapple1}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "TICKET", amount: 1 },
    style: { backgroundColor: "#39A1E8" },
  },
  {
    option: "1000 Stars",
    image: {
      uri: `${Images.spinStar1000}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "STAR", amount: 1000 },
    style: { backgroundColor: "#CA3D77" },
  },
  {
    option: "1 Raffle Ticket",
    image: {
      uri: `${Images.spinRapple1}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "TICKET", amount: 1 },
    style: { backgroundColor: "#FBA629" },
  },
  {
    option: "5000 Stars",
    image: {
      uri: `${Images.spinStar5000}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "STAR", amount: 5000 },
    style: { backgroundColor: "#F3F3E9" },
  },
  {
    option: "1 Dice",
    image: {
      uri: `${Images.SpinDice1}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "DICE", amount: 1 },
    style: { backgroundColor: "#2FAF74" },
  },
  {
    option: "10 Coins",
    image: {
      uri: `${Images.spinToken10}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "SL", amount: 10 },
    style: { backgroundColor: "#39A1E8" },
  },
  {
    option: "1 Raffle Ticket",
    image: {
      uri: `${Images.spinRapple1}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "TICKET", amount: 1 },
    style: { backgroundColor: "#CA3D77" },
  },
  {
    option: "Boom!",
    image: {
      uri: `${Images.Boom}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "BOOM", amount: 0 },
    style: { backgroundColor: "#333333" },
  },
];

// 커스텀 휠 컴포넌트
const CustomWheel: React.FC<{
  mustSpin: boolean;
  prizeNumber: number;
  onSpinEnd: () => void;
  data: any[];
}> = ({ mustSpin, prizeNumber, onSpinEnd, data }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (mustSpin && !isSpinning) {
      setIsSpinning(true);

      // 회전 애니메이션 계산
      const totalRotation = 360 * 5 + (360 / data.length) * prizeNumber; // 5바퀴 + 당첨 위치
      const duration = 3000; // 3초

      setRotation(totalRotation);

      // 회전 완료 후 콜백
      setTimeout(() => {
        setIsSpinning(false);
        onSpinEnd();
      }, duration);
    }
  }, [mustSpin, prizeNumber, data.length, onSpinEnd, isSpinning]);

  return (
    <div className="relative w-[328px] h-[328px]">
      {/* 배경 돌림판 이미지 */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${3000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
            : "none",
        }}
      >
        <img
          src={Images.NewWheel} // 새로운 회전판 이미지 사용
          alt="Spin Wheel"
          className="w-full h-full"
        />

        {/* 보상 내용 오버레이 */}
        {data.map((item, index) => {
          const angle = (360 / data.length) * index;
          // 반응형 radius 계산 (비율 기반)
          const radius = 35; // 휠 크기의 35% 반지름
          const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius;
          const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius;

          return (
            <div
              key={index}
              className="absolute w-[12%] h-[12%] flex items-center justify-center"
              style={{
                left: `calc(50% + ${x}% - 6%)`,
                top: `calc(50% + ${y}% - 6%)`,
                transform: `rotate(${-rotation}deg)`, // 텍스트가 회전하지 않도록
              }}
            >
              <div className="text-center">
                <img
                  src={item.image.uri}
                  alt={item.option}
                  className="w-[60%] h-[60%] mx-auto mb-1"
                />
                <div
                  className="text-[2.5vw] md:text-xs font-bold"
                  style={{ color: item.style.textColor || "#000000" }}
                >
                  {item.option}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 스핀 시작 컴포넌트
const SpinGameStart: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center px-12 pb-8 h-full w-full"
      style={{
        backgroundImage: `url(${Images.BackgroundRulette})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        className="text-center mt-8 "
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        돌림판을 돌리고,
        <br />
        상품을 받아보세요!
      </h1>

      <img
        src={Images.SpinExample}
        alt="spin-prop"
        className="w-[280px] h-[402px] md:w-[328px] md:h-[470px] self-center"
      />
      <div
        className="rounded-[20px] text-center w-[260px] md:w-[300px] h-[110px] flex items-center justify-center -mt-10"
        style={{
          background: "rgba(0, 94, 170, 0.5)",
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        <p>
          ※ 안내 ※
          <br />
          룰렛을 돌리지 않고 나가면,
          <br />
          차례가 사라집니다.
        </p>
      </div>
      <button
        className="flex items-center justify-center h-14 mt-4 w-[260px] md:w-[300px] rounded-[10px]"
        onClick={onStart}
        style={{
          background: "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
          border: "2px solid #76C1FF",
          boxShadow: "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        시작하기
      </button>
    </div>
  );
};

// 실제 스핀 컴포넌트
const Spin: React.FC<{ onSpinEnd: () => void }> = ({ onSpinEnd }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prizeData, setPrizeData] = useState<{
    spinType: string;
    amount: number;
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { playSfx } = useSound();
  const { t } = useTranslation();

  const { setStarPoints, setDiceCount, setSlToken, setLotteryCount, items } =
    useUserStore();

  const handleSpinClick = async () => {
    playSfx(Audios.button_click);

    if (isSpinning) return;

    try {
      setIsSpinning(true);

      playSfx(Audios.spin_game);

      // /play-spin API 호출
      const response = await api.get("/play-spin");
      // console.log("Server response:", response.data);
      if (response.data.code === "OK") {
        const { spinType, amount, baseAmount } = response.data.data;
        // console.log("Received spinType:", spinType,"amount:",amount,"baseAmount:",baseAmount);

        // data 배열에서 spinType과 baseAmount 가 모두 일치하는 인덱스 찾기
        const foundIndex = data.findIndex(
          (item) =>
            item.prize.type === spinType.toUpperCase() &&
            item.prize.amount === baseAmount
        );

        if (foundIndex !== -1) {
          // console.log("Prize index found:", foundIndex);
          setPrizeNumber(foundIndex);
          setPrizeData({ spinType, amount });
          setMustSpin(true);
        } else {
          // console.error("No matching prize found for given spinType and baseAmount");
          window.location.reload();
        }
      } else {
        // console.error("Error in play-spin API:", response.data.message);
        window.location.reload();
      }
    } catch (error) {
      // console.error("Error calling play-spin API:", error);
      window.location.reload();
    } finally {
      setIsSpinning(false);
    }
  };

  const handleSpinEnd = () => {
    setMustSpin(false);
    // 사용자 상태 업데이트
    if (prizeData) {
      // console.log("Prize data:", prizeData);
      const { spinType, amount } = prizeData;

      const normalizedSpinType = spinType.trim().toUpperCase();

      // 결과 사운드 처리
      if (normalizedSpinType === "BOOM") {
        // 붐(꽝)이면 패배 사운드
        playSfx(Audios.rps_lose);
        // console.log("Boom! Better luck next time!");
      } else {
        // 그 외엔 보상 사운드
        playSfx(Audios.reward);
      }

      if (normalizedSpinType === "STAR") {
        setStarPoints((prev: number) => prev + amount);
      } else if (normalizedSpinType === "DICE") {
        setDiceCount((prev: number) => prev + amount);
      } else if (normalizedSpinType === "SL") {
        setSlToken((prev: number) => prev + amount);
      } else if (normalizedSpinType === "TICKET") {
        setLotteryCount((prev: number) => prev + amount);
      } else if (normalizedSpinType === "BOOM") {
        // console.log("Boom! Better luck next time!");
      }
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    playSfx(Audios.button_click);
    setPrizeData(null);
    setIsDialogOpen(false);
    onSpinEnd();
    setIsSpinning(false);
  };

  const getPrizeDisplayName = (spinType: string | undefined) => {
    if (!spinType) return "Unknown";
    const normalizedSpinType = spinType.trim().toUpperCase();

    switch (normalizedSpinType) {
      case "STAR":
        return "Stars";
      case "DICE":
        return "Dice";
      case "SL":
        return "Coins";
      case "TICKET":
        return "Raffle Ticket";
      case "BOOM":
        return "Boom! Try Again";
      default:
        return "Unknown";
    }
  };

  // spinType에 따라 이미지 선택
  const getPrizeImage = (spinType: string | undefined) => {
    if (!spinType) return Images.Dice;
    const normalizedSpinType = spinType.trim().toUpperCase();
    switch (normalizedSpinType) {
      case "STAR":
        return Images.Star; // 별 대표 이미지
      case "DICE":
        return Images.Dice; // 주사위 이미지
      case "SL":
        return Images.TokenReward; // 코인 이미지
      case "TICKET":
        return Images.LotteryTicket; // 래플 티켓 이미지
      case "BOOM":
        return Images.Boom; // 붐 이미지
      default:
        return Images.Dice;
    }
  };

  return (
    <div
      className="relative flex flex-col items-center h-screen justify-center w-full"
      style={{
        backgroundImage: `url(${Images.BackgroundRulette})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        className="text-center mt-8 md:mb-12"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        돌림판을 돌리고,
        <br />
        상품을 받아보세요!
      </h1>

      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="relative w-full h-[402px] md:h-[471px] md:mt-16"
      >
        {/* SpinProp을 받침대로 사용 */}
        <img
          src={Images.SpinProp}
          alt="Spin-prop"
          className="w-[220px] h-[220px] absolute"
          loading="lazy"
          style={{
            top: "50%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* NewPin을 받침대 위에 고정 - 비율 기반 위치 */}
        <motion.img
          src={Images.NewPin}
          alt="Spin-pin"
          className="absolute z-20 w-[70px] h-auto"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
          }}
          loading="lazy"
          initial={{ x: -200 }}
          animate={{ x: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        />

        {/* NewWheel을 받침대 위에서 회전 - 비율 기반 위치 */}
        <div
          className="absolute z-10"
          style={{
            top: "35%", // 더 위로 이동
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
          }}
        >
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          >
            <CustomWheel
              mustSpin={mustSpin}
              prizeNumber={prizeNumber}
              onSpinEnd={handleSpinEnd}
              data={data}
            />
          </motion.div>
        </div>
      </motion.div>

      <button
        onClick={handleSpinClick}
        disabled={isSpinning || mustSpin}
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
        className={`flex items-center justify-center h-14 mt-4 w-[300px] md:w-[342px] rounded-full ${
          isSpinning || mustSpin
            ? "bg-[#21212f] opacity-65 text-white cursor-not-allowed"
            : "bg-[#21212f] text-white"
        }`}
      >
        {isSpinning ? "돌리는 중..." : "룰렛 돌리기"}
      </button>

      {/* 결과 모달 */}
      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent
          className="rounded-3xl  border-none max-w-[90%] md:max-w-lg"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            boxShadow:
              "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <h1
              className="mt-10 text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              보상 받기
            </h1>
            <div className="w-32 h-32 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-[24px] flex items-center justify-center">
              <div className="w-[126px] h-[126px] logo-bg rounded-[24px] flex items-center justify-center flex-col gap-2">
                <img
                  src={getPrizeImage(prizeData?.spinType)}
                  className="w-12 h-12"
                  alt="Prize"
                />
              </div>
            </div>
            <div className="flex flex-col w-full mt-4">
              <p
                className="text-center"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                다음 보상을 받았습니다:{" "}
              </p>
              <div className="rounded-3xl border-2 border-[#35383f] bg-[#1f1e27] p-5 mt-2">
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={Images.RewardNFT}
                    alt="rewardBooster"
                    className="w-6 h-6"
                  />
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    보상 부스터
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1 mt-2 ml-6">
                  <IoGameController className="text-xl" />
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    돌림판 보상 업그레이드 : x{items.spinTimes}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 w-[300px] h-14 mt-4">
              <button
                className="w-full h-14 rounded-full bg-[#0147e5]"
                onClick={handleCloseDialog}
                style={{
                  fontFamily: "8px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// 메인 SpinGame 컴포넌트
const SpinGame: React.FC<{ onSpinEnd: () => void }> = ({ onSpinEnd }) => {
  const [showSpin, setShowSpin] = useState(false);
  const { playSfx } = useSound();

  // 이미지 로딩 여부 (true일 때 로딩 중)
  const [isLoading, setIsLoading] = useState(true);

  // preload할 이미지 목록
  const imagesToLoad = [
    Images.BackgroundRulette,
    Images.SpinExample,
    Images.SpinProp,
    Images.Spin,
    Images.SpinPin,
    Images.NewWheel, // 새로운 회전판 이미지 추가
    Images.NewPin, // 핀 이미지 추가
    Images.RewardNFT,
    Images.Star,
    Images.Dice,
    Images.TokenReward,
    Images.LotteryTicket,
    Images.Boom,
    // data 객체 안에 쓰인 이미지들도 모두 추가
    Images.spinStar2000,
    Images.SpinDice10,
    Images.spinStar4000,
    Images.SpinDice5,
    Images.spinStar1000,
    Images.SpinDice2,
    Images.spinStar5000,
    Images.SpinDice1,
    Images.spinToken10,
    Images.spinRapple1,
    Images.SpinRapple1Black,

    // 필요한 이미지가 더 있다면 모두 추가...
  ];

  useEffect(() => {
    // 컴포넌트가 마운트되면 이미지 모두 로딩
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
  }, []);

  const handleStartClick = () => {
    playSfx(Audios.button_click);
    setShowSpin(true);
  };

  // 로딩 중이면 LoadingSpinner 보여주고, 끝나면 실제 화면
  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <div className="flex flex-col z-50 h-screen w-full items-center min-w-[320px] md:min-w-[600px]">
      {showSpin ? (
        <Spin onSpinEnd={onSpinEnd} />
      ) : (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="flex h-full w-full"
        >
          <SpinGameStart onStart={handleStartClick} />
        </motion.div>
      )}
    </div>
  );
};

export default SpinGame;
