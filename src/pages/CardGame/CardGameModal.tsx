import React, { useState } from "react";

const COLORS = ["RED", "BLACK"];
const SUITS = [
  { label: "Spade", value: "SPADE", color: "BLACK" },
  { label: "Diamond", value: "DIAMOND", color: "RED" },
  { label: "Heart", value: "HEART", color: "RED" },
  { label: "Club", value: "CLUB", color: "BLACK" },
];

const CardGameStart = ({ onStart, onCancel, myPoint }: any) => {
  const [bet, setBet] = useState("");
  return (
    <div style={{ padding: 32 }}>
      <h2>Draw Your Luck! Win or Lose</h2>
      <div>
        <span>My point: {myPoint}</span>
      </div>
      <input
        type="number"
        placeholder="How many star would you like to bet?"
        value={bet}
        onChange={e => setBet(e.target.value)}
      />
      <div>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => onStart(Number(bet))} disabled={!bet || Number(bet) <= 0}>
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
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, minWidth: 350, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16 }}>X</button>
        {!isGameStarted ? (
          <CardGameStart
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