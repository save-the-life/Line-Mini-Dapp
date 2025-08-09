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
        className="w-[60px] h-[60px] min-[376px]:w-20 min-[376px]:h-20 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(180deg, #F43F5E 0%, #fff 100%)" }}
      >
        <img
          src={icon}
          alt={alt}
          className="w-9 h-9 min-[376px]:w-12 min-[376px]:h-12"
        />
      </div>
      {/* 등급 표시: 원형, 모바일 퍼스트 분기 */}
      <div className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] bg-[#F43F5E] w-[18px] h-[18px] min-[376px]:w-[22px] min-[376px]:h-[22px] rounded-full flex items-center justify-center">
        <span className="text-[5px] min-[376px]:text-[6px] font-bold text-white">
          1
        </span>
      </div>
    </div>
  );
}

interface OwnedItemCardProps {
  icon: string;
  alt: string;
  quantity: number;
  gradient: string;
}

function OwnedItemCard({ icon, alt, quantity, gradient }: OwnedItemCardProps) {
  return (
    <div
      className="relative rounded-2xl flex items-center justify-center shadow-md w-[72px] h-[72px] sm:w-[80px] sm:h-[80px]"
      style={{
        background: gradient,
        boxShadow:
          "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.2)",
      }}
    >
      <img src={icon} alt={alt} className="w-9 h-9 sm:w-10 sm:h-10" />
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-[#FF5E5E] w-[22px] h-[22px] rounded-full flex items-center justify-center">
        <span className="text-white text-[10px] font-bold">{quantity}</span>
      </div>
    </div>
  );
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const charactorImageSrc = location.state?.charactorImageSrc || Images.Cat1;

  const dummyItems: OwnedItemCardProps[] = [
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenRibbon,
      alt: "ribbon",
      quantity: 2,
      gradient: "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 100%)",
    },
  ];

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
            className="w-[200px] h-[200px] -translate-y-4"
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
        className="w-full h-[50vh] mx-6 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        }}
      >
        <div className="h-full w-full overflow-y-auto p-4 pb-28">
          <div
            className="text-center mb-3"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            내 아이템
          </div>
          <div className="grid grid-cols-4 gap-3 gap-y-4 justify-items-center">
            {dummyItems.map((item, index) => (
              <OwnedItemCard
                key={`${item.alt}-${index}`}
                icon={item.icon}
                alt={item.alt}
                quantity={item.quantity}
                gradient={item.gradient}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
