import React from "react";
import { useTranslation } from "react-i18next";
import { TopTitle } from "@/shared/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import Images from "@/shared/assets/images";

// 아이템 슬롯 컴포넌트: 아이콘과 하단 중앙 마름모 숫자(1) 표시
function ItemSlot({ icon, alt }: { icon: string; alt: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(180deg, #F43F5E 0%, #fff 100%)" }}
      >
        <img src={icon} alt={alt} className="w-12 h-12" />
      </div>
      {/* 마름모 등급 */}
      <div
        className="absolute"
        style={{
          left: "50%",
          bottom: "-5px",
          transform: "translateX(-50%) rotate(45deg)",
          background: "#F43F5E",
          width: "10px",
          height: "10px",
          border: "1pxs #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            transform: "rotate(-45deg)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "6px",
          }}
        >
          1
        </span>
      </div>
    </div>
  );
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const charactorImageSrc = location.state?.charactorImageSrc || Images.Cat1;

  return (
    <div className="flex flex-col items-center text-white relative min-h-screen">
      {/* 상단 40% (TopTitle 포함) */}
      <div
        style={{
          backgroundImage: `url(${Images.BackgroundHome})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          width: "100%",
          height: "45vh",
          minHeight: 200,
        }}
        className="w-full mx-6 flex flex-col"
      >
        <TopTitle title={"인벤토리"} back={false} />
        {/* 착용 중인 아이템 및 캐릭터 표시 영역 */}
        <div className="flex items-center justify-center flex-1 w-full">
          {/* 좌측 아이템 슬롯 */}
          <div className="flex flex-col gap-6 items-center">
            <ItemSlot icon={Images.CatGreenCrown} alt="crown" />
            <ItemSlot icon={Images.CatGreenBallon} alt="balloon" />
          </div>
          {/* 중앙 캐릭터 */}
          <img
            src={charactorImageSrc}
            alt="character"
            className="w-[200px] h-[200px] translate-y-4"
          />
          {/* 우측 아이템 슬롯 */}
          <div className="flex flex-col gap-6 items-center">
            <ItemSlot icon={Images.CatGreenMuffler} alt="muffler" />
            <ItemSlot icon={Images.CatGreenRibbon} alt="ribbon" />
            <ItemSlot icon={Images.CatGreenRibbon} alt="ribbon" />
          </div>
        </div>
      </div>

      {/* 보유 중인 아이템 목록 영역 */}
      <div
        className="w-full h-[55vh] mx-6"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        }}
      ></div>
    </div>
  );
};

export default Inventory;
