/** src/pages/RaffleRewards/index.tsx */
import React, { useEffect, useState } from "react";
import { TopTitle } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import "./PreviousRewards.css";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// Raffle 관련 컴포넌트 및 Zustand 스토어
import RaffleSection from "@/widgets/PreviousRewards/ui/RaffleSection";
import { useRaffleEntityStore } from "@/entities/PreviousRewards/model/raffleEntityModel";
import { useRaffleFeatureStore } from "@/features/PreviousRewards/model/raffleFeatureModel";

// 보상 선택 다이얼로그 및 API
import RewardSelectionDialog from "@/widgets/PreviousRewards/ui/RewardSelectionDialog";
import { selectRaffleReward } from "@/features/PreviousRewards/api/rewardApi";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";

interface RewardData {
  rank: number;
  userId: string;
  slRewards: number;
  usdcRewards: number;
  nftType: string | null;
  selectedRewardType: string | null;
  itsMe?: boolean;
}

const PreviousRaffle: React.FC = () => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  const {
    myRankings: raffleMyRankings,
    topRankings: raffleTopRankings,
    hasLoadedInitialRaffle,
    loadInitialRaffle,
  } = useRaffleEntityStore();

  const {
    dialogRaffleRankings,
    isLoadingRaffleRange,
    raffleRangeError,
    loadRaffleRangeRanking,
  } = useRaffleFeatureStore();

  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [selectedMyData, setSelectedMyData] = useState<RewardData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [currentRaffleIndex, setCurrentRaffleIndex] = useState(0);

  // 컴포넌트 마운트 시 래플 초기 데이터 로딩
  useEffect(() => {
    if (!hasLoadedInitialRaffle) {
      loadInitialRaffle();
    }
  }, [hasLoadedInitialRaffle, loadInitialRaffle]);

  // 범위별 래플 모달 열기
  const handleRangeClick = async (start: number, end: number) => {
    await loadRaffleRangeRanking(start, end);
    setDialogTitle(`${start}-${end}`);
    setDialogOpen(true);
  };

  const currentRaffleItem =
    raffleMyRankings && raffleMyRankings.length > 0
      ? raffleMyRankings[currentRaffleIndex]
      : null;

  const raffleIsReceived =
    currentRaffleItem?.selectedRewardType === "USDC" ||
    currentRaffleItem?.selectedRewardType === "SL";

  const dialogRaffleRankingsPlayerData: PlayerData[] = dialogRaffleRankings.map(r => ({
    ...r,
    nftType: r.nftType ?? null,
    selectedRewardType: r.selectedRewardType ?? null,
  }));

  // 보상 수령 핸들러
  const handleGetReward = async (data: RewardData) => {
    playSfx(Audios.button_click);
    if (data.selectedRewardType !== null) {
      alert("이미 보상을 선택하셨습니다!");
      return;
    }
    if (data.rank <= 20) {
      setSelectedMyData(data);
      setRewardDialogOpen(true);
    } else {
      await handleSelectRewardType("SL", data);
    }
  };

  // 보상 선택 후 API 호출 및 상태 업데이트
  const handleSelectRewardType = async (
    type: "USDC" | "SL",
    overrideData?: RewardData
  ) => {
    const targetData = overrideData ?? selectedMyData;
    if (!targetData) return;

    const updatedData = await selectRaffleReward(1, targetData.rank, type);
    useRaffleEntityStore.setState((state) => {
      const newMyRankings = state.myRankings ? [...state.myRankings] : [];
      const idx = newMyRankings.findIndex(r => r.rank === updatedData.rank);
      if (idx > -1) {
        newMyRankings[idx] = {
          ...newMyRankings[idx],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      const newRaffleTopRankings = [...state.topRankings];
      const topIdx = newRaffleTopRankings.findIndex(r => r.rank === updatedData.rank);
      if (topIdx > -1) {
        newRaffleTopRankings[topIdx] = {
          ...newRaffleTopRankings[topIdx],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      return {
        myRankings: newMyRankings,
        topRankings: newRaffleTopRankings,
      };
    });

    alert("Reward received successfully!");
    setSelectedMyData(prev => prev ? { ...prev, ...updatedData } : null);
    setRewardDialogOpen(false);
  };

  return (
    <div className="flex flex-col mb-44 text-white items-center w-full min-h-screen">
      <TopTitle title={t("reward_page.last_month")} className="px-6" back={true} />

      <RewardSelectionDialog
        open={rewardDialogOpen}
        onClose={() => setRewardDialogOpen(false)}
        data={selectedMyData}
        onSelect={(type) => handleSelectRewardType(type)}
      />

      <RaffleSection
              myRankings={(raffleMyRankings ?? []).map((r) => ({
                  ...r,
                  nftType: r.nftType ?? null,
                  selectedRewardType: r.selectedRewardType ?? null,
                  itsMe: r.itsMe ?? false,
              }))}
              raffleTopRankings={(raffleTopRankings ?? []).map((r) => ({
                  ...r,
                  nftType: r.nftType ?? null,
                  selectedRewardType: r.selectedRewardType ?? null,
                  itsMe: r.itsMe ?? false,
              }))}
              currentRaffleIndex={currentRaffleIndex}
              setCurrentRaffleIndex={setCurrentRaffleIndex}
              raffleIsReceived={raffleIsReceived}
              currentRaffleItem={currentRaffleItem
                  ? {
                      ...currentRaffleItem,
                      nftType: currentRaffleItem.nftType ?? null,
                      selectedRewardType: currentRaffleItem.selectedRewardType ?? null,
                      itsMe: currentRaffleItem.itsMe ?? false,
                  }
                  : null}
              onGetReward={() => {
                  if (!currentRaffleItem) return;
                  handleGetReward({
                      rank: currentRaffleItem.rank,
                      userId: currentRaffleItem.userId,
                      slRewards: currentRaffleItem.slRewards,
                      usdcRewards: currentRaffleItem.usdcRewards,
                      nftType: currentRaffleItem.nftType ?? null,
                      selectedRewardType: currentRaffleItem.selectedRewardType ?? null,
                      itsMe: currentRaffleItem.itsMe ?? false,
                  });
              } }
              dialogOpen={dialogOpen}
              onDialogOpenChange={setDialogOpen}
              dialogTitle={dialogTitle}
              dialogRaffleRankings={dialogRaffleRankingsPlayerData}
              isLoadingRaffleRange={isLoadingRaffleRange}
              raffleRangeError={raffleRangeError}
              handleRangeClick={handleRangeClick} isLoadingInitialRaffle={false}      />
    </div>
  );
};

export default PreviousRaffle;
