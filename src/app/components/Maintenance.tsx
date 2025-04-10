// src/components/Maintenance.tsx
import React, { useState } from 'react';
import Images from '@/shared/assets/images';
import { Dialog, DialogTitle, DialogContent,  } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";

const MaintenanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{
          backgroundImage: `url(${Images.DarkSplash})`,
      }}
    >
          <Dialog open={show}>
            <DialogTitle></DialogTitle>
            <DialogContent className="bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[70%]">
              <div className="relative">
              </div>
              <div className="flex flex-col items-center justify-around">
                <p className="text-xl font-bold text-white text-center">{t("dice_event.under")}</p>
                <img
                  src={Images.Pylon}
                  className="w-[100px] h-[100px] mt-8 mb-5 object-cover"
                />
                <p className="text-base font-semibold text-white text-center">
                  Temporary Maintenance
                </p>
                <p className="text-base font-semibold text-white text-center">
                  {t("dice_event.patience")}
                </p>
                <p className="text-sm font-semibold text-[#DD2726] text-center mt-2">
                  {t("dice_event.time")}
                </p>
                
                <button onClick={()=>setShow(false)} className="bg-[#0147E5] text-base font-medium rounded-full w-40 h-14 mt-5 mb-7">
                  {t("agree_page.close")}
                </button>
              </div>
            </DialogContent>
          </Dialog>
    </div>
  );
};

export default MaintenanceScreen;
