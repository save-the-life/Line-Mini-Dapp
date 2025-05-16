// src/widgets/MyRanking/InlineRanking.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '@/entities/User/model/userModel';
import { BaseRanking } from './BaseRanking';

export const InlineRanking: React.FC = () => {
  const {
    rank, previousRank,
    starPoints, lotteryCount, slToken,
    fetchUserData
  } = useUserStore();

  // 페이지 진입 시 한 번만: fetchUserData 에서 캐싱된 랭크 사용
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 p-4 rounded-lg">
      <BaseRanking
        rank={rank}
        previousRank={previousRank}
        starPoints={starPoints}
        lotteryCount={lotteryCount}
        slToken={slToken}
        className="justify-between"
        showTitle={false}  // 이미 위에 “나의 랭킹” 문구 있으므로 숨김
      />
    </div>
  );
};
