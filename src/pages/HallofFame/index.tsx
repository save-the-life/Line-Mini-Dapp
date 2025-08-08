import React from "react";
import { TopTitle } from "@/shared/components/ui";
import Images from "@/shared/assets/images";

// 더미 데이터 타입 정의
interface WinnerData {
  round: number;
  username: string;
  reward: number;
  characterImage: string;
}

// 더미 데이터 생성
const generateDummyData = (): WinnerData[] => {
  const data: WinnerData[] = [];
  for (let i = 7; i >= 2; i--) {
    data.push({
      round: i,
      username: "User-23456",
      reward: 9000000,
      characterImage: i % 2 === 0 ? Images.DogSmile : Images.CatSmile, // 짝수는 강아지, 홀수는 고양이
    });
  }
  return data;
};

const HallofFame: React.FC = () => {
  const winners = generateDummyData();

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm">
        <TopTitle title="명예의 전당" back={true} />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-4 py-6 space-y-4">
        {winners.map((winner, index) => (
          <div
            key={winner.round}
            className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 ${
              index === 0 ? "ring-2 ring-yellow-400 shadow-lg" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              {/* 캐릭터 이미지와 사용자 정보 */}
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={winner.characterImage}
                    alt={`Round ${winner.round} Winner`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-800">
                    {winner.round}회차 우승자
                  </span>
                  <span className="text-sm text-gray-600">{winner.username}</span>
                </div>
              </div>

              {/* 보상 정보 */}
              <div className="bg-blue-600 rounded-xl px-3 py-2 flex items-center space-x-2">
                <img
                  src={Images.Star}
                  alt="Star"
                  className="w-5 h-5"
                />
                <span className="text-white font-bold text-lg">
                  {formatNumber(winner.reward)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallofFame;