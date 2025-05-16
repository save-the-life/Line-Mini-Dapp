// src/widgets/MyRanking/InlineRanking.tsx
import React, { useEffect } from 'react'
import { useUserStore } from '@/entities/User/model/userModel'
import { BaseRanking } from './BaseRanking'

export const InlineRanking: React.FC = () => {
  // 1) 오직 fetchUserData 함수만 가져오기
  const fetchUserData = useUserStore(state => state.fetchUserData)

  // 2) 화면에 렌더링할 데이터만 선택해서 가져오기
  const { rank, previousRank, starPoints, lotteryCount, slToken } =
    useUserStore(state => ({
      rank: state.rank,
      previousRank: state.previousRank,
      starPoints: state.starPoints,
      lotteryCount: state.lotteryCount,
      slToken: state.slToken,
    }))

  // mount 시 한 번만 실행
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 p-4 rounded-lg">
      <BaseRanking
        rank={rank}
        previousRank={previousRank}
        starPoints={starPoints}
        lotteryCount={lotteryCount}
        slToken={slToken}
        className="justify-between"
        showTitle={false}
      />
    </div>
  )
}
