// src/widgets/RewardItem/index.tsx

import React from "react";
import Images from "@/shared/assets/images";
import { RankingAward, DrawAward } from "@/entities/RewardPage/types";

// Award 타입: 랭킹 혹은 래플 보상
type Award = RankingAward | DrawAward;

interface RewardItemProps {
  rank: number | string;
  award: Award;
  isTop?: boolean;
}

const RewardItem: React.FC<RewardItemProps> = ({ rank, award, isTop = false }) => {
  // 보상 금액 및 단위 결정
  const isUsdt = award.usdtRewards != null;
  const amount = isUsdt ? award.usdtRewards! : award.slRewards!;
  const unit = isUsdt ? "USDT" : "SL";

  // 표시할 텍스트
  const rewardText = `${amount.toLocaleString()} ${unit}`;
  const nftText = award.nftType ? ` + ${award.nftType} PASS` : "";

  // 아이콘 선택 (TokenReward는 SL 토큰, USDT 아이콘이 별도 없을 경우 재사용)
  const iconSrc = Images.TokenReward;
  const iconAlt = unit === "USDT" ? "usdt-reward" : "token-reward";

  return isTop ? (
    <div className="h-16 w-full rounded-3xl first-to-third-pace-box flex flex-row items-center justify-center gap-4 text-sm">
      <p className="font-semibold">{rank}</p>
      <div className="flex flex-row gap-1 font-medium items-center">
        <img src={iconSrc} alt={iconAlt} className="w-6 h-6" />
        <p>
          {rewardText}
          {nftText}
        </p>
      </div>
    </div>
  ) : (
    <div className="h-16 w-full flex flex-row items-center justify-between border-b text-sm">
      <p>{rank}</p>
      <div className="flex flex-row items-center gap-2">
        <img src={iconSrc} alt={iconAlt} className="w-6 h-6" />
        <p>
          {rewardText}
          {nftText}
        </p>
      </div>
    </div>
  );
};

export default RewardItem;
