import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

const COLORS = ["RED", "BLACK"];
const SUITS = [
  { label: "Spade", value: "SPADE", color: "BLACK" },
  { label: "Diamond", value: "DIAMOND", color: "RED" },
  { label: "Heart", value: "HEART", color: "RED" },
  { label: "Club", value: "CLUB", color: "BLACK" },
];

const CARD_IMAGES = [
  { suit: "DIAMOND", url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Playing_card_diamond_A.svg" },
  { suit: "SPADE", url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Playing_card_spade_A.svg" },
  { suit: "HEART", url: "https://upload.wikimedia.org/wikipedia/commons/5/50/Playing_card_heart_A.svg" },
  { suit: "CLUB", url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Playing_card_club_A.svg" },
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
      className="w-32 h-48 rounded-xl shadow-lg bg-white mx-auto"
    />
  );
};

const CardBettingModal = ({ myPoint, onStart, onCancel }: any) => {
  const [bet, setBet] = useState("");
  const [error, setError] = useState("");
  // 예시 카드 이미지 (A 다이아몬드)
  const cardImageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/57/Playing_card_diamond_A.svg";

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
    <div className="flex flex-col items-center w-full">
      <div className="text-2xl font-extrabold text-yellow-300 mb-6 text-center" style={{letterSpacing: 1}}>
        Draw Your Luck!<br />Win or Lose
      </div>
      <AnimatedCard />
      <div className="flex w-full justify-between mb-3">
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
        className="w-full rounded-xl px-4 py-3 mb-2 text-center text-lg outline-none border border-gray-300"
        placeholder="How many star would you like to bet?"
        value={bet}
        onChange={e => setBet(e.target.value)}
      />
      {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
      <div className="flex w-full gap-3 mt-2">
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
    <div style={{ padding: 32 }}>
      <div>
        <div>Bet: {betAmount} {mode === "COLOR" ? "x2" : mode === "SUIT" ? "x4" : ""}</div>
      </div>
      {/* 중앙 카드 애니메이션 */}
      <div className="flex justify-center my-6">
        <AnimatedCard />
      </div>
      <div style={{ margin: 16 }}>
        <div>
          <button
            style={{ background: mode === "COLOR" ? "#eee" : "#fff" }}
            onClick={() => setMode("COLOR")}
            disabled={mode === "SUIT"}
          >
            색상 맞추기 (x2)
          </button>
          <button
            style={{ background: mode === "SUIT" ? "#eee" : "#fff" }}
            onClick={() => setMode("SUIT")}
            disabled={mode === "COLOR"}
          >
            색상+무늬 맞추기 (x4)
          </button>
        </div>
        {mode === "COLOR" && (
          <div>
            {COLORS.map(color => (
              <button
                key={color}
                style={{
                  margin: 8,
                  background: selected === color ? "#f00" : "#fff",
                  color: color === "RED" ? "red" : "black",
                }}
                onClick={() => setSelected(color)}
              >
                {color}
              </button>
            ))}
          </div>
        )}
        {mode === "SUIT" && (
          <div>
            {SUITS.map(suit => (
              <button
                key={suit.value}
                style={{
                  margin: 8,
                  background: selected === suit.value ? "#ddd" : "#fff",
                  color: suit.color === "RED" ? "red" : "black",
                }}
                onClick={() => setSelected(suit.value)}
              >
                {suit.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSubmit} disabled={!selected || !mode}>
          뒤집기!
        </button>
      </div>
      <div style={{ marginTop: 32 }}>
        <div>카드 뒷면 (이미지 자리)</div>
      </div>
    </div>
  );
};

const CardGameResultDialog = ({ isOpen, win, reward, answer, onRetry, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ padding: 32, background: "#eee" }}>
      <h3>{win ? "성공!" : "실패!"}</h3>
      <div>정답: {answer.color} / {answer.suit.label}</div>
      <div>획득 금액: {reward}</div>
      <button onClick={onRetry}>다시하기</button>
      <button onClick={onClose}>종료</button>
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
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "#2d2060", borderRadius: 16, padding: 24, minWidth: 350, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, color: '#fff', fontWeight: 700 }}>X</button>
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