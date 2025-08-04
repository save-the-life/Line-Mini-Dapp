// src/pages/MissionPage.tsx
import React, { useEffect, useState } from "react";
import { TopTitle } from "@/shared/components/ui";
import "./MissionPage.css";
import Images from "@/shared/assets/images";
import missionImageMap from "@/shared/assets/images/missionImageMap";
import { missionNamesMap } from "./missionNameMap";
import { Link } from "react-router-dom";
import {
  useMissionStore,
  Mission,
} from "@/entities/Mission/model/missionModel";
import { formatNumber } from "@/shared/utils/formatNumber";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import { preloadImages } from "@/shared/utils/preloadImages";
import { useTranslation, Trans } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import Attendance from "@/widgets/Attendance";

interface OneTimeMissionCardProps {
  mission: Mission;
  onClear: (id: number) => void;
  onMissionCleared: (mission: Mission) => void;
}

const OneTimeMissionCard: React.FC<OneTimeMissionCardProps> = ({
  mission,
  onClear,
  onMissionCleared,
}) => {
  const mapping = missionImageMap[mission.name];
  const imageSrc = mapping ? Images[mapping.imageKey] : Images.TokenReward;
  const className = mapping ? mapping.className : "";
  const { t } = useTranslation();
  const { playSfx } = useSound();

  const translatedName = missionNamesMap[mission.name]
    ? t(missionNamesMap[mission.name])
    : mission.name;

  // PENDING 상태 체크 (오버레이 없이 클릭 기능 유지)
  const isPending = mission.status === "PENDING";

  const handleClick = () => {
    playSfx(Audios.button_click);
    if (!mission.isCleared) {
      if (mission.redirectUrl) {
        window.open(mission.redirectUrl, "_blank");
      }
      onClear(mission.id);
      onMissionCleared(mission);
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl h-36 items-center justify-center gap-3 cursor-pointer ${className} ${
        mission.isCleared ? "pointer-events-none" : ""
      }`}
      onClick={handleClick}
      role="button"
      aria-label={`Mission: ${mission.name}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      {/* 미션 완료된 경우에만 어둡게 처리 */}
      {mission.isCleared && (
        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
      )}

      <div className="relative flex flex-col items-center justify-center z-0">
        <img src={imageSrc} alt={mission.name} className="w-9 h-9" />
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium">{translatedName}</p>
          <p className="font-semibold text-sm flex flex-row items-center gap-1">
            +{mission.diceReward}{" "}
            <img src={Images.Dice} alt="dice" className="w-4 h-4" /> +
            {formatNumber(mission.starReward)}{" "}
            <img src={Images.Star} alt="star" className="w-4 h-4" />
          </p>
        </div>
      </div>

      {mission.isCleared && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
          <img
            src={Images.IconCheck}
            alt="Mission Completed"
            className="w-5 h-5"
          />
          <p>{t("mission_page.Completed")}</p>
        </div>
      )}
    </div>
  );
};

interface DailyMissionProps {
  title: string;
  image: string;
  alt: string;
}

const DailyMissionCard: React.FC<DailyMissionProps> = ({
  title,
  image,
  alt,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="basic-mission-card rounded-3xl p-5 flex flex-col items-center gap-4"
      style={{
        background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        borderRadius: "24px",
        boxShadow: "none",
      }}
    >
      {/* 상단 이미지 */}
      <img src={image} alt={alt} className="w-[100px] h-[100px] object-cover" />

      {/* 제목(Invite Friends) + 화살표(>) */}
      <div className="flex items-center text-xl font-semibold space-x-2">
        <p>{title}</p>
        <p>{">"}</p>
      </div>

      {/* 상세 텍스트 영역 */}
      <div className="flex flex-col text-center item-center gap-2">
        {/* 1) +10,000 Star Points 메시지 */}
        <div>
          <span
            className="mr-1"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            1) 초대한 친구와 나, 모두에게
          </span>
          <span
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#FDE047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            +10,000 스타포인트!
          </span>
        </div>

        {/* 2) 10% Payback 메시지 */}
        <div>
          <span
            className="mr-1"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            2) 친구가 결제하면, 나는
          </span>
          <span
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#FDE047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            10% 페이백!
          </span>
        </div>

        {/* NOTE 영역 */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <img src={Images.Note} alt="Note" className="w-5 h-5 object-cover" />
          <p
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FDE047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            NOTE
          </p>
        </div>
        <p
          className="text-center"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          1회 이상 주사위 굴린 유저만 유효 참여자로 인정되며, 보상을 받을 수
          있습니다.
        </p>
      </div>
    </div>
  );
};

const MissionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const { missions, fetchMissions, clearMission } = useMissionStore();

  // 보상 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{
    diceReward: number;
    starReward: number;
    amount?: number;
    spinType: string;
  } | null>(null);

  // 로컬 스토리지에서 보상 표시된 미션 ID를 초기화
  const [rewardShownMissions, setRewardShownMissions] = useState<number[]>(
    () => {
      const stored = localStorage.getItem("rewardShownMissions");
      return stored ? JSON.parse(stored) : [];
    }
  );

  const mappedImages = Object.values(missionImageMap).flatMap((item) =>
    Images[item.imageKey] ? [Images[item.imageKey]] : []
  );

  const imagesToLoad = [
    Images.IconCheck,
    Images.TokenReward,
    Images.LargeTwitter,
    Images.Star,
    Images.Dice,
    Images.InviteFriend,
    ...mappedImages,
  ];

  useEffect(() => {
    const loadAllImages = async () => {
      try {
        await preloadImages(imagesToLoad);
      } catch (error) {
        // console.error("이미지 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllImages();
  }, [imagesToLoad]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // 미션 클리어 시 보상 처리 (이미 보상 모달이 표시된 미션은 건너뜁니다)
  const handleMissionCleared = (mission: Mission) => {
    if (rewardShownMissions.includes(mission.id)) {
      return;
    }
    setRewardData({
      diceReward: mission.diceReward,
      starReward: mission.starReward,
      spinType: "MISSION",
    });
    // setIsDialogOpen(true);
    // 상태와 로컬 스토리지에 미션 ID 추가
    setRewardShownMissions((prev) => {
      const updated = [...prev, mission.id];
      localStorage.setItem("rewardShownMissions", JSON.stringify(updated));
      return updated;
    });
  };

  // const handleCloseDialog = () => {
  //   playSfx(Audios.button_click);
  //   setIsDialogOpen(false);
  //   setRewardData(null);
  // };

  const handleClearMission = async (id: number) => {
    await clearMission(id);
    const clearedMission = missions.find((m) => m.id === id);
    if (clearedMission) {
      handleMissionCleared(clearedMission);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  const incompleteMissions = missions.filter(
    (m) => !m.isCleared && m.type !== "KAIA"
  );
  const completedMissions = missions.filter(
    (m) => m.isCleared && m.type !== "KAIA"
  );

  return (
    <div className="flex flex-col text-white mb-20 md:mb-96 min-h-screen">
      <TopTitle title="미션" />

      {/* 출석 위젯 */}
      <h1
        className="text-center ml-7"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        일일 출석
      </h1>
      <div className="mx-6">
        <Attendance />
      </div>

      {/* 미완료 미션 */}
      {incompleteMissions.length > 0 && (
        <>
          <h1
            className="text-center mb-4 ml-7 mt-5"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            원타임 미션
          </h1>
          <div className="grid grid-cols-2 gap-3 mx-6">
            {incompleteMissions.map((mission) => {
              if (mission.name !== "Leave a Supportive Comment on SL X") {
                return (
                  <OneTimeMissionCard
                    key={mission.id}
                    mission={mission}
                    onClear={handleClearMission}
                    onMissionCleared={handleMissionCleared}
                  />
                );
              } else {
                const translatedName = missionNamesMap[mission.name]
                  ? t(missionNamesMap[mission.name])
                  : mission.name;
                return (
                  <div className="col-span-2" key={mission.id}>
                    <div
                      className={`basic-mission-card h-36 rounded-3xl flex flex-row items-center pl-8 pr-5 justify-between relative cursor-pointer ${
                        mission.isCleared ? "pointer-events-none" : ""
                      }`}
                      onClick={() => {
                        playSfx(Audios.button_click);
                        if (!mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                      role="button"
                      aria-label={`Mission: ${mission.name}`}
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                    >
                      {mission.isCleared && (
                        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
                      )}
                      <div className="relative flex flex-row items-center justify-between z-0 w-full">
                        <div className="md:space-y-3">
                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "12px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            {translatedName}
                          </p>
                          <p
                            className="flex flex-row items-center gap-1 mt-2"
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            +{mission.diceReward}{" "}
                            <img
                              src={Images.Dice}
                              alt="dice"
                              className="w-5 h-5"
                            />
                            &nbsp; +{formatNumber(mission.starReward)}{" "}
                            <img
                              src={Images.Star}
                              alt="star"
                              className="w-5 h-5"
                            />
                          </p>
                        </div>
                        <img
                          src={Images.LargeTwitter}
                          alt="Large Twitter"
                          className="w-20 h-20"
                        />
                      </div>
                      {mission.isCleared && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
                          <img
                            src={Images.IconCheck}
                            alt="Mission Completed"
                            className="w-5 h-5"
                          />

                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "18px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            완료
                          </p>
                        </div>
                      )}
                    </div>
                    <p
                      className="text-xs mb-8 mt-2 whitespace-nowrap"
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#FFFFFF",
                        WebkitTextStroke: "1px #000000",
                      }}
                    >
                      * 미션을 정상적으로 수행하지 않을 경우 최종 보상에서
                      제외될 수 있습니다.
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}

      {/* 일일 미션 */}
      <h1
        className="text-center my-4 ml-7"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        일일 미션
      </h1>
      <div className="mx-6 mb-8">
        <Link to="/invite-friends" onClick={() => playSfx(Audios.button_click)}>
          <DailyMissionCard
            title="친구 초대"
            alt="Invite Friend"
            image={Images.InviteFriends}
          />
        </Link>
      </div>

      {/* 완료된 미션 */}
      {completedMissions.length > 0 && (
        <>
          <h1
            className="text-center mb-4 ml-7"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            미션 완료
          </h1>
          <div className="grid grid-cols-2 gap-3 mx-6">
            {completedMissions.map((mission) => {
              if (mission.name !== "Leave a Supportive Comment on SL X") {
                return (
                  <OneTimeMissionCard
                    key={mission.id}
                    mission={mission}
                    onClear={handleClearMission}
                    onMissionCleared={handleMissionCleared}
                  />
                );
              } else {
                const translatedName = missionNamesMap[mission.name]
                  ? t(missionNamesMap[mission.name])
                  : mission.name;
                return (
                  <div className="col-span-2" key={mission.id}>
                    <div
                      className={`basic-mission-card h-36 rounded-3xl flex flex-row items-center pl-8 pr-5 justify-between relative cursor-pointer ${
                        mission.isCleared ? "pointer-events-none" : ""
                      }`}
                      onClick={() => {
                        playSfx(Audios.button_click);
                        if (!mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                      role="button"
                      aria-label={`Mission: ${mission.name}`}
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !mission.isCleared) {
                          if (mission.redirectUrl) {
                            window.open(mission.redirectUrl, "_blank");
                          }
                          handleClearMission(mission.id);
                        }
                      }}
                    >
                      {mission.isCleared && (
                        <div className="absolute inset-0 bg-gray-950 bg-opacity-60 rounded-3xl z-10" />
                      )}
                      <div className="relative flex flex-row items-center justify-between z-0 w-full">
                        <div className="md:space-y-3">
                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "12px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            {translatedName}
                          </p>
                          <p
                            className="flex flex-row items-center gap-1 mt-2"
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            +{mission.diceReward}{" "}
                            <img
                              src={Images.Dice}
                              alt="dice"
                              className="w-5 h-5"
                            />
                            &nbsp; +{formatNumber(mission.starReward)}{" "}
                            <img
                              src={Images.Star}
                              alt="star"
                              className="w-5 h-5"
                            />
                          </p>
                        </div>
                        <img
                          src={Images.LargeTwitter}
                          alt="Large Twitter"
                          className="w-20 h-20"
                        />
                      </div>
                      {mission.isCleared && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold rounded-full px-4 py-2 z-20 flex items-center justify-center gap-2">
                          <img
                            src={Images.IconCheck}
                            alt="Mission Completed"
                            className="w-5 h-5"
                          />
                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "18px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            완료
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}

      <div className="my-10"></div>
    </div>
  );
};

export default MissionPage;
