import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { TopTitle } from '@/shared/components/ui';
import { useNavigate } from 'react-router-dom';
import Images from '@/shared/assets/images';


const Inventory: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    
    return (
        <div className="flex flex-col items-center text-white mx-6 relative min-h-screen pb-20">
            <TopTitle title={""} back={true} />
            {/* 착용 중인 아이템 및 캐릭터 표시 영역 */}
            <div
                style={{
                    backgroundImage: `url(${Images.InventoryBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '40vh',
                    minHeight: 200,
                    borderRadius: 24,
                    marginBottom: 24,
                }}
                className="flex items-center justify-center"
            >
                {/* 여기에 캐릭터 및 아이템 표시 컴포넌트 추가 예정 */}
            </div>

            {/* 보유 중인 아이템 목록 영역 */}
            <div>
                
            </div>

        </div>
    )
}

export default Inventory;