import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaCaretDown, FaCaretUp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TopTitle } from "@/shared/components/ui";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// ★ API 호출 함수
import getRewardsHistory from "@/entities/Asset/api/getRewardsHistory";
import { format } from "date-fns";

const RewardHistory: React.FC = () => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  // 필터 드롭다운 열림 상태
  const [isOpen, setIsOpen] = useState(false);
  // 필터링
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedChange, setSelectedChange] = useState<string | null>(null);

  // 날짜 필터
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 서버 응답 데이터
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  // 필터 상태가 변할 때마다 페이지 0부터 재조회
  useEffect(() => {
    fetchRewards(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, selectedChange, startDate, endDate]);

  useEffect(() => {
    fetchRewards(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API 호출
  const fetchRewards = async (page: number, replace = false) => {
    try {
      // 필터 값 매핑
      const assetTypeForApi = selectedAsset; // SL, USDT, STAR
      let changeTypeForApi: string | null = null;
      if (selectedChange === "INCREASE") {
        changeTypeForApi = "REWARD";
      } else if (selectedChange === "DECREASE") {
        changeTypeForApi = "USE";
      }

      const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : null;
      const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : null;

      const data = await getRewardsHistory(
        assetTypeForApi,
        changeTypeForApi,
        startDateStr,
        endDateStr,
        page
      );

      const newList = data.content || [];
      const currentPage = data.number ?? page;
      const last = data.last ?? true;

      setRewardHistory((prev) => (replace ? newList : [...prev, ...newList]));
      setPageNumber(currentPage);
      setIsLastPage(last);
    } catch (error) {
      // console.error("Failed to fetch reward history:", error);
    }
  };

  // 자산 라디오 버튼 핸들러
  const handleAssetChange = (asset: string) => {
    playSfx(Audios.button_click);
    if (asset === "전체") {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  // 증감 라디오 버튼 핸들러
  const handleChangeType = (change: string) => {
    playSfx(Audios.button_click);
    if (change === "전체") {
      setSelectedChange(null);
    } else {
      setSelectedChange(change);
    }
  };

  // 날짜 선택
  const handleStartDateChange = (date: Date | null) => {
    playSfx(Audios.button_click);
    setStartDate(date);
    if (endDate && date && date > endDate) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    playSfx(Audios.button_click);
    setEndDate(date);
  };

  // 더보기 버튼
  const handleLoadMore = () => {
    playSfx(Audios.button_click);
    fetchRewards(pageNumber + 1, false);
  };

  // 보상 내역 표시용 변환 (STAR → POINT, REWARD → INCREASE, USE → DECREASE) 및 번역 키 매핑
  const displayHistory = rewardHistory.map((reward) => {
    const displayAsset =
      reward.currencyType === "STAR" ? "POINT" : reward.currencyType;
    const displayChangeType =
      reward.changeType === "REWARD" ? "INCREASE" : "DECREASE";
    let contentKey = "";
    switch (reward.content) {
      case "Dice Game Reward":
        contentKey = "dice_game_reward";
        break;
      case "Level Up":
        contentKey = "level_up";
        break;
      case "Monthly Ranking Compensation":
        contentKey = "monthly_ranking_compensation";
        break;
      case "Spin Game Reward":
        contentKey = "spin_game_reward";
        break;
      case "Daily Attendance Reward":
        contentKey = "daily_attendance_reward";
        break;
      case "RPS Game Win":
        contentKey = "rps_game_win";
        break;
      case "Follow on X":
        contentKey = "follow_on_x";
        break;
      case "Join Telegram":
        contentKey = "join_telegram";
        break;
      case "Subscribe to Email":
        contentKey = "subscribe_to_email";
        break;
      case "Follow on Medium":
        contentKey = "follow_on_Medium";
        break;
      case "Leave a Supportive Comment on SL X":
        contentKey = "leave_supportive_comment";
        break;
      case "Join LuckyDice Star Reward":
        contentKey = "join_lucky_dice";
        break;
      case "Monthly Raffle Compensationd":
        contentKey = "monthly_raffle_compensation";
        break;
      case "Get Point Reward":
        contentKey = "get_point_reward";
        break;
      case "Join LuckyDice SL Reward":
        contentKey = "join_lucky_sl";
        break;
      case "Get Promotion Reward":
        contentKey = "promotion_reward";
        break;
      case "Invite a Friend Reward":
        contentKey = "invite_friend_reward";
        break;
      case "RPS Game Betting":
        contentKey = "rps_game_betting";
        break;
      case "Mystery Gift":
        contentKey = "mystery_gift";
        break;
      case "1st Ranking Awards":
        contentKey = "1st_awards";
        break;
      case "AI Examination":
        contentKey = "ai_exam";
        break;
      case "1st Raffle Awards":
        contentKey = "1st_raffle";
        break;
      case "Request Claim":
        contentKey = "request_claim";
        break;
      case "Shop Purchase":
        contentKey = "shop_purchase";
        break;
      case "2nd Ranking Awards":
        contentKey = "2nd_awards";
        break;
      case "3rd Ranking Awards":
        contentKey = "3rd_awards";
        break;
      default:
        contentKey = reward.content;
    }
    return { ...reward, displayAsset, displayChangeType, contentKey };
  });

  // DatePicker용 Custom Input
  const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, placeholder }, ref) => (
      <div
        className="flex items-center w-full px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer focus:ring focus:ring-blue-500"
        onClick={onClick}
      >
        <input
          ref={ref}
          value={value}
          readOnly
          placeholder={placeholder}
          className="bg-transparent outline-none w-full text-white"
        />
        <FaCalendarAlt className="text-white ml-2" />
      </div>
    )
  );
  CustomDateInput.displayName = "CustomDateInput";

  return (
    <div className="flex flex-col mb-32 px-6 min-h-screen">
      <TopTitle title="보상 내역" back={true} />

      {/* 보상 내역 리스트 */}
      <div className="w-full mt-3">
        <div>
          {displayHistory.length > 0 ? (
            displayHistory.map((reward, index) => (
              <div
                key={`${reward.loggedAt}-${index}`}
                className="flex justify-between items-center py-4 border-b border-[#35383F]"
              >
                <div>
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {t(`reward_page.${reward.contentKey}`)}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {reward.loggedAt}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={`${
                      reward.displayChangeType === "INCREASE"
                        ? "text-[#ABEE7D]"
                        : "text-[#DD2726]"
                    }`}
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {reward.displayChangeType === "INCREASE" ? "+" : "-"}
                    {reward.amount} {reward.displayAsset}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              아직 기록이 없습니다.
            </p>
          )}

          {/* 더보기 버튼 */}
          {!isLastPage && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-[#3B82F6] rounded-md"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                더 불러오기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardHistory;
