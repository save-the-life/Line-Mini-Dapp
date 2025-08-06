// src/pages/RPSGame/ui/RPSResultDialog.tsx

import React, { useEffect } from "react";
import { AlertDialog, AlertDialogContent } from "@/shared/components/ui";
import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface ResultWinProps {
  winnings: number;
  onContinue: () => void;
  onQuit: () => void;
  consecutiveWins: number;
  winMultiplier: number;
}

interface ResultLoseProps {
  winnings: number;
  onQuit: () => void;
}

const ResultWin: React.FC<ResultWinProps> = ({
  winnings,
  onContinue,
  onQuit,
  consecutiveWins,
  winMultiplier,
}) => {
  const isFinalWin = consecutiveWins >= 3;
  const { t } = useTranslation();
  const { playSfx } = useSound();

  // 승리 효과음 재생
  useEffect(() => {
    playSfx(Audios.rps_win);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 파란색 배경 영역 */}
      <div
        className="absolute inset-0 rounded-[10px] w-[234px] h-[228px]"
        style={{
          background: "linear-gradient(180deg, #0088FF 0%, #0066CC 100%)",
          opacity: 0.9,
          zIndex: 1,
        }}
      />
      {/* 컨텐츠 영역 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2">
        <div
          className="flex rounded-3xl w-[264px] h-[86px] flex-row items-center justify-center gap-1"
          style={{
            background: "linear-gradient(180deg, #0088FF 75%, transparent 25%)",
            border: "2px solid #76C1FF",
            boxShadow: "0px 2px 0px 0px #000000, inset 0px 2px 0px 0px #FFFFFF",
          }}
        >
          <p
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            +{formatNumber(winnings)}
          </p>
          <img src={Images.StarIcon} className="w-9 h-9" />
        </div>
        {isFinalWin ? (
          <div className="font-jalnan text-[24px] text-center">
            축하합니다!
            <br />
            베팅 금액의 27배를 획득하셨습니다!
          </div>
        ) : (
          <div className="font-jalnan text-[30px] text-center">
            <div className="flex flex-col justify-center items-center">
              {t("dice_event.rps_game.continue_with")} <br />
              <div className="flex flex-row items-center justify-center">
                <div className="flex flex-row items-center justify-center font-semibold text-base w-12 h-8 bg-[#21212F] rounded-full">
                  <p>x{winMultiplier}</p>
                </div>
                ?
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-2">
          {isFinalWin ? (
            <button
              className="flex items-center justify-center rounded-[10px] font-medium h-14 w-32"
              onClick={onQuit}
              style={{
                background: "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
                border: "2px solid #76C1FF",
                boxShadow:
                  "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              완료
            </button>
          ) : (
            <>
              <button
                className="flex items-center justify-center rounded-[10px] font-medium h-14 w-32"
                onClick={onQuit}
                style={{
                  background:
                    "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
                  border: "2px solid #76C1FF",
                  boxShadow:
                    "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                받기
              </button>
              <button
                className="flex items-center justify-center rounded-[10px] font-medium h-14 w-32"
                onClick={onContinue}
                style={{
                  background:
                    "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
                  border: "2px solid #76C1FF",
                  boxShadow:
                    "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                도전하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultLose: React.FC<ResultLoseProps> = ({ winnings, onQuit }) => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  // 패배 효과음 재생
  useEffect(() => {
    playSfx(Audios.rps_lose);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 파란색 배경 영역 */}
      <div
        className="absolute inset-0 rounded-[10px] w-[234px] h-[228px]"
        style={{
          background: "linear-gradient(180deg, #0088FF 0%, #0066CC 100%)",
          opacity: 0.9,
          zIndex: 1,
        }}
      />
      {/* 컨텐츠 영역 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4">
        <div
          className="flex rounded-3xl w-[264px] h-[86px] flex-row items-center justify-center gap-1"
          style={{
            background: "linear-gradient(180deg, #0088FF 75%, transparent 25%)",
            border: "2px solid #76C1FF",
            boxShadow: "0px 2px 0px 0px #000000, inset 0px 2px 0px 0px #FFFFFF",
          }}
        >
          <p
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            {formatNumber(winnings)}
          </p>
          <img src={Images.StarIcon} className="w-9 h-9" />
        </div>
        <div className="text-center">
          <p
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            아쉬웠어요! <br />
            다음엔 행운이 함께하길!
          </p>
        </div>

        <button
          className="flex items-center justify-center rounded-3xl font-medium"
          onClick={onQuit}
          style={{
            width: "300px",
            height: "56px",
            background: "linear-gradient(180deg, #FF2F32 0%, #FF6D70 100%)",
            border: "2px solid #FFA1A2",
            boxShadow: "0px 4px 0px 0px #000000, inset 0px 3px 0px 0px #000000",
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          나가기
        </button>
      </div>
    </div>
  );
};

interface RPSResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: "win" | "lose" | null;
  winnings: number;
  onContinue: () => void;
  onQuit: () => void;
  consecutiveWins: number;
  winMultiplier: number;
}

const RPSResultDialog: React.FC<RPSResultDialogProps> = ({
  isOpen,
  onClose,
  result,
  winnings,
  onContinue,
  onQuit,
  consecutiveWins,
  winMultiplier,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="rounded-3xl text-white border-none w-[373px] h-[490px] object-cover"
        style={{
          background:
            result === "win"
              ? `url(${Images.RPSWin})`
              : result === "lose"
              ? `url(${Images.RPSDefeat})`
              : "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0px 2px 0px 0px #000000, inset 0px 4px 2px 0px #FFFFFF",
        }}
      >
        {result === "win" ? (
          <ResultWin
            winnings={winnings}
            onContinue={onContinue}
            onQuit={onQuit}
            consecutiveWins={consecutiveWins}
            winMultiplier={winMultiplier * 3}
          />
        ) : result === "lose" ? (
          <ResultLose winnings={winnings} onQuit={onQuit} />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RPSResultDialog;
