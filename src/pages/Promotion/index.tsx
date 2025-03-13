import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import Images from '@/shared/assets/images';

const Promotion: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handlePromotion = () => {
    navigate("/dice-event");
  }

  return (
    <div className="flex flex-col text-white mb-32 px-6 min-h-screen">
      <h2 className="font-semibold text-xl text-center mt-32 mb-4">
        Welcome! Here is your<br />
        Dapp Portal Promotion Reward!
      </h2>
      <img
        className='w-32 h-32 object-cover mt-10 mb-4 mx-auto'
        src={Images.Promotion}
        alt="Promotion" />
      <button
        className="fixed h-14 bg-[#0147e5] text-white rounded-full left-6 right-6 bottom-8"
        onClick={handlePromotion}
      >
        Claim Now
      </button>
    </div>
  );
};

export default Promotion;
