import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Images from "@/shared/assets/images";
import ReactCardFlip from 'react-card-flip';
import { motion, AnimatePresence } from 'framer-motion';
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
  { suit: "DIAMOND", url: Images.CardDiamond},
  { suit: "SPADE", url: Images.CardSpade },
  { suit: "HEART", url: Images.CardHeart},
  { suit: "CLUB", url: Images.CardClover},
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
      <div className="text-[#FDE047] font-jalnan text-center text-4xl mt-4 whitespace-nowrap">
        Draw Your Luck!<br />Win or Lose
      </div>
      {/* 2. 카드 애니메이션 */}
      <div className="flex flex-col items-center justify-center mt-4 mb-6">
        <AnimatedCard />
        {/* 3. 설명/포인트 영역 */}
        <div className="flex flex-row gap-3 mt-4">
          <Popover>
            <PopoverTrigger className="flex flex-row gap-1 border-2 border-[#21212f] rounded-3xl text-center bg-white text-[#171717] font-medium w-[165px] h-[72px] items-center justify-center">
              <FaRegQuestionCircle className="w-6 h-6" />
              How to play
            </PopoverTrigger>
            <PopoverContent
              className="rounded-3xl border-2 border-[#21212f] bg-white"
              style={{
                maxHeight: "65vh",
                overflowY: "auto",
              }}
            >
              <div className="text-black p-4 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold text-center mb-4">
                  ✼ Game Instructions ✼
                </h2>
                <ol className="text-sm leading-loose space-y-4">
                  <li>
                    <strong>1. Place Your Bet</strong>
                    <ul className="list-disc pl-5">
                      <li>Feeling lucky? Enter your desired bet amount.</li>
                      <li>Maximum bet is limited to half of your total stars.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>2. Play Card Guessing ◦ Choose RED, BLACK, ♠, ♦, ♥, or ♣ before drawing.</strong>
                    <ul className="list-disc pl-5">
                      <li>Color guess has a 50% chance; suit guess has a 25% chance.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>3. Win Rewards</strong>
                    <ul className="list-disc pl-5">
                      <li>Correct color guess pays 2× your bet.</li>
                      <li>Correct suit guess pays 4× your bet.</li>
                      <li>Losing any round forfeits your bet.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex flex-col gap-1 border-2 border-[#21212f] rounded-3xl text-center bg-white text-[#171717] font-medium w-[165px] h-[72px] items-center justify-center">
            <span className="text-xs text-[#737373]">My point</span>
            <div className="flex flex-row items-center justify-center gap-3">
              <FaStar className="text-yellow-400 w-6 h-6" />
              <span>{myPoint.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {/* 4. 배팅 입력 */}
        <form className="w-full" onSubmit={handleBet}>
          <input
            placeholder="How many stars would you like to bet?"
            type="number"
            value={bet}
            onChange={e => setBet(e.target.value)}
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
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-[#21212F] text-white rounded-full font-medium h-14 w-[165px] ${!bet || parseInt(bet) <= 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={!bet || parseInt(bet) <= 0}
            >
              Bet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CardGameBoard = ({ betAmount, onResult, onCancel }: any) => {
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(null);
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
      console.log('📱 화면 높이 감지:', {
        screenHeight: height,
        calculatedDistance: distance,
        timestamp: new Date().toISOString()
      });
    };
    
    updateScreenHeight();
    window.addEventListener('resize', updateScreenHeight);
    
    return () => window.removeEventListener('resize', updateScreenHeight);
  }, []);
  
  const answer = React.useMemo(() => {
    const color = COLORS[Math.floor(Math.random() * 2)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { color, suit };
  }, []);
  
  const handleSelect = (type: any, value: any) => {
    if (isAnimating) return; // 애니메이션 중에는 추가 선택 방지
    
    console.log('🎯 사용자 선택:', {
      type,
      value,
      previousMode: mode,
      previousTopSelected: topSelected,
      previousBottomSelected: bottomSelected,
      timestamp: new Date().toISOString()
    });
    
    setIsAnimating(true);
    
    if (type === 'color') {
      setMode('color');
      setSelectedColor(value as "RED" | "BLACK");
      setSelectedSuit(null);
      setTopSelected(true);
      console.log('🔴 색상 선택 완료 - 상단 영역 활성화, 하단 영역 비활성화');
    } else if (type === 'suit') {
      setMode('suit');
      setSelectedSuit(value as string);
      setSelectedColor(null);
      setBottomSelected(true);
      console.log('♠️ 무늬 선택 완료 - 하단 영역 활성화, 상단 영역 비활성화');
    }
    
    // 애니메이션 완료 후 상태 리셋
    setTimeout(() => {
      setIsAnimating(false);
      console.log('⏰ 애니메이션 락 해제 - 새로운 선택 가능');
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
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl my-8">
        {/* 상단 2배율+RED/BLACK */}
        <AnimatePresence mode="wait">
          {!bottomSelected && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: bottomSelected ? 0 : 1, y: bottomSelected ? animationDistance : 0 }}
              exit={{ opacity: 0, y: animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
              onUpdate={(latest) => {
                console.log('🔄 상단 영역 애니메이션 진행 중:', {
                  currentY: latest.y,
                  currentOpacity: latest.opacity,
                  bottomSelected,
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
              onAnimationStart={() => {
                console.log('🚀 상단 영역 애니메이션 시작:', {
                  initialY: 0,
                  targetY: bottomSelected ? animationDistance : 0,
                  targetOpacity: bottomSelected ? 0 : 1,
                  action: bottomSelected ? '하단 선택으로 인한 사라짐' : '정상 표시',
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
              onAnimationComplete={() => {
                console.log('✅ 상단 영역 애니메이션 완료:', {
                  finalY: bottomSelected ? animationDistance : 0,
                  finalOpacity: bottomSelected ? 0 : 1,
                  totalDistance: Math.abs(bottomSelected ? animationDistance : 0),
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
            >
              {/* 배팅 금액, 2배율 */}
              <div className="flex flex-row items-center justify-center h-[54px] w-[264px] border-2 border-[#21212F] rounded-[18px] bg-white gap-3 mb-3 mx-auto">
                <div className="flex flex-row items-center gap-1">
                  <img src={Images.Star} alt="Star" className="w-9 h-9" />
                  <p className="text-2xl font-semibold text-black">{betAmount}</p>
                </div>
                <div className="bg-[#21212f] rounded-full flex items-center justify-center h-8 w-11 text-sm font-semibold text-white">
                  x2
                </div>
              </div>
              {/* Red 버튼 + Black 버튼 */}
              <div className="flex flex-row gap-5 mb-8">
                <button 
                  onClick={() => handleSelect('color', 'RED')} 
                  className={`flex flex-row gap-1 rounded-[7px] text-center font-bold text-xl w-[150px] h-[40px] items-center justify-center ${
                    selectedColor === 'RED' 
                      ? 'bg-[#DD2726] text-black red-inner-shadow' 
                      : selectedColor === 'BLACK'
                      ? 'bg-[#35383F] text-white'
                      : 'bg-[#DD2726] text-black red-inner-shadow'
                  }`}
                >
                  Red
                </button>
                <button 
                  onClick={() => handleSelect('color', 'BLACK')} 
                  className={`flex flex-row gap-1 rounded-[7px] text-center font-bold text-xl w-[150px] h-[40px] items-center justify-center ${
                    selectedColor === 'BLACK' 
                      ? 'bg-black text-[#DD2726] black-inner-shadow' 
                      : selectedColor === 'RED'
                      ? 'bg-[#35383F] text-white'
                      : 'bg-black text-[#DD2726] black-inner-shadow'
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
            y: topSelected ? animationDistance : bottomSelected ? -animationDistance : 0
          }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
          onUpdate={(latest) => {
            console.log('🔄 카드 애니메이션 진행 중:', {
              currentY: latest.y,
              topSelected,
              bottomSelected,
              animationDistance,
              screenHeight,
              timestamp: new Date().toISOString()
            });
          }}
          onAnimationStart={() => {
            console.log('🚀 카드 애니메이션 시작:', {
              initialY: 0,
              targetY: topSelected ? animationDistance : bottomSelected ? -animationDistance : 0,
              direction: topSelected ? '아래로' : bottomSelected ? '위로' : '제자리',
              animationDistance,
              screenHeight,
              timestamp: new Date().toISOString()
            });
          }}
          onAnimationComplete={() => {
            console.log('✅ 카드 애니메이션 완료:', {
              finalY: topSelected ? animationDistance : bottomSelected ? -animationDistance : 0,
              totalDistance: Math.abs(topSelected ? animationDistance : bottomSelected ? -animationDistance : 0),
              direction: topSelected ? '아래로 이동 완료' : bottomSelected ? '위로 이동 완료' : '제자리 유지',
              animationDistance,
              screenHeight,
              timestamp: new Date().toISOString()
            });
          }}
        >
          <img
            src={Images.CardBack}
            alt="card"
            className="mb-[10px] w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent object-cover cursor-pointer"
            onClick={() => {
              if (!cardRevealed && (mode === 'color' || mode === 'suit')) {
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
              animate={{ opacity: topSelected ? 0 : 1, y: topSelected ? -animationDistance : 0 }}
              exit={{ opacity: 0, y: -animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
              onUpdate={(latest) => {
                console.log('🔄 하단 영역 애니메이션 진행 중:', {
                  currentY: latest.y,
                  currentOpacity: latest.opacity,
                  topSelected,
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
              onAnimationStart={() => {
                console.log('🚀 하단 영역 애니메이션 시작:', {
                  initialY: 0,
                  targetY: topSelected ? -animationDistance : 0,
                  targetOpacity: topSelected ? 0 : 1,
                  action: topSelected ? '상단 선택으로 인한 사라짐' : '정상 표시',
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
              onAnimationComplete={() => {
                console.log('✅ 하단 영역 애니메이션 완료:', {
                  finalY: topSelected ? -animationDistance : 0,
                  finalOpacity: topSelected ? 0 : 1,
                  totalDistance: Math.abs(topSelected ? -animationDistance : 0),
                  animationDistance,
                  screenHeight,
                  timestamp: new Date().toISOString()
                });
              }}
            >
              {/* 배팅 금액, 4배율 */}
              <div className="flex flex-row items-center justify-center h-[54px] w-[264px] border-2 border-[#21212F] rounded-[18px] bg-white gap-3 mb-3 mx-auto">
                <div className="flex flex-row items-center gap-1">
                  <img src={Images.Star} alt="Star" className="w-9 h-9" />
                  <p className="text-2xl font-semibold text-black">{betAmount}</p>
                </div>
                <div className="bg-[#21212f] rounded-full flex items-center justify-center h-8 w-11 text-sm font-semibold text-white">
                  x4
                </div>
              </div>
              {/* 카드 선택 */}
              <div className="flex flex-row gap-[6px] justify-center items-center">
                {[
                  { key: 'SPADE', img: Images.CardSpade, alt: 'spade' },
                  { key: 'DIAMOND', img: Images.CardDiamond, alt: 'diamond' },
                  { key: 'HEART', img: Images.CardHeart, alt: 'heart' },
                  { key: 'CLUB', img: Images.CardClover, alt: 'clover' },
                ].map(card => {
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => { handleSelect('suit', card.key); }}
                      className={`focus:outline-none rounded-[7px] bg-transparent p-0 ${selectedSuit === card.key ? 'border-2 border-[#21212F] shadow-lg' : ''}`}
                      style={{ lineHeight: 0 }}
                    >
                      <ReactCardFlip isFlipped={!!selectedSuit && selectedSuit !== card.key} flipDirection="horizontal">
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

const CardGameResultDialog = ({ isOpen, win, reward, answer, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#2d2060] rounded-3xl p-8 max-w-md w-full mx-4 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">{win ? "성공!" : "실패!"}</h3>
        <div className="mb-4">
          <p className="text-lg">정답: {answer.color} / {answer.suit.label}</p>
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
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center h-screen w-full"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        background: '#2d2060',
      }}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${Images.CardGameBackground})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          minWidth: '320px',
          boxShadow: '0 0 40px rgba(0,0,0,0.2)',
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