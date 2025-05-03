import React, { useState } from "react";
import Images from "@/shared/assets/images";
import { IoCaretDown } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import "swiper/css";
import "swiper/css/pagination";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";
import { useTranslation } from "react-i18next";

interface RaffleSectionProps {
  myRankings: PlayerData[];
  currentRaffleIndex: number;
  setCurrentRaffleIndex: (index: number) => void;
  raffleIsReceived: boolean;
  currentRaffleItem: PlayerData | null;
  onGetReward: () => void;
  raffleTopRankings: PlayerData[];
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogRaffleRankings: PlayerData[];
  isLoadingRaffleRange: boolean;
  raffleRangeError: string | null;
  handleRangeClick: (start: number, end: number) => void;
  isLoadingInitialRaffle: boolean;
}

const RaffleSection: React.FC<RaffleSectionProps> = ({
  myRankings = [],
  currentRaffleIndex,
  setCurrentRaffleIndex,
  raffleIsReceived,
  currentRaffleItem,
  onGetReward,
  raffleTopRankings = [],
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogRaffleRankings,
  isLoadingRaffleRange,
  raffleRangeError,
  handleRangeClick,
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

  // 내 보상 필터 + 정렬
  const filteredMyRankings = myRankings
    .filter(item =>
      selectedTab === 'USDT'
        ? item.selectedRewardType === 'USDT'
        : item.selectedRewardType === 'SL'
    )
    .sort((a, b) => a.rank - b.rank);

  // USDT: 상위 20명
  const usdtRanks = raffleTopRankings
    .filter(r => r.selectedRewardType === 'USDT')
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 20);

  // SL: 전체 정렬 후 상위 10명 인라인, 나머지는 다이얼로그
  const allSl = raffleTopRankings
    .filter(r => r.selectedRewardType === 'SL')
    .sort((a, b) => a.rank - b.rank);
  const inlineSl = allSl.slice(0, 10);
  const slRanges = [
    { start: 11, end: 100, label: '11-100', amount: 200 },
    { start: 101, end: 500, label: '101-500', amount: 100 },
    { start: 501, end: 800, label: '501-800', amount: 40 },
    { start: 801, end: 1600, label: '801-1600', amount: 20 },
    { start: 1601, end: 2000, label: '1601-2000', amount: 10 },
  ];

  return (
    <div className="p-6 bg-[#0D1226] text-white w-full h-full">
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
          <div className="mt-2 mb-4">
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
          <div className="my-pagination w-full flex items-center justify-center mt-4" />
        </>
      ) : (
        <div className="relative flex flex-col box-bg rounded-3xl border-2 border-[#0147E5] p-5 h-full justify-center mb-4">
          <p className="font-semibold text-sm text-center">
            {t("reward_page.better_luck")} <br />
            {t("reward_page.next_raffle")} 
          </p>
        </div>
      )}

      {/* USDT 탭: 1~20위 리스트 */}
      {selectedTab === 'USDT' && (
        <div className="space-y-2">
          {usdtRanks.length === 0 ? (
            <p className="text-center text-sm">{t('reward_page.no_ranking')}</p>
          ) : (
            usdtRanks.map(item => (
              <div key={item.rank} className="flex items-center p-4 border-b gap-2">
                <p className="w-6 text-center">{item.rank}</p>
                <p className="flex-1 truncate">{item.name}</p>
                <div className="flex items-center gap-1">
                  <img src={Images.USDT} alt="USDT" className="w-5 h-5" />
                  <p className="text-sm font-semibold">
                    {item.usdtRewards?.toLocaleString()} USDT
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SL 탭: 1~10위 인라인, 그 외 다이얼로그 */}
      {selectedTab === 'SL' && (
        <>
          <div className="space-y-2">
            {inlineSl.length === 0 ? (
              <p className="text-center text-sm">{t('reward_page.no_ranking')}</p>
            ) : (
              inlineSl.map(item => (
                <div key={item.rank} className="flex items-center p-4 border-b gap-2">
                  <p className="w-6 text-center">{item.rank}</p>
                  <p className="flex-1 truncate">{item.name}</p>
                  <div className="flex items-center gap-1">
                    <img src={Images.TokenReward} alt="SL" className="w-5 h-5" />
                    <p className="text-sm font-semibold">
                      {item.slRewards?.toLocaleString()} SL
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 space-y-4">
            <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
              <div className="space-y-2">
                {slRanges.map(range => (
                  <DialogTrigger
                    key={range.label}
                    className="w-full cursor-pointer flex flex-row justify-between items-center p-4 bg-[#1F1F2E] rounded-2xl"
                    onClick={() => handleRangeClick(range.start, range.end)}
                  >
                    <span>
                      {range.label} <IoCaretDown className="inline-block ml-1" />
                    </span>
                    <span className="flex items-center gap-1">
                      <img src={Images.TokenReward} alt="SL" className="w-5 h-5" />
                      <span className="text-sm font-semibold">{range.amount}</span>
                    </span>
                  </DialogTrigger>
                ))}
              </div>

              <DialogContent className="text-white rounded-3xl w-[80%] md:w-full border-none bg-[#21212F] max-h-[80%] flex flex-col overflow-hidden text-sm">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                  {isLoadingRaffleRange && <LoadingSpinner className="h-full" />}
                  {raffleRangeError && <ErrorMessage message={raffleRangeError} />}
                  {!isLoadingRaffleRange &&
                    !raffleRangeError &&
                    dialogRaffleRankings.map(r => (
                      <div
                        key={r.rank}
                        className={`flex flex-row items-center p-4 border-b gap-10 truncate ${
                          r.itsMe ? 'text-[#FDE047] font-bold' : ''
                        }`}
                      >
                        <p className="w-1/6 text-center">{r.rank}</p>
                        <p className="flex-1 text-center">{r.name}</p>
                      </div>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
};

export default RaffleSection;
