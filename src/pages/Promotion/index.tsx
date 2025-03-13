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
    <div className="relative">
      <div className="bottom-10 absolute flex w-full self-center">
          <h2 className="font-semibold text-xl text-center mt-32 mb-4">
            Welcome! Here is your<br />
            Dapp Portal Promotion Reward!
          </h2>
          <img
            className='w-16 h-16 object-cover mb-4'
            src={Images.Promotion}>
          </img>
          <button
            className="h-14 bg-[#0147e5] text-white rounded-full w-full mx-6 opacity-100"
            onClick={handlePromotion}
            >
            Claim Now
          </button>
        </div>
    </div>
  );
};

export default Promotion;
