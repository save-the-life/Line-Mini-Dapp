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
    <div className="min-h-screen mb-20 flex-col items-center mx-6 relative ">
    <TopTitle title="명예의 전당" back={true} />

             {/* 메인 컨텐츠 */}
       <div className="px-4 py-6">
         {winners.map((winner, index) => (
           <div key={winner.round}>
             {index === 0 ? (
               // 가장 최근 회차 - 카드 형태
               <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-4">
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
             ) : (
               // 나머지 회차 - 경계선으로 구분
               <div className="py-3">
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
                 {/* 하단 경계선 */}
                 <div className="border-b border-gray-300 mt-3"></div>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};

export default HallofFame;