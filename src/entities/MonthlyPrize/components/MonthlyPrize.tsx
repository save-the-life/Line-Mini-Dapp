import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Images from '@/shared/assets/images';
import { formatNumber } from '@/shared/utils/formatNumber';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useNavigationStore } from '@/shared/store/navigationStore';
import { Snowfall } from 'react-snowfall';
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface MonthlyPrizeProps {
  month: number;            
  prizeType: string;        
  amount: number;           
  eventFinishTime: string;  
}

const MonthlyPrize: React.FC<MonthlyPrizeProps> = ({
  month,
  prizeType,
  amount,
  eventFinishTime,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const setSelected = useNavigationStore((state) => state.setSelected);

  // 월 이름 배열
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // 남은 시간 표시용 state
  const [timeLeft, setTimeLeft] = useState('');

  // "눈 표시 여부" 관리
  const [showSnow, setShowSnow] = useState(false);

  // 10초 간격으로 2초 동안 눈이 내리고, 8초 쉬는 로직
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // 눈 내림 시작
  //     setShowSnow(true);

  //     // 3초 뒤 멈춤
  //     setTimeout(() => {
  //       setShowSnow(false);
  //     }, 3000);
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  // 카운트다운 업데이트
  useEffect(() => {
    const endDate = new Date(eventFinishTime);

    const updateCountdown = () => {
      const now = Date.now();
      const distance = endDate.getTime() - now;
      if (distance < 0) {
        setTimeLeft('Event has ended');
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);

      setTimeLeft(`Time Left: ${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [eventFinishTime]);

  // 클릭 -> /reward
  const handleRankingClick = () => {
    playSfx(Audios.button_click);
    setSelected('/reward');
    if (window.location.pathname !== '/reward') {
      navigate('/reward');
    }
  };

  // Snowfall에 쓸 이미지
  const slTokenImage = new Image();
  slTokenImage.src = Images.TokenReward;
  const usdtImage = new Image();
  usdtImage.src = Images.USDT;
  const images = [slTokenImage, usdtImage];

  return (
    <div
      onClick={handleRankingClick}
      className="
        relative z-10 flex flex-col items-center justify-center
        w-48 h-36 md:w-[340px] md:h-44
        text-white border-2 border-[#BBA361] rounded-3xl
        overflow-visible gap-1 bg-neutral-900 
      "
    >
      
      <div className="flex flex-col items-center text-center">
        <p className="font-semibold text-base text-center">이번 주 보상</p>
      </div>

      {/* 메인 상품 이미지 */}
      <motion.img
        src={Images.PrizeImage}
        alt="token logo"
        className="h-14 mt-2"
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* 상품 정보 */}
      <div className="flex flex-col items-center text-center">
        <p className="font-semibold text-base text-center">Toss Point</p>
        <p className="text-xs font-normal">(총 100만원 상당당)</p>
      </div>
    </div>
  );
};

export default MonthlyPrize;
