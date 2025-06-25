import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Images from "@/shared/assets/images";

const COLORS = ["RED", "BLACK"];
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
      className="w-32 h-48 rounded-xl shadow-lg bg-white mx-auto object-cover"
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
      <div className="text-2xl font-extrabold text-yellow-300 mb-6 text-center" style={{letterSpacing: 1}}>
        Draw Your Luck!<br />Win or Lose
      </div>
      <AnimatedCard />
      <div className="flex w-full justify-between mb-3 max-w-md">
        <button className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 font-semibold text-black text-sm shadow">
          <FaRegQuestionCircle className="text-lg" />
          How to play
        </button>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 font-semibold text-black text-sm shadow">
          <FaStar className="text-yellow-400" />
          <span>My point</span>
          <span className="font-bold text-base text-[#eab308]">{myPoint.toLocaleString()}</span>
        </div>
      </div>
      <input
        type="number"
        className="w-full max-w-md rounded-xl px-4 py-3 mb-2 text-center text-lg outline-none border border-gray-300 text-black"
        placeholder="How many star would you like to bet?"
        value={bet}
        onChange={e => setBet(e.target.value)}
      />
      {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
      <div className="flex w-full max-w-md gap-3 mt-2">
        <button
          className="flex-1 py-3 rounded-xl bg-gray-200 text-black font-bold"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-3 rounded-xl bg-black text-white font-bold"
          onClick={handleBet}
        >
          Bet
        </button>
      </div>
    </div>
  );
};

const CardGameBoard = ({ betAmount, onResult, onCancel }: any) => {
  const [mode, setMode] = useState<"COLOR" | "SUIT" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const answer = React.useMemo(() => {
    const color = COLORS[Math.floor(Math.random() * 2)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { color, suit };
  }, []);
  const handleSelect = (type: any, value: any) => {
    setMode(type);
    setSelected(value);
  };
  const handleSubmit = () => {
    let win = false;
    let reward = 0;
    if (mode === "COLOR") {
      win = selected === answer.color;
      reward = win ? betAmount * 2 : 0;
    } else if (mode === "SUIT") {
      win = selected === answer.suit.value;
      reward = win ? betAmount * 4 : 0;
    }
    onResult(win, reward, answer);
  };
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-12">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl">
        <div className="text-xl font-bold text-white mb-4">
          Bet: {betAmount} {mode === "COLOR" ? "x2" : mode === "SUIT" ? "x4" : ""}
        </div>
        
        {/* 중앙 카드 애니메이션 */}
        <div className="flex justify-center my-6">
          <AnimatedCard />
        </div>
        
        <div className="w-full max-w-md">
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-xl font-semibold ${
                mode === "COLOR" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-black"
              }`}
              onClick={() => setMode("COLOR")}
              disabled={mode === "SUIT"}
            >
              색상 맞추기 (x2)
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-xl font-semibold ${
                mode === "SUIT" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-black"
              }`}
              onClick={() => setMode("SUIT")}
              disabled={mode === "COLOR"}
            >
              색상+무늬 맞추기 (x4)
            </button>
          </div>
          
          {mode === "COLOR" && (
            <div className="flex gap-2 mb-4">
              {COLORS.map(color => (
                <button
                  key={color}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold ${
                    selected === color 
                      ? "bg-red-500 text-white" 
                      : "bg-white text-black"
                  }`}
                  onClick={() => setSelected(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
          
          {mode === "SUIT" && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SUITS.map(suit => (
                <button
                  key={suit.value}
                  className={`py-3 px-4 rounded-xl font-semibold ${
                    selected === suit.value 
                      ? "bg-blue-500 text-white" 
                      : "bg-white text-black"
                  }`}
                  onClick={() => setSelected(suit.value)}
                >
                  {suit.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 w-full max-w-md">
          <button 
            className="flex-1 py-3 rounded-xl bg-gray-200 text-black font-bold"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold"
            onClick={handleSubmit} 
            disabled={!selected || !mode}
          >
            뒤집기!
          </button>
        </div>
      </div>
    </div>
  );
};

const CardGameResultDialog = ({ isOpen, win, reward, answer, onRetry, onClose }: any) => {
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
        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 rounded-xl bg-gray-200 text-black font-bold"
            onClick={onRetry}
          >
            다시하기
          </button>
          <button 
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold"
            onClick={onClose}
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
};

const CardGameModal = ({ onClose }: any) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [myPoint, setMyPoint] = useState(12345);
  const [result, setResult] = useState({ win: false, reward: 0, answer: null });
  const [isResultOpen, setIsResultOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center h-screen w-full"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundImage: `url(${Images.CardGameBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="w-full h-full bg-[#2d2060] flex flex-col items-center relative shadow-2xl overflow-hidden"
        style={{ minWidth: '320px' }}
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
          onRetry={() => {
            setIsResultOpen(false);
            setIsGameStarted(false);
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CardGameModal; 