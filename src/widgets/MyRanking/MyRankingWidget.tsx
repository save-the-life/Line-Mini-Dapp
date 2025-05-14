// src/widgets/MyRanking/MyRankingWidget.tsx
import React, { useEffect, useRef, useState } from 'react';
import Images from '@/shared/assets/images';
import { useUserStore } from '@/entities/User/model/userModel';
import CountUp from 'react-countup';
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { fetchLeaderTabAPI } from '@/entities/Leaderboard/api/leaderboardAPI';

interface MyRankingWidgetProps {
  titleHidden?: boolean;
  className?: string;
}

const MyRankingWidget: React.FC<MyRankingWidgetProps> = ({
  className,
  titleHidden = false
}) => {
  // 1) 기존 store에서 스타, 티켓, SL토큰만 가져옴
  const { starPoints, lotteryCount, slToken, rank: storeRank } = useUserStore();

  // 2) 로컬 상태로 순위 관리 (초기값은 store의 rank)
  const [rank, setRank] = useState<number>(storeRank);

  useEffect(() => {
    setRank(storeRank);
  }, [storeRank]);

  // 3) 이전 값 추적을 위한 ref
  const prevRankRef = useRef<number>(rank);
  const prevStarPointsRef = useRef<number>(starPoints);
  const prevLotteryCountRef = useRef<number>(lotteryCount);
  const prevSlTokenRef = useRef<number>(slToken);

  const { t } = useTranslation();

  // 4) 화면 마운트 시 별도 순위 API 호출
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLeaderTabAPI();
        // 실제 응답 data 안에 myRank가 포함되어 있다고 가정
        const myRankData = (data as any).myRank;
        if (myRankData && typeof myRankData.rank === 'number') {
          setRank(myRankData.rank);
        }
      } catch (err) {
        console.error('순위 불러오기 실패:', err);
      }
    })();
  }, []);

  // 5) 랭크 변경 애니메이션 트리거
  const [rankChanged, setRankChanged] = useState(false);
  useEffect(() => {
    if (prevRankRef.current !== rank) {
      setRankChanged(true);
      const timer = setTimeout(() => setRankChanged(false), 700);
      prevRankRef.current = rank;
      return () => clearTimeout(timer);
    }
  }, [rank]);

  // 6) 기타 자원 변경 애니메이션 (기존 로직 유지)
  const [starChanged, setStarChanged] = useState(false);
  useEffect(() => {
    if (prevStarPointsRef.current !== starPoints) {
      setStarChanged(true);
      const timer = setTimeout(() => setStarChanged(false), 700);
      prevStarPointsRef.current = starPoints;
      return () => clearTimeout(timer);
    }
  }, [starPoints]);

  const [lotteryChanged, setLotteryChanged] = useState(false);
  useEffect(() => {
    if (prevLotteryCountRef.current !== lotteryCount) {
      setLotteryChanged(true);
      const timer = setTimeout(() => setLotteryChanged(false), 700);
      prevLotteryCountRef.current = lotteryCount;
      return () => clearTimeout(timer);
    }
  }, [lotteryCount]);

  const [tokenChanged, setTokenChanged] = useState(false);
  useEffect(() => {
    if (prevSlTokenRef.current !== slToken) {
      setTokenChanged(true);
      const timer = setTimeout(() => setTokenChanged(false), 700);
      prevSlTokenRef.current = slToken;
      return () => clearTimeout(timer);
    }
  }, [slToken]);

  // 7) Rank Up/Down 텍스트 표시 로직
  const [showRankText, setShowRankText] = useState<'myRank'|'rankUp'|'rankDown'>('myRank');
  const rankDifference = prevRankRef.current - rank;
  const isRankUp = rankDifference > 0;
  const isRankDown = rankDifference < 0;

  useEffect(() => {
    if (prevRankRef.current !== rank) {
      if (isRankUp) setShowRankText('rankUp');
      else if (isRankDown) setShowRankText('rankDown');
      else setShowRankText('myRank');

      const timer = setTimeout(() => setShowRankText('myRank'), 1500);
      return () => clearTimeout(timer);
    }
  }, [rank, isRankUp, isRankDown]);

  // 8) Framer Motion Variants (기존 그대로)
  const scaleAndGlow = {
    initial: { scale: 1, filter: 'brightness(1)', rotate: 0 },
    animate: {
      scale: [1,1.5,1.2,1],
      filter: ['brightness(1)','brightness(2)','brightness(1.5)','brightness(1)'],
      rotate: [0,5,-5,0],
      transition: { duration:1.0, ease:'easeInOut' }
    }
  };
  const scaleAndGlowImage = {
    initial: { scale:1, filter:'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))', rotate:0 },
    animate: {
      scale: [1,1.3,1.1,1],
      filter: [
        'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))',
        'brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8))',
        'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.5))',
        'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))'
      ],
      rotate: [0,3,-3,0],
      transition: { duration:1.0, ease:'easeInOut' }
    }
  };
  const rankUpDownVariants = {
    initial: { scale:1, opacity:0, y:0 },
    animate: {
      scale:[1,1.3,1,1.3,1],
      opacity:[0,1,1,1,0],
      y:[0,-5,0,-5,5],
      transition:{ duration:1.4, ease:'easeInOut' }
    },
    exit:{ opacity:0, scale:1, y:10, transition:{ duration:0.2 } }
  };
  const myRankVariants = {
    initial:{ opacity:0 }, animate:{ opacity:1, transition:{ duration:0.2 } }, exit:{ opacity:0, transition:{ duration:0.2 } }
  };

  // 9) 렌더링
  return (
    <div className={`flex flex-col items-center justify-center text-white cursor-pointer w-full ${className}`} role="button">
      <h1 className={`font-jalnan text-3xl ${titleHidden ? "hidden" : "block"}`}>
        {t("dice_event.my_rank")}
      </h1>

      <div className={`bg-box px-8 w-full h-24 md:h-32 flex font-semibold ${titleHidden ? "mt-0" : "mt-4"}`}>
        <div className="relative w-[121px] h-full flex flex-col items-center justify-center gap-2">
          <p className="text-base font-semibold invisible">{t("dice_event.my_rank")}</p>
          <div className="absolute top-[18%] md:top-[24%] min-w-32 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {showRankText === 'myRank' && (
                <motion.p key="myRank" className="text-base font-semibold" variants={myRankVariants} initial="initial" animate="animate" exit="exit">
                  {t("dice_event.my_rank")}
                </motion.p>
              )}
              {showRankText === 'rankUp' && (
                <motion.p key="rankUp" className="font-jalnan text-[#22C55E]" variants={rankUpDownVariants} initial="initial" animate="animate" exit="exit">
                  Rank Up!
                </motion.p>
              )}
              {showRankText === 'rankDown' && (
                <motion.p key="rankDown" className="font-jalnan text-[#DD2726]" variants={rankUpDownVariants} initial="initial" animate="animate" exit="exit">
                  Rank Down!
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.p className={`${rank > 9999 ? "text-xl" : "text-2xl"} text-[#fde047] font-jalnan`} variants={scaleAndGlow} animate={rankChanged ? 'animate' : 'initial'}>
            <CountUp start={0} end={rank} duration={1} separator="," />
          </motion.p>

          {rankDifference !== 0 && (
            <div className={`absolute flex items-center -right-2 z-20 ${isRankUp ? 'text-[#22C55E] top-[40%]' : 'text-[#DD2726] bottom-1'} text-[12px] font-semibold`}>
              <p>{Math.abs(rankDifference)}</p>
              {isRankUp ? <IoIosArrowRoundUp className="w-4 h-4" /> : <IoIosArrowRoundDown className="w-4 h-4" />}
            </div>
          )}
        </div>

        <div className="w-[1px] h-full mx-6 flex items-center"><div className="bg-white h-16 w-full" /></div>

        <div className="w-full h-full flex items-center justify-around text-xs">
          {/* 스타 */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.Star} alt="star" className="w-6 h-6" variants={scaleAndGlowImage} animate={starChanged ? 'animate' : 'initial'} />
            <p><CountUp start={0} end={starPoints} duration={1} separator="," /></p>
          </div>
          {/* 티켓 */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.LotteryTicket} alt="lottery-ticket" className="w-6 h-6" variants={scaleAndGlowImage} animate={lotteryChanged ? 'animate' : 'initial'} />
            <p><CountUp start={0} end={lotteryCount} duration={1} separator="," /></p>
          </div>
          {/* SL 토큰 */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.TokenReward} alt="RankingSLToken" className="w-6 h-6" variants={scaleAndGlowImage} animate={tokenChanged ? 'animate' : 'initial'} />
            <p><CountUp start={0} end={slToken} duration={1} separator="," preserveValue /></p>
          </div>
        </div>
      </div>

      <p className="w-full font-medium text-xs md:text-sm mt-2 px-2">* {t("dice_event.ranking_base")}</p>
    </div>
  );
};

export default MyRankingWidget;
