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
    drawAwards,
    airDropAwards,
    rank,
    isLoadingHome,
    errorHome,
  } = useRewardStore();

  const [showMoreRanking, setShowMoreRanking] = useState(false);
  // const [showMoreRaffle, setShowMoreRaffle] = useState(false);

  const [showModal, setShowModal] = useState(false);

  
  // 날짜 포맷 및 번역
  const dateFormat = t("date_format_md");
  const event2 = new Date(2025, 3, 14);
  const event3 = new Date(2025, 3, 28);
  const event4 = new Date(2025, 4, 15);

  useEffect(() => {
    fetchLeaderHome();
  }, [fetchLeaderHome]);

  if (isLoadingHome ) {
    return <LoadingSpinner className="h-screen"/>;
  }

  if (errorHome) {
    return <div className="text-center text-red-500">Error: {errorHome}</div>;
  }

  const rankingProducts = rankingAwards.slice(0, 3); 
  const rankingOthers = rankingAwards.slice(3); 
  const currentRound = rankingProducts.length > 0 ? rankingProducts[0].round : null;
  const nextRound = currentRound !== null ? currentRound + 1 : null;

  // const raffleProducts = drawAwards.slice(0, 3); 
  // const raffleOthers = drawAwards.slice(3); 

  // const truncateString = (str: string, num: number): string => {
  //   if (str.length <= num) {
  //     return str;
  //   }
  //   return str.slice(0, num) + '...';
  // };

  const handleShowMoreRanking = () => {
    playSfx(Audios.button_click);
    setShowMoreRanking(true);
  }

  // const handleShowMoreRaffle = () => {
  //   playSfx(Audios.button_click);
  //   setShowMoreRaffle(true);
  // }

  const handlePreviousRewardPage = async() => {
    playSfx(Audios.button_click);

    const response = await api.get("/leader/ranking/initial");
    if(response.data.data === null) {
      setShowModal(true);
    } else {
      navigate('/previous-ranking');
    }
  }

  
  // const handlePreviousAirdropPage = async() => {
  //   playSfx(Audios.button_click);

  //   const response = await api.get("/leader/ranking/initial");
  //   if(response.data.data === null) {
  //     setShowModal(true);
  //   } else {
  //     navigate('/previous-raffle');
  //   }
  // }


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
            <p className="text-xs font-normal text-white text-center">{currentRound} {t("reward_page.this_month")}</p>
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ranking_rewards")}</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ends_on")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event2).format(dateFormat)}</p>
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
            <p className="text-xs font-normal text-white text-center">{t("reward_page.raffle_draw")}</p>
            <p className="text-xs font-normal text-white text-center">(USDT/KAIA)</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.schedule")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event3).format(dateFormat)}</p>
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
            <p className="text-xs font-normal text-white text-center">{nextRound} {t("reward_page.this_month")}</p>
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ranking_rewards")}</p>
            <img 
              className="w-4 h-4"
              src={Images.RedTriangle}
              alt="Red Triangle"
            />
            <p className="text-xs font-normal text-white text-center">{t("reward_page.ends_on")}</p>
            <p className="text-base font-semibold text-white text-center">{moment(event4).format(dateFormat)}</p>
          </div>

        </div>
      </div>
      <p className="mt-1 ml-1 text-xs font-normal text-white">* {t("reward_page.all_events")}</p>

      {/* 지난 달 보상 확인 */}
      <div 
        className="first-to-third-pace-box h-36 rounded-3xl mt-5 mb-14 flex flex-row items-center justify-around p-5 cursor-pointer px-6 md:px-0 mx-6"
        onClick={handlePreviousRewardPage}>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">{t("reward_page.previous")}</p>
          <p className="text-sm">
            {t("reward_page.see_ranking_reward")}
          </p>
        </div>
        <img src={Images.Trophy} alt="trophy" className="w-24 h-24" />
      </div>

      {/** 이번달 경품 보여주기 */}
      <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        {/* This Month's Ranking Awards */}
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <h1 className="z-30">
            {currentRound} {t("reward_page.this_month")}
            <br />
            {t("reward_page.awards")}
          </h1>
          <img
            src={Images.GoldMedal}
            alt="gold-medal"
            className="absolute -top-1 -left-11 w-[70px] h-[70px] -z-10"
          />
        </div>

        {/* 상위 3위 랭킹 보상 */}
        {rankingProducts.map((award, index) =>
          <RewardItem
            key={`${award.rangeStart}-${award.rangeEnd}-${index}`}
            rank={index + 1}
            award={award}
            isTop={true}
          />
        )}

        {/* AnimatePresence로 4위 이후 랭킹 보상 슬라이드 인 애니메이션 */}
        <AnimatePresence>
          {showMoreRanking && rankingOthers.map((award, index) => (
            <motion.div
              key={`${award.rangeStart}-${award.rangeEnd}-${index}`}
              className="w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RewardItem
                rank={award.rangeStart === award.rangeEnd ? award.rangeStart : `${award.rangeStart}-${award.rangeEnd}`}
                award={award}
                isTop={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {rankingOthers.length > 0 && !showMoreRanking && (
          <button
            onClick={handleShowMoreRanking}
            className="border border-[#ffffff] text-white text-xs font-semibold px-4 py-2 rounded-full mt-4"
          >
            {t("reward_page.view_more")}
          </button>
        )}
      </div>

      {/* 래플-에어드랍 영역 */}
      {/* <div 
        className="first-to-third-pace-box h-36 rounded-3xl mb-14 flex flex-row items-center justify-around p-5 cursor-pointer"
        onClick={handlePreviousAirdropPage}>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">{t("reward_page.raffle_airdrop")}</p>
          <p className="text-sm">
            {t("reward_page.Check_winner")}
          </p>
        </div>
        <img src={Images.airDropBox} alt="trophy" className="w-24 h-24" />
      </div> */}

      {/** 지난 에어드랍 경품 보여주기 */}
      {/* <div className="flex flex-col gap-3 justify-center items-center mb-14">
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <h1 className="z-30">
            {t("reward_page.this_month")}
            <br />
            {t("reward_page.air_drop")}
          </h1>
          <img
            src={Images.LotteryTicket}
            alt="Raffle"
            className="absolute -top-1 -right-12 w-[68px] h-[68px] -z-10"
          />
        </div> */}
      
        {/* 상위 3위 래플 보상 */}
        {/* {raffleProducts.map((award, index) =>
          <RewardItem
            key={`${award.rangeStart}-${award.rangeEnd}-${index}`}
            rank={index + 1}
            award={award}
            isTop={true}
          />
        )} */}

        {/* AnimatePresence로 4위 이후 래플 보상 슬라이드 인 애니메이션 */}
        {/* <AnimatePresence>
          {showMoreRaffle && raffleOthers.map((award, index) => (
            <motion.div
              key={`${award.rangeStart}-${award.rangeEnd}-${index}`}
              className="w-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RewardItem
                rank={award.rangeStart === award.rangeEnd ? award.rangeStart : `${award.rangeStart}-${award.rangeEnd}`}
                award={award}
                isTop={false}
              />
            </motion.div>
          ))}
        </AnimatePresence> */}

        {/* {raffleOthers.length > 0 && !showMoreRaffle && (
          <button
            onClick={handleShowMoreRaffle}
            className="border border-[#ffffff] text-white text-xs font-semibold px-4 py-2 rounded-full mt-4"
          >
            {t("reward_page.view_more")}
          </button>
        )}
      
      </div> */}

      {/** 이번달 에어드랍 보상 : 있는 경우만 보여주기 */}
      {/* {airDropAwards && airDropAwards.length > 0 && (
        <div className="flex flex-col gap-3 justify-center items-center mb-14 text-sm font-medium">
          <div className="relative text-center font-jalnan text-3xl z-10">
            <h1 className="z-30">
            {t("reward_page.this_month")}
            <br />
            {t("reward_page.air_drop")}
            </h1>
            <img
              src={Images.AirDrop}
              alt="Airdrop"
              className="absolute -top-1 -left-[64px] w-[70px] h-[70px] -z-10"
            />
          </div>
          <div className="w-full">
            {airDropAwards.map((award, index) => (
              <div
                key={`airdrop-${award.winnerNum}-${index}`}
                className="flex flex-row justify-between py-5 border-b border-[#e5e5e5] w-full"
              >
                <p>
                  {award.winnerNum
                    ? award.winnerNum === 1
                      ? "Grand Prize Winner"
                      : award.winnerNum <= 5
                        ? "Top 5 Winners"
                        : award.winnerNum <= 10
                          ? "Lucky 10 Winners"
                          : "Active Participants"
                    : "Active Participants"}
                </p>
                <div className="flex flex-row gap-1 items-center">
                  <img src={Images.TokenReward} alt="token-reward" className="w-6 h-6" />
                  <p>{formatNumber(award.slRewards)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

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
