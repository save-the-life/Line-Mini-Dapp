import './AIMenu.css';
import Images from '@/shared/assets/images';
import useMainPageStore from '@/shared/store/useMainPageStore';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect  } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import LoadingSpinner from '@/shared/components/ui/loadingSpinner';
import getMyslToken from '@/entities/Asset/api/getSL';
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface AIMenuProps {
  title: string;
  alt: string;
  image: string;
  onClick: () => void;
  className: string;
}

const AIMenus: React.FC<AIMenuProps> = ({
  title,
  alt,
  image,
  className,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-col rounded-3xl aspect-square items-center justify-center gap-3 ${
        className && className
      }`}
      onClick={onClick}
      >
      <img src={image} alt={alt} className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain" />
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm md:text-base lg:text-base font-semibold text-center px-2">{title}</p>
      </div>
    </div>
  );
};


const AIMenu: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const setSelectedMenu = useMainPageStore((state) => state.setSelectedMenu);
  const [slToken, setSlToken] = useState(0);
  const [loading, setLoading] = useState(true);

  // useEffect(()=>{
  //   const getMyTokenCount = async () => {
  //     try{
  //       const count = await getMyslToken();
  
  //       if(count){
  //         setSlToken(count.slCount);
  //       }else{
  //         // console.warn('Failed to fetch sl token count');
  //       }
  //     }catch(error:any){
  //       // console.error('Failed to fetch sl token count:', error);
  //     }finally {
  //       setLoading(false); // 로딩 종료
  //     }
  //   };
  //   getMyTokenCount();
  // }, []);

  // 모달 초기 상태를 LocalStorage 확인 후 설정
  // const [showModal, setShowModal] = useState(() => {
  //   return !localStorage.getItem('modalDisplayed');
  // });

  // const handleCloseModal = () => {
  //   playSfx(Audios.button_click);
  //   setShowModal(false);
  //   localStorage.setItem('modalDisplayed', 'true'); // 모달 표시 여부 기록
  // };

  // 각 메뉴 클릭 시 전역 상태 설정 후 반려동물 선택 페이지로 이동
  const handleMenuClick = (menu: 'x-ray' | 'ai-analysis' | 'records') => {
    // x-ray 또는 ai-analysis 선택 시 전역 상태에 저장 후 반려동물 선택 페이지로 이동
    setSelectedMenu(menu);
    playSfx(Audios.button_click);
    navigate('/select-pet');
  };

  // const handleMenuClick = (menu: 'x-ray' | 'ai-analysis' | 'records') => {
  //   // x-ray 또는 ai-analysis 선택 시 전역 상태에 저장 후 반려동물 선택 페이지로 이동
  //   if(slToken < 5 && menu === 'x-ray'){
    // playSfx(Audios.button_click);/
  //     setShowModal(true);
  //   } else if(slToken < 5 && menu === 'ai-analysis') {
    // playSfx(Audios.button_click);
  //     setShowModal(true);
  //   } else {
  //     setSelectedMenu(menu);
  //     navigate('/select-pet');
    // playSfx(Audios.button_click);
  //   }
  // };

  // if (loading) {
  //   // 로딩 중일 때는 로딩스피너만 보여줌
  //   return <LoadingSpinner className="h-screen"/>;
  // }

  return (
    <div className="flex flex-col text-white mx-6 md:mx-28 min-h-screen">
      {/* <div className="flex items-center w-full mt-8 relative">
        <img
          src={Images.SLToken}
          alt="Star"
          className="w-6 h-6 mr-2"
          />
        <p className="text-lg font-semibold mr-2">{slToken} SL</p>
      </div> */}

      <div className="grid grid-cols-2 gap-3 mt-6">
        {/* 실사진 진단 */}
        <AIMenus
          title={t("ai_page.AI_based_examination_for_pets")}
          image={Images.HomeTooth}
          alt="HomeTooth"
          className="follow-on-x-mission-card"
          onClick={() => handleMenuClick('ai-analysis')}
        />
        {/* x-ray 이미지 진단 */}
        <AIMenus
          title={t("ai_page.AI_based_dental_X_ray_analysis")}
          image={Images.HomeXray}
          alt="HomeXray"
          className="join-telegram-mission-card"
          onClick={() => handleMenuClick('x-ray')}
        />
        {/* 진단 목록 */}
        <AIMenus
          title={t("ai_page.Viewing_Records")}
          image={Images.HomeReport}
          alt="HomeReport"
          className="join-the-sl-Medium-mission-card"
          onClick={() => handleMenuClick('records')}
        />
        </div>
      <br /> <br /> <br /> <br />
      <br />


      {/* SL토큰 소요 알림 모달창 */}
      {/* {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full">
            <div className="bg-white text-black p-6 rounded-lg text-center w-[70%] max-w-[550px]">
                <p>{t("ai_page.5SL_tokens")}</p>
                <button
                    className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
                    onClick={handleCloseModal}
                    >
                    {t("OK")}
                </button>
            </div>
        </div>
      )} */}
    </div>
  );
};

export default AIMenu;
