import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Images from "@/shared/assets/images";
import ReactCardFlip from "react-card-flip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui";

const COLORS: ("RED" | "BLACK")[] = ["RED", "BLACK"];
const SUITS = [
  { label: "Spade", value: "SPADE", color: "BLACK" },
  { label: "Diamond", value: "DIAMOND", color: "RED" },
  { label: "Heart", value: "HEART", color: "RED" },
  { label: "Club", value: "CLUB", color: "BLACK" },
];

const CARD_IMAGES = [
  { suit: "DIAMOND", url: Images.CardDiamond },
  { suit: "SPADE", url: Images.CardSpade },
  { suit: "HEART", url: Images.CardHeart },
  { suit: "CLUB", url: Images.CardClover },
];

const AnimatedCard = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CARD_IMAGES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <img
      src={CARD_IMAGES[index].url}
      alt={CARD_IMAGES[index].suit}
      className="w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent mb-6 object-cover"
    />
  );
};

const CardBettingModal = ({ myPoint, onStart, onCancel }: any) => {
  const [bet, setBet] = useState("");
  const [error, setError] = useState("");

  const handleBet = () => {
    const amount = Number(bet);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amount > myPoint) {
      setError("Not enough points.");
      return;
    }
    setError("");
    onStart(amount);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-12">
      {/* 1. 상단 타이틀 */}
      <div
        className="text-center mt-4"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        당신의 선택이
        <br />
        승부를 가릅니다!
      </div>
      {/* 2. 카드 애니메이션 */}
      <div className="flex flex-col items-center justify-center mt-4 mb-6">
        <AnimatedCard />
      </div>
      {/* 3. 설명/포인트 영역 - 중앙으로 이동 */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex flex-row gap-3">
          <Popover>
            <PopoverTrigger
              className="flex flex-row gap-1 rounded-[56px] text-center w-[165px] h-[72px] items-center justify-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              }}
            >
              <img src={Images.QuestionCircle} className="w-[30px] h-[30px]" />
              게임 방법
            </PopoverTrigger>
            <PopoverContent
              className="rounded-[24px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]"
              style={{
                maxHeight: "65vh",
                overflowY: "auto",
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="p-4 rounded-lg shadow-lg w-full max-w-lg">
                <h2
                  className="text-start mb-4"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  ✼ 게임 방법 ✼
                </h2>
                <ol
                  className=" leading-loose space-y-4"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  <li>
                    <p>1. 베팅하기</p>
                    <ul className="list-disc pl-5">
                      <li>
                        오늘의 행운을 믿어보세요! 원하는 스타 수를 입력하세요.
                      </li>
                      <li>최대 베팅은 보유 스타의 절반까지만 가능합니다.</li>
                    </ul>
                  </li>
                  <li>
                    <p>2. 카드 색상 / 문양 맞추기</p>
                    <ul className="list-disc pl-5">
                      <li>카드를 뽑기 전에 다음 중 하나를 선택하세요:</li>
                      <li>색상: 🔴레드 / ⚫블랙(확률 50%)</li>
                      <li>
                        문양: ♠스페이드 / ♦다이아 / ♥하트 / ♣클로버 (확률 25%)
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>3. 보상 받기</p>
                    <ul className="list-disc pl-5">
                      <li>색상을 맞추면 베팅 금액의 2배를 획득합니다.</li>
                      <li>문양을 맞추면 베팅 금액의 4배를 획득합니다.</li>
                      <li>틀릴 경우 베팅한 스타는 소멸됩니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </PopoverContent>
          </Popover>
          <div
            className="flex flex-col gap-1 rounded-[56px] text-center w-[165px] h-[72px] items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
          >
            <span
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              내 포인트
            </span>
            <div className="flex flex-row items-center justify-center gap-3">
              <img
                src={Images.StarIcon}
                alt="Star"
                className="w-[30px] h-[30px]"
              />
              <span
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {myPoint.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {/* 4. 배팅 입력 */}
        <form className="w-full" onSubmit={handleBet}>
          <input
            placeholder="베팅할 별 개수를 선택하세요!"
            type="number"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
            max={myPoint}
            className="border-2 border-[#21212f] rounded-2xl h-12 text-sm font-medium px-4 mt-4 w-[342px] text-center text-black"
          />
          {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
          {/* 5. 버튼 영역 */}
          <div className="flex flex-row mt-4 gap-3">
            <button
              className="flex items-center justify-center bg-gray-200 text-[#171717] rounded-full font-medium h-14 w-[165px]"
              type="button"
              onClick={onCancel}
            >
              취소
            </button>
            <button
              type="submit"
              className={`bg-[#21212F] text-white rounded-full font-medium h-14 w-[165px] ${
                !bet || parseInt(bet) <= 0
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              disabled={!bet || parseInt(bet) <= 0}
            >
              베팅
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CardGameBoard = ({ betAmount, onResult, onCancel }: any) => {
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(
    null
  );
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [topSelected, setTopSelected] = useState(false);
  const [bottomSelected, setBottomSelected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [animationDistance, setAnimationDistance] = useState(40);

  // 화면 높이 측정 및 애니메이션 거리 계산
  useEffect(() => {
    const updateScreenHeight = () => {
      const height = window.innerHeight;
      setScreenHeight(height);

      // 화면 높이에 따른 애니메이션 거리 계산
      // 작은 화면에서는 더 작은 거리, 큰 화면에서는 더 큰 거리
      let distance = 40; // 기본값

      if (height < 600) {
        distance = 20; // 매우 작은 화면
      } else if (height < 700) {
        distance = 30; // 작은 화면
      } else if (height > 900) {
        distance = 60; // 큰 화면
      }

      setAnimationDistance(distance);
    };

    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  const answer = React.useMemo(() => {
    const color = COLORS[Math.floor(Math.random() * 2)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { color, suit };
  }, []);

  const handleSelect = (type: any, value: any) => {
    if (isAnimating) return; // 애니메이션 중에는 추가 선택 방지

    setIsAnimating(true);

    if (type === "color") {
      setMode("color");
      setSelectedColor(value as "RED" | "BLACK");
      setSelectedSuit(null);
      setTopSelected(true);
    } else if (type === "suit") {
      setMode("suit");
      setSelectedSuit(value as string);
      setSelectedColor(null);
      setBottomSelected(true);
    }

    // 애니메이션 완료 후 상태 리셋
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  const handleSubmit = () => {
    let win = false;
    let reward = 0;
    if (mode === "color") {
      win = selectedColor === answer.color;
      reward = win ? betAmount * 2 : 0;
    } else if (mode === "suit") {
      win = selectedSuit === answer.suit.value;
      reward = win ? betAmount * 4 : 0;
    }
    onResult(win, reward, answer);
  };

  // 게임 플레이 화면
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl my-8">
        {/* 상단 2배율+RED/BLACK */}
        <AnimatePresence mode="wait">
          {!bottomSelected && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: bottomSelected ? 0 : 1,
                y: bottomSelected ? animationDistance : 0,
              }}
              exit={{ opacity: 0, y: animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* 배팅 금액, 2배율 */}
              <div
                className="flex flex-row items-center justify-center h-[54px] w-[264px] rounded-[58px] gap-3 mb-3 mx-auto"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                }}
              >
                <div className="flex flex-row items-center gap-1">
                  <img src={Images.StarIcon} alt="Star" className="w-9 h-9" />
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-8 w-11 "
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  x2
                </div>
              </div>
              {/* Red 버튼 + Black 버튼 */}
              <div className="flex flex-row gap-5 mb-8">
                <button
                  onClick={() => handleSelect("color", "RED")}
                  className={`flex flex-row gap-1 rounded-[7px] text-center font-bold text-xl w-[150px] h-[40px] items-center justify-center ${
                    selectedColor === "RED"
                      ? "bg-[#DD2726] text-black red-inner-shadow"
                      : selectedColor === "BLACK"
                      ? "bg-[#35383F] text-white"
                      : "bg-[#DD2726] text-black red-inner-shadow"
                  }`}
                >
                  Red
                </button>
                <button
                  onClick={() => handleSelect("color", "BLACK")}
                  className={`flex flex-row gap-1 rounded-[7px] text-center font-bold text-xl w-[150px] h-[40px] items-center justify-center ${
                    selectedColor === "BLACK"
                      ? "bg-black text-[#DD2726] black-inner-shadow"
                      : selectedColor === "RED"
                      ? "bg-[#35383F] text-white"
                      : "bg-black text-[#DD2726] black-inner-shadow"
                  }`}
                >
                  Black
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* 중앙 카드 */}
        <motion.div
          animate={{
            y: topSelected
              ? animationDistance
              : bottomSelected
              ? -animationDistance
              : 0,
          }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <img
            src={Images.CardBack}
            alt="card"
            className="mb-[10px] w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent object-cover cursor-pointer"
            onClick={() => {
              if (!cardRevealed && (mode === "color" || mode === "suit")) {
                // TODO: API 호출로 카드 오픈 (추후 개발)
                setCardRevealed(true);
              }
            }}
          />
          <img
            src={Images.CardGame}
            alt="card-game"
            className="w-[155px] bg-transparent object-cover"
          />
        </motion.div>
        {/* 하단 4배율+카드들 */}
        <AnimatePresence mode="wait">
          {!topSelected && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: topSelected ? 0 : 1,
                y: topSelected ? -animationDistance : 0,
              }}
              exit={{ opacity: 0, y: -animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* 배팅 금액, 4배율 */}
              <div
                className="flex flex-row items-center justify-center h-[54px] w-[264px] gap-3 mb-3 mx-auto rounded-[58px]"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                }}
              >
                <div className="flex flex-row items-center gap-1">
                  <img
                    src={Images.StarIcon}
                    alt="Star"
                    className="w-[30px] h-[30px]"
                  />
                  <p
                    className="text-ccenter"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-8 w-11"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  x4
                </div>
              </div>
              {/* 카드 선택 */}
              <div className="flex flex-row gap-[6px] justify-center items-center">
                {[
                  { key: "SPADE", img: Images.CardSpade, alt: "spade" },
                  { key: "DIAMOND", img: Images.CardDiamond, alt: "diamond" },
                  { key: "HEART", img: Images.CardHeart, alt: "heart" },
                  { key: "CLUB", img: Images.CardClover, alt: "clover" },
                ].map((card) => {
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        handleSelect("suit", card.key);
                      }}
                      className={`focus:outline-none rounded-[7px] bg-transparent p-0 ${
                        selectedSuit === card.key
                          ? "border-2 border-[#21212F] shadow-lg"
                          : ""
                      }`}
                      style={{ lineHeight: 0 }}
                    >
                      <ReactCardFlip
                        isFlipped={!!selectedSuit && selectedSuit !== card.key}
                        flipDirection="horizontal"
                      >
                        <img
                          src={card.img}
                          alt={card.alt}
                          className="w-[80px] h-[110px] bg-transparent object-cover"
                          key="front"
                        />
                        <img
                          src={Images.CardBack}
                          alt="card-back"
                          className="w-[80px] h-[110px] bg-transparent object-cover"
                          key="back"
                        />
                      </ReactCardFlip>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CardGameResultDialog = ({
  isOpen,
  win,
  reward,
  answer,
  onClose,
}: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#2d2060] rounded-3xl p-8 max-w-md w-full mx-4 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">{win ? "성공!" : "실패!"}</h3>
        <div className="mb-4">
          <p className="text-lg">
            정답: {answer.color} / {answer.suit.label}
          </p>
          <p className="text-xl font-bold text-yellow-400 mt-2">
            획득 금액: {reward.toLocaleString()}
          </p>
        </div>
        <button
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold"
          onClick={onClose}
        >
          종료
        </button>
      </div>
    </div>
  );
};

const CardGameModal = ({ onClose }: any) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [betAmount, setBetAmount] = useState(500);
  const [myPoint, setMyPoint] = useState(12345);
  const [result, setResult] = useState({ win: false, reward: 0, answer: null });
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(
    null
  );
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center h-screen w-full"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#2d2060",
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${Images.BackgroundCard})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          minWidth: "320px",
          boxShadow: "0 0 40px rgba(0,0,0,0.2)",
        }}
        className="shadow-2xl overflow-hidden"
      >
        {!isGameStarted ? (
          <CardBettingModal
            myPoint={myPoint}
            onStart={(amount: React.SetStateAction<number>) => {
              setBetAmount(amount);
              setIsGameStarted(true);
            }}
            onCancel={onClose}
          />
        ) : (
          <CardGameBoard
            betAmount={betAmount}
            onResult={(win: boolean, reward: number, answer: any) => {
              setResult({ win, reward, answer });
              setIsResultOpen(true);
              if (win) setMyPoint((p: number) => p + reward);
              else setMyPoint((p: number) => p - betAmount);
            }}
            onCancel={onClose}
          />
        )}
        <CardGameResultDialog
          isOpen={isResultOpen}
          win={result.win}
          reward={result.reward}
          answer={result.answer || { color: "", suit: { label: "" } }}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CardGameModal;
