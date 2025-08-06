// src/pages/RPSGame/ui/RPSGameStart.tsx

import React, { useState } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui";
import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useRPSGameStore } from "../store";
import { useTranslation } from "react-i18next";

interface RPSGameStartProps {
  onStart: () => void;
  allowedBetting: number;
  onCancel: () => void;
}

const RPSGameStart: React.FC<RPSGameStartProps> = ({
  onStart,
  allowedBetting,
  onCancel,
}) => {
  const [betAmount, setBetAmount] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const setBetAmountStore = useRPSGameStore((state) => state.setBetAmount);
  const { t } = useTranslation();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = parseInt(value);
    if (
      value === "" ||
      (/^\d+$/.test(value) && numericValue <= allowedBetting + 1)
    ) {
      setBetAmount(value);
      // console.log(`betAmount set to: ${value}`);
    }
  };

  const handleStartClick = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // 기본 폼 제출을 막습니다.
    const amount = parseInt(betAmount);
    // console.log(`handleStartClick called with amount: ${amount}`);
    if (amount > 0 && amount <= allowedBetting + 1) {
      // console.log("Starting game with betAmount:", amount);
      setBetAmountStore(amount); // betAmount를 설정
      onStart(); // 게임 시작
    } else {
      alert(
        `The betting amount must be at least 1 star and up to a maximum of ${
          allowedBetting + 1
        } stars.`
      );
    }
  };

  const handleCancelClick = () => {
    onCancel(); // 취소 시 호출하여 주사위 게임으로 돌아감
    // console.log("Game canceled by user");
  };

  return (
    <>
      {/* 배경 블러 오버레이 */}
      {isPopoverOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
      )}

      <div className="h-screen md:min-w-[600px] flex flex-col items-center justify-center px-12">
        <h1
          className="text-center mt-4 whitespace-nowrap"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "30px",
            fontWeight: 400,
            color: "#FDE047",
            WebkitTextStroke: "1px #000000",
          }}
        >
          삼세판의 승부!
          <br />
          당신의 기회를 돌려보세요!
        </h1>

        <div className="flex flex-col items-center justify-center mt-4">
          <img src={Images.RPSExample} alt="RPSExample" className="w-[240px]" />

          <div className="flex flex-row gap-3 mt-4">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger
                className="flex flex-row gap-1 rounded-3xl text-center font-medium w-[165px] h-[72px] items-center justify-center"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 0px 0px #4A95FF, inset 0px 2px 0px 0px #000000",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <img src={Images.InfoBtn} alt="InfoBtn" className="w-6 h-6" />
                <p>게임 방법</p>
              </PopoverTrigger>
              <PopoverContent
                className="rounded-3xl border-none"
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "300px",
                  height: "335px",
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "inset 0px 4px 2px 0px #FFFFFF, 0px 2px 0px 0px #000000",
                  zIndex: 9999,
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="p-4 w-full h-full"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    WebkitTextStroke: "1px #000000",
                    color: "#FFFFFF",
                  }}
                >
                  <h2 className="text-left mb-4" style={{ color: "#FDE047" }}>
                    ✼ 게임 방법 ✼
                  </h2>
                  <ol
                    className="leading-loose space-y-4"
                    style={{ color: "#FFFFFF" }}
                  >
                    <li>
                      <strong>1. 베팅하기</strong>
                      <ul className="list-disc pl-5">
                        <li>
                          행운을 시험해보세요! 최대 27배 보상까지!
                          <br />
                          원하는 스타 수를 입력해주세요.
                          <br />
                          베팅은 보유 스타의 절반까지 가능합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>2. 가위바위보 진행</strong>
                      <ul className="list-disc pl-5">
                        <li>
                          각 라운드마다 가위, 바위, 보 중 하나를 선택하세요.{" "}
                          <br /> 최대 3라운드까지 진행됩니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>3. 보상 받기기</strong>
                      <ul className="list-disc pl-5">
                        <li>
                          한 번이라도 승리하면 보상은 3배! <br /> 3연승 시 최대
                          27배까지 보상이 누적됩니다.
                          <br />
                          (예: 1라운드 승리 시 3배 → 2라운드 승리 시 9배 →
                          3라운드 승리 시 27배)
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>4. 계속 도전 or 보상 수령 결정정</strong>
                      <ul className="list-disc pl-5">
                        <li>
                          매 라운드 승리 후, 도전을 계속할지 보상을 받을지
                          선택하세요.
                          <br />
                          단, 한 번이라도 패배하면 모든 베팅이 사라집니다
                        </li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </PopoverContent>
            </Popover>
            <div
              className="flex flex-col gap-1 rounded-3xl text-center font-medium w-[165px] h-[72px] items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 0px 0px #000000, inset 0px 2px 0px 0px #4A95FF",
              }}
            >
              <p
                className="text-xs"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                내 포인트
              </p>
              <div className="flex flex-row items-center justify-center gap-1">
                <img
                  src={Images.StarIcon}
                  alt="Star"
                  className="w-[24px] h-[24px]"
                />
                <p
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  {formatNumber(allowedBetting)}
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleStartClick}>
            <input
              placeholder="베팅할 별 개수를 선택하세요!"
              type="number"
              value={betAmount}
              onChange={handleInputChange}
              max={formatNumber(allowedBetting)}
              className="mt-4 w-[342px] h-[48px] rounded-[44px] px-4 border-none outline-none"
              style={{
                background: "linear-gradient(180deg, #0088FF 0%, #0066CC 100%)",
                boxShadow: "inset 0px 4px 3px 0px #FFFFFF",
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            />

            <div className="flex flex-row mt-4 gap-[22px]">
              <button
                className="flex items-center justify-center rounded-[10px] font-medium h-14 w-[160px]"
                type="button"
                onClick={handleCancelClick}
                style={{
                  background:
                    "linear-gradient(180deg, #FF2F32 0%, #FF6D70 100%)",
                  border: "2px solid #FFA1A2",
                  boxShadow:
                    "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center justify-center rounded-[10px] font-medium h-14 w-[160px]"
                style={{
                  background:
                    betAmount && parseInt(betAmount) > 0
                      ? "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)"
                      : "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
                  border: "2px solid #76C1FF",
                  boxShadow:
                    "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
                  opacity: betAmount && parseInt(betAmount) > 0 ? 1 : 0.7,
                  cursor:
                    betAmount && parseInt(betAmount) > 0
                      ? "pointer"
                      : "not-allowed",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
                disabled={
                  !betAmount ||
                  parseInt(betAmount) <= 0 ||
                  parseInt(betAmount) > allowedBetting + 1
                }
              >
                베팅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RPSGameStart;
