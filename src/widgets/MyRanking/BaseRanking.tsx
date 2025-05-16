// src/widgets/MyRanking/BaseRanking.tsx
import React from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import Images from '@/shared/assets/images';
import { useTranslation } from 'react-i18next';

export interface BaseRankingProps {
  rank: number;
  previousRank: number;
  starPoints: number;
  lotteryCount: number;
  slToken: number;
  className?: string;
  showTitle?: boolean;
}

export const BaseRanking: React.FC<BaseRankingProps> = ({
  rank, previousRank,
  starPoints, lotteryCount, slToken,
  className = '',
  showTitle = true
}) => {
  const diff = previousRank - rank;
  const isUp = diff > 0;
  const isDown = diff < 0;

  const scaleAndGlow = {
    initial: { scale: 1, filter: 'brightness(1)' },
    animate: {
      scale: [1, 1.5, 1.2, 1],
      filter: ['brightness(1)', 'brightness(2)', 'brightness(1)', 'brightness(1)'],
      transition: { duration: 1, ease: 'easeInOut' }
    }
  };
    const { t } = useTranslation();

  return (
    <div className={`flex items-center text-white ${className}`}>
      {showTitle && <h3 className="text-lg font-semibold mr-4">{t('dice_event.my_rank')}</h3>}
      <div className="flex items-center space-x-6">
        {/* 랭크 */}
        <div className="relative">
          <motion.p
            className="text-2xl font-bold text-yellow-400"
            variants={scaleAndGlow}
            initial="initial"
            animate="animate"
          >
            <CountUp end={rank} duration={1} separator="," />
          </motion.p>
          {diff !== 0 && (
            <div className={`absolute ${isUp ? 'text-green-400 top-0' : 'text-red-400 bottom-0'} right-0 flex items-center`}>
              <span className="text-sm">{Math.abs(diff)}</span>
              {isUp ? <IoIosArrowRoundUp /> : <IoIosArrowRoundDown />}
            </div>
          )}
        </div>

        {/* 스타/티켓/토큰 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <motion.img
              src={Images.Star}
              alt="star"
              className="w-5 h-5 mr-1"
              variants={scaleAndGlow}
              animate="animate"
            />
            <CountUp end={starPoints} duration={1} separator="," />
          </div>
          <div className="flex items-center">
            <motion.img
              src={Images.LotteryTicket}
              alt="ticket"
              className="w-5 h-5 mr-1"
              variants={scaleAndGlow}
              animate="animate"
            />
            <CountUp end={lotteryCount} duration={1} separator="," />
          </div>
          <div className="flex items-center">
            <motion.img
              src={Images.TokenReward}
              alt="token"
              className="w-5 h-5 mr-1"
              variants={scaleAndGlow}
              animate="animate"
            />
            <CountUp end={slToken} duration={1} separator="," />
          </div>
        </div>
      </div>
    </div>
  );
};
