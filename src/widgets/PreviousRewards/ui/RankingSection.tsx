import React from "react";
import Images from "@/shared/assets/images";
import { IoCaretDown } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";
import { useTranslation } from "react-i18next";

interface RankingSectionProps {
  myData: PlayerData | null;
  topRankings: PlayerData[];
  isReceived: boolean;
  onGetReward: () => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogRankings: PlayerData[];
  isLoadingRange: boolean;
  rangeError: string | null;
  handleRangeClick: (start: number, end: number) => void;
}

const RankingSection: React.FC<RankingSectionProps> = ({
  myData = null,
  topRankings = [],
  isReceived,
  onGetReward,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogRankings,
  isLoadingRange,
  rangeError,
  handleRangeClick,
}) => {
  const { t } = useTranslation();
  const showMyInDialog =
    myData !== null && dialogRankings.some((r) => r.rank === myData.rank);

  return (
    <div className="p-6 bg-[#0D1226] text-white w-full">
      {/* 상단 myData & topRankings 렌더링 */}
      {myData ? (
        myData.rank > 1000 ? (
          <div className="relative flex flex-col box-bg rounded-3xl border-2 border-[#0147E5] p-5 h-24 justify-center items-center">
            <p className="font-semibold text-sm text-center">
              {t("reward_page.your_rank")}
              <span className="text-[#FDE047] font-bold">{myData.rank}</span>
              <br />
              {t("reward_page.keep_play")}
            </p>
          </div>
        ) : (
          <>
            <p className="font-semibold">{t("reward_page.congrate")}</p>
            <div className="relative flex flex-row items-center box-bg rounded-3xl h-24 border-2 border-[#0147E5] mt-3 p-5 gap-3">
              <p className="text-center w-1/6">{myData.rank}</p>
              <div className="flex flex-col justify-center items-center gap-1 flex-1">
                <p className="text-center">{myData.name}</p>
                <div className="flex flex-row gap-1">
                  <img
                    src={
                      myData.selectedRewardType === "USDT"
                        ? Images.USDT
                        : Images.TokenReward
                    }
                    alt="token"
                    className="w-5 h-5"
                  />
                  <p className="text-sm font-semibold">
                    {(myData.slRewards ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      ) : (
        <div className="relative flex flex-col box-bg rounded-3xl border-2 border-[#0147E5] p-5 h-full justify-center items-center">
          <p className="font-semibold text-sm text-center">
            {t("reward_page.you_didnt")}
            <br />
            {t("reward_page.keep_play")}
          </p>
        </div>
      )}

      {/* Top Rankings */}
      <div className="flex flex-col mt-8">
        <p className="font-semibold">{t("reward_page.ranking_reward")}</p>
        {topRankings.length > 0 ? (
          topRankings.slice(0, 20).map((r) => {
            // 1~3위 패스 추가 텍스트
            const passText =
              r.rank === 1
                ? "+ GOLD PASS"
                : r.rank === 2
                ? "+ SILVER PASS"
                : r.rank === 3
                ? "+ BRONZE PASS"
                : "";
            return (
              <div
                key={r.rank}
                className="relative flex flex-row items-center p-4 border-b gap-4"
              >
                <p className="w-1/6 text-center">{r.rank}</p>
                <div className="flex flex-col flex-1">
                  <p>{r.name}</p>
                  <div className="flex flex-row items-center gap-1">
                    {r.selectedRewardType === "USDT" ? (
                      <>
                        <img
                          src={Images.USDT}
                          alt="token"
                          className="w-5 h-5"
                        />
                        <p className="text-sm font-semibold">
                          {(r.usdtRewards ?? 0).toLocaleString()}{" "}
                          <span className="font-normal text-[#a3a3a3]">
                            (or {(r.slRewards ?? 0).toLocaleString()} SL)
                          </span>
                          {passText}
                        </p>
                      </>
                    ) : (
                      <>
                        <img
                          src={Images.TokenReward}
                          alt="token"
                          className="w-5 h-5"
                        />
                        <p className="text-sm font-semibold">
                          {(r.slRewards ?? 0).toLocaleString()} {passText}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm mt-7">
            {t("reward_page.no_ranking")}
          </p>
        )}
      </div>

      {/* Range Dialogs */}
      <div className="mt-7 space-y-4">
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
          {/* Dialog 트리거 목록 */}
          <div className="space-y-2">
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 bg-[#1F1F2E] rounded-2xl"
              onClick={() => handleRangeClick(21, 100)}
            >
              <span>
                21 - 100 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">1,000</span>
              </span>
            </DialogTrigger>
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 bg-[#1F1F2E] rounded-2xl"
              onClick={() => handleRangeClick(101, 500)}
            >
              <span>
                101 - 500 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">600</span>
              </span>
            </DialogTrigger>
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 bg-[#1F1F2E] rounded-2xl"
              onClick={() => handleRangeClick(501, 1000)}
            >
              <span>
                501 - 1000 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">40</span>
              </span>
            </DialogTrigger>
          </div>

          <DialogContent className="text-white rounded-3xl w-[80%] md:w-full border-none bg-[#21212F] max-h-[80%] flex flex-col overflow-hidden text-sm">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>

            {/* 순위 리스트 스크롤 영역 */}
            <div className="overflow-y-auto flex-1">
              {isLoadingRange && <LoadingSpinner className="h-full" />}
              {rangeError && <ErrorMessage message={rangeError} />}
              {!isLoadingRange && !rangeError &&
                dialogRankings.map((r) => (
                  <div
                    key={r.rank}
                    className={`flex flex-row items-center p-4 border-b gap-10 truncate ${
                      r.itsMe ? "text-[#FDE047] font-bold" : ""
                    }`}
                  >
                    <p className="w-1/6 text-center">{r.rank}</p>
                    <p className="flex-1 text-center">{r.name}</p>
                  </div>
                ))}
            </div>

            {/* 내 순위 고정 영역 */}
            {showMyInDialog && (
              <div className="relative flex flex-row justify-center items-center box-bg rounded-3xl h-24 border-2 border-[#0147E5] p-5 gap-3">
                <p className="text-center w-1/6">{myData!.rank}</p>
                <p className="flex-1 text-center">{myData!.name}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RankingSection;
