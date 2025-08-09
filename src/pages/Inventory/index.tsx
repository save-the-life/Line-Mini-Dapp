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
        className="w-20 h-20 max-[375px]:w-[60px] max-[375px]:h-[60px] rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(180deg, #F43F5E 0%, #fff 100%)" }}
      >
        <img
          src={icon}
          alt={alt}
          className="w-12 h-12 max-[375px]:w-9 max-[375px]:h-9"
        />
      </div>
      {/* 등급 표시: 원형, 초소형 화면 대응 */}
      <div className="absolute left-1/2 translate-x-[-50%] bottom-[-8px] bg-[#F43F5E] w-[22px] h-[22px] rounded-full flex items-center justify-center max-[360px]:w-[18px] max-[360px]:h-[18px] max-[360px]:bottom-[-6px]">
        <span className="text-[6px] font-bold text-white max-[360px]:text-[5px]">
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
          height: "50vh",
          minHeight: 200,
        }}
        className="w-full mx-6 flex flex-col"
      >
        <TopTitle title={"인벤토리"} back={false} />
        {/* 착용 중인 아이템 및 캐릭터 표시 영역 */}
        <div className="flex items-center justify-center flex-1 w-full">
          {/* 좌측 아이템 슬롯 */}
          <div className="flex flex-col gap-[100px] items-center">
            <ItemSlot icon={Images.CatGreenCrown} alt="crown" />
            <ItemSlot icon={Images.CatGreenBallon} alt="balloon" />
          </div>
          {/* 중앙 캐릭터 */}
          <img
            src={charactorImageSrc}
            alt="character"
            className="w-[200px] h-[200px]"
          />
          {/* 우측 아이템 슬롯 */}
          <div className="flex flex-col gap-[30px] items-center">
            <ItemSlot icon={Images.CatGreenMuffler} alt="muffler" />
            <ItemSlot icon={Images.CatGreenRibbon} alt="ribbon" />
            <ItemSlot icon={Images.CatGreenRibbon} alt="ribbon" />
          </div>
        </div>
      </div>

      {/* 보유 중인 아이템 목록 영역 */}
      <div
        className="w-full h-[50vh] mx-6"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        }}
      ></div>
    </div>
  );
};

export default Inventory;
