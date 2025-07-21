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
            className="w-40 h-48 rounded-[30px] flex items-center justify-center"
            style={{
              backgroundImage: `url(${
                selectedPet === 'DOG'
                  ? Images.SelectBox
                  : Images.NormalBox
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
              className="w-36 h-36"
            />
          </div>
          <div
            className={`flex w-11 h-7 border rounded-full items-center justify-center text-xs font-medium ${
              selectedPet === 'DOG'
                ? 'border-white text-white'
                : 'border-[#737373]'
            }`}
          >
            Dog
          </div>
        </div>
        {/* Cat */}
        <div
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={() => handlePetSelection('CAT')}
        >
          <div
            className="w-40 h-48 rounded-[30px] flex items-center justify-center"
            style={{
              backgroundImage: `url(${
                selectedPet === 'CAT'
                  ? Images.SelectBox
                  : Images.NormalBox
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
              className="w-36 h-36"
            />
          </div>
          <div
            className={`flex w-11 h-7 border rounded-full items-center justify-center text-xs font-medium ${
              selectedPet === 'CAT'
                ? 'border-white text-white'
                : 'border-[#737373]'
            }`}
          >
            Cat
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCharacter;
