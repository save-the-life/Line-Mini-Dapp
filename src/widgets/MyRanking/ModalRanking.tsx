// src//widgets/MyRanking/ModalRanking.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '@/entities/User/model/userModel';
import { BaseRanking } from './BaseRanking';
import { useTranslation } from 'react-i18next';

export const ModalRanking: React.FC = () => {
    const {
        rank, previousRank,
        starPoints, lotteryCount, slToken,
        fetchLeaderTab
    } = useUserStore();
    const { t } = useTranslation();

    // 모달 오픈 시마다 최신 랭크 가져오기
    useEffect(() => {
        fetchLeaderTab();
    }, [fetchLeaderTab]);

    return (
        <div>
            <BaseRanking
                rank={rank}
                previousRank={previousRank}
                starPoints={starPoints}
                lotteryCount={lotteryCount}
                slToken={slToken}
                className="justify-center"
                titleHidden={false}
            />
        </div>
    );
};
