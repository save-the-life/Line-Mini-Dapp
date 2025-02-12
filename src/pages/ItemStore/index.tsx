import React, { useState, useEffect, useMemo } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import Images from "@/shared/assets/images";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import paymentSession from "@/entities/Asset/api/payment";
import getItemInfo from "@/entities/Asset/api/getItemInfo";
import getPaymentStatus from "@/entities/Asset/api/getPaymentStatus";
import { kaiaGetBalance, KaiaRpcResponse } from "@/entities/Asset/api/getKaiaBalance";
import { HiX } from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui";
import { BigNumber, ethers } from "ethers";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";

const nftCollection = [
  {
    id: "auto",
    name: "Auto Item",
    image: Images.AutoNFT,
  },
  {
    id: "booster",
    name: "Reward Booster(5x)",
    image: Images.RewardNFT,
  },
];

const ItemStore: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [agreeEncrypted, setAgreeEncrypted] = useState(false);
  const [balance, setBalance] = useState<string>("");
  const [itemData, setItemData] = useState<any[]>([]);

  const isEnabled = selectedItem !== null && agreeRefund && agreeEncrypted;

  useEffect(() => {
    const getItems = async () => {
      try {
        // 아이템 정보 조회 api
        const items = await getItemInfo();
        if (items) {
          console.log("아이템 정보 확인", items);
          setItemData(items);
        } else {
          console.log("아이템 정보 실패", items);
        }

        // 지갑 잔고 조회 api
        const response: KaiaRpcResponse<string> = await kaiaGetBalance(
          "0xf80fF1B467Ce45100A1E2dB89d25F1b78c0d22af"
        );

        if (response.error) {
          console.log("잔고 확인 에러: ", response.error);
        } else if (response.result) {
          const rawBalanceHex = response.result;
          const KAIA_DECIMALS = 18;
          const balanceBigNumber = BigNumber.from(rawBalanceHex);
          const formattedBalance = ethers.utils.formatUnits(balanceBigNumber, KAIA_DECIMALS);
          setBalance(Number(formattedBalance).toFixed(4));
        }
      } catch (err: any) {
        console.error("Failed to fetch sl token count:", err);
      }
    };
    getItems();
  }, []);

  // 뒤로 가기 버튼
  const handleBackClick = () => {
    playSfx(Audios.button_click);
    navigate(-1);
  };

  // 아이템 선택
  const handleSelectItem = (itemId: string) => {
    playSfx(Audios.button_click);
    setSelectedItem(itemId);
  };

  // 공통 결제 처리 함수 (paymentMethod: "STRIPE" 또는 "CRYPTO")
  const handleCheckout = async (paymentMethod: "STRIPE" | "CRYPTO", sdkOptions = {}) => {
    playSfx(Audios.button_click);
    setIsLoading(true);

    try {
      // SDK 초기화 (USD 결제 시 chainId 옵션 포함)
      const sdk = await DappPortalSDK.init({
        clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
        ...sdkOptions,
      });
      // 선택한 아이템에 따라 인덱스 결정 ("auto"이면 1, 그 외 2)
      const itemIndex = selectedItem === "auto" ? 1 : 2;
      // 결제 세션 api 요청
      const response = await paymentSession(
        itemIndex,
        paymentMethod,
        "0xf80fF1B467Ce45100A1E2dB89d25F1b78c0d22af"
      );

      if (response) {
        console.log("결제 진행 payment id :", response.id);
        // 지갑 연동 먼저 진행
        const walletProvider = sdk.getWalletProvider();
        await walletProvider.request({ method: "kaia_requestAccounts" });
        // 결제 진행
        const paymentProvider = sdk.getPaymentProvider();
        await paymentProvider.startPayment(response.id);
      }
    } catch (error: any) {
      console.error(`${paymentMethod} 결제 진행 중 오류 발생:`, error);
    }
  };

  // USD로 결제
  const handleUSDCheckout = async () => {
    await handleCheckout("STRIPE", { chainId: "1001" });
  };

  // KAIA로 결제
  const handleKaiaCheckout = async () => {
    await handleCheckout("CRYPTO", { chainId: "1001" });
  };

  // 아이템 정보 모달창
  const handleInfo = () => {
    playSfx(Audios.button_click);
    setShowModal(true);
  }

  // 선택한 아이템에 해당하는 가격 정보를 찾음
  // nftCollection의 id와 getItemInfo에서 받아온 itemName을 연결(예: "auto" → "AUTO", "booster" → "REWARD")
  const selectedItemInfo = useMemo(() => {
    if (!selectedItem || itemData.length === 0) return null;
    if (selectedItem === "auto") {
      return itemData.find((item) => item.itemName.toUpperCase() === "AUTO");
    } else if (selectedItem === "booster") {
      return itemData.find((item) => item.itemName.toUpperCase() === "REWARD");
    }
    return null;
  }, [selectedItem, itemData]);


  if (isLoading) {
    // 로딩 중일 때는 로딩스피너만 보여줌
    return <LoadingSpinner className="h-screen"/>;
  }

  return (
    <div className="flex flex-col items-center text-white px-6 min-h-screen">
      {/* 상단 영역 */}
      <div className="h-14 flex items-center w-full font-bold text-xl mb-4 justify-between">
        <IoChevronBackOutline className="w-6 h-6 cursor-pointer" onClick={handleBackClick} />
        <p>{t("asset_page.item_store")}</p>
        <img
          src={Images.Receipt}
          className="w-6 h-6 cursor-pointer"
          onClick={() => {
            playSfx(Audios.button_click);
            navigate("/payment-history");
          }}
        />
      </div>

      {/* 아이템 목록 (2열 그리드) */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-full mb-40">
        {nftCollection.map((nftItem) => (
          <div
            key={nftItem.id}
            // 선택된 아이템이면 테두리 강조
            className={`bg-[#1F1E27] border-2 p-[10px] rounded-xl flex flex-col items-center
            ${
                selectedItem === nftItem.id
                ? "border-blue-400"
                : "border-[#737373]"
            }
            `}
            onClick={() => handleSelectItem(nftItem.id)}
          >
            <div
              className="relative w-full aspect-[145/102] rounded-md mt-1 mx-1 overflow-hidden flex items-center justify-center"
              style={{
                background:
                nftItem.name === "Auto Item"
                  ? "linear-gradient(180deg, #0147E5 0%, #FFFFFF 100%)"
                  : "linear-gradient(180deg, #FF4F4F 0%, #FFFFFF 100%)",
              }}
              >
              <img
                src={nftItem.image}
                alt={nftItem.name}
                className="w-[80px] h-[80px] object-cover"
              />
              <img
                src={Images.infoMark}
                alt="info"
                className="absolute top-1 right-1 w-5 h-5"
                onClick={handleInfo}
              />
            </div>
            <p className="mt-2 text-sm font-semibold">{nftItem.name}</p>
          </div>
        ))}
    </div>

      {/* 체크박스 및 결제 버튼 영역 */}
      <div className="fixed bottom-0 px-6">
        <div className="flex flex-col gap-3 mb-5">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreeRefund}
              onChange={() => {
                playSfx(Audios.button_click);
                setAgreeRefund(!agreeRefund);
              }}
            />
            <span className="text-xs font-medium">
              {t("asset_page.agree_non_refundable")}
              <span className="text-xs font-semibold text-[#3B82F6] ml-1">
                {t("asset_page.learn_more")}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreeEncrypted}
              onChange={() => {
                playSfx(Audios.button_click);
                setAgreeEncrypted(!agreeEncrypted);
              }}
            />
            <span className="text-xs font-medium">
              {t("asset_page.provide_encrypted_id")}
              <span className="text-xs font-semibold text-[#3B82F6] ml-1">
                {t("asset_page.learn_more")}
              </span>
            </span>
          </label>
        </div>

        <div className="mb-3 flex justify-center items-center">
          <span className="text-sm text-[#A3A3A3]">Available Balance :</span>
          <span className="text-sm text-white ml-1">{balance} KAIA</span>
        </div>

        <div className="flex w-full gap-3 mb-5">
          <button
            disabled={!isEnabled}
            onClick={handleKaiaCheckout}
            className={
              isEnabled
                ? "w-1/2 bg-[#0147E5] px-6 py-3 rounded-full text-base font-medium"
                : "w-1/2 bg-[#555] px-6 py-3 rounded-full text-base font-medium text-white"
            }
          >
            {/* 선택한 아이템의 kaiaPrice가 있으면 해당 값을 출력 */}
            {selectedItemInfo ? `${selectedItemInfo.kaiaPrice} KAIA` : "KAIA"}
          </button>
          <button
            disabled={!isEnabled}
            onClick={handleUSDCheckout}
            className={
              isEnabled
                ? "w-1/2 border-2 border-[#0147E5] text-white px-6 py-3 rounded-full text-base font-medium"
                : "w-1/2 border-2 border-[#555] text-[#555] px-6 py-3 rounded-full text-base font-medium"
            }
          >
            {selectedItemInfo ? `USD $${selectedItemInfo.usdPrice}` : "USD"}
          </button>
        </div>
      </div>

      <AlertDialog open={showModal}>
        <AlertDialogContent className="rounded-3xl bg-[#21212F] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogDescription className="sr-only">Item details</AlertDialogDescription>
            <AlertDialogTitle className="text-center font-bold text-xl">
              <div className="flex flex-row items-center justify-between">
                <div>&nbsp;</div>
                {selectedItem === "auto" ? <p>Auto Item</p> : <p>Reward Booster</p>}
                <HiX
                  className={"w-6 h-6 cursor-pointer"}
                  onClick={() => {
                    playSfx(Audios.button_click);
                    setShowModal(false);
                  }}
                />
              </div>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div
              className="relative w-full aspect-[145/102] rounded-md mt-1 mx-1 overflow-hidden flex items-center justify-center"
              style={{
                background:
                  selectedItem === "auto"
                    ? "linear-gradient(180deg, #0147E5 0%, #FFFFFF 100%)"
                    : "linear-gradient(180deg, #FF4F4F 0%, #FFFFFF 100%)",
              }}
            >
              <img
                src={selectedItem === "auto" ? Images.AutoNFT : Images.RewardNFT}
                alt={selectedItem === "auto" ? "auto item" : "reward booster"}
                className="w-[80px] h-[80px] object-cover"
              />
            </div>
            <p className="mt-2">date....</p>
            <div className="mt-6 text-lg font-semibold">
              {selectedItem === "auto" ? <p>Dice Auto Roller</p> : <p>Reward Booster</p>}
            </div>
            <div className="mt-1 text-base font-normal">
              {selectedItem === "auto" ? (
                <p>Rolls the dice automatically</p>
              ) : (
                <p>Board & Spin Reward Upgrade : 5x</p>
              )}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemStore;
