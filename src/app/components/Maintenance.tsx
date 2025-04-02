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
            <DialogContent className="bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[70%] md:max-w-lg max-h-[80%]">
              <div className="relative">
              </div>
              <div className="flex flex-col items-center justify-around">
                <p className="text-xl font-bold text-white text-center">Under Maintenance</p>
                <img
                  src={Images.Pylon}
                  className="w-[100px] h-[100px] mt-8 object-cover"
                />
                <p className="text-base font-semibold text-white text-center">
                  We are currently performing maintenanceto improve your experience.
                </p>
                <p className="text-base font-semibold text-white text-center">
                  Thank you for your patience.
                </p>
                <p className="text-sm font-semibold text-[#DD2726] text-center mt-2">
                  [Maintenance Time]
                </p>
                <p className="text-sm font-semibold text-[#DD2726] text-center mt-2">
                  April 2, 2025, 02:00 PM – 04:00 PM (KST)
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
