// src/pages/RewardPage/index.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopTitle } from "@/shared/components/ui";
import "./Reward.css";
import Images from "@/shared/assets/images";
import { useRewardStore } from "@/entities/RewardPage/model/rewardModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import RewardItem from "@/widgets/RewardItem";
import api from "@/shared/api/axiosInstance";
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
  const event2 = new Date(2025, 5, 15);
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
  const currentRound =
    rankingProducts.length > 0 ? rankingProducts[0].round : null;

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
        navigate("/previous-ranking", {
          state: { round: currentRound - 1 },
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
      navigate("/previous-raffle");
    }
  };

  const handleCloseModal = () => {
    playSfx(Audios.button_click);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col text-white mb-44 w-full min-h-screen">
      {/* 나의 현재 상태 영역 */}
      <div className="flex flex-col justify-center items-center mb-14 px-6 md:px-0 mt-[76px]">
        <div
          className="w-full max-w-md rounded-3xl p-6"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            boxShadow:
              "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            borderRadius: "24px",
          }}
        >
          {/* 제목 */}
          <div className="text-center mb-6">
            <h2
              className="text-white text-lg font-semibold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              나의 현재 상태
            </h2>
          </div>

          {/* 2x2 그리드 레이아웃 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 주간 포인트 */}
            <div className="text-center">
              <p
                className="text-white text-sm mb-2"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                주간 포인트
              </p>
              <p
                className="text-[#FDE047] text-xl font-bold"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                15,420
              </p>
            </div>

            {/* 주간 순위 */}
            <div className="text-center">
              <p
                className="text-white text-sm mb-2"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                주간 순위
              </p>
              <p
                className="text-[#FDE047] text-xl font-bold"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                #47
              </p>
            </div>

            {/* 누적 포인트 */}
            <div className="text-center">
              <p
                className="text-white text-sm mb-2"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                누적 포인트
              </p>
              <p
                className="text-[#FDE047] text-xl font-bold"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                89,650
              </p>
            </div>

            {/* 누적 순위 */}
            <div className="text-center">
              <p
                className="text-white text-sm mb-2"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                누적 순위
              </p>
              <p
                className="text-[#FDE047] text-xl font-bold"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                #23
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 월간 보상 */}
      <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        {/* 제목 영역 */}
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <img
            src={Images.TrophyIcon}
            alt="gold-medal"
            className="absolute -top-2 -left-14 w-[60px] h-[60px] -z-10"
          />
          <h1
            className="z-30"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "30px",
              fontWeight: 400,
              color: "#FEE900",
              WebkitTextStroke: "1px #000000",
            }}
          >
            월간 보상
          </h1>
        </div>

        {/* 메인 콘텐츠 박스 */}
        <div
          className="w-full max-w-md rounded-3xl p-6 cursor-pointer"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            boxShadow:
              "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            borderRadius: "24px",
          }}
          onClick={handlePreviousRewardPage}
        >
          {/* 상단 영역 */}
          <div className="flex justify-between items-center mb-4">
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              매월 1등에게 특별 보상!
            </p>
            <p
              className="text-white text-sm"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              지난달 랭킹 &gt;
            </p>
          </div>

          {/* 하단 보상 금액 영역 */}
          <div
            className="w-full rounded-2xl p-4 text-center"
            style={{
              background: "linear-gradient(180deg, #4A90E2 0%, #357ABD 100%)",
              borderRadius: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              ₩10,000,000 + α
            </p>
          </div>
        </div>
      </div>

      {/* 주간 보상 */}
      <div className="flex flex-col gap-3 justify-center items-center mb-14 px-6 md:px-0">
        {/* 제목 영역 */}
        <div className="relative text-center font-jalnan text-3xl mb-6 z-10">
          <img
            src={Images.GoldMedalIcon}
            alt="gold-medal"
            className="absolute -top-2 -left-14 w-[60px] h-[60px] -z-10"
          />
          <h1
            className="z-30"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "30px",
              fontWeight: 700,
              color: "#FDE047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            주간 보상
          </h1>
        </div>

        {/* 보상 티어 리스트 */}
        <div className="w-full max-w-md">
          {/* 1등 보상 - 큰 박스 */}
          <div
            className="w-full rounded-2xl p-4 mb-3 flex justify-between items-center"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              borderRadius: "16px",
            }}
          >
            <span
              className="text-white text-lg font-bold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              1
            </span>
            <div className="flex items-center gap-2">
              <img
                src={Images.TossPoint}
                alt="toss-point"
                className="w-7 h-7"
                style={{ width: "28px", height: "28px" }}
              />
              <span
                className="text-white text-lg font-bold"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                100,000
              </span>
            </div>
          </div>

          {/* 나머지 보상 티어들 */}
          {[
            { rank: "2-10", reward: "10,000" },
            { rank: "11-100", reward: "1,000" },
            { rank: "101-1,000", reward: "100" },
            { rank: "1,001-100,000", reward: "1" },
          ].map((tier, idx) => (
            <div key={idx} className="w-full">
              {/* 구분선 */}
              {idx > 0 && (
                <div className="w-full h-px bg-gray-400 opacity-30 my-2"></div>
              )}

              {/* 보상 티어 */}
              <div className="w-full flex justify-between items-center py-2">
                <span
                  className="text-white text-base"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  {tier.rank}
                </span>
                <div className="flex items-center gap-2">
                  <img
                    src={Images.TossPoint}
                    alt="toss-point"
                    className="w-6 h-6"
                    style={{ width: "24px", height: "24px" }}
                  />
                  <span
                    className="text-white text-base"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {tier.reward}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More 버튼 */}
        <button
          onClick={handleShowMoreRanking}
          className="mt-6 px-6 py-3 rounded-full text-white text-sm font-semibold"
          style={{
            background: "rgba(128, 128, 128, 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          View More
        </button>
      </div>

      {/* 명예의 전당 영역 */}
      <div
        className="w-full max-w-md rounded-3xl p-6 cursor-pointer mx-auto"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          borderRadius: "24px",
        }}
        onClick={handlePreviousAirdropPage}
      >
        <div className="flex justify-between items-center">
          {/* 텍스트 영역 */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              명예의 전당
            </h2>
            <p
              className="text-white text-sm"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              역대 우승자를 확인하고
            </p>
            <p
              className="text-white text-sm"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              다음 회차 주인공에 도전하세요!
            </p>
          </div>

          {/* 아이콘 영역 */}
          <img
            src={Images.HallofFame}
            alt="hall-of-fame"
            className="w-[120px] h-[120px]"
            style={{ width: "120px", height: "120px" }}
          />
        </div>
      </div>

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
