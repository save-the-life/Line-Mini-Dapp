/** src/pages/RankingRewards/index.tsx */
import React, { useEffect, useState } from "react";
import { TopTitle } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import "./PreviousRewards.css";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// Ranking 관련 컴포넌트 및 Zustand 스토어
import RankingSection from "@/widgets/PreviousRewards/ui/RankingSection";
import { usePreviousRewardsEntityStore } from "@/entities/PreviousRewards/model/previousRewardsModel";
import { usePreviousRewardsFeatureStore } from "@/features/PreviousRewards/model/previousRewardsModel";

// 보상 선택 다이얼로그 및 API
import RewardSelectionDialog from "@/widgets/PreviousRewards/ui/RewardSelectionDialog";
import { selectRankingReward } from "@/features/PreviousRewards/api/rewardApi";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";

// 임시 인터페이스 (RewardSelectionDialog에서 사용)
interface RewardData {
  rank: number;
  userId: string;
  slRewards: number;
  usdcRewards: number;
  nftType: string | null;
  selectedRewardType: string | null;
  itsMe?: boolean;
}

const PreviousRanking: React.FC = () => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  const {
    myRanking,
    topRankings,
    loadInitialRanking,
  } = usePreviousRewardsEntityStore();

  const {
    dialogRankings,
    isLoadingRange,
    rangeError,
    loadRangeRanking,
  } = usePreviousRewardsFeatureStore();

  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [selectedMyData, setSelectedMyData] = useState<RewardData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  // 컴포넌트 마운트 시 초기 랭킹 데이터 로딩
  useEffect(() => {
    loadInitialRanking();
  }, [loadInitialRanking]);

  // 범위별 랭킹 모달 열기
  const handleRangeClick = async (start: number, end: number) => {
    await loadRangeRanking(start, end);
    setDialogTitle(`${start}-${end}`);
    setDialogOpen(true);
  };

  const myData = myRanking && myRanking.length > 0 ? myRanking[0] : null;
  const isReceived =
    myData?.selectedRewardType === "USDC" || myData?.selectedRewardType === "SL";

  const dialogRankingsPlayerData: PlayerData[] = dialogRankings.map(r => ({
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

    const updatedData = await selectRankingReward(1, targetData.rank, type);
    // Zustand 스토어 업데이트
    usePreviousRewardsEntityStore.setState((state) => {
      const newMyRanking = state.myRanking ? [...state.myRanking] : [];
      if (newMyRanking.length > 0 && newMyRanking[0].rank === updatedData.rank) {
        newMyRanking[0] = { 
          ...newMyRanking[0],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      const newTopRankings = [...state.topRankings];
      const idx = newTopRankings.findIndex(r => r.rank === updatedData.rank);
      if (idx > -1) {
        newTopRankings[idx] = { 
          ...newTopRankings[idx],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      return {
        myRanking: newMyRanking,
        topRankings: newTopRankings,
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

      <RankingSection
        myData={
          myData
            ? {
                ...myData,
                nftType: myData.nftType ?? null,
                selectedRewardType: myData.selectedRewardType ?? null,
                itsMe: myData.itsMe ?? false,
              }
            : null
        }
        topRankings={topRankings.map((r) => ({
          ...r,
          nftType: r.nftType ?? null,
          selectedRewardType: r.selectedRewardType ?? null,
          itsMe: r.itsMe ?? false,
        }))}
        isReceived={isReceived}
        onGetReward={() => {
          if (!myData) return;
          handleGetReward({
            rank: myData.rank,
            userId: myData.userId,
            slRewards: myData.slRewards ?? 0,
            usdcRewards: myData.usdcRewards ?? 0,
            nftType: myData.nftType ?? null,
            selectedRewardType: myData.selectedRewardType ?? null,
            itsMe: myData.itsMe ?? false,
          });
        }}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        dialogTitle={dialogTitle}
        dialogRankings={dialogRankingsPlayerData}
        isLoadingRange={isLoadingRange}
        rangeError={rangeError}
        handleRangeClick={handleRangeClick}
      />
    </div>
  );
};

export default PreviousRanking;
