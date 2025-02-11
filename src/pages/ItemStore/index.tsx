import React, { useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import Images from "@/shared/assets/images";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import paymentSession from "@/entities/Asset/api/payment";

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

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [agreeRefund, setAgreeRefund] = useState(false);
    const [agreeEncrypted, setAgreeEncrypted] = useState(false);

    const isEnabled = selectedItem !== null && agreeRefund && agreeEncrypted;

    const handleBackClick = () => {
        playSfx(Audios.button_click);
        navigate(-1);
    };

    const handleSelectItem = (itemId: string) => {
        playSfx(Audios.button_click);
        setSelectedItem(itemId);
    };

  // 공통 결제 처리 함수 (paymentMethod: "STRIPE" 또는 "CRYPTO")
    const handleCheckout = async (
        paymentMethod: "STRIPE" | "CRYPTO",
        sdkOptions = {}
    ) => {
        playSfx(Audios.button_click);
        try {
        // SDK 초기화 (USD 결제 시 chainId 옵션 포함)
        const sdk = await DappPortalSDK.init({
            clientId: import.meta.env.VITE_LINE_CLIENT_ID || "",
            ...sdkOptions,
        });
        // 선택한 아이템에 따라 인덱스 결정 ("auto"이면 1, 그 외 2)
        const itemIndex = selectedItem === "auto" ? 1 : 2;
        const response = await paymentSession(
            itemIndex,
            paymentMethod,
            "0x2bdd3eC0dBDC4aA30adbDc10a502ee7B10357A3D"
        );
        if (response) {
            console.log("결제 진행 payment id :", response.id);
            const walletProvider = sdk.getWalletProvider();
            await walletProvider.request({ method: "kaia_requestAccounts" });
            const paymentProvider = sdk.getPaymentProvider();
            await paymentProvider.startPayment(response.id);
        }
        } catch (error: any) {
            console.error(`${paymentMethod} 결제 진행 중 오류 발생:`, error);
        }
    };

    const handleUSDCheckout = async () => {
        // USD 결제는 STRIPE 방식 + chainId 옵션 적용
        await handleCheckout("STRIPE", { chainId: "1001" });
    };

    const handleKaiaCheckout = async () => {
        await handleCheckout("CRYPTO");
    };

    return (
        <div className="flex flex-col items-center text-white px-6 min-h-screen">
        {/* 상단 영역 */}
            <div className="h-14 flex items-center w-full font-bold text-xl mb-4 justify-between">
                <IoChevronBackOutline
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleBackClick}
                />
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
                        className={`bg-[#1F1E27] border-2 p-[10px] rounded-xl flex flex-col items-center ${
                        selectedItem === nftItem.id
                            ? "border-blue-400"
                            : "border-[#737373]"
                        }`}
                        onClick={() => handleSelectItem(nftItem.id)}
                    >
                        <div
                            className="w-full aspect-[145/102] rounded-md mt-1 mx-1 overflow-hidden flex items-center justify-center"
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
                    <span className="text-sm text-white ml-1">164.395 KAIA</span>
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
                        67.758 KAIA
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
                        USD $10
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemStore;
