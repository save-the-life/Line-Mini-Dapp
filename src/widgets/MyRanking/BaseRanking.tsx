// src/widgets/MyRanking/BaseRanking.tsx
import React, { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from 'react-icons/io';
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
  rank,
  previousRank,
  starPoints,
  lotteryCount,
  slToken,
  className = '',
  showTitle = true
}) => {
  const { t } = useTranslation();

  // --- 1) 애니메이션 트리거 상태 ---
  const [showRankText, setShowRankText] = useState<'myRank'|'rankUp'|'rankDown'>('myRank');
  const [rankChanged, setRankChanged] = useState(false);
  const [starChanged, setStarChanged] = useState(false);
  const [lotteryChanged, setLotteryChanged] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);

  // --- 2) 이전 값 레퍼런스 ---
  const prevStarRef = useRef(starPoints);
  const prevLotteryRef = useRef(lotteryCount);
  const prevTokenRef = useRef(slToken);

  // --- 3) Rank 애니메이션 감지 ---
  useEffect(() => {
    if (previousRank !== rank) {
      setRankChanged(true);
      setShowRankText(rank < previousRank ? 'rankUp' : 'rankDown');
      const t1 = setTimeout(() => setRankChanged(false), 700);
      const t2 = setTimeout(() => setShowRankText('myRank'), 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [rank, previousRank]);

  // --- 4) Star/Ticket/Token 애니메이션 감지 ---
  useEffect(() => {
    if (prevStarRef.current !== starPoints) {
      setStarChanged(true);
      const t = setTimeout(() => setStarChanged(false), 700);
      prevStarRef.current = starPoints;
      return () => clearTimeout(t);
    }
  }, [starPoints]);

  useEffect(() => {
    if (prevLotteryRef.current !== lotteryCount) {
      setLotteryChanged(true);
      const t = setTimeout(() => setLotteryChanged(false), 700);
      prevLotteryRef.current = lotteryCount;
      return () => clearTimeout(t);
    }
  }, [lotteryCount]);

  useEffect(() => {
    if (prevTokenRef.current !== slToken) {
      setTokenChanged(true);
      const t = setTimeout(() => setTokenChanged(false), 700);
      prevTokenRef.current = slToken;
      return () => clearTimeout(t);
    }
  }, [slToken]);

  // --- 5) Framer Motion Variants ---
  const numberVariant = {
    initial: { scale: 1, filter: 'brightness(1)', rotate: 0 },
    animate: {
      scale: [1,1.5,1.2,1],
      filter: ['brightness(1)','brightness(2)','brightness(1.5)','brightness(1)'],
      rotate: [0,5,-5,0],
      transition: { duration: 1, ease: 'easeInOut' }
    }
  };
  const imgVariant = {
    initial: { scale:1, filter:'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))', rotate:0 },
    animate: {
      scale:[1,1.3,1.1,1],
      filter:[
        'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))',
        'brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8))',
        'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.5))',
        'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))'
      ],
      rotate:[0,3,-3,0],
      transition:{ duration:1, ease:'easeInOut' }
    }
  };
  const upDownVar = {
    initial: { scale:1, opacity:0, y:0 },
    animate: {
      scale:[1,1.3,1,1.3,1],
      opacity:[0,1,1,1,0],
      y:[0,-5,0,-5,5],
      transition:{ duration:1.4, ease:'easeInOut' }
    },
    exit: { opacity:0, scale:1, y:10, transition:{ duration:0.2 } }
  };
  const myVar = {
    initial: { opacity:0 },
    animate: { opacity:1, transition:{duration:0.2} },
    exit: { opacity:0, transition:{duration:0.2} }
  };

  const diff = previousRank - rank;
  const isUp = diff > 0;

  // --- 6) 렌더링 ---
  return (
    <div className={`flex flex-col items-center text-white ${className}`}>
      {showTitle && (
        <h3 className="text-xl font-jalnan mb-2">{t('dice_event.my_rank')}</h3>
      )}

      <div className="bg-box px-6 py-4 w-full flex font-semibold">
        {/* Rank 영역 */}
        <div className="relative w-[120px] flex flex-col items-center">
          {/* invisible placeholder */}
          <p className="invisible">{t('dice_event.my_rank')}</p>

          <div className="absolute top-0 w-full flex justify-center">
            <AnimatePresence mode="wait">
              {showRankText === 'myRank' && (
                <motion.p
                  key="my"
                  variants={myVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="font-semibold"
                >{t('dice_event.my_rank')}</motion.p>
              )}
              {showRankText === 'rankUp' && (
                <motion.p
                  key="up"
                  variants={upDownVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="font-jalnan text-green-400"
                >Rank Up!</motion.p>
              )}
              {showRankText === 'rankDown' && (
                <motion.p
                  key="down"
                  variants={upDownVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="font-jalnan text-red-400"
                >Rank Down!</motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.p
            variants={numberVariant}
            animate={rankChanged ? 'animate' : 'initial'}
            className="text-2xl font-jalnan text-yellow-300 mt-6"
          >
            <CountUp end={rank} duration={1} separator=","/>
          </motion.p>

          {diff !== 0 && (
            <div className={`absolute right-0 flex items-center ${isUp ? 'text-green-400 top-8' : 'text-red-400 bottom-2'}`}>
              <span className="text-xs">{Math.abs(diff)}</span>
              {isUp
                ? <IoIosArrowRoundUp className="ml-1"/>
                : <IoIosArrowRoundDown className="ml-1"/>}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-px bg-white mx-6" />

        {/* Star / Ticket / Token */}
        <div className="flex flex-1 justify-around">
          <motion.img
            src={Images.Star} alt="star"
            className="w-6 h-6"
            variants={imgVariant}
            animate={starChanged ? 'animate' : 'initial'}
          />
          <CountUp end={starPoints} duration={1} separator="," />

          <motion.img
            src={Images.LotteryTicket} alt="ticket"
            className="w-6 h-6"
            variants={imgVariant}
            animate={lotteryChanged ? 'animate' : 'initial'}
          />
          <CountUp end={lotteryCount} duration={1} separator="," />

          <motion.img
            src={Images.TokenReward} alt="token"
            className="w-6 h-6"
            variants={imgVariant}
            animate={tokenChanged ? 'animate' : 'initial'}
          />
          <CountUp end={slToken} duration={1} separator="," preserveValue/>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-2">* {t('dice_event.ranking_base')}</p>
    </div>
  );
};
