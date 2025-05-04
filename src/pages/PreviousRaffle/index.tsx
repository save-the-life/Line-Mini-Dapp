// src/pages/RaffleRewards/index.tsx

import React, { useEffect, useState } from "react";
import { TopTitle } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import "./PreviousRewards.css";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// Zustand stores
import { useRaffleEntityStore } from "@/entities/PreviousRewards/model/raffleEntityModel";
import { useRaffleFeatureStore } from "@/features/PreviousRewards/model/raffleFeatureModel";

// Raffle section UI
import RaffleSection from "@/widgets/PreviousRewards/ui/RaffleSection";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";

const PreviousRaffle: React.FC = () => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  // SL initial data store
  const {
    myRankings: raffleMyRankings,
    topRankings: raffleTopRankings,
    hasLoadedInitialRaffle,
    loadInitialRaffle,
  } = useRaffleEntityStore();

  // Range-ranking dialog data store
  const {
    dialogRaffleRankings,
    isLoadingRaffleRange,
    raffleRangeError,
    loadRaffleRangeRanking,
  } = useRaffleFeatureStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [currentRaffleIndex, setCurrentRaffleIndex] = useState(0);

  // Load SL initial data once on mount
  useEffect(() => {
    if (!hasLoadedInitialRaffle) {
      loadInitialRaffle();
    }
  }, [hasLoadedInitialRaffle, loadInitialRaffle]);

  // Open range-modal
  const handleRangeClick = async (start: number, end: number) => {
    await loadRaffleRangeRanking(start, end);
    setDialogTitle(`${start}-${end}`);
    setDialogOpen(true);
  };

  // Determine the current slide item
  const currentRaffleItem: PlayerData | null =
    raffleMyRankings && raffleMyRankings.length > 0
      ? raffleMyRankings[currentRaffleIndex]
      : null;

  // Has the user already received their reward?
  const raffleIsReceived =
    currentRaffleItem?.selectedRewardType === "USDT" ||
    currentRaffleItem?.selectedRewardType === "SL";

  // Prepare dialog data
  const dialogRaffleRankingsPlayerData: PlayerData[] = dialogRaffleRankings.map((r) => ({
    ...r,
    nftType: r.nftType ?? null,
    selectedRewardType: r.selectedRewardType ?? null,
    itsMe: r.itsMe ?? false,
  }));

  return (
    <div className="flex flex-col mb-44 text-white items-center w-full min-h-screen">
      <TopTitle title={t("reward_page.last_month")} className="px-6" back />

      <RaffleSection
        currentRaffleIndex={currentRaffleIndex}
        setCurrentRaffleIndex={setCurrentRaffleIndex}
        raffleIsReceived={raffleIsReceived}
        currentRaffleItem={
          currentRaffleItem
            ? {
                ...currentRaffleItem,
                nftType: currentRaffleItem.nftType ?? null,
                selectedRewardType: currentRaffleItem.selectedRewardType ?? null,
                itsMe: currentRaffleItem.itsMe ?? false,
              }
            : null
        }
        // 이 컴포넌트에서는 보상 선택 UI를 제거했으므로 onGetReward만 빈 함수로 넘깁니다.
        onGetReward={() => playSfx(Audios.button_click)}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        dialogTitle={dialogTitle}
        dialogRaffleRankings={dialogRaffleRankingsPlayerData}
        isLoadingRaffleRange={isLoadingRaffleRange}
        raffleRangeError={raffleRangeError}
        handleRangeClick={handleRangeClick}
      />
    </div>
  );
};

export default PreviousRaffle;
