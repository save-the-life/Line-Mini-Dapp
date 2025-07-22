// src/pages/SignUp/SelectCharacter.tsx

import React from 'react';
import Images from '@/shared/assets/images';
import { useTranslation } from "react-i18next";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";


interface SelectCharacterProps {
  selectedPet: 'DOG' | 'CAT';
  setSelectedPet: (pet: 'DOG' | 'CAT') => void;
}

const SelectCharacter: React.FC<SelectCharacterProps> = ({ selectedPet, setSelectedPet }) => {
  const { t } = useTranslation();
  const { playSfx } = useSound();
  
  React.useEffect(() => {
    // console.log('Step 5-0: SelectCharacter 컴포넌트 마운트됨.');
    return () => {
      // console.log('Step 5-0: SelectCharacter 컴포넌트 언마운트됨.');
    };
  }, []);

  const handlePetSelection = (pet: 'DOG' | 'CAT') => {
    playSfx(Audios.button_click);
    // console.log(`Step 5-0: ${pet} 선택됨.`);
    setSelectedPet(pet);
  };

  return (
    <div className="flex flex-col text-white items-center mx-6 min-h-screen">
      <h2 className="font-semibold text-xl text-center mt-32">
        Lucky Dice!
        <br />
        {t("character_page.Choose_your_character!")}
      </h2>
      <div className="flex flex-row mt-14 gap-3">
        {/* Dog */}
        <div
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={() => handlePetSelection('DOG')}
        >
          <div
            className="flex items-center justify-center relative"
            style={{
              width: 165,
              height: 194,
              background: selectedPet === 'DOG'
                ? 'rgba(255,255,255,0.65)'
                : 'rgba(255,255,255,0.5)',
              borderRadius: 20,
              boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: selectedPet === 'DOG' ? '3px solid #64FF56' : 'none',
            }}
          >
            <img
              src={
                selectedPet === 'DOG'
                  ? Images.DogSmile
                  : selectedPet === 'CAT'
                  ? Images.DogCrying
                  : Images.DogSmile
              }
              alt="dog"
              className="w-36 h-36 relative z-20"
            />
          </div>
          <div
            className="flex items-center justify-center text-xs font-medium"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: 24,
              fontWeight: 400,
              color: selectedPet === 'DOG' ? '#64FF56' : '#FFFFFF',
              WebkitTextStroke: '1px #000',
            }}
          >
            강아지
          </div>
        </div>
        {/* Cat */}
        <div
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={() => handlePetSelection('CAT')}
        >
          <div
            className="flex items-center justify-center relative"
            style={{
              width: 165,
              height: 194,
              background: selectedPet === 'CAT'
                ? 'rgba(255,255,255,0.65)'
                : 'rgba(255,255,255,0.5)',
              borderRadius: 20,
              boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: selectedPet === 'CAT' ? '3px solid #64FF56' : 'none',
            }}
          >
            <img
              src={
                selectedPet === 'CAT'
                  ? Images.CatSmile
                  : selectedPet === 'DOG'
                  ? Images.CatCrying
                  : Images.CatSmile
              }
              alt="cat"
              className="w-36 h-36 relative z-20"
            />
          </div>
          <div
            className="flex items-center justify-center text-xs font-medium"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: 24,
              fontWeight: 400,
              color: selectedPet === 'CAT' ? '#64FF56' : '#FFFFFF',
              WebkitTextStroke: '1px #000',
            }}
          >
            고양이
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCharacter;
