// src/pages/RewardPage/index.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TopTitle } from "@/shared/components/ui";
import "./Reward.css";
import Images from "@/shared/assets/images";
import { useRewardStore } from "@/entities/RewardPage/model/rewardModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import RewardItem from "@/widgets/RewardItem"; 
import api from '@/shared/api/axiosInstance';
import { formatNumber } from "@/shared/utils/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

const Reward: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const {
    fetchLeaderHome,
    rankingAwards,
    slDrawAwards,
    usdtDrawAwards,
    rank,
    isLoadingHome,
    errorHome,
  } = useRewardStore();

  const [showMoreRanking, setShowMoreRanking] = useState(false);
  const [showMoreUSDT, setShowMoreUSDT] = useState(false);
  const [showMoreSL, setShowMoreSL] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 날짜 포맷 및 번역
  const dateFormat = t("date_format_md");
  const event2 = new Date(2025, 8, 15);
  const event3 = new Date(2025, 6, 15);
  const event4 = new Date(2025, 7, 15);

  useEffect(() => {
    fetchLeaderHome();
  }, [fetchLeaderHome]);

  if (isLoadingHome) {
    return <LoadingSpinner className="h-screen" />;
  }

  if (errorHome) {
    return <div className="text-center text-red-500">Error: {errorHome}</div>;
  }

  // 랭킹 보상
  const rankingProducts = rankingAwards.slice(0, 3);
  const rankingOthers = rankingAwards.slice(3);
  const currentRound = rankingProducts.length > 0 ? rankingProducts[0].round : null;

  // 래플 보상: USDT / SL
  const usdtProducts = usdtDrawAwards.slice(0, 3);
  const usdtOthers = usdtDrawAwards.slice(3);
  const slProducts = slDrawAwards.slice(0, 3);
  const slOthers = slDrawAwards.slice(3);

  // 에어드랍 회차
  const slRound = slDrawAwards.length > 0 ? slDrawAwards[0].round : null;

  const handleShowMoreRanking = () => {
    playSfx(Audios.button_click);
    setShowMoreRanking(true);
  };
  const handleShowMoreUSDT = () => {
    playSfx(Audios.button_click);
    setShowMoreUSDT(true);
  };
  const handleShowMoreSL = () => {
    playSfx(Audios.button_click);
    setShowMoreSL(true);
  };


  const handlePreviousRewardPage = async () => {
    playSfx(Audios.button_click);
    const response = await api.get("/leader/ranking/initial");
    if (response.data.data === null) {
      setShowModal(true);
    } else {
      if (currentRound !== null) {
        navigate('/previous-ranking', {
          state: { round: currentRound - 1 }
        });
      }
    }
  };

  const handlePreviousAirdropPage = async () => {
    playSfx(Audios.button_click);
    const response = await api.get("/leader/raffle/initial");
    if (response.data.data === null) {
      setShowModal(true);
    } else {
      navigate('/previous-raffle');
    }
  };

  const handleCloseModal = () => {
    playSfx(Audios.button_click);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col text-white mb-44 w-full min-h-screen">
      <TopTitle title={t("reward_page.reward")} />

     {/* 이벤트 배너 영역 */}
     <div
          className="w-full h-[170px] bg-cover bg-center flex items-center justify-center px-6"
          style={{ backgroundImage: `url(${Images.RewardBanner})` }}
        >
        {/* 3개의 박스를 나란히 배치할 컨테이너 */}
        <div className="flex gap-3">

        {/* 첫 번째 박스 */}
          <div className="
            w-[110px] h-[126px] 
            bg-gradient-to-b from-[#484ADA] to-[#2D2774]
            rounded-3xl 
            border-2 border-yellow-400 border-blink
            flex flex-col items-center justify-center
            p-2
          ">
            <p className="text-xs font-normal text-white text-center">{t("reward_page.four")} {t("reward_page.this_month")}</p>
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ranking_rewards")}</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ends_on")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event3).format(dateFormat)}</p>
          </div>

          {/* 두 번째 박스 */}
          <div className="
            w-[110px] h-[126px] 
            bg-gradient-to-b from-[#484ADA] to-[#2D2774]
            rounded-3xl 
            border-2 border-yellow-400 border-blink
            flex flex-col items-center justify-center
            p-2
          ">
            <p className="text-xs font-normal text-white text-center">{t("reward_page.five")} {t("reward_page.this_month")}</p>
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ranking_rewards")}</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ends_on")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event4).format(dateFormat)}</p>
          </div>
          
          {/* 세 번째 박스 */}
          <div className="
            w-[110px] h-[126px] 
            bg-gradient-to-b from-[#484ADA] to-[#2D2774]
            rounded-3xl 
            border-2 border-yellow-400 border-blink
            flex flex-col items-center justify-center
            p-2
          ">
            <p className="text-xs font-normal text-white text-center">{t("reward_page.six")} {t("reward_page.this_month")}</p>
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ranking_rewards")}</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ends_on")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event2).format(dateFormat)}</p>
          </div>
          
          {/* 빈 영역 */}
          {/* <div className="w-[110px] h-[126px] flex flex-col items-center justify-center p-2">
          </div> */}
          
          {/* 빈 영역 */}
          {/* <div className="w-[110px] h-[126px] flex flex-col items-center justify-center p-2">
          </div> */}

        </div>
      </div>
      <p className="mt-1 ml-1 text-xs font-normal text-white">* {t("reward_page.all_events")}</p>
      
      {/* 지난 달 보상 확인 */}
      <div
        className="first-to-third-pace-box h-36 rounded-3xl mt-5 mb-5 flex flex-row items-center justify-around p-5 cursor-pointer px-6 md:px-0 mx-6"
        onClick={handlePreviousRewardPage}
      >
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">{t("reward_page.previous")}</p>
          <p className="text-sm">{t("reward_page.see_ranking_reward")}</p>
        </div>
        <img src={Images.Trophy} alt="trophy" className="w-24 h-24" />
      </div>

      {/* 이번 달 랭킹 보상 */}
      <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <h1 className="z-30">
            {currentRound} {t("reward_page.this_month")}<br />{t("reward_page.awards")}
          </h1>
          <img src={Images.GoldMedal} alt="gold-medal" className="absolute -top-1 -left-11 w-[70px] h-[70px] -z-10" />
        </div>

        {rankingProducts.map((award, idx) => (
          <RewardItem key={idx} rank={idx + 1} award={award} isTop />
        ))}

        <AnimatePresence>
          {showMoreRanking && rankingOthers.map((award, idx) => (
            <motion.div
              key={idx}
              className="w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RewardItem
                rank={award.rangeStart === award.rangeEnd ? award.rangeStart : `${award.rangeStart}-${award.rangeEnd}`}
                award={award}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {!showMoreRanking && rankingOthers.length > 0 && (
          <button
            onClick={handleShowMoreRanking}
            className="border border-white text-white text-xs font-semibold px-4 py-2 rounded-full mt-4"
          >
            {t("reward_page.view_more")}
          </button>
        )}
      </div>

     {/* 래플-에어드랍 영역 */}
     <div 
        className="first-to-third-pace-box h-36 rounded-3xl mt-2 mb-14 flex flex-row items-center justify-around p-5 cursor-pointer px-6 md:px-0 mx-6"
        onClick={handlePreviousAirdropPage}>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">{t("reward_page.raffle_airdrop")}</p>
          <p className="text-sm">
            {t("reward_page.Check_winner")}
          </p>
        </div>
        <img src={Images.airDropBox} alt="trophy" className="w-24 h-24" />
      </div>

      {/** 지난 에어드랍 경품 보여주기 */}
      {/* <div className="flex flex-col gap-3 justify-center items-center mb-8">
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <h1 className="z-30">
            {slRound} {t("reward_page.this_month")}
            <br />
            {t("reward_page.air_drop")}
          </h1>
          <img
            src={Images.LotteryTicket}
            alt="Raffle"
            className="absolute -top-1 -right-12 w-[68px] h-[68px] -z-10"
          />
        </div>
      </div> */}

      {/* USDT 보상 */}
      {/* <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        <div className="relative text-center font-jalnan text-xl font-bold">
          USDT WINNER
        </div>
        {usdtProducts.map((award, idx) => (
          <RewardItem key={idx} rank={idx + 1} award={award} isTop />
        ))}
        <AnimatePresence>
          {showMoreUSDT && usdtOthers.map((award, idx) => (
            <motion.div
              key={idx}
              className="w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RewardItem
                rank={award.rangeStart === award.rangeEnd ? award.rangeStart : `${award.rangeStart}-${award.rangeEnd}`}
                award={award}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {!showMoreUSDT && usdtOthers.length > 0 && (
          <button
            onClick={handleShowMoreUSDT}
            className="border border-white text-white text-xs font-semibold px-4 py-2 rounded-full mt-4"
          >
            {t("reward_page.view_more")}
          </button>
        )}
      </div> */}

      {/* SL 보상 */}
      {/* <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        <div className="relative text-center font-jalnan text-xl font-bold">
          SL WINNER
        </div>
        {slProducts.map((award, idx) => (
          <RewardItem key={idx} rank={idx + 1} award={award} isTop />
        ))}
        <AnimatePresence>
          {showMoreSL && slOthers.map((award, idx) => (
            <motion.div
              key={idx}
              className="w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RewardItem
                rank={award.rangeStart === award.rangeEnd ? award.rangeStart : `${award.rangeStart}-${award.rangeEnd}`}
                award={award}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {!showMoreSL && slOthers.length > 0 && (
          <button
            onClick={handleShowMoreSL}
            className="border border-white text-white text-xs font-semibold px-4 py-2 rounded-full mt-4"
          >
            {t("reward_page.view_more")}
          </button>
        )}
      </div> */}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full">
          <div className="bg-white text-black p-6 rounded-lg text-center w-[70%] max-w-[550px]">
            <p>{t("reward_page.no_previous_rewards")}</p>
            <button
              className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
              onClick={handleCloseModal}
            >
              {t("OK")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reward;
