import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import Images from '@/shared/assets/images';
import { Trans } from 'react-i18next';

const Promotion: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const message = t("dice_event.welcome_message");
  
  const handlePromotion = () => {
    navigate("/dice-event");
  }

  return (
    <div className="flex flex-col text-white mb-32 px-6 min-h-screen">
      <h2 className="font-semibold text-xl text-center mt-32 mb-4">
        <Trans i18nKey="dice_event.welcome_message" components={{ 1: <br /> }} />
      </h2>
      <img
        className='w-32 h-32 object-cover mt-10 mb-4 mx-auto'
        src={Images.Promotion}
        alt="Promotion" />
      <button
        className="fixed h-14 bg-[#0147e5] text-white rounded-full left-6 right-6 bottom-8"
        onClick={handlePromotion}
      >
        {t("dice_event.claim")}
      </button>
    </div>
  );
};

export default Promotion;
