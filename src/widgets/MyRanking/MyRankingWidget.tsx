// src/widgets/MyRanking/MyRankingWidget.tsx

import React, { useEffect, useRef, useState } from 'react';
import Images from '@/shared/assets/images';
import { useUserStore } from '@/entities/User/model/userModel';
import CountUp from 'react-countup';
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";

interface MyRankingWidgetProps {
  titleHidden?: boolean;
  className?: string;
}

const MyRankingWidget: React.FC<MyRankingWidgetProps> = ({
  className,
  titleHidden = false
}) => {
  // 1) store에서 직접 가져오기
  
  const rank          = useUserStore(s => s.rank);
  const previousRank  = useUserStore(s => s.previousRank);
  const starPoints    = useUserStore(s => s.starPoints);
  const lotteryCount  = useUserStore(s => s.lotteryCount);
  const slToken       = useUserStore(s => s.slToken);
  const fetchRankData = useUserStore.getState().fetchRankData;

  const { t } = useTranslation();

  // 2) 마운트 시점에 최신 순위 가져오기
  useEffect(() => {
    fetchRankData().catch(console.error);
  // 빈 배열로 두어 마운트 때 단 한 번만 실행
  }, []);

  // 3) 애니메이션 트리거용 ref/state (기존 로직 그대로)
  const prevRankRef = useRef(previousRank);
  const prevStarRef = useRef(starPoints);
  const prevTicketRef = useRef(lotteryCount);
  const prevTokenRef = useRef(slToken);

  const [rankChanged, setRankChanged] = useState(false);
  const [starChanged, setStarChanged] = useState(false);
  const [ticketChanged, setTicketChanged] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);

  // a) rank 애니메이션
  useEffect(() => {
    if (prevRankRef.current !== rank) {
      setRankChanged(true);
      const t = setTimeout(() => setRankChanged(false), 700);
      prevRankRef.current = rank;
      return () => clearTimeout(t);
    }
  }, [rank]);

  // b) 기타 자원 애니메이션
  useEffect(() => {
    if (prevStarRef.current !== starPoints) {
      setStarChanged(true);
      const t = setTimeout(() => setStarChanged(false), 700);
      prevStarRef.current = starPoints;
      return () => clearTimeout(t);
    }
  }, [starPoints]);
  useEffect(() => {
    if (prevTicketRef.current !== lotteryCount) {
      setTicketChanged(true);
      const t = setTimeout(() => setTicketChanged(false), 700);
      prevTicketRef.current = lotteryCount;
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

  // 4) Rank Up/Down 텍스트 로직
  const diff = previousRank - rank;
  const isUp = diff > 0, isDown = diff < 0;
  const [rankText, setRankText] = useState<'myRank'|'rankUp'|'rankDown'>('myRank');
  useEffect(() => {
    if (prevRankRef.current !== rank) {
      if (isUp) setRankText('rankUp');
      else if (isDown) setRankText('rankDown');
      else setRankText('myRank');
      const t = setTimeout(() => setRankText('myRank'), 1500);
      return () => clearTimeout(t);
    }
  }, [rank, isUp, isDown]);

  // 5) Framer-motion variants (기존 그대로)
  const numVariants = {
    initial:{ scale:1, filter:'brightness(1)', rotate:0 },
    animate:{ scale:[1,1.5,1.2,1], filter:['brightness(1)','brightness(2)','brightness(1.5)','brightness(1)'], rotate:[0,5,-5,0], transition:{ duration:1, ease:'easeInOut' } }
  };
  const imgVariants = {
    initial:{ scale:1, filter:'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))', rotate:0 },
    animate:{ scale:[1,1.3,1.1,1], filter:[
      'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))',
      'brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8))',
      'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.5))',
      'brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))'
    ], rotate:[0,3,-3,0], transition:{ duration:1, ease:'easeInOut' } }
  };
  const upDownVariants = {
    initial:{ scale:1, opacity:0, y:0 },
    animate:{ scale:[1,1.3,1,1.3,1], opacity:[0,1,1,1,0], y:[0,-5,0,-5,5], transition:{ duration:1.4, ease:'easeInOut' } },
    exit:{ opacity:0, scale:1, y:10, transition:{ duration:0.2 } }
  };
  const myRankVariants = {
    initial:{ opacity:0 }, animate:{ opacity:1, transition:{ duration:0.2 } }, exit:{ opacity:0, transition:{ duration:0.2 } }
  };

  // 6) 렌더링
  return (
    <div className={`flex flex-col items-center text-white cursor-pointer w-full ${className}`} role="button">
      <h1 className={`font-jalnan text-3xl ${titleHidden? 'hidden':'block'}`}>{t("dice_event.my_rank")}</h1>
      <div className={`bg-box px-8 w-full h-24 md:h-32 flex font-semibold ${titleHidden? 'mt-0':'mt-4'}`}>
        <div className="relative w-[121px] h-full flex flex-col items-center justify-center gap-2">
          {/* placeholder */}
          <p className="invisible">{t("dice_event.my_rank")}</p>
          <div className="absolute top-[18%] md:top-[24%] flex justify-center w-full">
            <AnimatePresence mode="wait">
              {rankText==='myRank' && <motion.p key="my" variants={myRankVariants} initial="initial" animate="animate" exit="exit">{t("dice_event.my_rank")}</motion.p>}
              {rankText==='rankUp' && <motion.p key="up" className="font-jalnan text-[#22C55E]" variants={upDownVariants} initial="initial" animate="animate" exit="exit">Rank Up!</motion.p>}
              {rankText==='rankDown' && <motion.p key="down" className="font-jalnan text-[#DD2726]" variants={upDownVariants} initial="initial" animate="animate" exit="exit">Rank Down!</motion.p>}
            </AnimatePresence>
          </div>
          <motion.p className={`${rank>9999?'text-xl':'text-2xl'} text-[#fde047] font-jalnan`}
                    variants={numVariants} animate={rankChanged? 'animate':'initial'}>
            <CountUp start={0} end={rank} duration={1} separator=","/>
          </motion.p>
          {diff!==0 && (
            <div className={`absolute flex items-center -right-2 z-20 ${isUp? 'text-[#22C55E] top-[40%]':'text-[#DD2726] bottom-1'} text-[12px] font-semibold`}>
              <p>{Math.abs(diff)}</p>
              {isUp ? <IoIosArrowRoundUp className="w-4 h-4"/> : <IoIosArrowRoundDown className="w-4 h-4"/>}
            </div>
          )}
        </div>
        <div className="w-[1px] h-full mx-6 flex items-center"><div className="bg-white h-16 w-full"/></div>
        <div className="w-full h-full flex items-center justify-around text-xs">
          {/* Star */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.Star} alt="star" className="w-6 h-6" variants={imgVariants} animate={starChanged?'animate':'initial'}/>
            <p><CountUp start={0} end={starPoints} duration={1} separator=","/></p>
          </div>
          {/* Ticket */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.LotteryTicket} alt="ticket" className="w-6 h-6" variants={imgVariants} animate={ticketChanged?'animate':'initial'}/>
            <p><CountUp start={0} end={lotteryCount} duration={1} separator=","/></p>
          </div>
          {/* SL Token */}
          <div className="flex flex-col items-center gap-2">
            <motion.img src={Images.TokenReward} alt="token" className="w-6 h-6" variants={imgVariants} animate={tokenChanged?'animate':'initial'}/>
            <p><CountUp start={0} end={slToken} duration={1} separator="," preserveValue/></p>
          </div>
        </div>
      </div>
      <p className="w-full font-medium text-xs md:text-sm mt-2 px-2">* {t("dice_event.ranking_base")}</p>
    </div>
  );
};

export default MyRankingWidget;
