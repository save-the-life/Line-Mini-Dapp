import React, { useState } from "react";
import Images from "@/shared/assets/images";
import { IoCaretDown } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import "swiper/css";
import "swiper/css/pagination";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";
import { useTranslation } from "react-i18next";

interface RaffleSectionProps {
  myRankings: PlayerData[];
  raffleTopRankings: PlayerData[];
  currentRaffleIndex: number;
  setCurrentRaffleIndex: (index: number) => void;
  raffleIsReceived: boolean;
  currentRaffleItem: PlayerData | null;
  onGetReward: () => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogRaffleRankings: PlayerData[];
  isLoadingRaffleRange: boolean;
  raffleRangeError: string | null;
  handleRangeClick: (start: number, end: number) => void;
  currentUserId?: string;
  isLoadingInitialRaffle: boolean;
}

const RaffleSection: React.FC<RaffleSectionProps> = ({
  myRankings = [],
  raffleTopRankings = [],
  currentRaffleIndex,
  setCurrentRaffleIndex,
  raffleIsReceived,
  currentRaffleItem,
  onGetReward,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogRaffleRankings,
  isLoadingRaffleRange,
  raffleRangeError,
  handleRangeClick,
  currentUserId,
  isLoadingInitialRaffle,
}) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'USDT' | 'SL'>('USDT');

  if (isLoadingInitialRaffle) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-screen" />
      </div>
    );
  }

  const filteredMyRankings = myRankings.filter(item =>
    selectedTab === 'USDT'
      ? item.selectedRewardType === 'USDT'
      : item.selectedRewardType === 'SL'
  );
  const filteredTopRankings = raffleTopRankings.filter(item =>
    selectedTab === 'USDT'
      ? item.selectedRewardType === 'USDT'
      : item.selectedRewardType === 'SL'
  );

  return (
    <div className="p-6 bg-[#0D1226] text-white w-full h-full">
      {/* 제목 */}
      <h1 className="text-center text-lg font-semibold mb-4">
        Raffle Airdrop
      </h1>

      {/* 탭 헤더 */}
      <div className="flex mb-4">
        <button
          className={`flex-1 text-center pb-2 font-medium transition-all ${
            selectedTab === 'USDT'
              ? 'border-b-2 border-blue-500 text-white'
              : 'border-b-2 border-transparent text-white opacity-60'
          }`}
          onClick={() => setSelectedTab('USDT')}
        >
          USDT
        </button>
        <button
          className={`flex-1 text-center pb-2 font-medium transition-all ${
            selectedTab === 'SL'
              ? 'border-b-2 border-blue-500 text-white'
              : 'border-b-2 border-transparent text-white opacity-60'
          }`}
          onClick={() => setSelectedTab('SL')}
        >
          SL
        </button>
      </div>

      {/* 내 보상 */}
      {filteredMyRankings.length > 0 ? (
        <>
          <p className="font-semibold text-sm mb-2">
            {filteredMyRankings.length} {selectedTab} Rewards. Swipe to Check!
          </p>
          <div className="mt-2">
            <Swiper
              modules={[Pagination]}
              pagination={{ el: ".my-pagination", clickable: true }}
              spaceBetween={16}
              slidesPerView={1}
              onSlideChange={swiper => setCurrentRaffleIndex(swiper.activeIndex)}
            >
              {filteredMyRankings.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="relative flex flex-col box-bg rounded-3xl border-2 border-[#0147E5] p-5 h-24 justify-between">
                    {item.selectedRewardType && (
                      <div className="absolute top-2 right-2 bg-[#0147E5] rounded-full px-3 py-1 text-sm">
                        {t("reward_page.recieved")}
                      </div>
                    )}
                    <div className="flex flex-row items-center gap-3">
                      <p>{item.rank}</p>
                      <div className="flex flex-col gap-1">
                        <p>{item.name}</p>
                        <div className="flex flex-row items-center gap-1">
                          <img
                            src={
                              selectedTab === 'USDT' ? Images.USDT : Images.TokenReward
                            }
                            alt="token"
                            className="w-5 h-5"
                          />
                          <p className="text-sm font-semibold">
                            {selectedTab === 'USDT'
                              ? `${(item.usdtRewards ?? 0).toLocaleString()} USDT`
                              : `${(item.slRewards ?? 0).toLocaleString()} SL`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="my-pagination w-full flex items-center justify-center mt-4"></div>

          {/* 보상 버튼 */}
          {currentRaffleItem &&
            currentRaffleItem.selectedRewardType === selectedTab &&
            currentRaffleItem.rank <= 20 && (
              <button
                className={`bg-[#0147E5] rounded-full w-full h-14 mt-6 font-medium ${
                  raffleIsReceived ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={onGetReward}
                disabled={raffleIsReceived}
              >
                {currentRaffleItem.selectedRewardType === null
                  ? 'Select your reward'
                  : `Reward Issued (${currentRaffleItem.selectedRewardType})`}
              </button>
            )}
        </>
      ) : (
        <div className="relative flex flex-col box-bg rounded-3xl border-2 border-[#0147E5] p-5 h-full justify-center">
          <p className="font-semibold text-sm text-center">
            {t("reward_page.better_luck")} <br />
            {t("reward_page.next_raffle")}
          </p>
        </div>
      )}

      {/* Top 랭킹 */}
      <div className="flex flex-col mt-8">
        <p className="font-semibold mb-2">{t("reward_page.raffle_winner")}</p>
        {filteredTopRankings.length > 0 ? (
          filteredTopRankings.map(r => (
            <div key={r.rank} className="relative flex flex-row items-center p-4 border-b gap-4">
              <p>{r.rank}</p>
              <div className="flex flex-col gap-1">
                <p>{r.name}</p>
                <div className="flex flex-row items-center gap-1">
                  <img
                    src={
                      selectedTab === 'USDT' ? Images.USDT : Images.TokenReward
                    }
                    alt="token"
                    className="w-5 h-5"
                  />
                  <p className="text-sm font-semibold">
                    {selectedTab === 'USDT'
                      ? `${(r.usdtRewards ?? 0).toLocaleString()} USDT`
                      : `${(r.slRewards ?? 0).toLocaleString()} SL`}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm">{t("reward_page.no_ranking")}</p>
        )}
      </div>

      {/* 다이얼로그: 랭킹 범위 상세 */}
      <div className="mt-14 space-y-4">
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
          <DialogTrigger className="w-full cursor-pointer" onClick={() => handleRangeClick(21, 100)}>
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row items-center gap-2">
                21-100 <IoCaretDown className="w-5 h-5" />
              </div>
              <div className="flex flex-row items-center gap-1">
                <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
                <p className="text-sm font-semibold">500</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="text-white rounded-3xl w-[80%] md:w-full border-none bg-[#21212F] max-h-[80%] overflow-y-auto text-sm">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            {isLoadingRaffleRange && <LoadingSpinner className="h-screen" />}
            {raffleRangeError && <ErrorMessage message={raffleRangeError} />}
            {!isLoadingRaffleRange && !raffleRangeError &&
              dialogRaffleRankings.map(r => (
                <div key={r.rank} className={`flex flex-row gap-10 border-b pb-2 truncate ${r.itsMe ? "text-[#FDE047] font-bold" : ""}`}>
                  <p>{r.rank}</p>
                  <p>{r.name}</p>
                </div>
              ))}
          </DialogContent>
        </Dialog>

        <div className="w-full border-b"></div>
        <div className="flex flex-row justify-between items-center cursor-pointer" onClick={() => handleRangeClick(101, 500)}>
          <div className="flex flex-row items-center gap-2">
            101-500 <IoCaretDown className="w-5 h-5" />
          </div>
          <div className="flex flex-row items-center gap-1">
            <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
            <p className="text-sm font-semibold">25</p>
          </div>
        </div>

        <div className="w-full border-b"></div>
        <div className="flex flex-row justify-between items-center cursor-pointer" onClick={() => handleRangeClick(501, 1000)}>
          <div className="flex flex-row items-center gap-2">
            501-1000 <IoCaretDown className="w-5 h-5" />
          </div>
          <div className="flex flex-row items-center gap-1">
            <img src={Images.TokenReward} alt="token" className="w-5 h-5" />
            <p className="text-sm font-semibold">10</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleSection;
