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
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-center">{t('dice_event.my_rank')}</h2>
            <BaseRanking
                rank={rank}
                previousRank={previousRank}
                starPoints={starPoints}
                lotteryCount={lotteryCount}
                slToken={slToken}
                className="justify-center"
                showTitle={false}  // 타이틀은 상단 h2로 대체
            />
        </div>
    );
};
