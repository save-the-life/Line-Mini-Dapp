import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    TopTitle,
} from '@/shared/components/ui';
import { FaChevronLeft } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import deleteUser from '@/entities/User/api/delUser';
import CardGameModal from '../CardGame/CardGameModal';
import { disconnectWallet } from '@/shared/services/walletService';

const SettingsPage: React.FC =() => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { playSfx } = useSound();
    const [isCardFlipGameActive, setIsCardFlipGameActive] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // navigate에 policyType을 전달
    const handleNavigation = (policyType: string) => {
        playSfx(Audios.button_click);
        navigate('/policy-detail', { state: { policyType } });
    };

    const handleLanguage = () => {
        playSfx(Audios.button_click);
        navigate('/choose-language');
    };

    const handleSound = () => {
        playSfx(Audios.button_click);
        navigate('/sound-setting');
    };

    const handleDel = async() => {
        deleteUser();
    }

    // 지갑 연결 해제 (Unifi SDK walletProvider.disconnectWallet 사용)
    // 해제 후에는 reload 하여 다음 연결 시 사용자가 다른 wallet 타입을 선택할 수 있도록 한다.
    const handleDisconnectWallet = async () => {
        if (isDisconnecting) return;
        playSfx(Audios.button_click);
        setIsDisconnecting(true);
        try {
            await disconnectWallet({ reload: true });
        } catch (error: any) {
            // 사용자가 SDK 확인 팝업을 닫은 경우(-32001) 등에는 모달만 닫는다.
            console.error("[Settings] 지갑 연결 해제 중 오류:", error);
            setIsDisconnecting(false);
            setShowDisconnectModal(false);
        }
    };

    const handleCardFlipGameEnd = (result: 'win' | 'lose', reward?: { type: string; amount: number }) => {
        console.log('Game Result:', result, reward);
        setIsCardFlipGameActive(false);
    };

    return(
        <div className="flex flex-col items-center text-white px-6 min-h-screen">
            <TopTitle title="Settings" back={true} />

            <div className="w-full">
                {/* 서비스 이용 약관 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('service')}>
                    <div>
                        <p className="font-semibold">{t("setting.terms_of_service")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                {/* 개인정보 처리 방침 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('privacy')}>
                    <div>
                        <p className="font-semibold">{t("setting.privacy_policy")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                {/* 전자상거래 이용약관 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('commerce')}>
                    <div>
                        <p className="font-semibold">{t("setting.electronic_commerce_policy")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={handleLanguage}>
                    <div>
                        <p className="font-semibold">{t("setting.language")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                <div
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={handleSound}>
                    <div>
                        <p className="font-semibold">{t("setting.sound")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>

                {/* 지갑 연결 해제 (Unifi SDK 가이드: 사용자가 wallet/SDK 이슈 시 직접 복구할 수 있도록 필수 제공) */}
                <div
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => {
                        playSfx(Audios.button_click);
                        setShowDisconnectModal(true);
                    }}>
                    <div>
                        <p className="font-semibold">{t("setting.disconnect_wallet")}</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>

                {/* 카드 뒤집기 게임 테스트 버튼 */}
                {/* <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => setIsCardFlipGameActive(true)}>
                    <div>
                        <p className="font-semibold">카드 뒤집기 게임 테스트</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div> */}
            </div>

            
            {/* 카드 뒤집기 게임 */}
            {isCardFlipGameActive && (
                <CardGameModal
                    onClose={() => setIsCardFlipGameActive(false)}
                />
            )}

            {/* 지갑 연결 해제 확인 모달 */}
            <AlertDialog open={showDisconnectModal}>
                <AlertDialogContent className="rounded-3xl bg-[#21212F] text-white border-none">
                    <AlertDialogHeader>
                        <AlertDialogDescription className="sr-only">
                            Disconnect Wallet
                        </AlertDialogDescription>
                        <AlertDialogTitle className="text-center font-bold text-xl">
                            <div className="flex flex-row items-center justify-between">
                                <div>&nbsp;</div>
                                <p>{t("setting.disconnect_wallet")}</p>
                                <HiX
                                    className={'w-6 h-6 cursor-pointer'}
                                    onClick={() => {
                                        if (isDisconnecting) return;
                                        playSfx(Audios.button_click);
                                        setShowDisconnectModal(false);
                                    }}
                                />
                            </div>
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <p className="text-base font-semibold mt-4 whitespace-pre-line">
                            {t("setting.disconnect_wallet_desc")}
                        </p>
                        <div className="flex flex-row items-center justify-center gap-4 w-full">
                            <button
                                onClick={handleDisconnectWallet}
                                disabled={isDisconnecting}
                                className="w-full md:w-[180px] h-14 rounded-full bg-[#0147E5] text-white text-base font-medium disabled:opacity-60">
                                {isDisconnecting
                                    ? t("setting.disconnecting")
                                    : t("setting.disconnect_confirm")}
                            </button>
                            <button
                                onClick={() => {
                                    if (isDisconnecting) return;
                                    playSfx(Audios.button_click);
                                    setShowDisconnectModal(false);
                                }}
                                disabled={isDisconnecting}
                                className="w-full md:w-[180px] h-14 rounded-full border-[2px] border-[#737373] text-white font-medium disabled:opacity-60">
                                {t("setting.cancel")}
                            </button>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SettingsPage;